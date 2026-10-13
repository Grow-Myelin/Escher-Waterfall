// A low-poly ant: head, mesosoma (thorax) and gaster (abdomen) joined by a
// petiole; six legs on hip joints; elbowed antennae; mandibles.
//
// Local frame: +z forward, +y up (away from the surface), +x to the ant's
// left. The feet rest on y = 0.
//
// Gait: the alternating tripod. Left front, right middle and left hind legs
// swing together while the other three push, then they swap. In stance a foot
// moves backward at exactly the walking speed, so it stays planted on the
// band; in swing it lifts and returns forward.

import * as THREE from 'three';
import { Builder, PAT, st, M } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';

export const S = 1.3; // overall scale; the ant is about 0.72 long

// hips on the mesosoma: [z, x, footZ, footX]
const LEGS = [
  { z: 0.06, x: 0.028, fz: 0.15, fx: 0.17, group: 0 },
  { z: 0.025, x: 0.032, fz: 0.0, fx: 0.2, group: 1 },
  { z: -0.012, x: 0.03, fz: -0.15, fx: 0.18, group: 0 },
];
const HIP_Y = 0.072;
const SWING = 0.3; // yaw amplitude of a leg, radians
// distance walked per gait cycle: in stance (half a cycle) a foot ~0.18 from
// its hip sweeps 2·SWING·0.18 backward, and the body must cover the same
export const STRIDE = 2 * (2 * SWING * 0.18) * S;

function finish(g) {
  const n = g.getAttribute('position').count;
  g.setAttribute('asig', new THREE.Float32BufferAttribute(new Float32Array(n).fill(-1), 1));
  return g;
}

// body: built once, shared
export function antBodyGeometry(colour, pattern) {
  const b = new Builder();
  const c = st(colour, pattern);
  // gaster, tipped slightly up at the back
  b.push(M.chain(M.T(0, 0.098, -0.2), M.RX(-0.22)));
  b.blob(0, 0, 0, 0.078, 0.07, 0.115, c, { sub: 3, lump: 0.0 });
  b.pop();
  // petiole node
  b.blob(0, 0.082, -0.075, 0.022, 0.032, 0.022, c, { sub: 1, lump: 0 });
  // mesosoma, a little humped
  b.push(M.chain(M.T(0, HIP_Y + 0.008, 0.03), M.RX(0.12)));
  b.blob(0, 0, 0, 0.04, 0.042, 0.088, c, { sub: 2, lump: 0.0 });
  b.pop();
  b.blob(0, HIP_Y + 0.035, -0.02, 0.03, 0.022, 0.03, c, { sub: 1, lump: 0 });
  // head
  b.push(M.chain(M.T(0, 0.092, 0.165), M.RX(0.25)));
  b.blob(0, 0, 0, 0.055, 0.048, 0.06, c, { sub: 3, lump: 0.0 });
  b.pop();
  // mandibles
  for (const sx of [-1, 1]) {
    limb(b, [0.022 * sx, 0.07, 0.21], [0.004 * sx, 0.062, 0.245], 0.009, c, { seg: 5, r1: 0.004 });
  }
  return finish(b.build());
}

// one leg in its hip frame; side = +1 for the ant's left (+x), −1 for right
export function antLegGeometry(i, side, colour, pattern) {
  const L = LEGS[i];
  const b = new Builder();
  const c = st(colour, pattern);
  const fx = (L.fx - L.x) * side, fz = L.fz - L.z;
  const knee = [fx * 0.45, 0.06, fz * 0.42];
  const foot = [fx, -HIP_Y, fz];
  limb(b, [0, 0, 0], knee, 0.011, c, { seg: 5, r1: 0.009 });
  limb(b, knee, foot, 0.009, c, { seg: 5, r1: 0.0045 });
  b.blob(knee[0], knee[1], knee[2], 0.011, 0.011, 0.011, c, { sub: 0, lump: 0 });
  return finish(b.build());
}

export function antennaGeometry(side, colour, pattern) {
  const b = new Builder();
  const c = st(colour, pattern);
  const elbow = [0.06 * side, 0.06, 0.035];
  limb(b, [0, 0, 0], elbow, 0.0075, c, { seg: 5, r1: 0.006 });
  limb(b, elbow, [0.085 * side, 0.025, 0.15], 0.006, c, { seg: 5, r1: 0.006 });
  b.blob(0.085 * side, 0.025, 0.15, 0.009, 0.009, 0.012, c, { sub: 0, lump: 0 });
  return finish(b.build());
}

export class Ant {
  constructor(geo, material) {
    this.root = new THREE.Group();
    this.root.add(new THREE.Mesh(geo.body, material));
    this.legs = [];
    for (let i = 0; i < 3; i++) {
      for (const side of [1, -1]) {
        const g = new THREE.Group();
        g.position.set(LEGS[i].x * side, HIP_Y, LEGS[i].z);
        g.add(new THREE.Mesh(geo.legs[i][side > 0 ? 0 : 1], material));
        this.root.add(g);
        // tripod: left front, right middle, left hind swing together
        const tripod = (LEGS[i].group + (side > 0 ? 0 : 1)) % 2;
        this.legs.push({ g, side, tripod, i });
      }
    }
    this.antennae = [];
    for (const side of [1, -1]) {
      const g = new THREE.Group();
      g.position.set(0.022 * side, 0.118, 0.195);
      g.add(new THREE.Mesh(geo.antennae[side > 0 ? 0 : 1], material));
      this.root.add(g);
      this.antennae.push({ g, side });
    }
    this.root.scale.setScalar(S);
  }

  // phase advances by 2π per stride; stride is the distance covered per cycle
  pose(phase, t) {
    for (const L of this.legs) {
      const p = phase + L.tripod * Math.PI;
      // first half of the cycle: stance (foot sweeps back linearly);
      // second half: swing (foot lifts and returns)
      const u = ((p / (Math.PI * 2)) % 1 + 1) % 1;
      let sweep, lift;
      if (u < 0.5) { sweep = 1 - 4 * u; lift = 0; } else { const v = (u - 0.5) * 2; sweep = -1 + 2 * (v * v * (3 - 2 * v)); lift = Math.sin(v * Math.PI); }
      // yaw: foot forward at the start of stance; roll: foot up in swing
      L.g.rotation.y = -sweep * SWING * L.side;
      L.g.rotation.z = lift * 0.34 * L.side;
    }
    for (const A of this.antennae) {
      A.g.rotation.x = Math.sin(t * 3.1 + A.side) * 0.12;
      A.g.rotation.y = Math.sin(t * 2.3 + A.side * 2) * 0.1 * A.side;
    }
  }
}

export function makeAntGeometry(colour, pattern) {
  return {
    body: antBodyGeometry(colour, pattern),
    legs: [0, 1, 2].map((i) => [antLegGeometry(i, 1, colour, pattern), antLegGeometry(i, -1, colour, pattern)]),
    antennae: [antennaGeometry(1, colour, pattern), antennaGeometry(-1, colour, pattern)],
  };
}
