// Regular division of the plane: a hexagon bent, edge pair by edge pair, into
// a lizard that still tiles the plane under the group p3.
//
// Drawn with Canvas 2D. One tile outline is computed (geom.js), then stamped
// at every element of the group; each copy is the same Path2D under a
// different rotation + translation, so neighbours share their edges exactly.

import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import {
  HEX, A_CORNERS, corners, tileCopies, rotationCentres, latticeBasis, masterEdge, tileEdges,
  toEdge, fromEdge, turnAbout, selfCrosses, rotK, residualFor, DEG, act,
} from './geom.js';
import { LIZARD, MARKS } from './lizard.js';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const legend = document.getElementById('legend');
const slider = document.getElementById('morph');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ palette
const INK = '#1c1a17';
const PAPER = '#ece5d5';
const PAIR = ['#b23a26', '#2d5a96', '#3b7a4c']; // edge pairs and their rotation centres
const FILL = {
  litho: ['#f4efe3', '#d9d0bd', '#a89d87'],
  colour: ['#e6d8b4', '#9fb38f', '#6f8599'],
  hex: ['#efe9dc', '#e2dac9', '#d3c9b4'],
};

// ------------------------------------------------------------------ state
const clone = (o) => JSON.parse(JSON.stringify(o));
const state = {
  t: 0, // timeline (s)
  m: 0, // morph: 0 hexagon … 1 creature
  life: 0, // walking sway, 0..1
  walk: 0, // walking phase
  playing: true,
  litho: 1,
  lithoTarget: 1,
  sym: false,
  symK: 0,
  target: null, // the creature the morph runs to (the lizard, or the user's edit)
  edited: false,
  dirty: true,
};

// ------------------------------------------------------------------ timeline
// 0–1.5 s hexagons · 1.5–9 s bend the three edge pairs in turn · 9–15 s the
// lizards walk · 15–18 s back to hexagons.
const CYCLE = 18;
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
function morphAt(t) {
  if (t < 1.5) return 0;
  if (t < 9) return (t - 1.5) / 7.5;
  if (t < 15) return 1;
  return 1 - smooth((t - 15) / 3);
}
function lifeAt(t) {
  if (t < 9 || t > 15.5) return 0;
  return smooth((t - 9.3) / 1.2) * (1 - smooth((t - 14) / 1.3));
}
// stage weights for a morph value m
function stages(m) {
  return {
    pair: [0, 1, 2].map((j) => smooth((m - 0.04 - 0.27 * j) / 0.25)),
    corner: smooth((m - 0.04) / 0.78),
    toes: smooth((m - 0.78) / 0.14),
    marks: smooth((m - 0.84) / 0.14),
    colour: smooth(m / 0.95),
  };
}
const STEP_TEXT = [
  'Regular hexagons: every tile the same, three orientations',
  'Bend one edge; its partner turns with it, 120° about the red corner',
  'Second pair: turned about the blue corner',
  'Third pair: turned about the green corner',
  'Every copy is the same lizard, in one of three orientations',
];

// ------------------------------------------------------------------ geometry of the current tile
let shape = null; // { V, edges, outline, path, marks, crosses }
let presetOutline = null;
let markWeights = null;

// The preset as an editable target: the draggable handles, plus the fine
// residual that the preset needs on top of them.
const PRESET = (() => {
  const V = corners(LIZARD.v1);
  const handles = LIZARD.full.map((f, j) => LIZARD.majors[j].map((i) => f[i].slice()));
  const residual = LIZARD.full.map((f, j) => residualFor(V[2 * j], V[2 * j + 1], f, handles[j]));
  return { v1: LIZARD.v1.slice(), handles, residual, toes: LIZARD.toes, toeScale: 1, markScale: 1, stride: LIZARD.stride };
})();
state.target = clone(PRESET);

