// The straight Droste picture, drawn procedurally in a fragment shader.
//
// The shader is run once over a log-polar texture: texel (u, v) holds the
// picture at q = exp(ln R·(u − 1) + 2πi·(v − ½)), i.e. on the annulus
// 1/R ≤ |q| < 1. Because the picture repeats when scaled by R, that texture
// tiles seamlessly in both directions, and the display shader can read the
// picture at any scale and angle from it.
//
// Each texel stores the colour rendering in RGB and the lithograph value
// (0 = ink, 1 = paper) in A.
//
// All three nested worlds are drawn in their own coordinates with analytic
// pixel footprints (no screen-space derivatives), so lines and hatching stay
// clean right up to the seams between levels.

import { glslDefines, TOWN, ZG } from './geometry.js';

// Houses on the right side of the quay: [z0, z1, x0, eave], [ridge, colour, style, seed]
function houses() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out = [];
  let z = 13;
  while (z < ZG - 9 && out.length < 18) {
    const w = 7 + rnd() * 4.5;
    const x0 = TOWN.housesX + (rnd() < 0.3 ? 0.7 : 0) + (rnd() < 0.2 ? -0.4 : 0);
    const n = rnd() < 0.45 ? 3 : rnd() < 0.6 ? 4 : 2;
    const eave = TOWN.quay + 3.6 + (n - 1) * 3.0;
    const gable = rnd() < 0.8;
    const ridge = eave + (gable ? 2.6 + rnd() * 1.8 : 0.0);
    out.push([z, Math.min(z + w, ZG - 1.5), x0, eave, ridge, Math.floor(rnd() * 5), gable ? 1 : 0, rnd()]);
    z += w + (rnd() < 0.25 ? 0.6 : 0);
  }
  return out;
}

const HOUSES = houses();
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : v.toFixed(5));
const houseArray = `
#define NH ${HOUSES.length}
const vec4 HA[NH] = vec4[NH](${HOUSES.map((h) => `vec4(${f(h[0])}, ${f(h[1])}, ${f(h[2])}, ${f(h[3])})`).join(', ')});
const vec4 HB[NH] = vec4[NH](${HOUSES.map((h) => `vec4(${f(h[4])}, ${f(h[5])}, ${f(h[6])}, ${f(h[7])})`).join(', ')});
`;

export const SCENE_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const SCENE_FS = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uTexSize;
${glslDefines()}
${houseArray}
#define PI 3.141592653589793

// ------------------------------------------------------------------ noise
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

// ------------------------------------------------------------------ drawing
// Line of half-width w round d = 0, for a pixel of size aa. Lines thinner than
// a pixel get fainter rather than vanishing.
float lraw(float d, float w, float aa) {
  float ww = max(w, 0.5 * aa);
  return clamp((ww - abs(d)) / aa + 0.5, 0.0, 1.0) * min(1.0, 2.0 * w / aa);
}
// Inked line: never wider than LW texels, so the line weight stays even at
// every scale of the picture (the texture is scale-invariant).
#define LW 2.2
float l1(float d, float w, float aa) { return lraw(d, min(w, LW * aa), aa); }
// Fill for a signed distance d (positive inside).
float f1(float d, float aa) { return clamp(d / aa + 0.5, 0.0, 1.0); }

// Axis-aligned box: fill and outline, with separate pixel sizes per axis.
float boxFill(vec2 p, vec2 c, vec2 h, vec2 aa) {
  vec2 d = h - abs(p - c);
  return f1(d.x, aa.x) * f1(d.y, aa.y);
}
float boxLine(vec2 p, vec2 c, vec2 h, float w, vec2 aa) {
  vec2 a = abs(p - c);
  float vx = l1(a.x - h.x, w, aa.x) * f1(h.y + w - a.y, aa.y);
  float hy = l1(a.y - h.y, w, aa.y) * f1(h.x + w - a.x, aa.x);
  return max(vx, hy);
}
float sdBox(vec2 p, vec2 c, vec2 h) { vec2 d = abs(p - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float sdEllipse(vec2 p, vec2 c, vec2 r) {
  // cheap approximation, good for small eccentricity
  vec2 d = (p - c) / r;
  float k = length(d);
  return (k - 1.0) * min(r.x, r.y);
}
float sdTri(vec2 p, vec2 a, vec2 b, vec2 c) {
  vec2 e0 = b - a, e1 = c - b, e2 = a - c;
  vec2 v0 = p - a, v1 = p - b, v2 = p - c;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}

// Parallel hatching lines along coordinate s: spacing sp, half-width frac w.
float hlines(float s, float sp, float w, float aas) {
  float d = abs(fract(s / sp + 0.5) - 0.5) * sp; // lines at multiples of sp, so octaves nest
  float lc = lraw(d, w * sp, aas);
  float lod = smoothstep(1.6, 3.6, sp / max(aas, 1e-12));
  return mix(2.0 * w, lc, lod);
}
// Hatching whose spacing is a fixed number of texels. The texture is
// log-polar, so this is a fixed fraction of the distance from the centre of
// the repetition: the hatching looks the same at every scale. Spacings are
// powers of two, cross-faded, so the lines stay straight.
#define HK (10.0 * uTexSize.y / 4096.0)
float hfam(float s, float aas, float w, float k) {
  float e = log2(HK * k * max(aas, 1e-12));
  float fl = floor(e);
  float sp = exp2(fl);
  return mix(hlines(s, sp, w, aas), hlines(s, 2.0 * sp, w, aas), e - fl);
}

// A paint sample: colour, lithograph tone, hatching frame and ink.
// k scales the hatching density, ang sets its direction.
struct Paint { vec3 col; float t; vec2 st; vec2 aa; float k; float ang; float ink; };

Paint paint(vec3 col, float t, vec2 st, vec2 aa, float k, float ang) {
  Paint p; p.col = col; p.t = t; p.st = st; p.aa = aa; p.k = k; p.ang = ang; p.ink = 0.0;
  return p;
}

float etch(float t, vec2 st, vec2 aa, float k, float ang) {
  float dk = clamp(1.0 - t, 0.0, 1.0);
  vec2 d1 = vec2(cos(ang), sin(ang));
  vec2 d2 = vec2(cos(ang + 1.25), sin(ang + 1.25));
  float w1 = clamp(dk * 0.6 - 0.06, 0.0, 0.42);
  float w2 = clamp(dk * 0.7 - 0.33, 0.0, 0.42);
  float h1 = w1 > 0.0 ? hfam(dot(st, d1), length(d1 * aa), w1, k) : 0.0;
  float h2 = w2 > 0.0 ? hfam(dot(st, d2), length(d2 * aa), w2, k * 0.93) : 0.0;
  return 1.0 - (1.0 - h1) * (1.0 - h2);
}

vec4 finish(Paint p) {
  float h = etch(p.t, p.st, p.aa, p.k, p.ang);
  float ink = clamp(p.ink, 0.0, 1.0);
  vec3 c = p.col * (1.0 - 0.1 * h) * (1.0 - 0.72 * ink);
  float v = mix(1.0, p.t, 0.5) * (1.0 - 0.7 * h) * (1.0 - 0.9 * ink);
  return vec4(c, v);
}

// ================================================================= the town
// Camera at the origin looking along +Z; a point at depth Z on the ray of
// print coordinate u is Z·(du, 1) with du = (u − TC)/TG. pxu is the pixel
// size in print coordinates.
const vec3 SUN = vec3(-0.70, 0.60, -0.45) / 1.0283;
float lightN(vec3 n) { return 0.42 + 0.6 * max(dot(n, SUN), 0.0); }

const vec3 C_SKY = vec3(0.80, 0.85, 0.86);
const vec3 C_SEA = vec3(0.38, 0.52, 0.56);
const vec3 C_QUAY = vec3(0.76, 0.72, 0.64);
const vec3 C_ROOF = vec3(0.66, 0.38, 0.28);
const vec3 C_SHUT = vec3(0.33, 0.47, 0.42);
const vec3 C_DARK = vec3(0.17, 0.16, 0.15);

vec3 houseColour(float i) {
  if (i < 0.5) return vec3(0.87, 0.78, 0.60);
  if (i < 1.5) return vec3(0.89, 0.85, 0.77);
  if (i < 2.5) return vec3(0.82, 0.62, 0.52);
  if (i < 3.5) return vec3(0.78, 0.75, 0.63);
  return vec3(0.72, 0.75, 0.70);
}
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }

// pixel sizes on planes: depth coordinate and the other coordinate
// (slope = the component of du that gives depth, other = the remaining one)
vec2 planeAA(float Z, float pxu, float slope, float other) {
  float az = Z * pxu / (TG * max(abs(slope), 1e-6));
  return vec2(az, Z * pxu / TG + abs(other) * az);
}

// --- birds (gulls) in the sky, drawn in angle space
float gulls(vec2 du, float pxa) {
  float ink = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 c = vec2(-0.28 + 0.11 * fi + 0.03 * sin(fi * 3.1), 0.06 + 0.05 * fract(fi * 0.618) + 0.02 * sin(fi * 1.7));
    float s = 0.004 + 0.006 * fract(fi * 0.37);
    vec2 p = (du - c) / s;
    // two shallow arcs
    float d = min(sdSeg(p, vec2(-1.0, 0.25), vec2(-0.45, 0.45)), sdSeg(p, vec2(-0.45, 0.45), vec2(0.0, 0.0)));
    d = min(d, min(sdSeg(p, vec2(0.0, 0.0), vec2(0.45, 0.45)), sdSeg(p, vec2(0.45, 0.45), vec2(1.0, 0.2))));
    ink = max(ink, l1(d * s, 0.09 * s, pxa));
  }
  return ink;
}

