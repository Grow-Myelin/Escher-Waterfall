// The stairwell tower.
//
// A square open well, A units from the centre to the inner edge of the stairs
// and W to the walls. Two stairs climb round it, one flight along each wall
// and a landing in each corner, each flight rising RISE. The second stair is
// the first one turned half a turn, so every wall has a flight every
// 2·RISE of height and the two never meet.

import { Tess, PAT, st } from './tess.js';

export const A = 5.5; // centre to the inner edge of the stairs
export const W = 8.5; // centre to the inside face of the walls
export const WT = 1.2; // wall thickness
export const RISE = 4; // height of one flight
export const NSTEP = 16;
export const SLAB = 0.6; // depth of the stair slab
export const PARA = 1.25; // parapet top above the nosing line
export const PT = 0.25; // parapet thickness
export const LANDINGS = 12; // landings per stair: heights 0 .. 44
export const TOP = 50; // top of the walls

const S = {
  wall: st(0xd5cab4, PAT.ASHLAR),
  stair: st(0xd9cfbb, PAT.STONE),
  soffit: st(0xc7bba4, PAT.PLASTER),
  para: st(0xcfc4ad, PAT.PLASTER),
  cope: st(0xe2d9c6, PAT.STONE),
  jamb: st(0xa99e88, PAT.PLASTER),
  void: st(0x221f1b, PAT.VOID),
  glow: st(0xf3eee2, PAT.GLOW),
  floor: st(0xd2c6ae, PAT.MOSAIC),
  basin: st(0xcabfa8, PAT.STONE),
  water: st(0x8fb0b8, PAT.WATER),
  cornice: st(0xc4b8a0, PAT.PLASTER),
  door: st(0x6a5038, PAT.WOOD),
};

// wall w's local frame: t runs along the wall in the climbing direction,
// q from the well (q = A) out to the wall (q = W); y is up.
const MAP = [
  (t, y, q) => [t, y, -q],
  (t, y, q) => [q, y, t],
  (t, y, q) => [-t, y, q],
  (t, y, q) => [-q, y, -t],
];
const DIR = [
  (t, y, q) => [t, y, -q],
  (t, y, q) => [q, y, t],
  (t, y, q) => [-t, y, q],
  (t, y, q) => [-q, y, -t],
];

function inFrame(b, w) {
  const m = MAP[w], dv = DIR[w];
  return {
    quad: (p0, p1, p2, p3, s, e, hint, o = {}) => b.quad(m(...p0), m(...p1), m(...p2), m(...p3), s, e, { ...o, hint: dv(...hint) }),
    tri: (p0, p1, p2, s, e, hint, o = {}) => b.tri(m(...p0), m(...p1), m(...p2), s, e, { ...o, hint: dv(...hint) }),
  };
}

const K = RISE / (2 * A); // slope of the flights

// One flight along wall w from height h0 (t = -A) to h0 + RISE (t = +A).
function flight(b, w, h0) {
  const f = inFrame(b, w);
  const tr = (2 * A) / NSTEP, rr = RISE / NSTEP;
  const q0 = A + PT;
  for (let i = 0; i < NSTEP; i++) {
    const t0 = -A + i * tr, t1 = t0 + tr;
    const y0 = h0 + i * rr, y1 = y0 + rr;
    f.quad([t0, y0, q0], [t0, y1, q0], [t0, y1, W], [t0, y0, W], S.stair, [1, 1, 1, 1], [-1, 0, 0]);
    f.quad([t0, y1, q0], [t1, y1, q0], [t1, y1, W], [t0, y1, W], S.stair, [1, 1, 1, 1], [0, 1, 0]);
    // inside face of the parapet, from this tread up to the sloping top
    const yp0 = h0 + (t0 + A) * K + PARA, yp1 = h0 + (t1 + A) * K + PARA;
    f.quad([t0, y1, q0], [t1, y1, q0], [t1, yp1, q0], [t0, yp0, q0], S.para, [1, 0, 1, 0], [0, 0, 1]);
  }
  const ys0 = h0 - SLAB, ys1 = h0 + RISE - SLAB;
  const yp0 = h0 + PARA, yp1 = h0 + RISE + PARA;
  // the face to the well: stringer and parapet in one
  f.quad([-A, ys0, A], [A, ys1, A], [A, yp1, A], [-A, yp0, A], S.para, [1, 0, 1, 0], [0, 0, -1]);
  // coping
  f.quad([-A, yp0, A], [A, yp1, A], [A, yp1, q0], [-A, yp0, q0], S.cope, [1, 0, 1, 0], [0, 1, 0]);
  // soffit
  f.quad([-A, ys0, A], [A, ys1, A], [A, ys1, W], [-A, ys0, W], S.soffit, [1, 0, 1, 0], [0, -1, 0]);
}

