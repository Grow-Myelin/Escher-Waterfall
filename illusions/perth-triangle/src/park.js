// A small park around the sculpture: a paved plaza, lawns, a ring path that
// passes through the viewing spot, trees, benches, lamps, a few visitors and
// a terrace of town houses beyond.

import * as THREE from 'three';
import { PAT, st, M } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';

const TAU = Math.PI * 2;

// deterministic noise for placing things
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function disc(b, cx, y, cz, r, seg, s, o = {}) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const a = (-i / seg) * TAU;
    pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
  }
  // fan from the centre keeps the triangles even
  for (let i = 0; i < seg; i++) {
    const p = pts[i], q = pts[(i + 1) % seg];
    b.tri([cx, y, cz], p, q, s, [o.rim === false ? 0 : 1, 0, 0]);
  }
}

function annulus(b, cx, y, cz, r0, r1, seg, s, from = 0, to = TAU) {
  for (let i = 0; i < seg; i++) {
    const a0 = from + ((to - from) * i) / seg, a1 = from + ((to - from) * (i + 1)) / seg;
    const p = (r, a) => [cx + r * Math.sin(a), y, cz + r * Math.cos(a)];
    b.quad(p(r0, a0), p(r1, a0), p(r1, a1), p(r0, a1), s, [0, 1, 0, 1]);
  }
}

// -------------------------------------------------------------- styles
const grass = st(0xa7b67f, PAT.GRASS);
const grass2 = st(0x9daf77, PAT.GRASS);
const flags = st(0xd6cdb8, PAT.ASHLAR);
const cobble = st(0xcbc1ab, PAT.COBBLE);
const gravel = st(0xd9cfb9, PAT.SOIL);
const kerb = st(0xbcb3a0, PAT.STONE);
const stone = st(0xc8bfaa, PAT.ASHLAR);
const bronze = st(0x8a6a3c, PAT.PLAIN);
const bronzeDark = st(0x4f3e27, PAT.PLAIN);
const bark = st(0x85735d, PAT.WOOD, { f: 0.1 });
const leaf = st(0xa6b886, PAT.FOLIAGE, { f: 0.26 });
const leaf2 = st(0xb3c290, PAT.FOLIAGE, { f: 0.26 });
const bed = st(0xb9a58a, PAT.SOIL);
const flowers = st(0xc9b07a, PAT.FOLIAGE);
const wood = st(0x9a7b57, PAT.WOOD);
const iron = st(0x3b3833, PAT.PLAIN);
const glass = st(0xf1ead6, PAT.PLAIN);

// -------------------------------------------------------------- pieces
function tree(b, x, z, h, r, seed) {
  const R = rng(seed);
  b.cyl(x, 0, z, 0.2 + r * 0.03, h * 0.55, 7, bark, { r1: 0.12 + r * 0.02, caps: [false, false] });
  const n = 3 + Math.floor(R() * 2);
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, d = r * 0.35 * R();
    const rr = r * (0.6 + 0.3 * R());
    b.blob(x + Math.cos(a) * d, h * (0.62 + 0.22 * R()), z + Math.sin(a) * d, rr, rr * 0.85, rr, i % 2 ? leaf : leaf2, { sub: 2, seed: seed + i * 7.3, lump: 0.16 });
  }
}

function conifer(b, x, z, h, r) {
  b.cyl(x, 0, z, 0.16, h * 0.2, 6, bark, { r1: 0.12, caps: [false, false] });
  b.lathe(x, 0, z, [[0.0, h * 0.15], [r, h * 0.22], [r * 0.82, h * 0.45], [r * 0.6, h * 0.62], [r * 0.32, h * 0.85], [0.0, h]], 9, leaf, { edges: [0, 1, 0, 0, 0, 0] });
}

function bench(b, x, z, rotY) {
  b.push(M.chain(M.T(x, 0, z), M.RY(rotY)));
  for (const sx of [-0.8, 0.8]) {
    b.box(sx - 0.05, 0, -0.22, sx + 0.05, 0.42, 0.22, iron, { ao: 0.8 });
    b.box(sx - 0.04, 0.42, 0.18, sx + 0.04, 0.85, 0.24, iron, {});
  }
  for (let i = 0; i < 3; i++) b.box(-1.0, 0.42, -0.24 + i * 0.15, 1.0, 0.47, -0.12 + i * 0.15, wood, {});
  for (let i = 0; i < 2; i++) b.box(-1.0, 0.56 + i * 0.16, 0.2, 1.0, 0.68 + i * 0.16, 0.25, wood, {});
  b.pop();
}

