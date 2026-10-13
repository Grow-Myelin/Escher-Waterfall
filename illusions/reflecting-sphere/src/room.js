// The study: an original room built from flat-shaded primitives with the
// Waterfall's Builder. Units are metres. The room is centred on the pedestal
// that carries the mirror sphere; x runs towards the window (east), z towards
// the desk (south), y up.
//
// Each wall is built in its own frame: x along the wall (left to right as you
// face it), y up, z out of the wall into the room. The meshes are grouped by
// wall so that the overview can cut away whichever walls face the camera.

import * as THREE from 'three';
import { Builder, st, M } from '../../../src/builder.js';

export const ROOM = { W: 5.6, D: 4.6, H: 2.9 };
export const SPHERE = { c: new THREE.Vector3(0, 1.38, 0), r: 0.18 };

export const PT = {
  PLAIN: 0, BOARDS: 4, PLASTER: 5, GRAIN: 6, CLOTH: 8, FOLIAGE: 9,
  PAPERW: 20, RUG: 21, SPINE: 22, LAND: 23, BLOCKS: 24, CHART: 25, BOTANY: 26,
  VIEW: 27, GLOW: 28, DIAL: 29, PAPER: 30, PANEL: 31, DOOR: 32, BRASS: 33,
};

const { W, D, H } = ROOM;
const DADO = 0.95; // top of the panelling

export const WALL_FRAMES = {
  N: { len: W, m: M.T(-W / 2, 0, -D / 2) },
  E: { len: D, m: M.chain(M.T(W / 2, 0, -D / 2), M.RY(-Math.PI / 2)) },
  S: { len: W, m: M.chain(M.T(W / 2, 0, D / 2), M.RY(Math.PI)) },
  W: { len: D, m: M.chain(M.T(-W / 2, 0, D / 2), M.RY(Math.PI / 2)) },
};

// ------------------------------------------------------------------ palette
const C = {
  paper: 0xb2b79e, panel: 0x8e6d4a, cap: 0x76573a, floor: 0xb89068, ceiling: 0xeee8d8, beam: 0x7d5d42,
  walnut: 0x7a5538, oak: 0xa07a50, paint: 0xe2dbc9, brass: 0xb59152, frameGilt: 0xa98744, frameBlack: 0x2c2724,
  curtain: 0xb08840, cushion: 0x5b6e5a, terracotta: 0xa45d3e, leaf: 0x55704a, mahogany: 0x5f2f22,
  glass: 0x2f6b4e, candle: 0xeee6d2, dark: 0x2a2420,
};
const BOOKS = [0x8e3a30, 0x3d5e4a, 0x3d4d6e, 0xb8924e, 0x80603f, 0x4d4440, 0xd2c096, 0x71808f, 0x9c6a48, 0x64404c, 0xaa9a70, 0x46605a];

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ helpers
const UV01 = (w = 1, h = 1) => ({ uv: [[0, 0], [w, 0], [w, h], [0, h]] });

// Quad facing +z in the current frame, from (x0, y0) to (x1, y1) at depth z.
function front(b, x0, y0, x1, y1, z, s, uv) {
  b.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], s, [1, 1, 1, 1], uv || {});
}

// A tapered rod between two points.
export function rod(b, p0, p1, r0, r1, s, seg = 8, caps = [false, false]) {
  const a = new THREE.Vector3(...p0), c = new THREE.Vector3(...p1);
  const d = c.clone().sub(a);
  const L = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  b.push(new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1)));
  b.cyl(0, 0, 0, r0, L, seg, s, { r1, caps, rim: [0, 0] });
  b.pop();
}

