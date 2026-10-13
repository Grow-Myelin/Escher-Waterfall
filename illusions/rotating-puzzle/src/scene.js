// Geometry for the diorama, built with the Waterfall's Builder so every face
// carries the attributes the ink shader needs (outline distances, planar
// texture coordinates, pattern ids).
//
// Static pieces sit at their true 3D positions; nothing here is shifted. The
// impossible joins come only from where the pieces stand relative to the
// line of sight (see level.js).

import { Builder, PAT, st, M } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';
import { H, SLAB, BASE, STAIR, treadY } from './level.js';

const P = { ...PAT, FLAG: 7, CLOUD: 14 };

const C = {
  stone: 0xe4dbc7,
  stoneDark: 0xcdbfa4,
  walk: 0xf2ead9,
  brick: 0xd8b49a,
  accent: 0xbe8e6d, // the turning section
  accentTop: 0xe6cfae,
  roof: 0xb98a72,
  bronze: 0xa98744,
  iron: 0x4a4440,
  wood: 0x8b6a4f,
  leaf: 0xb4c99c,
  leafDark: 0x9db487,
  trunk: 0x6e5643,
  soil: 0x7a6650,
  slit: 0x3b3530,
  cloud: 0xffffff,
  flag: 0xb4553f,
};

const stone = st(C.stone, P.ASHLAR);
const stoneDark = st(C.stoneDark, P.ASHLAR);
const walk = st(C.walk, P.FLAG);

function v3sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function v3cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function v3dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

// triangle with its normal pointing away from `centre`
function triOut(b, a, c1, c2, centre, s, real = [1, 1, 1]) {
  const n = v3cross(v3sub(c1, a), v3sub(c2, a));
  const m = [(a[0] + c1[0] + c2[0]) / 3 - centre[0], (a[1] + c1[1] + c2[1]) / 3 - centre[1], (a[2] + c1[2] + c2[2]) / 3 - centre[2]];
  if (v3dot(n, m) < 0) b.tri(a, c2, c1, s, [real[0], real[2], real[1]]);
  else b.tri(a, c1, c2, s, real);
}

function pyramid(b, cx, y0, cz, hw, apexY, s) {
  const c = [[cx - hw, y0, cz - hw], [cx + hw, y0, cz - hw], [cx + hw, y0, cz + hw], [cx - hw, y0, cz + hw]];
  const apex = [cx, apexY, cz];
  const centre = [cx, y0 + (apexY - y0) * 0.3, cz];
  for (let i = 0; i < 4; i++) triOut(b, c[i], c[(i + 1) % 4], apex, centre, s);
}

// A pier: a square masonry shaft from the mist up to a walk surface, with a
// thin string course under the top and a few arrow slits on its front faces.
function pier(b, x0, z0, x1, z1, top, o = {}) {
  const side = o.side || stone;
  b.box(x0, BASE, z0, x1, top, z1, side, { top: o.walk === false ? side : walk });
  const cy = top - (o.course ?? 0.55);
  if (o.course !== null) b.box(x0 - 0.05, cy - 0.12, z0 - 0.05, x1 + 0.05, cy, z1 + 0.05, o.courseStyle || stoneDark, { skip: o.courseSkip || [] });
  for (const [x, y, z, face] of o.slits || []) slit(b, x, y, z, face);
}

// a dark arrow slit on an outward face (+x or +z)
function slit(b, x, y, z, face) {
  const s = st(C.slit, P.PLAIN);
  if (face === '+x') b.box(x, y, z - 0.05, x + 0.012, y + 0.36, z + 0.05, s, {});
  else b.box(x - 0.05, y, z, x + 0.05, y + 0.36, z + 0.012, s, {});
}

