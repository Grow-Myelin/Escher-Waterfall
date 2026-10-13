// Shaders for the curved view.
//
// Every vertex is projected by direction, not through a flat picture plane.
// With the camera's forward f, right r and up u, a direction n from the eye
// gets two angles:
//
//   phi    = asin(n·r)              how far right of the vertical plane (f, u)
//   lambda = atan2(n·u, n·f)        how far it is turned up about the r axis
//
// The curved picture plots x = phi, y = lambda (a transverse equirectangular
// map). Straight up is lambda = +90°, a single point at the top; straight
// down is lambda = -90°, a single point at the bottom.
//
// Linear perspective is the same pair of angles through tangents:
// y = tan(lambda) = n·u / n·f and x = tan(phi) / cos(lambda) = n·r / n·f.
// uS blends between them: x = tan(s·phi)/s / cos(lambda)^s, y = tan(s·lambda)/s,
// with s = 1 the pinhole camera and s → 0 the curved map.
//
// The fragment shader is the Waterfall's ink / lithograph shader, with
// outlines measured to the four sides of each (tessellated) face.

import * as THREE from 'three';

export function createUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(0.3, 0.88, 0.36).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uEye: { value: new THREE.Vector3() },
    uFwd: { value: new THREE.Vector3(0, 0, -1) },
    uRight: { value: new THREE.Vector3(1, 0, 0) },
    uUp: { value: new THREE.Vector3(0, 1, 0) },
    uS: { value: 0 },
    uHalf: { value: new THREE.Vector2(1.3, 1.65) },
    uFar: { value: 200 },
    uTop: { value: 50 },
    uFade: { value: 1 },
    uLift: { value: 0 }, // lightens a material in lithograph mode only (the figures)
  };
}

export const PROJECT = /* glsl */ `
uniform vec3 uEye;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform float uS;
uniform vec2 uHalf;
uniform float uFar;
varying float vFront;
vec4 curvedProject(vec3 wp) {
  vec3 d = wp - uEye;
  float dist = max(length(d), 1e-4);
  vec3 n = d / dist;
  float a = dot(n, uRight), b = dot(n, uUp), c = dot(n, uFwd);
  float phi = asin(clamp(a, -1.0, 1.0));
  float lam = atan(b, c);
  vFront = c;
  float x, y;
  if (uS < 1e-3) {
    x = phi; y = lam;
  } else {
    float lim = 1.56;
    y = tan(clamp(uS * lam, -lim, lim)) / uS;
    x = tan(clamp(uS * phi, -lim, lim)) / uS / pow(max(cos(lam), 1e-3), uS);
  }
  float z = clamp(dist / uFar, 0.0, 1.0) * 2.0 - 1.0;
  return vec4(clamp(x / uHalf.x, -50.0, 50.0), clamp(y / uHalf.y, -50.0, 50.0), z, 1.0);
}
`;

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
  return smoothstep(3.5, 8.0, period / max(fw, 1e-5));
}
`;

const LITHO = /* glsl */ `
vec3 finish(vec3 col, float ink, vec2 huv, float hfw, float face) {
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = 0.2;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85);
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85);
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  float h1 = 1.0 - smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  // fade each set where its lines come closer than a few pixels
  float l1 = hl * (1.0 - smoothstep(0.12, 0.28, fwidth(a1)));
  float l2 = hl * (1.0 - smoothstep(0.12, 0.28, fwidth(a2)));
  h1 = mix(c1, h1, l1);
  h2 = mix(c2, h2, l2);
  float v = 0.2 + 0.82 * t;
  v -= h1 * 0.22 + h2 * 0.2;
  v += g * 0.12 + gw * 0.07;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`;

const VS = /* glsl */ `
attribute vec3 acol;
attribute vec2 fuv;
attribute vec4 edge;
attribute vec2 amat;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec4 vE;
varying vec2 vM;
varying vec3 vW;
${PROJECT}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
  gl_Position = curvedProject(wp.xyz);
}
`;

const FS = /* glsl */ `
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uTop;
uniform float uFade;
uniform float uLift;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec4 vE;
varying vec2 vM;
varying vec3 vW;
varying float vFront;
${NOISE}
${LITHO}

void main() {
  if (vFront < -0.2) discard;
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.66 + 0.4 * diff;
  // light falls in from the open top, so the well darkens with depth
  shade *= mix(0.74, 1.05, smoothstep(-2.0, uTop, vW.y));
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;
  float glow = 0.0;

  if (pat == 2.0) {            // ashlar
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.9 + 0.16 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.02) * l * 0.7;
  } else if (pat == 4.0) {     // wood
    float ph = 0.22;
    float fy = fract(uv.x / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    tex = mix(1.0, 0.8 + 0.3 * vnoise(vec2(uv.x * 30.0, uv.y * 1.5)), l);
    lines = lineMask(d, 0.012) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 14.0) {    // stone treads
    tex = 0.93 + 0.1 * fbm(uv * 1.4);
  } else if (pat == 15.0) {    // the dark inside of a doorway
    tex = 0.9 + 0.1 * vnoise(uv * 3.0);
  } else if (pat == 16.0) {    // window light
    glow = 1.0;
  } else if (pat == 17.0) {    // floor mosaic: rings and rays about the well's centre
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float ring = abs(fract(r / 1.2) - 0.5) * 1.2;
    float ray = abs(fract(a / 6.2832 * 24.0) - 0.5) / 24.0 * 6.2832 * r;
    float star = step(fract(r / 2.4 + 0.25 * step(0.5, fract(a / 6.2832 * 12.0))), 0.5);
    float l = lod(0.6, fw);
    tex = mix(1.0, mix(0.78, 1.06, star), l);
    lines = max(lineMask(ring, 0.03), lineMask(ray, 0.03)) * l * 0.8;
    tex *= 0.95 + 0.08 * fbm(uv * 2.0);
  } else if (pat == 18.0) {    // water
    float w = sin(length(uv) * 9.0 - uTime * 2.5) * 0.5 + 0.5;
    tex = 0.88 + 0.16 * w;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines;
  if (glow > 0.5) col = mix(vC, vec3(1.0), 0.15);
  col = mix(col, vec3(0.97, 0.95, 0.9), uLift * uLitho);

  float e = min(min(vE.x, vE.y), min(vE.z, vE.w));
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;

export function makeInk(uniforms, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VS,
    fragmentShader: FS,
    transparent: !!opts.transparent,
    side: opts.side ?? THREE.DoubleSide,
  });
}

// Dashed guide lines, drawn with the same projection.
const LINE_VS = /* glsl */ `
attribute float dist;
varying float vD;
${PROJECT}
void main() {
  vD = dist;
  gl_Position = curvedProject((modelMatrix * vec4(position, 1.0)).xyz);
  gl_Position.z = -1.0;
}
`;
const LINE_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uDash;
varying float vD;
varying float vFront;
void main() {
  if (vFront < -0.2) discard;
  if (uDash > 0.0 && fract(vD / uDash) > 0.6) discard;
  gl_FragColor = vec4(uColor, uOpacity);
}
`;

export function makeLine(uniforms, color, dash) {
  return new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 }, uDash: { value: dash } },
    vertexShader: LINE_VS,
    fragmentShader: LINE_FS,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
}
