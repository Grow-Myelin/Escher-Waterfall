// The artist: a standing figure in a beret, sketchbook in one hand and pencil
// in the other. Built facing -z with the point midway between the eyes at
// (0, EYE_Y, 0), so the camera can sit exactly there.

import * as THREE from 'three';
import { Builder, st, M } from '../../../src/builder.js';
import { rod } from './room.js';

export const EYE_Y = 1.62;

const COL = {
  skin: 0xd8a588, hair: 0x4b3a2c, jacket: 0x3d4757, trousers: 0x4a4136, shirt: 0xe9e3d3,
  shoe: 0x2a211b, beret: 0x272223, cover: 0x6b2e2a, pencil: 0xc39a2a,
};
const PAPER = 30, CLOTH = 8;

export function buildArtist(material) {
  const group = new THREE.Group();
  const b = new Builder();
  const skin = st(COL.skin), hair = st(COL.hair), jacket = st(COL.jacket, CLOTH), trousers = st(COL.trousers, CLOTH);
  const shirt = st(COL.shirt), shoe = st(COL.shoe), beret = st(COL.beret, CLOTH);

  // legs and shoes
  for (const s of [-1, 1]) {
    b.blob(s * 0.1, 0.045, -0.04, 0.052, 0.045, 0.125, shoe, { sub: 2, lump: 0.02 });
    rod(b, [s * 0.1, 0.94, 0.05], [s * 0.1, 0.07, 0.01], 0.078, 0.055, trousers, 12);
  }
  b.blob(0, 0.95, 0.06, 0.185, 0.12, 0.125, trousers, { sub: 2, lump: 0.02 });
  // torso: an elliptic lathe, the jacket
  b.push(M.chain(M.T(0, 0, 0.07), M.S(1.0, 1, 0.64)));
  b.lathe(0, 0, 0, [[0.17, 0.86], [0.18, 1.0], [0.192, 1.2], [0.208, 1.34], [0.196, 1.41], [0.14, 1.45], [0.06, 1.475]], 20, jacket, { edges: [1, 0, 0, 0, 0, 0, 0] });
  b.pop();
  // shirt front and collar
  b.tri([-0.065, 1.455, -0.052], [0.065, 1.455, -0.052], [0, 1.25, -0.066], shirt, [1, 1, 1]);
  b.cyl(0, 1.43, 0.075, 0.052, 1.53, 12, skin, { caps: [false, false] });
  // head, hair, beard, beret
  b.blob(0, 1.6, 0.085, 0.078, 0.104, 0.094, skin, { sub: 3, lump: 0.015 });
  b.blob(0, 1.628, 0.118, 0.084, 0.088, 0.084, hair, { sub: 2, lump: 0.06, seed: 2 });
  b.blob(0, 1.535, 0.045, 0.07, 0.05, 0.064, hair, { sub: 2, lump: 0.05, seed: 5 });
  b.blob(0, 1.565, -0.012, 0.036, 0.012, 0.016, hair, { sub: 1, lump: 0.0 });
  b.push(M.chain(M.T(0.012, 1.708, 0.095), M.RZ(-0.2), M.RX(0.08)));
  b.blob(0, 0, 0, 0.104, 0.03, 0.098, beret, { sub: 2, lump: 0.04 });
  b.pop();
  b.blob(0.0, 1.742, 0.1, 0.008, 0.012, 0.008, beret, { sub: 1, lump: 0 });
  for (const s of [-1, 1]) {
    b.blob(s * 0.079, 1.6, 0.095, 0.012, 0.026, 0.018, skin, { sub: 1, lump: 0 });
    b.blob(s * 0.031, 1.621, -0.004, 0.011, 0.008, 0.006, st(0x1c1714), { sub: 1, lump: 0 });
    b.box(s * 0.031 - 0.019, 1.643, -0.006, s * 0.031 + 0.019, 1.651, 0.004, hair);
  }
  b.blob(0, 1.592, -0.014, 0.013, 0.026, 0.02, skin, { sub: 1, lump: 0 });
  // shoulders and the arm holding the sketchbook
  b.blob(-0.2, 1.39, 0.075, 0.07, 0.06, 0.07, jacket, { sub: 1, lump: 0 });
  b.blob(0.2, 1.39, 0.075, 0.07, 0.06, 0.07, jacket, { sub: 1, lump: 0 });
  rod(b, [-0.205, 1.39, 0.07], [-0.24, 1.13, 0.0], 0.055, 0.046, jacket, 10);
  b.blob(-0.24, 1.13, 0.0, 0.047, 0.047, 0.047, jacket, { sub: 1, lump: 0 });
  rod(b, [-0.24, 1.13, 0.0], [-0.15, 1.09, -0.22], 0.045, 0.036, jacket, 10);
  rod(b, [-0.159, 1.094, -0.198], [-0.145, 1.088, -0.235], 0.032, 0.03, shirt, 8);
  b.blob(-0.13, 1.09, -0.26, 0.035, 0.03, 0.045, skin, { sub: 2, lump: 0.02 });
  // the sketchbook, tilted towards the face
  b.push(M.chain(M.T(-0.04, 1.115, -0.285), M.RY(0.12), M.RX(0.85)));
  b.box(-0.155, -0.008, -0.11, 0.155, 0.0, 0.11, st(COL.cover), { bottom: true });
  b.quad([-0.148, 0.001, 0.104], [0.148, 0.001, 0.104], [0.148, 0.001, -0.104], [-0.148, 0.001, -0.104], st(0xf0ead8, PAPER), [1, 1, 1, 1], { uv: [[0, 0], [0.3, 0], [0.3, 0.21], [0, 0.21]] });
  b.pop();
  // upper right arm (static)
  rod(b, [0.205, 1.39, 0.07], [0.24, 1.14, 0.0], 0.055, 0.046, jacket, 10);
  b.blob(0.24, 1.14, 0.0, 0.047, 0.047, 0.047, jacket, { sub: 1, lump: 0 });
  const body = new THREE.Mesh(b.build(), material);
  group.add(body);

  // the drawing forearm, hand and pencil: pivots at the elbow
  const a = new Builder();
  rod(a, [0, 0, 0], [-0.17, 0.02, -0.22], 0.045, 0.036, jacket, 10);
  rod(a, [-0.16, 0.019, -0.207], [-0.185, 0.022, -0.24], 0.032, 0.03, shirt, 8);
  a.blob(-0.2, 0.02, -0.265, 0.032, 0.034, 0.044, skin, { sub: 2, lump: 0.02 });
  rod(a, [-0.185, 0.08, -0.235], [-0.225, -0.02, -0.29], 0.0045, 0.003, st(COL.pencil), 6);
  const arm = new THREE.Group();
  arm.position.set(0.24, 1.14, 0.0);
  arm.add(new THREE.Mesh(a.build(), material));
  group.add(arm);
  group.traverse((o) => { o.frustumCulled = false; });
  return { group, arm };
}
