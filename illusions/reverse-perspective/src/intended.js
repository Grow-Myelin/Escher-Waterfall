// The intended scene: what the painting shows. A stone facade in the board
// plane with a deep tiled hall, two small libraries and two niches. Every
// recess is built on exactly the planes of its block-out (homology.js), so
// the relief's creases fall on the painted corners.
//
// The Waterfall's surface patterns are sized for buildings tens of units
// tall; this facade is 1.5 m wide, so it is modelled 5× larger and scaled
// down (texture coordinates come from the unscaled model).

import { PAT, st, M } from '../../../src/builder.js';
import { BLOCKS, recess, BOARD } from './homology.js';

const Q = 5;

class QB {
  constructor(b) { this.b = b; }
  s(p) { return [p[0] * Q, p[1] * Q, p[2] * Q]; }
  box(x0, y0, z0, x1, y1, z1, s, o = {}) { this.b.box(x0 * Q, y0 * Q, z0 * Q, x1 * Q, y1 * Q, z1 * Q, s, o); }
  quad(a, b, c, d, s, e, o) { this.b.quad(this.s(a), this.s(b), this.s(c), this.s(d), s, e, o); }
  blob(x, y, z, rx, ry, rz, s, o) { this.b.blob(x * Q, y * Q, z * Q, rx * Q, ry * Q, rz * Q, s, o); }
  cyl(x, y0, z, r, y1, seg, s, o = {}) { this.b.cyl(x * Q, y0 * Q, z * Q, r * Q, y1 * Q, seg, s, { ...o, r1: o.r1 === undefined ? undefined : o.r1 * Q }); }
  lathe(x, y, z, prof, seg, s, o) { this.b.lathe(x * Q, y * Q, z * Q, prof.map(([r, h]) => [r * Q, h * Q]), seg, s, o); }
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// The five planes of a recess, each wound to face into the recess.
export function recessFaces(blk) {
  const { near: n, far: f } = recess(blk);
  const a = (v) => [v.x, v.y, v.z];
  return {
    floor: [n[0], n[1], f[1], f[0]].map(a),
    ceil: [n[3], f[3], f[2], n[2]].map(a),
    left: [n[0], f[0], f[3], n[3]].map(a),
    right: [n[1], n[2], f[2], f[1]].map(a),
    far: [f[0], f[1], f[2], f[3]].map(a),
  };
}

// ------------------------------------------------------------------ styles
const stone = st(0xdcd0b8, PAT.ASHLAR);
const dressed = st(0xeae2d1, PAT.PLAIN);
const plinth = st(0xbfb197, PAT.STONE);
const plaster = st(0xe9dcc2, PAT.PLASTER);
const plasterPale = st(0xf1e9da, PAT.PLASTER);
const tileA = st(0xf0e9da, PAT.PLAIN);
const tileB = st(0x5f564c, PAT.PLAIN);
const panel = st(0x93714f, PAT.WOOD);
const doorWood = st(0x6a4c35, PAT.WOOD);
const beam = st(0x8c6b4b, PAT.WOOD);
const boards = st(0xb89569, PAT.WOOD);
const shelfWood = st(0x7d5f43, PAT.WOOD);
const sky = st(0xe4edf0, PAT.PLAIN);
const brass = st(0xc8a768, PAT.PLAIN);
const grass = st(0xa7b882, PAT.GRASS);
const gravel = st(0xddd2bb, PAT.SOIL);
const leaf = st(0x8ea56c, PAT.FOLIAGE);
const bark = st(0x7a6550, PAT.WOOD);
const BOOKS = [0x8c3b2e, 0x2f4b6e, 0x5d6b3a, 0xb08a3e, 0x6b3d5c, 0x45403a, 0xc9b48a, 0x9a5a35, 0x3f5f5a];

// ------------------------------------------------------------------ pieces
function facade(q) {
  const ex = 0.06; // a little past the board's edge
  const xs = new Set([BOARD.x0 - ex, BOARD.x1 + ex]);
  const ys = new Set([BOARD.y0 - ex, BOARD.y1 + ex]);
  for (const b of BLOCKS) { xs.add(b.x0); xs.add(b.x1); ys.add(b.y0); ys.add(b.y1); }
  const X = [...xs].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b);
  const open = (x, y) => BLOCKS.some((b) => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);
  for (let i = 0; i < X.length - 1; i++) {
    for (let j = 0; j < Y.length - 1; j++) {
      const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
      if (open(cx, cy)) continue;
      const e = [
        open(cx, Y[j] - 1e-4) ? 1 : 0, open(X[i + 1] + 1e-4, cy) ? 1 : 0,
        open(cx, Y[j + 1] + 1e-4) ? 1 : 0, open(X[i] - 1e-4, cy) ? 1 : 0,
      ];
      q.quad([X[i], Y[j], 0], [X[i + 1], Y[j], 0], [X[i + 1], Y[j + 1], 0], [X[i], Y[j + 1], 0], stone, e);
    }
  }
  // dressed-stone surrounds, sills, a lintel with a keystone
  const aw = 0.035, dz = 0.014;
  for (const b of BLOCKS) {
    q.box(b.x0 - aw, b.y1, 0, b.x1 + aw, b.y1 + aw, dz, dressed);
    q.box(b.x0 - aw, b.y0, 0, b.x0, b.y1, dz, dressed);
    q.box(b.x1, b.y0, 0, b.x1 + aw, b.y1, dz, dressed);
    if (b.name.startsWith('niche')) q.box(b.x0 - aw - 0.01, b.y0 - 0.03, 0, b.x1 + aw + 0.01, b.y0, 0.035, dressed);
  }
  const hall = BLOCKS[0];
  q.box(hall.x0 - 0.07, hall.y1 + aw, 0, hall.x1 + 0.07, hall.y1 + 0.1, 0.022, dressed);
  q.box(-0.035, hall.y1, 0, 0.035, hall.y1 + 0.12, 0.032, stone);
  // pilasters between the openings
  for (const sx of [-1, 1]) q.box(sx > 0 ? 0.3 : -0.37, -0.76, 0, sx > 0 ? 0.37 : -0.3, 0.8, 0.012, dressed);
  // cornice with dentils, frieze band, plinth and a threshold
  q.box(BOARD.x0 - 0.1, 0.8, 0, BOARD.x1 + 0.1, 0.86, 0.03, dressed);
  q.box(BOARD.x0 - 0.1, 0.86, 0, BOARD.x1 + 0.1, 0.875, 0.045, dressed);
  for (let x = BOARD.x0 - 0.05; x < BOARD.x1 + 0.05; x += 0.045) q.box(x, 0.775, 0, x + 0.022, 0.8, 0.018, dressed);
  q.box(BOARD.x0 - 0.1, -1.05, 0, BOARD.x1 + 0.1, -0.76, 0.014, plinth);
  q.box(hall.x0 - 0.05, -0.76, 0, hall.x1 + 0.05, -0.7, 0.07, plinth);
  // a carved panel over the cornice
  q.box(-0.28, 0.88, 0, 0.28, 0.98, 0.012, dressed);
}

