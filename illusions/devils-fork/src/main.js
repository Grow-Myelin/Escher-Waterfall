// The devil's fork (blivet), engraved on a plate and drawn stroke by stroke.
//
// Six long horizontal lines, L1 … L6, evenly spaced D apart, carry the whole
// figure. At the left they pair up, (L1,L2) (L3,L4) (L5,L6), as the outlines
// of three round prongs that end in ellipses. At the right the same six lines
// are the edges of a U-shaped bar of square section seen from above:
//
//   band      left reading        right reading
//   L1–L2     prong               top of the back bar
//   L2–L3     gap                 front of the back bar
//   L3–L4     prong               the slot between the bars
//   L4–L5     gap                 top of the front bar
//   L5–L6     prong               front of the front bar
//
// So L2 and L5 are where a prong's outline turns into a fold between two
// faces, and L3 and L4 become the edges of the slot. Each half on its own is a
// consistent object; the eye cannot make the middle agree with both.

import { fitFrame, setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';
import { Readings } from './readings.js';

// ------------------------------------------------------------------ plate
const PW = 1000, PH = (1000 * 38) / 30;
const D = 60; // spacing of the long lines
const FY = 175; // top line
const X0 = 150; // centres of the prong ends
const XS = 735; // end of the slot
const XE = 870; // right end of the bar
const EA = 0.3 * D; // half-width of the end ellipses
const L_OUT = [360, 470]; // left hatching tapers out over this range
const R_IN = [500, 610]; // right hatching tapers in over this range
const XM = 485; // where the cover card stops
const Y = (i) => FY + i * D; // line Li is Y(i - 1)
// In the right-hand reading, depth recedes up and to the left (we see the
// prongs' left ends, so the viewer is to the left): a point at depth z (in
// screen units up from the front edge) is drawn K·z further left.
const K = 0.5;
const KD = K * D;
// where each long line ends at the right: L1 at the back corner of the cross
// bar, L2 and L3 at the front corner of the back bar, L4 at the slot's end,
// L5 and L6 at the front corner of the cross bar
const ENDS = [XE - 4 * KD, XS - 3 * KD, XS - 3 * KD, XS - KD, XE, XE];
const edgeX = (y) => XE - K * (Y(4) - y); // right edge of the top surface
const slotTopX = (y) => XS - 3 * KD + K * (y - Y(1)); // top edge of the cross bar's inner face
const slotFloorX = (y) => XS - 3 * KD + K * (y - Y(2)); // its foot, on the floor of the slot

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('readings');
let readings = null;
try { readings = new Readings(overlay); } catch (e) { overlay.style.display = 'none'; }
let scale = 1, dpr = 1;
let paperTex = null, washTex = null;

fitFrame(30 / 38, (w, h) => {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  scale = (w * dpr) / PW;
  // Fig. 2 sits in the lower part of the plate
  const box = { x: 0.07 * w, y: (690 / PH) * h, w: 0.86 * w, h: (400 / PH) * h };
  Object.assign(overlay.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
  readings?.resize(Math.round(box.w), Math.round(box.h));
  paperTex = null;
  washTex = null;
});

// ------------------------------------------------------------------ strokes
// An engraved line: a ribbon whose width is w(s) at arc length s.
function ribbon(pts, width, upto = 1) {
  const n = pts.length;
  const acc = [0];
  for (let i = 1; i < n; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = acc[n - 1];
  const stop = L * upto;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    let p = pts[i], s = acc[i];
    if (s > stop) {
      const k = (stop - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
      p = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
      s = stop;
    }
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl; ty /= tl;
    const w = width(s, L, p) / 2;
    left.push([p[0] - ty * w, p[1] + tx * w]);
    right.push([p[0] + ty * w, p[1] - tx * w]);
    if (s >= stop) break;
  }
  if (left.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(left[0][0] * scale, left[0][1] * scale);
  for (const p of left) ctx.lineTo(p[0] * scale, p[1] * scale);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0] * scale, right[i][1] * scale);
  ctx.closePath();
  ctx.fill();
}

function line(x0, y0, x1, y1, segs = 24) {
  const pts = [];
  for (let i = 0; i <= segs; i++) pts.push([x0 + ((x1 - x0) * i) / segs, y0 + ((y1 - y0) * i) / segs]);
  return pts;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash = (i) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };

// The strokes, in the order the engraver cuts them: [points, width(s, L, p), duration]
const strokes = [];
function add(pts, width, dur) { strokes.push({ pts, width, dur }); }

const CONTOUR = 2.7;
const taperEnds = (s, L, k = 6) => Math.min(1, s / k + 0.35, (L - s) / k + 0.35);
// the six long lines
for (let i = 0; i < 6; i++) {
  const seed = i * 7;
  add(line(X0, Y(i), ENDS[i], Y(i), 60), (s, L) => CONTOUR * (0.97 + 0.05 * Math.sin(s * 0.013 + seed)) * taperEnds(s, L), 0.75);
}
// the three prong ends: ellipses, cut a little heavier on the shadowed lower left
for (let j = 0; j < 3; j++) {
  const cy = Y(2 * j) + D / 2;
  const pts = [];
  for (let k = 0; k <= 64; k++) {
    const t = -Math.PI / 2 - (k / 64) * Math.PI * 2;
    pts.push([X0 + EA * Math.cos(t), cy + (D / 2) * Math.sin(t)]);
  }
  add(pts, (s, L) => {
    const t = s / L; // 0 at the top, going round anticlockwise (left side first)
    return CONTOUR * (0.85 + 0.45 * Math.max(0, Math.sin(t * Math.PI * 2 - 0.4)));
  }, 0.55);
}
// the end of the bar: front edge of the cross bar, then its top edge running back
add(line(XE, Y(5), XE, Y(4), 10), (s, L) => CONTOUR * taperEnds(s, L, 3), 0.2);
add(line(XE, Y(4), XE - 4 * KD, Y(0), 30), (s, L) => CONTOUR * taperEnds(s, L, 3), 0.4);
// the end of the slot: the corner of the back bar, and the cross bar's inner face
add(line(XS - 3 * KD, Y(1), XS - 3 * KD, Y(2), 10), (s, L) => CONTOUR * taperEnds(s, L, 3), 0.2);
add(line(XS - 3 * KD, Y(1), XS - KD, Y(3), 20), (s, L) => CONTOUR * taperEnds(s, L, 3), 0.3);
add(line(XS - 3 * KD, Y(2), XS - 2 * KD, Y(3), 12), (s, L) => CONTOUR * 0.8 * taperEnds(s, L, 3), 0.2);

const HATCH0 = strokes.length;
// hatching that rounds the prongs: lines follow the length of each cylinder,
// closer together towards the shaded underside
const fadeL = (x) => 1 - smooth(L_OUT[0], L_OUT[1], x);
const fadeR = (x) => smooth(R_IN[0], R_IN[1], x);
for (let j = 0; j < 3; j++) {
  const cy = Y(2 * j) + D / 2, r = D / 2;
  for (let th = -0.35; th < 1.5; th += 0.15) {
    const y = cy + r * Math.sin(th);
    const xs = X0 + EA * Math.cos(th) + 4;
    const dark = (Math.sin(th) + 0.45) / 1.45;
    const wbase = 0.45 + 1.15 * dark;
    const xe = L_OUT[1] - 8 * hash(j * 31 + th * 10);
    add(line(xs, y, xe, y, 30), (s, L, p) => wbase * fadeL(p[0]) * taperEnds(s, L, 10), 0.22);
  }
}
// the bracket: shaded front faces, a dark slot, lightly cut top faces
function band(i, n, xend, w, inset = 0.5) {
  for (let k = 0; k < n; k++) {
    const y = Y(i) + D * ((k + inset) / n);
    const xs = R_IN[0] - 6 + 10 * hash(i * 13 + k);
    add(line(xs, y, xend(y) - 3, y, 30), (s, L, p) => w * fadeR(p[0]) * taperEnds(s, L, 8), 0.22);
  }
}
band(1, 8, () => XS - 3 * KD, 1.25); // front of the back bar
band(4, 8, () => XE, 1.25); // front of the front bar and the cross bar
band(2, 11, slotFloorX, 1.6); // the floor of the slot, in shadow
band(0, 2, edgeX, 0.5, 0.7); // top of the back bar, running on over the cross bar
band(3, 2, edgeX, 0.5, 0.7); // top of the front bar
for (const i of [1, 2]) {
  for (let k = 0; k < 2; k++) {
    const y = Y(i) + D * ((k + 0.7) / 2);
    add(line(slotTopX(y) + 5, y, edgeX(y) - 3, y, 12), (s, L) => 0.5 * taperEnds(s, L, 8), 0.2); // top of the cross bar
  }
}
// the inner face of the cross bar, at the end of the slot: upright strokes
for (let x = XS - 3 * KD + 4; x < XS - KD - 2; x += 4.5) {
  const yt = Y(1) + (x - (XS - 3 * KD)) / K;
  const yb = x < XS - 2 * KD ? Y(2) + (x - (XS - 3 * KD)) / K : Y(3);
  if (yb - yt > 3) add(line(x, yt + 1.5, x, yb - 1.5, 6), (s, L) => 0.9 * taperEnds(s, L, 4), 0.1);
}
// a few short cross strokes deepen the slot
for (let k = 0; k < 24; k++) {
  const x = R_IN[0] + 40 + k * ((XS - 3 * KD - R_IN[0] - 60) / 24);
  add(line(x, Y(2) + 2, x + D * 0.55, Y(3) - 2, 8), (s, L, p) => 0.8 * fadeR(p[0]) * taperEnds(s, L, 5), 0.12);
}

// timing: contours one after another, hatching in quick succession
let tcur = 0.3;
strokes.forEach((s, i) => {
  s.t0 = tcur;
  tcur += i < HATCH0 ? s.dur * 0.62 : 0.035;
});
const DRAW_END = strokes[strokes.length - 1].t0 + strokes[strokes.length - 1].dur;

// ------------------------------------------------------------------ washes (colour)
function washes(alpha) {
  if (alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const S = scale;
  const gradL = (x0, x1) => {
    const g = ctx.createLinearGradient(x0 * S, 0, x1 * S, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    return g;
  };
  // the prongs: cool grey-blue, darker underneath
  for (let j = 0; j < 3; j++) {
    const y0 = Y(2 * j), y1 = y0 + D;
    const g = ctx.createLinearGradient(0, y0 * S, 0, y1 * S);
    g.addColorStop(0, 'rgba(150,172,190,0.55)');
    g.addColorStop(0.35, 'rgba(126,152,174,0.6)');
    g.addColorStop(1, 'rgba(70,96,122,0.75)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(X0 * S, (y0 + D / 2) * S, EA * S, (D / 2) * S, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.lineTo(L_OUT[1] * S, y0 * S);
    ctx.lineTo(L_OUT[1] * S, y1 * S);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(196,212,224,0.75)';
    ctx.beginPath();
    ctx.ellipse(X0 * S, (y0 + D / 2) * S, EA * S, (D / 2) * S, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // fade the prong washes out towards the middle
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradL(L_OUT[0], L_OUT[1]);
  ctx.fillRect(L_OUT[0] * S, (Y(0) - 4) * S, (L_OUT[1] - L_OUT[0] + 4) * S, (5 * D + 8) * S);
  ctx.globalCompositeOperation = 'source-over';
  // the bracket: warm ochre, fading in from the middle
  if (!washTex) {
    washTex = document.createElement('canvas');
    washTex.width = canvas.width; washTex.height = canvas.height;
    const o = washTex.getContext('2d');
    const poly = (pts, c) => {
      o.fillStyle = c;
      o.beginPath();
      pts.forEach(([x, y], i) => (i ? o.lineTo(x * S, y * S) : o.moveTo(x * S, y * S)));
      o.closePath();
      o.fill();
    };
    const top = 'rgba(224,196,140,0.55)', front = 'rgba(176,128,72,0.62)';
    const x0 = R_IN[0];
    // the whole top surface: both bars and the cross bar
    poly([[x0, Y(0)], [ENDS[0], Y(0)], [XE, Y(4)], [x0, Y(4)]], top);
    poly([[x0, Y(1)], [XS - 3 * KD, Y(1)], [XS - 3 * KD, Y(2)], [x0, Y(2)]], front);
    poly([[x0, Y(2)], [XS - 3 * KD, Y(2)], [XS - 2 * KD, Y(3)], [x0, Y(3)]], 'rgba(84,60,40,0.72)');
    poly([[XS - 3 * KD, Y(1)], [XS - KD, Y(3)], [XS - 2 * KD, Y(3)], [XS - 3 * KD, Y(2)]], 'rgba(150,108,62,0.65)');
    poly([[x0, Y(4)], [XE, Y(4)], [XE, Y(5)], [x0, Y(5)]], front);
    o.globalCompositeOperation = 'destination-in';
    const g = o.createLinearGradient(R_IN[0] * S, 0, R_IN[1] * S, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    o.fillStyle = g;
    o.fillRect(0, 0, washTex.width, washTex.height);
  }
  ctx.drawImage(washTex, 0, 0);
  ctx.restore();
}

// ------------------------------------------------------------------ paper
function paper(litho) {
  if (!paperTex) {
    paperTex = document.createElement('canvas');
    paperTex.width = canvas.width; paperTex.height = canvas.height;
    const p = paperTex.getContext('2d');
    const img = p.createImageData(paperTex.width, paperTex.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (hash(i * 0.25) - 0.5) * 10;
      img.data[i] = 150 + n; img.data[i + 1] = 145 + n; img.data[i + 2] = 135 + n; img.data[i + 3] = 14;
    }
    p.putImageData(img, 0, 0);
  }
  ctx.fillStyle = litho > 0.5 ? '#ece5d5' : '#efe9dc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(paperTex, 0, 0);
  // the plate mark, pressed into the paper
  const S = scale, m = 30;
  ctx.strokeStyle = 'rgba(120,108,88,0.45)';
  ctx.lineWidth = 1.2 * S;
  ctx.strokeRect(m * S, m * S, (PW - 2 * m) * S, (PH - 2 * m) * S);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect((m + 1.5) * S, (m + 1.5) * S, (PW - 2 * m) * S, (PH - 2 * m) * S);
}

function text(str, x, y, size, opts = {}) {
  ctx.save();
  ctx.font = `${opts.italic ? 'italic ' : ''}${size * scale}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = opts.color || ink;
  if (opts.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${opts.spacing * scale}px`;
  ctx.fillText(str, x * scale, y * scale);
  ctx.restore();
}

// ------------------------------------------------------------------ labels
function labels(a) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = a;
  const red = '#a23b2a';
  // a column each side: line numbers level with the lines, the role of each
  // band between them
  const cols = [[88, ['prong', 'gap', 'prong', 'gap', 'prong']], [918, ['top', 'front', 'slot', 'top', 'front']]];
  for (const [cx, names] of cols) {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = red;
      ctx.beginPath();
      ctx.arc(cx * scale, Y(i) * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      text(String(i + 1), cx, Y(i) + 0.5, 13, { color: '#f4efe4' });
    }
    names.forEach((nm, b) => text(nm, cx, Y(b) + D / 2, 14, { italic: true, color: red }));
  }
  // faint leaders from each line's end to its number
  ctx.strokeStyle = 'rgba(162,59,42,0.45)';
  ctx.lineWidth = 0.9 * scale;
  ctx.setLineDash([3 * scale, 4 * scale]);
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo((X0 - EA - 6) * scale, Y(i) * scale);
    ctx.lineTo((88 + 14) * scale, Y(i) * scale);
    ctx.moveTo((ENDS[i] + 6) * scale, Y(i) * scale);
    ctx.lineTo((918 - 14) * scale, Y(i) * scale);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ cover card
function card(v) {
  if (Math.abs(v) < 0.002) return;
  const S = scale;
  const top = FY - 70, bot = Y(5) + 64;
  let x0, x1;
  if (v < 0) { x0 = PW + 40 + (XM - PW - 40) * -v; x1 = PW + 60; } else { x0 = -60; x1 = -40 + (XM + 40) * v; }
  ctx.save();
  ctx.shadowColor = 'rgba(40,30,20,0.35)';
  ctx.shadowBlur = 18 * S;
  ctx.shadowOffsetX = (v < 0 ? -4 : 4) * S;
  ctx.fillStyle = '#f3eee3';
  ctx.fillRect(x0 * S, top * S, (x1 - x0) * S, (bot - top) * S);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(90,80,64,0.5)';
  ctx.lineWidth = 1 * S;
  ctx.strokeRect(x0 * S, top * S, (x1 - x0) * S, (bot - top) * S);
  ctx.restore();
  const k = smooth(0.82, 0.98, Math.abs(v));
  if (k > 0) {
    ctx.save();
    ctx.globalAlpha = k;
    const cx = v < 0 ? (XM + PW - 30) / 2 + 10 : (XM + 30) / 2 - 10;
    const lines = v < 0 ? ['Alone, the left half', 'is three round prongs.'] : ['Alone, the right half', 'is a U-shaped bar', 'of square section.'];
    lines.forEach((s, i) => text(s, cx, (FY + Y(5)) / 2 + (i - (lines.length - 1) / 2) * 26, 19, { italic: true, color: '#5b5145' }));
    ctx.restore();
  }
}

// ------------------------------------------------------------------ state + ui
let ink = '#1d1b18';
const state = { t: 0, draw: 0, playing: true, litho: 1, lithoTarget: 1, cover: 0, labels: 0, labelsOn: false };
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) state.draw = DRAW_END;
const setPlaying = playButton((on) => { state.playing = on; });
const slider = document.getElementById('cover');
const setCover = (v) => { state.cover = Math.max(-1, Math.min(1, v)); slider.value = String(Math.round(state.cover * 100)); };
slider.addEventListener('input', () => { state.cover = +slider.value / 100; });
const btnLabels = document.getElementById('btn-labels');
const setLabels = (on) => { state.labelsOn = on; btnLabels.setAttribute('aria-pressed', String(on)); };
btnLabels.addEventListener('click', () => setLabels(!state.labelsOn));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  n: () => setLabels(!state.labelsOn),
  d: () => { state.draw = 0; setPlaying(true); },
  ArrowLeft: () => setCover(state.cover - 0.25),
  ArrowRight: () => setCover(state.cover + 0.25),
  0: () => setCover(0),
});
// dragging across the drawing slides the card
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, v: state.cover }; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  setCover(drag.v + (e.clientX - drag.x) / (canvas.clientWidth * 0.5));
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });
canvas.addEventListener('dblclick', () => setCover(0));

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) { state.t += dt; state.draw = Math.min(DRAW_END, state.draw + dt); }
  state.litho += Math.sign(state.lithoTarget - state.litho) * Math.min(Math.abs(state.lithoTarget - state.litho), dt * 2.5);
  state.labels += Math.sign((state.labelsOn ? 1 : 0) - state.labels) * Math.min(Math.abs((state.labelsOn ? 1 : 0) - state.labels), dt * 4);
  ink = state.litho > 0.5 ? '#1d1b18' : '#3b2b1e';

  paper(state.litho);
  const done = smooth(strokes[HATCH0].t0, DRAW_END, state.draw);
  washes((1 - state.litho) * done);
  ctx.fillStyle = state.litho > 0.5 ? '#1d1b18' : '#35271b';
  for (const s of strokes) {
    const k = (state.draw - s.t0) / s.dur;
    if (k <= 0) continue;
    ribbon(s.pts, s.width, Math.min(1, k));
  }
  labels(state.labels * smooth(0, HATCH0 ? strokes[HATCH0].t0 : 1, state.draw));
  // captions
  const cap = smooth(DRAW_END - 0.6, DRAW_END, state.draw);
  if (cap > 0) {
    ctx.save();
    ctx.globalAlpha = cap;
    text('THE DEVIL’S FORK', PW / 2, 88, 15, { spacing: 6 });
    text('FIG. 1', PW / 2, 585, 13, { spacing: 4 });
    text('Six lines. Three round prongs at one end, two square bars at the other.', PW / 2, 612, 17, { italic: true });
    text('a.  three round prongs', PW * 0.285, 1105, 16, { italic: true });
    text('b.  a U-shaped bar', PW * 0.715, 1105, 16, { italic: true });
    text('FIG. 2', PW / 2, 1160, 13, { spacing: 4 });
    text('The two solids the drawing could be. Neither matches all of it.', PW / 2, 1187, 17, { italic: true });
    ctx.restore();
  }
  card(state.cover);
  // Fig. 2 follows the card: the half you can see lights up its solid
  const emA = state.cover < 0 ? 1 : 1 - smooth(0.2, 0.9, state.cover);
  const emB = state.cover > 0 ? 1 : 1 - smooth(0.2, 0.9, -state.cover);
  overlay.style.opacity = String(cap);
  readings?.render(state.t, [emA, emB], state.litho);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);

window.__page = { state, setCover, setLabels, setPlaying, DRAW_END };
