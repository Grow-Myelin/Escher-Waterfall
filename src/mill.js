// The mill house, its terrace with the laundry, and the mill wheel.

import { Builder, PAT, st, M } from './builder.js';
import { GROUND, WHEEL } from './layout.js';
import { woman } from './figures.js';

const sPlaster = st(0xe0d5bd, PAT.PLASTER);
const sPlasterSide = st(0xd6cab1, PAT.PLASTER);
const sBase = st(0xbfb39c, PAT.ASHLAR);
const sStone = st(0xd2c7b0, PAT.ASHLAR);
const sTile = st(0x7d5a49, PAT.TILE);
const sTileEdge = st(0x5e4337, PAT.PLAIN);
const sFrame = st(0xeee7d8, PAT.PLAIN);
const sPane = st(0x39393a, PAT.PANE);
const sWood = st(0x6b4c33, PAT.WOOD);
const sWoodLight = st(0x86664a, PAT.WOOD);
const sIron = st(0x3b3835, PAT.PLAIN);

export const HOUSE = { x0: -11.25, x1: -3.75, z0: -1.4, z1: 6.6, base: -4, eave: 13, ridge: 17.5 };

// Window on a face of a box. face: 'pz' (normal +z) or 'px' (normal +x).
// (u, v) is the centre in the face's (horizontal, vertical) coordinates.
export function windowOn(b, face, plane, u, v, w, h, o = {}) {
  const fr = 0.12, dep = 0.07;
  const pane = o.pane || sPane;
  const frame = o.frame || sFrame;
  const bx = (u0, v0, u1, v1, d0, d1, s, opt = {}) => {
    if (face === 'pz') b.box(u0, v0, plane + d0, u1, v1, plane + d1, s, opt);
    else b.box(plane + d0, v0, u0, plane + d1, v1, u1, s, opt);
  };
  // dark pane, sitting just proud of the wall
  bx(u - w / 2, v - h / 2, u + w / 2, v + h / 2, 0, 0.015, pane, { skip: ['nx', 'nz'] });
  // frame
  bx(u - w / 2 - fr, v - h / 2 - fr, u - w / 2, v + h / 2 + fr, 0, dep, frame);
  bx(u + w / 2, v - h / 2 - fr, u + w / 2 + fr, v + h / 2 + fr, 0, dep, frame);
  bx(u - w / 2, v + h / 2, u + w / 2, v + h / 2 + fr, 0, dep, frame);
  // sill
  bx(u - w / 2 - fr - 0.08, v - h / 2 - fr - 0.1, u + w / 2 + fr + 0.08, v - h / 2, 0, dep + 0.14, frame, { ao: 0.9 });
  // glazing bars
  if (o.bars !== false) {
    bx(u - 0.03, v - h / 2, u + 0.03, v + h / 2, 0, 0.04, frame);
    bx(u - w / 2, v + h * 0.12 - 0.03, u + w / 2, v + h * 0.12 + 0.03, 0, 0.04, frame);
  }
  // shutters
  if (o.shutters) {
    const sw = w / 2 + 0.05;
    bx(u - w / 2 - fr - sw, v - h / 2, u - w / 2 - fr - 0.02, v + h / 2, 0, 0.09, sWoodLight, {});
    bx(u + w / 2 + fr + 0.02, v - h / 2, u + w / 2 + fr + sw, v + h / 2, 0, 0.09, sWoodLight, {});
  }
}

