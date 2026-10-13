// Small faceless figures, each walking in its own gravity.
//
// A figure is built in a local frame (y = its up, z = forward) and placed on
// its path with a matrix whose y axis is the up of its world. Nothing about
// the walk knows which way the screen is turned.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';
import { makeInk } from './ink.js';
import { WALKS, PERM, UP_AXIS, mapPt } from './data.js';

export const WORLD_COLOURS = [0xb35a3e, 0x4c8a57, 0x3f68a6];
const SKIN = 0xe6dccd;

function shade(hex, k) {
  const c = new THREE.Color(hex);
  return c.multiplyScalar(k).getHex();
}

// geometry for one world's figures: parts share geometry, materials are per figure
function partGeometries(world) {
  const cloth = st(WORLD_COLOURS[world], PAT.PLAIN, { w: 1 });
  const legs = st(shade(WORLD_COLOURS[world], 0.55), PAT.PLAIN, { w: 1 });
  const skin = st(SKIN, PAT.PLAIN, { w: 1 });
  const shoe = st(0x2d2925, PAT.PLAIN, { w: 1 });
  const g = {};
  let b = new Builder();
  // torso and head
  b.cyl(0, 0.86, 0, 0.15, 1.12, 10, legs, { r1: 0.16, rim: [0, 0] });
  b.cyl(0, 1.08, 0, 0.165, 1.5, 10, cloth, { r1: 0.2, rim: [1, 0] });
  b.blob(0, 1.48, 0, 0.21, 0.07, 0.15, cloth, { sub: 1, lump: 0 });
  limb(b, [0, 1.5, 0], [0, 1.62, 0.01], 0.055, skin, { seg: 6 });
  b.blob(0, 1.72, 0.015, 0.11, 0.135, 0.12, skin, { sub: 2, lump: 0.0 });
  g.body = b.build();
  b = new Builder();
  limb(b, [0, 0, 0], [0, -0.45, 0], 0.085, legs, { r1: 0.065, seg: 7 });
  g.thigh = b.build();
  b = new Builder();
  limb(b, [0, 0, 0], [0, -0.4, 0], 0.062, legs, { r1: 0.05, seg: 7 });
  b.box(-0.05, -0.47, -0.06, 0.05, -0.4, 0.15, shoe, {});
  g.shin = b.build();
  b = new Builder();
  limb(b, [0, 0, 0], [0, -0.29, 0], 0.06, cloth, { r1: 0.05, seg: 6 });
  g.upper = b.build();
  b = new Builder();
  limb(b, [0, 0, 0], [0, -0.26, 0], 0.045, skin, { r1: 0.04, seg: 6 });
  b.blob(0, -0.29, 0, 0.045, 0.05, 0.04, skin, { sub: 0, lump: 0 });
  g.fore = b.build();
  return g;
}

class Figure {
  constructor(geo, uniforms) {
    this.uniforms = { ...uniforms, uFade: { value: 1 }, uLift: { value: 0.42 } };
    const mat = makeInk(this.uniforms, { transparent: true });
    this.mat = mat;
    const M = (gg) => { const m = new THREE.Mesh(gg, mat); m.frustumCulled = false; return m; };
    this.root = new THREE.Group();
    this.root.matrixAutoUpdate = false;
    this.body = new THREE.Group();
    this.root.add(this.body);
    this.body.add(M(geo.body));
    this.legs = [];
    for (const sx of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(0.09 * sx, 0.9, 0);
      hip.add(M(geo.thigh));
      const knee = new THREE.Group(); knee.position.set(0, -0.45, 0);
      knee.add(M(geo.shin));
      hip.add(knee);
      this.body.add(hip);
      this.legs.push({ hip, knee });
    }
    this.arms = [];
    for (const sx of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(0.215 * sx, 1.44, 0);
      sh.rotation.z = 0.08 * sx;
      sh.add(M(geo.upper));
      const el = new THREE.Group(); el.position.set(0, -0.29, 0);
      el.add(M(geo.fore));
      sh.add(el);
      this.body.add(sh);
      this.arms.push({ sh, el });
    }
  }

  // phase: gait phase (radians); climb: 0 on the flat, 1 on stairs; walk: 0 standing
  pose(phase, climb, walk) {
    for (let i = 0; i < 2; i++) {
      const p = phase + i * Math.PI;
      const sw = Math.sin(p), cw = Math.cos(p);
      const lift = Math.max(0, cw);
      const thigh = (0.42 * sw + climb * (0.3 + 0.35 * lift)) * walk;
      const knee = (0.12 + 0.75 * lift * lift + climb * 0.45 * lift) * walk;
      this.legs[i].hip.rotation.x = -thigh;
      this.legs[i].knee.rotation.x = knee;
      this.arms[i].sh.rotation.x = 0.38 * Math.sin(p + Math.PI) * walk;
      this.arms[i].el.rotation.x = -(0.18 + 0.12 * walk);
    }
    // hips rise as each leg passes under them, and dip into each step
    const legs = this.legs;
    this.body.position.y = (0.03 * Math.abs(Math.cos(phase)) - 0.035 - climb * 0.05) * walk;
    this.body.rotation.x = (0.05 + climb * 0.12) * walk;
    void legs;
  }
}

