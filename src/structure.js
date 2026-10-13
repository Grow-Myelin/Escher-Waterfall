// The aqueduct, its corners, the two towers and the two polyhedra.

import { PAT, st, withShift, M } from './builder.js';
import {
  S, W, HW, T, FLOOR, WALL, TOPW, PT, LIP_X, TOWER, GROUND,
} from './layout.js';

export const COL = {
  brick: 0xa5765c,
  stone: 0xd8ceb8,
  stoneDark: 0xbfb39b,
  coping: 0xe2d9c4,
  column: 0xddd3bf,
  poly: 0xc4b9a3,
  support: 0x9c7058,
};

const sBrick = st(COL.brick, PAT.BRICK);
const sStone = st(COL.stone, PAT.ASHLAR);
const sCope = st(COL.coping, PAT.ASHLAR);
const sCol = st(COL.column, PAT.PLASTER);
const sColPlain = st(COL.column, PAT.PLAIN);
const sPoly = st(COL.poly, PAT.PLAIN);

const LIP = 0.08; // the floor slab sticks out a little: a stone string course

// ------------------------------------------------------------------ channels

// Straight run along z, centred on x = xc, between z = za and z = zb.
function runZ(b, xc, za, zb, o = {}) {
  const z0 = Math.min(za, zb), z1 = Math.max(za, zb);
  const open = o.open || ['pz', 'nz'];
  b.box(xc - HW - LIP, -FLOOR, z0, xc + HW + LIP, 0, z1, sStone, { open, skip: ['py'] });
  for (const side of [-1, 1]) {
    const xa = side < 0 ? xc - HW : xc + HW - T;
    b.box(xa, 0, z0, xa + T, WALL, z1, sBrick, { open, skip: ['py'], ao: 0.85 });
    b.box(xa - 0.06, WALL, z0, xa + T + 0.06, TOPW, z1, sCope, { open });
  }
}

function runX(b, zc, xa, xb, o = {}) {
  const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
  const open = o.open || ['px', 'nx'];
  b.box(x0, -FLOOR, zc - HW - LIP, x1, 0, zc + HW + LIP, sStone, { open, skip: ['py'] });
  for (const side of [-1, 1]) {
    const za = side < 0 ? zc - HW : zc + HW - T;
    b.box(x0, 0, za, x1, WALL, za + T, sBrick, { open, skip: ['py'], ao: 0.85 });
    b.box(x0, WALL, za - 0.06, x1, TOPW, za + T + 0.06, sCope, { open });
  }
}

// Corner block. `closed` lists the two sides that carry a wall; a post fills
// the corner between the two open sides. Pieces are cut so that no two faces
// overlap in the same plane, and outlines are suppressed where walls continue.
function corner(b, cx, cz, closed) {
  const has = (k) => closed.includes(k);
  const x0 = cx - HW, x1 = cx + HW, z0 = cz - HW, z1 = cz + HW;
  const openSides = ['px', 'nx', 'pz', 'nz'].filter((k) => !has(k));
  const openX = openSides.find((k) => k === 'px' || k === 'nx');
  const openZ = openSides.find((k) => k === 'pz' || k === 'nz');
  const e = 0.06;
  b.box(x0 - (has('nx') ? LIP : 0), -FLOOR, z0 - (has('nz') ? LIP : 0),
    x1 + (has('px') ? LIP : 0), 0, z1 + (has('pz') ? LIP : 0), sStone, { open: openSides, skip: ['py'] });
  // wall on the closed x side, full depth
  const xw = has('px') ? [x1 - T, x1] : [x0, x0 + T];
  b.box(xw[0], 0, z0, xw[1], WALL, z1, sBrick, { open: [openZ], skip: ['py'], ao: 0.85 });
  b.box(xw[0] - e, WALL, z0 - (has('nz') ? e : 0), xw[1] + e, TOPW, z1 + (has('pz') ? e : 0), sCope, { open: [openZ] });
  // wall on the closed z side, stopping at the x wall
  const zw = has('pz') ? [z1 - T, z1] : [z0, z0 + T];
  const zx = has('px') ? [x0, x1 - T] : [x0 + T, x1];
  b.box(zx[0], 0, zw[0], zx[1], WALL, zw[1], sBrick, { open: ['px', 'nx'], skip: ['py'], ao: 0.85 });
  const zcx = has('px') ? [x0, x1 - T - e] : [x0 + T + e, x1];
  b.box(zcx[0], WALL, zw[0] - e, zcx[1], TOPW, zw[1] + e, sCope, { open: ['px', 'nx'] });
  // post in the inner corner
  const px = openX === 'nx' ? [x0, x0 + T] : [x1 - T, x1];
  const pz = openZ === 'nz' ? [z0, z0 + T] : [z1 - T, z1];
  b.box(px[0], 0, pz[0], px[1], WALL, pz[1], sBrick, { open: [openX, openZ], skip: ['py'], ao: 0.85 });
  const pcx = openX === 'nx' ? [x0, x0 + T + e] : [x1 - T - e, x1];
  const pcz = openZ === 'nz' ? [z0, z0 + T + e] : [z1 - T - e, z1];
  b.box(pcx[0], WALL, pcz[0], pcx[1], TOPW, pcz[1], sCope, { open: [openX, openZ] });
}