// A wall surface with rectangular openings: panelling below the dado,
// wallpaper above. Ink lines only along real edges.
function wallSurface(b, len, holes) {
  const xs = new Set([0, len]), ys = new Set([0, DADO, H]);
  for (const h of holes) { xs.add(h.x0); xs.add(h.x1); ys.add(h.y0); ys.add(h.y1); }
  const X = [...xs].sort((a, c) => a - c), Y = [...ys].sort((a, c) => a - c);
  const hole = (x, y) => holes.some((h) => x > h.x0 && x < h.x1 && y > h.y0 && y < h.y1);
  const low = st(C.panel, PT.PANEL), high = st(C.paper, PT.PAPERW);
  for (let i = 0; i < X.length - 1; i++) {
    for (let j = 0; j < Y.length - 1; j++) {
      const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
      if (hole(cx, cy)) continue;
      const e = [
        j === 0 || hole(cx, Y[j] - 1e-4),
        i === X.length - 2 || hole(X[i + 1] + 1e-4, cy),
        j === Y.length - 2 || hole(cx, Y[j + 1] + 1e-4),
        i === 0 || hole(X[i] - 1e-4, cy),
      ].map(Number);
      b.quad([X[i], Y[j], 0], [X[i + 1], Y[j], 0], [X[i + 1], Y[j + 1], 0], [X[i], Y[j + 1], 0], cy < DADO ? low : high, e);
    }
  }
  // dado rail, skirting and cornice, interrupted by the openings
  const segs = (y0, y1) => {
    const cuts = holes.filter((h) => h.y0 < y1 && h.y1 > y0).map((h) => [h.x0 - 0.08, h.x1 + 0.08]).sort((a, c) => a[0] - c[0]);
    const out = [];
    let x = 0;
    for (const [a, c] of cuts) { if (a > x) out.push([x, a]); x = Math.max(x, c); }
    if (x < len) out.push([x, len]);
    return out;
  };
  const cap = st(C.cap, PT.GRAIN);
  for (const [a, c] of segs(DADO - 0.03, DADO + 0.03)) b.box(a, DADO - 0.03, 0, c, DADO + 0.02, 0.035, cap, { bottom: true });
  for (const [a, c] of segs(0, 0.14)) b.box(a, 0, 0, c, 0.14, 0.022, cap);
  b.box(0, H - 0.09, 0, len, H, 0.075, st(C.ceiling, PT.PLASTER), { bottom: true });
  b.box(0, H - 0.13, 0, len, H - 0.09, 0.03, st(C.ceiling, PT.PLASTER), { bottom: true });
}

// The reveal round an opening, from the wall face back to depth -dz.
function reveal(b, h, dz, s) {
  b.quad([h.x0, h.y0, 0], [h.x0, h.y0, -dz], [h.x0, h.y1, -dz], [h.x0, h.y1, 0], s, [1, 1, 1, 1]);
  b.quad([h.x1, h.y0, -dz], [h.x1, h.y0, 0], [h.x1, h.y1, 0], [h.x1, h.y1, -dz], s, [1, 1, 1, 1]);
  b.quad([h.x0, h.y1, -dz], [h.x1, h.y1, -dz], [h.x1, h.y1, 0], [h.x0, h.y1, 0], s, [1, 1, 1, 1]);
  if (h.y0 > 0.01) b.quad([h.x0, h.y0, 0], [h.x1, h.y0, 0], [h.x1, h.y0, -dz], [h.x0, h.y0, -dz], s, [1, 1, 1, 1]);
}

function book(b, x, y, zf, w, h, d, col) {
  const s = st(col, PT.GRAIN);
  b.box(x, y, zf - d, x + w, y + h, zf, s, { skip: ['pz'], top: st(0xd9ceb2) });
  front(b, x, y, x + w, y + h, zf, st(col, PT.SPINE), UV01());
}

// Fill one shelf with books from x0 to x1.
function shelfOfBooks(b, x0, x1, y, maxH, zf, rng) {
  let x = x0 + 0.008;
  while (x < x1 - 0.03) {
    const r = rng();
    if (r < 0.05) { x += 0.03 + rng() * 0.07; continue; }
    if (r < 0.1 && x1 - x > 0.3) {
      // a stack lying flat
      const w = 0.17 + rng() * 0.06;
      let yy = y;
      const n = 2 + Math.floor(rng() * 3);
      for (let k = 0; k < n && yy < y + maxH - 0.06; k++) {
        const th = 0.025 + rng() * 0.02;
        const col = BOOKS[Math.floor(rng() * BOOKS.length)];
        const dx = (rng() - 0.5) * 0.02;
        b.box(x + dx, yy, zf - 0.2, x + dx + w, yy + th, zf - 0.005, st(col, PT.GRAIN), { top: st(col, PT.GRAIN) });
        yy += th;
      }
      x += w + 0.01;
      continue;
    }
    const w = 0.022 + rng() * 0.036;
    const h = Math.min(maxH - 0.012, 0.17 + rng() * 0.13);
    const d = 0.14 + rng() * 0.08;
    book(b, x, y, zf - 0.004 - rng() * 0.018, w, h, d, BOOKS[Math.floor(rng() * BOOKS.length)]);
    x += w + (rng() < 0.12 ? 0.004 : 0.0006);
  }
}

