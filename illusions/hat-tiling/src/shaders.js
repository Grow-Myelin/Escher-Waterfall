// Shaders for the monotile print: tile fills (tone, hatching that turns with
// each tile, the kite grid inside each hat) and inked boundary lines whose
// weight follows the level of the clusters they separate.

import * as THREE from 'three';

export function sharedUniforms() {
  return {
    uLitho: { value: 1 },
    uPx: { value: 0.01 }, // world units per device pixel
    uDpr: { value: 1 },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
  };
}

const NOISE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

const FILL_VS = /* glsl */ `
attribute vec2 aLocal;
attribute vec4 aType;
attribute vec4 aInfo;
varying vec2 vL;
varying vec4 vT;
varying vec4 vI;
void main() {
  vL = aLocal; vT = aType; vI = aInfo;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0.0, 1.0);
}
`;

const FILL_FS = /* glsl */ `
uniform float uLitho;
uniform float uPx;
uniform float uDpr;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uLevel;    // which level of cluster sets the colour (0..3, fractional = cross-fade)
uniform float uOdd;      // emphasis on the odd ones out
uniform float uKites;    // kite grid visibility
uniform float uSpectre;  // 0 hats, 1 spectres
varying vec2 vL;
varying vec4 vT;
varying vec4 vI;
${NOISE}

// colour print palettes
vec3 hatColour(float t) {
  if (t < 0.5) return vec3(0.815, 0.852, 0.858);   // H
  if (t < 1.5) return vec3(0.741, 0.455, 0.345);   // T
  if (t < 2.5) return vec3(0.878, 0.741, 0.506);   // P
  return vec3(0.612, 0.682, 0.553);                // F
}
vec3 spectreColour(float t) {
  if (t < 0.5) return vec3(0.835, 0.858, 0.855);   // Γ
  if (t < 1.5) return vec3(0.867, 0.749, 0.537);   // Δ
  if (t < 2.5) return vec3(0.733, 0.502, 0.400);   // Θ
  if (t < 3.5) return vec3(0.600, 0.659, 0.718);   // Λ
  if (t < 4.5) return vec3(0.639, 0.698, 0.592);   // Ξ
  if (t < 5.5) return vec3(0.890, 0.847, 0.733);   // Π
  if (t < 6.5) return vec3(0.718, 0.635, 0.678);   // Σ
  if (t < 7.5) return vec3(0.820, 0.667, 0.522);   // Φ
  return vec3(0.918, 0.902, 0.839);                // Ψ
}
// lithograph: (tone, hatch coverage, cross-hatch coverage)
vec3 hatInk(float t) {
  if (t < 0.5) return vec3(0.95, 0.0, 0.0);
  if (t < 1.5) return vec3(0.62, 0.5, 0.32);
  if (t < 2.5) return vec3(0.86, 0.26, 0.0);
  return vec3(0.76, 0.4, 0.14);
}
vec3 spectreInk(float t) {
  if (t < 0.5) return vec3(0.95, 0.0, 0.0);
  if (t < 1.5) return vec3(0.86, 0.26, 0.0);
  if (t < 2.5) return vec3(0.62, 0.5, 0.32);
  if (t < 3.5) return vec3(0.8, 0.36, 0.08);
  if (t < 4.5) return vec3(0.76, 0.4, 0.14);
  if (t < 5.5) return vec3(0.9, 0.16, 0.0);
  if (t < 6.5) return vec3(0.7, 0.44, 0.22);
  if (t < 7.5) return vec3(0.83, 0.3, 0.06);
  return vec3(0.97, 0.0, 0.0);
}
float typeAt(float l) {
  if (l < 0.5) return vT.x;
  if (l < 1.5) return vT.y;
  if (l < 2.5) return vT.z;
  return vT.w;
}

// distance (in hat units) to the nearest line of the kite grid: the hexagon
// edges, and the lines from each hexagon centre to its edge midpoints
float kiteDist(vec2 p) {
  const float R3 = 1.7320508;
  float fi = p.x / 3.0;
  float fj = (p.y - fi * R3) / (2.0 * R3);
  vec2 best = vec2(0.0); float bd = 1e9;
  for (int a = 0; a < 2; a++) for (int b = 0; b < 2; b++) {
    vec2 ij = vec2(floor(fi) + float(a), floor(fj) + float(b));
    vec2 c = vec2(3.0 * ij.x, R3 * ij.x + 2.0 * R3 * ij.y);
    float d = dot(p - c, p - c);
    if (d < bd) { bd = d; best = c; }
  }
  vec2 q = p - best;
  vec2 n0 = vec2(0.8660254, 0.5), n1 = vec2(0.0, 1.0), n2 = vec2(-0.8660254, 0.5);
  float h = R3 - max(max(abs(dot(q, n0)), abs(dot(q, n1))), abs(dot(q, n2)));
  float d0 = abs(q.x * n0.y - q.y * n0.x), d1 = abs(q.x * n1.y - q.y * n1.x), d2 = abs(q.x * n2.y - q.y * n2.x);
  return min(h, min(d0, min(d1, d2)));
}

void main() {
  float l0 = floor(uLevel), f = uLevel - l0;
  float tA = typeAt(l0), tB = typeAt(l0 + 1.0);
  vec3 colA = mix(hatColour(tA), spectreColour(tA), uSpectre);
  vec3 colB = mix(hatColour(tB), spectreColour(tB), uSpectre);
  vec3 inkA = mix(hatInk(tA), spectreInk(tA), uSpectre);
  vec3 inkB = mix(hatInk(tB), spectreInk(tB), uSpectre);
  vec3 col = mix(colA, colB, f);
  vec3 tone = mix(inkA, inkB, f);

  float odd = vI.x * uOdd;
  float rnd = vI.y;
  float g = vnoise(gl_FragCoord.xy * 0.55) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  float mottle = vnoise(vL * 1.3 + rnd * 17.0) - 0.5;

  // ---- colour print
  vec3 oddCol = mix(vec3(0.204, 0.239, 0.400), vec3(0.635, 0.169, 0.133), uSpectre);
  vec3 colour = mix(col, oddCol, odd);
  colour *= 1.0 + mottle * 0.06;
  colour += g * 0.03 + gw * 0.025;

  // ---- lithograph: ruled lines that turn with the tile
  vec3 ttone = mix(tone, vec3(0.16, 0.85, 0.6), odd);
  float hp = mix(0.42, 0.34, uSpectre);         // period, in tile units
  float a1 = (vL.x * 0.5 + vL.y * 0.8660254) / hp;
  float a2 = (vL.x * 0.5 - vL.y * 0.8660254) / hp;
  float d1 = abs(fract(a1) - 0.5) * 2.0, d2 = abs(fract(a2) - 0.5) * 2.0;
  float f1 = fwidth(a1) * 1.5 + 0.02, f2 = fwidth(a2) * 1.5 + 0.02;
  float lod = smoothstep(0.5, 0.22, fwidth(a1));
  float h1 = (1.0 - smoothstep(ttone.y - f1, ttone.y + f1, d1)) * smoothstep(0.0, 0.05, ttone.y);
  float h2 = (1.0 - smoothstep(ttone.z - f2, ttone.z + f2, d2)) * smoothstep(0.0, 0.05, ttone.z);
  h1 = mix(ttone.y, h1, lod);
  h2 = mix(ttone.z, h2, lod);
  float v = ttone.x - h1 * 0.5 - h2 * 0.42;
  v += g * 0.1 + gw * 0.07 + mottle * 0.05;
  vec3 litho = mix(uInk, uPaper, clamp(v, 0.0, 1.0));

  vec3 outc = mix(colour, litho, uLitho);

  // the kite grid inside each hat
  if (uKites > 0.001 && uSpectre < 0.5) {
    float kd = kiteDist(vL);
    float fw = max(fwidth(vL.x), fwidth(vL.y));
    float px = kd / max(fw, 1e-5);
    float show = uKites * smoothstep(0.035, 0.09, 1.0 / max(fw, 1e-5) / 100.0);
    float line = 1.0 - smoothstep(0.35 * uDpr, 0.35 * uDpr + 1.0, px);
    // construction lines: a darker shade of the tile's own colour
    vec3 kc = mix(outc * mix(0.74, 1.0, odd) + vec3(0.32) * odd, mix(uInk, uPaper, step(0.5, odd)), uLitho);
    outc = mix(outc, kc, line * show * mix(0.85, 0.3, uLitho));
  }
  gl_FragColor = vec4(outc, 1.0);
}
`;