export function buildChannels(b) {
  const [c1x, , c1z] = PT.c1;
  const [c2x, , c2z] = PT.c2;
  const [c3x, , c3z] = PT.c3;
  const S1_START = 4.2;

  // S1: from the wheel basin to C1, closed by an end wall at the basin
  runZ(b, 0, S1_START - T, c1z + HW);
  b.box(-HW - LIP, -FLOOR, S1_START - T, HW + LIP, 0, S1_START + LIP, sStone, { open: ['nz'], skip: ['py'] });
  b.box(-HW, 0, S1_START - T, HW, WALL, S1_START, sBrick, { open: ['nz'], skip: ['py'], ao: 0.85 });
  b.box(-HW - 0.06, WALL, S1_START - T, HW + 0.06, TOPW, S1_START + 0.06, sCope, { open: ['nz'] });
  corner(b, c1x, c1z, ['px', 'nz']);
  // S2
  runX(b, c2z, c1x - HW, c2x + HW);
  corner(b, c2x, c2z, ['nx', 'pz']);
  // S3
  runZ(b, c3x, c2z - HW, c3z + HW);
  corner(b, c3x, c3z, ['px', 'nz']);
  // S4: open end at the lip, where the water pours out
  runX(b, c3z, c3x - HW, LIP_X, { open: ['px'] });
  // a dressed stone spout at the end of S4
  b.box(LIP_X - 0.3, -FLOOR - 0.25, c3z - HW - LIP, LIP_X, -FLOOR, c3z + HW + LIP, sStone, {});
}

// --------------------------------------------------------------- substructure

export function buildSupports(b) {
  const sWall = st(0xcfc3aa, PAT.ASHLAR);
  const [c1x, , c1z] = PT.c1;
  const [c2x, , c2z] = PT.c2;
  // under S1 and C1 (thickness along x), with an arched passage
  simpleArchWallX(b, -HW, HW, c1z - HW, 4.2, GROUND, -FLOOR, -8, 1.6, -4.6, sWall);
  // small windows and a string course on its visible face
  const sFrame = st(0xd9cfba, PAT.ASHLAR);
  const sPane = st(0x2f2d2b, PAT.PANE);
  for (const z of [-3.6, 0.9]) {
    b.box(HW, -4.3, z - 0.55, HW + 0.02, -3.0, z + 0.55, sPane, { skip: ['nx', 'nz'] });
    b.box(HW, -4.45, z - 0.7, HW + 0.1, -4.3, z + 0.7, sFrame, {});
    b.box(HW, -3.0, z - 0.7, HW + 0.1, -2.82, z + 0.7, sFrame, {});
  }
  b.box(HW, -1.1, c1z + HW + 3.5, HW + 0.08, -0.8, 4.2, sFrame, {});
  // under S2 and C2, running out a little past C2 to close the view behind the wheel
  simpleArchWallZ(b, c1z - HW, c1z + HW, c2x - HW - 2.6, -HW, GROUND, -FLOOR, -5.6, 1.6, -4.6, sWall);
  // the extension past C2 rises to the parapet height
  b.box(c2x - HW - 2.6, -FLOOR, c2z - HW, c2x - HW, TOPW, c2z + HW, sWall, { ao: 1 });
}

