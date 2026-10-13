// Geometry of the hall. Everything is built once in canonical coordinates
// and emitted three times, under the three cyclic permutations of the axes.
//
// Only faces whose outward normal is +x, +y or +z are ever seen from the
// (1,1,1) direction, and every one of them is a floor in exactly one world.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { FLAG, VOID } from './ink.js';
import {
  L, T, Q0, Q1, STEP, NSTEP, STAIR, BLOCKS, GARDEN, allDoors, permMatrix,
} from './data.js';

const ALL = allDoors();
const EPS = 1e-6;

export const STYLE = {
  flag: st(0xd6ccb8, FLAG),
  plaster: st(0xd3c8b2, PAT.PLASTER),
  stone: st(0xcbbfa7, PAT.ASHLAR),
  stair: st(0xd0c5ae, PAT.PLASTER),
  cornice: st(0xbfb39b, PAT.PLAIN),
  void: st(0x1f1c19, VOID, { w: 1 }),
  poche: st(0x3a342d, PAT.PLAIN, { w: 1 }),
  grass: st(0x8f9a69, PAT.GRASS, { w: 1 }),
  gravel: st(0xc9bfa6, PAT.COBBLE, { w: 1 }),
  hedge: st(0x5f7046, PAT.FOLIAGE, { w: 1 }),
  bark: st(0x5b4a3b, PAT.PLAIN, { w: 1 }),
  leaf: st(0x6f7f4c, PAT.FOLIAGE, { w: 1 }),
  flower: st(0xc98d6c, PAT.PLAIN, { w: 1 }),
  soil: st(0x7d6a52, PAT.GRASS, { w: 1 }),
  basin: st(0xcfc5b0, PAT.PLAIN, { w: 1 }),
  roof: st(0x8f6f5c, PAT.PLAIN),
  jamb: st(0x9a8f7c, PAT.PLASTER),
};

// ------------------------------------------------------------ small helpers
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

// A quad whose winding is fixed up to face `nrm`. edges = [ab, bc, cd, da].
function quadN(b, p0, p1, p2, p3, nrm, s, edges = [1, 1, 1, 1]) {
  const c = cross(sub(p1, p0), sub(p2, p0));
  if (dot(c, nrm) >= 0) b.quad(p0, p1, p2, p3, s, edges);
  else b.quad(p0, p3, p2, p1, s, [edges[3], edges[2], edges[1], edges[0]]);
}
function triN(b, p0, p1, p2, nrm, s, real = [1, 1, 1]) {
  const c = cross(sub(p1, p0), sub(p2, p0));
  if (dot(c, nrm) >= 0) b.tri(p0, p1, p2, s, real);
  else b.tri(p0, p2, p1, s, [real[0], real[2], real[1]]);
}
function axisVec(i, s = 1) { const v = [0, 0, 0]; v[i] = s; return v; }

// point on the plane (axis n = c) with in-plane coordinates (axis A = a, axis B = b)
function P(n, c, A, a, B, bb, depth = 0) {
  const p = [0, 0, 0];
  p[n] = c - depth; p[A] = a; p[B] = bb;
  return p;
}