function buildShape(T, m, life, walk) {
  const st = stages(m);
  let v1 = [HEX[1][0] + (T.v1[0] - HEX[1][0]) * st.corner, HEX[1][1] + (T.v1[1] - HEX[1][1]) * st.corner];
  // the walk: swing the free corner about the snout corner; one fore foot
  // goes forward as the other goes back, and the tail swings with them
  if (life > 0) v1 = rotateAbout(HEX[0], v1, T.stride * DEG * life * Math.sin(walk));
  const V = corners(v1);
  const masters = [0, 1, 2].map((j) =>
    masterEdge(V[2 * j], V[2 * j + 1], T.handles[j], T.residual[j], T.toes[j], st.pair[j], st.toes * T.toeScale));
  const { edges, outline } = tileEdges(V, masters);
  return { V, edges, outline, st };
}
function rotateAbout(c, p, a) {
  const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + co * x - s * y, c[1] + s * x + co * y];
}

function pathOf(poly) {
  const p = new Path2D();
  p.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) p.lineTo(poly[i][0], poly[i][1]);
  p.closePath();
  return p;
}

// Mean-value coordinates: the marks inside the lizard are tied to its outline,
// so they follow any edit smoothly.
const MVC_STEP = 4;
function mvcWeights(poly, x) {
  const n = poly.length;
  const d = poly.map((v) => [v[0] - x[0], v[1] - x[1]]);
  const r = d.map((v) => Math.hypot(v[0], v[1]) + 1e-12);
  const tanHalf = new Array(n);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cr = d[i][0] * d[j][1] - d[i][1] * d[j][0];
    const dt = d[i][0] * d[j][0] + d[i][1] * d[j][1];
    tanHalf[i] = cr / (r[i] * r[j] + dt);
  }
  const w = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    w[i] = (tanHalf[(i + n - 1) % n] + tanHalf[i]) / r[i];
    sum += w[i];
  }
  for (let i = 0; i < n; i++) w[i] /= sum;
  return w;
}
function sparse(poly) { return poly.filter((_, i) => i % MVC_STEP === 0); }
function markPoints() {
  const pts = [];
  for (const e of MARKS.eyes) pts.push(e.p);
  for (const l of MARKS.lines) for (const p of l.pts) pts.push(p);
  for (const d of MARKS.dots) pts.push(d.p);
  return pts;
}
function prepareMarks() {
  const s = buildShape(PRESET, 1, 0, 0);
  presetOutline = sparse(s.outline);
  markWeights = markPoints().map((p) => mvcWeights(presetOutline, p));
}
function mapMarks(outline) {
  const poly = sparse(outline);
  return markWeights.map((w) => {
    let x = 0, y = 0;
    for (let i = 0; i < poly.length; i++) { x += w[i] * poly[i][0]; y += w[i] * poly[i][1]; }
    return [x, y];
  });
}
function marksPath(outline) {
  const P = mapMarks(outline);
  let i = 0;
  const eyes = new Path2D(), pupils = new Path2D(), lines = new Path2D();
  for (const e of MARKS.eyes) {
    const c = P[i++];
    eyes.moveTo(c[0] + e.r, c[1]);
    eyes.arc(c[0], c[1], e.r, 0, Math.PI * 2);
    pupils.moveTo(c[0] + e.r * 0.45, c[1]);
    pupils.arc(c[0], c[1], e.r * 0.45, 0, Math.PI * 2);
  }
  for (const l of MARKS.lines) {
    const pts = l.pts.map(() => P[i++]);
    lines.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 2) lines.lineTo(pts[1][0], pts[1][1]);
    for (let k = 1; k < pts.length - 1; k++) {
      const mid = [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2];
      if (k === pts.length - 2) lines.quadraticCurveTo(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]);
      else lines.quadraticCurveTo(pts[k][0], pts[k][1], mid[0], mid[1]);
    }
  }
  for (const d of MARKS.dots) {
    const c = P[i++];
    lines.moveTo(c[0] + d.r, c[1]);
    lines.arc(c[0], c[1], d.r, 0, Math.PI * 2);
  }
  return { eyes, pupils, lines };
}

// how far the target strays from the lizard (fades the lizard's marks)
function deviation(T) {
  let dev = Math.hypot(T.v1[0] - PRESET.v1[0], T.v1[1] - PRESET.v1[1]);
  for (let j = 0; j < 3; j++) for (let i = 0; i < T.handles[j].length; i++) {
    const a = T.handles[j][i], b = PRESET.handles[j][i];
    dev = Math.max(dev, Math.hypot(a[0] - b[0], a[1] - b[1]));
  }
  return dev;
}