const sJamb = st(0x8f8370, PAT.ASHLAR);

// Wall whose thickness runs along x (x0..x1), length along z (z0..z1), with a
// round-arched passage of half-width `half` centred at z = mid.
function simpleArchWallX(b, x0, x1, z0, z1, y0, y1, mid, half, spring, s) {
  b.box(x0, y0, z0, x1, y1, mid - half, s, { ao: 0.72, skip: ['pz'] });
  b.quad([x0, y0, mid - half], [x1, y0, mid - half], [x1, spring, mid - half], [x0, spring, mid - half], sJamb, [1, 1, 0, 1], { k: [0.45, 0.45, 0.62, 0.62] });
  b.box(x0, y0, mid + half, x1, y1, z1, s, { ao: 0.72 });
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI, a1 = ((i + 1) / n) * Math.PI;
    // a runs from 0 (z = mid + half) to PI (z = mid - half)
    const za = mid + half * Math.cos(a0), zb = mid + half * Math.cos(a1);
    const ya = spring + half * Math.sin(a0), yb = spring + half * Math.sin(a1);
    b.quad([x1, ya, za], [x1, yb, zb], [x1, y1, zb], [x1, y1, za], s, [1, 0, 0, 0], { k: [0.9, 0.9, 1, 1] });
    b.quad([x0, yb, zb], [x0, ya, za], [x0, y1, za], [x0, y1, zb], s, [1, 0, 0, 0]);
    b.quad([x0, ya, za], [x0, yb, zb], [x1, yb, zb], [x1, ya, za], sJamb, [1, 0, 1, 0], { k: [0.55, 0.55, 0.62, 0.62] });
  }
}

// Wall whose thickness runs along z (z0..z1), length along x (x0..x1).
function simpleArchWallZ(b, z0, z1, x0, x1, y0, y1, mid, half, spring, s) {
  b.box(x0, y0, z0, mid - half, y1, z1, s, { ao: 0.72, skip: ['px'] });
  b.quad([mid - half, y0, z1], [mid - half, y0, z0], [mid - half, spring, z0], [mid - half, spring, z1], sJamb, [1, 1, 0, 1], { k: [0.45, 0.45, 0.62, 0.62] });
  b.box(mid + half, y0, z0, x1, y1, z1, s, { ao: 0.72 });
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI, a1 = ((i + 1) / n) * Math.PI;
    // a runs from 0 (x = mid - half) to PI (x = mid + half)
    const xa = mid - half * Math.cos(a0), xb = mid - half * Math.cos(a1);
    const ya = spring + half * Math.sin(a0), yb = spring + half * Math.sin(a1);
    b.quad([xa, ya, z1], [xb, yb, z1], [xb, y1, z1], [xa, y1, z1], s, [1, 0, 0, 0], { k: [0.9, 0.9, 1, 1] });
    b.quad([xb, yb, z0], [xa, ya, z0], [xa, y1, z0], [xb, y1, z0], s, [1, 0, 0, 0]);
    b.quad([xa, ya, z0], [xb, yb, z0], [xb, yb, z1], [xa, ya, z1], sJamb, [1, 0, 1, 0], { k: [0.55, 0.55, 0.62, 0.62] });
  }
}

// ------------------------------------------------------------------- towers

