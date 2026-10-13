// The Waterfall's ink / lithograph shader (src/materials.js), copied so it can
// gain a height mist: every pier fades into the paper below the walkways, so
// the eye has no common ground on which to compare the heights of the towers.
//
// A single uniform, uLitho, blends between muted colour and a black-and-white
// lithograph: graphite tone, grain, face-following hatching and inked outlines.

import * as THREE from 'three';

export function createUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(0.1, 0.9, 0.66).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
    uBgColour: { value: new THREE.Vector3(0.906, 0.894, 0.851) },
    uFogTop: { value: 0.0 },
    uFogBot: { value: -3.5 },
    uFade: { value: 1 },
  };
}

export const NOISE = /* glsl */ `
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

export const LITHO = /* glsl */ `
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
  float hp = 0.13 + haze * 0.15;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  float h1 = 1.0 - smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  // no lines at all where the tone needs none (the original leaves faint ones)
  h1 *= smoothstep(0.0, 0.06, c1);
  h2 *= smoothstep(0.0, 0.06, c2);
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
    float ph = uTime * 2.2 + position.x * 1.7 + position.z * 1.1;
    float g = amat.z;
    p.x += (sin(ph) * 0.05 + sin(ph * 2.3 + 1.7) * 0.02) * g;
    p.z += sin(ph * 0.9 + 0.4) * 0.05 * g;
    p.y += sin(ph * 1.3 + 0.9) * 0.02 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
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
uniform vec3 uBgColour;
uniform float uFogTop;
uniform float uFogBot;
uniform float uFade;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${NOISE}
${LITHO}

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.42 + 0.63 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {            // brick
    float rh = 0.17, bl = 0.38;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.3 * h, l);
    lines = lineMask(d, 0.012) * l * 0.85;
  } else if (pat == 2.0) {     // ashlar
    float rh = 0.25, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 9.0));
    lines = lineMask(d, 0.011) * l * 0.6;
  } else if (pat == 3.0) {     // roof tiles
    float rh = 0.16, bw = 0.2;
    float row = floor(uv.y / rh);
    float x = uv.x / bw + 0.5 * mod(row, 2.0);
    float fx = fract(x) - 0.5;
    float fy = fract(uv.y / rh);
    float scallop = 0.18 * (1.0 - 4.0 * fx * fx);
    float yy = fy - scallop;
    float l = lod(rh, fw);
    tex = mix(1.0, 0.62 + 0.5 * smoothstep(0.0, 1.0, fract(yy)) + 0.08 * hash12(vec2(floor(x), row)), l);
    float dl = min(abs(fract(yy)) * rh, (1.0 - fract(yy)) * rh);
    float dv = abs(fx) > 0.47 ? 0.0 : 1.0;
    lines = max(lineMask(dl, 0.01), (1.0 - dv) * 0.6) * l;
  } else if (pat == 4.0) {     // wood
    float ph = 0.12;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 3.0, uv.y * 60.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.008) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 1.8) + 0.03 * vnoise(uv * 18.0);
  } else if (pat == 7.0) {     // flagstones: 2 x 2 slabs per tile, tile edges a little stronger
    vec2 tc = uv + 0.5;
    vec2 g = tc * 2.0;
    vec2 f = fract(g);
    vec2 cell = floor(g);
    float d = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) / 2.0;
    vec2 ft = fract(tc);
    float dt = min(min(ft.x, 1.0 - ft.x), min(ft.y, 1.0 - ft.y));
    float l = lod(0.5, fw);
    tex = mix(1.0, 0.93 + 0.1 * hash12(cell + 3.0), l) * (0.97 + 0.05 * vnoise(uv * 7.0));
    lines = max(lineMask(d, 0.007) * 0.55, lineMask(dt, 0.011) * 0.9) * l;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 40.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.72 + 0.5 * fbm(uv * 6.0);
  } else if (pat == 10.0) {    // rough stone
    float rh = 0.2, bl = 0.36;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.012) * l * 0.75;
  } else if (pat == 12.0) {    // soil / moss
    tex = 0.8 + 0.3 * fbm(uv * 5.0);
  } else if (pat == 14.0) {    // cloud: soft, no texture
    tex = 1.0;
    shade = 0.7 + 0.36 * diff;
  } else if (pat == 15.0) {    // outline hull: flat ink
    float fogH = smoothstep(uFogTop, uFogBot, vW.y);
    vec3 bgH = mix(uBgColour, uPaper, uLitho);
    vec3 inkC = mix(vec3(0.42, 0.4, 0.37), uInk * 1.6, uLitho);
    gl_FragColor = vec4(mix(inkC, bgH, fogH * 0.6), uFade);
    return;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  // mist: everything below the walkways dissolves into the paper
  float fog = smoothstep(uFogTop, uFogBot, vW.y);
  fog = fog * fog * (3.0 - 2.0 * fog);
  vec3 bg = mix(uBgColour, uPaper, uLitho);
  float grain = hash12(gl_FragCoord.xy * 1.3) - 0.5;
  outc = mix(outc, bg + grain * 0.02, clamp(fog + grain * 0.08 * fog * (1.0 - fog) * 4.0, 0.0, 1.0));
  gl_FragColor = vec4(outc, uFade);
}
`;

export function makeInkMaterial(uniforms, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: INK_VS,
    fragmentShader: INK_FS,
    transparent: !!opts.transparent,
    depthWrite: opts.depthWrite ?? true,
    side: opts.side ?? THREE.FrontSide,
  });
}
