// Leaves floating on the surface: the world in between. Each leaf rides the
// ripples, drifts on a slow current and turns slowly. The same instances are
// drawn, black, into a small map seen from above, which the water uses for
// the leaves' shadows on the bottom.

import * as THREE from 'three';
import { NOISE, LITHO, LITHO_UNIFORMS, WAVES, LEAF_SDF } from './glsl.js';
import { pondD, POSTS } from './world.js';

export const LEAF_BOX = { x0: -9.5, z0: -12.5, x1: 9.5, z1: 6.0 };
const N = 420;
const PALETTE = [
  [0.72, 0.46, 0.2], [0.62, 0.36, 0.16], [0.8, 0.6, 0.28], [0.5, 0.3, 0.16], [0.68, 0.52, 0.26], [0.56, 0.42, 0.22], [0.76, 0.4, 0.18],
];

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEAF_VS = /* glsl */ `
attribute vec4 aLeaf;    // x, z, angle, size
attribute vec4 aLeaf2;   // kind, curl, seed, layer
attribute vec3 aCol;
${WAVES}
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vCol;
varying vec2 vK;
void main() {
  vec2 uv = position.xy;   // x along the midrib, y across
  float curl = aLeaf2.y;
  float ex = uv.x + 0.5;
  float h = curl * (1.3 * uv.y * uv.y + 0.35 * ex * ex) - 0.02 * curl;
  vec3 lp = vec3(uv.x, h, uv.y) * aLeaf.w;
  float c = cos(aLeaf.z), s = sin(aLeaf.z);
  lp.xz = vec2(c * lp.x - s * lp.z, s * lp.x + c * lp.z);
  vec2 base = aLeaf.xy;
  float e = 0.05;
  float h0 = waveH(base);
  vec2 g = vec2(waveH(base + vec2(e, 0.0)) - h0, waveH(base + vec2(0.0, e)) - h0) / e;
  vec3 wp = vec3(base.x + lp.x, h0 + lp.y + dot(g, lp.xz) + 0.004 + aLeaf2.w * 0.0007, base.y + lp.z);
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  n = normalize(n + vec3(c * (-0.7 * curl * ex) - s * (-2.6 * curl * uv.y), 0.0, s * (-0.7 * curl * ex) + c * (-2.6 * curl * uv.y)));
  vUv = uv;
  vW = wp;
  vN = n;
  vCol = aCol;
  vK = aLeaf2.xz;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;

const LEAF_FS = /* glsl */ `
uniform vec3 uSun;
uniform float uShadowPass;
${LITHO_UNIFORMS}
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vCol;
varying vec2 vK;
${NOISE}
${LITHO}
${LEAF_SDF}
void main() {
  float vein;
  float d = leafSDF(vUv, vK.x, vein);
  float px = fwidth(d);
  if (d > px * 0.5) discard;
  if (uShadowPass > 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  if (dot(n, v) < 0.0) n = -n;
  float dist = length(cameraPosition - vW);
  // mottled autumn colour, darker blotches and a paler underside towards the edge
  vec3 col = vCol * (0.78 + 0.4 * fbm(vUv * 7.0 + vK.y * 13.0));
  col = mix(col, col * 0.55, smoothstep(0.62, 0.8, fbm(vUv * 11.0 + vK.y * 5.0)));
  col = mix(col, col * 1.15 + 0.05, vein * 0.5);
  float shade = 0.62 + 0.4 * max(dot(n, uSun), 0.0) + 0.1 * n.y;
  col *= shade;
  // ink: the outline, the midrib and the veins
  float edge = 1.0 - smoothstep(px * 0.6, px * 2.2, -d);
  float ink = max(edge, vein * 0.42);
  gl_FragColor = vec4(finish(col, 0.0, ink, vW.xz, dist, 1.0), 1.0);
}
`;

export class Leaves {
  constructor(u) {
    const rng = rngFrom(31);
    this.rng = rng;
    const geo = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1.3, 1.0, 12, 6);
    plane.translate(-0.08, 0, 0);
    geo.index = plane.index;
    geo.setAttribute('position', plane.getAttribute('position'));
    this.a1 = new Float32Array(N * 4);
    this.a2 = new Float32Array(N * 4);
    this.col = new Float32Array(N * 3);
    this.vel = [];
    for (let i = 0; i < N; i++) {
      this.spawn(i, true);
      const kind = rng() < 0.45 ? 0 : rng() < 0.7 ? 1 : 2;
      const size = kind === 2 ? 0.17 + rng() * 0.06 : 0.15 + rng() * 0.11;
      this.a1[i * 4 + 3] = size;
      this.a2.set([kind, 0.04 + rng() * 0.12, rng(), i % 7], i * 4);
      this.col.set(PALETTE[Math.floor(rng() * PALETTE.length)], i * 3);
    }
    this.attr1 = new THREE.InstancedBufferAttribute(this.a1, 4);
    this.attr1.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aLeaf', this.attr1);
    geo.setAttribute('aLeaf2', new THREE.InstancedBufferAttribute(this.a2, 4));
    geo.setAttribute('aCol', new THREE.InstancedBufferAttribute(this.col, 3));
    geo.instanceCount = N;
    this.geo = geo;
    const uniforms = { ...u, uShadowPass: { value: 0 } };
    this.material = new THREE.ShaderMaterial({ uniforms, vertexShader: LEAF_VS, fragmentShader: LEAF_FS, side: THREE.DoubleSide });
    this.shadowMaterial = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uShadowPass: { value: 1 } }, vertexShader: LEAF_VS, fragmentShader: LEAF_FS, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
  }

  spawn(i, anywhere) {
    const rng = this.rng;
    const B = LEAF_BOX;
    for (let k = 0; k < 40; k++) {
      const x = anywhere ? B.x0 + rng() * (B.x1 - B.x0) : B.x0 + rng() * 6.0;
      const z = B.z0 + rng() * (B.z1 - B.z0);
      if (pondD(x, z) < -0.35) {
        this.a1[i * 4] = x;
        this.a1[i * 4 + 1] = z;
        this.a1[i * 4 + 2] = rng() * Math.PI * 2;
        this.vel[i] = { w: (rng() - 0.5) * 0.06, k: 0.7 + rng() * 0.6 };
        return;
      }
    }
  }

  // a slow current from left to right with gentle eddies
  update(dt, t) {
    const a = this.a1;
    for (let i = 0; i < N; i++) {
      let x = a[i * 4], z = a[i * 4 + 1];
      const v = this.vel[i];
      const ux = 0.03 + 0.02 * Math.sin(z * 0.45 + t * 0.05) + 0.012 * Math.sin(t * 0.13 + i);
      const uz = 0.012 * Math.cos(x * 0.38 - t * 0.04) + 0.006 * Math.sin(t * 0.11 + i * 1.7);
      x += ux * v.k * dt;
      z += uz * v.k * dt;
      for (const p of POSTS) {
        const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz), m = p.r + a[i * 4 + 3] * 0.5;
        if (d < m) { x = p.x + (dx / d) * m; z = p.z + (dz / d) * m; }
      }
      a[i * 4] = x;
      a[i * 4 + 1] = z;
      a[i * 4 + 2] += v.w * dt;
      if (x > LEAF_BOX.x1 || pondD(x, z) > -0.25) this.spawn(i, false);
    }
    this.attr1.needsUpdate = true;
  }
}
