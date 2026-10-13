// Shaders. The table top (sheet and wood) is one function, groundColor(),
// shared by the table's own material and by the cylinder, which ray-traces
// itself: for each pixel it intersects the eye ray with the exact cylinder,
// reflects it, and looks up what the reflected ray meets on the table or in
// the room. So the mirror shows precisely what lies around it.

import * as THREE from 'three';

export function createUniforms() {
  return {
    uLitho: { value: 1 },
    uPaper: { value: new THREE.Vector3(0.93, 0.905, 0.845) },
    uInk: { value: new THREE.Vector3(0.1, 0.09, 0.085) },
    uLight: { value: new THREE.Vector3(-0.42, 0.82, 0.4).normalize() },
    uCyl: { value: new THREE.Vector4(0, 0, 0, 1) }, // x, base y, z, opacity
    uDim: { value: new THREE.Vector2(1, 3.2) }, // radius, height
    uSheet: { value: null },
    uSheetRect: { value: new THREE.Vector4() },
    uHatchPx: { value: 7 },
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
`;

// Lithograph conversion, as on the other pages: tone, grain and hatching
// whose period follows the screen (snapped to powers of two).
const LITHO = /* glsl */ `
float hatchSet(float a, float c) {
  float d = abs(fract(a) - 0.5) * 2.0;
  float aa = fwidth(a) * 1.5 + 0.02;
  return smoothstep(1.0 - c - aa, 1.0 - c + aa, d) * smoothstep(0.0, 0.08, c);
}
vec3 litho(vec3 col, vec2 huv, float hfw) {
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  vec3 colour = col + (g * 0.03 + gw * 0.025);
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float want = max(hfw * uHatchPx, 1e-5);
  float lv = log2(want / 0.01);
  float l0 = floor(lv), fr = lv - l0;
  float hpA = 0.01 * exp2(l0), hpB = hpA * 2.0;
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85);
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85);
  float h1 = mix(hatchSet((huv.x + huv.y) / hpA, c1), hatchSet((huv.x + huv.y) / hpB, c1), fr);
  float h2 = mix(hatchSet((huv.x - huv.y) / hpA, c2), hatchSet((huv.x - huv.y) / hpB, c2), fr);
  float v = 0.16 + 0.86 * t - h1 * 0.34 - h2 * 0.3 + g * 0.1 + gw * 0.06;
  return mix(colour, mix(uInk, uPaper, clamp(v, 0.0, 1.0)), uLitho);
}
`;

const SCENE = /* glsl */ `
uniform float uLitho;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uLight;
uniform vec4 uCyl;
uniform vec2 uDim;
uniform sampler2D uSheet;
uniform vec4 uSheetRect;
uniform float uHatchPx;
${NOISE}
${LITHO}

// soft shadow of the cylinder on the table (directional light)
float cylShadow(vec3 p) {
  vec2 L = uLight.xz / uLight.y;
  vec2 c = uCyl.xz;
  // the sun ray from p is above p + L*h at height h; the cylinder fills h in [base, base + H]
  float h = clamp(dot(c - p.xz, L) / dot(L, L), uCyl.y, uCyl.y + uDim.y);
  float d = length(p.xz + L * h - c);
  float pen = 0.04 + 0.05 * h;
  return (1.0 - smoothstep(uDim.x - pen, uDim.x + pen, d)) * uCyl.w;
}

float lampPool(vec3 p) {
  return 1.0 - 0.42 * smoothstep(5.0, 17.0, length(p.xz - vec2(-0.6, 1.2)));
}

vec3 tableColour(vec3 p, out vec2 huv) {
  // planks along x, 0.9 wide
  float w = 0.9;
  float row = floor(p.z / w);
  float fz = fract(p.z / w) * w;
  float off = hash12(vec2(row, 1.3)) * 7.0;
  float grain = fbm(vec2((p.x + off) * 0.35, p.z * 9.0));
  float knot = smoothstep(0.08, 0.0, length(vec2(fract((p.x + off) / 3.1) - 0.5, fz / w - 0.5) * vec2(3.1, 1.6)) - 0.05);
  vec3 c = mix(vec3(0.6, 0.47, 0.33), vec3(0.73, 0.6, 0.44), grain);
  c *= 0.9 + 0.18 * hash12(vec2(row, 7.0));
  c *= 1.0 - 0.35 * knot;
  float seam = smoothstep(0.012, 0.0, min(fz, w - fz));
  c *= 1.0 - 0.55 * seam;
  huv = p.xz * 1.3;
  return c;
}

