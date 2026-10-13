// The drawings: the tessellation on the sketchbook page, and the hero lizard
// on its own sheet (the texture of the solid body). Each is drawn twice, as a
// lithograph (inks and greys) and in colour.

import { H, SPINE, LEGS, EYES, apply } from './lizard.js';

export const PAPER = [0.955, 0.935, 0.885];
const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

// tone of each colour class (the tile's rotation): light, mid (hatched), dark
export const CLASS = {
  L: [[0.97, 0.955, 0.915], [0.66, 0.64, 0.6], [0.2, 0.19, 0.17]],
  C: [hex(0xe9d5a6), hex(0x8fa07a), hex(0x80553f)],
  // markings drawn on each class
  markL: [[0.25, 0.23, 0.2], [0.18, 0.17, 0.15], [0.93, 0.91, 0.86]],
  markC: [hex(0x8a6a3c), hex(0x3f4f33), hex(0xe6c79a)],
};
const INK = [0.12, 0.11, 0.1];
const PENCIL = [0.42, 0.41, 0.39];

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ spine helpers
function resampleSpine(n = 60) {
  const L = [0];
  for (let i = 1; i < SPINE.length; i++) L.push(L[i - 1] + Math.hypot(SPINE[i][0] - SPINE[i - 1][0], SPINE[i][1] - SPINE[i - 1][1]));
  const tot = L[L.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const s = (k / n) * tot;
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const u = (s - L[j]) / (L[j + 1] - L[j]);
    out.push([SPINE[j][0] + (SPINE[j + 1][0] - SPINE[j][0]) * u, SPINE[j][1] + (SPINE[j + 1][1] - SPINE[j][1]) * u, s / tot]);
  }
  return out;
}
const SP = resampleSpine(80);

// ------------------------------------------------------------------ one lizard
// g: 2D context; T: tile point → canvas point; ring: outline (tile coords)
// cls: colour class 0..2; q: how finished the drawing is (0 outline … 1 full)
// mode: 'L' or 'C'; px: canvas pixels per tile unit
export function drawLizard(g, T, ring, cls, q, mode, px, opts = {}) {
  const path = new Path2D();
  ring.forEach((p, i) => { const c = T(p); if (i) path.lineTo(c[0], c[1]); else path.moveTo(c[0], c[1]); });
  path.closePath();
  const fillA = opts.noFill ? 0 : smooth(0.28, 0.72, q);
  const detA = opts.noFill ? 0 : smooth(0.55, 0.95, q);
  const base = CLASS[mode][cls];
  if (fillA > 0) {
    g.fillStyle = css(base, fillA);
    g.fill(path);
    g.save();
    g.clip(path);
    if (mode === 'L' && cls === 1) hatch(g, path, px, fillA * 0.55);
    if (detA > 0) markings(g, T, cls, mode, px, detA);
    g.restore();
  }
  // outline: pencil when sketchy, ink when finished
  const lc = [0, 1, 2].map((i) => PENCIL[i] + (INK[i] - PENCIL[i]) * smooth(0.2, 0.8, q));
  g.strokeStyle = css(lc, 0.5 + 0.5 * smooth(0, 0.6, q));
  g.lineWidth = (0.011 + 0.006 * q) * px;
  g.lineJoin = 'round';
  g.stroke(path);
  return path;
}

function hatch(g, path, px, a) {
  const bb = { x0: -1e5, y0: -1e5 };
  g.strokeStyle = css([0.25, 0.24, 0.22], a);
  g.lineWidth = Math.max(0.8, px * 0.006);
  const step = Math.max(3, px * 0.03);
  g.beginPath();
  const W = g.canvas.width, Hh = g.canvas.height;
  for (let x = -Hh; x < W + Hh; x += step) { g.moveTo(x, 0); g.lineTo(x + Hh, Hh); }
  g.stroke();
  void bb; void path;
}