function hall(q) {
  const b = BLOCKS[0];
  const F = recessFaces(b);
  const { x0, x1, y0, y1 } = b;
  const L = b.F;
  // checker floor
  const nx = 4, nz = 34;
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      const xa = x0 + ((x1 - x0) * i) / nx, xb = x0 + ((x1 - x0) * (i + 1)) / nx;
      const za = (-L * k) / nz, zb = (-L * (k + 1)) / nz;
      q.quad([xa, y0, za], [xb, y0, za], [xb, y0, zb], [xa, y0, zb], (i + k) % 2 ? tileA : tileB, [0, 0, 0, 0]);
    }
  }
  q.quad(...F.left, plaster, [1, 1, 1, 1]);
  q.quad(...F.right, plaster, [1, 1, 1, 1]);
  q.quad(...F.ceil, plasterPale, [1, 1, 1, 1]);
  // dado panelling
  q.box(x0, y0, -L, x0 + 0.008, y0 + 0.2, 0, panel);
  q.box(x1 - 0.008, y0, -L, x1, y0 + 0.2, 0, panel);
  // doors, alternating, and framed pictures between them
  const door = (side, zc) => {
    const x = side < 0 ? x0 : x1, s = side < 0 ? 1 : -1;
    const xa = Math.min(x, x + s * 0.014), xb = Math.max(x, x + s * 0.014);
    q.box(xa, y0, zc - 0.15, xb, y0 + 0.78, zc + 0.15, dressed);
    const xc = Math.min(x, x + s * 0.02), xd = Math.max(x, x + s * 0.02);
    q.box(xc, y0, zc - 0.115, xd, y0 + 0.74, zc + 0.115, doorWood);
    q.box(xc, y0 + 0.36, zc + (s > 0 ? 0.07 : -0.09), xd + 0.004, y0 + 0.38, zc + (s > 0 ? 0.09 : -0.07), brass);
  };
  const pic = (side, zc, w, h) => {
    const x = side < 0 ? x0 : x1, s = side < 0 ? 1 : -1;
    const xa = Math.min(x, x + s * 0.012), xb = Math.max(x, x + s * 0.012);
    q.box(xa, 0.02, zc - w / 2, xb, 0.02 + h, zc + w / 2, brass);
    const xc = Math.min(x, x + s * 0.016), xd = Math.max(x, x + s * 0.016);
    q.box(xc, 0.04, zc - w / 2 + 0.02, xd, h, zc + w / 2 - 0.02, st(0x6f7d74, PAT.PLASTER));
  };
  for (const z of [-0.85, -2.45, -4.05]) door(-1, z);
  for (const z of [-1.65, -3.25]) door(1, z);
  pic(1, -0.75, 0.32, 0.24); pic(1, -2.45, 0.26, 0.2); pic(1, -4.05, 0.22, 0.18);
  pic(-1, -1.65, 0.28, 0.22); pic(-1, -3.25, 0.24, 0.2);
  // ceiling beams and hanging lamps
  for (let z = -0.25; z > -L; z -= 0.5) q.box(x0, y1 - 0.035, z - 0.025, x1, y1, z + 0.025, beam);
  for (const z of [-1.25, -2.85, -4.4]) {
    q.box(-0.004, y1 - 0.16, z - 0.004, 0.004, y1 - 0.035, z + 0.004, st(0x3b3833, PAT.PLAIN));
    q.blob(0, y1 - 0.19, z, 0.032, 0.036, 0.032, st(0xf5ecd2, PAT.PLAIN), { sub: 1, lump: 0 });
  }
  // far wall with an open doorway into a garden
  const g = { x0: -0.12, x1: 0.12, y0, y1: -0.04 };
  const zf = -L;
  const fq = (xa, ya, xb, yb, e) => q.quad([xa, ya, zf], [xb, ya, zf], [xb, yb, zf], [xa, yb, zf], plaster, e);
  fq(x0, y0, g.x0, y1, [1, 1, 1, 1]);
  fq(g.x1, y0, x1, y1, [1, 1, 1, 1]);
  fq(g.x0, g.y1, g.x1, y1, [1, 0, 1, 0]);
  q.box(g.x0 - 0.03, g.y0, zf, g.x0, g.y1 + 0.03, zf + 0.01, dressed);
  q.box(g.x1, g.y0, zf, g.x1 + 0.03, g.y1 + 0.03, zf + 0.01, dressed);
  q.box(g.x0 - 0.03, g.y1, zf, g.x1 + 0.03, g.y1 + 0.03, zf + 0.01, dressed);
  // the garden beyond
  q.quad([-3, y0, zf], [3, y0, zf], [3, y0, -14], [-3, y0, -14], grass, [0, 0, 0, 0]);
  q.quad([-0.1, y0 + 0.002, zf], [0.1, y0 + 0.002, zf], [0.25, y0 + 0.002, -11], [-0.25, y0 + 0.002, -11], gravel, [0, 1, 0, 1]);
  for (const [x, z, h] of [[-0.55, -7.8, 1.1], [0.62, -8.6, 1.3], [-0.15, -11.5, 1.6], [0.9, -12, 1.2]]) {
    q.cyl(x, y0, z, 0.035, y0 + h * 0.5, 6, bark, { r1: 0.025, caps: [false, false] });
    q.blob(x, y0 + h * 0.62, z, h * 0.28, h * 0.26, h * 0.28, leaf, { sub: 2, seed: x * 9 });
    q.blob(x + h * 0.12, y0 + h * 0.78, z, h * 0.2, h * 0.18, h * 0.2, leaf, { sub: 2, seed: z * 3 });
  }
  q.box(-3, y0, -14.2, 3, y0 + 0.35, -14, st(0xc9bda4, PAT.STONE));
  // someone walking away down the hall
  const px = 0.06, pz = -2.1, s = 0.31;
  const coat = st(0x4a4540, PAT.CLOTH), skin = st(0xd9b9a0, PAT.PLAIN);
  q.cyl(px - 0.035 * s * 3, y0, pz, 0.028, y0 + 0.27, 6, st(0x2f2b27, PAT.CLOTH), { r1: 0.026 });
  q.cyl(px + 0.035 * s * 3, y0, pz + 0.04, 0.028, y0 + 0.27, 6, st(0x2f2b27, PAT.CLOTH), { r1: 0.026 });
  q.lathe(px, y0 + 0.24, pz, [[0.075, 0], [0.08, 0.12], [0.075, 0.22], [0.055, 0.26], [0, 0.27]], 10, coat, { edges: [1, 0, 0, 0, 0] });
  q.blob(px, y0 + 0.555, pz, 0.038, 0.045, 0.038, skin, { sub: 1, lump: 0.02 });
  q.blob(px, y0 + 0.585, pz - 0.004, 0.05, 0.016, 0.05, st(0x2f2b27, PAT.PLAIN), { sub: 1, lump: 0 });
  q.cyl(px, y0 + 0.57, pz, 0.03, y0 + 0.62, 8, st(0x2f2b27, PAT.PLAIN));
}