// ------------------------------------------------------------ faces with doors
// The face of a solid on the plane (axis n) = c, outward normal +n, covering
// [ra] x [rb] on the other two axes (A = n+1, B = n+2). Openings from the
// global list that lie on it are cut out, with reveals and a dark back.
export function face(b, n, c, ra, rb, s, o = {}) {
  const A = (n + 1) % 3, B = (n + 2) % 3;
  const nrm = axisVec(n);
  const holes = (o.noHoles ? [] : ALL).filter((d) => d.n === n && Math.abs(d.c - c) < EPS).map((d) => {
    const upA = d.up === A;
    const r = d.r || 0;
    const ext = [d.upR[0], d.upR[1] + r];
    const hole = upA ? { a: d.upR, b: d.acR } : { a: d.acR, b: d.upR };
    const box = upA ? { a: ext, b: d.acR } : { a: d.acR, b: ext };
    const arch = r > 0 ? (upA ? { a: [d.upR[1], ext[1]], b: d.acR } : { a: d.acR, b: [d.upR[1], ext[1]] }) : null;
    return { d, hole, box, arch, upA };
  }).filter((h) => h.box.a[1] > ra[0] + EPS && h.box.a[0] < ra[1] - EPS && h.box.b[1] > rb[0] + EPS && h.box.b[0] < rb[1] - EPS);

  // grid
  const xs = new Set([ra[0], ra[1]]), ys = new Set([rb[0], rb[1]]);
  for (const h of holes) {
    for (const v of [h.box.a[0], h.box.a[1], h.hole.a[0], h.hole.a[1]]) if (v > ra[0] && v < ra[1]) xs.add(v);
    for (const v of [h.box.b[0], h.box.b[1], h.hole.b[0], h.hole.b[1]]) if (v > rb[0] && v < rb[1]) ys.add(v);
  }
  const X = [...xs].sort((p, q) => p - q), Y = [...ys].sort((p, q) => p - q);
  const inside = (r, a, bb) => a > r.a[0] - EPS && a < r.a[1] + EPS && bb > r.b[0] - EPS && bb < r.b[1] + EPS;
  const kind = (i, j) => {
    if (i < 0 || j < 0 || i >= X.length - 1 || j >= Y.length - 1) return 'out';
    const ma = (X[i] + X[i + 1]) / 2, mb = (Y[j] + Y[j + 1]) / 2;
    for (const h of holes) {
      if (inside(h.hole, ma, mb)) return 'hole';
      if (h.arch && inside(h.arch, ma, mb)) return 'arch';
    }
    return 'solid';
  };
  for (let i = 0; i < X.length - 1; i++) {
    for (let j = 0; j < Y.length - 1; j++) {
      if (kind(i, j) !== 'solid') continue;
      const real = (k) => (k === 'out' || k === 'hole' ? 1 : 0);
      const e = [real(kind(i, j - 1)), real(kind(i + 1, j)), real(kind(i, j + 1)), real(kind(i - 1, j))];
      quadN(b,
        P(n, c, A, X[i], B, Y[j]), P(n, c, A, X[i + 1], B, Y[j]),
        P(n, c, A, X[i + 1], B, Y[j + 1]), P(n, c, A, X[i], B, Y[j + 1]),
        nrm, s, e);
    }
  }

  for (const h of holes) opening(b, n, c, A, B, h, s, ra, rb);
}

// in-plane coordinates (A, B) of a point given as (across, up) for a door
function abOf(h, ac, up) { return h.upA ? [up, ac] : [ac, up]; }

function opening(b, n, c, A, B, h, s, ra, rb) {
  const d = h.d;
  const depth = d.depth;
  const r = d.r || 0;
  const [s0, s1] = d.acR;
  const [u0, u1] = d.upR;
  const upAx = d.up, acAx = d.ac;
  const pt = (ac, up, dep) => { const [a, bb] = abOf(h, ac, up); return P(n, c, A, a, B, bb, dep); };
  const reveal = d.through ? STYLE.jamb : STYLE.jamb;

  // spandrel above the springing line, cut by the arch
  if (r > 0) {
    const N = Math.max(8, Math.round(r * 9));
    const sc = (s0 + s1) / 2;
    const top = u1 + r;
    const curve = (k) => {
      const th = Math.PI * (1 - k / N);
      return [sc + r * Math.cos(th), u1 + r * Math.sin(th)];
    };
    const atEdge = (h.upA ? top >= ra[1] - EPS : top >= rb[1] - EPS);
    for (let k = 0; k < N; k++) {
      const [x0, y0] = curve(k), [x1, y1] = curve(k + 1);
      // spandrel strip from the curve to the top of the arch box
      const xa = k === 0 ? s0 : x0, xb = k === N - 1 ? s1 : x1;
      quadN(b, pt(xa, y0, 0), pt(xb, y1, 0), pt(xb, top, 0), pt(xa, top, 0), axisVec(n), s, [1, 0, atEdge ? 1 : 0, 0]);
      // soffit
      const mid = [(x0 + x1) / 2 - sc, (y0 + y1) / 2 - u1];
      const inward = [0, 0, 0];
      inward[acAx] = -mid[0]; inward[upAx] = -mid[1];
      quadN(b, pt(x0, y0, 0), pt(x1, y1, 0), pt(x1, y1, depth), pt(x0, y0, depth), inward, reveal, [1, 0, 1, 0]);
    }
  } else {
    quadN(b, pt(s0, u1, 0), pt(s1, u1, 0), pt(s1, u1, depth), pt(s0, u1, depth), axisVec(upAx, -1), reveal);
  }
  // jambs and sill
  quadN(b, pt(s0, u0, 0), pt(s0, u1, 0), pt(s0, u1, depth), pt(s0, u0, depth), axisVec(acAx, 1), reveal, [1, r > 0 ? 0 : 1, 1, 1]);
  quadN(b, pt(s1, u0, 0), pt(s1, u1, 0), pt(s1, u1, depth), pt(s1, u0, depth), axisVec(acAx, -1), reveal, [1, r > 0 ? 0 : 1, 1, 1]);
  quadN(b, pt(s0, u0, 0), pt(s1, u0, 0), pt(s1, u0, depth), pt(s0, u0, depth), axisVec(upAx, 1), reveal);
  // dark back
  if (!d.through) {
    const nb = axisVec(n);
    quadN(b, pt(s0, u0, depth), pt(s1, u0, depth), pt(s1, u1, depth), pt(s0, u1, depth), nb, STYLE.void, [0, 0, 0, 0]);
    if (r > 0) {
      const N = Math.max(8, Math.round(r * 9));
      const sc = (s0 + s1) / 2;
      for (let k = 0; k < N; k++) {
        const t0 = Math.PI * (1 - k / N), t1 = Math.PI * (1 - (k + 1) / N);
        triN(b, pt(sc, u1, depth), pt(sc + r * Math.cos(t0), u1 + r * Math.sin(t0), depth), pt(sc + r * Math.cos(t1), u1 + r * Math.sin(t1), depth), nb, STYLE.void, [0, 0, 0]);
      }
    }
  }
}

