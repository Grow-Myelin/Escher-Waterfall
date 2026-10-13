// Ground, courtyard buildings and the man leaning on the aqueduct.

import { PAT, st } from './builder.js';
import { HW, GROUND, TOPW, PT } from './layout.js';
import { windowOn } from './mill.js';
import { leaningMan } from './figures.js';

const sCobble = st(0xb9ae98, PAT.COBBLE);
const sSoil = st(0x9c8f72, PAT.SOIL);
const sGrass = st(0x8d9466, PAT.GRASS);
const sAshlar = st(0xcfc4ad, PAT.ASHLAR);
const sStone = st(0xd8cfba, PAT.ASHLAR);
const sPlaster2 = st(0xd8ccb3, PAT.PLASTER);
const sWall = st(0xb2a58b, PAT.STONE);
const sDoor = st(0x5c4330, PAT.WOOD);
const sDark = st(0x2e2b28, PAT.PLAIN);
const sTile = st(0x7d5a49, PAT.TILE);
const sTileEdge = st(0x5e4337, PAT.PLAIN);

export const B1 = { x0: HW + 0.08, x1: 10, z0: -19, z1: -10.5, top: 0 };
export const RB = { x0: 10, x1: 17.5, z0: -26, z1: -12, top: 5 };

export function buildGround(b) {
  const g0 = GROUND - 0.6;
  // courtyard to the right of the aqueduct and in front of it
  b.box(HW, g0, -26, 24, GROUND, 28, sCobble, {});
  b.box(-HW, g0, 4.2, HW, GROUND, 28, sCobble, {});
  // the mill's ground and the garden
  b.box(-24, g0, -14.25, -HW, GROUND, 28, sSoil, { top: sGrass });
  // behind the lower channel
  b.box(-14.35, g0, -26, HW, GROUND, PT.c1[2] - HW, sSoil, { top: sGrass });
  // low garden wall on the far left
  b.box(-24.6, GROUND, -14.25, -24, GROUND + 2.2, 28, sWall, { ao: 0.75 });
  b.box(-24.7, GROUND + 2.2, -14.25, -23.9, GROUND + 2.4, 28, sStone, {});
  // edging of the garden bed in front of the basin
  b.box(-13, GROUND, 11.6, 4.2, GROUND + 0.45, 11.9, sStone, {});
  b.box(4.2, GROUND, 11.6, 4.5, GROUND + 0.45, 28, sStone, {});
  b.box(-13, GROUND, 11.9, 4.2, GROUND + 0.06, 28, sSoil, {});
}