// colour of the table top at p (y = 0), lit, shadowed, in display space
vec3 groundColour(vec3 p, float hfw) {
  vec2 q = (p.xz - uSheetRect.xy) / (uSheetRect.zw - uSheetRect.xy);
  float lightK = (0.5 + 0.55 * uLight.y) * lampPool(p);
  float sh = cylShadow(p);
  // contact darkening round the foot of the cylinder
  float r = length(p.xz - uCyl.xz);
  float ao = 1.0 - 0.35 * exp(-max(r - uDim.x, 0.0) * 9.0) * step(uCyl.y, 0.01) * uCyl.w;
  vec3 col;
  if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
    vec4 s = texture2D(uSheet, vec2(q.x, 1.0 - q.y));
    float ink = s.a;
    vec3 wash = s.rgb;
    float grain = 0.965 + 0.05 * vnoise(p.xz * 37.0) + 0.02 * fbm(p.xz * 3.0);
    vec3 paper = uPaper * grain;
    vec3 colourV = mix(paper * mix(vec3(1.0), wash, 0.9), vec3(0.16, 0.12, 0.1), ink * 0.92);
    float lum = dot(wash, vec3(0.3, 0.59, 0.11));
    vec3 lithoV = mix(paper * mix(1.0, lum, 0.22), uInk, ink * 0.92);
    col = mix(colourV, lithoV, uLitho);
    // the sheet's edge casts a hairline shadow and catches a little light
    vec2 e = min(q, 1.0 - q) * (uSheetRect.zw - uSheetRect.xy);
    col *= 1.0 - 0.06 * smoothstep(0.05, 0.0, min(e.x, e.y));
    col *= lightK * (1.0 - 0.42 * sh) * ao;
  } else {
    vec2 huv;
    vec3 c = tableColour(p, huv);
    // the paper's shadow on the wood, just outside its edge (offset away from the light)
    vec2 d = max(uSheetRect.xy - p.xz, p.xz - uSheetRect.zw);
    float outside = max(d.x, d.y);
    float paperSh = smoothstep(0.12, 0.0, outside) * 0.35;
    c *= lightK * (1.0 - 0.5 * sh) * ao * (1.0 - paperSh);
    col = litho(c, huv, hfw * 1.3);
  }
  return col;
}

vec3 envColour(vec3 d) {
  // a dim room: darker low down, a bright window over the left shoulder
  vec3 wall = mix(vec3(0.45, 0.42, 0.38), vec3(0.95, 0.93, 0.88), smoothstep(-0.1, 0.6, d.y));
  float w = smoothstep(0.86, 0.93, dot(d, uLight));
  vec3 c = mix(wall, vec3(1.05), w);
  vec3 lt = mix(uInk, uPaper, smoothstep(0.15, 0.95, dot(c, vec3(0.3, 0.59, 0.11))));
  return mix(c, lt, uLitho);
}
`;

const WORLD_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export function makeTableMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: WORLD_VS,
    fragmentShader: /* glsl */ `
${SCENE}
varying vec3 vW;
void main() {
  vec3 p = vec3(vW.x, 0.0, vW.z);
  float fw = max(fwidth(p.x), fwidth(p.z));
  vec3 c = groundColour(p, fw);
  // fade the far table into the room
  float far = smoothstep(10.0, 24.0, length(p.xz));
  c = mix(c, envColour(normalize(vec3(p.x, 0.02, p.z))), far);
  gl_FragColor = vec4(c, 1.0);
}
`,
  });
}

export function makeRoomMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: WORLD_VS,
    fragmentShader: /* glsl */ `
${SCENE}
varying vec3 vW;
void main() {
  gl_FragColor = vec4(envColour(normalize(vW - cameraPosition)), 1.0);
}
`,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// The cylinder, ray-traced inside a slightly larger proxy mesh.
export function makeCylinderMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: WORLD_VS,
    transparent: true,
    fragmentShader: /* glsl */ `
