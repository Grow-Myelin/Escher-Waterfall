// Lithograph shader for the band and the ants: the Waterfall's ink shader
// (src/materials.js), copied and extended with
//   - a paint wash keyed to Σ, each vertex's place along the band's single
//     side (0 … 4π), so paint can be shown spreading over the one side;
//   - a spot colour, so the lead ant prints in red ink like a two-colour print.

import * as THREE from 'three';

export function createUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(-0.35, 0.85, 0.55).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
    uSpot: { value: new THREE.Vector3(0.78, 0.27, 0.18) },
    uPaint: { value: 0 }, // how much of the 4π is painted, 0 … 1
    uPaintFrom: { value: 0 }, // Σ where the paint starts
    uMark: { value: 0 }, // Σ of the start mark (the far-face mark is at Σ + 2π)
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
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face, float spot) {
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
  vec3 litho = mix(uInk, mix(uPaper, uSpot, spot), v);
  return mix(colour, litho, uLitho);
}
`;


const VS = /* glsl */ `
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
attribute float asig;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying float vSig;
varying vec3 vV;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vSig = asig;
  vV = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FS = /* glsl */ `
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uSpot;
uniform float uPaint;
uniform float uPaintFrom;
uniform float uMark;
uniform float uFade;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying float vSig;
varying vec3 vV;
${NOISE}
${LITHO}
const float FOUR_PI = 12.566370614359172;

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float diff = max(dot(n, uLight), 0.0);
  float rim = pow(1.0 - abs(dot(n, normalize(vV))), 3.0);
  float shade = 0.42 + 0.62 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;
  float spot = 0.0;

  if (pat == 2.0) {            // the band's faces: fine wood grain along the straps
    float g = vnoise(vec2(uv.x * 1.6, uv.y * 26.0));
    tex = 0.95 + 0.08 * g;
  } else if (pat == 3.0) {     // the walls round the holes
    shade *= 0.9;
  } else if (pat == 4.0) {     // ant
    shade = 0.5 + 0.5 * diff + rim * 0.25;
  } else if (pat == 5.0) {     // lead ant: spot colour
    shade = 0.55 + 0.5 * diff + rim * 0.2;
    spot = 1.0;
  }

  vec3 col = vC * tex * shade;
  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  // ants are printed in nearly solid ink: no hatching across their bodies
  vec2 huv = pat >= 4.0 ? vec2(0.0) : uv;
  vec3 outc = finish(col, vM.y, ink, huv, fw, face, spot);

  // paint: spreads both ways from where it was put down, along the single
  // side. Each front runs 2π; they meet on the far face, behind the start.
  if (vSig >= 0.0 && uPaint > 0.0) {
    float d = mod(vSig - uPaintFrom, FOUR_PI);
    float dd = min(d, FOUR_PI - d);
    float reach = uPaint * 6.2831853;
    float on = 1.0 - smoothstep(reach - 0.015, reach + 0.015, dd);
    if (uPaint >= 1.0) on = 1.0;
    float k = dd / 6.2831853;
    vec3 c0 = vec3(0.99, 0.84, 0.55), c1 = vec3(0.88, 0.52, 0.32);
    vec3 tint = mix(c0, c1, k);
    // a fine stripe every 30 degrees of travel, so the colour can be followed
    float sv = dd / 0.5235988;
    float stripe = 1.0 - smoothstep(0.0, fwidth(sv) * 1.5 + 0.03, abs(fract(sv + 0.5) - 0.5));
    tint *= 1.0 - 0.12 * stripe;
    float front = (1.0 - smoothstep(0.0, 0.09, abs(dd - reach))) * step(uPaint, 0.999);
    outc = mix(outc, outc * tint * 1.04, on);
    outc = mix(outc, vec3(0.75, 0.3, 0.16), front * 0.65);
  }
  // the start mark across the centre strap: solid at 0°, outlined at 360°
  if (pat == 2.0 && abs(uv.y) < 0.24) {
    float dm = mod(vSig - uMark + 6.2831853, FOUR_PI) - 6.2831853; // −2π … 2π
    float far = mod(vSig - uMark, FOUR_PI) - 6.2831853;
    float px = fwidth(vSig);
    float solid = 1.0 - smoothstep(0.011, 0.011 + px, abs(dm));
    float ring = abs(abs(far) - 0.011);
    float hollow = (1.0 - smoothstep(0.0025, 0.0025 + px, ring)) * step(abs(uv.y), 0.235);
    vec3 red = mix(vec3(0.72, 0.2, 0.13), vec3(0.66, 0.16, 0.1), uLitho);
    outc = mix(outc, red, max(solid, hollow * 0.9));
  }
  gl_FragColor = vec4(outc, uFade);
}
`;

export function makeMaterial(uniforms, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VS,
    fragmentShader: FS,
    side: opts.side ?? THREE.FrontSide,
    transparent: !!opts.transparent,
  });
}
