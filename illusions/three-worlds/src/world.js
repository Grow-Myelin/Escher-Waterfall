// The world above the water: an overcast winter sky with a low sun, the
// banks of the pond, bare trees grown by a small branching rule, two old
// mooring posts and clumps of reeds. Everything here is also rendered, from
// the mirrored camera, into the reflection texture the water samples.

import * as THREE from 'three';
import { NOISE, LITHO, LITHO_UNIFORMS } from './glsl.js';

// ------------------------------------------------------------------ the pond
export const POND = { cx: 0, cz: -2.6, rx: 8.6, rz: 9.2 };
export const POSTS = [
  { x: 2.45, z: -1.95, r: 0.095, top: 0.78 },
  { x: -3.1, z: -5.2, r: 0.085, top: 0.52 },
];

// Signed distance (roughly, in metres) from the shore: negative on the water.
export function pondD(x, z) {
  const qx = (x - POND.cx) / POND.rx, qz = (z - POND.cz) / POND.rz;
  const r = Math.hypot(qx, qz), th = Math.atan2(qz, qx);
  const R = 1 + 0.07 * Math.sin(3 * th + 0.5) + 0.04 * Math.sin(5 * th + 1.3);
  return (r - R) * Math.min(POND.rx, POND.rz);
}
export const POND_GLSL = /* glsl */ `
float pondD(vec2 p) {
  vec2 q = (p - vec2(${POND.cx.toFixed(3)}, ${POND.cz.toFixed(3)})) / vec2(${POND.rx.toFixed(3)}, ${POND.rz.toFixed(3)});
  float r = length(q), th = atan(q.y, q.x);
  float R = 1.0 + 0.07 * sin(3.0 * th + 0.5) + 0.04 * sin(5.0 * th + 1.3);
  return (r - R) * ${Math.min(POND.rx, POND.rz).toFixed(3)};
}
`;

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