// One square column with base and capital. If `split` is given, the shaft is
// cut there: below the cut it is shifted by sLo, above it by sHi. The two
// halves only meet in the isometric picture.
function column(b, x0, z0, y0, y1, o = {}) {
  const c = TOWER.col;
  const x1 = x0 + c, z1 = z0 + c;
  const sLo = o.sLo || 0, sHi = o.sHi ?? sLo;
  const baseH = 0.32, capH = 0.42;
  const cs = withShift(sCol, sLo);
  const ch = withShift(sCol, sHi);
  // base: plinth + torus-like step
  b.box(x0 - 0.12, y0, z0 - 0.12, x1 + 0.12, y0 + 0.18, z1 + 0.12, withShift(sColPlain, sLo), { ao: 0.8 });
  b.box(x0 - 0.06, y0 + 0.18, z0 - 0.06, x1 + 0.06, y0 + baseH, z1 + 0.06, withShift(sColPlain, sLo));
  const ys = y0 + baseH, ye = y1 - capH;
  if (o.split != null) {
    b.box(x0, ys, z0, x1, o.split, z1, cs, { open: ['py'] });
    b.box(x0, o.split, z0, x1, ye, z1, ch, { open: ['ny'] });
  } else {
    b.box(x0, ys, z0, x1, ye, z1, cs, { skip: ['py'] });
  }
  // capital: echinus + abacus
  b.box(x0 - 0.05, ye, z0 - 0.05, x1 + 0.05, ye + 0.2, z1 + 0.05, withShift(sColPlain, sHi), { skip: [] });
  b.box(x0 - 0.15, ye + 0.2, z0 - 0.15, x1 + 0.15, y1, z1 + 0.15, withShift(sColPlain, sHi), { ao: 0.85 });
}

// Four columns standing on the footprint centred at (cx, cz).
function storey(b, cx, cz, y0, y1, o = {}) {
  const c = TOWER.col;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x0 = sx < 0 ? cx - HW : cx + HW - c;
      const z0 = sz < 0 ? cz - HW : cz + HW - c;
      column(b, x0, z0, y0, y1, o);
    }
  }
}

// Square slab with a moulded edge.
function slab(b, cx, cz, y0, y1, half, s = sStone) {
  b.box(cx - half + 0.1, y0, cz - half + 0.1, cx + half - 0.1, y0 + (y1 - y0) * 0.35, cz + half - 0.1, s, { ao: 0.8 });
  b.box(cx - half, y0 + (y1 - y0) * 0.35, cz - half, cx + half, y1, cz + half, s);
}

// Round arch filling one side of the arcade between two corner columns.
function arcadeSide(b, cx, cz, side, y0, spring, top, s) {
  const c = TOWER.col;
  const span = W - 2 * c;
  const r = span / 2;
  const th = 0.28;
  const n = 14;
  // local frame: u along the side, v up, outward normal nrm
  let O, U, N;
  if (side === 'pz') { O = [cx - HW + c, 0, cz + HW]; U = [1, 0, 0]; N = [0, 0, 1]; }
  if (side === 'nz') { O = [cx + HW - c, 0, cz - HW]; U = [-1, 0, 0]; N = [0, 0, -1]; }
  if (side === 'px') { O = [cx + HW, 0, cz + HW - c]; U = [0, 0, -1]; N = [1, 0, 0]; }
  if (side === 'nx') { O = [cx - HW, 0, cz - HW + c]; U = [0, 0, 1]; N = [-1, 0, 0]; }
  const P = (u, v, d) => [O[0] + U[0] * u - N[0] * d, v, O[2] + U[2] * u - N[2] * d];
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI;
    const ua = r + r * Math.cos(a0), ub = r + r * Math.cos(a1);
    const va = spring + r * Math.sin(a0), vb = spring + r * Math.sin(a1);
    // outer face (CCW seen from outside: u increases to the right)
    b.quad(P(ua, va, 0), P(ub, vb, 0), P(ub, top, 0), P(ua, top, 0), s, [1, 0, 0, 0]);
    // inner face
    b.quad(P(ub, vb, th), P(ua, va, th), P(ua, top, th), P(ub, top, th), s, [1, 0, 0, 0]);
    // soffit
    b.quad(P(ub, vb, 0), P(ua, va, 0), P(ua, va, th), P(ub, vb, th), s, [1, 0, 1, 0], { k: [0.75, 0.75, 0.75, 0.75] });
  }
}

export function buildTowers(b) {
  const tw = TOWER;
  // Right tower. Storey 1 stands on C1 and holds up C3; its upper half lives
  // in C3's frame (shifted back by S along the view axis).
  {
    const [cx, , cz] = PT.c1;
    storey(b, cx, cz, TOPW, tw.st1Top, { split: tw.split, sLo: 0, sHi: -S });
    upperTower(b, PT.c3[0], PT.c3[2], 'escher');
  }
  // Left tower. Storey 1 stands on C2 and holds up S4 at P.
  {
    const [cx, , cz] = PT.c2;
    storey(b, cx, cz, TOPW, tw.st1Top, { split: tw.split, sLo: 0, sHi: -S });
    upperTower(b, PT.p[0], PT.p[2], 'cubes');
  }
}

