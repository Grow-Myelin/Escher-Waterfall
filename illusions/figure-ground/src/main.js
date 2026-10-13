// Figure and ground: one tiling of birds and fish over a vertical gradient.
//
// Every tone is a horizontal line screen anchored to the page, like the cut
// lines of a woodcut. The ground, the birds and the fish each have a tone that
// varies only with height, so wherever a creature's tone equals the ground's,
// its lines are the ground's lines and it vanishes into it. Above the band the
// fish do that, below it the birds do.
//
// The tiling drifts slowly to the left. A fixed field lifts the creatures
// above the band (where the fish are already ground) and lowers those below
// it (where the birds are), more the further they have travelled; so birds
// climb away and fish dive away while the band itself stays an exact tiling.

import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { A, B, F, W as CW, H as CH, birdEdges, outlines } from './geom.js';
import { DESIGN, BIRD_MARKS, FISH_MARKS } from './creatures.js';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('band');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ look
const INK = [28, 26, 23];
const PAPER = [238, 232, 217];
const RED = '#a23b2a';
// tones: 0 ink … 1 paper
const TONE = { mid: 0.5, groundTop: 0.1, groundBottom: 0.94, birdMid: 0.78, birdTop: 0.97, fishMid: 0.28, fishBottom: 0.06 };
// the same in colour
const COL = {
  mid: [118, 128, 136], groundTop: [24, 33, 58], groundBottom: [214, 229, 226],
  birdMid: [214, 206, 184], birdTop: [246, 238, 216], fishMid: [72, 96, 104], fishBottom: [22, 48, 58],
};
const BAND = 2.5; // rows over which a creature turns from tile into figure or ground
const FREE = [1.5, 1.6]; // creatures start to leave the tiling this far out, over this distance
const DRIFT = 0.16; // world units per second, to the left
const PERIOD = A[0] + B[0]; // the tiling repeats every 2·W horizontally

// ------------------------------------------------------------------ state
const state = {
  time: 0,
  playing: true,
  litho: 1,
  lithoTarget: 1,
  band: 0.5, // centre of the band, as a fraction of the frame height from the top
  reveal: false,
  revealK: 0,
  strips: true, // strips need rebuilding
  dirty: true,
};

// ------------------------------------------------------------------ shapes
const edges = birdEdges(DESIGN.P, DESIGN.Q, DESIGN.handles);
const { bird, fish } = outlines(edges);
const fishLocal = fish.map(([x, y]) => [x - F[0], y - F[1]]);
function pathOf(poly) {
  const p = new Path2D();
  poly.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])));
  p.closePath();
  return p;
}
const birdPath = pathOf(bird);
const fishPath = pathOf(fishLocal);

// marks: grouped by the detail level at which they appear
function marksPaths(list) {
  return list.map((m) => {
    const p = new Path2D();
    for (const s of m.strokes || []) {
      p.moveTo(s[0][0], s[0][1]);
      if (s.length === 2) p.lineTo(s[1][0], s[1][1]);
      else for (let i = 1; i < s.length - 1; i++) {
        const last = i === s.length - 2;
        const e = last ? s[i + 1] : [(s[i][0] + s[i + 1][0]) / 2, (s[i][1] + s[i + 1][1]) / 2];
        p.quadraticCurveTo(s[i][0], s[i][1], e[0], e[1]);
      }
    }
    for (const c of m.circles || []) { p.moveTo(c[0] + c[2], c[1]); p.arc(c[0], c[1], c[2], 0, Math.PI * 2); }
    const fill = new Path2D();
    for (const c of m.dots || []) { fill.moveTo(c[0] + c[2], c[1]); fill.arc(c[0], c[1], c[2], 0, Math.PI * 2); }
    return { level: m.level, width: m.width || 1, stroke: p, fill, light: !!m.light, dark: !!m.dark };
  });
}
const birdMarks = marksPaths(BIRD_MARKS);
const fishMarks = marksPaths(FISH_MARKS);