export function buildHouse(b) {
  const H = HOUSE;
  // ground storey in dressed stone, upper storeys plastered
  b.box(H.x0, GROUND, H.z0, H.x1, H.base, H.z1, sBase, { ao: 0.7, skip: ['py'] });
  b.box(H.x0 - 0.1, H.base - 0.35, H.z0 - 0.1, H.x1 + 0.1, H.base, H.z1 + 0.1, sStone, {});
  b.box(H.x0, H.base, H.z0, H.x1, H.eave, H.z1, sPlaster, { skip: ['py'], ao: 0.88 });
  // string course between the floors
  b.box(H.x0 - 0.08, 4.4, H.z0 - 0.08, H.x1 + 0.08, 4.7, H.z1 + 0.08, sStone, {});
  // eaves cornice
  b.box(H.x0 - 0.12, H.eave - 0.3, H.z0 - 0.12, H.x1 + 0.12, H.eave, H.z1 + 0.12, sStone, {});
  // corner quoins on the visible corners
  for (let y = GROUND + 0.4, i = 0; y < H.eave - 0.6; y += 0.62, i++) {
    const l = i % 2 ? 0.55 : 0.85;
    b.box(H.x1 - l, y, H.z1 - 0.01, H.x1 + 0.03, y + 0.5, H.z1 + 0.03, sStone, { skip: ['nx', 'nz'] });
    b.box(H.x1 - 0.01, y, H.z1 - (i % 2 ? 0.85 : 0.55), H.x1 + 0.03, y + 0.5, H.z1, sStone, { skip: ['nx', 'nz', 'pz'] });
  }

  // front (+z) windows and door
  for (const u of [-9.4, -5.6]) {
    windowOn(b, 'pz', H.z1, u, 8.9, 1.1, 1.8, { shutters: true });
    windowOn(b, 'pz', H.z1, u, 1.7, 1.1, 1.8, { shutters: true });
  }
  // door to the terrace
  b.box(-8.2, H.base, H.z1, -6.8, H.base + 2.5, H.z1 + 0.02, sWood, { skip: ['nx', 'nz'] });
  b.box(-8.4, H.base, H.z1, -8.2, H.base + 2.7, H.z1 + 0.08, sFrame, {});
  b.box(-6.8, H.base, H.z1, -6.6, H.base + 2.7, H.z1 + 0.08, sFrame, {});
  b.box(-8.4, H.base + 2.5, H.z1, -6.6, H.base + 2.75, H.z1 + 0.12, sFrame, {});
  // small windows in the stone base
  // side (+x) windows, facing the wheel
  windowOn(b, 'px', H.x1, 4.2, 8.9, 1.0, 1.7, { shutters: true });
  windowOn(b, 'px', H.x1, 4.2, 1.7, 1.0, 1.7, { shutters: true });
  windowOn(b, 'px', H.x1, 1.8, -6.6, 0.7, 0.7, { bars: false });

  // gable roof, ridge along x
  const zr = (H.z0 + H.z1) / 2;
  const ox = 0.35, ozF = 0.5;
  const rx0 = H.x0 - ox, rx1 = H.x1 + ox;
  const eaveF = H.eave - ((H.ridge - H.eave) * ozF) / (H.z1 - zr);
  const t = 0.22;
  // front slope (faces +z, up)
  b.quad([rx0, eaveF, H.z1 + ozF], [rx1, eaveF, H.z1 + ozF], [rx1, H.ridge, zr], [rx0, H.ridge, zr], sTile, [1, 1, 0, 1]);
  // back slope (faces -z, up) – mostly hidden, ends flush with the back wall
  b.quad([rx1, H.eave, H.z0], [rx0, H.eave, H.z0], [rx0, H.ridge, zr], [rx1, H.ridge, zr], sTile, [1, 1, 0, 1]);
  // fascia along the front eave
  b.quad([rx0, eaveF - t, H.z1 + ozF], [rx1, eaveF - t, H.z1 + ozF], [rx1, eaveF, H.z1 + ozF], [rx0, eaveF, H.z1 + ozF], sTileEdge, [1, 1, 1, 1]);
  // verge on the +x gable end
  b.quad([rx1, eaveF - t, H.z1 + ozF], [rx1, H.ridge - t, zr], [rx1, H.ridge, zr], [rx1, eaveF, H.z1 + ozF], sTileEdge, [1, 1, 1, 1]);
  b.quad([rx1, H.ridge - t, zr], [rx1, H.eave - t, H.z0], [rx1, H.eave, H.z0], [rx1, H.ridge, zr], sTileEdge, [1, 1, 1, 1]);
  // ridge tiles
  b.box(rx0, H.ridge - 0.05, zr - 0.16, rx1, H.ridge + 0.16, zr + 0.16, sTileEdge, {});
  // gable wall (+x)
  b.tri([H.x1, H.eave, H.z1], [H.x1, H.eave, H.z0], [H.x1, H.ridge - 0.02, zr], sPlasterSide, [1, 1, 1]);
  windowOn(b, 'px', H.x1, zr, 14.4, 0.6, 0.9, { bars: false });
  // gable wall (-x), never seen in the picture but closes the house when orbiting
  b.tri([H.x0, H.eave, H.z0], [H.x0, H.eave, H.z1], [H.x0, H.ridge - 0.02, zr], sPlasterSide, [1, 1, 1]);
  // chimney
  b.box(-9.9, 13, 4.0, -8.9, 18.3, 5.0, sBase, {});
  b.box(-10.05, 18.3, 3.85, -8.75, 18.55, 5.15, sStone, {});
  b.box(-9.75, 18.55, 4.15, -9.05, 18.8, 4.85, sStone, {});

  // bearing for the wheel axle on the +x wall
  b.box(H.x1, WHEEL.y - 0.55, WHEEL.z - 0.55, H.x1 + 0.35, WHEEL.y + 0.55, WHEEL.z + 0.55, sWood, {});
  b.box(H.x1 + 0.35, WHEEL.y - 0.3, WHEEL.z - 0.3, H.x1 + 0.5, WHEEL.y + 0.3, WHEEL.z + 0.3, sIron, {});
}