function bookcase(b, x0, x1, h, depth, shelves, rng) {
  const wood = st(C.walnut, PT.GRAIN);
  const t = 0.028;
  b.box(x0, 0, 0, x0 + t, h, depth, wood, { bottom: true });
  b.box(x1 - t, 0, 0, x1, h, depth, wood, { bottom: true });
  b.box(x0 - 0.025, h, 0, x1 + 0.025, h + 0.045, depth + 0.03, wood, { bottom: true });
  b.box(x0 + t, 0, 0.012, x1 - t, 0.1, depth, wood);
  front(b, x0 + t, 0.1, x1 - t, h, 0.006, st(0x5e412b, PT.GRAIN));
  const y0 = 0.1, step = (h - y0) / shelves;
  for (let i = 0; i < shelves; i++) {
    const y = y0 + i * step;
    if (i > 0) b.box(x0 + t, y - 0.022, 0, x1 - t, y, depth - 0.008, wood, { bottom: true });
    shelfOfBooks(b, x0 + t, x1 - t, y, step - 0.03, depth - 0.02, rng);
  }
}

function picture(b, x0, y0, w, h, pat, frameCol, f = 0.045) {
  const fr = st(frameCol, PT.GRAIN);
  const z = 0.035;
  b.box(x0 - f, y0 - f, 0, x0 + w + f, y0, z, fr, { bottom: true });
  b.box(x0 - f, y0 + h, 0, x0 + w + f, y0 + h + f, z, fr, { bottom: true });
  b.box(x0 - f, y0, 0, x0, y0 + h, z, fr);
  b.box(x0 + w, y0, 0, x0 + w + f, y0 + h, z, fr);
  // a thin mount inside the frame
  front(b, x0, y0, x0 + w, y0 + h, 0.014, st(0xe6dfcc));
  const m = Math.min(w, h) * 0.07;
  front(b, x0 + m, y0 + m, x0 + w - m, y0 + h - m, 0.016, st(0xffffff, pat), UV01((w - 2 * m) / (h - 2 * m), 1));
}

// ------------------------------------------------------------------ walls
function northWall(b, rng, out) {
  const door = { x0: 4.35, x1: 5.25, y0: 0, y1: 2.1 };
  wallSurface(b, W, [door]);
  bookcase(b, 0.25, 1.95, 2.32, 0.36, 6, rng);
  bookcase(b, 2.0, 3.7, 2.32, 0.36, 6, rng);
  out.boxes.push([0.2, 0, 0, 3.75, 2.37, 0.39]);
  picture(b, 3.86, 1.42, 0.36, 0.46, PT.BOTANY, C.frameBlack, 0.03);
  // door: architrave, reveal and a four-panel leaf
  const arch = st(C.paint, PT.GRAIN);
  b.box(door.x0 - 0.08, 0, 0, door.x0, door.y1 + 0.08, 0.03, arch);
  b.box(door.x1, 0, 0, door.x1 + 0.08, door.y1 + 0.08, 0.03, arch);
  b.box(door.x0 - 0.08, door.y1, 0, door.x1 + 0.08, door.y1 + 0.08, 0.03, arch, { bottom: true });
  reveal(b, door, 0.07, st(C.paint));
  front(b, door.x0, 0, door.x1, door.y1, -0.07, st(C.oak, PT.DOOR), UV01(0.9, 2.1));
  b.blob(door.x1 - 0.1, 1.0, -0.03, 0.028, 0.028, 0.028, st(C.brass, PT.BRASS), { sub: 2, lump: 0 });
  b.box(door.x1 - 0.13, 0.94, -0.07, door.x1 - 0.07, 1.06, -0.062, st(C.brass, PT.BRASS));
}