// ------------------------------------------------------------------ view
let Wpx = 0, Hpx = 0, DPR = 1, S = 80, OX = 0, OY = 0;
let base = new DOMMatrix();
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const mix = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const bandY = () => (OY - state.band * Hpx) / S; // world y of the band centre
const ups = (d) => smooth((d - 0.25) / BAND);
const downs = (d) => smooth((-d - 0.25) / BAND);

// tone and colour of each layer at a height (d: rows above the band centre)
function layer(kind, d) {
  const up = ups(d), dn = downs(d);
  const g = TONE.mid + (TONE.groundBottom - TONE.mid) * dn - (TONE.mid - TONE.groundTop) * up;
  const gc = mix3(mix3(COL.mid, COL.groundBottom, dn), COL.groundTop, up);
  if (kind === 0) return [g, gc];
  if (kind === 1) { // bird: light; ground below the band
    if (d >= 0) return [mix(TONE.birdMid, TONE.birdTop, up), mix3(COL.birdMid, COL.birdTop, up)];
    return [mix(TONE.birdMid, g, dn), mix3(COL.birdMid, gc, dn)];
  }
  if (d <= 0) return [mix(TONE.fishMid, TONE.fishBottom, dn), mix3(COL.fishMid, COL.fishBottom, dn)];
  return [mix(TONE.fishMid, g, up), mix3(COL.fishMid, gc, up)];
}