export function buildCourtyard(b) {
  // ---- B1: low block against the aqueduct, flat roof at channel level
  const { x0, x1, z0, z1, top } = B1;
  b.box(x0, GROUND, z0, x1, top - 0.4, z1, sAshlar, { ao: 0.7, skip: ['py'] });
  b.box(x0, top - 0.4, z0 - 0.1, x1 + 0.1, top, z1 + 0.1, sStone, { top: st(0xc6bba5, PAT.COBBLE) });
  // parapet along the open edges of the roof
  b.box(x1 - 0.35, top, z0 - 0.1, x1 + 0.1, top + 1.0, z1 + 0.1, sStone, { ao: 0.85 });
  b.box(x0 + 1.7, top, z1 - 0.25, 6.0, top + 1.0, z1 + 0.1, sStone, { ao: 0.85 });
  // arched door and windows on the front
  b.box(2.6, GROUND, z1, 4.2, GROUND + 2.4, z1 + 0.02, sDoor, { skip: ['nx', 'nz'] });
  b.box(2.4, GROUND, z1, 2.6, GROUND + 2.6, z1 + 0.1, sStone, {});
  b.box(4.2, GROUND, z1, 4.4, GROUND + 2.6, z1 + 0.1, sStone, {});
  b.box(2.4, GROUND + 2.4, z1, 4.4, GROUND + 2.75, z1 + 0.14, sStone, {});
  windowOn(b, 'pz', z1, 3.4, -4.6, 0.8, 1.2, {});
  windowOn(b, 'px', x1, -13.0, -5.6, 0.9, 1.4, {});
  windowOn(b, 'px', x1, -16.6, -5.6, 0.9, 1.4, {});
  windowOn(b, 'px', x1, -14.8, -1.9, 0.9, 1.1, { bars: false });

  // ---- stairs from the courtyard up to B1's roof, climbing towards -z
  const sx0 = 6.2, sx1 = 8.3;
  const steps = 18, rise = (top - GROUND) / steps, run = 0.46;
  const zStart = z1 + steps * run;
  for (let i = 0; i < steps; i++) {
    const za = zStart - (i + 1) * run, zb = zStart - i * run;
    b.box(sx0, GROUND, za, sx1, GROUND + (i + 1) * rise, zb, sStone, { ao: 0.8, skip: ['px'] });
  }
  // stair wall on the open side, with a sloping top
  {
    const w0 = sx1, w1 = sx1 + 0.3, hr = 1.0;
    const zA = zStart, zB = z1;
    const yA = GROUND + rise + hr, yB = top + hr;
    b.quad([w1, GROUND, zA], [w1, GROUND, zB], [w1, yB, zB], [w1, yA, zA], sWall, [1, 1, 1, 1], { k: [0.75, 0.75, 1, 1] });
    b.quad([w0, yA, zA], [w1, yA, zA], [w1, yB, zB], [w0, yB, zB], sStone, [1, 1, 1, 1]);
    b.quad([w0, GROUND, zA], [w1, GROUND, zA], [w1, yA, zA], [w0, yA, zA], sWall, [1, 1, 1, 1], { k: [0.75, 0.75, 1, 1] });
    b.quad([w0, GROUND, zB], [w0, GROUND, zA], [w0, yA, zA], [w0, yB, zB], sWall, [1, 1, 1, 1]);
  }

  // ---- RB: taller house on the right with a tiled roof
  {
    const { x0: a0, x1: a1, z0: c0, z1: c1, top: tp } = RB;
    b.box(a0, GROUND, c0, a1, GROUND + 3.2, c1, sAshlar, { ao: 0.7, skip: ['py'] });
    b.box(a0, GROUND + 3.2, c0, a1, tp, c1, sPlaster2, { skip: ['py'], ao: 0.9 });
    b.box(a0 - 0.1, GROUND + 3.0, c0 - 0.1, a1 + 0.1, GROUND + 3.3, c1 + 0.1, sStone, {});
    b.box(a0 - 0.15, tp - 0.3, c0 - 0.15, a1 + 0.15, tp, c1 + 0.15, sStone, {});
    // hipped roof
    const rh = 3.2, o = 0.45;
    const X0 = a0 - o, X1 = a1 + o, Z0 = c0 - o, Z1 = c1 + o;
    const ry = tp + rh, rz0 = c0 + (a1 - a0) / 2, rz1 = c1 - (a1 - a0) / 2;
    const xm = (a0 + a1) / 2;
    const ey = tp - 0.2;
    b.quad([X1, ey, Z1], [X1, ey, Z0], [xm, ry, rz0], [xm, ry, rz1], sTile, [1, 1, 1, 1]); // +x slope
    b.tri([X0, ey, Z1], [X1, ey, Z1], [xm, ry, rz1], sTile, [1, 1, 1]);
    b.quad([X0, ey, Z0], [X0, ey, Z1], [xm, ry, rz1], [xm, ry, rz0], sTile, [1, 1, 1, 1]); // -x slope
    b.tri([X1, ey, Z0], [X0, ey, Z0], [xm, ry, rz0], sTile, [1, 1, 1]);
    b.box(xm - 0.15, ry - 0.08, rz0, xm + 0.15, ry + 0.12, rz1, sTileEdge, {});
    // windows: three floors on both visible faces
    const rows = [GROUND + 1.6, GROUND + 5.6, GROUND + 9.9];
    for (const v of rows.slice(1)) {
      for (const u of [11.8, 15.6]) windowOn(b, 'pz', c1, u, v, 0.95, 1.6, { shutters: v === rows[2] });
      for (const u of [-14.2, -18.0, -21.8]) windowOn(b, 'px', a1, u, v, 0.95, 1.6, { shutters: v === rows[2] });
    }
    // ground floor: door and small windows
    b.box(12.9, GROUND, c1, 14.5, GROUND + 2.5, c1 + 0.02, sDoor, { skip: ['nx', 'nz'] });
    b.box(12.7, GROUND + 2.5, c1, 14.7, GROUND + 2.8, c1 + 0.14, sStone, {});
    b.box(12.7, GROUND, c1, 12.9, GROUND + 2.5, c1 + 0.12, sStone, {});
    b.box(14.5, GROUND, c1, 14.7, GROUND + 2.5, c1 + 0.12, sStone, {});
    for (const u of [-15.5, -20.5]) windowOn(b, 'px', a1, u, rows[0], 0.8, 0.9, { bars: false });
    // a small balcony on the +x side
    b.box(a1, GROUND + 7.4, -19.4, a1 + 1.1, GROUND + 7.65, -16.4, sStone, {});
    for (let z = -19.3; z <= -16.45; z += 0.36) b.box(a1 + 0.95, GROUND + 7.65, z - 0.04, a1 + 1.03, GROUND + 8.55, z + 0.04, sDark, {});
    for (let x = a1 + 0.15; x < a1 + 1.0; x += 0.36) {
      b.box(x - 0.04, GROUND + 7.65, -16.48, x + 0.04, GROUND + 8.55, -16.4, sDark, {});
    }
    b.box(a1 + 0.9, GROUND + 8.55, -19.4, a1 + 1.08, GROUND + 8.65, -16.4, sDark, {});
    b.box(a1, GROUND + 8.55, -16.48, a1 + 1.08, GROUND + 8.65, -16.4, sDark, {});
  }

  // ---- a well and a few barrels in the courtyard
  {
    const wx = 12.2, wz = -2.4;
    b.lathe(wx, GROUND, wz, [[1.05, 0], [1.05, 0.95], [1.2, 0.95], [1.2, 1.15], [0.82, 1.15], [0.82, 0.6], [0.0, 0.6]], 18, sStone, { edges: [1, 0, 1, 1, 1, 1, 0], flat: true });
    for (const sx of [-1, 1]) b.box(wx + sx * 0.95 - 0.09, GROUND + 1.15, wz - 0.09, wx + sx * 0.95 + 0.09, GROUND + 3.0, wz + 0.09, sDoor, {});
    b.box(wx - 1.05, GROUND + 2.75, wz - 0.06, wx + 1.05, GROUND + 2.88, wz + 0.06, sDoor, {});
    b.quad([wx - 1.3, GROUND + 2.85, wz + 0.75], [wx + 1.3, GROUND + 2.85, wz + 0.75], [wx + 1.3, GROUND + 3.45, wz], [wx - 1.3, GROUND + 3.45, wz], sTile, [1, 1, 1, 1]);
    b.quad([wx + 1.3, GROUND + 2.85, wz - 0.75], [wx - 1.3, GROUND + 2.85, wz - 0.75], [wx - 1.3, GROUND + 3.45, wz], [wx + 1.3, GROUND + 3.45, wz], sTile, [1, 1, 1, 1]);
    b.lathe(wx + 0.1, GROUND + 1.9, wz, [[0.18, 0], [0.22, 0.35], [0.0, 0.35]], 10, sDark, {});
    b.box(wx + 0.08, GROUND + 2.25, wz - 0.01, wx + 0.12, GROUND + 2.8, wz + 0.01, sDark, {});
    const barrel = (x, z) => b.lathe(x, GROUND, z, [[0.42, 0], [0.5, 0.5], [0.42, 1.0], [0, 1.0]], 12, sDoor, { edges: [1, 0, 1, 0] });
    barrel(9.1, -9.7);
    barrel(9.4, -8.6);
    barrel(5.4, -9.9);
  }

  // ---- the man leaning on the parapet of S1, watching the water go by
  leaningMan(b, HW + 0.78, B1.top, -12.6, Math.PI / 2, TOPW - B1.top, 0.72);
}