export const TERRACE = { x0: -12.6, x1: -3.75, z0: 6.6, z1: 11.2, y: -4 };

export function buildTerrace(b, laundry) {
  const P = TERRACE;
  b.box(P.x0, GROUND, P.z0, P.x1, P.y - 0.3, P.z1, sBase, { ao: 0.7, skip: ['py'] });
  b.box(P.x0 - 0.12, P.y - 0.3, P.z0, P.x1 + 0.12, P.y, P.z1 + 0.12, sStone, { top: st(0xc9bea8, PAT.COBBLE) });
  // balustrade: posts and rail along the front and both sides
  const rail = 1.05;
  const post = (x, z) => b.box(x - 0.05, P.y, z - 0.05, x + 0.05, P.y + rail, z + 0.05, sIron, {});
  for (let x = P.x0 + 0.1; x <= P.x1 - 0.05; x += 0.42) post(x, P.z1 - 0.05);
  for (let z = P.z0 + 0.35; z < P.z1 - 0.1; z += 0.42) { post(P.x0 + 0.1, z); post(P.x1 - 0.1, z); }
  b.box(P.x0 + 0.02, P.y + rail, P.z1 - 0.13, P.x1 - 0.02, P.y + rail + 0.1, P.z1 + 0.03, sIron, {});
  b.box(P.x0 + 0.02, P.y + rail, P.z0, P.x0 + 0.18, P.y + rail + 0.1, P.z1 - 0.13, sIron, {});
  b.box(P.x1 - 0.18, P.y + rail, P.z0, P.x1 - 0.02, P.y + rail + 0.1, P.z1 - 0.13, sIron, {});
  b.box(P.x0 + 0.02, P.y + 0.15, P.z1 - 0.12, P.x1 - 0.02, P.y + 0.22, P.z1 + 0.02, sIron, {});

  // clothes line between two poles
  const lineY = P.y + 2.35, lz = 8.6;
  for (const x of [-11.9, -4.7]) {
    b.box(x - 0.07, P.y, lz - 0.07, x + 0.07, lineY + 0.25, lz + 0.07, sWood, {});
    b.box(x - 0.25, lineY + 0.1, lz - 0.05, x + 0.25, lineY + 0.2, lz + 0.05, sWood, {});
  }
  b.box(-11.9, lineY - 0.02, lz - 0.02, -4.7, lineY + 0.02, lz + 0.02, sIron, {});

  // laundry hangs from the line and sways (amat.z = sway weight)
  const cloths = [
    { x0: -11.5, x1: -10.0, h: 1.6, c: 0xf3efe6 },
    { x0: -9.75, x1: -8.95, h: 1.0, c: 0xc9c3b6, shirt: true },
    { x0: -8.7, x1: -7.3, h: 1.55, c: 0xf0ebe0 },
    { x0: -7.05, x1: -6.35, h: 0.8, c: 0xd9d2c3 },
    { x0: -6.1, x1: -5.1, h: 1.25, c: 0xebe5d8 },
  ];
  for (const cl of cloths) cloth(laundry, cl.x0, cl.x1, lineY, cl.h, lz, cl.c, cl.shirt);
  // pegs
  for (const cl of cloths) for (const x of [cl.x0 + 0.08, cl.x1 - 0.08]) b.box(x - 0.03, lineY - 0.08, lz - 0.04, x + 0.03, lineY + 0.06, lz + 0.04, sWood, {});

  woman(b, -8.0, P.y, lz + 0.42, 0);
  // basket
  b.lathe(-6.0, P.y, 9.7, [[0.3, 0], [0.42, 0.38], [0.44, 0.42], [0.37, 0.42], [0.0, 0.1]], 12, sWoodLight, { edges: [1, 0, 1, 1, 0] });
  b.blob(-6.0, P.y + 0.4, 9.7, 0.33, 0.12, 0.33, st(0xefeadf, PAT.CLOTH), { lump: 0.2, seed: 3 });
}