// --- a sailing boat / a moored boat, in billboard coordinates (metres,
// origin at the waterline centre). Returns coverage; sets ink and tone.
float boat(vec2 p, float kind, float aa, out float ink, out float tone, out vec3 col) {
  ink = 0.0; tone = 0.5; col = vec3(0.3);
  // hull: a band with a curved bottom
  float L = kind < 0.5 ? 3.6 : 3.0;
  float hb = -0.45 + 0.35 * (p.x / L) * (p.x / L);
  float top = 0.85 + 0.25 * (p.x / L) * (p.x / L);
  float hull = min(min(p.y - hb, top - p.y), L - abs(p.x) - 0.25 * max(p.y, 0.0));
  float cov = f1(hull, aa);
  ink = max(ink, l1(hull, 0.06, aa));
  ink = max(ink, l1(p.y - (top - 0.3), 0.04, aa) * f1(hull, aa));
  col = vec3(0.30, 0.34, 0.36); tone = 0.38;
  if (kind < 0.5) {
    // sailing boat: mast, mainsail and jib
    float mast = l1(p.x + 0.4, 0.07, aa) * f1(9.5 - p.y, aa) * f1(p.y - 0.8, aa);
    float main = sdTri(p, vec2(-0.25, 1.4), vec2(-0.25, 9.2), vec2(3.0, 1.6));
    float jib = sdTri(p, vec2(-0.55, 1.4), vec2(-0.55, 8.4), vec2(-3.4, 1.3));
    float sail = min(main, jib);
    float sc = f1(-sail, aa);
    cov = max(cov, sc);
    ink = max(ink, l1(sail, 0.05, aa));
    // seams on the sails
    float seams = l1(abs(fract((p.y - p.x * 0.15) / 1.3) - 0.5) * 1.3 - 0.0, 0.03, aa) * sc * 0.6;
    if (sc > 0.5 && hull < 0.0) { col = vec3(0.93, 0.9, 0.82); tone = 0.9; }
    if (sc > 0.0 && hull < 0.0) { col = mix(col, vec3(0.93, 0.9, 0.82), sc); tone = mix(tone, 0.9, sc); }
    ink = max(ink, seams);
    ink = max(ink, mast);
    cov = max(cov, mast);
  } else {
    // moored fishing boat: cabin and a short mast
    float cab = sdTri(p, vec2(-1.4, 0.8), vec2(0.6, 0.8), vec2(-1.2, 2.1));
    float cabin = max(max(-1.5 - p.x, p.x - 0.4), max(0.8 - p.y, p.y - 2.0));
    float cc = f1(-cabin, aa);
    cov = max(cov, cc);
    ink = max(ink, l1(cabin, 0.05, aa));
    float win = boxFill(p, vec2(-0.9, 1.5), vec2(0.25, 0.22), vec2(aa));
    ink = max(ink, win * 0.9);
    float mast = l1(p.x - 1.2, 0.06, aa) * f1(5.0 - p.y, aa) * f1(p.y - 0.8, aa);
    ink = max(ink, mast); cov = max(cov, mast);
    if (cc > 0.5) { col = vec3(0.86, 0.83, 0.74); tone = 0.8; }
  }
  return cov;
}

float boatCov(vec2 p, float kind, float aa) {
  float a, b; vec3 c;
  return boat(p, kind, aa, a, b, c);
}

// --- a small figure on the quay (billboard metres, origin at the feet)
float walker(vec2 p, float aa, out float ink) {
  float body = sdSeg(p, vec2(0.0, 0.5), vec2(0.0, 1.35)) - 0.22;
  float legs = min(sdSeg(p, vec2(-0.08, 0.0), vec2(-0.05, 0.7)), sdSeg(p, vec2(0.12, 0.0), vec2(0.05, 0.7))) - 0.07;
  float head = length(p - vec2(0.0, 1.62)) - 0.13;
  float d = min(min(body, legs), head);
  ink = l1(d, 0.03, aa);
  return f1(-d, aa);
}

// ---- the gallery building, drawn in window units: fq = q / H0, the window
// is the square |fq| < 1. One window unit is WHW metres. Returns colour and
// tone; galleryInk() draws its lines.
vec4 galleryFacade(vec2 p, float aa, float light) {
  vec2 a2 = vec2(aa);
  float qy = (YQ - WYW) / WHW; // the quay
  vec3 stone = vec3(0.86, 0.80, 0.68);
  vec3 col = stone * light;
  float row = floor((p.y - qy) / 0.32);
  float bx = (p.x + 0.33 * mod(row, 2.0)) / 0.66;
  float t = lum(col) * (0.97 + 0.06 * hash12(vec2(floor(bx), row)));
  float pil = boxFill(vec2(abs(p.x), p.y), vec2(2.75, 0.5 * (qy + 5.0)), vec2(0.28, 0.5 * (5.0 - qy)), a2);
  t = mix(t, t * 1.06, pil);
  // ground-floor arcade: dark, with a lit door at the back of the left arch
  float arc = 1e9;
  for (int i = 0; i < 2; i++) {
    float cx = i == 0 ? -1.35 : 1.35;
    vec2 d = p - vec2(cx, -2.95);
    float shaft = max(abs(d.x) - 0.72, max(-d.y - 1.6, d.y));
    float top = length(d) - 0.72;
    arc = min(arc, d.y > 0.0 ? top : shaft);
  }
  float arcFill = f1(-arc, aa);
  float door = boxFill(p, vec2(-1.35, -3.55), vec2(0.28, 0.6), a2);
  t = mix(t, mix(0.16, 0.45, door), arcFill);
  col = mix(col, mix(C_DARK, vec3(0.5, 0.45, 0.38), door), arcFill);
  // string course, cornices and the shadows under them
  t = mix(t, 0.74, boxFill(p, vec2(0.0, -1.9), vec2(3.1, 0.12), a2));
  t = mix(t, 0.78, boxFill(p, vec2(0.0, 2.15), vec2(3.15, 0.16), a2));
  t = mix(t, 0.8, boxFill(p, vec2(0.0, 4.85), vec2(3.2, 0.18), a2));
  t = mix(t, t * 0.6, boxFill(p, vec2(0.0, -2.07), vec2(3.1, 0.05), a2));
  t = mix(t, t * 0.6, boxFill(p, vec2(0.0, 1.95), vec2(3.15, 0.05), a2));
  // pediment oculus
  float ocu = f1(-(length(p - vec2(0.0, 5.55)) - 0.32), aa);
  t = mix(t, 0.22, ocu); col = mix(col, C_DARK, ocu);
  // window surround, keystone, sill, shutters and casement
  vec2 ap = abs(p);
  float m = max(ap.x, ap.y);
  float frame = f1(1.13 - m, aa);
  float sur = f1(1.36 - m, aa);
  t = mix(t, 0.86, sur * (1.0 - frame));
  float key = max(abs(p.x) - 0.12 - (p.y - 1.2) * 0.25, max(p.y - 1.62, 1.2 - p.y));
  t = mix(t, 0.8, f1(-key, aa));
  float sill = boxFill(p, vec2(0.0, -1.47), vec2(1.55, 0.11), a2);
  t = mix(t, t * 0.5, boxFill(p, vec2(0.0, -1.66), vec2(1.5, 0.08), a2) * (1.0 - sill));
  t = mix(t, 0.9, sill);
  float shut = boxFill(vec2(ap.x, p.y), vec2(1.92, 0.0), vec2(0.5, 1.12), a2);
  vec3 shc = C_SHUT * light;
  col = mix(col, shc, shut);
  t = mix(t, lum(shc) * 1.05, shut);
  col = mix(col, vec3(0.93, 0.92, 0.88) * light, frame);
  t = mix(t, 0.92, frame);
  // small upper windows
  for (int i = 0; i < 3; i++) {
    float uw = boxFill(p, vec2(-1.55 + 1.55 * float(i), 3.4), vec2(0.3, 0.5), a2);
    t = mix(t, 0.2, uw); col = mix(col, C_DARK, uw);
  }
  return vec4(col, clamp(t, 0.0, 1.0));
}