// ------------------------------------------------------------------ geometry
class Mesher {
  constructor() { this.p = []; this.n = []; this.c = []; this.k = []; this.i = []; }
  get count() { return this.p.length / 3; }
  v(p, n, c, k) { this.p.push(p.x, p.y, p.z); this.n.push(n.x, n.y, n.z); this.c.push(c[0], c[1], c[2]); this.k.push(k); return this.count - 1; }
  tri(a, b, c) { this.i.push(a, b, c); }
  // a tapered tube between two points
  tube(a, b, r0, r1, sides, col, kind) {
    const d = b.clone().sub(a).normalize();
    const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(d, ref).normalize();
    const w = new THREE.Vector3().crossVectors(d, u);
    const base = this.count;
    for (let s = 0; s <= sides; s++) {
      const th = (s / sides) * Math.PI * 2;
      const n = u.clone().multiplyScalar(Math.cos(th)).addScaledVector(w, Math.sin(th));
      this.v(a.clone().addScaledVector(n, r0), n, col, kind);
      this.v(b.clone().addScaledVector(n, r1), n, col, kind);
    }
    for (let s = 0; s < sides; s++) {
      const i0 = base + s * 2;
      this.tri(i0, i0 + 2, i0 + 1);
      this.tri(i0 + 1, i0 + 2, i0 + 3);
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('acol', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('akind', new THREE.Float32BufferAttribute(this.k, 1));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return g;
  }
}

const BARK = [0.3, 0.27, 0.24];

// A bare tree: each branch ends in two or three children that turn away from
// it, thin by a constant ratio and lean a little towards the light.
function growTree(m, root, height, rng, lean = new THREE.Vector3()) {
  const rot = (v, axis, a) => v.clone().applyAxisAngle(axis, a);
  const grow = (p, dir, len, r, depth) => {
    // each branch is drawn as two slightly bent segments
    const mid = p.clone().addScaledVector(dir, len * 0.5);
    const bend = new THREE.Vector3(rng() - 0.5, rng() * 0.3, rng() - 0.5).multiplyScalar(len * 0.12);
    mid.add(bend);
    const dir2 = dir.clone().add(lean.clone().multiplyScalar(0.06 * (8 - depth))).add(bend.clone().multiplyScalar(0.8 / len)).normalize();
    const end = mid.clone().addScaledVector(dir2, len * 0.5);
    const rm = r * 0.86, r1 = r * 0.72;
    const sides = r > 0.08 ? 9 : r > 0.03 ? 6 : r > 0.012 ? 4 : 3;
    m.tube(p, mid, r, rm, sides, BARK, 0);
    m.tube(mid, end, rm, r1, sides, BARK, 0);
    if (depth === 0) return;
    const n = depth >= 5 ? 2 + (rng() < 0.55 ? 1 : 0) : 2 + (rng() < 0.25 ? 1 : 0);
    const spin = rng() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      let axis = new THREE.Vector3(1, 0, 0);
      if (Math.abs(dir2.x) > 0.9) axis.set(0, 0, 1);
      axis = new THREE.Vector3().crossVectors(dir2, axis).normalize();
      axis.applyAxisAngle(dir2, spin + (k / n) * Math.PI * 2 + rng() * 0.6);
      const leader = k === 0;
      const ang = leader ? 0.18 + rng() * 0.2 : 0.45 + rng() * 0.5;
      const nd = rot(dir2, axis, ang);
      nd.y += 0.12 + (depth < 3 ? 0.08 : 0);
      nd.add(lean.clone().multiplyScalar(0.25));
      nd.normalize();
      const f = leader ? 0.8 + rng() * 0.1 : 0.62 + rng() * 0.16;
      grow(end, nd, len * f, r1 * (leader ? 0.92 : 0.72), depth - 1);
    }
  };
  const trunkR = height * 0.024;
  grow(root.clone().setY(root.y - 0.4), new THREE.Vector3(lean.x * 0.15, 1, lean.z * 0.15).normalize(), height * 0.3, trunkR, 7);
}

function groundHeight(x, z) {
  const d = pondD(x, z);
  const bumps = 0.12 * Math.sin(x * 0.7 + 1.0) * Math.sin(z * 0.5 - 0.3) + 0.06 * Math.sin(x * 1.9 + z * 1.3);
  if (d <= 0) return Math.max(-0.8, d * 0.35);
  return Math.min(0.42, d * 0.3) + Math.max(0, d - 1) * 0.02 + bumps * Math.min(1, d * 0.5);
}

export function buildWorld() {
  const rng = rngFrom(1955);
  const m = new Mesher();
  // the banks: a height field round the pond
  {
    const X0 = -40, X1 = 40, Z0 = -60, Z1 = 14, NX = 160, NZ = 148;
    const base = m.count;
    for (let j = 0; j <= NZ; j++) {
      for (let i = 0; i <= NX; i++) {
        const x = X0 + ((X1 - X0) * i) / NX, z = Z0 + ((Z1 - Z0) * j) / NZ;
        const y = groundHeight(x, z);
        const e = 0.05;
        const nx = groundHeight(x - e, z) - groundHeight(x + e, z), nz = groundHeight(x, z - e) - groundHeight(x, z + e);
        const n = new THREE.Vector3(nx, 2 * e, nz).normalize();
        m.v(new THREE.Vector3(x, y, z), n, [0.46, 0.44, 0.33], 1);
      }
    }
    for (let j = 0; j < NZ; j++) {
      for (let i = 0; i < NX; i++) {
        const a = base + j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
        m.tri(a, c, b);
        m.tri(b, c, d);
      }
    }
  }
  // trees on the far bank and the sides, two of them leaning over the water
  const trees = [
    [-5.6, -12.4, 12.5], [-1.4, -13.6, 14.5], [3.2, -12.9, 11.5], [7.6, -11.2, 13.0], [11.5, -8.5, 10.5],
    [-10.4, -8.2, 11.0], [-13.0, -15.0, 13.0], [10.0, -17.0, 14.0], [0.8, -19.5, 15.0], [-8.0, -19.0, 12.0],
    [15.0, -3.0, 12.0], [-14.5, -1.5, 11.0],
  ];
  for (const [x, z, h] of trees) {
    const lean = new THREE.Vector3(-x, 0, -z - 2.6).normalize().multiplyScalar(0.25);
    growTree(m, new THREE.Vector3(x, groundHeight(x, z), z), h, rng, lean);
  }
  growTree(m, new THREE.Vector3(-9.0, groundHeight(-9.0, -3.2), -3.2), 10.5, rng, new THREE.Vector3(1.4, 0, -0.1));
  growTree(m, new THREE.Vector3(9.3, groundHeight(9.3, -1.0), -1.0), 9.5, rng, new THREE.Vector3(-1.3, 0, -0.3));
  // mooring posts (the parts above the water; the water traces the rest)
  for (const p of POSTS) {
    const col = [0.42, 0.36, 0.28];
    m.tube(new THREE.Vector3(p.x, -0.3, p.z), new THREE.Vector3(p.x, p.top, p.z), p.r, p.r * 0.96, 14, col, 2);
    // the weathered top
    const c = m.v(new THREE.Vector3(p.x, p.top + 0.02, p.z), new THREE.Vector3(0, 1, 0), col, 2);
    const ring = [];
    for (let s = 0; s <= 14; s++) {
      const th = (s / 14) * Math.PI * 2;
      ring.push(m.v(new THREE.Vector3(p.x + Math.cos(th) * p.r * 0.96, p.top, p.z + Math.sin(th) * p.r * 0.96), new THREE.Vector3(Math.cos(th) * 0.5, 0.85, Math.sin(th) * 0.5).normalize(), col, 2));
    }
    for (let s = 0; s < 14; s++) m.tri(c, ring[s + 1], ring[s]);
  }
  // reeds along the shore
  const clumps = 16;
  for (let k = 0; k < clumps; k++) {
    const th = -2.6 + (k / clumps) * 2.4 + rng() * 0.12;
    const R = 1 + 0.07 * Math.sin(3 * th + 0.5) + 0.04 * Math.sin(5 * th + 1.3) - 0.03;
    const cx = POND.cx + Math.cos(th) * POND.rx * R, cz = POND.cz + Math.sin(th) * POND.rz * R;
    const n = 10 + Math.floor(rng() * 12);
    for (let i = 0; i < n; i++) {
      const x = cx + (rng() - 0.5) * 0.8, z = cz + (rng() - 0.5) * 0.6;
      const h = 0.7 + rng() * 0.9;
      const lx = (rng() - 0.5) * 0.35, lz = (rng() - 0.5) * 0.35;
      const col = [0.6 + rng() * 0.1, 0.52 + rng() * 0.08, 0.32];
      const a = new THREE.Vector3(x, -0.05, z);
      const b = new THREE.Vector3(x + lx * 0.5, h * 0.55, z + lz * 0.5);
      const c = new THREE.Vector3(x + lx, h, z + lz);
      m.tube(a, b, 0.008, 0.006, 3, col, 3);
      m.tube(b, c, 0.006, 0.0015, 3, col, 3);
    }
  }
  return m.build();
}

// ------------------------------------------------------------------ shaders
export function createUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uHatch: { value: 0.0045 },
    uGrain: { value: 1 },
    uClip: { value: 0 },
    uSun: { value: new THREE.Vector3(-0.55, 0.42, 0.72).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.84, 0.85, 0.83) },
  };
}