// The landing in the corner where wall w's flight starts, at height h.
function landing(b, w, h) {
  const f = inFrame(b, w);
  f.quad([-W, h, A], [-A, h, A], [-A, h, W], [-W, h, W], S.stair, [0, 0, 0, 0], [0, 1, 0]);
  f.quad([-W, h - SLAB, A], [-A, h - SLAB, A], [-A, h - SLAB, W], [-W, h - SLAB, W], S.soffit, [0, 0, 0, 0], [0, -1, 0]);
  // newel post where the two parapets meet
  const p = [-A - PT, -A];
  const y0 = h - SLAB, y1 = h + PARA + 0.18;
  f.quad([p[0], y0, A], [p[1], y0, A], [p[1], y1, A], [p[0], y1, A], S.para, [1, 1, 1, 1], [0, 0, -1]);
  f.quad([p[0], y0, A + PT], [p[0], y0, A], [p[0], y1, A], [p[0], y1, A + PT], S.para, [1, 1, 1, 1], [-1, 0, 0]);
  f.quad([p[0], y1, A], [p[1], y1, A], [p[1], y1, A + PT], [p[0], y1, A + PT], S.cope, [1, 1, 1, 1], [0, 1, 0]);
  f.quad([p[0], y0, A], [p[1], y0, A], [p[1], y0, A + PT], [p[0], y0, A + PT], S.soffit, [1, 1, 1, 1], [0, -1, 0]);
}

// ------------------------------------------------------------ walls
// The inside face of wall w, with arched openings cut through it.
// openings: { t: [t0, t1], y: [y0, y1], r, kind: 'door' | 'window' }
function wall(b, w, openings) {
  const f = inFrame(b, w);
  const xs = new Set([-W, W]), ys = new Set([0, TOP]);
  for (const o of openings) { xs.add(o.t[0]); xs.add(o.t[1]); ys.add(o.y[0]); ys.add(o.y[1]); ys.add(o.y[1] + o.r); }
  const X = [...xs].sort((a, c) => a - c), Y = [...ys].sort((a, c) => a - c);
  const kind = (i, j) => {
    if (i < 0 || j < 0 || i >= X.length - 1 || j >= Y.length - 1) return 'out';
    const mx = (X[i] + X[i + 1]) / 2, my = (Y[j] + Y[j + 1]) / 2;
    for (const o of openings) {
      if (mx > o.t[0] && mx < o.t[1] && my > o.y[0] && my < o.y[1]) return 'hole';
      if (mx > o.t[0] && mx < o.t[1] && my > o.y[1] && my < o.y[1] + o.r) return 'arch';
    }
    return 'solid';
  };
  const real = (k) => (k === 'out' || k === 'hole' ? 1 : 0);
  for (let i = 0; i < X.length - 1; i++) {
    for (let j = 0; j < Y.length - 1; j++) {
      if (kind(i, j) !== 'solid') continue;
      const e = [real(kind(i, j - 1)), real(kind(i + 1, j)), real(kind(i, j + 1)), real(kind(i - 1, j))];
      f.quad([X[i], Y[j], W], [X[i + 1], Y[j], W], [X[i + 1], Y[j + 1], W], [X[i], Y[j + 1], W], S.wall, e, [0, 0, -1], { cell: 0.7 });
    }
  }
  for (const o of openings) opening(f, o);
}

function opening(f, o) {
  const [t0, t1] = o.t, [y0, y1] = o.y, r = o.r;
  const tc = (t0 + t1) / 2, top = y1 + r;
  const d = o.kind === 'door' ? WT : 0.7;
  const N = 10;
  const curve = (k) => { const a = Math.PI * (1 - k / N); return [tc + r * Math.cos(a), y1 + r * Math.sin(a)]; };
  for (let k = 0; k < N; k++) {
    const [xa, ya] = curve(k), [xb, yb] = curve(k + 1);
    const xa2 = k === 0 ? t0 : xa, xb2 = k === N - 1 ? t1 : xb;
    f.quad([xa2, ya, W], [xb2, yb, W], [xb2, top, W], [xa2, top, W], S.wall, [1, 0, 0, 0], [0, 0, -1]);
    f.quad([xa, ya, W], [xb, yb, W], [xb, yb, W + d], [xa, ya, W + d], S.jamb, [1, 0, 1, 0], [tc - (xa + xb) / 2, y1 - (ya + yb) / 2, 0]);
  }
  f.quad([t0, y0, W], [t0, y1, W], [t0, y1, W + d], [t0, y0, W + d], S.jamb, [1, 0, 1, 1], [1, 0, 0]);
  f.quad([t1, y0, W], [t1, y1, W], [t1, y1, W + d], [t1, y0, W + d], S.jamb, [1, 0, 1, 1], [-1, 0, 0]);
  f.quad([t0, y0, W], [t1, y0, W], [t1, y0, W + d], [t0, y0, W + d], S.jamb, [1, 1, 1, 1], [0, 1, 0]);
  const back = o.kind === 'door' ? S.void : S.glow;
  f.quad([t0, y0, W + d], [t1, y0, W + d], [t1, y1, W + d], [t0, y1, W + d], back, [0, 0, 0, 0], [0, 0, -1]);
  for (let k = 0; k < N; k++) {
    const [xa, ya] = curve(k), [xb, yb] = curve(k + 1);
    f.tri([tc, y1, W + d], [xa, ya, W + d], [xb, yb, W + d], back, [0, 0, 0], [0, 0, -1]);
  }
  // a mullion and transom in the windows
  if (o.kind === 'window') {
    const m = 0.07, dd = W + d * 0.55;
    f.quad([tc - m, y0, dd], [tc + m, y0, dd], [tc + m, top, dd], [tc - m, top, dd], S.jamb, [1, 1, 1, 1], [0, 0, -1]);
    const yt = y1 - 0.4;
    f.quad([t0, yt - m, dd], [t1, yt - m, dd], [t1, yt + m, dd], [t0, yt + m, dd], S.jamb, [1, 1, 1, 1], [0, 0, -1]);
  }
}