// One device-pixel column per layer: the line screen (print) or the plain
// colour, cross-faded by the rendering style. Used as a repeating pattern.
let strips = [null, null, null], grain = null;
function buildStrips() {
  const h = canvas.height;
  const period = Math.max(3, 4.4 * DPR);
  const yb = bandY();
  for (let kind = 0; kind < 3; kind++) {
    const c = document.createElement('canvas');
    c.width = 1; c.height = h;
    const g = c.getContext('2d');
    const img = g.createImageData(1, h);
    for (let y = 0; y < h; y++) {
      const wy = (OY - (y + 0.5) / DPR) / S;
      const [tone, col] = layer(kind, wy - yb);
      // ink coverage of this pixel row by the nearest line of thickness (1 - tone)·period
      const th = Math.max(0, Math.min(1, 1 - tone)) * period;
      const k = Math.floor(y / period);
      let cov = 0;
      for (let kk = k - 1; kk <= k + 1; kk++) {
        const c0 = (kk + 0.5) * period - th / 2, c1 = c0 + th;
        cov += Math.max(0, Math.min(y + 1, c1) - Math.max(y, c0));
      }
      cov = Math.min(1, cov);
      const print = mix3(PAPER, INK, cov);
      const out = mix3(col, print, state.litho);
      img.data[y * 4] = out[0]; img.data[y * 4 + 1] = out[1]; img.data[y * 4 + 2] = out[2]; img.data[y * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    strips[kind] = ctx.createPattern(c, 'repeat');
  }
  state.strips = false;
}
function buildGrain() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) {
    const v = 255 - rnd() * rnd() * 60;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grain = ctx.createPattern(c, 'repeat');
}

// ------------------------------------------------------------------ placing the creatures
// Lattice cell (i, j): x = W·i (+ drift), y = H·j; a bird when i + j is even.
function placements() {
  const out = [];
  const drift = -((state.time * DRIFT) % PERIOD);
  const yb = bandY();
  const x0 = -OX / S - 1.6, x1 = (Wpx - OX) / S + 1.6;
  const y0 = -(Hpx - OY) / S - 1.2, y1 = OY / S + 1.2;
  const xr = (Wpx - OX) / S + 0.6; // creatures start their flight at the right edge
  const keep = 1 - state.revealK;
  const fly = state.time;
  for (let j = Math.floor(y0 / CH); j <= Math.ceil(y1 / CH); j++) {
    for (let i = Math.floor((x0 - drift) / CW) - 1; i <= Math.ceil((x1 - drift) / CW) + 1; i++) {
      const isFish = ((i + j) & 1) !== 0;
      const x = CW * i + drift, y = CH * j;
      const d = y - yb;
      const fu = smooth((d - FREE[0]) / FREE[1]), fd = smooth((-d - FREE[0]) / FREE[1]);
      const travel = Math.max(0, xr - x);
      let dy = 0, slope = 0;
      if (fu > 0) {
        const h = 1 + 0.25 * (d - FREE[0]);
        dy = fu * (0.32 * (d - FREE[0]) + 0.055 * travel * travel * h);
        slope = fu * 0.11 * travel * h;
      } else if (fd > 0) {
        const h = 1 + 0.25 * (-d - FREE[0]);
        dy = -fd * (0.32 * (-d - FREE[0]) + 0.055 * travel * travel * h);
        slope = -fd * 0.11 * travel * h;
      }
      dy *= keep; slope *= keep;
      const py = y + dy;
      if (py < y0 - 0.5 || py > y1 + 0.5) continue;
      // a per-creature phase, so wings and tails do not beat in step
      const ph = ((i * 7919 + j * 104729) % 1000) / 1000 * Math.PI * 2;
      let angle = -Math.atan(slope) * 0.85;
      angle = Math.max(-0.95, Math.min(0.95, angle));
      let sy = 1;
      if (!isFish && fu > 0) sy = 1 - 0.3 * fu * keep * (0.5 - 0.5 * Math.cos(fly * 6.2 + ph));
      if (isFish && fd > 0) angle += 0.07 * fd * keep * Math.sin(fly * 3.4 + ph);
      const dd = py - yb; // where it is now, for its tone and detail
      out.push({ isFish, x, y: py, angle, sy, d: dd, ground: isFish ? dd > 0 : dd < 0, i, j });
    }
  }
  // grounds first, figures on top
  out.sort((a, b) => (a.ground === b.ground ? 0 : a.ground ? -1 : 1));
  return out;
}

// ------------------------------------------------------------------ drawing
function draw() {
  if (state.strips) buildStrips();
  const L = state.litho;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // the ground
  strips[0].setTransform(new DOMMatrix());
  ctx.fillStyle = strips[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const list = placements();
  const yb = bandY();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const c of list) {
    const m = base.translate(c.x, c.y).rotate((c.angle * 180) / Math.PI).scale(1, c.sy);
    ctx.setTransform(m);
    const pat = strips[c.isFish ? 2 : 1];
    pat.setTransform(m.inverse());
    ctx.fillStyle = pat;
    const path = c.isFish ? fishPath : birdPath;
    ctx.fill(path);
    // birds carry the ink line between bird and fish; it fades as they become ground
    const lw = 1 / (S * Math.max(0.6, Math.min(1, c.sy)));
    if (!c.isFish) {
      const a = 1 - smooth((-c.d + 0.1) / 1.0);
      if (a > 0.01) {
        ctx.globalAlpha = a * (0.55 + 0.45 * L);
        ctx.strokeStyle = L > 0.5 ? 'rgb(28,26,23)' : 'rgb(40,36,30)';
        ctx.lineWidth = 1.1 * lw;
        ctx.stroke(path);
        ctx.globalAlpha = 1;
      }
    }
    // detail grows with distance from the band
    const amount = c.isFish ? smooth((-c.d - 0.7) / 2.3) : smooth((c.d - 0.7) / 2.3);
    const marks = c.isFish ? fishMarks : birdMarks;
    if (amount > 0.01) {
      for (const mk of marks) {
        const a = smooth((amount - mk.level) / 0.18);
        if (a <= 0.01) continue;
        const pale = c.isFish ? (L > 0.5 ? 'rgb(240,234,220)' : 'rgb(196,214,214)') : 'rgb(28,26,23)';
        ctx.globalAlpha = a;
        ctx.strokeStyle = pale;
        ctx.fillStyle = mk.light ? 'rgb(244,239,226)' : mk.dark ? 'rgb(28,26,23)' : pale;
        ctx.lineWidth = mk.width * lw;
        ctx.stroke(mk.stroke);
        ctx.fill(mk.fill);
      }
      ctx.globalAlpha = 1;
    }
  }
  // show the tiling: every edge, in red
  if (state.revealK > 0.01) {
    ctx.globalAlpha = state.revealK;
    ctx.strokeStyle = RED;
    for (const c of list) {
      const m = base.translate(c.x, c.y).rotate((c.angle * 180) / Math.PI).scale(1, c.sy);
      ctx.setTransform(m);
      ctx.lineWidth = 1.6 / S;
      ctx.stroke(c.isFish ? fishPath : birdPath);
    }
    ctx.globalAlpha = 1;
  }
  // paper grain
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.35 + 0.35 * L;
  ctx.fillStyle = grain;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if (state.debugGrid) drawGrid(yb);
}

function drawGrid(yb) {
  ctx.setTransform(base);
  ctx.lineWidth = 1 / S;
  for (let g = -8; g <= 8; g += 0.25) {
    ctx.strokeStyle = Math.abs(g % 1) < 1e-6 ? 'rgba(220,0,0,0.7)' : 'rgba(0,120,255,0.35)';
    ctx.beginPath(); ctx.moveTo(g, -8); ctx.lineTo(g, 8); ctx.moveTo(-8, g); ctx.lineTo(8, g); ctx.stroke();
  }
  ctx.strokeStyle = 'lime';
  ctx.beginPath(); ctx.moveTo(-8, yb); ctx.lineTo(8, yb); ctx.stroke();
}

// ------------------------------------------------------------------ controls
setupPanel();
const setLitho = segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
  state.dirty = true;
}, 1);
const setPlaying = playButton((on) => { state.playing = on; });
const revealBtn = document.getElementById('btn-reveal');
function setReveal(on) {
  state.reveal = on;
  revealBtn.setAttribute('aria-pressed', String(on));
  revealBtn.querySelector('span').textContent = on ? 'Hide the tiling' : 'Show the tiling';
  setBadge(on, 'One tiling: every bird and every fish is a tile, top to bottom');
  state.dirty = true;
}
revealBtn.addEventListener('click', () => setReveal(!state.reveal));
slider.addEventListener('input', () => {
  state.band = 1 - slider.value / 100;
  state.strips = true;
});
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  t: () => setReveal(!state.reveal),
});
// the arrow keys move the band
window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea, select')) return;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    slider.value = Math.max(0, Math.min(100, +slider.value + (e.key === 'ArrowUp' ? 4 : -4)));
    slider.dispatchEvent(new Event('input'));
  }
});

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.time += dt;
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    state.strips = true;
  }
  const rg = state.reveal ? 1 : 0;
  if (state.revealK !== rg) {
    state.revealK += Math.sign(rg - state.revealK) * Math.min(Math.abs(rg - state.revealK), dt * 1.5);
    state.dirty = true;
  }
  if (state.playing || state.dirty || state.strips) {
    state.dirty = false;
    draw();
  }
  requestAnimationFrame(frame);
}

fitFrame(30 / 38, (w, h) => {
  Wpx = w; Hpx = h;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * DPR);
  canvas.height = Math.round(h * DPR);
  const across = state.across || (w < 520 ? 5.2 : 6.6); // cells across the frame
  S = w / (CW * across);
  OX = w / 2; OY = h / 2;
  base = new DOMMatrix([DPR * S, 0, 0, -DPR * S, DPR * OX, DPR * OY]);
  state.strips = true;
  state.dirty = true;
});
buildGrain();
setReveal(false);
// without motion, show a moment when the flock has already lifted off
if (reduced) state.time = 9;
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, setLitho, setPlaying, setReveal,
  setTime(t) { setPlaying(false); state.time = t; state.dirty = true; },
  setBand(v) { slider.value = String(v); slider.dispatchEvent(new Event('input')); },
  zoom(a) { state.across = a; window.dispatchEvent(new Event('resize')); },
};