export function makeFillMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uLevel: { value: 0 },
      uOdd: { value: 1 },
      uKites: { value: 1 },
      uSpectre: { value: 0 },
    },
    vertexShader: FILL_VS,
    fragmentShader: FILL_FS,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ------------------------------------------------------------------ lines
const LINE_VS = /* glsl */ `
attribute vec4 iPQ;
attribute float iLevel;
uniform float uH;       // half-height of the view, world units
uniform float uPx;      // world units per device pixel
uniform float uDpr;
uniform float uBase;    // size of one tile, world units
uniform float uGrow;    // how much larger each level of cluster is
uniform float uLevels;  // the outline of the whole patch
varying vec2 vW;
varying vec4 vPQ;
varying float vHalf;
varying float vA;
void main() {
  float r = uBase * pow(uGrow, iLevel) / (2.0 * uH);   // cluster size / view height
  // a tile a fifth of the view high gets a 1.2px line; each doubling of
  // cluster size adds 0.8px
  float w = clamp(1.6 + 0.8 * log2(max(r, 1e-5) / 0.16), 0.45, 3.5);
  if (iLevel >= uLevels - 0.5) w = max(w, 2.6);
  vA = smoothstep(0.006, 0.03, r);
  vHalf = 0.5 * w * uDpr * uPx;
  float hw = vHalf + 1.2 * uPx;
  vec2 p = iPQ.xy, q = iPQ.zw;
  vec2 d = q - p;
  float L = max(length(d), 1e-9);
  vec2 t = d / L, n = vec2(-t.y, t.x);
  vec2 w2 = mix(p, q, position.x * 0.5 + 0.5) + t * position.x * hw + n * position.y * hw;
  vW = w2; vPQ = iPQ;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(w2, 0.0, 1.0);
}
`;

