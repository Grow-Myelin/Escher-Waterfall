// Ink-and-paper shaders for the rhombs, in the spirit of the Waterfall's
// lithograph look: graphite tone, ruled hatching, grain and inked lines.
// uLitho blends between a muted colour print (0) and the lithograph (1).

import * as THREE from 'three';

export function sharedUniforms() {
  return {
    uLitho: { value: 1 },
    uPx: { value: 0.001 }, // world units per device pixel
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
// coverage of a band of half-width w around d = 0 (all in the same units), antialiased by aa
float band(float d, float w, float aa) {
  return 1.0 - smoothstep(w - aa, w + aa, d);
}
`;

const TILE_VS = /* glsl */ `
attribute vec4 aEdge;
attribute vec4 aArc;
attribute vec4 aInfo;
attribute vec2 aHatch;
attribute vec2 aCut;
varying vec4 vEdge;
varying vec4 vArc;
varying vec4 vInfo;
varying vec2 vHatch;
varying vec2 vCut;
void main() {
  vEdge = aEdge; vArc = aArc; vInfo = aInfo; vHatch = aHatch; vCut = aCut;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const COMMON = /* glsl */ `
uniform float uLitho;
uniform float uPx;
uniform float uDpr;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec4 vEdge;
varying vec4 vArc;
varying vec4 vInfo;
varying vec2 vHatch;
varying vec2 vCut;
${NOISE}
`;

// ------------------------------------------------------------------ fills
const FILL_FS = /* glsl */ `
${COMMON}
uniform float uAlpha;
void main() {
  float kind = vInfo.x;              // 1 thick, 0 thin
  float s = vInfo.w;
  float e = min(min(vEdge.x, vEdge.y), min(vEdge.z, vEdge.w)) / s;
  float g = vnoise(gl_FragCoord.xy * 0.55) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  float big = vnoise(vHatch * 3.1) - 0.5;   // slow mottling, fixed to the tile

  // ---- colour print
  vec3 thick = vec3(0.882, 0.792, 0.612);
  vec3 thin = vec3(0.447, 0.541, 0.608);
  vec3 col = mix(thin, thick, kind);
  col *= 0.93 + 0.1 * smoothstep(0.0, 0.28, e) + big * 0.05;
  col += g * 0.03 + gw * 0.025;

  // ---- lithograph: thick tiles stay pale, thin tiles are ruled
  float hp = 0.1;                    // hatch period, in edge lengths
  float a1 = vHatch.x / hp;
  float a2 = vHatch.y / (hp * 1.3);
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float f1 = fwidth(a1) * 1.5 + 0.02, f2 = fwidth(a2) * 1.5 + 0.02;
  float lod = smoothstep(0.45, 0.2, fwidth(a1));   // fade ruling when it gets too fine
  float c1 = mix(0.12, 0.5, 1.0 - kind);           // line coverage
  float c2 = mix(0.0, 0.16, 1.0 - kind);
  float h1 = (1.0 - smoothstep(c1 - f1, c1 + f1, d1)) * smoothstep(0.0, 0.05, c1);
  float h2 = (1.0 - smoothstep(c2 - f2, c2 + f2, d2)) * smoothstep(0.0, 0.05, c2);
  h1 = mix(c1, h1, lod);
  h2 = mix(c2, h2, lod);
  float v = mix(0.86, 0.97, kind);
  v -= h1 * mix(0.2, 0.62, 1.0 - kind) + h2 * 0.35;
  v -= (1.0 - smoothstep(0.0, 0.22, e)) * 0.05;   // a breath of tone along the edges
  v += g * 0.1 + gw * 0.07 + big * 0.04;
  v = clamp(v, 0.0, 1.0);
  vec3 litho = mix(uInk, uPaper, v);

  gl_FragColor = vec4(mix(col, litho, uLitho), uAlpha);
}
`;

// ------------------------------------------------------------------ ink: outlines, arcs, cuts
const INK_FS = /* glsl */ `
${COMMON}
uniform float uLine;     // outline opacity
uniform float uLineW;    // outline half-width, CSS px
uniform float uArc;      // arc opacity
uniform float uCut;      // Robinson cut opacity
uniform vec3 uSuper;     // outline colour (colour mode)
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
void main() {
  float s = vInfo.w;
  float px = uPx;
  float aa = px * 0.75;
  vec4 acc = vec4(0.0);
  vec3 ink = mix(vec3(0.16, 0.13, 0.11), uInk, uLitho);
  vec3 paper = uPaper;

  // dashed cut along the Robinson diagonal BC
  if (uCut > 0.001) {
    float dash = step(0.5, fract(vCut.y * 7.0 + 0.25));
    float c = band(abs(vCut.x) * s, 0.6 * px * uDpr, aa) * dash;
    vec3 cc = mix(vec3(0.62, 0.2, 0.15), vec3(0.636, 0.231, 0.165), uLitho);
    acc = over(acc, cc, c * uCut);
  }

  if (uArc > 0.001) {
    float dX = abs(length(vArc.xy) - vInfo.y);
    float dY = abs(length(vArc.zw) - vInfo.z);
    float wX = max(0.042 * s, 0.9 * px * uDpr);
    float wY = max(0.03 * s, 0.9 * px * uDpr);
    vec3 cX = mix(vec3(0.66, 0.2, 0.15), ink, uLitho);
    vec3 cY = mix(vec3(0.95, 0.92, 0.84), ink, uLitho);
    float y = band(dY, wY, aa);
    // colour: a pale cord edged in ink; litho: an ink cord with a paper core
    float core = band(dY, wY * 0.42, aa);
    acc = over(acc, mix(ink, cY, 1.0 - uLitho), y * uArc);
    acc = over(acc, mix(cY, paper, uLitho), core * uArc * mix(0.0, 1.0, uLitho));
    acc = over(acc, cY, band(dY, wY * 0.62, aa) * uArc * (1.0 - uLitho));
    acc = over(acc, cX, band(dX, wX, aa) * uArc);
  }

  float e = min(min(vEdge.x, vEdge.y), min(vEdge.z, vEdge.w));
  float w = uLineW * px * uDpr;
  float line = band(e, w, aa);
  acc = over(acc, mix(uSuper, uInk, uLitho), line * uLine);

  if (acc.a < 0.002) discard;
  gl_FragColor = acc;      // premultiplied
}
`;

export function makeFillMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uAlpha: { value: 1 } },
    vertexShader: TILE_VS,
    fragmentShader: FILL_FS,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function makeInkMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uLine: { value: 1 },
      uLineW: { value: 0.5 },
      uArc: { value: 1 },
      uCut: { value: 0 },
      uSuper: { value: new THREE.Vector3(0.18, 0.14, 0.12) },
    },
    vertexShader: TILE_VS,
    fragmentShader: INK_FS,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ------------------------------------------------------------------ symmetry centres
const CENTRE_VS = /* glsl */ `
attribute vec2 aLocal;
attribute vec4 aC;
varying vec2 vL;
varying vec4 vC;
void main() {
  vL = aLocal; vC = aC;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CENTRE_FS = /* glsl */ `
uniform float uAlpha;
uniform float uPx;
uniform float uDpr;
uniform float uLitho;
varying vec2 vL;
varying vec4 vC;
const float PI = 3.14159265;
// signed distance to a regular five-pointed star (after Inigo Quilez)
float sdStar5(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
void main() {
  float R = vC.x, s = vC.y, ang = vC.z;
  float px = uPx;
  float aa = px * 0.8;
  float d = length(vL);
  vec3 red = mix(vec3(0.70, 0.16, 0.12), vec3(0.636, 0.231, 0.165), uLitho);
  vec4 acc = vec4(0.0);
  if (R > 3.0 * s) {
    // a fine ring where the five-fold symmetry ends
    float w = 0.6 * px * uDpr;
    acc = over(acc, red, (1.0 - smoothstep(w - aa, w + aa, abs(d - R))) * 0.55);
  }
  // the star, pointing along the five edges that meet here; larger stars
  // mark symmetry that reaches further
  float size = vC.w > 0.5 ? 0.62 * s : clamp(0.12 * R, 0.24 * s, 0.62 * s);
  size = min(size, 15.0 * px * uDpr);
  vec2 q = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * vL;
  q = vec2(q.y, q.x);
  float st = sdStar5(q, size, 0.45);
  acc = over(acc, vec3(0.97, 0.94, 0.86), 1.0 - smoothstep(-aa, aa, st - 1.4 * px * uDpr));
  acc = over(acc, red, 1.0 - smoothstep(-aa, aa, st));
  acc *= uAlpha;
  if (acc.a < 0.002) discard;
  gl_FragColor = acc;
}
`;

export function makeCentreMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: { uAlpha: { value: 1 }, uPx: shared.uPx, uDpr: shared.uDpr, uLitho: shared.uLitho },
    vertexShader: CENTRE_VS,
    fragmentShader: CENTRE_FS,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