// a walk mapped into the hall for copy k
function mapWalk(walk, k) {
  const pts = walk.pts.map((p) => mapPt(k, p));
  const upAxis = PERM[k][walk.up];
  const world = UP_AXIS.indexOf(upAxis);
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(...pts[i]), b = new THREE.Vector3(...pts[i + 1]);
    const len = a.distanceTo(b);
    segs.push({ a, b, len, s0: total, stair: walk.stair.includes(i) });
    total += len;
  }
  const up = new THREE.Vector3(); up.setComponent(upAxis, 1);
  return { ...walk, segs, total, up, world, k };
}

function at(w, s) {
  s = Math.min(w.total, Math.max(0, s));
  for (const g of w.segs) {
    if (s <= g.s0 + g.len + 1e-9) {
      const t = g.len > 0 ? (s - g.s0) / g.len : 0;
      return { p: g.a.clone().lerp(g.b, t), stair: g.stair };
    }
  }
  const g = w.segs[w.segs.length - 1];
  return { p: g.b.clone(), stair: g.stair };
}

function smooth01(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }

export const SPEED = 1.1;
const STRIDE = 1.4;
const FIG = 1.16; // figure scale
export const CYCLE = 46;

// timing per walk id: [mode, phase as a fraction of the cycle, lateral offset]
const PLAN = {
  'up-to-wall': [{ mode: 'pingpong', phase: 0.0 }],
  'other-down-to-block': [{ mode: 'pingpong', phase: 0.5 + 6 / 46 }],
  'floor-to-garden': [{ mode: 'pingpong', phase: 0.21, lat: -0.35 }, { mode: 'pingpong', phase: 0.71, lat: 0.35 }],
  balcony: [{ mode: 'linger', phase: 0.33 }],
};

export class Walkers {
  constructor(scene, uniforms) {
    this.list = [];
    const geos = [0, 1, 2].map(partGeometries);
    for (let k = 0; k < 3; k++) {
      for (const walk of WALKS) {
        const w = mapWalk(walk, k);
        for (const plan of PLAN[walk.id] || []) {
          const fig = new Figure(geos[w.world], uniforms);
          scene.add(fig.root);
          this.list.push({ w, fig, plan, k, phase: 0, dir: new THREE.Vector3(), last: null });
        }
      }
    }
  }

  // state of one walker at time t: { s, walking, dir }
  timeline(item, t) {
    const { w, plan, k } = item;
    const D = w.total / SPEED;
    let tc = ((t / CYCLE + plan.phase + k * 0.137) % 1 + 1) % 1 * CYCLE;
    if (plan.mode === 'pingpong') {
      const half = CYCLE / 2;
      if (tc < D) return { s: tc * SPEED, fwd: 1, on: true };
      if (tc >= half && tc < half + D) return { s: w.total - (tc - half) * SPEED, fwd: -1, on: true };
      return { on: false };
    }
    // linger: walk out, stand at the end looking out, walk back
    const stand = 12;
    if (tc < D) return { s: tc * SPEED, fwd: 1, on: true };
    if (tc < D + stand) return { s: w.total, fwd: 1, on: true, still: true };
    if (tc < 2 * D + stand) return { s: w.total - (tc - D - stand) * SPEED, fwd: -1, on: true };
    return { on: false };
  }

  update(t) {
    const m = new THREE.Matrix4();
    const right = new THREE.Vector3(), fwd = new THREE.Vector3();
    for (const item of this.list) {
      const { w, fig, plan } = item;
      const st = this.timeline(item, t);
      fig.root.visible = st.on;
      if (!st.on) continue;
      const here = at(w, st.s);
      const ahead = at(w, st.s + 0.3 * st.fwd), behind = at(w, st.s - 0.3 * st.fwd);
      fwd.subVectors(ahead.p, behind.p);
      fwd.addScaledVector(w.up, -fwd.dot(w.up));
      if (fwd.lengthSq() < 1e-6) fwd.copy(item.dir.lengthSq() ? item.dir : new THREE.Vector3(1, 0, 0));
      fwd.normalize();
      if (st.still) {
        // at the parapet: face along the last segment
        const g = w.segs[w.segs.length - 1];
        fwd.subVectors(g.b, g.a).normalize();
      }
      item.dir.copy(fwd);
      right.crossVectors(w.up, fwd).normalize();
      const p = here.p.clone();
      if (plan.lat) p.addScaledVector(right, plan.lat);
      m.makeBasis(right.multiplyScalar(FIG), w.up.clone().multiplyScalar(FIG), fwd.clone().multiplyScalar(FIG)).setPosition(p);
      fig.root.matrix.copy(m);
      fig.root.matrixWorldNeedsUpdate = true;
      const phase = (st.s / STRIDE) * Math.PI * 2 * st.fwd;
      fig.pose(phase, here.stair ? 1 : 0, st.still ? 0 : 1);
      // fade in and out inside doorways
      const fe = w.fadeEnd || 0.75;
      let a = smooth01(st.s / 0.75);
      if (w.id !== 'balcony') a *= smooth01((w.total - st.s) / fe);
      fig.uniforms.uFade.value = a;
      fig.root.visible = a > 0.01;
    }
  }
}