function lamp(b, x, z) {
  b.box(x - 0.16, 0, z - 0.16, x + 0.16, 0.35, z + 0.16, iron, {});
  b.cyl(x, 0.35, z, 0.06, 3.6, 6, iron, { r1: 0.045 });
  b.lathe(x, 3.55, z, [[0.06, 0], [0.24, 0.12], [0.2, 0.55], [0.3, 0.62], [0.0, 0.8]], 8, glass, { edges: [0, 1, 1, 1, 0] });
}

// A visitor, standing; `pose` 0 = hands down, 1 = pointing at the sculpture.
function person(b, x, z, rotY, o = {}) {
  const coat = st(o.coat ?? 0x5a5348, PAT.CLOTH);
  const legs = st(o.legs ?? 0x3e3a35, PAT.CLOTH);
  const skin = st(0xd8b89c, PAT.PLAIN);
  const hair = st(o.hair ?? 0x3a2f27, PAT.PLAIN);
  const h = o.h ?? 1.0;
  b.push(M.chain(M.T(x, 0, z), M.RY(rotY), M.S(h, h, h)));
  for (const sx of [-1, 1]) limb(b, [0.1 * sx, 0.04, 0], [0.09 * sx, 0.86, 0], 0.08, legs, { r1: 0.09 });
  b.lathe(0, 0.82, 0, [[0.2, 0], [0.22, 0.25], [0.24, 0.55], [0.19, 0.66], [0.0, 0.7]], 10, coat, { edges: [1, 0, 0, 0, 0] });
  limb(b, [0, 1.5, 0], [0, 1.6, 0], 0.06, skin);
  b.blob(0, 1.7, 0, 0.11, 0.13, 0.11, skin, { lump: 0.03, sub: 1 });
  b.blob(0, 1.76, 0.03, 0.115, 0.09, 0.11, hair, { lump: 0.04, sub: 1 });
  if (o.point) {
    limb(b, [0.22, 1.45, 0], [0.3, 1.5, -0.3], 0.055, coat);
    limb(b, [0.3, 1.5, -0.3], [0.33, 1.62, -0.62], 0.045, skin);
    limb(b, [-0.22, 1.45, 0], [-0.25, 1.05, 0.04], 0.055, coat);
  } else {
    for (const sx of [-1, 1]) limb(b, [0.22 * sx, 1.45, 0], [0.25 * sx, 1.0, 0.04], 0.055, coat);
  }
  b.pop();
}

function seated(b, x, z, rotY, o = {}) {
  const coat = st(o.coat ?? 0x6b5f50, PAT.CLOTH);
  const legs = st(0x3e3a35, PAT.CLOTH);
  const skin = st(0xd8b89c, PAT.PLAIN);
  b.push(M.chain(M.T(x, 0, z), M.RY(rotY)));
  for (const sx of [-1, 1]) {
    limb(b, [0.1 * sx, 0.5, 0.05], [0.12 * sx, 0.52, -0.4], 0.08, legs);
    limb(b, [0.12 * sx, 0.52, -0.4], [0.12 * sx, 0.05, -0.45], 0.07, legs);
  }
  b.lathe(0, 0.47, 0.1, [[0.2, 0], [0.22, 0.25], [0.23, 0.55], [0.18, 0.66], [0.0, 0.7]], 10, coat, { edges: [1, 0, 0, 0, 0] });
  b.blob(0, 1.33, 0.08, 0.11, 0.13, 0.11, skin, { lump: 0.03, sub: 1 });
  b.blob(0, 1.4, 0.11, 0.115, 0.09, 0.11, st(0x8a8378, PAT.PLAIN), { lump: 0.04, sub: 1 });
  for (const sx of [-1, 1]) limb(b, [0.22 * sx, 1.1, 0.1], [0.2 * sx, 0.75, -0.2], 0.055, coat);
  b.pop();
}