function upperTower(b, cx, cz, kind) {
  const tw = TOWER;
  storey(b, cx, cz, TOPW, tw.st2Top);
  slab(b, cx, cz, tw.ent[0], tw.ent[1], HW + 0.22);
  // arcade storey
  storey(b, cx, cz, tw.ent[1], tw.arcadeTop);
  const sArc = st(COL.stone, PAT.ASHLAR);
  for (const side of ['px', 'nx', 'pz', 'nz']) arcadeSide(b, cx, cz, side, tw.ent[1], tw.spring, tw.arcadeTop, sArc);
  slab(b, cx, cz, tw.slab[0], tw.slab[1], HW + 0.28);
  // plinth for the solid
  b.box(cx - 0.75, tw.plinth[0], cz - 0.75, cx + 0.75, tw.plinth[1], cz + 0.75, sStone, { ao: 0.85 });
  if (kind === 'cubes') compoundOfThreeCubes(b, cx, tw.plinth[1], cz, 3.0, 0.32);
  else eschersSolid(b, cx, tw.plinth[1], cz, 1.05, 0.42);
}

// --------------------------------------------------------------- polyhedra

// Escher's compound of three cubes: one cube turned 45° about each axis.
// `turn` spins the solid about the vertical so the isometric view does not
// look straight down one of its three-fold axes (where it would look flat).
export function compoundOfThreeCubes(b, cx, yBase, cz, edge, turn = 0) {
  const h = edge / 2;
  const reach = h * Math.SQRT2; // lowest point of the cubes turned about x and z
  const cy = yBase + reach;
  for (const rot of [M.RX(Math.PI / 4), M.RY(Math.PI / 4), M.RZ(Math.PI / 4)]) {
    b.push(M.chain(M.T(cx, cy, cz), M.RY(turn), rot));
    b.box(-h, -h, -h, h, h, h, sPoly, { bottom: true });
    b.pop();
  }
}

// Escher's solid (first stellation of the rhombic dodecahedron): the visible
// surface of three flattened octahedra, i.e. the 48 triangles at the 12 tips.
export function eschersSolid(b, cx, yBase, cz, k, turn = 0) {
  const cy = yBase + 2 * k;
  b.push(M.chain(M.T(cx, cy, cz), M.RY(turn), M.T(-cx, -cy, -cz)));
  const axes = [
    [[2, 2, 0], [-2, 2, 0], [0, 0, 2]],
    [[0, 2, 2], [0, -2, 2], [2, 0, 0]],
    [[2, 0, 2], [2, 0, -2], [0, 2, 0]],
  ];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
  const P = (v) => [cx + v[0] * k, cy + v[1] * k, cz + v[2] * k];
  for (const [U, V, Wv] of axes) {
    for (const su of [-1, 1]) for (const sv of [-1, 1]) for (const sw of [-1, 1]) {
      const u = U.map((x) => x * su), v = V.map((x) => x * sv), w = Wv.map((x) => x * sw);
      // the two equator vertices u and v are tips; w is the flattened apex
      let tris = [[u, mid(u, v), mid(u, w)], [v, mid(v, w), mid(v, u)]];
      for (let [a, bb, c] of tris) {
        const n = [
          (bb[1] - a[1]) * (c[2] - a[2]) - (bb[2] - a[2]) * (c[1] - a[1]),
          (bb[2] - a[2]) * (c[0] - a[0]) - (bb[0] - a[0]) * (c[2] - a[2]),
          (bb[0] - a[0]) * (c[1] - a[1]) - (bb[1] - a[1]) * (c[0] - a[0]),
        ];
        const outward = n[0] * (u[0] + v[0] + w[0]) + n[1] * (u[1] + v[1] + w[1]) + n[2] * (u[2] + v[2] + w[2]);
        if (outward < 0) [bb, c] = [c, bb];
        b.tri(P(a), P(bb), P(c), sPoly, [1, 1, 1]);
      }
    }
  }
  b.pop();
}