function eastWall(b, rng, out, view) {
  const win = { x0: 1.45, x1: 3.15, y0: 0.9, y1: 2.4 };
  wallSurface(b, D, [win]);
  const paint = st(C.paint, PT.GRAIN);
  reveal(b, win, 0.25, st(C.paint, PT.PLASTER));
  b.box(win.x0 - 0.07, win.y0 - 0.045, -0.25, win.x1 + 0.07, win.y0, 0.06, paint, { bottom: true });
  // frame, sashes and glazing bars
  const z0 = -0.17, z1 = -0.12;
  b.box(win.x0, win.y0, z0, win.x0 + 0.06, win.y1, z1, paint);
  b.box(win.x1 - 0.06, win.y0, z0, win.x1, win.y1, z1, paint);
  b.box(win.x0, win.y1 - 0.06, z0, win.x1, win.y1, z1, paint, { bottom: true });
  b.box(win.x0, win.y0, z0, win.x1, win.y0 + 0.07, z1, paint);
  const midY = (win.y0 + win.y1) / 2;
  b.box(win.x0, midY - 0.03, z0 - 0.02, win.x1, midY + 0.03, z1 - 0.02, paint, { bottom: true });
  const ix0 = win.x0 + 0.06, ix1 = win.x1 - 0.06;
  for (let k = 1; k < 3; k++) {
    const x = ix0 + ((ix1 - ix0) * k) / 3;
    b.box(x - 0.011, win.y0, z0 + 0.01, x + 0.011, win.y1, z1 - 0.01, paint);
  }
  for (const y of [(win.y0 + midY) / 2, (midY + win.y1) / 2]) {
    b.box(ix0, y - 0.011, z0 + 0.01, ix1, y + 0.011, z1 - 0.01, paint, { bottom: true });
  }
  // the world outside (its own mesh: hidden in the overview)
  view.quad([-2.0, -0.6, -0.9], [D + 2.0, -0.6, -0.9], [D + 2.0, 3.2, -0.9], [-2.0, 3.2, -0.9], st(0xffffff, PT.VIEW), [0, 0, 0, 0]);
  // curtains: pleated, either side, on a brass rod
  const cur = st(C.curtain, PT.CLOTH);
  const pleat = (x0, x1) => {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const xa = x0 + ((x1 - x0) * i) / n, xb = x0 + ((x1 - x0) * (i + 1)) / n;
      const za = i % 2 ? 0.16 : 0.07, zb = i % 2 ? 0.07 : 0.16;
      b.quad([xa, 0.12, za], [xb, 0.12, zb], [xb, 2.6, zb], [xa, 2.6, za], cur, [1, 0, 1, 0]);
    }
  };
  pleat(win.x0 - 0.5, win.x0 + 0.06);
  pleat(win.x1 - 0.06, win.x1 + 0.5);
  rod(b, [win.x0 - 0.62, 2.64, 0.12], [win.x1 + 0.62, 2.64, 0.12], 0.016, 0.016, st(C.brass, PT.BRASS), 8, [true, true]);
  for (const x of [win.x0 - 0.62, win.x1 + 0.62]) b.blob(x, 2.64, 0.12, 0.03, 0.03, 0.03, st(C.brass, PT.BRASS), { sub: 1, lump: 0 });
  // window seat with a cushion
  b.box(win.x0 - 0.12, 0, 0, win.x1 + 0.12, 0.44, 0.48, st(C.paint, PT.PANEL));
  b.box(win.x0 - 0.08, 0.44, 0.03, win.x1 + 0.08, 0.53, 0.46, st(C.cushion, PT.CLOTH));
  b.blob(win.x0 + 0.25, 0.64, 0.14, 0.17, 0.13, 0.07, st(0x8a3b30, PT.CLOTH), { sub: 2, lump: 0.05 });
  out.boxes.push([win.x0 - 0.12, 0, 0, win.x1 + 0.12, 0.6, 0.48]);
  // a potted plant on the floor beside the seat
  const px = 3.85, pz = 0.32;
  b.lathe(px, 0, pz, [[0.11, 0], [0.13, 0.22], [0.145, 0.24], [0.145, 0.29], [0.125, 0.29]], 16, st(C.terracotta, PT.PLASTER), { edges: [1, 0, 1, 1, 1] });
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, rr = i === 0 ? 0 : 0.09 + 0.05 * rng();
    b.blob(px + Math.cos(a) * rr, 0.42 + 0.06 * i * rng() + (i === 0 ? 0.2 : 0), pz + Math.sin(a) * rr * 0.8, 0.13, 0.15, 0.12, st(C.leaf, PT.FOLIAGE), { sub: 2, lump: 0.25, seed: i * 3.1 });
  }
  out.boxes.push([px - 0.2, 0, pz - 0.2, px + 0.2, 0.75, pz + 0.2]);
  out.windowRect = win;
}