function house(b, x0, z0, w, d, h, roofH, s, haze, seed) {
  const R = rng(seed);
  const sty = { ...s, f: haze };
  b.box(x0, 0, z0, x0 + w, h, z0 + d, sty, {});
  // gable roof along x
  const roof = st(0x8f6e5a, PAT.TILE, { f: haze });
  const y = h, yr = h + roofH, zm = z0 + d / 2, ov = 0.3;
  b.quad([x0 - ov, y, z0 + d + ov], [x0 + w + ov, y, z0 + d + ov], [x0 + w + ov, yr, zm], [x0 - ov, yr, zm], roof);
  b.quad([x0 + w + ov, y, z0 - ov], [x0 - ov, y, z0 - ov], [x0 - ov, yr, zm], [x0 + w + ov, yr, zm], roof);
  b.tri([x0, y, z0 + d], [x0, yr, zm], [x0, y, z0], sty, [1, 1, 0]);
  b.tri([x0 + w, y, z0], [x0 + w, yr, zm], [x0 + w, y, z0 + d], sty, [1, 1, 0]);
  // windows on the front (+z) face
  const win = st(0x4a4741, PAT.PANE, { f: haze });
  const floors = Math.max(2, Math.floor(h / 3.2));
  const cols = Math.max(2, Math.floor(w / 2.4));
  for (let fl = 0; fl < floors; fl++) {
    for (let c = 0; c < cols; c++) {
      const cx = x0 + ((c + 0.5) * w) / cols;
      const cy = 1.2 + fl * (h - 1.6) / floors + 0.6;
      if (fl === 0 && c === Math.floor(cols / 2) && R() < 0.8) {
        b.box(cx - 0.6, 0, z0 + d, cx + 0.6, 2.4, z0 + d + 0.06, win, {});
      } else {
        b.box(cx - 0.45, cy, z0 + d, cx + 0.45, cy + 1.4, z0 + d + 0.06, win, {});
      }
    }
  }
  // chimney
  if (R() < 0.7) b.box(x0 + w * 0.7, h + roofH * 0.3, zm - 0.4, x0 + w * 0.7 + 0.7, h + roofH + 0.9, zm + 0.4, { ...st(0x9b7d66, PAT.BRICK), f: haze }, {});
}