// The gallery building returns colour and tone; ink is recomputed here so the
// facade can be finished like any other surface.
float galleryInk(vec2 p, float aa) {
  vec2 a2 = vec2(aa);
  vec2 ap = abs(p);
  float qy = (YQ - WYW) / WHW;
  float ink = 0.0;
  float row = floor((p.y - qy) / 0.32);
  float bx = (p.x + 0.33 * mod(row, 2.0)) / 0.66;
  float cl = l1(abs(fract((p.y - qy) / 0.32) - 0.5) * 0.32 - 0.16, 0.012, aa);
  float vl = l1((abs(fract(bx) - 0.5) - 0.5) * 0.66, 0.012, aa);
  
  float m = max(ap.x, ap.y);
  float sur = f1(1.36 - m, aa);
  float pil = boxFill(vec2(abs(p.x), p.y), vec2(2.75, 0.5 * (qy + 5.0)), vec2(0.28, 0.5 * (5.0 - qy)), a2);
  float inArc = 0.0;
  for (int i = 0; i < 2; i++) {
    float cx = i == 0 ? -1.35 : 1.35;
    vec2 d = p - vec2(cx, -2.95);
    float shaft = max(abs(d.x) - 0.72, max(-d.y - 1.6, d.y));
    float top = length(d) - 0.72;
    float arc = d.y > 0.0 ? top : shaft;
    inArc = max(inArc, f1(-arc, aa));
    ink = max(ink, l1(arc, 0.03, aa));
    ink = max(ink, l1(arc - 0.13, 0.016, aa) * f1(d.y + 0.02, aa) * 0.8);
  }
  float band = max(boxFill(p, vec2(0.0, -1.9), vec2(3.1, 0.12), a2), max(boxFill(p, vec2(0.0, 2.15), vec2(3.15, 0.16), a2), boxFill(p, vec2(0.0, 4.85), vec2(3.2, 0.18), a2)));
  float ped = sdTri(p, vec2(-3.2, 5.03), vec2(3.2, 5.03), vec2(0.0, 6.35));
  float above = f1(p.y - 4.67, aa);
  float body = f1(3.03 - abs(p.x), aa) * (1.0 - above) + f1(-ped, aa) * above;
  float shutM = boxFill(vec2(ap.x, p.y), vec2(1.92, 0.0), vec2(0.53, 1.15), a2);
  float upW = 0.0;
  for (int i = 0; i < 3; i++) upW = max(upW, boxFill(p, vec2(-1.55 + 1.55 * float(i), 3.4), vec2(0.33, 0.53), a2));
  float sillM = boxFill(p, vec2(0.0, -1.47), vec2(1.57, 0.13), a2);
  ink = max(ink, max(cl, vl) * 0.5 * (1.0 - pil) * (1.0 - sur) * (1.0 - inArc) * (1.0 - band) * (1.0 - shutM) * (1.0 - upW) * (1.0 - sillM) * body);
  ink = max(ink, max(l1(abs(p.x) - 2.47, 0.025, aa), l1(abs(p.x) - 3.03, 0.03, aa)) * f1(4.67 - p.y, aa) * f1(p.y - qy, aa));
  ink = max(ink, max(boxLine(p, vec2(0.0, -1.9), vec2(3.1, 0.12), 0.02, a2), max(boxLine(p, vec2(0.0, 2.15), vec2(3.15, 0.16), 0.02, a2), boxLine(p, vec2(0.0, 4.85), vec2(3.2, 0.18), 0.022, a2))));
  ink = max(ink, l1(ped, 0.025, aa) * f1(p.y - 5.0, aa));
  float ocu = length(p - vec2(0.0, 5.55)) - 0.32;
  ink = max(ink, max(l1(ocu, 0.03, aa), l1(ocu - 0.08, 0.02, aa)));
  ink = max(ink, l1(1.36 - m, 0.025, aa));
  float key = max(abs(p.x) - 0.12 - (p.y - 1.2) * 0.25, max(p.y - 1.62, 1.2 - p.y));
  ink = max(ink, l1(key, 0.022, aa));
  ink = max(ink, boxLine(p, vec2(0.0, -1.47), vec2(1.55, 0.11), 0.02, a2));
  float shut = boxFill(vec2(ap.x, p.y), vec2(1.92, 0.0), vec2(0.5, 1.12), a2);
  ink = max(ink, boxLine(vec2(ap.x, p.y), vec2(1.92, 0.0), vec2(0.5, 1.12), 0.025, a2));
  ink = max(ink, l1(abs(fract(p.y / 0.16) - 0.5) * 0.16, 0.012, aa) * shut * 0.75);
  ink = max(ink, boxLine(vec2(ap.x, p.y), vec2(1.92, 0.0), vec2(0.38, 1.0), 0.015, a2) * shut);
  float frame = f1(1.13 - m, aa);
  ink = max(ink, l1(m - 1.0, 0.03, aa));
  ink = max(ink, l1(m - 1.13, 0.02, aa));
  ink = max(ink, l1(abs(ap.x - ap.y), 0.012, aa) * frame);
  for (int i = 0; i < 3; i++) {
    vec2 c = vec2(-1.55 + 1.55 * float(i), 3.4);
    float w = boxFill(p, c, vec2(0.3, 0.5), a2);
    ink = max(ink, boxLine(p, c, vec2(0.3, 0.5), 0.022, a2));
    ink = max(ink, boxLine(p, c + vec2(0.0, -0.62), vec2(0.42, 0.06), 0.018, a2));
    ink = max(ink, l1(p.x - c.x, 0.018, aa) * w * 0.7);
    ink = max(ink, l1(p.y - c.y - 0.1, 0.018, aa) * w * 0.7);
  }
  ink = max(ink, l1(p.y - qy, 0.03, aa) * f1(3.05 - abs(p.x), aa));
  return ink;
}

