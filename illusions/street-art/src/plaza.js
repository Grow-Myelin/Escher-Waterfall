// The real plaza: houses on four sides, an arcade, a fountain, lamps,
// benches, a café, and the pavement artist with her box of chalks.

import * as THREE from 'three';
import { PAT, st, M } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';

const stone = st(0xc4bba9, PAT.ASHLAR);
const stoneDark = st(0xa59c8b, PAT.ASHLAR);
const pane = st(0x3b3f42, PAT.PANE);
const iron = st(0x34312d, PAT.PLAIN);
const woodDark = st(0x5a4634, PAT.WOOD);
const roof = st(0x9a5a43, PAT.TILE);

// A town house in local coordinates: facade on z = 0 facing +z, x from 0 to w.
function house(b, w, d, floors, wall, o = {}) {
  const gh = 3.6, fh = 3.1;
  const h = gh + fh * (floors - 1);
  const shut = st(o.shutter ?? 0x56634f, PAT.WOOD);
  b.box(0, 0, -d, w, h, 0, wall, {});
  b.box(-0.03, 0, -d, w + 0.03, 0.55, 0.05, stoneDark, {});
  b.box(-0.04, gh - 0.12, -d, w + 0.04, gh + 0.02, 0.1, stone, {});
  for (let f = 1; f < floors; f++) b.box(-0.03, gh + fh * f - 0.06, -d, w + 0.03, gh + fh * f + 0.02, 0.06, stone, {});
  b.box(-0.12, h, -d - 0.12, w + 0.12, h + 0.22, 0.22, stone, {});
  b.box(-0.06, h + 0.22, -d - 0.06, w + 0.06, h + 0.32, 0.16, stoneDark, {});
  // pitched roof, ridge parallel to the facade
  const rh = o.roofH ?? 2.2;
  const y0 = h + 0.32, zr = -d / 2;
  b.quad([-0.15, y0, 0.3], [w + 0.15, y0, 0.3], [w + 0.15, y0 + rh, zr], [-0.15, y0 + rh, zr], roof);
  b.quad([w + 0.15, y0, -d - 0.3], [-0.15, y0, -d - 0.3], [-0.15, y0 + rh, zr], [w + 0.15, y0 + rh, zr], roof);
  b.tri([0, y0, 0.16], [0, y0 + rh - 0.1, zr], [0, y0, -d - 0.16], wall);
  b.tri([w, y0, -d - 0.16], [w, y0 + rh - 0.1, zr], [w, y0, 0.16], wall);
  if (o.chimney) b.box(w * 0.7, y0 + rh * 0.4, zr - 0.8, w * 0.7 + 0.6, y0 + rh + 0.9, zr - 0.2, st(0x9b8f7e, PAT.BRICK), {});
  // windows
  const n = Math.max(1, Math.round(w / 1.9));
  const step = w / n;
  for (let f = 1; f < floors; f++) {
    const yb = gh + fh * (f - 1) + 0.85;
    for (let i = 0; i < n; i++) {
      const cx = step * (i + 0.5);
      b.box(cx - 0.42, yb, -0.1, cx + 0.42, yb + 1.55, 0.015, pane, { skip: ['nz'] });
      b.box(cx - 0.52, yb - 0.1, -0.05, cx + 0.52, yb, 0.12, stone, {});
      b.box(cx - 0.5, yb + 1.55, -0.05, cx + 0.5, yb + 1.68, 0.06, stone, {});
      if (o.shutter !== null) {
        b.box(cx - 0.86, yb, 0.0, cx - 0.44, yb + 1.55, 0.06, shut, {});
        b.box(cx + 0.44, yb, 0.0, cx + 0.86, yb + 1.55, 0.06, shut, {});
      }
      if (o.balcony && f === 1) {
        b.box(cx - 0.7, yb - 0.18, 0, cx + 0.7, yb - 0.08, 0.55, stone, {});
        for (let k = 0; k <= 6; k++) b.box(cx - 0.68 + k * 0.226, yb - 0.08, 0.48, cx - 0.65 + k * 0.226, yb + 0.9, 0.51, iron, {});
        b.box(cx - 0.7, yb + 0.88, 0.46, cx + 0.7, yb + 0.94, 0.53, iron, {});
      }
    }
  }
  // ground floor: doors and shop fronts under round arches
  for (let i = 0; i < n; i++) {
    const cx = step * (i + 0.5);
    const shop = o.shops && i % 2 === 0;
    const hw = shop ? 0.75 : 0.55;
    b.box(cx - hw, 0.55, -0.12, cx + hw, 2.6, 0.015, shop ? pane : woodDark, { skip: ['nz'] });
    b.box(cx - hw - 0.14, 0.55, -0.04, cx - hw, 2.62, 0.07, stone, {});
    b.box(cx + hw, 0.55, -0.04, cx + hw + 0.14, 2.62, 0.07, stone, {});
    b.box(cx - hw - 0.14, 2.62, -0.04, cx + hw + 0.14, 2.82, 0.07, stone, {});
    if (shop && o.awning) {
      const aw = st(o.awning, PAT.CLOTH);
      b.quad([cx - hw - 0.25, 3.05, 0.05], [cx - hw - 0.25, 2.55, 1.3], [cx + hw + 0.25, 2.55, 1.3], [cx + hw + 0.25, 3.05, 0.05], aw);
      b.quad([cx - hw - 0.25, 2.55, 1.3], [cx - hw - 0.25, 2.3, 1.3], [cx + hw + 0.25, 2.3, 1.3], [cx + hw + 0.25, 2.55, 1.3], aw);
    }
  }
  return h;
}

