// The traveller: a small cloaked figure with a wide hat. Local frame: feet at
// the origin, facing +z. Built from Builder pieces so it is inked like the
// rest; feet and arms are separate meshes so they can swing.

import * as THREE from 'three';
import { Builder, PAT, st, M } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';

const cloakC = 0xf1ece2;
const trimC = 0x8c4d3b;
const hatC = 0x3a332c;
const skinC = 0xdcbca2;
const bootC = 0x3d342d;

export function buildWalker(material) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const bb = new Builder();
  const cloak = st(cloakC, PAT.CLOTH);
  bb.lathe(0, 0, 0, [[0.135, 0.07], [0.13, 0.1], [0.108, 0.24], [0.086, 0.36], [0.062, 0.42], [0.0, 0.43]], 12, cloak, { edges: [1, 0, 0, 0, 0, 0] });
  // a hem band and a sash
  bb.lathe(0, 0, 0, [[0.138, 0.065], [0.138, 0.095], [0.131, 0.1]], 12, st(trimC, PAT.CLOTH), { edges: [1, 1, 0] });
  // shoulder cape
  bb.lathe(0, 0, 0, [[0.1, 0.33], [0.098, 0.37], [0.07, 0.425], [0.0, 0.44]], 12, st(0xe2dccf, PAT.CLOTH), { edges: [1, 0, 0, 0] });
  // head and hat
  bb.blob(0, 0.49, 0.006, 0.062, 0.068, 0.062, st(skinC, PAT.PLAIN), { sub: 2, lump: 0.02 });
  bb.cyl(0, 0.53, 0, 0.13, 0.545, 16, st(hatC, PAT.PLAIN), {});
  bb.cyl(0, 0.545, 0, 0.066, 0.62, 12, st(hatC, PAT.PLAIN), { r1: 0.05 });
  bb.cyl(0, 0.548, 0, 0.068, 0.565, 12, st(trimC, PAT.PLAIN), {});
  // satchel strap and bag on the left hip
  bb.box(0.08, 0.17, -0.04, 0.13, 0.25, 0.05, st(0x7a5c45, PAT.PLAIN), {});
  const bodyMesh = new THREE.Mesh(bb.build(), material);
  body.add(bodyMesh);

  // feet
  const feet = [];
  for (const sx of [-1, 1]) {
    const fb = new Builder();
    fb.box(-0.032, 0, -0.04, 0.032, 0.045, 0.07, st(bootC, PAT.PLAIN), {});
    const m = new THREE.Mesh(fb.build(), material);
    m.position.x = sx * 0.05;
    root.add(m);
    feet.push(m);
  }
  // arms swing from the shoulders
  const arms = [];
  for (const sx of [-1, 1]) {
    const ab = new Builder();
    limb(ab, [0, 0, 0], [0.012 * sx, -0.15, 0.01], 0.026, st(0xe2dccf, PAT.CLOTH), { r1: 0.022 });
    ab.blob(0.014 * sx, -0.165, 0.012, 0.022, 0.022, 0.022, st(skinC, PAT.PLAIN), { sub: 0 });
    const g = new THREE.Group();
    g.position.set(sx * 0.105, 0.39, 0);
    g.add(new THREE.Mesh(ab.build(), material));
    body.add(g);
    arms.push(g);
  }

  // phase: walk-cycle angle; amt: 0 standing … 1 walking
  function pose(phase, amt) {
    const s = Math.sin(phase);
    for (let i = 0; i < 2; i++) {
      const si = i === 0 ? s : -s;
      const lift = Math.max(0, Math.cos(phase + (i === 0 ? 0 : Math.PI))) * 0.035 * amt;
      feet[i].position.z = si * 0.075 * amt;
      feet[i].position.y = lift;
      arms[i].rotation.x = -si * 0.55 * amt;
    }
    body.position.y = Math.abs(Math.cos(phase)) * 0.016 * amt;
    body.rotation.z = s * 0.03 * amt;
  }
  pose(0, 0);
  return { root, pose };
}
