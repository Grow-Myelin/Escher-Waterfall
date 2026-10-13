// Shaders for the pavement-art page.
//
// The ink shader is the Waterfall's (src/materials.js), copied here so it can
// be extended: the hidden 3D scene (the cistern) is lit by the same sun, but
// the rim of the hole casts a shadow into it and it darkens with depth.
//
// Every colour is computed in display space. uLitho blends between muted
// colour and the black-and-white lithograph look.

import * as THREE from 'three';

export function createSharedUniforms() {
  return {
    uTime: { value: 0 },
    uLitho: { value: 1 },
    uLight: { value: new THREE.Vector3(0.28, 0.9, 0.62).normalize() },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
    uFade: { value: 1 },
    uHatchPx: { value: 7 },
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

// Converts a colour to the lithograph look and blends by uLitho. The hatching
// period follows the screen: about uHatchPx pixels, snapped to powers of two
// of a base period (and cross-faded between them) so the lines stay fixed to
// the surface as the camera moves.
export const LITHO = /* glsl */ `
uniform float uHatchPx;
// a set of parallel lines covering a fraction c of their period
float hatchSet(float a, float c) {
  float d = abs(fract(a) - 0.5) * 2.0;
  float aa = fwidth(a) * 1.5 + 0.02;
  return smoothstep(1.0 - c - aa, 1.0 - c + aa, d) * smoothstep(0.0, 0.08, c);
}
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
  float want = max(hfw * uHatchPx, 1e-5);
  float lv = log2(want / 0.01);
  float l0 = floor(lv), fr = lv - l0;
  float hpA = 0.01 * exp2(l0), hpB = hpA * 2.0;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  vec2 q = huv;
  float h1 = mix(hatchSet((q.x + q.y) / hpA, c1), hatchSet((q.x + q.y) / hpB, c1), fr);
  float h2 = mix(hatchSet((q.x - q.y) / hpA + face * 0.37, c2), hatchSet((q.x - q.y) / hpB + face * 0.37, c2), fr);
  float v = 0.16 + 0.86 * t;
  v -= h1 * 0.34 + h2 * 0.3;
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
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

// Patterns (amat.x): 0 plain, 1 brick, 2 ashlar, 3 roof tile, 4 wood,
// 5 plaster, 7 cobble, 8 cloth, 10 rough stone, 11 window pane, 12 soil.
const INK_FS = /* glsl */ `
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uDim;
#ifdef VIRTUAL
uniform vec2 uHole[NHOLE];
uniform float uWater;
uniform vec4 uHall;
#endif
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${NOISE}
${LITHO}

#ifdef VIRTUAL
bool inHole(vec2 p) {
  bool c = false;
  for (int i = 0, j = NHOLE - 1; i < NHOLE; j = i++) {
    vec2 a = uHole[i], b = uHole[j];
    if (((a.y > p.y) != (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)) c = !c;
  }
  return c;
}
#endif

void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  vec3 W = vW;
#ifdef VIRTUAL
  // the mirrored world below the water is lit as its original above it
  if (W.y < uWater) { W.y = 2.0 * uWater - W.y; n.y = -n.y; diff = max(dot(n, uLight), 0.0); }
  // sunlight reaches below the pavement only through the hole
  if (W.y < -0.02) {
    vec3 hit = W + uLight * (-W.y / uLight.y);
    if (!inHole(hit.xz)) diff *= 0.0;
  }
#endif
  float shade = 0.5 + 0.55 * diff;
#ifdef VIRTUAL
  // light bounced off the sunlit walls and water fills the shadows in the shaft
  shade = 0.5 + 0.55 * diff;
#endif
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {
    float rh = 0.24, bl = 0.52;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.84 + 0.28 * h, l);
    lines = lineMask(d, 0.016) * l * 0.8;
  } else if (pat == 2.0) {
    float rh = 0.42, bl = 0.95;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.86 + 0.2 * h, l) * (0.95 + 0.1 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.016) * l * 0.7;
  } else if (pat == 3.0) {
    float rh = 0.3, bw = 0.36;
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
    lines = max(lineMask(dl, 0.015), (1.0 - dv) * 0.6) * l;
  } else if (pat == 4.0) {
    float ph = 0.16;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 2.5, uv.y * 40.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.01) * l * 0.7;
  } else if (pat == 5.0) {
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 7.0) {
    vec2 g = uv / 0.2;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(0.2, fw);
    tex = mix(1.0, 0.86 + 0.24 * hash12(cell), l);
    lines = smoothstep(0.38, 0.49, r) * l * 0.7;
  } else if (pat == 8.0) {
    tex = 0.97 + 0.04 * sin(uv.x * 40.0);
  } else if (pat == 10.0) {
    float rh = 0.26, bl = 0.48;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.8 + 0.3 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.02) * l * 0.75;
  } else if (pat == 11.0) {
    tex = 0.75 + 0.35 * smoothstep(0.2, 0.9, fract((uv.x + uv.y) * 0.8));
  } else if (pat == 12.0) {
    tex = 0.78 + 0.3 * fbm(uv * 6.0) + 0.12 * (hash12(floor(uv * 30.0)) - 0.5);
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);
  float haze = vM.y;