// An arcaded loggia (local frame as house()).
function loggia(b, w, d, bays) {
  const h = 9.6;
  const wall = st(0xd3c3a2, PAT.PLASTER);
  const step = w / bays;
  const ah = 4.4; // arcade height
  const depth = 3.2;
  b.box(0, ah, -d, w, h, 0, wall, {});
  b.box(0, 0, -d, w, ah, -depth, st(0xbfae8c, PAT.PLASTER), {});
  b.box(-0.05, ah - 0.05, -d, w + 0.05, ah + 0.35, 0.08, stone, {});
  b.box(-0.12, h, -d - 0.12, w + 0.12, h + 0.3, 0.2, stone, {});
  for (let i = 0; i <= bays; i++) {
    const x = i * step;
    b.box(x - 0.28, 0, -0.56, x + 0.28, 0.35, 0, stoneDark, {});
    b.cyl(x, 0.35, -0.28, 0.2, 3.0, 12, stone, {});
    b.box(x - 0.3, 3.0, -0.58, x + 0.3, 3.25, 0.02, stone, {});
  }
  for (let i = 0; i < bays; i++) {
    const cx = (i + 0.5) * step, r = step / 2 - 0.3;
    const segs = 10;
    for (let k = 0; k < segs; k++) {
      const t0 = Math.PI * (1 - k / segs), t1 = Math.PI * (1 - (k + 1) / segs);
      const a0 = [cx + Math.cos(t0) * r, 3.25 + Math.sin(t0) * r], a1 = [cx + Math.cos(t1) * r, 3.25 + Math.sin(t1) * r];
      // spandrel face above each arch segment
      b.quad([a0[0], a0[1], 0.02], [a1[0], a1[1], 0.02], [a1[0], ah, 0.02], [a0[0], ah, 0.02], stone, [k === 0 ? 0 : 0, 0, 0, 0]);
      b.quad([a1[0], a1[1], 0.02], [a0[0], a0[1], 0.02], [a0[0], a0[1], -0.58], [a1[0], a1[1], -0.58], stoneDark, [1, 0, 1, 0]);
    }
    // the ceiling of the bay and the back wall's doors
    b.box(cx - 0.6, 0, -depth - 0.02, cx + 0.6, 2.5, -depth + 0.01, woodDark, {});
  }
  b.box(0, ah - 0.3, -depth, w, ah - 0.25, -0.58, st(0x8c8170), { bottom: true, skip: ['py'] });
  // upper windows
  for (let i = 0; i < bays; i++) {
    const cx = (i + 0.5) * step;
    b.box(cx - 0.45, 5.6, -0.1, cx + 0.45, 7.9, 0.015, pane, { skip: ['nz'] });
    b.box(cx - 0.6, 7.9, -0.05, cx + 0.6, 8.15, 0.1, stone, {});
    b.box(cx - 0.55, 5.45, -0.05, cx + 0.55, 5.6, 0.14, stone, {});
  }
}