// ---------------------------------------------------------------- static
export function buildStatic() {
  const b = new Builder();

  // the pivot tower: a square shaft that stops just under the turning drum
  pier(b, -0.5, -0.5, 0.5, 0.5, H - 1, { walk: false, course: 0.18, slits: [[0.5, H - 3.1, 0, '+x'], [0, H - 3.1, 0.5, '+z'], [0.5, H - 5.6, 0, '+x'], [0, H - 5.6, 0.5, '+z']] });
  // a collar the drum turns in
  b.box(-0.56, H - 1.05, -0.56, 0.56, H - 1, 0.56, stoneDark, {});

  // landing A on its pier
  pier(b, 2.5, -0.5, 3.5, 0.5, H, { course: 0.62, slits: [[3.5, H - 2.6, 0, '+x'], [3.5, H - 5.0, 0, '+x']] });

  stairs(b);

  // start platform (two tiles) with a low parapet on its far edges
  pier(b, 2.5, 3.5, 4.5, 4.5, 0, { course: 0.5 });
  // a stone bench at the porch end
  b.box(4.15, 0, 3.62, 4.42, 0.2, 4.38, stoneDark, {});
  b.box(4.3, 0.2, 3.62, 4.42, 0.42, 4.38, stoneDark, {});

  // the bell tower: brick, two storeys of slits, belfry on top
  pier(b, 1.5, 4.5, 2.5, 5.5, 5, {
    side: st(C.brick, P.BRICK), course: 0.6, courseStyle: stoneDark,
    slits: [[2.5, 2.7, 5, '+x'], [2, 2.7, 5.5, '+z'], [2.5, 0.2, 5, '+x'], [2, 0.2, 5.5, '+z']],
  });
  belfry(b, 2, 5, 5);

  // the garden behind: a 2 x 2 terrace on a single column, with a small tree
  b.box(-3.5, 0.5, -6.5, -1.5, 1, -4.5, stone, { top: walk });
  b.box(-3.56, 0.36, -6.56, -1.44, 0.5, -4.44, stoneDark, {});
  b.box(-3.1, 0.06, -6.1, -1.9, 0.36, -4.9, stone, {});
  b.box(-2.82, -0.2, -5.82, -2.18, 0.06, -5.18, stoneDark, {});
  b.box(-2.75, BASE, -5.75, -2.25, -0.2, -5.25, stone, {});
  slit(b, -2.25, -1.1, -5.5, '+x');
  slit(b, -2.5, -1.1, -5.25, '+z');
  tree(b, -3, 1, -6);
  // a pot of flowers on the third tile's far corner
  b.box(-3.42, 1, -5.42, -3.18, 1.2, -5.18, stoneDark, {});
  inkedBlob(b, -3.3, 1.28, -5.3, 0.14, 0.11, 0.14, st(C.leaf, P.FOLIAGE, { w: 0.4 }), { sub: 2, seed: 3, lump: 0.16 }, 0.016);

  return b;
}

// Treads, risers and continuous side walls, so that the outlines mark the
// steps and not the joints between them.
function stairs(b) {
  const { x, z0, run, risers } = STAIR;
  const x0 = x - 0.5, x1 = x + 0.5;
  const tread = st(C.walk, P.PLAIN);
  for (let i = 0; i < risers; i++) {
    const za = z0 + (i / risers) * run, zb = z0 + ((i + 1) / risers) * run;
    const y = treadY((za + zb) / 2);
    const yn = i < risers - 1 ? treadY(zb + 0.01) : y;
    b.quad([x0, y, zb], [x1, y, zb], [x1, y, za], [x0, y, za], tread, [1, 1, 1, 1]);
    if (y > yn) b.quad([x0, yn, zb], [x1, yn, zb], [x1, y, zb], [x0, y, zb], stone, [1, 1, 1, 1]);
    // side wall on +x: the riser part (outlined) and the part below it
    if (y > yn) b.quad([x1, yn, zb], [x1, yn, za], [x1, y, za], [x1, y, zb], stone, [0, 0, 1, 1]);
    b.quad([x1, BASE, zb], [x1, BASE, za], [x1, yn, za], [x1, yn, zb], stone, [0, 0, 0, i === risers - 1 ? 1 : 0]);
    // and on −x, seen only when the camera swings round
    if (y > yn) b.quad([x0, yn, za], [x0, yn, zb], [x0, y, zb], [x0, y, za], stone, [0, 1, 1, 0]);
    b.quad([x0, BASE, za], [x0, BASE, zb], [x0, yn, zb], [x0, yn, za], stone, [0, i === risers - 1 ? 1 : 0, 0, 0]);
  }
}