function cloth(b, x0, x1, top, h, z, color, shirt) {
  const s = st(color, PAT.CLOTH);
  const nx = 6, ny = 6;
  const P = (i, j) => {
    const u = i / nx, v = j / ny;
    const x = x0 + (x1 - x0) * u;
    let y = top - h * v;
    if (shirt && v > 0.25 && (u < 0.18 || u > 0.82)) y = top - h * 0.25 - (h * 0.2) * (v - 0.25);
    return [x, y, z];
  };
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const a = P(i, j + 1), bb = P(i + 1, j + 1), c = P(i + 1, j), d = P(i, j);
      const sw = (v) => Math.pow(Math.max(0, (top - v[1]) / 1.8), 1.3);
      const edges = [j === ny - 1 ? 1 : 0, i === nx - 1 ? 1 : 0, j === 0 ? 1 : 0, i === 0 ? 1 : 0];
      // front and back faces; the sway weight goes in through the style per vertex
      quadSway(b, a, bb, c, d, s, edges, [sw(a), sw(bb), sw(c), sw(d)], [0.92, 0.92, 1, 1]);
      quadSway(b, d, c, bb, a, s, [edges[2], edges[1], edges[0], edges[3]], [sw(d), sw(c), sw(bb), sw(a)], [1, 1, 0.92, 0.92]);
    }
  }
}

// quad with per-vertex sway weight
function quadSway(b, a, bb, c, d, s, edges, w, k) {
  const before = b.mat.length;
  b.quad(a, bb, c, d, s, edges, { k });
  // vertices were emitted as (a, bb, c) and (a, c, d)
  const order = [0, 1, 2, 0, 2, 3];
  for (let i = 0; i < 6; i++) b.mat[before + i * 3 + 2] = w[order[i]];
}

// ------------------------------------------------------------------- wheel

// The wheel is built around its own hub; the caller turns it about x.
export function buildWheel() {
  const b = new Builder();
  const R = WHEEL.r, ri = R - 0.62, half = WHEEL.half;
  const ring = [[ri, -0.08], [R, -0.08], [R, 0.08], [ri, 0.08], [ri, -0.08]];
  for (const sx of [-half, half]) {
    b.push(M.chain(M.T(sx, 0, 0), M.RZ(Math.PI / 2)));
    b.lathe(0, 0, 0, ring, 40, sWood, { edges: [1, 1, 1, 1, 1], flat: true });
    b.pop();
  }
  // paddles / buckets between the rims
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    b.push(M.RX(a));
    b.box(-half + 0.08, ri - 0.05, -0.06, half - 0.08, R + 0.06, 0.06, sWoodLight, { bottom: true });
    // the bucket floor, turned a little
    b.push(M.chain(M.T(0, ri + 0.02, 0), M.RX(0.9)));
    b.box(-half + 0.08, 0, -0.04, half - 0.08, 0.5, 0.04, sWood, { bottom: true });
    b.pop();
    b.pop();
  }
  // spokes
  for (const sx of [-half + 0.02, half - 0.02]) {
    for (let i = 0; i < 8; i++) {
      b.push(M.RX((i / 8) * Math.PI * 2 + 0.2));
      b.box(sx - 0.09, 0.45, -0.1, sx + 0.09, ri + 0.05, 0.1, sWood, { bottom: true });
      b.pop();
    }
  }
  // hub and axle (the axle runs to the bearing on the house)
  b.push(M.RZ(Math.PI / 2));
  b.cyl(0, -half - 0.25, 0, 0.55, half + 0.25, 12, sWood, { caps: [true, true] });
  b.cyl(0, half + 0.25, 0, 0.24, 3.75 + 0.35, 10, sIron, {});
  b.pop();
  return b;
}