// ---- house facades on the plane X = x0, coordinates (Z, Y)
// returns ink; adjusts tone/colour of windows and shutters
void houseFacade(vec2 st, vec2 aa, vec4 A, vec4 B, inout vec3 col, inout float t, out float ink) {
  float z0 = A.x, z1 = A.y, ye = A.w, yr = B.x;
  float w = z1 - z0;
  float zm = 0.5 * (z0 + z1);
  ink = 0.0;
  // outline: corners, eave and gable edges
  ink = max(ink, l1(st.x - z0, 0.06, aa.x));
  ink = max(ink, l1(st.x - z1, 0.06, aa.x));
  float gy = ye + (yr - ye) * (1.0 - abs(st.x - zm) / (0.5 * w));
  // gable edge (sloped): distance measured vertically, scaled to approx normal
  float k = (yr - ye) / (0.5 * w);
  ink = max(ink, l1((gy - st.y) / sqrt(1.0 + k * k), 0.07, max(aa.y, aa.x * k)));
  ink = max(ink, l1(st.y - ye, 0.04, aa.y) * 0.8);
  // storeys: ground floor 3.6 m, then 3 m
  float ys = st.y - YQ;
  float storey = ys < 3.6 ? 0.0 : 1.0 + floor((ys - 3.6) / 3.0);
  float yb = storey < 0.5 ? 0.0 : 3.6 + (storey - 1.0) * 3.0;
  ink = max(ink, l1(ys - 3.6, 0.05, aa.y) * step(st.y, ye));
  float nb = max(2.0, floor(w / 2.5));
  float bw = w / nb;
  float bi = clamp(floor((st.x - z0) / bw), 0.0, nb - 1.0);
  float bc = z0 + (bi + 0.5) * bw;
  float hs = B.w;
  if (st.y < ye) {
    if (storey < 0.5) {
      // ground floor: doors and shop arches
      bool isDoor = mod(bi + floor(hs * 7.0), 3.0) < 0.5;
      vec2 c = vec2(bc, YQ + (isDoor ? 1.15 : 1.4));
      vec2 h = isDoor ? vec2(0.55, 1.15) : vec2(0.8, 1.0);
      float arch = isDoor ? 0.0 : 1.0;
      float wf = boxFill(st, c, h, aa);
      float wl = boxLine(st, c, h, 0.05, aa);
      t = mix(t, 0.2, wf);
      col = mix(col, C_DARK, wf);
      ink = max(ink, wl);
      if (!isDoor) ink = max(ink, l1(st.y - c.y - 0.3, 0.03, aa.y) * wf);
    } else {
      // windows with shutters
      vec2 c = vec2(bc, YQ + yb + 1.55);
      vec2 h = vec2(0.42, 0.72);
      float wf = boxFill(st, c, h, aa);
      ink = max(ink, boxLine(st, c, h, 0.045, aa));
      ink = max(ink, l1(st.x - c.x, 0.03, aa.x) * wf);
      ink = max(ink, l1(st.y - c.y - 0.2, 0.03, aa.y) * wf);
      t = mix(t, 0.24, wf);
      col = mix(col, C_DARK * 1.4, wf);
      float shp = boxFill(vec2(abs(st.x - c.x), st.y), vec2(0.42 + 0.33, c.y), vec2(0.3, 0.72), aa);
      bool shutters = fract(hs * 13.0 + storey * 0.31) < 0.6;
      if (shutters) {
        col = mix(col, C_SHUT * 0.95, shp);
        t = mix(t, 0.45, shp);
        ink = max(ink, boxLine(vec2(abs(st.x - c.x), st.y), vec2(0.75, c.y), vec2(0.3, 0.72), 0.035, aa));
      }
      // sill
      ink = max(ink, boxLine(st, c - vec2(0.0, 0.8), vec2(0.55, 0.06), 0.03, aa));
    }
  } else {
    // gable: a loft door with a hoist beam
    vec2 c = vec2(zm, ye + 0.45 * (yr - ye));
    float h = 0.35 * (yr - ye);
    float wf = boxFill(st, c, vec2(0.45, h * 0.6), aa);
    ink = max(ink, boxLine(st, c, vec2(0.45, h * 0.6), 0.04, aa));
    t = mix(t, 0.25, wf); col = mix(col, C_DARK, wf);
  }
}

