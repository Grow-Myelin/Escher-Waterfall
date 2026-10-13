// Two files of small hooded figures: one climbs for ever on the outer lane,
// the other descends for ever on the inner lane.
//
// A walker's position is the real 3D point on its lane. Crossing the cut on the
// closing landing, that point jumps by RISE·(1, 1, 1): invisible from the
// isometric angle, plain to see once the camera turns.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { lane, laneAt, RISE } from './stairs.js';

const SPEED = 0.62; // units per second along the lane
const STRIDE = 0.375; // two footfalls per tread

function figure(robe, trim) {
  const b = new Builder();
  const sRobe = st(robe, PAT.CLOTH);
  const sTrim = st(trim, PAT.PLAIN);
  const sFace = st(0x6e5848, PAT.PLAIN);
  // robe: a bell of cloth, slightly fuller at the back
  b.lathe(0, 0.02, 0, [[0.3, 0], [0.31, 0.05], [0.26, 0.38], [0.215, 0.66], [0.215, 0.76], [0.15, 0.85], [0, 0.88]], 12, sRobe, { edges: [1, 1, 0, 0, 0, 0, 0] });
  // rope girdle
  b.cyl(0, 0.5, 0, 0.235, 0.54, 12, sTrim, { rim: [1, 1] });
  // a rounded cowl, its tail falling down the back
  b.blob(0, 0.98, -0.02, 0.165, 0.17, 0.175, sRobe, { sub: 2, lump: 0.03, seed: 2 });
  b.push(new THREE.Matrix4().makeRotationX(2.45).setPosition(0, 1.0, -0.12));
  b.cyl(0, 0, 0, 0.075, 0.36, 7, sRobe, { r1: 0.012, caps: [false, false] });
  b.pop();
  // the face, in the shadow of the hood
  b.push(new THREE.Matrix4().makeRotationX(-0.2).setPosition(0, 0.955, 0.158));
  b.poly(Array.from({ length: 12 }, (_, i) => {
    const t = (i / 12) * Math.PI * 2;
    return [Math.cos(t) * 0.085, Math.sin(t) * 0.1, 0];
  }), sFace);
  b.pop();
  // sleeves, hands folded in front
  for (const sx of [-1, 1]) {
    const sh = new THREE.Vector3(0.17 * sx, 0.8, -0.01);
    const el = new THREE.Vector3(0.15 * sx, 0.58, 0.09);
    const wr = new THREE.Vector3(0.04 * sx, 0.6, 0.2);
    for (const [p, q, r] of [[sh, el, 0.075], [el, wr, 0.07]]) {
      const d = q.clone().sub(p);
      const m = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), new THREE.Vector3(1, 1, 1));
      b.push(m);
      b.cyl(0, 0, 0, r, d.length(), 7, sRobe, { r1: r * 1.1, rim: [0, 1], caps: [false, true] });
      b.pop();
    }
  }
  return b.build();
}

function foot() {
  const b = new Builder();
  b.box(-0.055, 0, -0.07, 0.055, 0.06, 0.1, st(0x2a2520, PAT.PLAIN), {});
  return b.build();
}

export class Walkers {
  constructor(material) {
    this.group = new THREE.Group();
    this.files = [
      // climbing, on the outer lane
      { lane: lane(0.55), dir: 1, n: 15, robe: 0x9d8064, trim: 0xd8c9ad, phase: 0.0 },
      // descending, on the inner lane
      { lane: lane(-0.55), dir: -1, n: 11, robe: 0x6c717a, trim: 0xcfc6b4, phase: 0.37 },
    ];
    const footGeo = foot();
    for (const f of this.files) {
      f.body = new THREE.InstancedMesh(figure(f.robe, f.trim), material, f.n);
      f.feet = new THREE.InstancedMesh(footGeo, material, f.n * 2);
      for (const m of [f.body, f.feet]) {
        m.frustumCulled = false;
        m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.group.add(m);
      }
      // a slightly uneven file: walkers keep their own spacing
      f.offsets = [];
      for (let i = 0; i < f.n; i++) {
        const jitter = Math.sin(i * 12.9898 + f.phase * 7) * 0.22;
        f.offsets.push(((i + jitter) / f.n) * f.lane.length);
      }
    }
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler(0, 0, 0, 'YXZ');
    this.v = new THREE.Vector3();
    this.one = new THREE.Vector3(1, 1, 1);
  }

  // t: walking time; seamless: 1 at the isometric angle (walkers straddling
  // the cut are kept on the top half so neither half hides them), 0 off it.
  update(t, seamless) {
    const { m, q, e, v, one } = this;
    for (const f of this.files) {
      for (let i = 0; i < f.n; i++) {
        const s = f.offsets[i] + f.dir * t * SPEED;
        const { pos, dir, s: sw } = laneAt(f.lane, s);
        // keep a walker that straddles the cut on the near (top) half
        if (seamless && sw < 0.5) { pos[0] += RISE; pos[1] += RISE; pos[2] += RISE; }
        const hx = dir[0] * f.dir, hz = dir[1] * f.dir;
        const yaw = Math.atan2(hx, hz);
        const ph = (sw / STRIDE) * Math.PI;
        const bob = Math.abs(Math.sin(ph)) * 0.035;
        e.set(0.04, yaw, Math.sin(ph) * 0.035);
        q.setFromEuler(e);
        v.set(pos[0], pos[1] + bob, pos[2]);
        m.compose(v, q, one);
        f.body.setMatrixAt(i, m);
        // feet: one forward while the other is back, peeping from the hem
        for (const side of [0, 1]) {
          const sg = side ? 1 : -1;
          const swing = Math.sin(ph) * sg * 0.11;
          const lx = 0.09 * sg, lz = 0.12 + swing;
          const c = Math.cos(yaw), sn = Math.sin(yaw);
          v.set(pos[0] + lx * c + lz * sn, pos[1], pos[2] - lx * sn + lz * c);
          e.set(0, yaw, 0);
          q.setFromEuler(e);
          m.compose(v, q, one);
          f.feet.setMatrixAt(i * 2 + side, m);
        }
      }
      f.body.instanceMatrix.needsUpdate = true;
      f.feet.instanceMatrix.needsUpdate = true;
    }
  }
}