// An axis-aligned box: only its three positive faces are ever seen.
export function boxPos(b, bx, s, o = {}) {
  const [x0, y0, z0, x1, y1, z1] = bx;
  const mn = [x0, y0, z0], mx = [x1, y1, z1];
  for (let n = 0; n < 3; n++) {
    if (o.skip && o.skip.includes(n)) continue;
    const A = (n + 1) % 3, B = (n + 2) % 3;
    face(b, n, mx[n], [mn[A], mx[A]], [mn[B], mx[B]], o.top && n === 1 ? o.top : s);
  }
}

// ------------------------------------------------------------ the stair
// A slab with a stepped top, from (u, h) = foot going -u and +h, between
// v0 and v1. Treads face +h; risers face +u.
function stair(b) {
  const [fu, fh] = STAIR.foot;
  const { v0, v1, thick } = STAIR;
  const s = STYLE.stair;
  for (let i = 0; i < NSTEP; i++) {
    const ui = fu - i * STEP, hi = fh + i * STEP;
    const un = ui - STEP, hn = hi + STEP;
    // riser (+u) and tread (+h)
    quadN(b, [ui, hi, v0], [ui, hi, v1], [ui, hn, v1], [ui, hn, v0], [1, 0, 0], s);
    quadN(b, [ui, hn, v0], [ui, hn, v1], [un, hn, v1], [un, hn, v0], [0, 1, 0], s);
    // the lane line between the two worlds' lanes, as a faint joint
    // side of the slab (+v)
    quadN(b, [ui, hi - thick, v1], [un, hn - thick, v1], [un, hn, v1], [ui, hn, v1], [0, 0, 1], s, [1, 0, 1, i === 0 ? 1 : 0]);
  }
}