// ------------------------------------------------------------ floor and fountain
function floor(b) {
  b.quad([-W, 0, W], [W, 0, W], [W, 0, -W], [-W, 0, -W], S.floor, [1, 1, 1, 1], { hint: [0, 1, 0], cell: 0.8, uv: (p) => [p[0], p[2]] });
  // fountain
  b.lathe(0, 0, 0, [[2.0, 0], [2.0, 0.55], [1.78, 0.55], [1.78, 0.25]], 40, S.basin, { edges: [1, 1, 1, 1], cell: 0.5 });
  b.lathe(0, 0, 0, [[1.78, 0.42], [0, 0.42]], 40, S.water, { edges: [1, 0], cell: 0.5, uv: (p) => [p[0], p[2]] });
  b.lathe(0, 0, 0, [[0.28, 0.42], [0.22, 1.6], [0.0, 1.6]], 16, S.basin, { edges: [0, 1, 0], cell: 0.4 });
  b.lathe(0, 0, 0, [[0.2, 1.5], [0.8, 1.75], [0.85, 1.9], [0.7, 1.9], [0.0, 1.8]], 24, S.basin, { edges: [1, 0, 1, 1, 0], cell: 0.4 });
}

// cornice round the top of the well
function cornice(b) {
  for (let w = 0; w < 4; w++) {
    const f = inFrame(b, w);
    const q0 = W - 0.45;
    f.quad([-W, TOP - 0.8, q0], [W, TOP - 0.8, q0], [W, TOP, q0], [-W, TOP, q0], S.cornice, [1, 0, 1, 0], [0, 0, -1]);
    f.quad([-W, TOP - 0.8, q0], [W, TOP - 0.8, q0], [W, TOP - 0.8, W], [-W, TOP - 0.8, W], S.cornice, [1, 0, 1, 0], [0, -1, 0]);
    f.quad([-W, TOP, q0], [W + WT, TOP, q0], [W + WT, TOP, W + WT], [-W, TOP, W + WT], S.cope, [1, 0, 1, 0], [0, 1, 0]);
  }
}

export function buildTower() {
  const b = new Tess(0.55);
  const opens = [[], [], [], []];
  for (let s = 0; s < 2; s++) {
    for (let k = 0; k < LANDINGS; k++) {
      const c = (k + 2 * s) % 4;
      const h = RISE * k;
      landing(b, c, h);
      // a door from each landing, in the wall its flight leaves along
      opens[c].push({ t: [-7.7, -6.3], y: [h, h + 2.45], r: 0.7, kind: 'door' });
      if (k < LANDINGS - 1) {
        flight(b, c, h);
        // a window above the middle of each flight
        opens[c].push({ t: [-0.65, 0.65], y: [h + 3.7, h + 6.0], r: 0.65, kind: 'window' });
      }
    }
  }
  for (let w = 0; w < 4; w++) wall(b, w, opens[w]);
  floor(b);
  cornice(b);
  return b.build();
}

// A point on a stair's walking line: stair s (0 or 1), distance u along it
// (in flights, may be fractional), lane offset from the inner edge.
export function stairPoint(s, u, lane = 1.5) {
  const k = Math.floor(u), f = u - k;
  const c = (k + 2 * s) % 4;
  const h0 = RISE * k;
  // the flight runs t from -A to A; the corner landing occupies t in [-W, -A]
  const t = -A + f * 2 * A;
  const tr = (2 * A) / NSTEP, rr = RISE / NSTEP;
  const i = Math.min(NSTEP - 1, Math.max(0, Math.floor((t + A) / tr)));
  const y = h0 + (i + 1) * rr;
  const p = MAP[c](t, y, A + PT + lane);
  const dir = MAP[c](1, 0, 0);
  return { p, dir, y, smoothY: h0 + f * RISE };
}
