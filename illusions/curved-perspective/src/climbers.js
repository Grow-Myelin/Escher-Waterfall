// Small figures going up and down the two stairs. They are drawn with the
// same curved projection as the tower, so they lean and stretch with it.

import * as THREE from 'three';
import { Tess, PAT, st } from './tess.js';
import { makeInk } from './shaders.js';
import { A, W, PT, RISE, LANDINGS } from './tower.js';

const MAP = [
  (t, y, q) => [t, y, -q],
  (t, y, q) => [q, y, t],
  (t, y, q) => [-t, y, q],
  (t, y, q) => [-q, y, -t],
];

function geo(build) { const b = new Tess(5); build(b); return b.build(); }

const COLOURS = [0x6d5a4a, 0x4f5f6e, 0x7a4b3a, 0x55634a];
function parts(colour) {
  const cloth = st(colour, PAT.PLAIN);
  const dark = st(new THREE.Color(colour).multiplyScalar(0.6).getHex(), PAT.PLAIN);
  const skin = st(0xe4d8c6, PAT.PLAIN);
  return {
    body: geo((b) => {
      b.lathe(0, 0, 0, [[0.16, 0.86], [0.17, 1.1], [0.2, 1.42], [0.11, 1.52], [0.0, 1.54]], 8, cloth, { edges: [1, 0, 0, 0, 0] });
      b.lathe(0, 0, 0, [[0.0, 1.56], [0.09, 1.6], [0.12, 1.7], [0.1, 1.8], [0.0, 1.84]], 8, skin, {});
    }),
    leg: geo((b) => b.lathe(0, 0, 0, [[0.075, 0], [0.065, -0.45], [0.055, -0.86], [0.0, -0.86]], 6, dark, { edges: [0, 0, 1, 0] })),
    arm: geo((b) => b.lathe(0, 0, 0, [[0.055, 0], [0.045, -0.36], [0.04, -0.6], [0.0, -0.62]], 6, cloth, {})),
  };
}

// The walking line of stair s: flights joined by turns across the landings.
function stairPath(s, lane) {
  const q = A + PT + lane;
  const pts = [];
  const K = RISE / (2 * A);
  for (let k = 0; k < LANDINGS - 1; k++) {
    const c = (k + 2 * s) % 4, h0 = RISE * k;
    if (k > 0) pts.push({ p: MAP[c](-q, h0, q), flat: true });
    for (let i = 0; i <= 8; i++) {
      const t = -A + (i / 8) * 2 * A;
      pts.push({ p: MAP[c](t, h0 + (t + A) * K + 0.12, q), flat: false });
    }
  }
  // cumulative lengths
  let L = 0;
  pts[0].s = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1].p, b = pts[i].p;
    L += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    pts[i].s = L;
  }
  return { pts, total: L };
}

function sample(path, s) {
  const P = path.pts;
  s = Math.max(0, Math.min(path.total, s));
  let lo = 0, hi = P.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].s <= s) lo = m; else hi = m; }
  const a = P[lo], b = P[hi];
  const f = (s - a.s) / Math.max(1e-6, b.s - a.s);
  return {
    p: new THREE.Vector3(a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f, a.p[2] + (b.p[2] - a.p[2]) * f),
    d: new THREE.Vector3(b.p[0] - a.p[0], 0, b.p[2] - a.p[2]).normalize(),
    climbing: Math.abs(b.p[1] - a.p[1]) > 0.01,
  };
}

const SPEED = 1.15;

export class Climbers {
  constructor(scene, uniforms) {
    this.list = [];
    const paths = [[stairPath(0, 0.9), stairPath(0, 1.95)], [stairPath(1, 0.9), stairPath(1, 1.95)]];
    const plan = [
      [0, 0, 1, 0.02], [0, 0, 1, 0.37], [0, 1, -1, 0.15], [0, 1, -1, 0.66],
      [1, 0, 1, 0.12], [1, 0, 1, 0.58], [1, 1, -1, 0.3], [1, 1, -1, 0.82],
    ];
    plan.forEach(([s, lane, dir, phase], i) => {
      const g = parts(COLOURS[i % COLOURS.length]);
      const u = { ...uniforms, uFade: { value: 1 }, uLift: { value: 0.4 } };
      const mat = makeInk(u, { transparent: true });
      const root = new THREE.Group();
      const mk = (gg) => { const m = new THREE.Mesh(gg, mat); m.frustumCulled = false; return m; };
      root.add(mk(g.body));
      const limbs = [];
      for (const sx of [-1, 1]) {
        const hip = new THREE.Group(); hip.position.set(0.09 * sx, 0.88, 0); hip.add(mk(g.leg)); root.add(hip);
        const sh = new THREE.Group(); sh.position.set(0.23 * sx, 1.44, 0); sh.add(mk(g.arm)); root.add(sh);
        limbs.push({ hip, sh });
      }
      root.scale.setScalar(1.12);
      scene.add(root);
      this.list.push({ path: paths[s][lane], dir, phase, root, limbs, u });
    });
  }

  update(t) {
    for (const c of this.list) {
      const total = c.path.total;
      let s = ((t * SPEED / total + c.phase) % 1) * total;
      if (c.dir < 0) s = total - s;
      const here = sample(c.path, s);
      c.root.position.copy(here.p);
      const fwd = here.d.clone().multiplyScalar(c.dir);
      c.root.rotation.set(0, Math.atan2(fwd.x, fwd.z), 0);
      const ph = (s / 1.35) * Math.PI * 2 * c.dir;
      for (let i = 0; i < 2; i++) {
        const sw = Math.sin(ph + i * Math.PI);
        c.limbs[i].hip.rotation.x = -(0.45 * sw + (here.climbing ? 0.25 * Math.max(0, Math.cos(ph + i * Math.PI)) : 0));
        c.limbs[i].sh.rotation.x = 0.4 * sw;
      }
      // fade in and out at the ends of the climb
      const e = Math.min(s, total - s);
      c.u.uFade.value = Math.min(1, e / 3);
      c.root.visible = c.u.uFade.value > 0.01;
    }
  }
}
void W;