// ------------------------------------------------------------------ view
let W = 0, H = 0, DPR = 1, S = 100, OX = 0, OY = 0;
let copies = [], centres = [[], [], []], basis = latticeBasis();
const toScreen = (p) => [OX + S * p[0], OY - S * p[1]];
const toWorld = (x, y) => [(x - OX) / S, (OY - y) / S];


// ------------------------------------------------------------------ textures
let grain = null, hatch = null, cross = null;
function noiseCanvas(size, fn) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = fn(i % size, (i / size) | 0);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
function buildPatterns() {
  // paper grain: fine speckle over a soft mottle
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const low = noiseCanvas(32, () => 255 - rnd() * 22);
  const big = document.createElement('canvas');
  big.width = big.height = 256;
  const bg = big.getContext('2d');
  bg.imageSmoothingEnabled = true;
  bg.drawImage(low, 0, 0, 256, 256);
  const fine = noiseCanvas(256, () => 255 - rnd() * rnd() * 70);
  bg.globalCompositeOperation = 'multiply';
  bg.drawImage(fine, 0, 0);
  grain = ctx.createPattern(big, 'repeat');
  // hatching: one line per period, in device pixels
  const period = Math.max(4, Math.round(4.6 * DPR));
  const hc = document.createElement('canvas');
  hc.width = 8; hc.height = period;
  const hg = hc.getContext('2d');
  hg.fillStyle = INK;
  hg.fillRect(0, period / 2 - 0.45 * DPR, 8, 0.9 * DPR);
  hatch = ctx.createPattern(hc, 'repeat');
  // crossed: the same lines both ways, a little closer
  const p2 = Math.max(4, Math.round(4.8 * DPR));
  const cc = document.createElement('canvas');
  cc.width = cc.height = p2;
  const cg = cc.getContext('2d');
  cg.fillStyle = INK;
  cg.globalAlpha = 0.85;
  cg.fillRect(0, p2 / 2 - 0.45 * DPR, p2, 0.9 * DPR);
  cg.fillRect(p2 / 2 - 0.45 * DPR, 0, 0.9 * DPR, p2);
  cross = ctx.createPattern(cc, 'repeat');
}

// ------------------------------------------------------------------ drawing
function setTile(g) {
  const c = rotK(g.k, [1, 0]);
  const a = DPR * S;
  ctx.setTransform(a * c[0], -a * c[1], -a * c[1], -a * c[0], DPR * (OX + S * g.t[0]), DPR * (OY - S * g.t[1]));
}
const hex3 = (h) => [0, 8, 16].map((s) => (parseInt(h.slice(1), 16) >> (16 - s)) & 255);
const mix3 = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);
const css = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
function mixHex(a, b, t) { return css(mix3(hex3(a), hex3(b), t)); }