// -------------------------------------------------------------- the park
// eye: the sweet spot (world); pose: { frame, world(p) } of the sculpture;
// posts: [K1, K2] world points the posts hold up.
export function buildPark(b, eye, posts, bAxis) {
  const ex = eye.x, ez = eye.z;
  const ringR = Math.hypot(ex, ez);

  // ground
  disc(b, 0, 0, 0, 160, 72, grass, { rim: false });
  // lawn patches in a second green, between the paths
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.4;
    const r = 30 + (i % 2) * 8;
    disc(b, Math.sin(a) * r, 0.004, Math.cos(a) * r, 7 + (i % 3) * 2, 20, grass2, { rim: false });
  }
  // the ring path the visitors walk, through the viewing spot
  annulus(b, 0, 0.012, 0, ringR - 1.0, ringR + 1.0, 120, gravel);
  // plaza and its kerb
  disc(b, 0, 0.022, 0, 8.6, 64, cobble);
  annulus(b, 0, 0.03, 0, 8.6, 9.0, 64, kerb);
  // radial paths from the plaza to the ring: towards the viewing spot and three more
  const th0 = Math.atan2(ex, ez);
  for (let k = 0; k < 4; k++) {
    const th = th0 + (k * TAU) / 4;
    const dx = Math.sin(th), dz = Math.cos(th), px = dz, pz = -dx;
    const w = k === 0 ? 1.4 : 1.0;
    const r0 = 8.8, r1 = ringR - 0.6;
    b.quad([dx * r0 - px * w, 0.016, dz * r0 - pz * w], [dx * r1 - px * w, 0.016, dz * r1 - pz * w], [dx * r1 + px * w, 0.016, dz * r1 + pz * w], [dx * r0 + px * w, 0.016, dz * r0 + pz * w], gravel, [1, 0, 1, 0]);
  }
  // the viewing spot: a ring of flagstones in the path
  disc(b, ex, 0.026, ez, 2.4, 48, flags);
  annulus(b, ex, 0.032, ez, 2.4, 2.65, 48, kerb);

  // the sweet-spot marker: a bronze disc with a compass rose and two footprints
  disc(b, ex, 0.04, ez, 0.5, 40, bronze);
  annulus(b, ex, 0.046, ez, 0.42, 0.47, 40, bronzeDark);
  for (let i = 0; i < 4; i++) {
    const a = th0 + Math.PI + (i * TAU) / 4;
    const dx = Math.sin(a), dz = Math.cos(a), px = dz * 0.06, pz = -dx * 0.06;
    b.tri([ex + dx * 0.4, 0.05, ez + dz * 0.4], [ex - px, 0.05, ez - pz], [ex + px, 0.05, ez + pz], bronzeDark);
  }
  {
    // footprints point at the sculpture
    const a = th0 + Math.PI;
    for (const sx of [-1, 1]) {
      const ox = ex + Math.cos(a) * 0.1 * sx, oz = ez - Math.sin(a) * 0.1 * sx;
      b.blob(ox - Math.sin(a) * 0.12, 0.05, oz - Math.cos(a) * 0.12, 0.05, 0.008, 0.05, bronzeDark, { sub: 1, lump: 0 });
      b.blob(ox + Math.sin(a) * 0.05, 0.05, oz + Math.cos(a) * 0.05, 0.055, 0.008, 0.055, bronzeDark, { sub: 1, lump: 0 });
    }
  }
  // a little bronze plaque on a post at the edge of the spot
  {
    const a = th0 + 0.9;
    const px = ex + Math.sin(a) * 2.0, pz = ez + Math.cos(a) * 2.0;
    b.push(M.chain(M.T(px, 0, pz), M.RY(th0)));
    b.box(-0.06, 0, -0.06, 0.06, 0.95, 0.06, iron, {});
    b.push(M.chain(M.T(0, 0.98, 0), M.RX(-0.6)));
    b.box(-0.24, -0.02, -0.16, 0.24, 0.03, 0.16, bronze, {});
    b.pop();
    b.pop();
  }

  // the sculpture's base: a long stone plinth under bar B, and two posts
  {
    const mid = posts[0].clone().add(posts[1]).multiplyScalar(0.5);
    const rot = Math.atan2(bAxis.x, bAxis.z);
    const len = posts[0].distanceTo(posts[1]) + 1.6;
    b.push(M.chain(M.T(mid.x, 0, mid.z), M.RY(rot)));
    b.box(-0.95, 0, -len / 2, 0.95, 0.36, len / 2, stone, { ao: 0.8 });
    b.box(-0.75, 0.36, -len / 2 + 0.2, 0.75, 0.46, len / 2 - 0.2, stone, {});
    b.pop();
    for (const p of posts) {
      b.box(p.x - 0.17, 0.46, p.z - 0.17, p.x + 0.17, p.y, p.z + 0.17, st(0x9c968a, PAT.PLAIN), { ao: 0.75 });
    }
  }

  // benches round the ring, facing the sculpture
  for (const da of [-0.17, 0.17, 1.2, -1.35, 2.4, -2.6]) {
    const a = th0 + da;
    const r = ringR + 1.6;
    bench(b, Math.sin(a) * r, Math.cos(a) * r, a + Math.PI);
  }
  // lamps
  for (let i = 0; i < 8; i++) {
    const a = th0 + ((i + 0.5) * TAU) / 8;
    lamp(b, Math.sin(a) * (ringR + 2.6), Math.cos(a) * (ringR + 2.6));
  }
  // four low flower beds in the quarters of the plaza, clear of the paths
  for (let i = 0; i < 4; i++) {
    const a = th0 + (i + 0.5) * (TAU / 4);
    const cx = Math.sin(a) * 12.6, cz = Math.cos(a) * 12.6;
    disc(b, cx, 0.03, cz, 2.2, 28, bed);
    for (let j = 0; j < 7; j++) {
      const aa = (j / 7) * TAU;
      b.blob(cx + Math.cos(aa) * 1.3, 0.18, cz + Math.sin(aa) * 1.3, 0.42, 0.22, 0.42, flowers, { sub: 1, seed: i * 7 + j, lump: 0.15 });
    }
    b.blob(cx, 0.3, cz, 0.6, 0.36, 0.6, leaf2, { sub: 1, seed: i, lump: 0.15 });
  }
  // trees: an outer ring, gaps left on the sight line and behind the sculpture
  const R = rng(7);
  for (let i = 0; i < 46; i++) {
    const a = th0 + (i / 46) * TAU + (R() - 0.5) * 0.1;
    const rel = Math.atan2(Math.sin(a - th0), Math.cos(a - th0));
    if (Math.abs(rel) < 0.2) continue; // keep the view to the viewing spot open
    const r = ringR + 9 + R() * 10;
    if (i % 5 === 2) conifer(b, Math.sin(a) * r, Math.cos(a) * r, 9 + R() * 4, 1.8 + R() * 0.6);
    else tree(b, Math.sin(a) * r, Math.cos(a) * r, 7 + R() * 4, 2.6 + R() * 1.4, 11 + i);
  }
  // a few just outside the ring, by the benches
  for (const [da, r] of [[0.75, 26], [-0.8, 25.5], [1.65, 26.5], [-1.9, 26], [2.7, 25.5], [-2.75, 26.5]]) {
    const a = th0 + da;
    tree(b, Math.sin(a) * r, Math.cos(a) * r, 6.5, 2.4, 50 + r);
  }

  // visitors on the plaza, well off the walk's lines of sight
  {
    const at = (da, r) => [Math.sin(th0 + da) * r, Math.cos(th0 + da) * r];
    const [x1, z1] = at(1.95, 7.6);
    person(b, x1, z1, th0 + 1.95 + Math.PI + 0.25, { coat: 0x7a5f4a, point: true });
    const [x2, z2] = at(2.05, 7.9);
    person(b, x2, z2, th0 + 2.05 + Math.PI - 0.1, { coat: 0x4e5a62, h: 0.92, hair: 0x6b5442 });
    const [x3, z3] = at(-2.2, 8.0);
    person(b, x3, z3, th0 - 2.2 + Math.PI, { coat: 0x625a4a });
  }
  {
    const a = th0 - 1.35, r = ringR + 1.6;
    seated(b, Math.sin(a) * r + 0.3, Math.cos(a) * r, a + Math.PI, { coat: 0x5d6a5a });
  }

  // a terrace of town houses beyond the far side of the park
  const HR = rng(3);
  let x = -70;
  while (x < 70) {
    const w = 7 + HR() * 6;
    const h = 8 + HR() * 7;
    const z = -62 - HR() * 4;
    const tone = [0xd9cdb5, 0xcdbfa6, 0xe0d6c2, 0xc9b79b][Math.floor(HR() * 4)];
    house(b, x, z, w, 10, h, 3 + HR() * 2, st(tone, PAT.PLASTER), 0.5, Math.floor(HR() * 1000));
    x += w + 0.2;
  }
  // and behind the viewer, so the walk round never runs out of town
  x = -70;
  while (x < 70) {
    const w = 7 + HR() * 6;
    const h = 8 + HR() * 7;
    const z = 58 + HR() * 4;
    b.push(M.chain(M.T(0, 0, 0), M.RY(Math.PI)));
    house(b, x, -z - 10, w, 10, h, 3 + HR() * 2, st(0xd6cab2, PAT.PLASTER), 0.5, Math.floor(HR() * 1000));
    b.pop();
    x += w + 0.2;
  }
  // side terraces
  for (const sgn of [-1, 1]) {
    let z = -55;
    while (z < 55) {
      const w = 7 + HR() * 6;
      const h = 8 + HR() * 6;
      b.push(M.chain(M.RY(sgn * Math.PI / 2)));
      house(b, z, -68 - HR() * 3, w, 10, h, 3 + HR() * 2, st(0xd3c6ad, PAT.PLASTER), 0.55, Math.floor(HR() * 1000));
      b.pop();
      z += w + 0.2;
    }
  }
}

// Things that cast a shadow (drawn flattened onto the ground).
export function buildCasters(b, eye) {
  // trees are approximated by the same placement as above: cheap blobs
  const ringR = Math.hypot(eye.x, eye.z);
  const th0 = Math.atan2(eye.x, eye.z);
  const R = rng(7);
  for (let i = 0; i < 46; i++) {
    const a = th0 + (i / 46) * TAU + (R() - 0.5) * 0.1;
    const rel = Math.atan2(Math.sin(a - th0), Math.cos(a - th0));
    if (Math.abs(rel) < 0.2) continue;
    const r = ringR + 9 + R() * 10;
    const tx = Math.sin(a) * r, tz = Math.cos(a) * r;
    if (i % 5 === 2) { R(); R(); continue; }
    const h = 7 + R() * 4, rr = 2.6 + R() * 1.4;
    b.blob(tx, h * 0.7, tz, rr, rr * 0.8, rr, st(0, PAT.PLAIN), { sub: 1 });
  }
}