vec4 town(vec2 u, float pxu) {
  vec2 du = (u - vec2(TCX, TCY)) / TG;
  // ---- nearest surface
  float Z = 1e9; float id = 0.0; vec2 st = vec2(0.0); vec2 aa = vec2(1.0); int hi = -1;
  // sea and quay (horizontal planes)
  if (du.y < 0.0) {
    float zs = YS / du.y;
    float xs = du.x * zs;
    if (xs < XQ0) { Z = zs; id = 1.0; st = vec2(xs, zs); aa = planeAA(zs, pxu, du.y, du.x).yx; }
    float zq = YQ / du.y;
    float xq = du.x * zq;
    if (xq >= XQ0 && zq < ZG && zq < Z) { Z = zq; id = 2.0; st = vec2(xq, zq); aa = planeAA(zq, pxu, du.y, du.x).yx; }
  }
  // houses on the right
  for (int i = 0; i < NH; i++) {
    vec4 A = HA[i], B = HB[i];
    float z0 = A.x, z1 = A.y, x0 = A.z, ye = A.w, yr = B.x;
    float zm = 0.5 * (z0 + z1), hw = 0.5 * (z1 - z0);
    // facade facing the quay
    if (du.x > 0.0) {
      float zf = x0 / du.x;
      if (zf > z0 && zf < z1 && zf < Z) {
        float y = du.y * zf;
        float top = ye + (yr - ye) * (1.0 - abs(zf - zm) / hw);
        if (y > YQ && y < top) { Z = zf; id = 3.0; st = vec2(zf, y); aa = planeAA(zf, pxu, du.x, du.y); hi = i; }
      }
    }
    // the eave-side wall facing the camera
    float xf = du.x * z0, yf = du.y * z0;
    if (z0 < Z && xf > x0 && xf < x0 + 14.0 && yf > YQ && yf < ye) { Z = z0; id = 4.0; st = vec2(xf, yf); aa = vec2(z0 * pxu / TG); hi = i; }
    // roof slope facing the camera (seen from above only)
    if (yr > ye + 0.1) {
      float k = (yr - ye) / hw;
      if (du.y < k) {
        float zr = (ye - k * z0) / (du.y - k);
        float xr = du.x * zr;
        if (zr > z0 && zr < zm && xr > x0 && xr < x0 + 14.0 && zr < Z) { Z = zr; id = 5.0; st = vec2(xr, zr); aa = planeAA(zr, pxu, du.y - k, du.x).yx; hi = i; }
      }
    }
  }
  // the gallery's facade (and its neighbour to the right) across the end of the quay
  {
    float xg = du.x * ZG, yg = du.y * ZG;
    if (ZG < Z && xg > WXW - 3.05 * WHW && xg < XH + 4.0 && yg > YQ) {
      vec2 fq = (vec2(xg, yg) - vec2(WXW, WYW)) / WHW;
      float ped = sdTri(fq, vec2(-3.2, 5.03), vec2(3.2, 5.03), vec2(0.0, 6.35));
      bool inG = abs(fq.x) < 3.05 && (fq.y < 5.03 || ped < 0.0);
      bool inN = fq.x >= 3.05 && fq.y < 3.6;
      if (inG || inN) { Z = ZG; id = inG ? 6.0 : 7.0; st = fq; aa = vec2(ZG * pxu / TG / WHW); }
    }
  }
  // breakwater far out on the left
  {
    float zb = 420.0;
    float xb = du.x * zb, yb = du.y * zb;
    if (zb < Z && xb < -55.0 && xb > -420.0 && yb > YS && yb < YS + 2.2) { Z = zb; id = 8.0; st = vec2(xb, yb); aa = vec2(zb * pxu / TG); }
  }

  // ---- shade it
  Paint P;
  float pxa = pxu / TG; // pixel size in du (angle) units
  if (id < 0.5) {
    // sky: ruled lines, closer towards the top; a few cumulus clouds
    float h = du.y;
    float tt = mix(0.95, 0.8, smoothstep(0.0, 0.42, h));
    float cd = 1e9; vec2 cc = vec2(0.0); float cr = 1.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 c0 = i == 0 ? vec2(-0.3, 0.2) : i == 1 ? vec2(0.02, 0.29) : i == 2 ? vec2(0.33, 0.13) : i == 3 ? vec2(-0.12, 0.09) : vec2(0.25, 0.35);
      float sc = i == 1 ? 1.3 : i == 3 ? 0.6 : i == 4 ? 0.8 : 1.0;
      for (int j = 0; j < 6; j++) {
        float fj = float(j);
        vec2 pc = c0 + sc * vec2((fj - 2.5) * 0.028, 0.012 * sin(fj * 2.3 + fi) + 0.018 * (1.0 - abs(fj - 2.5) / 2.5));
        float pr = sc * (0.022 + 0.012 * fract(sin(fj * 12.9 + fi * 4.1) * 43758.5));
        float dd = length(du - pc) - pr;
        if (dd < cd) { cd = dd; cc = pc; cr = pr; }
      }
      // flat base
      cd = max(cd, c0.y - 0.012 * sc - du.y);
    }
    float cloud = f1(-cd, pxa);
    // lit from the upper left: shade the lower right of each puff
    vec2 rel = (du - cc) / cr;
    float shade = smoothstep(-0.2, 0.9, dot(rel, normalize(vec2(0.6, -0.8))));
    tt = mix(tt, 0.97 - 0.2 * shade, cloud);
    vec3 c = mix(C_SKY * 1.08, C_SKY * 0.92, smoothstep(0.0, 0.4, h));
    c = mix(c, vec3(0.97, 0.96, 0.93) * (1.0 - 0.1 * shade), cloud);
    P = paint(c, tt, du * 100.0, vec2(pxa * 100.0), 1.0, 1.5708);
    P.ink = l1(cd, 0.0012, pxa) * 0.6;
    P.ink = max(P.ink, gulls(du, pxa));
  } else if (id < 1.5) {
    // sea: engraved horizontal strokes that swell and thin along their length
    float s = 26.0 * log(Z) + 0.5 * sin(st.x * 0.22 + Z * 0.03);
    float as = 26.0 * aa.y / Z;
    float nz = vnoise(vec2(st.x / Z * 55.0, s * 0.45));
    float wv = 0.025 + 0.17 * smoothstep(0.35, 0.8, nz);
    float lines = hfam(s, as, wv, 1.15);
    P = paint(C_SEA * (1.02 - 0.12 * nz), 0.95, st, aa, 1.0, 0.0);
    P.ink = lines * 0.65;
  } else if (id < 2.5) {
    // quay: paving in courses along the quay, a kerb along the edge
    float L = lightN(vec3(0.0, 1.0, 0.0));
    vec3 c = C_QUAY * L;
    P = paint(c, lum(c) * 0.98, vec2(st.x, st.y * 0.5), aa * vec2(1.0, 0.5), 1.0, 0.5);
    float row = floor(st.y / 1.2);
    float px = st.x / 0.9 + 0.5 * mod(row, 2.0);
    float lines = max(l1((fract(st.y / 1.2) - 0.5) * 1.2, 0.05, aa.y), l1((fract(px) - 0.5) * 0.9, 0.04, aa.x));
    P.ink = lines * 0.35;
    P.ink = max(P.ink, l1(st.x - (XQ0 + 0.6), 0.05, aa.x));
    P.ink = max(P.ink, l1(st.x - XQ0, 0.08, aa.x));
    P.t = mix(P.t, 0.86, f1(XQ0 + 0.6 - st.x, aa.x));
  } else if (id < 5.5) {
    vec4 A = HA[0], B = HB[0];
    for (int i = 0; i < NH; i++) if (i == hi) { A = HA[i]; B = HB[i]; }
    vec3 base = houseColour(B.y);
    if (id < 3.5) {
      vec3 c = base * lightN(vec3(-1.0, 0.0, 0.0));
      float t = lum(c);
      float ink;
      houseFacade(st, aa, A, B, c, t, ink);
      P = paint(c, t, st, aa, 1.0, 1.1);
      P.ink = ink;
    } else if (id < 4.5) {
      vec3 c = base * lightN(vec3(0.0, 0.0, -1.0));
      P = paint(c, lum(c) * 0.9, st, aa, 1.0, 2.1);
      // outline: the corner, eave and a window or two
      float ink = max(l1(st.x - A.z, 0.07, aa.x), l1(st.y - A.w, 0.06, aa.y));
      float d = A.z + 2.2;
      float wf = boxFill(st, vec2(d, A.w - 1.6), vec2(0.4, 0.65), aa);
      ink = max(ink, boxLine(st, vec2(d, A.w - 1.6), vec2(0.4, 0.65), 0.05, aa));
      P.t = mix(P.t, 0.22, wf); P.col = mix(P.col, C_DARK, wf);
      P.ink = ink;
    } else {
      float k = (B.x - A.w) / (0.5 * (A.y - A.x));
      vec3 n = normalize(vec3(0.0, 1.0, -k));
      vec3 c = C_ROOF * lightN(n);
      P = paint(c, lum(c) * 0.95, st, aa, 1.0, 0.3);
      float tiles = max(l1((fract(st.y / 0.45) - 0.5) * 0.45, 0.04, aa.y), 0.6 * l1((fract(st.x / 0.35 + 0.5 * floor(st.y / 0.45)) - 0.5) * 0.35, 0.03, aa.x));
      P.ink = tiles * 0.5;
      P.ink = max(P.ink, l1(st.y - A.x, 0.07, aa.y));
      P.ink = max(P.ink, l1(st.x - A.z, 0.07, aa.x));
    }
  } else if (id < 6.5) {
    float L = lightN(vec3(0.0, 0.0, -1.0)) * 1.05;
    vec4 g = galleryFacade(st, aa.x, L);
    P = paint(g.rgb, g.a, st, aa, 1.0, 0.9);
    P.ink = galleryInk(st, aa.x);
  } else if (id < 7.5) {
    // the plain neighbour of the gallery
    vec3 c = houseColour(2.0) * lightN(vec3(0.0, 0.0, -1.0));
    P = paint(c, lum(c), st, aa, 1.0, 2.0);
    float ink = l1(st.x - 3.05, 0.03, aa.x);
    ink = max(ink, l1(st.y - 3.6, 0.03, aa.y));
    for (int i = 0; i < 2; i++) {
      vec2 c2 = vec2(4.3 + 1.6 * float(i), 0.2);
      float wf = boxFill(st, c2, vec2(0.33, 0.6), aa);
      ink = max(ink, boxLine(st, c2, vec2(0.33, 0.6), 0.03, aa));
      P.t = mix(P.t, 0.22, wf); P.col = mix(P.col, C_DARK, wf);
    }
    P.ink = ink;
  } else {
    // breakwater
    vec3 c = vec3(0.7, 0.67, 0.6) * lightN(vec3(0.0, 0.0, -1.0));
    P = paint(c, lum(c) * 0.8, st, aa, 1.0, 0.4);
    P.ink = max(l1(st.y - (YS + 2.2), 0.12, aa.y), 0.4 * l1((fract(st.x / 3.0) - 0.5) * 3.0, 0.1, aa.x));
  }
  vec4 res = finish(P);

  // ---- billboards, far to near; each is drawn only where it is in front
  // distant hills
  {
    float zh = 3000.0;
    vec2 p = du * zh;
    float hgt = YS + 40.0 + 110.0 * smoothstep(-900.0, -200.0, p.x) * (1.0 - smoothstep(-150.0, 50.0, p.x)) + 60.0 * fbm(vec2(p.x / 300.0, 1.3)) ;
    hgt += 260.0 * smoothstep(80.0, 900.0, p.x);
    float d = hgt - p.y;
    float a = zh * pxu / TG;
    float cov = f1(d, a) * step(zh, Z);
    if (cov > 0.0) {
      vec3 c = vec3(0.66, 0.72, 0.72);
      Paint H = paint(c, 0.86, p, vec2(a), 1.0, 0.7);
      H.ink = l1(d, 1.6, a) * 0.7;
      // a hill town on the right-hand slopes
      if (p.x > 120.0) {
        float cell = floor(p.x / 26.0);
        float hh = 18.0 + 22.0 * hash12(vec2(cell, 3.0));
        float base = hgt - 40.0 - 30.0 * hash12(vec2(cell, 7.0));
        float hx = fract(p.x / 26.0);
        float inH = step(0.08, hx) * step(hx, 0.92) * step(base, p.y) * step(p.y, base + hh);
        if (inH > 0.5) { H.t = 0.86; H.col = vec3(0.86, 0.82, 0.74); }
        float win = step(0.3, fract(p.x / 7.0)) * step(fract(p.x / 7.0), 0.6) * step(0.4, fract((p.y - base) / 8.0)) * step(fract((p.y - base) / 8.0), 0.8) * inH;
        H.ink = max(H.ink, win * 0.7);
        H.ink = max(H.ink, l1(p.y - base - hh, 1.0, a) * step(0.08, hx) * step(hx, 0.92) * 0.8);
      }
      res = mix(res, finish(H), cov);
    }
  }
  // lighthouse on the breakwater
  {
    float zl = 420.0;
    vec2 p = du * zl - vec2(-70.0, YS + 2.2);
    float a = zl * pxu / TG;
    float w = 2.6 - p.y * 0.04;
    float tower = max(abs(p.x) - w, max(-p.y, p.y - 20.0));
    float lantern = max(abs(p.x) - 1.6, max(19.8 - p.y, p.y - 23.0));
    float cap = sdTri(p, vec2(-2.2, 23.0), vec2(2.2, 23.0), vec2(0.0, 25.5));
    float d = min(min(tower, lantern), cap);
    float cov = f1(-d, a) * step(zl, Z);
    if (cov > 0.0) {
      float band = step(0.5, fract(p.y / 5.0));
      Paint H = paint(vec3(0.9, 0.88, 0.82) * mix(1.0, 0.55, band), mix(0.9, 0.45, band), p, vec2(a), 1.0, 0.4);
      H.ink = max(l1(d, 0.25, a), l1(lantern, 0.2, a));
      res = mix(res, finish(H), cov);
    }
  }
  // boats on the water: position (x, z), kind; with a reflection below
  for (int i = 0; i < 5; i++) {
    vec3 b = i == 0 ? vec3(-16.0, 58.0, 0.0) : i == 1 ? vec3(-42.0, 150.0, 0.0) : i == 2 ? vec3(-7.6, 44.0, 1.0) : i == 3 ? vec3(-9.5, 88.0, 1.0) : vec3(-26.0, 230.0, 0.0);
    float zb = b.y;
    vec2 p = du * zb - vec2(b.x, YS);
    float a = zb * pxu / TG;
    float bi, bt; vec3 bc;
    float cov = boat(p, b.z, a, bi, bt, bc) * step(zb, Z);
    if (cov > 0.0) {
      Paint H = paint(bc, bt, p, vec2(a), 1.0, 0.8);
      H.ink = bi;
      res = mix(res, finish(H), cov);
    }
    // reflection: mirror the boat in the water line, broken by ripples
    if (p.y < 0.0 && Z > zb && id < 1.5) {
      vec2 pr = vec2(p.x + 0.25 * sin(p.y * 7.0 + p.x), -p.y);
      float rc = boatCov(pr, b.z, a) * smoothstep(-9.0, -1.0, p.y);
      float rip = step(0.45, fract(p.y * 2.2));
      res.rgb *= 1.0 - 0.35 * rc * rip;
      res.a *= 1.0 - 0.55 * rc * rip;
    }
  }
  // two people walking on the quay, and bollards along its edge
  for (int i = 0; i < 2; i++) {
    vec2 b = i == 0 ? vec2(1.5, 70.0) : vec2(-1.0, 120.0);
    vec2 p = du * b.y - vec2(b.x, YQ);
    float a = b.y * pxu / TG;
    float wi;
    float cov = walker(p, a, wi) * step(b.y, Z);
    if (cov > 0.0) {
      Paint H = paint(vec3(0.28, 0.26, 0.25), 0.25, p, vec2(a), 1.0, 0.5);
      H.ink = wi;
      res = mix(res, finish(H), cov);
    }
  }
  for (int i = 0; i < 9; i++) {
    float zb = 36.0 + 14.0 * float(i);
    vec2 p = du * zb - vec2(XQ0 + 0.35, YQ);
    float a = zb * pxu / TG;
    float d = max(abs(p.x) - 0.22, max(-p.y, length(vec2(p.x, max(p.y - 0.7, 0.0))) - 0.24 + step(p.y, 0.7) * 1.0));
    d = min(max(abs(p.x) - 0.2, max(-p.y, p.y - 0.75)), length(p - vec2(0.0, 0.75)) - 0.22);
    float cov = f1(-d, a) * step(zb, Z);
    if (cov > 0.0) {
      Paint H = paint(vec3(0.3, 0.29, 0.28), 0.28, p, vec2(a), 1.0, 0.0);
      H.ink = l1(d, 0.04, a);
      res = mix(res, finish(H), cov);
    }
  }
  return res;
}

