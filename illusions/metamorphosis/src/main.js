// Metamorphosis: a strip that tiles the plane exactly at every x while its
// tiles change from squares to fish, hexagons, honeycomb, tortoises and
// cubes, and back to squares. Drawn with Canvas 2D.

import { buildStrip, tracks, LOOP, J, Xof, xiOf, STAGES } from './tiling.js';
import { tileColour, lineOn, shellLine, INK, PAPER } from './creatures.js';
import { setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const frame = document.getElementById('frame');

const SPEED = 0.5; // rows per second
const REF = 110; // line widths are given for tiles this many CSS px tall

// ------------------------------------------------------------------ the strip
const tiles = buildStrip(-3.7, 3.7);
for (const t of tiles) {
  const c = tileColour(t);
  t.colL = c.L;
  t.colC = c.C;
  t.hatch = c.hatch;
}

// ------------------------------------------------------------------ layout
// A wide print: the frame fits the window between masthead and controls.
let cssW = 900, cssH = 300, dpr = 1, rows = 5;
function layout() {
  const mat = 13;
  const pad = (window.innerWidth < 640 ? 10 : 28) + mat;
  const head = document.getElementById('masthead');
  const ctrl = document.getElementById('controls');
  const top = (head ? head.offsetHeight : 0) + 6 + mat;
  const bottom = (ctrl ? ctrl.offsetHeight : 0) + 8 + mat;
  const availW = window.innerWidth - pad * 2;
  const availH = window.innerHeight - top - bottom;
  const narrow = availW < 640;
  const aspect = Math.min(3.2, Math.max(narrow ? 1.05 : 2.2, availW / availH));
  let h = availH, w = h * aspect;
  if (w > availW) { w = availW; h = w / aspect; }
  w = Math.max(160, Math.floor(w));
  h = Math.max(120, Math.floor(h));
  frame.style.width = `${w}px`;
  frame.style.height = `${h}px`;
  frame.style.top = `${top + Math.max(0, (availH - h) / 2)}px`;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = w; cssH = h;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  rows = w / h < 1.6 ? 4 : 5;
  BW = Math.ceil(canvas.width * 1.6) + 64;
  buf.width = BW;
  buf.height = canvas.height;
  invalidate();
  makePatterns();
  dirty = true;
}

// ------------------------------------------------------------------ textures
let hatchPat = null, grainPat = null, grainCanvas = null;
function makePatterns() {
  const p = Math.max(4, Math.round(4.5 * dpr));
  const hc = document.createElement('canvas');
  hc.width = hc.height = p;
  const h = hc.getContext('2d');
  h.strokeStyle = `rgb(${INK.map((v) => Math.round(v * 255)).join(',')})`;
  h.lineWidth = 0.9 * dpr;
  h.beginPath();
  for (const o of [-p, 0, p]) { h.moveTo(o, p); h.lineTo(o + p, 0); }
  h.stroke();
  hatchPat = bctx.createPattern(hc, 'repeat');

  if (!grainCanvas) {
    const n = 256;
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = grainCanvas.height = n;
    const g = grainCanvas.getContext('2d');
    const img = g.createImageData(n, n);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    // value noise (two octaves) plus fine white noise, centred on mid grey
    const lat = (s) => {
      const a = new Float32Array((s + 1) * (s + 1));
      for (let i = 0; i < a.length; i++) a[i] = rnd();
      for (let i = 0; i <= s; i++) { a[i * (s + 1) + s] = a[i * (s + 1)]; a[s * (s + 1) + i] = a[i]; }
      return (x, y) => {
        const fx = (x / n) * s, fy = (y / n) * s;
        const ix = Math.floor(fx), iy = Math.floor(fy), ux = fx - ix, uy = fy - iy;
        const sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
        const v = (i, j) => a[j * (s + 1) + i];
        return (v(ix, iy) * (1 - sx) + v(ix + 1, iy) * sx) * (1 - sy) + (v(ix, iy + 1) * (1 - sx) + v(ix + 1, iy + 1) * sx) * sy;
      };
    };
    const n1 = lat(16), n2 = lat(64);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = 128 + (n1(x, y) - 0.5) * 34 + (n2(x, y) - 0.5) * 30 + (rnd() - 0.5) * 46;
        const i = (y * n + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }
  grainPat = bctx.createPattern(grainCanvas, 'repeat');
}

// ------------------------------------------------------------------ state
const state = {
  x: Xof(-0.6), // page x at the left edge of the frame
  v: 0, // fling velocity (rows / s)
  playing: true,
  litho: 1,
  lithoTarget: 1,
  reveal: 0,
  revealTarget: 0,
};
let dirty = true;
let drag = null;

// ------------------------------------------------------------------ colour
const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const INK_C = [0.16, 0.12, 0.09];
const RED = [0.64, 0.23, 0.16];

function resolve(c, tile, k) {
  if (c === 'line') return lineOn(mix(tile.colC, tile.colL, k));
  if (c === 'ink') return mix(INK_C, INK, k);
  if (c === 'paper') return PAPER;
  if (c === 'shell') return shellLine(tile, k);
  return mix(c.C, c.L, k);
}

// ------------------------------------------------------------------ drawing
// The strip is painted into a wide ring buffer whose columns are fixed to
// the page (device pixel k shows page x = k / s). Scrolling only paints the
// thin slab of newly exposed columns; everything else is a blit.
const buf = document.createElement('canvas');
const bctx = buf.getContext('2d');
let BW = 0; // buffer width in device px
let kLo = 0, kHi = 0; // buffer columns currently valid: [kLo, kHi)
let bufLitho = -1;
const modi = (a, n) => ((a % n) + n) % n;

function invalidate() { kLo = kHi = 0; }

function scale() { return canvas.height / rows; }
function lineUnit(s) { return Math.min(1.5, Math.max(0.55, cssH / rows / REF)) * dpr / s; }

// paint page x ∈ [xa, xb] into g, whose transform maps page x to x·s − shift
function paint(g, xa, xb, shift) {
  const H = canvas.height;
  const s = scale();
  const lw = lineUnit(s);
  const k = state.litho;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = css(mix([0.93, 0.91, 0.86], PAPER, k));
  g.fillRect(xa * s - shift - 1, 0, (xb - xa) * s + 2, H);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const yTop = rows / 2, yBot = -rows / 2;
  hatchPat.setTransform(new DOMMatrix([1 / s, 0, 0, -1 / s, 0, 0]));
  const pad = 2 / s;
  for (let c = Math.floor(xa / LOOP) - 1; c <= Math.floor(xb / LOOP) + 1; c++) {
    const off = c * LOOP;
    if (off > xb + 1 || off + LOOP < xa - 1) continue;
    g.setTransform(s, 0, 0, -s, off * s - shift, H / 2);
    for (const t of tiles) {
      const b = t.bbox;
      if (b[2] + off < xa - pad || b[0] + off > xb + pad || b[3] < yBot || b[1] > yTop) continue;
      g.globalAlpha = 1;
      g.fillStyle = css(mix(t.colC, t.colL, k));
      g.fill(t.path);
      if (t.hatch > 0.01 && k > 0.01) {
        g.globalAlpha = t.hatch * k * 0.55;
        g.fillStyle = hatchPat;
        g.fill(t.path);
      }
      if (t.ops.length) { g.save(); g.clip(t.path); }
      for (const op of t.ops) {
        if (op.a <= 0.004) continue;
        if (op.kind === 'hatch') {
          if (k < 0.01) continue;
          g.globalAlpha = op.a * k * 0.5;
          g.fillStyle = hatchPat;
          g.fill(op.path);
          continue;
        }
        g.globalAlpha = op.a;
        const col = css(resolve(op.c, t, k));
        if (op.kind === 'fill') {
          g.fillStyle = col;
          g.fill(op.path);
        } else {
          g.strokeStyle = col;
          g.lineWidth = op.w * lw;
          g.stroke(op.path);
        }
      }
      if (t.ops.length) g.restore();
      g.globalAlpha = 1;
      g.strokeStyle = css(mix([0.17, 0.13, 0.1], INK, k));
      g.lineWidth = 1.5 * lw;
      g.stroke(t.path);
    }
  }
  // paper grain and crayon texture, fixed to the page so it scrolls with it
  g.setTransform(1, 0, 0, 1, 0, 0);
  grainPat.setTransform(new DOMMatrix([1, 0, 0, 1, -modi(shift, 256), 0]));
  g.globalCompositeOperation = 'soft-light';
  g.globalAlpha = 0.5 + 0.35 * k;
  g.fillStyle = grainPat;
  g.fillRect(xa * s - shift - 1, 0, (xb - xa) * s + 2, H);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
}

// paint buffer columns [ka, kb)
function renderSlab(ka, kb) {
  const s = scale();
  let k = ka;
  while (k < kb) {
    const p = modi(k, BW);
    const len = Math.min(kb - k, BW - p);
    bctx.save();
    bctx.beginPath();
    bctx.rect(p, 0, len, buf.height);
    bctx.clip();
    paint(bctx, k / s, (k + len) / s, k - p);
    bctx.restore();
    k += len;
  }
}

function ensure(k0, k1) {
  if (bufLitho !== state.litho) { invalidate(); bufLitho = state.litho; }
  if (kHi <= kLo || k0 >= kHi || k1 <= kLo) {
    renderSlab(k0, k1);
    kLo = k0; kHi = k1;
    return;
  }
  if (k0 < kLo) {
    renderSlab(k0, kLo);
    kLo = k0;
    if (kHi - kLo > BW) kHi = kLo + BW;
  }
  if (k1 > kHi) {
    renderSlab(kHi, k1);
    kHi = k1;
    if (kHi - kLo > BW) kLo = kHi - BW;
  }
}

function draw() {
  const W = canvas.width, H = canvas.height;
  const s = scale();
  const K0 = Math.round(state.x * s);
  ensure(K0, K0 + W);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const p0 = modi(K0, BW);
  const n0 = Math.min(W, BW - p0);
  ctx.drawImage(buf, p0, 0, n0, H, 0, 0, n0, H);
  if (n0 < W) ctx.drawImage(buf, 0, 0, W - n0, H, n0, 0, W - n0, H);

  if (state.reveal > 0.01) {
    const x0 = K0 / s, x1 = (K0 + W) / s;
    const visible = [];
    for (let c = Math.floor(x0 / LOOP) - 1; c <= Math.floor(x1 / LOOP) + 1; c++) {
      const off = c * LOOP;
      for (const t of tiles) {
        const b = t.bbox;
        if (b[2] + off < x0 || b[0] + off > x1 || b[3] < -rows / 2 || b[1] > rows / 2) continue;
        visible.push([t, off]);
      }
    }
    drawConstruction(visible, s, lineUnit(s), x0, x1);
  }
}

// The construction: the straight skeleton of every tile (its six shared
// corners) and, along the bottom, the morph parameters as functions of x.
function drawConstruction(visible, s, lw, x0, x1) {
  const W = canvas.width, H = canvas.height;
  const a = state.reveal;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.42 * a;
  ctx.fillStyle = css(PAPER);
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = a;
  for (const [t, off] of visible) {
    ctx.setTransform(s, 0, 0, -s, (off - x0) * s, H / 2);
    const V = t.V;
    ctx.strokeStyle = css(RED);
    ctx.lineWidth = 1.3 * lw;
    ctx.setLineDash([5 * lw, 4 * lw]);
    ctx.beginPath();
    ctx.moveTo(V[0][0], V[0][1]);
    for (let q = 1; q < 6; q++) ctx.lineTo(V[q][0], V[q][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = css(RED);
    for (const v of [V[0], V[1]]) {
      ctx.beginPath();
      ctx.arc(v[0], v[1], 3.2 * lw, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // parameter ribbon
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const rh = Math.min(H * 0.3, 92 * dpr);
  const y0 = H - rh;
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = css(PAPER);
  ctx.fillRect(0, y0, W, rh);
  ctx.globalAlpha = a;
  ctx.strokeStyle = css(INK, 0.5);
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath(); ctx.moveTo(0, y0 + 0.5); ctx.lineTo(W, y0 + 0.5); ctx.stroke();
  const series = [
    ['fish', [0.18, 0.33, 0.47]],
    ['lat', RED],
    ['honey', [0.72, 0.5, 0.12]],
    ['tort', [0.33, 0.43, 0.2]],
    ['cube', [0.35, 0.27, 0.22]],
  ];
  const top = y0 + 24 * dpr, bot = H - 22 * dpr;
  const xs = [];
  for (let px = 0; px <= W; px += 3 * dpr) xs.push([px, tracks(xiOf(x0 + px / s))]);
  for (const [key, col] of series) {
    ctx.strokeStyle = css(col);
    ctx.lineWidth = (key === 'lat' ? 2.2 : 1.6) * dpr;
    ctx.setLineDash(key === 'lat' ? [6 * dpr, 4 * dpr] : []);
    ctx.beginPath();
    xs.forEach(([px, tr], q) => {
      const y = bot - tr[key] * (bot - top);
      if (q) ctx.lineTo(px, y); else ctx.moveTo(px, y);
    });
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.font = `italic ${12 * dpr}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = css(INK);
  for (let c = Math.floor(x0 / LOOP) - 1; c <= Math.floor(x1 / LOOP) + 1; c++) {
    for (const st of STAGES) {
      const px = (Xof(st.xi + c * J) - x0) * s;
      if (px < -80 * dpr || px > W + 80 * dpr) continue;
      ctx.fillText(st.label, px, y0 + 15 * dpr);
    }
  }
  ctx.textAlign = 'left';
  ctx.font = `${10.5 * dpr}px system-ui, sans-serif`;
  let lx = 8 * dpr;
  for (const [key, col] of series) {
    const name = { fish: 'fish', lat: 'square → hexagon lattice', honey: 'honeycomb', tort: 'tortoise', cube: 'cubes' }[key];
    ctx.fillStyle = css(col);
    ctx.fillRect(lx, H - 10 * dpr, 10 * dpr, 2.5 * dpr);
    ctx.fillStyle = css(INK, 0.8);
    lx += 14 * dpr;
    ctx.fillText(name, lx, H - 6.5 * dpr);
    lx += ctx.measureText(name).width + 14 * dpr;
    if (lx > W * 0.9) break;
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ ui
setupPanel();
const btnReveal = document.getElementById('btn-reveal');
const setReveal = (on) => {
  state.revealTarget = on ? 1 : 0;
  btnReveal.setAttribute('aria-pressed', String(on));
  dirty = true;
};
btnReveal.addEventListener('click', () => setReveal(!state.revealTarget));
const setLitho = segmented(
  [[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]],
  (v) => { state.lithoTarget = v; dirty = true; },
  1,
);
const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  r: () => setReveal(!state.revealTarget),
  ArrowRight: () => { state.v = 0; animateTo(state.x + 1.5); },
  ArrowLeft: () => { state.v = 0; animateTo(state.x - 1.5); },
});

let tween = null;
function animateTo(x) { tween = { from: state.x, to: x, t: 0 }; }

// drag scrubs the strip; a fling keeps it moving for a moment
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, t: performance.now(), v: 0 };
  state.v = 0;
  tween = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const now = performance.now();
  const dx = e.clientX - drag.x;
  const dw = -dx / (cssH / rows);
  state.x += dw;
  const dt = Math.max(1, now - drag.t) / 1000;
  drag.v = drag.v * 0.6 + (dw / dt) * 0.4;
  drag.x = e.clientX;
  drag.t = now;
  dirty = true;
});
const endDrag = () => {
  if (!drag) return;
  if (performance.now() - drag.t < 80) state.v = Math.max(-12, Math.min(12, drag.v));
  drag = null;
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  state.x += d / (cssH / rows) * 0.6;
  tween = null;
  dirty = true;
}, { passive: false });

window.addEventListener('resize', layout);
layout();

// ------------------------------------------------------------------ loop
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 0.6);
    const e = tween.t < 0.5 ? 2 * tween.t * tween.t : 1 - Math.pow(-2 * tween.t + 2, 2) / 2;
    state.x = tween.from + (tween.to - tween.from) * e;
    if (tween.t >= 1) tween = null;
    dirty = true;
  } else if (!drag) {
    if (Math.abs(state.v) > 0.01) {
      state.x += state.v * dt;
      state.v *= Math.exp(-dt * 2.5);
      dirty = true;
    } else state.v = 0;
    if (state.playing) { state.x += SPEED * dt; dirty = true; }
  }
  for (const [key, target] of [['litho', 'lithoTarget'], ['reveal', 'revealTarget']]) {
    if (state[key] !== state[target]) {
      const d = state[target] - state[key];
      state[key] += Math.sign(d) * Math.min(Math.abs(d), dt * 2.4);
      dirty = true;
    }
  }
  // keep x in one loop to avoid losing precision over long sessions
  if (state.x > LOOP * 4 || state.x < -LOOP * 4) state.x -= Math.floor(state.x / LOOP) * LOOP;
  if (dirty) { draw(); dirty = false; }
  requestAnimationFrame(loop);
}
markReady();
requestAnimationFrame(loop);

// debug handle: jump to a place on the strip (in columns), set modes
window.__page = {
  state,
  goto(xi) { state.x = Xof(xi) - (canvas.width / (canvas.height / rows)) / 2; state.v = 0; tween = null; dirty = true; },
  setLitho: (v) => { setLitho(v ? 1 : 0); state.litho = v ? 1 : 0; dirty = true; },
  setReveal: (v) => { setReveal(v); state.reveal = v ? 1 : 0; dirty = true; },
  setPlaying,
  tiles,
  bench(n = 20) {
    const t0 = performance.now();
    for (let q = 0; q < n; q++) { state.x += 0.05; draw(); ctx.getImageData(0, 0, 1, 1); }
    return (performance.now() - t0) / n;
  },
};
