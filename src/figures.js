// Small helpers for people and limbs.

import * as THREE from 'three';
import { PAT, st, M } from './builder.js';

const UP = new THREE.Vector3(0, 1, 0);

// Tapered cylinder from p0 to p1.
export function limb(b, p0, p1, r, s, o = {}) {
  const d = new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
  const L = d.length();
  if (L < 1e-6) return;
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.normalize());
  const m = new THREE.Matrix4().compose(new THREE.Vector3(p0[0], p0[1], p0[2]), q, new THREE.Vector3(1, 1, 1));
  b.push(m);
  b.cyl(0, 0, 0, r, L, o.seg ?? 6, s, { r1: o.r1 ?? r * 0.85, rim: o.rim ?? [0, 1], caps: o.caps ?? [false, true] });
  b.pop();
}

const skin = st(0xd9b9a0, PAT.PLAIN);
const hairDark = st(0x3b3029, PAT.PLAIN);

// A woman pegging out laundry. Local frame: standing at the origin, facing -z.
export function woman(b, x, y, z, rotY) {
  b.push(M.chain(M.T(x, y, z), M.RY(rotY)));
  const dress = st(0x55504a, PAT.CLOTH);
  const blouse = st(0xe6dfd0, PAT.CLOTH);
  b.lathe(0, 0, 0, [[0.4, 0], [0.4, 0.06], [0.36, 0.35], [0.27, 0.85], [0.2, 1.06], [0.0, 1.06]], 12, dress, { edges: [1, 1, 0, 0, 0, 0] });
  // apron
  b.box(-0.2, 0.25, -0.33, 0.2, 1.0, -0.2, st(0xf2ede2, PAT.CLOTH), { skip: ['pz'] });
  b.box(-0.2, 1.02, -0.14, 0.2, 1.52, 0.13, blouse, {});
  limb(b, [0, 1.5, 0], [0, 1.62, -0.02], 0.07, skin);
  b.blob(0, 1.75, -0.03, 0.15, 0.17, 0.15, skin, { lump: 0.03 });
  b.blob(0, 1.82, 0.08, 0.15, 0.13, 0.13, hairDark, { lump: 0.05 });
  b.blob(0, 1.84, 0.2, 0.08, 0.08, 0.08, hairDark, { lump: 0.02 });
  // arms raised to the line
  for (const sx of [-1, 1]) {
    const sh = [0.23 * sx, 1.47, 0];
    const el = [0.3 * sx, 1.86, -0.14];
    const ha = [0.15 * sx, 2.3, -0.3];
    limb(b, sh, el, 0.065, blouse);
    limb(b, el, ha, 0.055, skin);
    b.blob(ha[0], ha[1], ha[2], 0.06, 0.06, 0.06, skin, { lump: 0.02, sub: 0 });
  }
  // feet
  b.box(-0.17, 0, -0.12, -0.05, 0.08, 0.12, hairDark, {});
  b.box(0.05, 0, -0.12, 0.17, 0.08, 0.12, hairDark, {});
  b.pop();
}

// A man leaning on a parapet, forearms resting on it. Facing -z, the parapet
// top at height `ph` and `pd` in front of his feet.
export function leaningMan(b, x, y, z, rotY, ph = 1.5, pd = 0.7) {
  b.push(M.chain(M.T(x, y, z), M.RY(rotY)));
  const trousers = st(0x45403a, PAT.CLOTH);
  const jacket = st(0x6e675c, PAT.CLOTH);
  const hat = st(0x2f2a25, PAT.PLAIN);
  // legs, slightly apart, set back
  for (const sx of [-1, 1]) {
    limb(b, [0.11 * sx, 0.05, 0.12], [0.1 * sx, 0.95, 0.02], 0.1, trousers, { r1: 0.11 });
    b.box(0.1 * sx - 0.07, 0, -0.08, 0.1 * sx + 0.07, 0.09, 0.2, hat, {});
  }
  // torso leaning forward
  const lean = -0.55;
  b.push(M.chain(M.T(0, 0.93, 0.02), M.RX(lean)));
  b.box(-0.24, 0, -0.14, 0.24, 0.72, 0.15, jacket, { ao: 0.85 });
  b.pop();
  const top = [0, 0.93 + 0.72 * Math.cos(lean), 0.02 + 0.72 * Math.sin(lean)];
  limb(b, top, [0, top[1] + 0.12, top[2] - 0.05], 0.075, skin);
  const head = [0, top[1] + 0.25, top[2] - 0.12];
  b.blob(head[0], head[1], head[2], 0.15, 0.16, 0.15, skin, { lump: 0.03 });
  // hat
  b.cyl(head[0], head[1] + 0.07, head[2], 0.26, head[1] + 0.1, 12, hat, {});
  b.cyl(head[0], head[1] + 0.1, head[2], 0.15, head[1] + 0.26, 10, hat, { r1: 0.14 });
  // arms: shoulders to elbows on the parapet, forearms folded along it
  for (const sx of [-1, 1]) {
    const sh = [0.27 * sx, top[1] - 0.06, top[2] + 0.02];
    const el = [0.26 * sx, ph + 0.07, -pd + 0.12];
    const ha = [-0.06 * sx, ph + 0.07, -pd - 0.08];
    limb(b, sh, el, 0.08, jacket);
    limb(b, el, ha, 0.07, jacket);
    b.blob(ha[0], ha[1], ha[2], 0.06, 0.05, 0.07, skin, { lump: 0.02, sub: 0 });
  }
  b.pop();
}
