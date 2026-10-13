// The terraced hillside behind the aqueduct.
//
// In the print the far hill is cut into narrow terraces planted with vines.
// They are flat across the top left and fall away to the right, like the far
// side of a valley seen from above. Here that is an amphitheatre of terraces,
// built in its own frame and then slid back along the view axis, far behind
// everything else. The slide does not change where it appears on screen.

import { Builder, PAT, st, M } from './builder.js';
import { screen, fromScreen } from './layout.js';

const N = 22;
const R0 = 31;
const DR = 2.2;
const DH = 1.45;
const TH0 = (95 * Math.PI) / 180;
const TH1 = (352 * Math.PI) / 180;

// Screen position of the bowl's centre and how far back it sits.
export const LAND = { X: -6, Y: -22.2, depth: -200 };

function radius(i, th) {
  return R0 + i * DR + 1.4 * Math.sin(3 * th + 0.15 * i) + 0.55 * Math.sin(7 * th + 0.25 * i + 1.0);
}

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

export function buildLandscape() {
  const b = new Builder();
  const O = fromScreen(LAND.X, LAND.Y, LAND.depth);
  const inFrame = (p) => {
    const [X, Y] = screen([p[0] + O[0], p[1] + O[1], p[2] + O[2]]);
    return X > -32 && X < 38 && Y > -18 && Y < 46;
  };
  const rand = rng(1961);
  const steps = 150;
  b.push(M.T(O[0], O[1], O[2]));
  for (let i = 0; i < N; i++) {
    const haze = Math.min(0.62, 0.3 + i * 0.015);
    const sWallT = st(0xc2b79d, PAT.STONE, { f: haze });
    const sTread = st(0xc4c6a4, PAT.VINE, { f: haze });
    const sVine = st(0x4d5a33, PAT.FOLIAGE, { f: 0.08 + i * 0.006 });
    const sTree = st(0x4f5c36, PAT.FOLIAGE, { f: 0.1 });
    const y0 = i * DH, y1 = (i + 1) * DH;
    for (let k = 0; k < steps; k++) {
      const t0 = TH0 + ((TH1 - TH0) * k) / steps;
      const t1 = TH0 + ((TH1 - TH0) * (k + 1)) / steps;
      const r0 = radius(i, t0), r1 = radius(i, t1);
      const q0 = radius(i + 1, t0), q1 = radius(i + 1, t1);
      const P = (r, t, y) => [r * Math.cos(t), y, r * Math.sin(t)];
      // riser, facing the centre of the bowl
      b.quad(P(r0, t0, y0), P(r1, t1, y0), P(r1, t1, y1), P(r0, t0, y1), sWallT, [0, 0, 1, 0], { k: [0.78, 0.78, 1, 1] });
      // tread
      b.quad(P(r0, t0, y1), P(r1, t1, y1), P(q1, t1, y1), P(q0, t0, y1), sTread, [0, 0, 0, 0], { k: [1, 1, 0.9, 0.9] });
    }
    // rows of vines along the tread
    const rm = R0 + i * DR + DR * 0.5;
    const arc = (TH1 - TH0) * rm;
    const count = Math.floor(arc / 1.05);
    for (let k = 0; k < count; k++) {
      if (rand() < 0.16) continue; // gaps in the rows
      const t = TH0 + ((TH1 - TH0) * (k + 0.5 + (rand() - 0.5) * 0.5)) / count;
      const r = (radius(i, t) + radius(i + 1, t)) / 2 + (rand() - 0.5) * 0.5;
      const p = [r * Math.cos(t), y1, r * Math.sin(t)];
      if (!inFrame(p)) continue;
      if (rand() < 0.008) {
        // a slim cypress now and then
        b.cyl(p[0], y1, p[2], 0.42, y1 + 3.2 + rand() * 1.4, 7, sTree, { r1: 0.0, caps: [false, false], rim: [0, 0] });
      } else {
        // a vine stock: a short rounded bush
        const sz = 0.24 + rand() * 0.2;
        const h = sz * (1.5 + rand() * 0.8);
        b.lathe(p[0], y1, p[2], [[sz * 0.35, 0], [sz, h * 0.3], [sz * 1.05, h * 0.55], [sz * 0.75, h * 0.85], [0, h]], 7, sVine, {});
      }
    }
  }
  // valley floor
  const sFloor = st(0xa5ab83, PAT.GRASS, { f: 0.2 });
  for (let k = 0; k < 40; k++) {
    const t0 = (k / 40) * Math.PI * 2, t1 = ((k + 1) / 40) * Math.PI * 2;
    b.tri([0, 0, 0], [R0 * Math.cos(t1), 0, R0 * Math.sin(t1)], [R0 * Math.cos(t0), 0, R0 * Math.sin(t0)], sFloor, [0, 0, 0]);
  }
  // the slim tower on the hill at the top left of the print
  {
    const lvl = 14;
    const t = (218.5 * Math.PI) / 180;
    const r = radius(lvl, t) + 1.0;
    const x = r * Math.cos(t), z = r * Math.sin(t), y = (lvl + 1) * DH;
    const haze = 0.42;
    const sT = st(0xd6ccb5, PAT.ASHLAR, { f: haze });
    const sR = st(0x7d5a49, PAT.TILE, { f: haze });
    const sW = st(0x3a3633, PAT.PLAIN, { f: haze });
    const h = 9.5, hw = 1.05;
    b.box(x - hw, y, z - hw, x + hw, y + h, z + hw, sT, { ao: 0.8 });
    b.box(x - hw - 0.12, y + h, z - hw - 0.12, x + hw + 0.12, y + h + 0.3, z + hw + 0.12, sT, {});
    // pyramid roof
    const ry = y + h + 0.3, top = ry + 2.4, e = hw + 0.2;
    b.tri([x - e, ry, z + e], [x + e, ry, z + e], [x, top, z], sR, [1, 1, 1]);
    b.tri([x + e, ry, z + e], [x + e, ry, z - e], [x, top, z], sR, [1, 1, 1]);
    b.tri([x + e, ry, z - e], [x - e, ry, z - e], [x, top, z], sR, [1, 1, 1]);
    b.tri([x - e, ry, z - e], [x - e, ry, z + e], [x, top, z], sR, [1, 1, 1]);
    for (const yy of [y + 2.5, y + 5.5, y + 8.0]) {
      b.box(x - 0.18, yy, z + hw, x + 0.18, yy + 0.9, z + hw + 0.02, sW, {});
      b.box(x + hw, yy, z - 0.18, x + hw + 0.02, yy + 0.9, z + 0.18, sW, {});
    }
    // a lower house beside it
    const hx = x + 3.2, hz = z + 0.5;
    b.box(hx - 1.6, y, hz - 1.3, hx + 1.6, y + 2.6, hz + 1.3, sT, { ao: 0.8 });
    b.quad([hx - 1.8, y + 2.6, hz + 1.5], [hx + 1.8, y + 2.6, hz + 1.5], [hx + 1.8, y + 3.8, hz], [hx - 1.8, y + 3.8, hz], sR, [1, 1, 1, 1]);
    b.tri([hx + 1.6, y + 2.6, hz + 1.3], [hx + 1.6, y + 2.6, hz - 1.3], [hx + 1.6, y + 3.7, hz], sT, [1, 1, 1]);
  }
  b.pop();
  return b;
}
