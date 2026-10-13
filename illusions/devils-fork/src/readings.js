// Fig. 2: the two objects the drawing could be, as real solids, side by side.
//   a. a fork with three round prongs
//   b. a U-shaped bar of square section
// Drawn with the Waterfall's ink shader on a transparent canvas laid over the plate.

import * as THREE from 'three';
import { Builder, PAT, st, M } from '../../../src/builder.js';
import { createSharedUniforms, makeInkMaterial } from '../../../src/materials.js';

const R = 0.42; // prong radius; the square bars are 2R across
const SP = 1.8; // spacing of the prongs (and of the bars), centre to centre
const X0 = -2.4, X1 = 1.7, XB = 2.6; // prongs from X0 to X1, base block to XB

function forkA() {
  const b = new Builder();
  const s = st(0xc9d6df, PAT.PLAIN);
  for (let i = 0; i < 3; i++) {
    b.push(M.chain(M.T(X0, R, -i * SP), M.RZ(-Math.PI / 2)));
    b.cyl(0, 0, 0, R, X1 - X0, 28, s, { caps: [true, false] });
    b.pop();
  }
  b.box(X1, 0, -2 * SP - R - 0.15, XB, 2 * R, R + 0.15, s, {});
  return b.build();
}

function bracketB() {
  const b = new Builder();
  const s = st(0xe6d2a8, PAT.PLAIN);
  // the U: two bars joined by a cross bar; the slot between them ends at X1
  const zf = [-R, R], zb = [-2 * SP + R - 2 * R, -2 * SP + R];
  b.box(X0, 0, zf[0], X1, 2 * R, zf[1], s, { open: ['px'] });
  b.box(X0, 0, zb[0], X1, 2 * R, zb[1], s, { open: ['px'] });
  b.box(X1, 0, zb[0], XB, 2 * R, zf[1], s, {});
  return b.build();
}

export class Readings {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    this.uniforms = createSharedUniforms();
    // lit from the upper left, like the engraving: ends light, fronts in shade
    this.uniforms.uLight.value.set(-0.5, 0.85, 0.28).normalize();
    this.items = [forkA(), bracketB()].map((geo) => {
      const u = { ...this.uniforms, uFade: { value: 1 } };
      const mesh = new THREE.Mesh(geo, makeInkMaterial(u, { transparent: true }));
      const scene = new THREE.Scene();
      const pivot = new THREE.Group();
      pivot.position.set(-(X0 + XB) / 2 + 0.1, 0, SP);
      const holder = new THREE.Group();
      holder.add(pivot);
      pivot.add(mesh);
      scene.add(holder);
      return { scene, holder, u };
    });
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    // from in front, above and a little to the left, as the drawing is seen
    cam.position.set(-6, 9, 18);
    cam.lookAt(0, 0.4, 0);
    this.camera = cam;
    this.w = 1; this.h = 1;
  }

  resize(w, h) {
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
  }

  // t: time; emph: [a, b] emphasis 0..1; litho 0..1
  render(t, emph, litho) {
    const r = this.renderer, cam = this.camera;
    this.uniforms.uLitho.value = litho;
    this.uniforms.uTime.value = t;
    r.setScissorTest(false);
    r.clear();
    r.setScissorTest(true);
    const half = this.w / 2;
    const aspect = half / this.h;
    const H = 3.4;
    cam.left = -H * aspect; cam.right = H * aspect; cam.top = H; cam.bottom = -H;
    cam.updateProjectionMatrix();
    this.items.forEach((it, i) => {
      it.holder.rotation.y = 0.32 * Math.sin(t * 0.45 + i * 1.3);
      it.u.uFade.value = 0.22 + 0.78 * emph[i];
      r.setViewport(i * half, 0, half, this.h);
      r.setScissor(i * half, 0, half, this.h);
      r.render(it.scene, cam);
    });
  }
}
