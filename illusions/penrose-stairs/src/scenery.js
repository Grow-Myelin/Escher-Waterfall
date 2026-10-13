// Everything around the building: a paved square, a terraced hillside rising
// behind it, trees, cypresses and a fountain. Only meaningful from the
// isometric angle, so it fades out when the trick is revealed.

import * as THREE from 'three';
import { PAT, st } from '../../../src/builder.js';
import { BASE } from './stairs.js';

const F = 34; // half-size of the world square

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function tree(b, x, y, z, s, haze, seed) {
  const sTrunk = st(0x6b5a48, PAT.WOOD, { f: haze });
  const sLeaf = st(0x7d8a62, PAT.FOLIAGE, { f: haze });
  b.cyl(x, y, z, 0.13 * s, y + 1.1 * s, 6, sTrunk, { r1: 0.1 * s });
  b.blob(x, y + 1.7 * s, z, 0.8 * s, 0.75 * s, 0.8 * s, sLeaf, { sub: 2, lump: 0.16, seed });
  b.blob(x + 0.35 * s, y + 2.2 * s, z - 0.2 * s, 0.5 * s, 0.45 * s, 0.5 * s, sLeaf, { sub: 1, lump: 0.12, seed: seed + 3 });
}

function cypress(b, x, y, z, s, haze) {
  const sLeaf = st(0x5f6f50, PAT.FOLIAGE, { f: haze });
  b.lathe(x, y, z, [[0.12 * s, 0], [0.42 * s, 0.5 * s], [0.48 * s, 1.4 * s], [0.38 * s, 2.5 * s], [0.18 * s, 3.4 * s], [0, 3.9 * s]], 9, sLeaf, { edges: [1, 0, 0, 0, 0, 0] });
}

function shrub(b, x, y, z, s, haze, seed) {
  b.blob(x, y + 0.32 * s, z, 0.42 * s, 0.36 * s, 0.42 * s, st(0x86906b, PAT.FOLIAGE, { f: haze }), { sub: 2, lump: 0.14, seed });
}

export function buildScenery(b) {
  // the square in front of the building
  const sPave = st(0xcfc6b2, PAT.COBBLE);
  b.quad([-F, BASE, F], [F, BASE, F], [F, BASE, -F], [-F, BASE, -F], sPave, [0, 0, 0, 0]);

  // terraced hillside: nested L-shaped terraces round a corner behind the
  // building, set off its axis so no terrace edge lines up with its outline
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const ex = -4.6 - (i - 1) * 3.3; // front edges of terrace i
    const ez = -6.2 - (i - 1) * 3.3;
    const y = BASE + i * 1.15;
    const haze = Math.min(0.6, 0.1 + 0.07 * i);
    const sWall = st(0xc9bea6, PAT.STONE, { f: haze });
    const sTop = st(0xb3b590, PAT.VINE, { f: haze });
    const reachZ = 11 - i * 1.2, reachX = 19 - i * 1.2; // how far each arm runs forward
    b.box(-F, BASE, -F, ex, y, reachZ, sWall, { top: sTop });
    b.box(ex, BASE, -F, reachX, y, ez, sWall, { top: sTop });
    // rows of vines along the terrace, and now and then a tree
    const mx = ex - 1.65, mz = ez - 1.65;
    for (let t = mz - 1.0; t < reachZ - 0.7; t += 1.05) {
      const k = i * 100 + Math.round(t * 3);
      if (rnd(k) < 0.08) continue;
      if (rnd(k + 7) < 0.06 && i > 1) tree(b, mx, y, t, 0.8, haze, k);
      else shrub(b, mx, y, t, 0.75 + rnd(k + 1) * 0.3, haze, k);
    }
    for (let t = mx + 1.0; t < reachX - 0.7; t += 1.05) {
      const k = i * 100 + Math.round(t * 3) + 50;
      if (rnd(k) < 0.08) continue;
      if (rnd(k + 7) < 0.06 && i > 1) tree(b, t, y, mz, 0.8, haze, k);
      else shrub(b, t, y, mz, 0.75 + rnd(k + 1) * 0.3, haze, k);
    }
    if (i % 2 === 0) {
      cypress(b, mx, y, reachZ - 0.9, 1.05, haze);
      cypress(b, reachX - 0.9, y, mz, 1.05, haze);
    }
  }

  // the square: a pair of trees, cypresses and a fountain
  tree(b, -3.9, BASE, 11.0, 1.25, 0, 3);
  tree(b, 17.0, BASE, 2.0, 1.15, 0, 8);
  cypress(b, -3.2, BASE, 4.0, 1.35, 0);
  cypress(b, 6.0, BASE, -3.4, 1.3, 0);
  const sStone = st(0xd2c8b3, PAT.ASHLAR);
  const fx = 19.0, fz = 17.0;
  b.lathe(fx, BASE, fz, [[1.9, 0], [1.9, 0.55], [1.65, 0.6], [1.6, 0.35], [0, 0.35]], 20, sStone, { edges: [1, 0, 1, 1, 0] });
  b.lathe(fx, BASE, fz, [[0.25, 0.35], [0.22, 1.2], [0.7, 1.35], [0.66, 1.5], [0.1, 1.5], [0.08, 1.9], [0, 2.05]], 14, sStone, { edges: [0, 1, 1, 1, 0, 0, 0] });
  b.lathe(fx, BASE, fz, [[1.6, 0.4], [0, 0.4]], 20, st(0x7d97a0, PAT.PLAIN), { edges: [0, 0] });
}

export function sceneryMesh(builder, material) {
  buildScenery(builder);
  const m = new THREE.Mesh(builder.build(), material);
  m.frustumCulled = false;
  return m;
}
