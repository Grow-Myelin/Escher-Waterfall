// The hidden scene: an old cistern under the pavement.
//
// None of this exists in the plaza. It is rendered only from the eye point,
// and that render is pasted flat onto the paving as the chalk drawing.
//
// A ragged hole in the paving opens onto a stone shaft. A flight of steps runs
// down its left wall into dark water; an arch in the far wall leads into a
// vaulted hall; a broken column stands in the water and rises 0.8 m above the
// pavement. Units are metres, y is up, the eye looks towards −z.

import * as THREE from 'three';
import { PAT, st } from '../../../src/builder.js';

export const EYE = new THREE.Vector3(0, 1.65, 6.65);

export const SX = 1.6; // shaft half-width
export const ZN = 4.05; // near wall
export const ZF = -3.45; // far wall
export const YL = -0.45; // ledge under the broken paving
export const WATER = -2.7;
export const COLUMN = { x: -0.1, z: -1.3, r: 0.3, top: 0.82 };
// two flights: along the far wall (descending to the left), then down the left wall towards the eye
export const STAIR = { rise: 0.18, run1: 0.26, n1: 7, run2: 0.32, n2: 5, w1: 1.0, w2: 1.0, landing: 1.2 };
// a culvert under the landing, its tunnel running back under the far wall
// a culvert through the base of the upper flight, its tunnel running back under the far wall
export const CULVERT = { x: 0.82, r: 0.5, spring: WATER + 0.04, depth: 2.4 };
export const CULVERT_FACE = ZF + STAIR.w1; // the front of the upper flight
export const HALL = { n: [0, 0, -1], d: -CULVERT_FACE }; // darkness grows behind this plane


// deterministic random numbers
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The broken edge of the paving: a ragged loop just outside the shaft.
export function holePolygon() {
  const r = rng(7);
  const pts = [];
  const corners = [[-SX, ZN], [SX, ZN], [SX, ZF], [-SX, ZF]];
  for (let k = 0; k < 4; k++) {
    const a = corners[k], b = corners[(k + 1) % 4];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const out = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]; // outward normal for this winding
    const dir = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    // corner: chipped diagonally
    const co = 0.1 + r() * 0.22;
    pts.push([a[0] + (out[0] - dir[0]) * co * 0.7 + out[0] * 0.05, a[1] + (out[1] - dir[1]) * co * 0.7 + out[1] * 0.05]);
    let s = 0.25 + r() * 0.3;
    while (s < len - 0.3) {
      // pieces of broken flagstone: alternate small and larger bites
      const o = 0.04 + Math.pow(r(), 1.6) * 0.34;
      pts.push([a[0] + dir[0] * s + out[0] * o, a[1] + dir[1] * s + out[1] * o]);
      s += 0.22 + r() * 0.42;
    }
  }
  return pts;
}

// A vertical quad from p to q (in xz), y0..y1. It faces (−dz, dx), where
// (dx, dz) runs from p to q: for the hole polygon, traversed q→p, that is inward.
function vquad(b, p, q, y0, y1, s, edges = [1, 1, 1, 1]) {
  b.quad([p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]], s, edges);
}

const flag = st(0xc9c2b4, PAT.PLAIN);
const flagUnder = st(0xa49a88, PAT.PLAIN);
const bedding = st(0x8a7a62, PAT.SOIL);
const rubble = st(0x7d705d, PAT.SOIL);
const wallS = st(0xa79f90, PAT.ASHLAR);
const wallDark = st(0x8f887b, PAT.ASHLAR);
const tread = st(0xbab2a2, PAT.PLAIN);
const stairSide = st(0xa0988a, PAT.STONE);
const colS = st(0xd2cbbd, PAT.PLAIN);
const breakS = st(0xb5ad9e, PAT.SOIL);
const vault = st(0x7e776c, PAT.BRICK);