${SCENE}
varying vec3 vW;
void main() {
  vec3 ro = cameraPosition - vec3(uCyl.x, uCyl.y, uCyl.z);
  vec3 rd = normalize(vW - cameraPosition);
  float R = uDim.x, Hc = uDim.y;
  float tHit = 1e9;
  vec3 n = vec3(0.0);
  float side = 0.0;
  float a = dot(rd.xz, rd.xz);
  float b = 2.0 * dot(ro.xz, rd.xz);
  float c = dot(ro.xz, ro.xz) - R * R;
  float disc = b * b - 4.0 * a * c;
  // distance of the ray from the axis, for the silhouette line
  float dAxis = abs(ro.x * rd.z - ro.z * rd.x) / sqrt(max(a, 1e-8));
  if (disc > 0.0) {
    float t = (-b - sqrt(disc)) / (2.0 * a);
    float y = ro.y + t * rd.y;
    if (t > 0.0 && y >= 0.0 && y <= Hc) { tHit = t; vec3 p = ro + t * rd; n = vec3(p.x, 0.0, p.z) / R; side = 1.0; }
  }
  if (rd.y < 0.0) {
    float t = (Hc - ro.y) / rd.y;
    vec3 p = ro + t * rd;
    if (t > 0.0 && t < tHit && dot(p.xz, p.xz) <= R * R) { tHit = t; n = vec3(0.0, 1.0, 0.0); side = 0.0; }
  }
  if (tHit > 1e8) discard;
  vec3 pl = ro + tHit * rd;
  vec3 P = pl + vec3(uCyl.x, uCyl.y, uCyl.z);
  vec3 r = reflect(rd, n);
  vec3 col;
  if (r.y < -1e-4) {
    vec3 G = P + r * (-P.y / r.y);
    float fw = max(fwidth(G.x), fwidth(G.z));
    col = groundColour(G, min(fw, 0.5));
    float far = smoothstep(10.0, 24.0, length(G.xz));
    col = mix(col, envColour(normalize(vec3(G.x, 0.02, G.z))), far);
  } else {
    col = envColour(r);
  }
  // polished steel: a faint cool tint, a little darker at normal incidence
  float cosi = abs(dot(rd, n));
  vec3 tint = mix(vec3(0.84, 0.86, 0.9), vec3(0.88), uLitho);
  col *= tint * (0.92 + 0.08 * pow(1.0 - cosi, 2.0));
  // the top face catches the room's light
  if (side < 0.5) col = mix(col, uPaper * 1.02, 0.35);
  col += pow(max(dot(r, uLight), 0.0), 140.0) * 0.5;
  // ink: silhouette, top rim and foot
  float e1 = (R - dAxis) / max(fwidth(dAxis), 1e-5);
  float e2 = side > 0.5 ? (Hc - pl.y) / max(fwidth(pl.y), 1e-5) : (R - length(pl.xz)) / max(fwidth(length(pl.xz)), 1e-5);
  float e3 = side > 0.5 ? pl.y / max(fwidth(pl.y), 1e-5) : 1e3;
  float e = min(side > 0.5 ? e1 : 1e3, min(e2, e3));
  float inkL = 1.0 - smoothstep(0.6, 1.6, e);
  col = mix(col, uInk, inkL * 0.9);
  gl_FragColor = vec4(col, uCyl.w);
}
`,
  });
}

// ---------------------------------------------------------------- building the sheet texture
// Pass A copies the sheet-only drawing; pass B lays the picture over it through
// the mirror map: a fine mesh whose vertices sit where the reflected eye rays
// meet the paper and whose texture coordinates are the picture coordinates.
export function makeCopyMaterial(ink, wash) {
  return new THREE.ShaderMaterial({
    uniforms: { tInk: { value: ink }, tWash: { value: wash } },
    vertexShader: /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,
    fragmentShader: /* glsl */ `
uniform sampler2D tInk, tWash;
varying vec2 vUv;
void main() {
  float ink = 1.0 - dot(texture2D(tInk, vUv).rgb, vec3(0.333));
  gl_FragColor = vec4(texture2D(tWash, vUv).rgb, ink);
}
`,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
}

export function makeMapMaterial(ink, wash) {
  return new THREE.ShaderMaterial({
    uniforms: { tInk: { value: ink }, tWash: { value: wash } },
    vertexShader: /* glsl */ `
attribute vec2 pic;
varying vec2 vPic;
void main() { vPic = pic; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,
    fragmentShader: /* glsl */ `
uniform sampler2D tInk, tWash;
varying vec2 vPic;
void main() {
  vec4 w = texture2D(tWash, vPic);
  if (w.a < 0.5) discard; // outside the drawn window: keep the sheet's own drawing
  float ink = 1.0 - dot(texture2D(tInk, vPic).rgb, vec3(0.333));
  gl_FragColor = vec4(w.rgb, ink);
}
`,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    side: THREE.DoubleSide,
  });
}