function room(q, blk, seed) {
  const F = recessFaces(blk);
  const outer = blk.x0 < 0 ? 'left' : 'right';
  const inner = outer === 'left' ? 'right' : 'left';
  const sgn = blk.x0 < 0 ? -1 : 1; // outer wall at x = sgn·|x|
  const xo = outer === 'left' ? blk.x0 : blk.x1;
  q.quad(...F.floor, boards, [1, 1, 1, 1]);
  q.quad(...F.ceil, plasterPale, [1, 1, 1, 1]);
  q.quad(...F[outer], plaster, [1, 1, 1, 1]);
  q.quad(...F[inner], plaster, [1, 1, 1, 1]);
  q.quad(...F.far, plaster, [1, 1, 1, 1]);
  // bookcase along the outer wall
  const R = rng(seed);
  const dpt = 0.075, z0 = -0.03, z1 = -blk.F + 0.03;
  const xa = (v) => xo - sgn * v; // distance v into the room
  const box = (v0, ya, za, v1, yb, zb, s) => q.box(Math.min(xa(v0), xa(v1)), ya, Math.min(za, zb), Math.max(xa(v0), xa(v1)), yb, Math.max(za, zb), s);
  const levels = [-0.68, -0.5, -0.32, -0.14, 0.04];
  for (const y of levels) box(0, y, z0, dpt, y + 0.012, z1, shelfWood);
  box(0, blk.y0, z0, dpt, 0.18, z0 - 0.012, shelfWood);
  box(0, blk.y0, z1 + 0.012, dpt, 0.18, z1, shelfWood);
  for (let l = 0; l < levels.length; l++) {
    const yb = levels[l] + 0.012, top = l < levels.length - 1 ? levels[l + 1] : 0.18;
    let z = z0 - 0.015;
    while (z > z1 + 0.04) {
      const w = 0.016 + R() * 0.016, h = (top - yb) * (0.7 + R() * 0.24);
      const lean = R() < 0.06;
      const col = BOOKS[Math.floor(R() * BOOKS.length)];
      if (!lean) box(0.006, yb, z, dpt - 0.004 - R() * 0.01, yb + h, z - w, st(col, PAT.PLAIN));
      z -= w + (R() < 0.08 ? 0.03 : 0.002);
    }
  }
  // far wall: a tall window onto the sky, and a reading desk under it
  const wx = (xo + (F.far[outer === 'left' ? 1 : 0][0])) / 2;
  const zf = -blk.F;
  const ww = 0.055;
  q.box(wx - ww - 0.012, -0.36, zf, wx + ww + 0.012, 0.12, zf + 0.008, dressed);
  q.box(wx - ww, -0.34, zf, wx + ww, 0.1, zf + 0.012, sky);
  q.box(wx - 0.004, -0.34, zf, wx + 0.004, 0.1, zf + 0.016, dressed);
  q.box(wx - ww, -0.13, zf, wx + ww, -0.122, zf + 0.016, dressed);
  q.box(wx - 0.07, blk.y0, zf, wx + 0.07, blk.y0 + 0.2, zf + 0.12, doorWood);
  q.cyl(wx + 0.03, blk.y0 + 0.2, zf + 0.06, 0.008, blk.y0 + 0.29, 6, brass);
  q.lathe(wx + 0.03, blk.y0 + 0.27, zf + 0.06, [[0.01, 0], [0.04, 0.02], [0.03, 0.06], [0, 0.065]], 8, st(0x5f7a5a, PAT.PLAIN), { edges: [1, 1, 0, 0] });
}