export function buildCistern(b, hole) {
  // ---- the broken edge: flagstone, then the bedding beneath it
  for (let i = 0; i < hole.length; i++) {
    const p = hole[i], q = hole[(i + 1) % hole.length];
    vquad(b, q, p, -0.14, 0, flag);
    vquad(b, q, p, YL, -0.14, bedding, [1, 0, 1, 0]);
  }
  // ---- the exposed ledge between the broken edge and the top of the walls
  {
    const contour = hole.map((p) => new THREE.Vector2(p[0], p[1]));
    const rect = [[-SX, ZN], [-SX, ZF], [SX, ZF], [SX, ZN]].map((p) => new THREE.Vector2(p[0], p[1]));
    const tris = THREE.ShapeUtils.triangulateShape(contour, [rect]);
    const all = contour.concat(rect);
    for (const [i, j, k] of tris) {
      let A = [all[i].x, YL, all[i].y], B = [all[j].x, YL, all[j].y], C = [all[k].x, YL, all[k].y];
      const cy = (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]);
      if (cy < 0) [B, C] = [C, B];
      b.tri(A, B, C, rubble, [0, 0, 0]);
    }
    // outline the inner lip of the ledge
    for (let k = 0; k < 4; k++) {
      const p = rect[k], q = rect[(k + 1) % 4];
      vquad(b, [p.x, p.y], [q.x, q.y], YL - 0.06, YL, rubble, [1, 0, 1, 0]); // rect runs the other way round
    }
  }
  // ---- shaft walls
  const top = YL - 0.06;
  b.box(-SX - 0.7, WATER, ZF - 0.7, -SX, top, ZN + 0.7, wallS, { skip: ['py'] });
  b.box(-SX - 0.7, WATER, ZF - 0.7, SX + 0.7, top, ZF, wallS, { skip: ['py'] });
  b.box(-SX - 0.7, WATER, ZN, SX + 0.7, top, ZN + 0.7, wallDark, { skip: ['py'] });
  b.box(SX, WATER, ZF - 0.7, SX + 0.7, top, ZN + 0.7, wallDark, { skip: ['py'] });

  // ---- the steps: a flight along the far wall, a landing, a flight down the left wall
  const S = STAIR;
  const stepSide = (i) => (i % 2 ? stairSide : st(0x9a9284, PAT.STONE));
  const XL = SX - S.run1 * S.n1;
  const y0 = CULVERT.spring + CULVERT.r + 0.22; // the steps sit on a base pierced by the culvert
  for (let i = 1; i <= S.n1; i++) {
    const xa = SX - S.run1 * i, xb = SX - S.run1 * (i - 1);
    const y = top - S.rise * i;
    b.box(xa, y0, ZF, xb + 0.001, y, ZF + S.w1, stepSide(i), { skip: ['nz', 'px', 'ny'], top: tread });
  }
  {
    const { x: cx, r, spring: ys, depth } = CULVERT;
    const zf = CULVERT_FACE;
    b.box(XL, WATER, ZF, cx - r, y0, zf, stairSide, { skip: ['nz', 'py', 'nx'] });
    b.box(cx + r, WATER, ZF, SX, y0, zf, stairSide, { skip: ['nz', 'py', 'px'] });
    const N = 10;
    const arc = (t) => [cx + Math.cos(t) * r, ys + Math.sin(t) * r];
    for (let i = 0; i < N; i++) {
      const t0 = (Math.PI * i) / N, t1 = (Math.PI * (i + 1)) / N;
      const p0 = arc(t0), p1 = arc(t1);
      b.quad([p0[0], p0[1], zf], [p0[0], y0, zf], [p1[0], y0, zf], [p1[0], p1[1], zf], stairSide, [0, 0, 0, 1]);
      b.quad([p1[0], p1[1], zf], [p1[0], p1[1], zf - depth], [p0[0], p0[1], zf - depth], [p0[0], p0[1], zf], wallDark, [0, 0, 0, 1]);
      // voussoirs, standing 2 cm proud of the face
      const k = 0.5;
      b.quad([p0[0], p0[1], zf + 0.02], [p0[0] + (p0[0] - cx) * k, p0[1] + (p0[1] - ys) * k, zf + 0.02],
        [p1[0] + (p1[0] - cx) * k, p1[1] + (p1[1] - ys) * k, zf + 0.02], [p1[0], p1[1], zf + 0.02], stairSide);
    }
    b.quad([cx - r, WATER, zf - depth], [cx - r, ys, zf - depth], [cx - r, ys, zf], [cx - r, WATER, zf], wallDark, [0, 0, 0, 0]);
    b.quad([cx + r, WATER, zf], [cx + r, ys, zf], [cx + r, ys, zf - depth], [cx + r, WATER, zf - depth], wallDark, [0, 0, 0, 0]);
    b.quad([cx + r, WATER, zf - depth], [cx + r, ys + r, zf - depth], [cx - r, ys + r, zf - depth], [cx - r, WATER, zf - depth], st(0x2a2826), [0, 0, 0, 0]);
  }
  const yLand = top - S.rise * (S.n1 + 1);
  b.box(-SX, WATER, ZF, XL + 0.001, yLand, ZF + S.landing, stairSide, { skip: ['nz', 'nx'], top: tread });
  for (let j = 1; j <= S.n2; j++) {
    const za = ZF + S.landing + S.run2 * (j - 1) - 0.001, zb = ZF + S.landing + S.run2 * j;
    const y = yLand - S.rise * j;
    b.box(-SX, WATER, za, -SX + S.w2, y, zb, stepSide(j), { skip: ['nx', 'nz'], top: tread });
  }
  // a few fallen paving stones
  b.push(new THREE.Matrix4().makeRotationY(0.4).setPosition(-1.0, yLand + 0.07, ZF + 0.6));
  b.box(-0.3, -0.07, -0.22, 0.3, 0.07, 0.22, flag);
  b.pop();
  b.push(new THREE.Matrix4().makeRotationY(-0.7).multiply(new THREE.Matrix4().makeRotationZ(0.3)).setPosition(-1.12, yLand - S.rise * 3 + 0.12, ZF + S.landing + S.run2 * 2.6));
  b.box(-0.22, -0.06, -0.18, 0.22, 0.06, 0.18, flag);
  b.pop();

  // ---- the broken column, in drums, its top snapped off above the paving
  buildColumn(b);
}