#ifdef VIRTUAL
  // deeper is darker; the vaulted hall beyond the far wall fades to black
  float depth = clamp(-W.y / 3.6, 0.0, 1.0);
  col *= mix(1.0, 0.76, depth);
  float hall = max(0.0, dot(W, uHall.xyz) - uHall.w);
  col *= exp(-hall * 1.1);
#endif
  col *= uDim;

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - haze * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, haze, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;

export function makeInkMaterial(uniforms, opts = {}) {
  const u = { ...uniforms, uDim: { value: opts.dim ?? 1 } };
  const defines = {};
  if (opts.virtual) {
    defines.VIRTUAL = 1;
    defines.NHOLE = opts.hole.length;
    u.uHole = { value: opts.hole.map((p) => new THREE.Vector2(p[0], p[1])) };
    u.uWater = { value: opts.water };
    u.uHall = { value: new THREE.Vector4(...opts.hall.n, opts.hall.d) };
  }
  return new THREE.ShaderMaterial({
    uniforms: u,
    defines,
    vertexShader: INK_VS,
    fragmentShader: INK_FS,
    transparent: !!opts.transparent,
    depthWrite: opts.depthWrite ?? true,
    side: opts.side ?? THREE.FrontSide,
  });
}

// ------------------------------------------------------------------ water (hidden scene)
// Dark water at the bottom of the shaft. It is drawn over a mirrored copy of
// everything above it, so its own alpha sets how strong the reflection is.
const WATER_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const WATER_FS = /* glsl */ `
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec2 uRings[4];
uniform vec4 uHall;
varying vec3 vW;
${NOISE}
${LITHO}
void main() {
  vec2 p = vW.xz;
  // rings spreading from the column and the drowned steps
  float ring = 0.0;
  for (int i = 0; i < 4; i++) {
    float r = length(p - uRings[i]);
    float w = sin(r * 9.0 - fbm(p * 1.3) * 3.0) * 0.5 + 0.5;
    ring += smoothstep(0.82, 0.98, w) * exp(-r * 0.75);
  }
  float n = fbm(vec2(p.x * 1.4, p.y * 0.55));
  float streak = smoothstep(0.55, 0.75, fbm(vec2(p.x * 0.8 + n, p.y * 3.0)));
  vec3 deep = vec3(0.13, 0.21, 0.23);
  vec3 col = deep * (0.8 + 0.4 * n);
  col = mix(col, vec3(0.62, 0.72, 0.72), clamp(ring * 0.55 + streak * 0.12, 0.0, 0.8));
  float hall = max(0.0, dot(vW, uHall.xyz) - uHall.w);
  col *= exp(-hall * 1.1);
  vec3 outc = finish(col, 0.0, 0.0, p * 1.5, fwidth(p.x * 1.5), 0.0);
  gl_FragColor = vec4(outc, 0.62 + 0.25 * ring);
}
`;

export function makeCisternWater(uniforms, rings, hall) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      uRings: { value: rings.map((r) => new THREE.Vector2(r[0], r[1])) },
      uHall: { value: new THREE.Vector4(...hall.n, hall.d) },
    },
    vertexShader: WATER_VS,
    fragmentShader: WATER_FS,
    transparent: true,
    depthWrite: false,
  });
}