function southWall(b, rng, out) {
  wallSurface(b, W, []);
  const wood = st(C.walnut, PT.GRAIN);
  // desk
  const x0 = 2.85, x1 = 4.35, top = 0.76, dd = 0.74;
  b.box(x0 - 0.02, top - 0.035, 0, x1 + 0.02, top, dd, wood, { bottom: true });
  for (const [a, c] of [[x0, x0 + 0.42], [x1 - 0.42, x1]]) {
    b.box(a, 0.03, 0.02, c, top - 0.035, dd - 0.04, wood);
    for (let k = 0; k < 3; k++) {
      const y0 = 0.08 + k * 0.205, y1 = y0 + 0.19;
      b.box(a + 0.02, y0, dd - 0.04, c - 0.02, y1, dd - 0.025, st(0x6a4630, PT.GRAIN));
      b.box((a + c) / 2 - 0.04, (y0 + y1) / 2 - 0.008, dd - 0.025, (a + c) / 2 + 0.04, (y0 + y1) / 2 + 0.008, dd - 0.012, st(C.brass, PT.BRASS));
    }
  }
  b.box(x0 + 0.42, 0.42, 0.03, x1 - 0.42, top - 0.035, 0.06, wood, { bottom: true });
  b.box(x0 + 0.44, top - 0.13, dd - 0.06, x1 - 0.44, top - 0.035, dd - 0.03, st(0x6a4630, PT.GRAIN), { bottom: true });
  out.boxes.push([x0, 0, 0, x1, top, dd]);
  // on the desk: an open book, papers, an inkwell and pen, a few books, the lamp
  const xc = (x0 + x1) / 2;
  const pg = st(0xf0ead8, PT.PAPER);
  b.quad([xc - 0.31, top + 0.012, 0.52], [xc, top + 0.006, 0.52], [xc, top + 0.006, 0.24], [xc - 0.31, top + 0.012, 0.24], pg, [1, 1, 1, 1], UV01(0.31, 0.28));
  b.quad([xc, top + 0.006, 0.52], [xc + 0.31, top + 0.012, 0.52], [xc + 0.31, top + 0.012, 0.24], [xc, top + 0.006, 0.24], pg, [1, 1, 1, 1], UV01(0.31, 0.28));
  b.box(xc - 0.33, top, 0.23, xc + 0.33, top + 0.006, 0.53, st(0x6b2e2a));
  b.box(x0 + 0.08, top, 0.3, x0 + 0.34, top + 0.012, 0.66, pg);
  b.cyl(x0 + 0.48, top, 0.16, 0.032, top + 0.05, 10, st(C.dark));
  b.cyl(x0 + 0.48, top + 0.05, 0.16, 0.012, top + 0.07, 8, st(C.brass, PT.BRASS));
  rod(b, [x0 + 0.43, top + 0.006, 0.36], [x0 + 0.58, top + 0.012, 0.47], 0.004, 0.004, st(C.dark), 6);
  let yy = top;
  for (let k = 0; k < 3; k++) {
    const th = 0.03 + 0.012 * k;
    b.box(x0 + 0.06 - k * 0.01, yy, 0.05, x0 + 0.33 + k * 0.012, yy + th, 0.24, st(BOOKS[(k * 5 + 2) % BOOKS.length], PT.GRAIN));
    yy += th;
  }
  // student lamp: brass column and a green glass shade with its bulb
  const lx = x1 - 0.22, lz = 0.3;
  const brass = st(C.brass, PT.BRASS);
  b.lathe(lx, top, lz, [[0.1, 0], [0.1, 0.015], [0.075, 0.03], [0.022, 0.055], [0.014, 0.06]], 20, brass, { edges: [1, 1, 0, 0, 0] });
  b.cyl(lx, top + 0.055, lz, 0.011, top + 0.42, 10, brass, { caps: [false, false] });
  b.lathe(lx, top, lz, [[0.165, 0.37], [0.15, 0.39], [0.06, 0.5], [0.035, 0.52]], 28, st(C.glass), { edges: [1, 0, 0, 1] });
  b.lathe(lx, top, lz, [[0.035, 0.515], [0.06, 0.495], [0.15, 0.385], [0.162, 0.37]], 28, st(0xffffff, PT.GLOW));
  b.blob(lx, top + 0.405, lz, 0.034, 0.042, 0.034, st(0xffffff, PT.GLOW), { sub: 2, lump: 0 });
  out.lamp = [lx, top + 0.4, lz];
  // the chair, pulled out a little
  b.push(M.chain(M.T(xc + 0.12, 0, dd + 0.32), M.RY(0.3)));
  const cs = st(0x553624, PT.GRAIN);
  b.box(-0.22, 0.43, -0.21, 0.22, 0.47, 0.21, cs, { bottom: true });
  for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) b.cyl(x, 0, z, 0.017, 0.43, 8, cs, { caps: [false, false] });
  for (const x of [-0.19, 0.19]) b.cyl(x, 0.47, 0.18, 0.018, 0.93, 8, cs, { caps: [false, true] });
  b.box(-0.21, 0.86, 0.165, 0.21, 0.94, 0.2, cs, { bottom: true });
  for (let k = -1; k <= 1; k++) b.cyl(k * 0.09, 0.47, 0.182, 0.009, 0.86, 6, cs, { caps: [false, false] });
  b.pop();
  out.boxes.push([xc - 0.15, 0, dd + 0.05, xc + 0.42, 0.95, dd + 0.6]);
  // pictures above the desk
  picture(b, 2.98, 1.42, 0.58, 0.44, PT.LAND, C.frameGilt);
  picture(b, 3.76, 1.32, 0.42, 0.6, PT.BOTANY, C.frameBlack, 0.035);
  // sideboard with candlesticks and a bowl, and the tumbling blocks above
  const s0 = 0.55, s1 = 1.95, sh = 0.86, sd = 0.46;
  b.box(s0, 0.08, 0.02, s1, sh - 0.03, sd - 0.02, st(0x6a4630, PT.GRAIN));
  b.box(s0 - 0.02, sh - 0.03, 0, s1 + 0.02, sh, sd, wood, { bottom: true });
  for (const x of [s0 + 0.04, s1 - 0.04]) b.cyl(x, 0, sd - 0.06, 0.02, 0.08, 8, wood, { caps: [false, false] });
  const dw = (s1 - s0 - 0.08) / 3;
  for (let k = 0; k < 3; k++) {
    const a = s0 + 0.04 + k * dw;
    b.box(a + 0.01, 0.12, sd - 0.02, a + dw - 0.01, sh - 0.07, sd - 0.005, st(0x6a4630, PT.PANEL));
    b.blob(a + dw / 2, sh - 0.2, sd + 0.005, 0.012, 0.012, 0.012, brass, { sub: 1, lump: 0 });
  }
  for (const x of [s0 + 0.2, s1 - 0.2]) {
    b.lathe(x, sh, 0.24, [[0.055, 0], [0.05, 0.015], [0.018, 0.04], [0.012, 0.2], [0.03, 0.22], [0.02, 0.23]], 14, brass, { edges: [1, 0, 0, 0, 1, 1] });
    b.cyl(x, sh + 0.23, 0.24, 0.011, sh + 0.38, 8, st(C.candle));
  }
  b.lathe((s0 + s1) / 2, sh, 0.24, [[0.05, 0], [0.11, 0.05], [0.14, 0.09], [0.135, 0.095]], 20, st(0x3f5f6c), { edges: [1, 0, 1, 1] });
  for (let k = 0; k < 3; k++) b.blob((s0 + s1) / 2 + (k - 1) * 0.06, sh + 0.09, 0.24 + (k % 2) * 0.03, 0.04, 0.04, 0.04, st([0xb8743a, 0xa8913a, 0x9a3a2a][k]), { sub: 2, lump: 0.02 });
  picture(b, 0.78, 1.25, 0.94, 0.78, PT.BLOCKS, C.frameGilt, 0.05);
  out.boxes.push([s0, 0, 0, s1, sh + 0.35, sd]);
}