// A bell gate: two posts on the ±x sides of the tile, a beam and a small
// gabled roof. The tile stays open along z, the way the traveller comes in,
// and nothing stands on the corner nearest the camera, which in isometric
// view would cover the middle of the tile.
function belfry(b, cx, y, cz0) {
  // set toward the near edge, so the far half of the tile, where the
  // traveller steps on, stays clear of the posts in the picture
  const cz = cz0 + 0.24;
  const post = st(C.stoneDark, P.ASHLAR);
  const h = 1.16, px = 0.45, pw = 0.06;
  for (const sx of [-1, 1]) {
    b.box(cx + sx * px - pw, y, cz - pw, cx + sx * px + pw, y + h, cz + pw, post, {});
    b.box(cx + sx * px - pw - 0.03, y, cz - pw - 0.03, cx + sx * px + pw + 0.03, y + 0.12, cz + pw + 0.03, stoneDark, {});
  }
  const by = y + h;
  b.box(cx - px - 0.12, by, cz - 0.075, cx + px + 0.12, by + 0.11, cz + 0.075, st(C.wood, P.WOOD), {});
  // gabled roof, ridge along x
  const ey = by + 0.11, ry = ey + 0.3, ez = 0.34, ex0 = cx - px - 0.2, ex1 = cx + px + 0.2;
  const roof = st(C.roof, P.TILE);
  const centre = [cx, ey + 0.1, cz];
  const A = [ex0, ey, cz - ez], B = [ex1, ey, cz - ez], Rr = [ex1, ry, cz], Rl = [ex0, ry, cz];
  const D = [ex0, ey, cz + ez], E = [ex1, ey, cz + ez];
  triOut(b, A, B, Rr, centre, roof, [1, 0, 1]);
  triOut(b, A, Rr, Rl, centre, roof, [1, 1, 0]);
  triOut(b, D, E, Rr, centre, roof, [1, 0, 1]);
  triOut(b, D, Rr, Rl, centre, roof, [1, 1, 0]);
  const gable = st(C.wood, P.WOOD);
  triOut(b, [ex0 + 0.04, ey, cz - ez + 0.04], [ex0 + 0.04, ey, cz + ez - 0.04], [ex0 + 0.04, ry - 0.04, cz], centre, gable);
  triOut(b, [ex1 - 0.04, ey, cz - ez + 0.04], [ex1 - 0.04, ey, cz + ez - 0.04], [ex1 - 0.04, ry - 0.04, cz], centre, gable);
  // finial and pennant
  b.cyl(cx, ry - 0.02, cz, 0.02, ry + 0.6, 6, st(C.iron, P.PLAIN), {});
  b.blob(cx, ry + 0.02, cz, 0.045, 0.045, 0.045, st(C.iron, P.PLAIN), { sub: 0 });
  const pen = st(C.flag, P.CLOTH, { w: 1 });
  const a = [cx, ry + 0.58, cz], c = [cx, ry + 0.38, cz], tip = [cx + 0.42, ry + 0.48, cz + 0.12];
  b.tri(a, c, tip, pen);
  b.tri(a, tip, c, pen);
}

function tree(b, x, y, z) {
  b.box(x - 0.38, y, z - 0.38, x + 0.38, y + 0.32, z + 0.38, stoneDark, {});
  b.box(x - 0.32, y + 0.32, z - 0.32, x + 0.32, y + 0.34, z + 0.32, st(C.soil, P.SOIL), {});
  const bark = st(C.trunk, P.WOOD);
  limb(b, [x, y + 0.32, z], [x + 0.03, y + 1.05, z - 0.02], 0.065, bark, { r1: 0.045 });
  limb(b, [x + 0.02, y + 0.8, z], [x + 0.28, y + 1.12, z + 0.06], 0.035, bark, { r1: 0.02 });
  limb(b, [x + 0.02, y + 0.9, z], [x - 0.22, y + 1.2, z - 0.1], 0.035, bark, { r1: 0.02 });
  const leaf = st(C.leaf, P.FOLIAGE, { w: 0.25 });
  const leafD = st(C.leafDark, P.FOLIAGE, { w: 0.25 });
  inkedBlob(b, x + 0.02, y + 1.38, z - 0.02, 0.42, 0.36, 0.42, leaf, { sub: 2, seed: 1.3, lump: 0.12 });
  inkedBlob(b, x + 0.3, y + 1.15, z + 0.1, 0.26, 0.22, 0.26, leafD, { sub: 2, seed: 4.1, lump: 0.14 });
  inkedBlob(b, x - 0.26, y + 1.22, z - 0.12, 0.25, 0.22, 0.25, leafD, { sub: 2, seed: 7.7, lump: 0.14 });
  inkedBlob(b, x + 0.05, y + 1.7, z, 0.24, 0.2, 0.24, leaf, { sub: 2, seed: 2.2, lump: 0.12 });
}