function draw() {
  const sh = shape;
  const st = sh.st;
  const L = state.litho;
  const path = pathOf(sh.outline);
  const marks = markWeights && MARKS.dots.length + MARKS.eyes.length + MARKS.lines.length ? marksPath(sh.outline) : null;
  const dev = state.edited ? deviation(state.target) : 0;
  const markAlpha = sh.crosses ? 0 : st.marks * clamp01(1 - (dev - 0.3) / 0.4) * (state.target.markScale ?? 1);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // fills
  const fills = [0, 1, 2].map((k) => {
    const lit = mix3(hex3(FILL.hex[k]), hex3(FILL.litho[k]), st.colour);
    const col = mix3(hex3(FILL.hex[k]), hex3(FILL.colour[k]), st.colour);
    return css(mix3(col, lit, L));
  });
  for (const g of copies) {
    setTile(g);
    ctx.fillStyle = fills[g.k];
    ctx.fill(path);
  }
  // hatching (lithograph): none on the light lizards, one set on the middle
  // tone, a closer crossed pair on the dark; it turns with each lizard
  const hatchA = L * (0.35 + 0.65 * st.colour);
  const hatchMatrix = new DOMMatrix().rotateSelf(28).scaleSelf(1 / (DPR * S));
  if (hatchA > 0.01) {
    for (const g of copies) {
      if (g.k === 0) continue;
      setTile(g);
      const pat = g.k === 1 ? hatch : cross;
      ctx.globalAlpha = hatchA * (g.k === 1 ? 0.5 : 0.46);
      pat.setTransform(hatchMatrix);
      ctx.fillStyle = pat;
      ctx.fill(path);
    }
    ctx.globalAlpha = 1;
  }
  // marks: ink on the light and middle lizards; pale, like a white line, on the dark ones in the print
  if (marks && markAlpha > 0.01) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pale = 'rgba(246,241,229,0.92)';
    for (const g of copies) {
      setTile(g);
      const light = g.k === 2 && L > 0.5;
      ctx.globalAlpha = markAlpha * (0.8 + 0.2 * L);
      ctx.strokeStyle = light ? pale : INK;
      ctx.lineWidth = (light ? 1.25 : 1.0) / S;
      ctx.stroke(marks.lines);
      ctx.fillStyle = '#f6f1e5';
      ctx.fill(marks.eyes);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2 / S;
      ctx.stroke(marks.eyes);
      ctx.fillStyle = INK;
      ctx.fill(marks.pupils);
    }
    ctx.globalAlpha = 1;
  }
  // outlines
  ctx.strokeStyle = mixHex('#3a332b', INK, L);
  ctx.lineJoin = 'round';
  ctx.lineWidth = (1.25 + 0.5 * st.colour) / S;
  for (const g of copies) {
    setTile(g);
    ctx.stroke(path);
  }
  // paper grain over everything
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = grain;
  ctx.globalAlpha = 0.55 + 0.45 * L;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  drawOverlay(sh);
}

// ------------------------------------------------------------------ overlay: edge pairs, centres, handles
function screenPath(poly) {
  const p = new Path2D();
  poly.forEach((q, i) => {
    const [x, y] = toScreen(q);
    if (i) p.lineTo(x, y); else p.moveTo(x, y);
  });
  return p;
}
function triangle(c, r, fill, stroke) {
  const [x, y] = toScreen(c);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
  }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function handlePositions(sh) {
  const out = [];
  const T = state.target;
  for (let j = 0; j < 3; j++) {
    const A = sh.V[2 * j], B = sh.V[2 * j + 1];
    T.handles[j].forEach((h, i) => {
      const s = sh.st.pair[j];
      const q = fromEdge(A, B, h[0], 0), f = fromEdge(A, B, h[0], h[1]);
      const p = [q[0] + (f[0] - q[0]) * s, q[1] + (f[1] - q[1]) * s];
      out.push({ kind: 'h', j, i, p, partner: false });
      out.push({ kind: 'h', j, i, p: turnAbout(A, p, 1), partner: true });
    });
  }
  out.push({ kind: 'v', which: 1, p: sh.V[1] });
  out.push({ kind: 'v', which: 3, p: sh.V[3] });
  out.push({ kind: 'v', which: 5, p: sh.V[5] });
  return out;
}