// eyes, a row of spots down the back, stippled scales, toes and a mouth
function markings(g, T, cls, mode, px, a) {
  const mark = (mode === 'L' ? CLASS.markL : CLASS.markC)[cls];
  const light = cls === 2;
  // spots along the spine, from the neck to near the tip of the tail
  g.fillStyle = css(mark, a * 0.8);
  g.beginPath();
  for (let k = 0; k < SP.length; k += 1) {
    const p = SP[k];
    const f = p[2];
    if (f < 0.12 || f > 0.8 || k % 7) continue;
    const q0 = SP[Math.max(0, k - 1)], q1 = SP[Math.min(SP.length - 1, k + 1)];
    const dir = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]);
    const size = 0.07 * (f < 0.35 ? 0.7 + f : 1.05 - (f - 0.35) * 0.9);
    const c = T([p[0], p[1]]);
    const c2 = T([p[0] + Math.cos(dir), p[1] + Math.sin(dir)]);
    const ang = Math.atan2(c2[1] - c[1], c2[0] - c[0]);
    g.moveTo(c[0] + Math.cos(ang) * size * px * 0.8, c[1] + Math.sin(ang) * size * px * 0.8);
    g.ellipse(c[0], c[1], size * px * 0.8, size * px * 0.62, ang, 0, Math.PI * 2);
  }
  g.fill();
  // stipple: a sparse lattice of dots, scales on the flanks
  g.fillStyle = css(mark, a * 0.35);
  const r = Math.max(0.6, px * 0.006);
  g.beginPath();
  for (let i = -16; i <= 16; i++) {
    for (let j = -16; j <= 16; j++) {
      const x = i * 0.085 + (j & 1) * 0.0425, y = j * 0.074;
      if (Math.abs(x) > 1.35 || Math.abs(y) > 1.3) continue;
      const c = T([x, y]);
      g.moveTo(c[0] + r, c[1]);
      g.arc(c[0], c[1], r, 0, Math.PI * 2);
    }
  }
  g.fill();
  // toes: short strokes fanning from each foot
  g.strokeStyle = css(light ? [0.92, 0.9, 0.85] : [0.15, 0.14, 0.12], a * 0.75);
  g.lineWidth = Math.max(0.8, px * 0.007);
  g.lineCap = 'round';
  g.beginPath();
  for (const L of LEGS) {
    const dx = L.foot[0] - L.joint[0], dy = L.foot[1] - L.joint[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const base = [L.foot[0] - ux * 0.16, L.foot[1] - uy * 0.16];
    for (const t of [-0.5, 0, 0.5]) {
      const ex = ux * Math.cos(t) - uy * Math.sin(t), ey = ux * Math.sin(t) + uy * Math.cos(t);
      const p0 = T([base[0] + ex * 0.04, base[1] + ey * 0.04]), p1 = T([base[0] + ex * 0.12, base[1] + ey * 0.12]);
      g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]);
    }
    // a crease at the elbow / knee
    const m = [L.joint[0] + dx * 0.45, L.joint[1] + dy * 0.45];
    const p0 = T([m[0] - uy * 0.05, m[1] + ux * 0.05]), p1 = T([m[0] + uy * 0.05, m[1] - ux * 0.05]);
    g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]);
  }
  g.stroke();
  // mouth: along the side of the head from the snout
  const m0 = T([1.24, -0.64]), m1 = T([1.12, -0.68]), m2 = T([1.02, -0.74]);
  g.beginPath(); g.moveTo(m0[0], m0[1]); g.quadraticCurveTo(m1[0], m1[1], m2[0], m2[1]); g.stroke();
  // eyes
  for (const e of EYES) {
    const c = T(e);
    g.fillStyle = css(light ? [0.95, 0.93, 0.88] : [0.98, 0.97, 0.94], a);
    g.beginPath(); g.arc(c[0], c[1], 0.045 * px, 0, Math.PI * 2); g.fill();
    g.strokeStyle = css(INK, a); g.lineWidth = Math.max(0.8, px * 0.008);
    g.stroke();
    g.fillStyle = css(INK, a);
    g.beginPath(); g.arc(c[0] + 0.008 * px, c[1], 0.022 * px, 0, Math.PI * 2); g.fill();
  }
}

// ------------------------------------------------------------------ the page
// layout: { W, D } page size in world units, res px per world unit
// place(pt) maps a tile-space point (after the placement) to page world (x, z)
// relative to the page's corner.
export function drawPage(mode, layout) {
  const { W, D, res, tiles, ring, toPage, centreDist, hero } = layout;
  const c = document.createElement('canvas');
  c.width = Math.round(W * res);
  c.height = Math.round(D * res);
  const g = c.getContext('2d');
  g.fillStyle = css(PAPER);
  g.fillRect(0, 0, c.width, c.height);
  const px = layout.k * res;
  // faint pencil construction: the hexagons of the lattice at the fringe
  for (const t of tiles) {
    const dist = centreDist(t);
    const q = 1 - smooth(layout.rIn, layout.rOut, dist);
    if (q > 0.6 || dist > layout.rOut + 1.6) continue;
    const T = (p) => { const w = toPage(apply(t.pl, p)); return [w[0] * res, w[1] * res]; };
    g.beginPath();
    H.forEach((p, i) => { const q2 = T(p); if (i) g.lineTo(q2[0], q2[1]); else g.moveTo(q2[0], q2[1]); });
    g.closePath();
    g.strokeStyle = css(PENCIL, 0.22 * (1 - q) * (1 - smooth(layout.rOut, layout.rOut + 1.6, dist)));
    g.lineWidth = Math.max(0.7, px * 0.005);
    g.stroke();
  }
  for (const t of tiles) {
    const dist = centreDist(t);
    const q = 1 - smooth(layout.rIn, layout.rOut, dist);
    if (dist > layout.rOut + 0.6) continue;
    const T = (p) => { const w = toPage(apply(t.pl, p)); return [w[0] * res, w[1] * res]; };
    drawLizard(g, T, ring, t.pl.r, Math.max(0.04, q), mode, px, { noFill: t === hero });
  }
  return c;
}

// The hero on its own sheet, fully drawn. Tile space [-S, S]² fills the canvas.
export const HERO_SPAN = 1.5;
export function drawHero(mode, ring, cls, size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = css(PAPER);
  g.fillRect(0, 0, size, size);
  const px = size / (2 * HERO_SPAN);
  const T = (p) => [(p[0] + HERO_SPAN) * px, (HERO_SPAN - p[1]) * px];
  drawLizard(g, T, ring, cls, 1, mode, px);
  return c;
}