function lamp(b, x, z) {
  b.cyl(x, 0, z, 0.16, 0.5, 10, iron, { r1: 0.1 });
  b.cyl(x, 0.5, z, 0.055, 3.6, 8, iron, { r1: 0.045 });
  b.box(x - 0.17, 3.6, z - 0.17, x + 0.17, 3.66, z + 0.17, iron, {});
  b.box(x - 0.14, 3.66, z - 0.14, x + 0.14, 4.08, z + 0.14, st(0xe8e1c8, PAT.PANE), {});
  b.lathe(x, 4.08, z, [[0.22, 0], [0.0, 0.26]], 8, iron, { edges: [1, 0] });
}

function bench(b, x, z, rot) {
  b.push(M.chain(M.T(x, 0, z), M.RY(rot)));
  for (let i = 0; i < 4; i++) b.box(-0.9, 0.42, -0.2 + i * 0.11, 0.9, 0.46, -0.13 + i * 0.11, woodDark, {});
  for (let i = 0; i < 3; i++) b.box(-0.9, 0.55 + i * 0.13, -0.28, 0.9, 0.64 + i * 0.13, -0.25, woodDark, {});
  for (const sx of [-0.75, 0.75]) {
    b.box(sx - 0.03, 0, -0.22, sx + 0.03, 0.42, -0.18, iron, {});
    b.box(sx - 0.03, 0, 0.18, sx + 0.03, 0.42, 0.22, iron, {});
    b.box(sx - 0.03, 0.42, -0.3, sx + 0.03, 0.95, -0.26, iron, {});
  }
  b.pop();
}

function fountain(b, x, z) {
  const basin = st(0xbdb4a2, PAT.ASHLAR);
  const prof = [[2.3, 0], [2.3, 0.55], [2.05, 0.6], [2.05, 0.35], [0, 0.35]];
  b.lathe(x, 0, z, prof, 16, basin, { flat: true, edges: [1, 1, 1, 1, 0] });
  b.cyl(x, 0.4, z, 2.04, 0.48, 16, st(0x6f8a8f, PAT.PANE), { caps: [false, true], rim: [0, 0] });
  b.cyl(x, 0.35, z, 0.3, 1.6, 10, basin, {});
  b.lathe(x, 1.6, z, [[0.2, 0], [0.9, 0.3], [0.95, 0.42], [0.0, 0.42]], 12, basin, { edges: [0, 1, 1, 0] });
  b.cyl(x, 2.0, z, 0.14, 2.6, 8, basin, {});
  b.blob(x, 2.75, z, 0.22, 0.22, 0.22, basin, { lump: 0.05 });
}

function tree(b, x, z, s = 1) {
  b.box(x - 0.6, 0, z - 0.6, x + 0.6, 0.6, z + 0.6, stone, {});
  b.box(x - 0.5, 0.6, z - 0.5, x + 0.5, 0.62, z + 0.5, st(0x5c4a35, PAT.SOIL), {});
  limb(b, [x, 0.6, z], [x + 0.1, 2.4 * s, z], 0.1, st(0x5a4a3a, PAT.WOOD), { r1: 0.07 });
  const leaf = st(0x6f7f53, PAT.FOLIAGE);
  b.blob(x + 0.1, 2.9 * s, z, 1.05 * s, 0.85 * s, 1.05 * s, leaf, { lump: 0.18, seed: x * 3 + z, sub: 2 });
  b.blob(x + 0.5 * s, 3.3 * s, z + 0.3, 0.6 * s, 0.5 * s, 0.6 * s, leaf, { lump: 0.2, seed: x + z * 5, sub: 1 });
}