// A blob with an ink outline: a slightly larger copy, mirrored through its
// centre so its winding flips and only its far side is drawn, in flat ink.
export function inkedBlob(b, x, y, z, rx, ry, rz, s, o = {}, grow = 0.022) {
  b.blob(x, y, z, rx, ry, rz, s, o);
  b.push(M.chain(M.T(x, y, z), M.S(-1, 1, 1), M.T(-x, -y, -z)));
  b.blob(x, y, z, rx + grow, ry + grow, rz + grow, st(0x000000, 15, { w: s.w }), o);
  b.pop();
}

// ---------------------------------------------------------------- bridge
// The turning section in its own frame: hub at the origin's column, arm
// along +x. y values are world heights.
export function buildBridge() {
  const b = new Builder();
  const acc = st(C.accent, P.ASHLAR);
  const accTop = st(C.accentTop, P.FLAG);
  const iron = st(C.iron, P.PLAIN);
  const brass = st(C.bronze, P.PLAIN);

  // drum
  b.lathe(0, 0, 0, [[0.47, H - 1], [0.5, H - 0.96], [0.5, H - 0.6], [0.46, H - 0.56], [0.46, H - SLAB], [0, H - SLAB]], 24, acc, { edges: [1, 1, 1, 1, 1, 0] });
  // gear teeth round the foot of the drum
  for (let i = 0; i < 24; i++) {
    b.push(M.chain(M.RY((i / 24) * Math.PI * 2)));
    b.box(0.47, H - 1, -0.035, 0.545, H - 0.9, 0.035, st(C.iron, P.PLAIN), {});
    b.pop();
  }
  // deck: hub plus ARM tiles
  b.box(-0.5, H - SLAB, -0.5, 2.5, H, 0.5, acc, { top: accTop });
  // a darker fascia along the deck edges
  b.box(-0.52, H - SLAB, -0.52, 2.5, H - SLAB + 0.1, 0.52, st(0x8f6a52, P.PLAIN), { skip: ['px'] });
  // stepped corbels under the arm
  b.box(0.46, H - 0.92, -0.32, 0.86, H - SLAB, 0.32, acc, {});
  b.box(0.86, H - 0.7, -0.26, 1.3, H - SLAB, 0.26, acc, {});
  b.box(1.3, H - 0.54, -0.2, 1.7, H - SLAB, 0.2, acc, {});

  // the crank on the hub: boss, axle, spoked wheel and a handle
  b.cyl(0, H, 0, 0.17, H + 0.06, 14, iron, {});
  b.cyl(0, H + 0.06, 0, 0.05, H + 0.38, 8, iron, {});
  b.lathe(0, H + 0.28, 0, [[0.29, 0], [0.35, 0], [0.35, 0.055], [0.29, 0.055], [0.29, 0]], 28, brass, { edges: [1, 1, 1, 1, 1] });
  for (let i = 0; i < 4; i++) {
    b.push(M.RY((i / 4) * Math.PI * 2 + Math.PI / 4));
    b.box(0.04, H + 0.29, -0.022, 0.3, H + 0.325, 0.022, brass, {});
    b.pop();
  }
  // handle: points away from the arm (local −x)
  b.cyl(-0.32, H + 0.33, 0, 0.032, H + 0.56, 8, st(C.wood, P.WOOD), {});
  b.blob(-0.32, H + 0.6, 0, 0.06, 0.06, 0.06, st(C.wood, P.PLAIN), { sub: 1, lump: 0 });
  return b;
}

