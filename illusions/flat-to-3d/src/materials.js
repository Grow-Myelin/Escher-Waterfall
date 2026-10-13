// Shaders, adapted from the Waterfall (src/materials.js). Everything is drawn
// in display (sRGB) space directly: these are illustrations, not physically
// based materials. Added here: desk patterns (wood, page block, cloth, pewter,
// stone) and a drawing shader shared by the sketchbook page and the lizard.
//
// A single uniform, uLitho, blends between a muted colour rendering and a
// black-and-white lithograph rendering: graphite tone, grain, face-following
// hatching in the shadows and inked outlines.

import * as THREE from 'three';

export function createSharedUniforms() {
  return {
    uTime: { value: 0 },
    uFlowTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(0.1, 0.9, 0.66).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
    uFade: { value: 1 },
    uHatch: { value: 0.055 }, // hatching period, world units (the Waterfall uses 0.22 at its scale)
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
// 1 on a line of half-width w (world units) around d = 0; never thinner than ~0.7px
float lineMask(float d, float w) {
  float px = max(fwidth(d), 1e-5);
  float ww = max(w, px * 0.55);
  return (1.0 - smoothstep(ww - px * 0.5, ww + px * 0.5, d)) * min(1.0, w / (px * 0.55) + 0.35);
}
// fade detail out when its period shrinks below a few pixels
float lod(float period, float fw) {
  return smoothstep(2.5, 6.0, period / max(fw, 1e-5));
}
`;

// Converts a colour to the lithograph look and blends by uLitho.
export const LITHO = /* glsl */ `
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  // aerial perspective
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);

  // ---- lithograph ----
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  // hatching that follows the surface: one set below mid tone, a cross set in deep shade
  float hp = uHatch + haze * 0.25;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  // a line covers the fraction c of each period (darker tone, wider line)
  float h1 = smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1) * smoothstep(0.0, 0.06, c1);
  float h2 = smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2) * smoothstep(0.0, 0.06, c2);
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
    float ph = uTime * 1.5 + position.x * 0.5 + position.z * 0.25;
    float g = amat.z;
    p.z += (sin(ph) * 0.20 + sin(ph * 2.3 + 1.7) * 0.06) * g;
    p.x += sin(ph * 0.7 + 0.4) * 0.07 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  #ifdef USE_INSTANCING
    wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  #endif
  vN = normalize(mat3(modelMatrix) * normal);
  vW = wp.xyz;
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
uniform float uFade;
uniform float uHatch;
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
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.36 + 0.66 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {            // brick
    float rh = 0.34, bl = 0.76;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.3 * h, l);
    lines = lineMask(d, 0.022) * l * 0.85;
  } else if (pat == 2.0) {     // ashlar (dressed stone courses)
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.018) * l * 0.6;
  } else if (pat == 3.0) {     // roof tiles: scalloped courses
    float rh = 0.42, bw = 0.5;
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
    lines = max(lineMask(dl, 0.02), (1.0 - dv) * 0.6) * l;
  } else if (pat == 4.0) {     // wood planks
    float ph = 0.28;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 1.5, uv.y * 30.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.015) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 6.0) {     // grass
    tex = 0.85 + 0.25 * fbm(uv * 1.7);
  } else if (pat == 7.0) {     // cobbles
    vec2 g = uv / 0.36;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(0.36, fw);
    tex = mix(1.0, 0.86 + 0.24 * hash12(cell), l);
    lines = smoothstep(0.38, 0.49, r) * l * 0.7;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 22.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.75 + 0.45 * fbm(uv * 3.0);
  } else if (pat == 10.0) {    // rough stone (terrace walls)
    float rh = 0.3, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.025) * l * 0.75;
  } else if (pat == 11.0) {    // window pane
    tex = 0.75 + 0.35 * smoothstep(0.2, 0.9, fract((uv.x + uv.y) * 0.8));
  } else if (pat == 12.0) {    // soil
    tex = 0.85 + 0.2 * fbm(uv * 2.5);
  } else if (pat == 13.0) {    // vine rows (tops of the terraces)
    tex = 0.86 + 0.18 * fbm(uv * 0.9);
  } else if (pat == 14.0) {    // desk: planks with wood grain along x
    float pw = 1.7;
    float plank = floor(uv.y / pw);
    float fy = fract(uv.y / pw) * pw;
    float seam = lineMask(min(fy, pw - fy), 0.012) * lod(pw, fw);
    float h = hash12(vec2(plank, 3.0));
    float warp = fbm(vec2(uv.x * 0.15 + h * 9.0, uv.y * 1.1)) * 3.0;
    float grain = fract((uv.y + warp * 0.3 + h) * 5.0);
    float g = smoothstep(0.0, 0.5, grain) * smoothstep(1.0, 0.7, grain);
    float l = lod(0.2, fw);
    tex = (0.93 + 0.07 * h) * mix(1.0, 0.93 + 0.08 * g, l) * (0.97 + 0.05 * vnoise(uv * vec2(0.3, 5.0)));
    lines = seam * 0.8;
  } else if (pat == 15.0) {    // page block: fine lines along the edges of the leaves
    float ph = 0.022;
    float fy = fract(uv.y / ph);
    float l = lod(ph, fw);
    tex = mix(0.96, 0.9 + 0.1 * fy, l);
  } else if (pat == 16.0) {    // book cloth: a fine weave
    float w = sin(uv.x * 140.0) * sin(uv.y * 140.0);
    tex = 0.95 + 0.03 * w * lod(0.12, fw) + 0.07 * fbm(uv * 1.5);
  } else if (pat == 17.0) {    // pewter: spun rings, a polished sheen
    vec3 vd = normalize(cameraPosition - vW);
    vec3 hv = normalize(vd + uLight);
    float sp = pow(max(dot(normalize(vN), hv), 0.0), 18.0);
    float ring = sin(length(uv) * 90.0) * lod(0.07, fw);
    tex = 0.9 + 0.04 * ring + 0.55 * sp;
  } else if (pat == 18.0) {    // stone: veined
    float v1 = fbm(uv * 1.6 + 4.0);
    float vein = 1.0 - smoothstep(0.0, 0.05, abs(fract(v1 * 3.0 + uv.x * 0.4) - 0.5) - 0.42);
    tex = 0.9 + 0.12 * fbm(uv * 3.0) - 0.16 * vein;
  } else if (pat == 19.0) {    // pencil: painted facets with a lengthwise stripe
    tex = 0.94 + 0.06 * sin(uv.x * 30.0);
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;

export function makeInkMaterial(uniforms, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: INK_VS,
    fragmentShader: INK_FS,
    transparent: !!opts.transparent,
    side: opts.side ?? THREE.FrontSide,
  });
}