// ================================================================= the room
// A box seen through its open front, the square [-1,1]², from a camera at
// (RCX, RCY, -RF). P = RC + (q − RC)·k with k = (RF + Z)/RF.
const vec3 RLIGHT = vec3(0.35, 0.75, -0.56) / 0.9986;
#define XVIS -0.56
#define ZVIS 0.42

// The visitor, seen from behind in a long overcoat, hands clasped at the
// small of his back, head turned a little towards the print. Local
// coordinates: feet at y = 0, height about 1 (one room unit is ~1.75 m).
float sdCoat(vec2 p) {
  float ax = abs(p.x - 0.004);
  float hw = 0.103 + 0.015 * smoothstep(0.5, 0.78, p.y) + 0.032 * (1.0 - smoothstep(0.3, 0.58, p.y));
  float top = 0.852 - 0.42 * max(ax - 0.03, 0.0) - 6.0 * max(ax - 0.085, 0.0) * max(ax - 0.085, 0.0);
  return max(ax - hw, max(p.y - top, 0.3 - p.y));
}
float sdSleeves(vec2 p) {
  float up = min(sdSeg(p, vec2(-0.104, 0.775), vec2(-0.124, 0.585)), sdSeg(p, vec2(0.112, 0.775), vec2(0.132, 0.585))) - 0.034;
  float fore = min(sdSeg(p, vec2(-0.124, 0.585), vec2(-0.03, 0.515)), sdSeg(p, vec2(0.132, 0.585), vec2(0.036, 0.508))) - 0.03;
  return min(up, fore);
}
float sdHands(vec2 p) {
  return min(length((p - vec2(-0.012, 0.505)) / vec2(1.0, 0.85)) - 0.027, length((p - vec2(0.02, 0.498)) / vec2(1.0, 0.9)) - 0.025);
}
float sdLegs(vec2 p) {
  float legs = min(sdSeg(p, vec2(-0.042, 0.31), vec2(-0.046, 0.045)), sdSeg(p, vec2(0.05, 0.31), vec2(0.054, 0.045))) - 0.032;
  float shoes = min(sdBox(p, vec2(-0.047, 0.018), vec2(0.03, 0.012)) - 0.008, sdBox(p, vec2(0.055, 0.018), vec2(0.03, 0.012)) - 0.008);
  return min(legs, shoes);
}
float sdHead(vec2 p) { return length((p - vec2(0.008, 0.92)) / vec2(0.047, 0.059)) * 0.047 - 0.047; }
float sdNeck(vec2 p) { return sdBox(p, vec2(0.006, 0.86), vec2(0.022, 0.03)); }
float sdCollar(vec2 p) { return max(abs(p.x - 0.006) - (0.05 + (0.862 - p.y) * 0.45), abs(p.y - 0.84) - 0.022); }
float sdVisitor(vec2 p) {
  return min(min(min(sdCoat(p), sdSleeves(p)), min(sdHands(p), sdLegs(p))), min(min(sdHead(p), sdNeck(p)), sdCollar(p)));
}