function westWall(b, rng, out) {
  wallSurface(b, D, []);
  // a long-case clock; the pendulum is a separate, animated mesh
  const x0 = 0.9, x1 = 1.4;
  const mah = st(C.mahogany, PT.GRAIN);
  b.box(x0 - 0.02, 0, 0, x1 + 0.02, 0.32, 0.28, mah);
  b.box(x0 + 0.03, 0.32, 0.02, x1 - 0.03, 1.45, 0.25, mah, { skip: ['pz'] });
  const o = { x0: x0 + 0.1, x1: x1 - 0.1, y0: 0.45, y1: 1.33 };
  b.box(x0 + 0.03, 0.32, 0.25, o.x0, 1.45, 0.27, mah);
  b.box(o.x1, 0.32, 0.25, x1 - 0.03, 1.45, 0.27, mah);
  b.box(o.x0, 0.32, 0.25, o.x1, o.y0, 0.27, mah);
  b.box(o.x0, o.y1, 0.25, o.x1, 1.45, 0.27, mah, { bottom: true });
  front(b, o.x0, o.y0, o.x1, o.y1, 0.06, st(0x2e1d16, PT.GRAIN));
  b.quad([o.x0, o.y0, 0.27], [o.x0, o.y0, 0.06], [o.x0, o.y1, 0.06], [o.x0, o.y1, 0.27], st(0x3a241a), [1, 1, 1, 1]);
  b.quad([o.x1, o.y0, 0.06], [o.x1, o.y0, 0.27], [o.x1, o.y1, 0.27], [o.x1, o.y1, 0.06], st(0x3a241a), [1, 1, 1, 1]);
  b.quad([o.x0, o.y1, 0.06], [o.x1, o.y1, 0.06], [o.x1, o.y1, 0.27], [o.x0, o.y1, 0.27], st(0x3a241a), [1, 1, 1, 1]);
  b.quad([o.x0, o.y0, 0.27], [o.x1, o.y0, 0.27], [o.x1, o.y0, 0.06], [o.x0, o.y0, 0.06], st(0x3a241a), [1, 1, 1, 1]);
  b.box(x0 - 0.02, 1.45, 0, x1 + 0.02, 1.98, 0.29, mah, { bottom: true });
  front(b, x0 + 0.06, 1.53, x1 - 0.06, 1.91, 0.292, st(0xffffff, PT.DIAL), UV01());
  b.box(x0 - 0.05, 1.98, 0, x1 + 0.05, 2.04, 0.32, mah, { bottom: true });
  b.blob((x0 + x1) / 2, 2.1, 0.16, 0.04, 0.06, 0.04, st(C.brass, PT.BRASS), { sub: 2, lump: 0 });
  out.boxes.push([x0 - 0.05, 0, 0, x1 + 0.05, 2.1, 0.32]);
  out.pendulum = { pivot: [(x0 + x1) / 2, 1.42, 0.14] };
  // a low bookcase with a chart above it
  bookcase(b, 2.35, 4.2, 1.04, 0.34, 3, rng);
  out.boxes.push([2.3, 0, 0, 4.25, 1.09, 0.37]);
  b.lathe(2.75, 1.085, 0.17, [[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.035, 0.24], [0.045, 0.25]], 16, st(C.terracotta, PT.PLASTER), { edges: [1, 0, 0, 0, 0, 1] });
  for (let k = 0; k < 4; k++) rod(b, [2.75, 1.32, 0.17], [2.75 + (k - 1.5) * 0.09, 1.62 + 0.06 * (k % 2), 0.17 + (k % 2 ? 0.05 : -0.04)], 0.004, 0.002, st(0x4a3a2a), 5);
  picture(b, 2.85, 1.36, 1.2, 0.78, PT.CHART, C.frameBlack, 0.04);
}