// ---------------------------------------------------------------- drawing
// The sketchbook page and the lizard share this shader. Both sample a drawing
// (one canvas for the lithograph, one for colour) and light it the same way,
// normalised so that a surface facing straight up keeps the drawing's own
// tones. The flat lizard is therefore indistinguishable from the page; as it
// is inflated, light, shading, hatching and a darkening rim appear.
const DRAW_VS = /* glsl */ `
attribute float aDist;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vDist;
void main() {
  vUv = uv;
  vDist = aDist;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const DRAW_FS = /* glsl */ `
uniform sampler2D uMapL;
uniform sampler2D uMapC;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uSolid;      // 0 flat drawing, 1 solid body
uniform float uContours;   // reveal: contour lines of the inflation
uniform float uContourStep;
uniform float uFill;       // 1 the finished drawing, 0 just its outline
uniform float uLineW;      // half width of that outline (distance units)
uniform vec3 uSketchPaper;
uniform vec3 uSketchLine;
uniform float uUvScale;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vDist;
${NOISE}
void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec4 tl = texture2D(uMapL, vUv);
  vec4 tc = texture2D(uMapC, vUv);
  vec3 base = mix(tc.rgb, tl.rgb, uLitho);
  float a = mix(tc.a, tl.a, uLitho);
  if (uFill < 0.999) {
    float ln = 1.0 - smoothstep(uLineW * 0.55, uLineW * 1.45, vDist);
    base = mix(mix(uSketchPaper, uSketchLine, ln), base, uFill);
  }
  // light, normalised to a face looking straight up
  float up = 0.42 + 0.62 * max(uLight.y, 0.0);
  float diff = 0.42 + 0.62 * max(dot(n, uLight), 0.0);
  float shade = mix(1.0, diff / up, uSolid);
  vec3 vd = normalize(cameraPosition - vW);
  float rim = 1.0 - smoothstep(0.08, 0.42, abs(dot(n, vd)));
  float spec = pow(max(dot(n, normalize(vd + uLight)), 0.0), 24.0) * 0.35 * uSolid;
  vec3 col = base * shade + spec;
  // lithograph: hatching that follows the surface where it turns from the light
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float dark = clamp((1.0 - shade) * 2.2, 0.0, 1.0) * uSolid;
  // hatching follows the drawing's own coordinates, so it bends with the body
  vec2 hu = vUv * uUvScale;
  float hp = 0.045;
  float a1 = (hu.x + hu.y) / hp;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float aa = fwidth(a1) * 1.5 + 0.02;
  float c1 = clamp(dark * 0.9, 0.0, 0.85);
  float h1 = mix(c1, smoothstep(1.0 - c1 - aa, 1.0 - c1 + aa, d1) * smoothstep(0.0, 0.06, c1), lod(hp, fwidth(hu.x)));
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  vec3 colour = col * (1.0 - rim * 0.55 * uSolid) + g * 0.03 + gw * 0.025;
  vec3 litho = col * (1.0 - h1 * 0.35 * uLitho) * (1.0 - rim * 0.8 * uSolid);
  litho += (g * 0.07 + gw * 0.05);
  vec3 outc = mix(colour, litho, uLitho);
  // contour lines of equal height (reveal)
  if (uContours > 0.001) {
    float cl = vDist / uContourStep;
    float dc = abs(fract(cl + 0.5) - 0.5);
    float w = fwidth(cl) * 1.2;
    float m = (1.0 - smoothstep(w * 0.5, w * 1.5, dc)) * step(0.5, cl);
    outc = mix(outc, vec3(0.64, 0.23, 0.16), m * uContours * 0.85);
  }
  gl_FragColor = vec4(outc, a * uFade);
}
`;

export function makeDrawingMaterial(uniforms, mapL, mapC, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      uMapL: { value: mapL },
      uMapC: { value: mapC },
      uSolid: { value: opts.solid ?? 0 },
      uContours: { value: 0 },
      uContourStep: { value: opts.contourStep ?? 0.02 },
      uFill: { value: 1 },
      uUvScale: { value: opts.uvScale ?? 1 },
      uLineW: { value: 0.006 },
      uSketchPaper: { value: new THREE.Vector3(0.955, 0.935, 0.885) },
      uSketchLine: { value: new THREE.Vector3(0.4, 0.4, 0.4) },
      uFade: { value: 1 },
    },
    vertexShader: DRAW_VS,
    fragmentShader: DRAW_FS,
    transparent: !!opts.transparent,
    side: opts.side ?? THREE.FrontSide,
  });
}