vec4 visitor(vec2 p, float aa, out float cov) {
  float d = sdVisitor(p);
  cov = f1(-d, aa);
  vec3 skin = vec3(0.84, 0.69, 0.58);
  vec3 coatC = vec3(0.31, 0.32, 0.35);
  // the light comes from the right and in front of him (behind us)
  float side = smoothstep(-0.13, 0.13, p.x);
  vec3 col = coatC * (0.85 + 0.3 * side);
  float t = 0.33 + 0.16 * side;
  float ink = l1(d, 0.004, aa);
  // trousers and shoes
  float lg = f1(-sdLegs(p), aa);
  col = mix(col, vec3(0.24, 0.24, 0.25), lg); t = mix(t, 0.24 + 0.08 * side, lg);
  float sh = f1(-(min(sdBox(p, vec2(-0.047, 0.018), vec2(0.03, 0.012)), sdBox(p, vec2(0.055, 0.018), vec2(0.03, 0.012))) - 0.008), aa);
  col = mix(col, vec3(0.14, 0.12, 0.11), sh); t = mix(t, 0.12, sh);
  ink = max(ink, l1(sdLegs(p), 0.003, aa) * lg);
  ink = max(ink, l1(p.y - 0.032, 0.0025, aa) * lg);
  // coat details: back seam, vent, half belt with buttons, folds, shoulder seams
  float coat = f1(-sdCoat(p), aa);
  ink = max(ink, l1(p.x - 0.004, 0.0022, aa) * f1(0.81 - p.y, aa) * coat);
  ink = max(ink, l1(p.x - 0.009, 0.0016, aa) * f1(0.43 - p.y, aa) * coat);
  float belt = sdBox(p, vec2(0.004, 0.6), vec2(0.078, 0.011));
  col = mix(col, coatC * (1.0 + 0.3 * side), f1(-belt, aa));
  t = mix(t, t + 0.06, f1(-belt, aa));
  ink = max(ink, l1(belt, 0.0022, aa) * coat);
  ink = max(ink, (l1(length(p - vec2(-0.056, 0.6)) - 0.006, 0.0018, aa) + l1(length(p - vec2(0.064, 0.6)) - 0.006, 0.0018, aa)) * coat);
  float folds = 0.0;
  folds = max(folds, l1(p.x + 0.055 + 0.07 * (0.58 - p.y), 0.0016, aa) * f1(0.575 - p.y, aa) * f1(p.y - 0.33, aa));
  folds = max(folds, l1(p.x - 0.07 - 0.09 * (0.58 - p.y), 0.0016, aa) * f1(0.575 - p.y, aa) * f1(p.y - 0.36, aa));
  folds = max(folds, l1(p.x + 0.1 + 0.02 * (0.7 - p.y), 0.0014, aa) * f1(0.72 - p.y, aa) * f1(p.y - 0.62, aa));
  ink = max(ink, folds * coat * 0.85);
  ink = max(ink, l1(sdSeg(p, vec2(-0.045, 0.84), vec2(-0.1, 0.79)), 0.0016, aa) * coat * 0.8);
  ink = max(ink, l1(sdSeg(p, vec2(0.055, 0.84), vec2(0.108, 0.79)), 0.0016, aa) * coat * 0.8);
  // shade under the arms and the hem
  t -= 0.08 * f1(-(sdSleeves(p) - 0.012), aa) * (1.0 - f1(-sdSleeves(p), aa)) * coat;
  // sleeves over the coat
  float sl = f1(-sdSleeves(p), aa);
  col = mix(col, coatC * (0.78 + 0.32 * side), sl); t = mix(t, 0.27 + 0.16 * side, sl);
  ink = max(ink, l1(sdSleeves(p), 0.0028, aa) * f1(sdHands(p) + 0.004, aa));
  ink = max(ink, l1(length(p - vec2(-0.124, 0.585)) - 0.02, 0.0015, aa) * sl * 0.6);
  // hands
  float hd = f1(-sdHands(p), aa);
  col = mix(col, skin * 0.92, hd); t = mix(t, 0.62, hd);
  ink = max(ink, l1(sdHands(p), 0.0025, aa));
  ink = max(ink, l1(p.x - 0.002 - (p.y - 0.5) * 0.4, 0.0014, aa) * hd);
  // collar, neck, head: hair, ears, a sliver of cheek on the right
  float cl = f1(-sdCollar(p), aa);
  col = mix(col, coatC * (0.95 + 0.3 * side), cl); t = mix(t, 0.4 + 0.1 * side, cl);
  ink = max(ink, l1(sdCollar(p), 0.0025, aa));
  float nk = f1(-sdNeck(p), aa) * (1.0 - cl);
  col = mix(col, skin * 0.85, nk); t = mix(t, 0.58, nk);
  float hdD = sdHead(p);
  float head = f1(-hdD, aa);
  vec2 er = p - vec2(0.053, 0.905), el = p - vec2(-0.038, 0.903);
  float ear = max(f1(-(length(er / vec2(0.011, 0.018)) - 1.0) * 0.011, aa), f1(-(length(el / vec2(0.009, 0.017)) - 1.0) * 0.009, aa));
  float cheek = f1(p.x - 0.034 + (0.905 - p.y) * 0.3, aa) * f1(0.902 - p.y, aa) * head;
  float hair = head * (1.0 - cheek) * f1(p.y - 0.872 - 0.02 * abs(p.x - 0.008) / 0.047, aa);
  float skinH = max(head * (1.0 - hair), ear);
  vec3 hairC = vec3(0.25, 0.2, 0.15);
  col = mix(col, skin * 0.92, skinH); t = mix(t, 0.66, skinH);
  col = mix(col, hairC * (0.9 + 0.3 * side), hair); t = mix(t, 0.16 + 0.1 * side, hair);
  ink = max(ink, l1(hdD, 0.0028, aa));
  ink = max(ink, l1((length(er / vec2(0.011, 0.018)) - 1.0) * 0.011, 0.002, aa));
  ink = max(ink, l1((length(el / vec2(0.009, 0.017)) - 1.0) * 0.009, 0.0018, aa) * (1.0 - head));
  // a few strands of hair
  ink = max(ink, hair * l1(abs(fract((p.x + (p.y - 0.92) * 0.6) / 0.012) - 0.5) * 0.012, 0.0012, aa) * 0.5);
  Paint P = paint(col, clamp(t, 0.0, 1.0), p, vec2(aa), 1.0, 0.12);
  P.ink = ink;
  return finish(P);
}

// framed print on a wall, in the wall's coordinates: frame, mat and a small
// abstract picture. Returns ink and adjusts colour/tone.
void wallPrint(vec2 st, vec2 aa, vec2 c, vec2 h, float seed, inout vec3 col, inout float t, inout float ink) {
  float fw = 0.035, mw = 0.045;
  float outer = boxFill(st, c, h + fw + mw, aa);
  float matA = boxFill(st, c, h + mw, aa);
  float img = boxFill(st, c, h, aa);
  col = mix(col, vec3(0.36, 0.27, 0.2), outer);
  t = mix(t, 0.3, outer);
  col = mix(col, vec3(0.94, 0.92, 0.86), matA);
  t = mix(t, 0.95, matA);
  ink = max(ink, boxLine(st, c, h + fw + mw, 0.004, aa));
  ink = max(ink, boxLine(st, c, h + mw, 0.003, aa));
  ink = max(ink, boxLine(st, c, h, 0.003, aa));
  // the picture: a hill, a horizon and a sun, in tone only
  vec2 p = (st - c) / h;
  float hill = p.y + 0.35 - 0.3 * sin(p.x * 2.0 + seed * 5.0) * (0.6 + 0.4 * seed);
  float sun = length(p - vec2(0.45 - seed * 0.9, 0.45)) - 0.16;
  float tone = hill < 0.0 ? 0.45 : 0.85;
  tone = mix(tone, 0.96, f1(-sun / 4.0, max(aa.x, aa.y)));
  col = mix(col, mix(vec3(0.6, 0.64, 0.58), vec3(0.84, 0.86, 0.85), step(0.0, hill)), img);
  t = mix(t, tone, img);
  ink = max(ink, l1(hill * h.y, 0.003, max(aa.x, aa.y)) * img);
}