const SKY = /* glsl */ `
vec3 skyColour(vec3 d) {
  float el = d.y;
  vec3 col = mix(vec3(0.93, 0.92, 0.88), vec3(0.7, 0.77, 0.86), smoothstep(-0.02, 0.6, el));
  float sd = max(dot(d, uSun), 0.0);
  col += vec3(0.16, 0.13, 0.08) * pow(sd, 8.0) + vec3(0.25, 0.22, 0.15) * pow(sd, 120.0);
  vec2 cp = d.xz / (max(el, 0.0) + 0.12);
  float cl = fbm(cp * 0.9 + vec2(uTime * 0.012, 0.0));
  float cl2 = fbm(cp * 2.3 - vec2(uTime * 0.02, 3.0));
  float cover = smoothstep(0.45, 0.75, cl * 0.75 + cl2 * 0.35) * smoothstep(-0.02, 0.15, el);
  col = mix(col, vec3(0.93, 0.92, 0.89) - 0.08 * cl2, cover * 0.75);
  if (el < 0.0) col = mix(col, vec3(0.5, 0.5, 0.44), smoothstep(0.0, -0.05, el));
  return col;
}
`;

const ABOVE_VS = /* glsl */ `
attribute vec3 acol;
attribute float akind;
varying vec3 vN;
varying vec3 vC;
varying vec3 vW;
varying float vK;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vK = akind;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const ABOVE_FS = /* glsl */ `
uniform float uTime;
uniform float uClip;
uniform vec3 uSun;
${LITHO_UNIFORMS}
varying vec3 vN;
varying vec3 vC;
varying vec3 vW;
varying float vK;
${NOISE}
${LITHO}
void main() {
  if (uClip > 0.5 && vW.y < 0.0) discard;
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float dist = length(cameraPosition - vW);
  float kind = floor(vK + 0.5);
  // the banks seen from underneath (only the mirrored eye can): solid earth
  bool under = kind == 1.0 && dot(n, v) < 0.0;
  vec3 base = vC;
  float tex = 1.0;
  float ink = 0.0;
  vec2 huv = vW.xz;
  if (kind == 0.0) {          // bark
    tex = 0.78 + 0.34 * vnoise(vec2((vW.x - vW.z) * 22.0, vW.y * 3.0));
    float rim = 1.0 - abs(dot(n, v));
    ink = smoothstep(0.55, 0.95, rim) * 0.85;
    huv = vec2(vW.x + vW.z, vW.y);
  } else if (kind == 1.0) {   // banks: wet mud at the water's edge, winter grass above
    float wet = 1.0 - smoothstep(0.0, 0.16, vW.y);
    vec3 grass = vec3(0.56, 0.55, 0.38) * (0.8 + 0.35 * fbm(vW.xz * 1.3));
    grass *= 0.92 + 0.12 * vnoise(vec2(vW.x * 40.0, vW.z * 6.0));
    vec3 mud = vec3(0.36, 0.31, 0.24) * (0.85 + 0.25 * fbm(vW.xz * 4.0));
    base = mix(grass, mud, wet);
    ink = (1.0 - smoothstep(0.0, 0.012, abs(vW.y - 0.01))) * 0.5;
  } else if (kind == 2.0) {   // posts
    float a = atan(n.z, n.x);
    tex = 0.75 + 0.3 * vnoise(vec2(a * 9.0, vW.y * 2.0)) + 0.1 * sin(a * 30.0 + vnoise(vec2(a, vW.y * 8.0)) * 4.0);
    base = mix(base * 0.55, base, smoothstep(0.0, 0.18, vW.y));
    float rim = 1.0 - abs(dot(n, v));
    ink = smoothstep(0.6, 0.95, rim);
    huv = vec2(a * 0.1, vW.y);
  } else {                    // reeds
    tex = 0.8 + 0.3 * vnoise(vW.xz * 30.0 + vW.y * 3.0);
    ink = 0.45;
  }
  float diff = max(dot(n, uSun), 0.0);
  float shade = 0.62 + 0.14 * n.y + 0.38 * diff;
  vec3 col = base * tex * shade;
  if (under) col = vec3(0.3, 0.26, 0.2) * (0.8 + 0.3 * fbm(vW.xz * 3.0));
  float haze = smoothstep(10.0, 55.0, dist) * 0.65;
  vec3 outc = finish(col, haze, ink, huv, dist, kind);
  gl_FragColor = vec4(outc, 1.0);
}
`;

const SKY_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SKY_FS = /* glsl */ `
uniform float uTime;
uniform vec3 uSun;
${LITHO_UNIFORMS}
varying vec3 vW;
${NOISE}
${LITHO}
${SKY}
void main() {
  vec3 d = normalize(vW - cameraPosition);
  vec3 col = skyColour(d);
  vec2 huv = d.xz / (abs(d.y) + 0.2) * 3.0;
  gl_FragColor = vec4(finish(col, 0.25, 0.0, huv, 1.0, 0.0), 1.0);
}
`;

export function makeAboveMaterial(u) {
  return new THREE.ShaderMaterial({ uniforms: u, vertexShader: ABOVE_VS, fragmentShader: ABOVE_FS, side: THREE.DoubleSide });
}

export function makeSky(u) {
  const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(250, 48, 24), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}

export { SKY };
