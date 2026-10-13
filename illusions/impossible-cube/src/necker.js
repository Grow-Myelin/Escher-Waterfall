// Plate I: the Necker cube.
//
// A wire cube under parallel projection is the same drawing as its mirror image
// in the picture plane (the plane through its centre, square to the line of
// sight). Reading A is the real cube seen from above; reading B is that
// reflection, a cube seen from below. Every vertex of A slides along the line
// of sight to its place in B:
//
//     v(s) = v − 2s (v·d) d,     s = 0 → A,  s = ½ → flat,  s = 1 → B
//
// which never changes the picture. Only the shading cue (faces lit from above,
// hidden edges dashed) tells the two readings apart, so the cue is faded out
// whenever the cube passes through the flat state.

import * as THREE from 'three';
import { makeInk } from './ink.js';
import { Segments, inkLine } from './lines.js';
import { BIG } from '../../../src/builder.js';

const STONE = [0.86, 0.82, 0.74];
const RED = [0.64, 0.23, 0.16];

export function createNecker(shared, D) {
  const group = new THREE.Group();

  // vertices, edges, faces of the cube [-1, 1]^3
  const V0 = [];
  for (let i = 0; i < 8; i++) V0.push(new THREE.Vector3(i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1));
  const E = [];
  for (let i = 0; i < 8; i++) for (const bit of [1, 2, 4]) if (!(i & bit)) E.push([i, i | bit]);
  const F = [];
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [-1, 1]) {
      const u = (axis + 1) % 3, v = (axis + 2) % 3;
      const idx = (cu, cv) => {
        const c = [0, 0, 0];
        c[axis] = sign; c[u] = cu; c[v] = cv;
        return (c[0] > 0 ? 1 : 0) | (c[1] > 0 ? 2 : 0) | (c[2] > 0 ? 4 : 0);
      };
      let q = [idx(-1, -1), idx(1, -1), idx(1, 1), idx(-1, 1)];
      if (sign < 0) q = q.reverse();
      const n = new THREE.Vector3(); n.setComponent(axis, sign);
      F.push({ q, n, axis, u, v });
    }
  }

  // ---- faces (the shading cue)
  const nv = F.length * 6;
  const geo = new THREE.BufferGeometry();
  const aPos = new THREE.BufferAttribute(new Float32Array(nv * 3), 3);
  const aNrm = new THREE.BufferAttribute(new Float32Array(nv * 3), 3);
  const acol = new Float32Array(nv * 3), fuv = new Float32Array(nv * 2), edge = new Float32Array(nv * 3), amat = new Float32Array(nv * 3);
  const corner = [0, 1, 2, 0, 2, 3];
  F.forEach((f, fi) => {
    corner.forEach((c, k) => {
      const i = fi * 6 + k;
      const p = V0[f.q[c]];
      acol.set(STONE, i * 3);
      fuv[i * 2] = p.getComponent(f.u); fuv[i * 2 + 1] = p.getComponent(f.v);
      edge.set([BIG, BIG, BIG], i * 3);
    });
  });
  geo.setAttribute('position', aPos);
  geo.setAttribute('normal', aNrm);
  geo.setAttribute('acol', new THREE.BufferAttribute(acol, 3));
  geo.setAttribute('fuv', new THREE.BufferAttribute(fuv, 2));
  geo.setAttribute('edge', new THREE.BufferAttribute(edge, 3));
  geo.setAttribute('amat', new THREE.BufferAttribute(amat, 3));
  const faceMat = makeInk(shared, { cue: 0, hatch: 0.32, side: THREE.DoubleSide, offset: 2, transparent: true });
  const faces = new THREE.Mesh(geo, faceMat);
  faces.frustumCulled = false;
  faces.renderOrder = 0;
  group.add(faces);

  // ---- edges: one geometry, three passes (visible; hidden solid; hidden dashed)
  const seg = new Segments(E.length);
  const visMat = inkLine({ width: 2.4 });
  const hidSolid = inkLine({ width: 2.4, depthFunc: THREE.GreaterDepth });
  const hidDash = inkLine({ width: 1.5, dashed: true, dash: 0.1, gap: 0.085, depthFunc: THREE.GreaterDepth });
  group.add(seg.mesh(visMat, 1), seg.mesh(hidSolid, 2), seg.mesh(hidDash, 3));

  // ---- guides for the reveal: each corner's track along the line of sight
  const tracks = new Segments(8);
  const trackMat = inkLine({ width: 1.4, dashed: true, dash: 0.09, gap: 0.07, rgb: RED, opacity: 0, depthTest: false });
  const trackMesh = tracks.mesh(trackMat, 4);
  group.add(trackMesh);
  const dotGeo = new THREE.SphereGeometry(0.035, 12, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...RED, THREE.SRGBColorSpace), transparent: true, opacity: 0, depthTest: false });
  const dots = [];
  for (let i = 0; i < 8; i++) {
    const a = V0[i];
    const b = a.clone().addScaledVector(D, -2 * a.dot(D));
    tracks.set(i, a, b);
    for (const q of [a, b]) {
      const m = new THREE.Mesh(dotGeo, dotMat);
      m.position.copy(q);
      m.renderOrder = 5;
      dots.push(m);
      group.add(m);
    }
  }
  tracks.commit();

  // ---- the morph
  const P = V0.map((v) => v.clone());
  const tmp = new THREE.Vector3();
  let lastS = -1;
  function setMorph(s) {
    if (s === lastS) return;
    lastS = s;
    for (let i = 0; i < 8; i++) P[i].copy(V0[i]).addScaledVector(D, -2 * s * V0[i].dot(D));
    // normals: inverse transpose of A = I − 2s d dᵀ, i.e. n + (2s / (1 − 2s)) (n·d) d
    const k = 1 - 2 * s;
    F.forEach((f, fi) => {
      if (Math.abs(k) > 1e-3) tmp.copy(f.n).addScaledVector(D, (2 * s / k) * f.n.dot(D)).normalize();
      else tmp.copy(D).multiplyScalar(Math.sign(f.n.dot(D)) || 1);
      corner.forEach((c, kk) => {
        const i = fi * 6 + kk;
        const p = P[f.q[c]];
        aPos.setXYZ(i, p.x, p.y, p.z);
        aNrm.setXYZ(i, tmp.x, tmp.y, tmp.z);
      });
    });
    aPos.needsUpdate = true;
    aNrm.needsUpdate = true;
    E.forEach(([a, b], i) => seg.set(i, P[a], P[b]));
    seg.commit();
  }
  setMorph(0);

  // ---- the cycle: A shown, cue off, morph, B shown, cue off, morph back
  const T = 14;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function cycle(t) {
    const x = ((t % T) + T) % T;
    const cueA = ss(0.0, 0.9, x) * (1 - ss(4.6, 5.5, x));
    const cueB = ss(7.0, 7.9, x) * (1 - ss(11.6, 12.5, x));
    const s = ss(5.6, 6.9, x) * (1 - ss(12.6, 13.9, x));
    let phase = 'none';
    if (cueA > 0.5) phase = 'A';
    else if (cueB > 0.5) phase = 'B';
    return { cue: cueA + cueB, s, phase, x };
  }

  let state = cycle(0);
  return {
    group,
    lineMats: [visMat, hidSolid, hidDash, trackMat],
    get state() { return state; },
    update(t, off, fade) {
      state = cycle(t);
      setMorph(state.s);
      faceMat.uniforms.uCue.value = state.cue;
      faceMat.uniforms.uFade.value = fade;
      visMat.opacity = fade;
      hidSolid.opacity = fade * (1 - state.cue);
      hidDash.opacity = fade * state.cue * 0.8;
      trackMat.opacity = fade * off;
      dotMat.opacity = fade * off;
      const vis = off * fade > 0.01;
      trackMesh.visible = vis;
      dots.forEach((d) => { d.visible = vis; });
    },
  };
}