function cafe(b, x, z) {
  const cloth = st(0xe9e2d1, PAT.CLOTH);
  for (const [dx, dz] of [[0, 0], [2.2, 0.6], [0.8, 2.3]]) {
    const cx = x + dx, cz = z + dz;
    b.cyl(cx, 0, cz, 0.25, 0.04, 8, iron, {});
    b.cyl(cx, 0.04, cz, 0.04, 0.72, 6, iron, {});
    b.cyl(cx, 0.72, cz, 0.38, 0.75, 14, st(0xd9d2c2, PAT.PLAIN), {});
    for (const a of [0.3, 2.4, 4.3]) {
      const sx = cx + Math.cos(a) * 0.62, sz = cz + Math.sin(a) * 0.62;
      b.push(M.chain(M.T(sx, 0, sz), M.RY(-a + Math.PI / 2)));
      b.box(-0.2, 0.44, -0.2, 0.2, 0.48, 0.2, woodDark, {});
      for (const [lx, lz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) b.box(lx - 0.02, 0, lz - 0.02, lx + 0.02, 0.44, lz + 0.02, iron, {});
      b.box(-0.2, 0.48, 0.16, 0.2, 0.9, 0.2, woodDark, {});
      b.pop();
    }
    b.cyl(cx, 0.75, cz, 0.03, 2.3, 6, st(0xd8d0bf), {});
    b.lathe(cx, 2.05, cz, [[1.25, 0], [0.0, 0.45]], 12, cloth, { edges: [1, 0] });
  }
}

function bollard(b, x, z) {
  b.cyl(x, 0, z, 0.14, 0.75, 10, stoneDark, { r1: 0.12 });
  b.blob(x, 0.78, z, 0.13, 0.08, 0.13, stoneDark, { lump: 0 });
}

// The artist's kit beside the drawing: a box of chalks and a hat for coins.
function kit(b, x, z) {
  b.push(M.chain(M.T(x, 0, z), M.RY(0.35)));
  b.box(-0.3, 0, -0.17, 0.3, 0.09, 0.17, st(0x7a5b3c, PAT.WOOD), {});
  b.box(-0.27, 0.09, -0.14, 0.27, 0.095, 0.14, st(0xd8cfbd, PAT.PLAIN), {});
  const cols = [0xc74b3b, 0xe0b440, 0x4f86a8, 0x6aa05a, 0xf0ece0, 0x3a3a3a, 0xd98a4a, 0x8d6bb0, 0xb8d0dc, 0x9c5a3c];
  for (let i = 0; i < 10; i++) {
    const row = Math.floor(i / 5), k = i % 5;
    b.push(M.chain(M.T(-0.2 + k * 0.1, 0.112, -0.06 + row * 0.12), M.RY((k * 0.37 + row) % 0.3 - 0.15)));
    b.box(-0.016, -0.016, -0.045, 0.016, 0.016, 0.045, st(cols[i]), {});
    b.pop();
  }
  // two loose sticks on the paving
  b.push(M.chain(M.T(0.42, 0.016, 0.12), M.RY(0.9)));
  b.box(-0.016, -0.016, -0.04, 0.016, 0.016, 0.04, st(cols[2]), {});
  b.pop();
  b.push(M.chain(M.T(0.36, 0.016, 0.3), M.RY(-0.4)));
  b.box(-0.016, -0.016, -0.03, 0.016, 0.016, 0.03, st(cols[0]), {});
  b.pop();
  b.pop();
}

function hat(b, x, z) {
  b.push(M.chain(M.T(x, 0, z), M.RY(-0.2)));
  b.cyl(0, 0, 0, 0.16, 0.11, 14, st(0x3c3833, PAT.CLOTH), { caps: [true, false] });
  b.lathe(0, 0.0, 0, [[0.28, 0.005], [0.16, 0.012]], 14, st(0x3c3833, PAT.CLOTH), { edges: [1, 0] });
  b.cyl(0, 0.02, 0, 0.145, 0.035, 14, st(0xb59a5a), { caps: [false, true], rim: [0, 0] });
  b.pop();
}

export function buildPlaza(b) {
  // north side (behind the drawing)
  const N = [
    [-15.5, 4.6, 3, 0xd8c7a6, { shops: true, awning: 0x9a4d3c }],
    [-10.9, 5.2, 4, 0xc9a98d, { balcony: true, chimney: true }],
    [-5.7, 4.2, 3, 0xe0d4bb, { shutter: 0x6b5a45 }],
    [-1.5, 6.0, 4, 0xcdb69a, { shops: true, awning: 0x546a72, balcony: true }],
    [4.5, 4.4, 3, 0xd4c09d, { chimney: true }],
    [8.9, 6.4, 4, 0xbfa58d, { shops: true, awning: 0x7b6a3c }],
  ];
  for (const [x, w, f, c, o] of N) {
    b.push(M.T(x, 0, -18));
    house(b, w, 8, f, st(c, PAT.PLASTER), o);
    b.pop();
  }
  // south side (behind the viewer)
  const S = [[-15.5, 6, 3, 0xcbb497, { shops: true, awning: 0x5e6e5b }], [-9.5, 4.8, 4, 0xd9cbb0, { balcony: true }], [-4.7, 5.6, 3, 0xc6a68b, { chimney: true }], [0.9, 4.6, 4, 0xdccfb5, {}], [5.5, 5.0, 3, 0xcfb796, { shops: true, awning: 0x8c4a3a }], [10.5, 5.1, 4, 0xbea88f, {}]];
  for (const [x, w, f, c, o] of S) {
    b.push(M.chain(M.T(x + w, 0, 17), M.RY(Math.PI)));
    house(b, w, 8, f, st(c, PAT.PLASTER), o);
    b.pop();
  }
  // west: the loggia
  b.push(M.chain(M.T(-14, 0, 12), M.RY(Math.PI / 2)));
  loggia(b, 26, 9, 8);
  b.pop();
  // east: houses
  const E = [[-16, 5.4, 3, 0xd2bfa0, {}], [-10.6, 6, 4, 0xc5ab90, { shops: true, awning: 0x4f6470 }], [-4.6, 4.8, 3, 0xdccbb0, { balcony: true }], [0.2, 5.5, 4, 0xcdae8f, { chimney: true }], [5.7, 5.3, 3, 0xd6c6a5, { shops: true, awning: 0x9a4d3c }], [11, 4.6, 3, 0xc4ae95, {}]];
  for (const [z, w, f, c, o] of E) {
    b.push(M.chain(M.T(14, 0, z), M.RY(-Math.PI / 2)));
    house(b, w, 8, f, st(c, PAT.PLASTER), o);
    b.pop();
  }

  fountain(b, -7.5, -9);
  for (const [x, z] of [[-5, 11], [5, 11], [-10.5, 2], [10.5, 2], [-5, -13], [5, -13]]) lamp(b, x, z);
  bench(b, -11.6, 6, Math.PI / 2);
  bench(b, -11.6, -3, Math.PI / 2);
  bench(b, 8.5, -14.8, 0);
  tree(b, 11, -9, 1.1);
  tree(b, -11, 12.5, 1);
  tree(b, 11.2, 12, 0.95);
  cafe(b, 9.2, -4.5);
  for (let i = 0; i < 6; i++) bollard(b, -3 + i * 1.2, 15.3);
  kit(b, 1.05, 4.95);
  hat(b, 2.5, 5.7);
}

// The artist, kneeling at the left edge of her drawing, chalk in hand.
export function buildArtist(b, x, z, rot) {
  const skin = st(0xd9b9a0);
  const shirt = st(0x8a9aa6, PAT.CLOTH);
  const trousers = st(0x4a4640, PAT.CLOTH);
  const hair = st(0x5a3d2b);
  b.push(M.chain(M.T(x, 0, z), M.RY(rot)));
  // kneeling: shins on the ground, thighs up to the hips
  for (const sx of [-1, 1]) {
    limb(b, [0.12 * sx, 0.08, 0.45], [0.12 * sx, 0.1, -0.05], 0.075, trousers, { r1: 0.085 });
    limb(b, [0.12 * sx, 0.1, -0.05], [0.13 * sx, 0.62, 0.12], 0.095, trousers, { r1: 0.1 });
    b.box(0.12 * sx - 0.05, 0.0, 0.4, 0.12 * sx + 0.05, 0.12, 0.62, st(0x2e2a26), {});
  }
  // torso leaning forward over the drawing
  b.push(M.chain(M.T(0, 0.6, 0.1), M.RX(-0.75)));
  b.box(-0.21, 0, -0.12, 0.21, 0.62, 0.12, shirt, {});
  b.pop();
  const sh = [0, 0.6 + 0.62 * Math.cos(0.75), 0.1 - 0.62 * Math.sin(0.75)];
  const head = [0, sh[1] + 0.12, sh[2] - 0.2];
  b.blob(head[0], head[1], head[2], 0.13, 0.15, 0.14, skin, { lump: 0.03 });
  b.blob(head[0], head[1] + 0.07, head[2] + 0.05, 0.14, 0.12, 0.14, hair, { lump: 0.06 });
  // one arm reaching down to the pavement, the other propped on the knee
  limb(b, [0.22, sh[1] - 0.04, sh[2] + 0.04], [0.28, 0.42, -0.42], 0.06, shirt);
  limb(b, [0.28, 0.42, -0.42], [0.25, 0.04, -0.7], 0.05, skin);
  limb(b, [-0.22, sh[1] - 0.04, sh[2] + 0.04], [-0.3, 0.55, -0.1], 0.06, shirt);
  limb(b, [-0.3, 0.55, -0.1], [-0.16, 0.62, 0.12], 0.05, skin);
  b.pop();
}