// ------------------------------------------------------------------ pavement mask
// In the eye's render the real pavement must stay clear (alpha 0): only what
// lies below or above it is drawn. The one exception is the shadow the column
// would cast on the pavement, which the artist draws as a soft dark wash.
const MASK_FS = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uCol;      // column: x, z, radius
uniform float uColTop;
uniform float uLitho;
uniform vec3 uInk;
varying vec3 vW;
void main() {
  vec2 p = vW.xz;
  // follow the sun ray up from p: at height h it is above p + L*h.
  // Shadow if that segment (h in 0..top) passes within the column's radius.
  vec2 L = uLight.xz / uLight.y;
  vec2 c = uCol.xy;
  float h = clamp(dot(c - p, L) / max(dot(L, L), 1e-6), 0.0, uColTop);
  float dist = length(p + L * h - c);
  float sh = 1.0 - smoothstep(uCol.z - 0.03, uCol.z + 0.05, dist);
  vec3 tone = mix(vec3(0.18, 0.2, 0.24), uInk, uLitho);
  gl_FragColor = vec4(tone, sh * 0.42);
}
`;

export function makeMaskMaterial(uniforms, column) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLight: uniforms.uLight,
      uLitho: uniforms.uLitho,
      uInk: uniforms.uInk,
      uCol: { value: new THREE.Vector3(column.x, column.z, column.r) },
      uColTop: { value: column.top },
    },
    vertexShader: WATER_VS,
    fragmentShader: MASK_FS,
    blending: THREE.NoBlending,
  });
}

// ------------------------------------------------------------------ the plaza floor
// Flagstones in running bond, and the chalk drawing: the eye's render is
// projected back onto the pavement from the eye point (projective texturing).
// Because every pavement point and the hidden 3D point behind it lie on one
// ray from the eye, this is exactly the central projection of the scene onto
// the ground plane.
const GROUND_VS = WATER_VS;
const GROUND_FS = /* glsl */ `
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform sampler2D uDrawing;
uniform sampler2D uDrawingC;
uniform mat4 uEyeVP;
uniform float uShow;
uniform float uChalk;
varying vec3 vW;
${NOISE}
${LITHO}

// flagstones: rows along x, 0.6 m deep, 0.8 or 1.05 m long
vec4 flags(vec2 p, out float joint) {
  float rowH = 0.6;
  float row = floor(p.y / rowH);
  float off = hash12(vec2(row, 3.7)) * 2.0;
  float len = 0.8 + 0.25 * step(0.5, hash12(vec2(row, 9.1)));
  float x = (p.x + off) / len;
  float cell = floor(x);
  float fx = fract(x) * len;
  float fy = fract(p.y / rowH) * rowH;
  float d = min(min(fx, len - fx), min(fy, rowH - fy));
  joint = d;
  float h = hash12(vec2(cell, row));
  return vec4(h, cell, row, d);
}

void main() {
  vec2 p = vW.xz;
  float fw = max(fwidth(p.x), fwidth(p.y));
  float jd;
  vec4 f = flags(p, jd);
  float l = lod(0.6, fw);
  float jl = lineMask(jd, 0.005) * l;
  vec3 stone = mix(vec3(0.74, 0.71, 0.66), vec3(0.84, 0.81, 0.75), f.x);
  stone *= 0.93 + 0.12 * fbm(p * 1.7 + f.yz * 3.1);
  stone *= 0.97 + 0.06 * vnoise(p * 23.0) * lod(0.04, fw);
  float diff = max(uLight.y, 0.0);
  vec3 col = stone * (0.36 + 0.66 * diff);
  col *= 1.0 - 0.38 * jl;
  vec3 pave = finish(col, 0.0, 0.0, p * 1.6, fw * 1.6, 0.0);

  // ---- the chalk drawing
  vec4 c = uEyeVP * vec4(vW, 1.0);
  vec3 outc = pave;
  if (c.w > 0.0) {
    vec2 uv = c.xy / c.w * 0.5 + 0.5;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
      vec4 d = mix(texture2D(uDrawingC, uv), texture2D(uDrawing, uv), uLitho);
      float a = d.a * uShow;
      // chalk lies on the stone: a little grain, and the joints show through
      float grain = hash12(floor(p * 220.0)) * lod(1.0 / 220.0, fw);
      float tooth = 0.9 + 0.1 * vnoise(p * 60.0) * lod(1.0 / 60.0, fw);
      vec3 chalk = d.rgb * tooth + (grain - 0.5) * 0.05;
      chalk = mix(chalk, chalk * 0.72, jl * uChalk);
      outc = mix(pave, chalk, clamp(a, 0.0, 1.0));
    }
  }
  gl_FragColor = vec4(outc, 1.0);
}
`;

export function makeGroundMaterial(uniforms, drawing, drawingColour) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      uDrawing: { value: drawing },
      uDrawingC: { value: drawingColour },
      uEyeVP: { value: new THREE.Matrix4() },
      uShow: { value: 1 },
      uChalk: { value: 0.55 },
    },
    vertexShader: GROUND_VS,
    fragmentShader: GROUND_FS,
  });
}