// ---------------------------------------------------------------- bell
export function buildBell() {
  const b = new Builder();
  b.cyl(0, -0.06, 0, 0.012, 0.02, 6, st(C.iron, P.PLAIN), {});
  b.lathe(0, 0, 0, [[0.0, -0.05], [0.055, -0.055], [0.075, -0.1], [0.085, -0.2], [0.115, -0.27], [0.125, -0.295], [0.0, -0.295]], 18, st(C.bronze, P.PLAIN), { edges: [0, 0, 0, 1, 1, 1, 0] });
  b.blob(0, -0.3, 0, 0.03, 0.03, 0.03, st(C.iron, P.PLAIN), { sub: 0 });
  return b;
}

// ---------------------------------------------------------------- clouds
// Flattened puffs low in the mist. Positions are given in picture terms (the
// screen offset u = x − z, v = 2y − x − z) and a height, so they can be placed
// round the feet of the towers where they look right.
export function cloudSpecs() {
  return [
    { u: -3.1, v: -12.6, y: -1.5, s: 1.0 },
    { u: 0.4, v: -11.4, y: -1.2, s: 0.8 },
    { u: 3.6, v: -9.6, y: -1.4, s: 1.05 },
    { u: -5.2, v: -6.5, y: -2.0, s: 0.75 },
    { u: 6.2, v: -2.6, y: -1.8, s: 0.85 },
    { u: 5.2, v: 4.6, y: -1.3, s: 0.7 },
    { u: 2.7, v: 4.9, y: -1.25, s: 0.62 },
    { u: -4.6, v: 4.2, y: -1.6, s: 0.6 },
  ];
}

// A cloud is a row of soft puffs; `grow` > 0 builds the slightly larger hull
// that is drawn back-faces-only in ink, giving the puffs an outline.
export function buildCloud(seed, s, grow = 0) {
  const b = new Builder();
  const c = grow ? st(0x000000, 15) : st(C.cloud, P.CLOUD, { f: 0.22 });
  const r = (k) => Math.sin(seed * 12.9898 + k * 78.233) * 0.5 + 0.5;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 - 1;
    const rx = (0.72 - Math.abs(t) * 0.3) * s * (0.85 + 0.3 * r(i));
    const cy = (1 - Math.abs(t)) * 0.16 * s + r(i + 9) * 0.08;
    b.blob(t * 1.05 * s, cy, (r(i + 3) - 0.5) * 0.5 * s, rx + grow, rx * 0.6 + grow, rx * 0.8 + grow, c, { sub: 3, seed: seed + i, lump: 0.03 });
  }
  return b;
}

export function fromPicture(u, v, y) {
  const xz = 2 * y - v; // x + z
  return [(xz + u) / 2, y, (xz - u) / 2];
}

// ---------------------------------------------------------------- birds
// A small bird: body and two wings that flap about the body axis (local z).
export function buildBirdParts() {
  const body = new Builder();
  const ink = st(0x4a443e, P.PLAIN);
  body.blob(0, 0, 0, 0.026, 0.024, 0.075, ink, { sub: 1, lump: 0 });
  body.blob(0, 0.01, 0.07, 0.02, 0.02, 0.02, ink, { sub: 1, lump: 0 });
  // gull wing: the inner part rises, the outer part droops, an "m" in profile
  const wing = (side) => {
    const w = new Builder();
    const a = [0, 0, 0.035], d = [0, 0, -0.03];
    const e = [side * 0.12, 0.045, 0.0], e2 = [side * 0.12, 0.045, -0.04];
    const tip = [side * 0.27, -0.015, -0.06];
    for (const [p, q, r] of [[a, e, e2], [a, e2, d], [e, tip, e2]]) {
      w.tri(p, q, r, ink, [0, 0, 0]);
      w.tri(p, r, q, ink, [0, 0, 0]);
    }
    return w;
  };
  return { body, left: wing(1), right: wing(-1) };
}