const LINE_FS = /* glsl */ `
uniform float uLitho;
uniform float uPx;
uniform vec3 uInk;
uniform float uAlpha;
varying vec2 vW;
varying vec4 vPQ;
varying float vHalf;
varying float vA;
void main() {
  vec2 p = vPQ.xy, q = vPQ.zw;
  vec2 pa = vW - p, ba = q - p;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-12), 0.0, 1.0);
  float d = length(pa - ba * h);
  float c = 1.0 - smoothstep(vHalf - 0.6 * uPx, vHalf + 0.6 * uPx, d);
  c *= vA * uAlpha;
  if (c < 0.003) discard;
  vec3 ink = mix(vec3(0.17, 0.13, 0.11), uInk, uLitho);
  // min-blended: overlapping joints never darken twice
  gl_FragColor = vec4(mix(vec3(1.0), ink, c), 1.0);
}
`;

export function makeLineMaterial(shared, o) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLitho: shared.uLitho, uPx: shared.uPx, uDpr: shared.uDpr, uInk: shared.uInk,
      uH: { value: 10 }, uBase: { value: o.base }, uGrow: { value: o.grow }, uLevels: { value: o.levels },
      uAlpha: { value: 1 },
    },
    vertexShader: LINE_VS,
    fragmentShader: LINE_FS,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MinEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
}
