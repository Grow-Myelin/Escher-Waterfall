// The Waterfall's ink / lithograph shader (src/materials.js), copied here and
// extended for convex/concave reversal:
//
//   uSplit, uBand – right of the picture's centre line the shading normal is
//            that of the concave reading: the same surface with its depth
//            reversed along the line of sight d, seen from the hollow side,
//                 n' = −n + 2 (n·d) d
//            (the part of n in the picture plane flips, the part along d
//            stays). Across a band |X| < uBand round the centre line the
//            relief is flattened and turned over smoothly: at X = 0 every
//            normal points straight at the viewer and the shading is neutral.
//   uShade – 1 lit, 0 flat (a pure line drawing, with no cue at all)
//   uLight – set every frame from the light dial
//   uHatch – scales the hatching period
//
// Everything else (graphite tone, grain, face-following hatching in shadow,
// inked outlines from per-triangle edge distances) is unchanged.

import * as THREE from 'three';

export function createSharedUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(0.1, 0.9, 0.66).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
    uBg: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uSplit: { value: 1 },
    uBand: { value: 2.2 },
    uShade: { value: 1 },
    uView: { value: new THREE.Vector3(1, 1, 1).normalize() },
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
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
float lineMask(float d, float w) {
  float px = max(fwidth(d), 1e-5);
  float ww = max(w, px * 0.55);
  return (1.0 - smoothstep(ww - px * 0.5, ww + px * 0.5, d)) * min(1.0, w / (px * 0.55) + 0.35);
}
float lod(float period, float fw) {
  return smoothstep(2.5, 6.0, period / max(fw, 1e-5));
}
`;

const LITHO = /* glsl */ `
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);

  float L = dot(col, vec3(0.30, 0.59, 0.11));
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = (0.22 + haze * 0.25) * uHatch;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  // a band of relative width c around each hatch line, so the mean cover is c
  // at every scale (the lod blend below then never changes the tone)
  float h1 = smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  h1 = mix(c1, h1, hl);
  h2 = mix(c2, h2, hl);
  float v = 0.2 + 0.82 * t;
  v -= h1 * 0.22 + h2 * 0.2;
  v += g * 0.12 + gw * 0.07;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`;

const INK_VS = /* glsl */ `
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
uniform float uTime;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
void main() {
  vec3 p = position;
  if (amat.z > 0.0) {
    // sway (the pennant): amplitude grows along the cloth
    float g = amat.z;
    float ph = uTime * 3.1 - fuv.x * 2.2;
    p.x += sin(ph) * 0.13 * g;
    p.z += sin(ph) * 0.13 * g;
    p.y += sin(ph * 0.7 + 1.3) * 0.05 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const INK_FS = /* glsl */ `
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uBg;
uniform float uFade;
uniform float uCue;
uniform float uHatch;
uniform float uSplit;
uniform float uBand;
uniform float uShade;
uniform vec3 uView;
varying vec3 vW;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
${NOISE}
${LITHO}

void main() {
  vec3 n = normalize(vN);
  // picture X of this point (isometric: (x − z)/√2), and the reading there
  float X = (vW.x - vW.z) * 0.70710678;
  float k = uSplit * smoothstep(-uBand, uBand, X);
  vec3 ns = normalize(n - 2.0 * k * (n - dot(n, uView) * uView));
  float diff = max(dot(ns, uLight), 0.0);
  float shade = mix(0.84, 0.36 + 0.66 * diff, uShade);
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 2.0) {            // ashlar (dressed stone courses)
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.018) * l * 0.6;
  } else if (pat == 3.0) {     // two-tone square tiles
    vec2 g = uv / 1.2;
    vec2 cell = floor(g);
    float chk = mod(cell.x + cell.y, 2.0);
    vec2 f = fract(g) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(1.2, fw);
    tex = mix(1.0, mix(1.06, 0.66, chk) * (0.97 + 0.06 * hash12(cell)), l);
    lines = smoothstep(0.465, 0.497, r) * l * 0.5;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 6.0) {     // grass
    tex = 0.85 + 0.25 * fbm(uv * 1.7);
  } else if (pat == 7.0) {     // flagstones
    vec2 g = uv / 1.1;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(1.1, fw);
    tex = mix(1.0, 0.95 + 0.09 * hash12(cell), l) * (0.97 + 0.06 * vnoise(uv * 3.0));
    lines = smoothstep(0.46, 0.495, r) * l * 0.45;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 22.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.75 + 0.45 * fbm(uv * 3.0);
  } else if (pat == 10.0) {    // rough stone
    float rh = 0.3, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.025) * l * 0.75;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  outc = mix(outc, uBg, smoothstep(0.45, 1.0, vM.y));
  outc = mix(uBg, outc, uCue);
  gl_FragColor = vec4(outc, uFade);
}
`;

// opts: fade (start value), cue, hatch, transparent, side, offset (polygon offset)
export function makeInk(shared, opts = {}) {
  const m = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uFade: { value: opts.fade ?? 1 },
      uCue: { value: opts.cue ?? 1 },
      uHatch: { value: opts.hatch ?? 1 },
    },
    vertexShader: INK_VS,
    fragmentShader: INK_FS,
    transparent: !!opts.transparent,
    side: opts.side ?? THREE.FrontSide,
  });
  if (opts.offset) {
    m.polygonOffset = true;
    m.polygonOffsetFactor = opts.offset;
    m.polygonOffsetUnits = opts.offset;
  }
  return m;
}