vec4 room(vec2 q, float pxq) {
  vec2 d = q - vec2(RCX, RCY);
  float k = (RF + RD) / RF; int sid = 0;
  if (d.y < 0.0) { float kk = (-1.0 - RCY) / d.y; if (kk < k) { k = kk; sid = 1; } }
  if (d.y > 0.0) { float kk = (1.0 - RCY) / d.y; if (kk < k) { k = kk; sid = 2; } }
  if (d.x < 0.0) { float kk = (-1.0 - RCX) / d.x; if (kk < k) { k = kk; sid = 3; } }
  if (d.x > 0.0) { float kk = (1.0 - RCX) / d.x; if (kk < k) { k = kk; sid = 4; } }
  vec3 P = vec3(vec2(RCX, RCY) + d * k, RF * (k - 1.0));
  // pixel sizes: dk = k·|dq|/|slope|
  float pk = pxq * k;
  Paint S;
  vec3 wallC = vec3(0.88, 0.85, 0.78);
  float depthFade = mix(1.0, 0.88, P.z / RD);
  if (sid == 0) {
    vec2 st = P.xy;
    vec2 aa = vec2(pxq / SB);
    float L = 0.9 * depthFade;
    vec3 c = wallC * L;
    float t = lum(c);
    float ink = 0.0;
    // skirting and picture rail
    float sk = f1(-0.93 - st.y, aa.y);
    t = mix(t, 0.55, sk); c = mix(c, vec3(0.62, 0.58, 0.52), sk);
    ink = max(ink, l1(st.y + 0.93, 0.004, aa.y));
    ink = max(ink, max(l1(st.y - 0.86, 0.004, aa.y), l1(st.y - 0.88, 0.003, aa.y)));
    // the print: drop shadow, frame, mat
    vec2 c0 = vec2(0.5 * (PX0 + PX1), 0.5 * (PY0 + PY1));
    vec2 h0 = vec2(0.5 * (PX1 - PX0), 0.5 * (PY1 - PY0));
    vec2 hm = h0 + PMAT, hf = hm + PFRAME;
    float sh = boxFill(st, c0 + vec2(-0.03, -0.045), hf, aa + 0.02);
    t *= 1.0 - 0.35 * sh; c *= 1.0 - 0.25 * sh;
    // hanging wires from a hook on the rail
    vec2 hook = vec2(c0.x, 0.86);
    float wire = min(sdSeg(st, hook, vec2(c0.x - hf.x + 0.12, c0.y + hf.y)), sdSeg(st, hook, vec2(c0.x + hf.x - 0.12, c0.y + hf.y)));
    ink = max(ink, l1(wire, 0.0025, aa.x) * 0.8);
    float fr = boxFill(st, c0, hf, aa);
    float mt = boxFill(st, c0, hm, aa);
    vec3 wood = vec3(0.35, 0.25, 0.17);
    // frame: bevelled, lit from the upper right
    vec2 r = abs(st - c0) - hm;
    float bevel = (st.x - c0.x > 0.0 && r.x > r.y) || (st.y - c0.y > 0.0 && r.y > r.x) ? 0.75 : 0.45;
    c = mix(c, wood * (bevel + 0.35), fr);
    t = mix(t, bevel * 0.45, fr);
    ink = max(ink, boxLine(st, c0, hf, 0.005, aa));
    ink = max(ink, boxLine(st, c0, hm, 0.004, aa));
    ink = max(ink, boxLine(st, c0, hf - 0.025, 0.0025, aa) * fr * (1.0 - mt));
    ink = max(ink, l1(abs(abs(st.x - c0.x) - hm.x - (abs(st.y - c0.y) - hm.y)), 0.003, aa.x) * fr * (1.0 - mt) * step(0.0, max(r.x, r.y)) * step(max(r.x, r.y), PFRAME));
    c = mix(c, vec3(0.95, 0.93, 0.87), mt);
    t = mix(t, 0.96, mt);
    ink = max(ink, boxLine(st, c0, h0, 0.003, aa));
    // a label
    float lab = boxFill(st, vec2(0.86, -0.08), vec2(0.045, 0.03), aa);
    t = mix(t, 0.97, lab); c = mix(c, vec3(0.96, 0.95, 0.9), lab);
    ink = max(ink, boxLine(st, vec2(0.86, -0.08), vec2(0.045, 0.03), 0.002, aa));
    ink = max(ink, lab * l1(fract((st.y + 0.08) / 0.012) - 0.5, 0.12, aa.y / 0.012) * step(abs(st.x - 0.855), 0.03) * 0.6);
    // corners of the room
    ink = max(ink, max(l1(abs(st.x) - 1.0, 0.004, aa.x), l1(abs(st.y) - 1.0, 0.004, aa.y)));
    S = paint(c, t, st, aa, 1.0, 1.2);
    S.ink = ink;
  } else if (sid == 1 || sid == 2) {
    float sl = abs(d.y);
    float az = RF * pk / sl;
    vec2 st = vec2(P.x, P.z);
    vec2 aa = vec2(pk + abs(d.x) * pk / sl, az);
    if (sid == 1) {
      // diagonal chequered marble
      float L = 0.95 * depthFade;
      vec2 g = vec2(st.x + st.y, st.x - st.y) / 0.36;
      float chk = mod(floor(g.x) + floor(g.y), 2.0);
      vec3 c = mix(vec3(0.9, 0.87, 0.8), vec3(0.42, 0.45, 0.43), chk) * L;
      float t = mix(0.9, 0.38, chk) * L;
      float ag = (aa.x + aa.y) / 0.36;
      float ink = max(l1((fract(g.x) - 0.5) * 0.36, 0.0035, ag * 0.36), l1((fract(g.y) - 0.5) * 0.36, 0.0035, ag * 0.36)) * 0.5;
      // visitor's shadow: light from the front right, cast towards the back left
      if (st.y > ZVIS) {
        float tt = (ZVIS - st.y) / RLIGHT.z;
        vec2 hp = vec2(st.x + tt * RLIGHT.x - XVIS, tt * RLIGHT.y);
        float sd = sdVisitor(hp);
        float sh = 1.0 - smoothstep(-0.01, 0.01 + tt * 0.05, sd);
        t *= 1.0 - 0.4 * sh; c *= 1.0 - 0.3 * sh;
      }
      ink = max(ink, max(l1(abs(st.x) - 1.0, 0.004, aa.x), l1(st.y - RD, 0.004, aa.y)));
      ink = max(ink, l1(st.y, 0.006, aa.y));
      S = paint(c, t, st, aa, 1.0, 0.0);
      S.ink = ink;
    } else {
      // ceiling with beams
      float L = 0.86 * depthFade;
      vec3 c = vec3(0.86, 0.83, 0.76) * L;
      float t = lum(c);
      float bz = mod(st.y + 0.2, 0.55) - 0.275;
      float beam = f1(0.05 - abs(bz), aa.y);
      c = mix(c, vec3(0.56, 0.46, 0.36), beam);
      t = mix(t, 0.55, beam);
      float ink = l1(abs(bz) - 0.05, 0.003, aa.y);
      ink = max(ink, max(l1(abs(st.x) - 1.0, 0.004, aa.x), l1(st.y - RD, 0.004, aa.y)));
      ink = max(ink, l1(st.y, 0.006, aa.y));
      S = paint(c, t, st, aa, 1.0, 1.57);
      S.ink = ink;
    }
  } else {
    float sl = abs(d.x);
    float az = RF * pk / sl;
    vec2 st = vec2(P.z, P.y);
    vec2 aa = vec2(az, pk + abs(d.y) * pk / sl);
    bool left = sid == 3;
    float L = (left ? 0.97 : 0.8) * depthFade;
    vec3 c = wallC * L;
    float t = lum(c);
    float ink = 0.0;
    float sk = f1(-0.93 - st.y, aa.y);
    t = mix(t, 0.5, sk); c = mix(c, vec3(0.62, 0.58, 0.52) * L, sk);
    ink = max(ink, l1(st.y + 0.93, 0.004, aa.y));
    ink = max(ink, max(l1(st.y - 0.86, 0.004, aa.y), l1(st.y - 0.88, 0.003, aa.y)));
    if (left) {
      wallPrint(st, aa, vec2(0.45, 0.05), vec2(0.2, 0.25), 0.2, c, t, ink);
      wallPrint(st, aa, vec2(1.18, 0.02), vec2(0.16, 0.2), 0.8, c, t, ink);
    } else {
      wallPrint(st, aa, vec2(0.38, 0.04), vec2(0.18, 0.24), 0.55, c, t, ink);
      // a doorway to the next room
      vec2 dc = vec2(1.12, -0.36), dh = vec2(0.22, 0.64);
      float df = boxFill(st, dc, dh, aa);
      float inner = smoothstep(dc.y - dh.y, dc.y - dh.y + 0.2, st.y);
      c = mix(c, mix(vec3(0.5, 0.48, 0.44), vec3(0.24, 0.23, 0.22), inner), df);
      t = mix(t, mix(0.55, 0.2, inner), df);
      ink = max(ink, boxLine(st, dc, dh, 0.005, aa));
      ink = max(ink, boxLine(st, dc, dh + 0.03, 0.003, aa) * (1.0 - df));
    }
    ink = max(ink, max(l1(st.x - RD, 0.004, aa.x), l1(abs(st.y) - 1.0, 0.004, aa.y)));
    ink = max(ink, l1(st.x, 0.006, aa.x));
    S = paint(c, t, st, aa, 1.0, left ? 0.6 : 2.4);
    S.ink = ink;
  }
  vec4 res = finish(S);
  // the print's picture: the town
  if (sid == 0) {
    vec2 u = P.xy;
    float inImg = boxFill(u, vec2(0.5 * (PX0 + PX1), 0.5 * (PY0 + PY1)), vec2(0.5 * (PX1 - PX0), 0.5 * (PY1 - PY0)) - 0.0015, vec2(pxq / SB));
    if (inImg > 0.0) res = mix(res, town(u, pxq / SB), inImg);
  }
  // the visitor
  {
    float kv = (RF + ZVIS) / RF;
    vec2 pv = vec2(RCX, RCY) + d * kv;
    if (kv < k) {
      float cov;
      vec4 v = visitor(pv - vec2(XVIS, -1.0), pxq * kv, cov);
      res = mix(res, v, cov);
    }
  }
  return res;
}

void main() {
  float lr = (vUv.x - 1.0) * LNR;
  float th = (vUv.y - 0.5) * 2.0 * PI;
  vec2 q = exp(lr) * vec2(cos(th), sin(th));
  float N = max(abs(q.x), abs(q.y));
  if (N < H0) q *= R;
  float pxq = length(q) * 2.0 * PI / uTexSize.y;
  gl_FragColor = room(q, pxq);
}
`;