export function buildIntended(b) {
  b.push(M.S(1 / Q));
  const q = new QB(b);
  facade(q);
  hall(q);
  room(q, BLOCKS[1], 3);
  room(q, BLOCKS[2], 8);
  b.pop();
  for (const blk of [BLOCKS[3], BLOCKS[4]]) {
    b.push(M.S(1 / Q));
    const qn = new QB(b);
    const F = recessFaces(blk);
    for (const k of ['left', 'right', 'ceil', 'floor', 'far']) qn.quad(...F[k], k === 'ceil' ? plasterPale : plaster, [1, 1, 1, 1]);
    b.pop();
    // round window: a disc in the plane z = −F
    const outerX = blk.x0 < 0 ? blk.x0 : blk.x1;
    const innerFar = blk.x0 < 0 ? F.far[1][0] : F.far[0][0];
    const cx = (outerX + innerFar) / 2, cy = (F.far[0][1] + blk.y1) / 2;
    const r = Math.min(Math.abs(outerX - innerFar), blk.y1 - F.far[0][1]) * 0.36;
    b.push(M.chain(M.T(cx, cy, -blk.F), M.RX(Math.PI / 2), M.S(1 / Q)));
    const qr = new QB(b);
    qr.cyl(0, 0, 0, r * 1.3, 0.006, 24, dressed, {});
    qr.cyl(0, 0, 0, r, 0.009, 24, sky, {});
    b.pop();
  }
}