// ------------------------------------------------------------ the garden
function garden(b, k) {
  // garden frame: x = along the wall (canonical v), z = depth behind it (-u)
  b.push(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
  const [a0, a1] = GARDEN.arch;
  const d0 = T, d1 = 6.4;
  quadN(b, [a0 - 1 - d0, 0, d0], [a1 + 0.6 - d0, 0, d0], [a1 + 0.6 - d1, 0, d1], [a0 - 1 - d1, 0, d1], [0, 1, 0], STYLE.grass, [0, 0, 0, 0]);
  const [p0, p1] = GARDEN.path;
  quadN(b, [p0, 0.02, d0], [p1, 0.02, d0], [p1, 0.02, 5.2], [p0, 0.02, 5.2], [0, 1, 0], STYLE.gravel, [0, 1, 0, 1]);
  for (const [a, d, r] of GARDEN.shrubs) {
    if (!r) continue;
    b.cyl(a, 0, d, 0.07, r * 0.7, 6, STYLE.bark, {});
    b.blob(a, r * 1.25, d, r, r * 0.9, r, STYLE.leaf, { sub: 2, lump: 0.14, seed: a * 3.1 });
  }
  const [ta, td] = GARDEN.tree;
  if (k === 0) {
    // a young round-headed tree
    b.cyl(ta, 0, td, 0.1, 2.8, 7, STYLE.bark, { r1: 0.06 });
    b.blob(ta, 3.2, td, 0.85, 0.8, 0.8, STYLE.leaf, { sub: 2, lump: 0.16, seed: 4.2 });
    b.blob(ta + 0.45, 2.6, td + 0.2, 0.55, 0.5, 0.55, STYLE.leaf, { sub: 2, lump: 0.16, seed: 7.7 });
  } else if (k === 1) {
    // a cypress
    b.cyl(ta, 0, td, 0.09, 0.5, 6, STYLE.bark, {});
    b.lathe(ta, 0, td, [[0.0, 0.4], [0.5, 0.9], [0.62, 1.8], [0.5, 2.9], [0.28, 3.7], [0.0, 4.2]], 10, STYLE.hedge, {});
  } else {
    // a stone basin with a jet
    b.lathe(ta, 0, td, [[0.95, 0], [0.95, 0.45], [0.8, 0.45], [0.8, 0.3], [0.0, 0.3]], 16, STYLE.basin, { edges: [1, 1, 1, 0, 0] });
    b.cyl(ta, 0.3, td, 0.1, 1.1, 8, STYLE.basin, {});
    b.blob(ta, 1.25, td, 0.22, 0.2, 0.22, STYLE.leaf, { sub: 1, lump: 0.1 });
  }
  // a bed of flowers along the left of the path
  b.box(p0 - 1.0, 0, 1.3, p0 - 0.15, 0.18, 5.0, STYLE.soil, {});
  for (let i = 0; i < 9; i++) {
    const d = 1.55 + i * 0.4, a = p0 - 0.55 + 0.22 * Math.sin(i * 2.3);
    b.blob(a, 0.36, d, 0.15, 0.12, 0.15, i % 3 ? STYLE.flower : STYLE.leaf, { sub: 1, lump: 0.08, seed: i });
  }
  b.pop();
}

// ------------------------------------------------------------ the room slab
function slab(b) {
  // inside face of this world's floor
  face(b, 1, 0, [0, L], [0, L], STYLE.flag);
  // the cut edges, drawn as solid section
  face(b, 0, L, [-T, 0], [0, L], STYLE.poche, { noHoles: true });
  face(b, 2, L, [-T, L], [-T, 0], STYLE.poche, { noHoles: true });
}

// The little door-house on the central block wears a different roof in
// each world, so that turning the print shows which world is which.
function kioskRoof(b, k) {
  const x0 = 7.05, x1 = Q1, z0 = Q0, z1 = 5.55, y = 12.75;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (k === 1) {
    const apex = [cx, y + 1.1, cz];
    const c = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
    for (let i = 0; i < 4; i++) triN(b, c[i], c[(i + 1) % 4], apex, [c[i][0] + c[(i + 1) % 4][0] - 2 * cx, 1, c[i][2] + c[(i + 1) % 4][2] - 2 * cz], STYLE.roof);
  } else if (k === 2) {
    b.lathe(cx, y, cz, [[0.72, 0], [0.72, 0.12], [0.62, 0.45], [0.4, 0.75], [0.0, 0.88]], 14, STYLE.roof, { edges: [1, 1, 0, 0, 0] });
    b.cyl(cx, y + 0.86, cz, 0.05, y + 1.25, 6, STYLE.cornice, {});
  }
}

// The canonical part of the building, as one Builder pass.
function canonical(b, k) {
  slab(b);
  // the block: its top face here; the other two faces come from the other copies
  face(b, 1, Q1, [Q0, Q1], [Q0, Q1], STYLE.stone);
  stair(b);
  for (const blk of BLOCKS) {
    const [u0, h0, v0, u1, h1, v1] = blk.box;
    boxPos(b, [u0, h0, v0, u1, h1, v1], STYLE[blk.style]);
  }
  garden(b, k);
  kioskRoof(b, k);
}

export function buildHall() {
  const b = new Builder();
  for (let k = 0; k < 3; k++) {
    b.push(new THREE.Matrix4().fromArray(permMatrix(k)));
    canonical(b, k);
    b.pop();
  }
  return b.build();
}