function pendulumMesh() {
  const b = new Builder();
  const brass = st(C.brass, PT.BRASS);
  b.box(-0.006, -0.72, -0.004, 0.006, 0, 0.004, st(0x3b3028), { bottom: true });
  b.push(M.chain(M.T(0, -0.74, 0), M.RX(Math.PI / 2)));
  b.cyl(0, -0.012, 0, 0.065, 0.012, 24, brass);
  b.pop();
  return b.build();
}

// ------------------------------------------------------------------ build
// Returns { groups: {N,E,S,W,ceiling,core}, view, pendulum, lamp, boxes }.
export function buildRoom() {
  const rng = rngFrom(1935);
  const out = { boxes: [] };
  const groups = {};
  const view = new Builder();
  const builders = { N: northWall, E: eastWall, S: southWall, W: westWall };
  const worldBoxes = [];
  for (const k of Object.keys(builders)) {
    const b = new Builder();
    const f = WALL_FRAMES[k];
    b.push(f.m);
    view.push(f.m);
    const local = { boxes: [] };
    builders[k](b, rng, local, view);
    view.pop();
    b.pop();
    groups[k] = b.build();
    for (const bx of local.boxes) {
      const a = new THREE.Vector3(bx[0], bx[1], bx[2]).applyMatrix4(f.m);
      const c = new THREE.Vector3(bx[3], bx[4], bx[5]).applyMatrix4(f.m);
      worldBoxes.push(new THREE.Box3(a.clone().min(c), a.clone().max(c)));
    }
    if (local.lamp) out.lamp = new THREE.Vector3(...local.lamp).applyMatrix4(f.m);
    if (local.pendulum) {
      out.pendulum = {
        position: new THREE.Vector3(...local.pendulum.pivot).applyMatrix4(f.m),
        rotationY: k === 'W' ? Math.PI / 2 : 0,
      };
    }
  }
  // ceiling and beams
  {
    const b = new Builder();
    b.quad([-W / 2, H, -D / 2], [W / 2, H, -D / 2], [W / 2, H, D / 2], [-W / 2, H, D / 2], st(C.ceiling, PT.PLASTER), [1, 1, 1, 1]);
    for (const x of [-1.45, 1.45]) b.box(x - 0.09, H - 0.2, -D / 2, x + 0.09, H, D / 2, st(C.beam, PT.GRAIN), { bottom: true });
    groups.ceiling = b.build();
  }
  // floor, rug and the pedestal
  {
    const b = new Builder();
    b.quad([-W / 2, 0, D / 2], [W / 2, 0, D / 2], [W / 2, 0, -D / 2], [-W / 2, 0, -D / 2], st(C.floor, PT.BOARDS), [1, 1, 1, 1]);
    b.quad([-1.3, 0.006, 0.95], [1.3, 0.006, 0.95], [1.3, 0.006, -0.95], [-1.3, 0.006, -0.95], st(0xffffff, PT.RUG), [1, 1, 1, 1], UV01(2.6, 1.9));
    const wal = st(0x8a6646);
    const brass = st(C.brass, PT.BRASS);
    b.box(-0.2, 0.006, -0.2, 0.2, 0.08, 0.2, wal);
    b.lathe(0, 0.08, 0, [[0.17, 0], [0.165, 0.025], [0.13, 0.045], [0.12, 0.07], [0.09, 0.1], [0.07, 0.2], [0.058, 0.5], [0.06, 0.8], [0.07, 0.88], [0.085, 0.9], [0.085, 0.93], [0.06, 0.96], [0.055, 1.02]], 28, wal,
      { edges: [1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0] });
    b.lathe(0, 0.08, 0, [[0.055, 1.02], [0.06, 1.04], [0.095, 1.06], [0.095, 1.085], [0.075, 1.1]], 28, brass, { edges: [1, 0, 1, 1, 0] });
    // the cup that holds the sphere, kept a few millimetres clear of it
    const cy = SPHERE.c.y, r = SPHERE.r + 0.004;
    // outer wall of the cup up to the rim, then the inside back down
    const rimY = cy + r * Math.sin(-Math.PI / 2 + 0.95);
    const rimR = r * Math.cos(-Math.PI / 2 + 0.95);
    b.lathe(0, 0, 0, [[0.075, 1.18], [0.1, 1.2], [rimR + 0.018, rimY - 0.01], [rimR + 0.012, rimY + 0.004]], 32, brass, { edges: [0, 0, 0, 1] });
    const inner = [[rimR + 0.012, rimY + 0.004]];
    for (let i = 8; i >= 0; i--) {
      const ang = -Math.PI / 2 + (i / 8) * 0.95;
      inner.push([Math.max(0.001, r * Math.cos(ang)), cy + r * Math.sin(ang)]);
    }
    b.lathe(0, 0, 0, inner, 32, brass, { edges: [1] });
    groups.core = b.build();
    worldBoxes.push(new THREE.Box3(new THREE.Vector3(-0.2, 0, -0.2), new THREE.Vector3(0.2, 1.25, 0.2)));
  }
  return { groups, view: view.build(), pendulum: pendulumMesh(), pendulumAt: out.pendulum, lamp: out.lamp, boxes: worldBoxes };
}