function buildColumn(b) {
  const { x, z, r, top } = COLUMN;
  const seg = 28;
  const drums = [WATER, -1.9, -1.05, -0.2, 0.45];
  const rnd = rng(31);
  // jagged break: heights around the top ring
  const hs = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    hs.push(top - 0.12 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2 + 0.6)) + (rnd() - 0.5) * 0.12);
  }
  // plinth in the water
  b.box(x - r * 1.35, WATER - 0.2, z - r * 1.35, x + r * 1.35, WATER + 0.18, z + r * 1.35, st(0xb1a998, PAT.ASHLAR));
  b.cyl(x, WATER + 0.18, z, r * 1.18, WATER + 0.3, seg, colS, { r1: r * 1.04, caps: [false, false] });
  for (let d = 0; d < drums.length; d++) {
    const y0 = d === 0 ? WATER + 0.3 : drums[d];
    const last = d === drums.length - 1;
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      // shallow flutes: the normal swings across each one
      const tm = (t0 + t1) / 2;
      const ya = y0;
      const yb0 = last ? hs[i] : drums[d + 1];
      const yb1 = last ? hs[(i + 1) % seg] : drums[d + 1];
      const nA = [Math.cos(tm - 0.25), 0, Math.sin(tm - 0.25)];
      const nB = [Math.cos(tm + 0.25), 0, Math.sin(tm + 0.25)];
      const sty = colS;
      b.quad([x + r * c0, ya, z + r * s0], [x + r * c0, yb0, z + r * s0], [x + r * c1, yb1, z + r * s1], [x + r * c1, ya, z + r * s1], sty,
        [0, last ? 1 : 1, 0, d === 0 ? 1 : 1], { n: [nA, nA, nB, nB], uv: [[t0 * r, ya], [t0 * r, yb0], [t1 * r, yb1], [t1 * r, ya]] });
      if (last) {
        // the rough fracture surface, dipping to the middle
        b.tri([x, top - 0.08, z], [x + r * c1, yb1, z + r * s1], [x + r * c0, yb0, z + r * s0], breakS, [0, 0, 0]);
      }
    }
  }
}

// The hidden scene, seen from below the water line: everything above the
// water, mirrored in it.
export function mirrorMatrix() {
  return new THREE.Matrix4().makeTranslation(0, 2 * WATER, 0).multiply(new THREE.Matrix4().makeScale(1, -1, 1));
}

// Points worth drawing sight lines through, for the "from above" view.
export function keyPoints() {
  const S = STAIR;
  const top = YL - 0.06;
  const yLand = top - S.rise * (S.n1 + 1);
  const XL = SX - S.run1 * S.n1;
  return [
    new THREE.Vector3(COLUMN.x, COLUMN.top + 0.02, COLUMN.z), // top of the column (above the paving)
    new THREE.Vector3(XL, yLand, ZF + S.landing), // corner of the landing
    new THREE.Vector3(CULVERT.x, CULVERT.spring + CULVERT.r, CULVERT_FACE), // crown of the culvert
    new THREE.Vector3(-SX + S.w2, yLand - S.rise * (S.n2 - 1), ZF + S.landing + S.run2 * S.n2), // the last dry step
  ];
}