function drawOverlay(sh) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (state.debugGrid) {
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    for (let g = -3; g <= 3.001; g += 0.25) {
      ctx.strokeStyle = Math.abs(g % 1) < 1e-6 ? 'rgba(200,0,0,0.6)' : Math.abs(g % 0.5) < 1e-6 ? 'rgba(0,0,200,0.45)' : 'rgba(0,0,0,0.15)';
      const [x0, y0] = toScreen([g, -3]), [x1, y1] = toScreen([g, 3]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const [a0, b0] = toScreen([-3, g]), [a1, b1] = toScreen([3, g]);
      ctx.beginPath(); ctx.moveTo(a0, b0); ctx.lineTo(a1, b1); ctx.stroke();
      if (Math.abs(g % 0.5) < 1e-6) { ctx.fillStyle = '#000'; ctx.fillText(g.toFixed(1), toScreen([g, 0])[0] + 2, 12); ctx.fillText(g.toFixed(1), 2, toScreen([0, g])[1] - 2); }
    }
  }
  if (state.noOverlay) return;
  const symA = state.symK;
  // the lattice cell and every rotation centre, over a light wash
  if (symA > 0.01) {
    ctx.fillStyle = `rgba(241,235,223,${0.42 * symA})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = symA;
    const c0 = A_CORNERS[0];
    const cell = [c0, [c0[0] + basis[0][0], c0[1] + basis[0][1]], [c0[0] + basis[0][0] + basis[1][0], c0[1] + basis[0][1] + basis[1][1]], [c0[0] + basis[1][0], c0[1] + basis[1][1]], c0];
    const cp = screenPath(cell);
    ctx.strokeStyle = 'rgba(241,235,223,0.9)';
    ctx.lineWidth = 4.5;
    ctx.stroke(cp);
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.stroke(cp);
    ctx.setLineDash([]);
    for (let c = 0; c < 3; c++) for (const p of centres[c]) triangle(p, 8, PAIR[c], '#f4efe3');
    ctx.globalAlpha = 1;
  }
  // the working tile: its three edge pairs in colour
  const edgeA = Math.max(symA, state.playing ? 0.85 : 0.6);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let j = 0; j < 3; j++) {
    const a = 2 * j, b = (a + 5) % 6;
    ctx.strokeStyle = PAIR[j];
    ctx.globalAlpha = edgeA;
    ctx.lineWidth = 3;
    ctx.stroke(screenPath(sh.edges[a]));
    ctx.setLineDash([5, 4]);
    ctx.stroke(screenPath(sh.edges[b]));
    ctx.setLineDash([]);
    // the corner the pair turns about
    triangle(A_CORNERS[j], 7, PAIR[j], '#f4efe3');
  }
  ctx.globalAlpha = 1;
  // handles
  for (const h of handlePositions(sh)) {
    const [x, y] = toScreen(h.p);
    const hot = hover && hover.kind === h.kind && hover.j === h.j && hover.i === h.i && hover.which === h.which;
    const col = h.kind === 'v' ? INK : PAIR[h.j];
    ctx.beginPath();
    if (h.kind === 'v') ctx.rect(x - 4.5, y - 4.5, 9, 9);
    else ctx.arc(x, y, hot ? 6 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = h.partner ? '#f4efe3' : col;
    ctx.fill();
    ctx.lineWidth = h.partner ? 2 : 1.5;
    ctx.strokeStyle = h.partner ? col : '#f4efe3';
    ctx.stroke();
    if (hot) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }
  if (sh.crosses) {
    // ring every copy of the crossing on screen: each one is an overlap
    ctx.strokeStyle = '#a23b2a';
    ctx.lineWidth = 2.5;
    for (const g of copies) {
      const [x, y] = toScreen(act(g, sh.crosses));
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ------------------------------------------------------------------ interaction
let hover = null, drag = null;
function pick(x, y, radius) {
  if (!shape) return null;
  let best = null, bd = radius;
  for (const h of handlePositions(shape)) {
    const [sx, sy] = toScreen(h.p);
    const d = Math.hypot(sx - x, sy - y);
    if (d < bd) { bd = d; best = h; }
  }
  return best;
}
function local(e) {
  const r = canvas.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}
// Freeze whatever is on screen as the new target, so editing starts from it.
function bake() {
  const st = stages(state.m);
  const T = state.target;
  T.v1 = shape.V[1].slice();
  for (let j = 0; j < 3; j++) {
    T.handles[j] = T.handles[j].map((h) => [h[0], h[1] * st.pair[j]]);
    T.residual[j] = T.residual[j].map((r) => [r[0] * st.pair[j], r[1] * st.pair[j]]);
  }
  T.toeScale *= st.toes;
  T.markScale *= st.marks;
  state.m = 1; state.life = 0;
  state.edited = true;
  setPlaying(false);
  syncSlider();
}
function applyDrag(h, p) {
  const T = state.target;
  const V = shape.V;
  if (h.kind === 'v') {
    let v1 = p;
    if (h.which === 3) v1 = turnAbout(V[2], p, 1);
    if (h.which === 5) v1 = turnAbout(V[0], p, -1);
    // keep the free corner within reason
    const d = Math.hypot(v1[0] - HEX[1][0], v1[1] - HEX[1][1]);
    if (d > 0.6) v1 = [HEX[1][0] + ((v1[0] - HEX[1][0]) * 0.6) / d, HEX[1][1] + ((v1[1] - HEX[1][1]) * 0.6) / d];
    T.v1 = v1;
  } else {
    const A = V[2 * h.j], B = V[2 * h.j + 1];
    const q = h.partner ? turnAbout(A, p, -1) : p;
    let [u, v] = toEdge(A, B, q);
    const hs = T.handles[h.j];
    const lo = h.i > 0 ? hs[h.i - 1][0] + 0.02 : 0.02;
    const hi = h.i < hs.length - 1 ? hs[h.i + 1][0] - 0.02 : 0.98;
    u = Math.max(lo, Math.min(hi, u));
    v = Math.max(-0.6, Math.min(0.6, v));
    hs[h.i] = [u, v];
  }
  state.edited = true;
  state.dirty = true;
}
canvas.addEventListener('pointerdown', (e) => {
  const [x, y] = local(e);
  const h = pick(x, y, e.pointerType === 'touch' ? 24 : 14);
  if (!h) return;
  canvas.setPointerCapture(e.pointerId);
  if (state.m < 1 || state.life > 0 || state.playing) bake();
  drag = h;
  hover = h;
  e.preventDefault();
});
canvas.addEventListener('pointermove', (e) => {
  const [x, y] = local(e);
  if (drag) {
    applyDrag(drag, toWorld(x, y));
    return;
  }
  const h = pick(x, y, 14);
  if ((h && !hover) || (!h && hover) || (h && hover && (h.j !== hover.j || h.i !== hover.i || h.which !== hover.which || h.partner !== hover.partner))) {
    hover = h;
    state.dirty = true;
  }
  canvas.style.cursor = h ? 'grab' : 'default';
});
const endDrag = () => { if (drag) { drag = null; state.dirty = true; } };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// ------------------------------------------------------------------ controls
setupPanel();
const setLitho = segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
  state.dirty = true;
}, 1);
const setPlaying = playButton((on) => {
  state.playing = on;
  state.dirty = true;
});
const symBtn = document.getElementById('btn-sym');
function setSym(on) {
  state.sym = on;
  symBtn.setAttribute('aria-pressed', String(on));
  legend.classList.toggle('on', on);
  state.dirty = true;
}
symBtn.addEventListener('click', () => setSym(!state.sym));
function reset() {
  state.target = clone(PRESET);
  state.edited = false;
  state.dirty = true;
  setBadge(false);
}
document.getElementById('btn-reset').addEventListener('click', () => {
  reset();
  state.t = 9; // straight to the finished lizards
  setPlaying(!reduced);
});
function syncSlider() { slider.value = String(Math.round(state.m * 1000)); }
slider.addEventListener('input', () => {
  setPlaying(false);
  state.m = slider.value / 1000;
  state.life = 0;
  state.t = 1.5 + state.m * 7.5;
  state.dirty = true;
});
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  s: () => setSym(!state.sym),
  r: () => document.getElementById('btn-reset').click(),
});

// ------------------------------------------------------------------ loop
let last = performance.now();
let lastStep = -1;
let lastKey = '';
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) {
    state.t = (state.t + dt) % CYCLE;
    state.m = morphAt(state.t);
    state.life = lifeAt(state.t);
    state.walk += dt * 2.4 * (state.life > 0 ? 1 : 0);
    syncSlider();
    const key = `${state.m.toFixed(5)}:${state.life.toFixed(5)}:${state.life ? state.walk.toFixed(4) : 0}`;
    if (key !== lastKey) { lastKey = key; state.dirty = true; }
  }
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    state.dirty = true;
  }
  const symGoal = state.sym ? 1 : 0;
  if (state.symK !== symGoal) {
    state.symK += Math.sign(symGoal - state.symK) * Math.min(Math.abs(symGoal - state.symK), dt * 4);
    state.dirty = true;
  }
  if (state.dirty) {
    state.dirty = false;
    shape = buildShape(state.target, state.m, state.life, state.walk);
    shape.crosses = drag || state.edited ? selfCrosses(shape.outline) : null;
    draw();
    // narrate the construction
    if (state.quiet) { setBadge(false); requestAnimationFrame(frame); return; }
    let step = -1;
    if (shape.crosses) setBadge(true, 'The outline crosses itself (ringed), so copies would overlap');
    else if (state.edited) setBadge(true, 'Your tile: each copy of an edge moves with it, so the plane stays filled');
    else if (state.playing || state.m > 0) {
      const st = shape.st;
      step = state.m <= 0 ? 0 : st.pair[0] < 1 ? 1 : st.pair[1] < 1 ? 2 : st.pair[2] < 1 ? 3 : 4;
      if (state.m <= 0 && !state.playing) step = 0;
    } else step = 0;
    if (step >= 0 && step !== lastStep) setBadge(true, STEP_TEXT[step]);
    lastStep = shape.crosses || state.edited ? -1 : step;
  }
  requestAnimationFrame(frame);
}

fitFrame(30 / 38, (w, h) => {
  W = w; H = h;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * DPR);
  canvas.height = Math.round(h * DPR);
  const across = state.across || (w < 520 ? 3.3 : 4.1);
  S = w / (Math.sqrt(3) * across);
  OX = w / 2; OY = h * 0.47;
  const m = 2.2;
  copies = tileCopies(-OX / S - m, -(h - OY) / S - m, (w - OX) / S + m, OY / S + m);
  centres = rotationCentres(copies);
  buildPatterns();
  state.dirty = true;
});

prepareMarks();
setSym(false);
// without motion, open on the finished lizards rather than the bare hexagons
if (reduced) { state.t = 9; state.m = 1; syncSlider(); }
markReady();
requestAnimationFrame(frame);

// for checking from the console / headless screenshots
window.__page = {
  state,
  setMorph(m) { setPlaying(false); state.m = m; state.life = 0; state.t = 1.5 + m * 7.5; state.dirty = true; syncSlider(); },
  setTime(t) { setPlaying(false); state.t = t; state.m = morphAt(t); state.life = lifeAt(t); state.walk = t * 2.4; state.dirty = true; },
  setLitho, setSym, setPlaying, reset,
  get shape() { return shape; },
  handles() {
    const r = canvas.getBoundingClientRect();
    return handlePositions(shape).map((h) => { const [x, y] = toScreen(h.p); return { ...h, x: r.left + x, y: r.top + y }; });
  },
  drag(i, dx, dy) {
    const h = this.handles()[i];
    const ev = (type, x, y) => canvas.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true, pointerType: 'mouse' }));
    ev('pointerdown', h.x, h.y);
    for (let k = 1; k <= 5; k++) ev('pointermove', h.x + (dx * k) / 5, h.y + (dy * k) / 5);
    ev('pointerup', h.x + dx, h.y + dy);
    return h;
  },
  design(T) {
    const V = corners(T.v1);
    const handles = T.full.map((f, j) => T.majors[j].map((i) => f[i].slice()));
    const residual = T.full.map((f, j) => residualFor(V[2 * j], V[2 * j + 1], f, handles[j]));
    state.target = { ...clone(PRESET), v1: T.v1, handles, residual, toes: T.toes || PRESET.toes };
    state.m = 1; state.life = 0; setPlaying(false); state.dirty = true;
  },
  designAbs(d) {
    const V = corners(d.v1);
    const handles = [d.e0, d.e2, d.e4].map((pts, j) => pts.map((p) => toEdge(V[2 * j], V[2 * j + 1], p)));
    Object.assign(state.target, { v1: d.v1, handles, residual: handles.map(() => null), toes: [[], [], []] });
    state.m = 1; state.life = 0; setPlaying(false); state.dirty = true;
    return handles.map((hs) => hs.map((h) => [+h[0].toFixed(3), +h[1].toFixed(3)]));
  },
  zoom(across) { state.across = across; window.dispatchEvent(new Event('resize')); },
};
