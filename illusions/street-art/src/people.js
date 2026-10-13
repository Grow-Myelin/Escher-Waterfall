// Passers-by: simple jointed figures that walk closed loops round the plaza.
// Legs and arms are separate meshes hinged at hip and shoulder.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { limb } from '../../../src/figures.js';

const skin = st(0xd9b9a0);

function partMesh(fn, mat) {
  const b = new Builder();
  fn(b);
  const m = new THREE.Mesh(b.build(), mat);
  return m;
}

// look: { coat, trousers, hair, hat, skirt, height }
export class Walker {
  constructor(mat, shadowMat, look, path, speed, phase = 0) {
    const s = look.height ?? 1;
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);
    this.curve = new THREE.CatmullRomCurve3(path.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
    this.len = this.curve.getLength();
    this.speed = speed;
    this.dist = phase * this.len;
    this.dist0 = this.dist;
    this.stride = 1.45 * s;
    const coat = st(look.coat, PAT.CLOTH);
    const legS = st(look.trousers, PAT.CLOTH);
    const shoe = st(0x2b2724);
    const hip = 0.92 * s, shoulder = 1.43 * s;
    // torso, head, hat
    this.body.add(partMesh((b) => {
      if (look.skirt) b.lathe(0, hip - 0.42 * s, 0, [[0.3 * s, 0], [0.2 * s, 0.5 * s], [0.0, 0.5 * s]], 10, st(look.skirt, PAT.CLOTH), { edges: [1, 0, 0] });
      b.lathe(0, hip - 0.08, 0, [[0.19 * s, 0], [0.22 * s, 0.32 * s], [0.24 * s, shoulder - hip], [0.12 * s, shoulder - hip + 0.06], [0, shoulder - hip + 0.06]], 10, coat, { edges: [1, 0, 0, 0, 0] });
      limb(b, [0, shoulder, 0], [0, shoulder + 0.1 * s, 0], 0.06 * s, skin);
      b.blob(0, shoulder + 0.22 * s, 0.01, 0.12 * s, 0.14 * s, 0.13 * s, skin, { lump: 0.03 });
      if (look.hat) {
        b.cyl(0, shoulder + 0.3 * s, 0, 0.22 * s, shoulder + 0.32 * s, 12, st(look.hat), {});
        b.cyl(0, shoulder + 0.32 * s, 0, 0.13 * s, shoulder + 0.44 * s, 10, st(look.hat), { r1: 0.12 * s });
      } else {
        b.blob(0, shoulder + 0.28 * s, -0.04, 0.13 * s, 0.11 * s, 0.13 * s, st(look.hair), { lump: 0.06 });
      }
      if (look.bag) b.box(0.22 * s, hip - 0.1, -0.12, 0.3 * s, hip + 0.2, 0.15, st(look.bag, PAT.WOOD), {});
    }, mat));
    // legs hinge at the hip
    this.legs = [-1, 1].map((sx) => {
      const g = new THREE.Group();
      g.position.set(0.1 * sx * s, hip, 0);
      g.add(partMesh((b) => {
        limb(b, [0, 0, 0], [0, -hip + 0.07, 0], 0.08 * s, legS, { r1: 0.06 * s });
        b.box(-0.055 * s, -hip, -0.07, 0.055 * s, -hip + 0.08, 0.17 * s, shoe, {});
      }, mat));
      this.body.add(g);
      return g;
    });
    this.arms = [-1, 1].map((sx) => {
      const g = new THREE.Group();
      g.position.set(0.25 * sx * s, shoulder - 0.04, 0);
      g.add(partMesh((b) => {
        limb(b, [0, 0, 0], [0.03 * sx, -0.32 * s, 0.02], 0.055 * s, coat);
        limb(b, [0.03 * sx, -0.32 * s, 0.02], [0.02 * sx, -0.6 * s, 0.07], 0.045 * s, coat);
        b.blob(0.02 * sx, -0.66 * s, 0.08, 0.045, 0.06, 0.045, skin, { lump: 0, sub: 0 });
      }, mat));
      this.body.add(g);
      return g;
    });
    // soft contact shadow
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9 * s, 0.9 * s), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.004;
    this.group.add(this.shadow);
    this.group.traverse((o) => { o.frustumCulled = false; });
    this.update(0);
  }

  update(dt) {
    this.dist = (this.dist + dt * this.speed) % this.len;
    const u = this.dist / this.len;
    const p = this.curve.getPointAt(u);
    const t = this.curve.getTangentAt(u);
    this.group.position.copy(p);
    this.body.rotation.y = Math.atan2(t.x, t.z);
    const ph = (this.dist / this.stride) * Math.PI * 2;
    const sw = Math.sin(ph);
    this.legs[0].rotation.x = sw * 0.42;
    this.legs[1].rotation.x = -sw * 0.42;
    this.arms[0].rotation.x = -sw * 0.32;
    this.arms[1].rotation.x = sw * 0.32;
    this.body.position.y = Math.abs(Math.cos(ph)) * 0.035 - 0.02;
  }
}

export function makeShadowMaterial() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  grd.addColorStop(0, 'rgba(20,18,16,0.55)');
  grd.addColorStop(0.55, 'rgba(20,18,16,0.25)');
  grd.addColorStop(1, 'rgba(20,18,16,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
}
