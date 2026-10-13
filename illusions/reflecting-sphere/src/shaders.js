// Shaders for the study and the mirror sphere.
//
// The room is drawn with a copy of the Waterfall's ink/lithograph shader,
// extended with the patterns a study needs (wallpaper, panelling, book spines,
// pictures, a clock dial, the view through the window). It writes the colour
// in rgb and, in alpha, the distance from the sphere's centre. Rendered into
// a cube map from that centre, this gives the "distance impostor" the sphere
// shader traces its reflected rays through.

import * as THREE from 'three';

// --------------------------------------------------------------- shared GLSL
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

// The Waterfall's lithograph conversion, with the hatching period as a uniform
// (the room is in metres, and the cube map wants coarser hatching than the screen).
export const LITHO = /* glsl */ `
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.03 + gw * 0.025);

  float L = pow(dot(col, vec3(0.30, 0.59, 0.11)), 0.8);
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = uHatch * max(length(vW - cameraPosition), 0.3);
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

export function createSharedUniforms() {
  return {
    uTime: { value: 0 },
    uClock: { value: 0 },
    uLitho: { value: 1 },
    uHatch: { value: 0.012 },
    uCubePass: { value: 0 },
    uAir: { value: 0 },
    uSun: { value: new THREE.Vector3(1, 0.55, -0.22).normalize() },
    uLamp: { value: new THREE.Vector3() },
    uC: { value: new THREE.Vector3() },
    uFeet: { value: new THREE.Vector3(0, -9, 0) },
    uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
    uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
    uHaze: { value: new THREE.Vector3(0.83, 0.86, 0.84) },
  };
}

// ----------------------------------------------------------------- the room
const ROOM_VS = /* glsl */ `
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
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const ROOM_FS = /* glsl */ `
uniform float uTime;
uniform float uClock;
uniform float uLitho;
uniform float uHatch;
uniform float uCubePass;
uniform float uAir;
uniform float uFade;
uniform vec3 uSun;
uniform vec3 uLamp;
uniform vec3 uC;
uniform vec3 uFeet;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${NOISE}
${LITHO}

float band(float x, float c, float w) { return 1.0 - smoothstep(w * 0.6, w, abs(x - c)); }
float segd(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// The landscape outside the window, as a function of direction only, so it
// reads as far away from wherever it is seen.
vec3 outside(vec3 d) {
  float el = d.y;
  float az = atan(d.z, d.x);
  vec3 sky = mix(vec3(0.95, 0.94, 0.89), vec3(0.66, 0.77, 0.88), smoothstep(0.0, 0.55, el));
  vec2 cp = vec2(az * 2.2 + uTime * 0.006, el * 5.0 / (el + 0.25));
  float cl = fbm(cp * 2.0);
  sky = mix(sky, vec3(0.99, 0.98, 0.95), smoothstep(0.52, 0.72, cl) * 0.85);
  float h1 = 0.05 + 0.05 * fbm(vec2(az * 3.0, 1.3));
  float h2 = -0.03 + 0.045 * fbm(vec2(az * 6.5, 4.1));
  vec3 col = sky;
  if (el < h1) col = mix(vec3(0.62, 0.7, 0.72), sky, 0.35);
  // a row of poplars along the nearer hedge
  float pc = az * 9.0;
  float pi = floor(pc);
  float pf = fract(pc) - 0.5;
  float ph = hash12(vec2(pi, 2.0));
  float tall = h2 + 0.06 + 0.1 * ph;
  float wid = 0.12 * (1.0 - smoothstep(h2, tall, el)) * step(0.45, ph);
  if (abs(pf) < wid && el < tall) col = vec3(0.3, 0.38, 0.27) * (0.85 + 0.3 * vnoise(vec2(az * 200.0, el * 90.0)));
  if (el < h2) {
    float f = fbm(vec2(az * 30.0, el * 80.0));
    col = mix(vec3(0.42, 0.53, 0.32), vec3(0.6, 0.6, 0.36), step(0.5, fract(az * 4.0 + el * 9.0))) * (0.85 + 0.25 * f);
  }
  return col;
}

void main() {
  if (uFade < 0.999 && hash12(gl_FragCoord.xy) > uFade) discard;
  vec3 n = normalize(vN);
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  vec3 base = vC;
  float tex = 1.0;
  float lines = 0.0;
  float emit = 0.0;

  if (pat == 4.0) {            // floorboards
    float pw = 0.15;
    float row = floor(uv.y / pw);
    float fy = fract(uv.y / pw) * pw;
    float L = 1.7;
    float x = uv.x / L + hash12(vec2(row, 3.1));
    float fx = fract(x) * L;
    float d = min(min(fy, pw - fy), min(fx, L - fx));
    float l = lod(pw, fw);
    float grain = vnoise(vec2(uv.x * 2.5, uv.y * 70.0 + row * 7.0));
    tex = mix(1.0, 0.84 + 0.2 * grain + 0.16 * (hash12(vec2(floor(x), row)) - 0.5), l);
    lines = lineMask(d, 0.0025) * l * 0.85;
  } else if (pat == 5.0) {     // plaster
    tex = 0.95 + 0.07 * fbm(uv * 1.5) + 0.03 * vnoise(uv * 14.0);
  } else if (pat == 6.0) {     // wood grain on furniture
    float l = lod(0.05, fw);
    tex = mix(1.0, 0.86 + 0.22 * vnoise(vec2(uv.x * 3.0 + uv.y * 0.4, uv.y * 45.0)), l);
  } else if (pat == 8.0) {     // cloth: soft folds + weave
    tex = 0.9 + 0.08 * sin(uv.x * 40.0 + 2.0 * fbm(uv * 3.0)) + 0.04 * vnoise(uv * 120.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.7 + 0.5 * fbm(uv * 18.0);
  } else if (pat == 20.0) {    // wallpaper: stripes with a small lozenge
    float cw = 0.19;
    float sx = uv.x / cw;
    float fx = fract(sx) - 0.5;
    float l = lod(cw, fw);
    float bandC = 1.0 - smoothstep(0.17, 0.2, abs(fx));
    float ry = uv.y / 0.23 + 0.5 * mod(floor(sx), 2.0);
    vec2 m = vec2(fx * cw, (fract(ry) - 0.5) * 0.23);
    float dm = abs(m.x) / 0.022 + abs(m.y) / 0.038;
    float motif = 1.0 - smoothstep(0.8, 1.0, dm);
    tex = mix(1.0, 0.95 + 0.06 * bandC - 0.2 * motif, l) * (0.96 + 0.06 * fbm(uv * 2.5));
    lines = (lineMask(abs(abs(fx) - 0.2) * cw, 0.0011) * 0.55 + lineMask(abs(dm - 1.0) * 0.02, 0.0009) * 0.4) * l;
  } else if (pat == 21.0) {    // the rug
    vec2 sz = vec2(2.6, 1.9);
    vec2 q = uv;
    vec2 de2 = min(q, sz - q);
    float de = min(de2.x, de2.y);
    vec2 c = q - sz * 0.5;
    vec3 red = vec3(0.66, 0.3, 0.24), navy = vec3(0.27, 0.33, 0.46), cream = vec3(0.9, 0.85, 0.72), ochre = vec3(0.8, 0.63, 0.34);
    base = red;
    float l = lod(0.1, fw);
    if (de < 0.22) {
      base = navy;
      float s = de2.x < de2.y ? q.y : q.x;
      float mm = abs(fract(s / 0.17) - 0.5) * 0.17;
      float dd = mm + abs(de - 0.11);
      base = mix(base, ochre, (1.0 - smoothstep(0.05, 0.058, dd)) * l);
      base = mix(base, cream, (1.0 - smoothstep(0.022, 0.03, dd)) * l);
      lines = (lineMask(abs(de - 0.22), 0.004) + lineMask(abs(de - 0.03), 0.003)) * l;
    } else {
      base = mix(cream, ochre, 0.25);
      vec2 g = vec2(c.x + c.y, c.x - c.y) / 0.32;
      vec2 gf = abs(fract(g) - 0.5);
      float lat = min(gf.x, gf.y);
      base = mix(base, red, (1.0 - smoothstep(0.035, 0.06, lat)) * l * 0.85);
      float dot2 = length(abs(fract(g + 0.5) - 0.5));
      base = mix(base, navy, (1.0 - smoothstep(0.1, 0.13, dot2)) * l);
      float md = abs(c.x) / 0.62 + abs(c.y) / 0.44;
      if (md < 1.0) base = navy;
      if (md < 0.8) base = cream;
      if (md < 0.62) base = red;
      if (md < 0.32) base = ochre;
      lines = max(lines, lineMask(abs(md - 1.0) * 0.3, 0.003) * l);
    }
    tex = 0.86 + 0.16 * vnoise(uv * 140.0) + 0.06 * fbm(uv * 3.0);
  } else if (pat == 22.0) {    // book spine (uv 0..1)
    float h = hash12(floor(vC.rg * 251.0) + floor(vC.b * 97.0));
    float v = uv.y;
    float gilt = band(v, 0.07, 0.012) + band(v, 0.93, 0.012) + step(0.6, h) * (band(v, 0.12, 0.008) + band(v, 0.88, 0.008));
    float label = step(0.5, h) * step(0.6, v) * step(v, 0.74);
    float title = step(0.25, uv.x) * step(uv.x, 0.75) * band(fract(v * 26.0), 0.5, 0.18) * step(0.3, v) * step(v, 0.56);
    base = mix(base, base * 0.5, label);
    base = mix(base, vec3(0.82, 0.7, 0.42), clamp(gilt + title * 0.6, 0.0, 1.0));
    tex = 0.9 + 0.14 * vnoise(uv * vec2(6.0, 40.0));
    lines = (band(v, 0.6, 0.012) + band(v, 0.74, 0.012)) * step(0.5, h) * 0.6;
  } else if (pat == 23.0) {    // picture: a landscape
    vec2 p = uv;
    float hz = 0.46 + 0.06 * sin(p.x * 5.0 + 1.0) + 0.025 * sin(p.x * 17.0);
    float hz2 = 0.3 + 0.09 * sin(p.x * 2.6 + 2.5);
    base = mix(vec3(0.86, 0.85, 0.76), vec3(0.62, 0.7, 0.76), p.y);
    if (p.y < hz) base = vec3(0.5, 0.56, 0.48);
    if (p.y < hz2) base = vec3(0.6, 0.56, 0.38);
    float path = abs(p.x - 0.7 - 0.25 * (0.3 - p.y) - 0.05 * sin(p.y * 20.0)) - 0.02 * (0.35 - p.y) * 4.0;
    if (p.y < hz2 && path < 0.0) base = vec3(0.8, 0.74, 0.58);
    vec2 tp = p - vec2(0.32, hz2 + 0.02);
    float crown = length(tp * vec2(1.0, 0.8) - vec2(0.0, 0.17)) - 0.11;
    float trunk = max(abs(tp.x) - 0.012, max(-tp.y, tp.y - 0.12));
    if (min(crown, trunk) < 0.0) base = vec3(0.28, 0.33, 0.24);
    float l = lod(0.05, fw);
    lines = (lineMask(abs(p.y - hz), 0.0025) + lineMask(abs(p.y - hz2), 0.003) + lineMask(abs(crown), 0.003)) * l;
    lines += (1.0 - smoothstep(0.2, 0.35, abs(fract((p.x * 0.6 + p.y) * 70.0) - 0.5))) * step(p.y, hz2) * 0.3 * l;
  } else if (pat == 24.0) {    // picture: tumbling blocks (rhombille tiling)
    vec2 p = uv * 7.0 + vec2(0.25, 0.1);
    vec2 r = vec2(1.0, 1.7320508);
    vec2 hh = r * 0.5;
    vec2 a = mod(p, r) - hh;
    vec2 b = mod(p - hh, r) - hh;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    float ang = atan(gv.y, gv.x);
    float s;
    if (ang > 0.5236 && ang < 2.618) s = 0.92;
    else if (ang >= 2.618 || ang < -1.5708) s = 0.56;
    else s = 0.3;
    base = mix(vec3(0.8, 0.74, 0.62), vec3(0.95, 0.92, 0.84), s) * s * 1.05;
    float l = lod(0.14, fw);
    float hexd = 0.5 - max(dot(abs(gv), normalize(r)), abs(gv.x));
    float dA = abs(gv.x) + 9.0 * step(0.0, gv.y);
    vec2 u1 = vec2(0.8660254, 0.5), u2 = vec2(-0.8660254, 0.5);
    float sp1 = abs(gv.x * u1.y - gv.y * u1.x) + 9.0 * step(dot(gv, u1), 0.0);
    float sp2 = abs(gv.x * u2.y - gv.y * u2.x) + 9.0 * step(dot(gv, u2), 0.0);
    float sp = min(dA, min(sp1, sp2));
    lines = max(lineMask(hexd / 7.0, 0.0018), lineMask(sp / 7.0, 0.0018)) * l;
  } else if (pat == 25.0) {    // picture: a sea chart
    vec2 p = uv * 2.6 + vec2(3.0, 1.0);
    float e = fbm(p * 1.4);
    base = vec3(0.86, 0.8, 0.64);
    float land = smoothstep(0.495, 0.505, e);
    base = mix(base * vec3(0.93, 0.96, 1.0), base * vec3(0.98, 0.92, 0.8), land);
    float l = lod(0.04, fw);
    float coast = lineMask(abs(e - 0.5) * 0.4, 0.0018);
    float sea = (1.0 - land) * (1.0 - smoothstep(0.15, 0.3, abs(fract((0.5 - e) * 22.0) - 0.5))) * step(0.36, e);
    vec2 cr = uv - vec2(0.3, 0.3);
    float ca = atan(cr.y, cr.x);
    float rh = abs(fract(ca / 6.2831853 * 16.0) - 0.5) * length(cr) * 0.4;
    float rose = 1.0 - smoothstep(0.0, 0.002, rh);
    lines = (coast + sea * 0.45 + rose * 0.25 + lineMask(abs(length(cr) - 0.06), 0.002)) * l;
  } else if (pat == 26.0) {    // picture: a botanical study
    vec2 p = uv;
    base = vec3(0.9, 0.87, 0.78);
    float sx = 0.33 + 0.04 * sin(p.y * 6.0);
    float stem = abs(p.x - sx) - 0.004;
    float leaf = 9.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float y0 = 0.18 + fi * 0.12;
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 o = vec2(0.33 + 0.04 * sin(y0 * 6.0) + side * 0.07, y0 + 0.04);
      vec2 q = p - o;
      float an = side * 0.7;
      q = mat2(cos(an), -sin(an), sin(an), cos(an)) * q;
      leaf = min(leaf, length(q / vec2(0.075, 0.03)) - 1.0);
    }
    float flower = length(p - vec2(sx, 0.9)) - 0.045;
    if (leaf < 0.0) base = vec3(0.42, 0.52, 0.34);
    if (flower < 0.0) base = vec3(0.68, 0.32, 0.26);
    float l = lod(0.03, fw);
    lines = (lineMask(abs(leaf) * 0.03, 0.0015) + lineMask(max(stem, 0.0), 0.0015) * step(p.y, 0.86) + lineMask(abs(flower), 0.002)) * l;
  } else if (pat == 27.0) {    // the view through the window
    base = outside(normalize(vW - cameraPosition));
    emit = 1.0;
  } else if (pat == 28.0) {    // lamp glow
    base = vec3(1.0, 0.95, 0.78);
    emit = 1.0;
  } else if (pat == 29.0) {    // clock dial (uv 0..1)
    vec2 p = uv - 0.5;
    float r = length(p);
    base = vec3(0.92, 0.88, 0.76);
    float a = atan(p.x, p.y);
    float l = lod(0.02, fw);
    float tick = step(0.36, r) * step(r, 0.43) * (1.0 - smoothstep(0.0, 0.06, abs(fract(a / 6.2831853 * 12.0 + 0.5) - 0.5)));
    float mins = step(0.4, r) * step(r, 0.43) * (1.0 - smoothstep(0.0, 0.12, abs(fract(a / 6.2831853 * 60.0 + 0.5) - 0.5)));
    float hrA = uClock / 43200.0 * 6.2831853;
    float mnA = uClock / 3600.0 * 6.2831853;
    float hr = segd(p, vec2(0.0), 0.22 * vec2(sin(hrA), cos(hrA)));
    float mn = segd(p, vec2(0.0), 0.34 * vec2(sin(mnA), cos(mnA)));
    lines = max(max(tick, mins * 0.7), max(lineMask(hr, 0.018), lineMask(mn, 0.011))) * l;
    lines = max(lines, lineMask(abs(r - 0.45), 0.008) * l);
    lines *= 1.6;
  } else if (pat == 30.0) {    // paper with handwriting
    base = vec3(0.94, 0.91, 0.83);
    float l = lod(0.012, fw);
    float row = floor(uv.y / 0.012);
    float fy = fract(uv.y / 0.012);
    float word = step(0.35, vnoise(vec2(uv.x * 60.0, row * 3.1)));
    float ink = (1.0 - smoothstep(0.1, 0.25, abs(fy - 0.5 - 0.15 * sin(uv.x * 900.0 + row)))) * word * step(hash12(vec2(row, 1.0)), 0.85);
    lines = ink * l * 0.5;
  } else if (pat == 31.0) {    // panelling
    float pwid = 0.62;
    float fx = fract(uv.x / pwid) * pwid;
    float dx = min(fx, pwid - fx);
    float d = min(dx - 0.06, min(uv.y - 0.22, 0.84 - uv.y));
    float l = lod(0.06, fw);
    float bevel = smoothstep(0.0, 0.035, d);
    tex = mix(1.0, (0.86 + 0.14 * bevel) * (0.88 + 0.2 * vnoise(vec2(uv.x * 3.0, uv.y * 50.0))), l);
    lines = (lineMask(abs(d), 0.002) + lineMask(abs(d - 0.035), 0.0015) * 0.6) * l;
  } else if (pat == 32.0) {    // door leaf: four panels (uv in metres, 0.9 x 2.05)
    vec2 q = uv;
    float l = lod(0.06, fw);
    float d1 = min(min(q.x - 0.12, 0.43 - q.x), min(q.y - 1.05, 1.9 - q.y));
    float d2 = min(min(q.x - 0.47, 0.78 - q.x), min(q.y - 1.05, 1.9 - q.y));
    float d3 = min(min(q.x - 0.12, 0.43 - q.x), min(q.y - 0.15, 0.9 - q.y));
    float d4 = min(min(q.x - 0.47, 0.78 - q.x), min(q.y - 0.15, 0.9 - q.y));
    float d = max(max(d1, d2), max(d3, d4));
    float bevel = smoothstep(0.0, 0.04, d);
    tex = mix(1.0, (0.86 + 0.14 * bevel) * (0.88 + 0.2 * vnoise(vec2(uv.x * 3.0, uv.y * 50.0))), l);
    lines = (lineMask(abs(d), 0.002) + lineMask(abs(d - 0.04), 0.0015) * 0.6) * l;
  } else if (pat == 33.0) {    // brass
    tex = 0.85 + 0.3 * smoothstep(0.2, 0.9, max(dot(n, normalize(vec3(0.3, 1.0, 0.4))), 0.0));
  }

  // light: soft daylight from the window, a hemisphere fill and the desk lamp
  float sun = max(dot(n, uSun), 0.0);
  vec3 toL = uLamp - vW;
  float dl = length(toL);
  float lamp = max(dot(n, toL / dl), 0.0) * 0.55 / (1.0 + dl * dl * 6.0);
  float shade = 0.64 + 0.12 * n.y + 0.42 * sun;
  // occlusion in the corners of the room and under the pedestal and the artist
  float ao = 1.0;
  ao *= 1.0 - 0.22 * exp(-(2.8 - abs(vW.x)) * 5.0);
  ao *= 1.0 - 0.22 * exp(-(2.3 - abs(vW.z)) * 5.0);
  ao *= 1.0 - 0.16 * exp(-vW.y * 6.0);
  ao *= 1.0 - 0.18 * exp(-(2.9 - vW.y) * 6.0);
  ao *= 1.0 - 0.45 * exp(-length(vW.xz - uC.xz) / 0.16) * step(vW.y, 0.02);
  ao *= 1.0 - 0.35 * exp(-length(vW.xz - uFeet.xz) / 0.2) * step(vW.y, 0.02);
  vec3 light = vec3(shade * ao) + lamp * vec3(1.0, 0.8, 0.52);
  vec3 col = base * tex * mix(light, vec3(1.0), emit);
  col *= 1.0 - 0.55 * lines;

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - emit;

  // hatching runs in world space, projected on the face's dominant plane
  vec3 an = abs(n);
  vec2 huv = an.x > an.y && an.x > an.z ? vW.zy : (an.z > an.y ? vW.xy : vW.xz);
  float hfw = fwidth(huv.x) + fwidth(huv.y);
  float face = an.x > an.z ? 1.0 : 0.0;
  // a little aerial perspective in the main view sets the ball off from the room behind it
  float air = uAir * smoothstep(1.4, 4.5, length(vW - cameraPosition));
  vec3 outc = finish(col, max(emit * 0.35, air), ink * (1.0 - air), huv, hfw, face);
  gl_FragColor = vec4(outc, uCubePass > 0.5 ? length(vW - uC) : 1.0);
}
`;

export function makeRoomMaterial(shared, fade = { value: 1 }) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uFade: fade },
    vertexShader: ROOM_VS,
    fragmentShader: ROOM_FS,
  });
}

// ---------------------------------------------------------------- the sphere
// Each pixel finds the exact point where the eye ray meets the sphere,
// reflects the ray about the normal there and traces the reflected ray
// through the room using the distance cube map captured at the centre:
// march outward until the ray point is farther from the centre than the
// surface recorded in its direction, then refine the crossing.
const SPHERE_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SPHERE_FS = /* glsl */ `
uniform samplerCube uEnv;
uniform vec3 uC;
uniform float uR;
uniform float uLitho;
uniform float uMark;
uniform float uSize;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec3 vW;
${NOISE}

const int STEPS = 30;
const int REFINE = 6;
const float TMAX = 7.0;

float surf(vec3 x) { return length(x) - textureLod(uEnv, x, 0.0).a; }

vec3 trace(vec3 P, vec3 R) {
  vec3 x0 = P - uC;
  float f0 = surf(x0);
  if (f0 >= 0.0) return x0;
  float t0 = 0.0, t1 = TMAX, f1 = 1.0;
  for (int i = 1; i <= STEPS; i++) {
    float s = float(i) / float(STEPS);
    float t = TMAX * s * s;
    float f = surf(x0 + R * t);
    if (f > 0.0) { t1 = t; f1 = f; break; }
    t0 = t; f0 = f;
  }
  for (int j = 0; j < REFINE; j++) {
    float tm = mix(t0, t1, clamp(f0 / (f0 - f1), 0.15, 0.85));
    float fm = surf(x0 + R * tm);
    if (fm > 0.0) { t1 = tm; f1 = fm; } else { t0 = tm; f0 = fm; }
  }
  return x0 + R * mix(t0, t1, f0 / (f0 - f1));
}

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vW - ro);
  vec3 oc = ro - uC;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uR * uR;
  float h = max(b * b - c, 0.0);
  float t = -b - sqrt(h);
  vec3 P = ro + rd * t;
  vec3 n = normalize(P - uC);
  vec3 R = reflect(rd, n);
  vec3 X = trace(P, R);
  // filter the lookup by how much of the cube map one pixel covers (the rim is very compressed)
  vec3 Xn = normalize(X);
  float texels = length(fwidth(Xn)) * uSize / 1.5708;
  vec3 col = textureLod(uEnv, X, clamp(log2(max(texels, 1.0)), 0.0, 4.5)).rgb;

  // silvered glass: high reflectance, rising to 1 at grazing incidence
  float cosi = clamp(-dot(rd, n), 0.0, 1.0);
  float F = 0.9 + 0.1 * pow(1.0 - cosi, 5.0);
  vec3 dark = mix(vec3(0.05, 0.05, 0.06), uInk, uLitho);
  col = mix(dark, col * mix(vec3(0.95, 0.96, 0.99), vec3(1.0), uLitho), F);
  col += (hash12(gl_FragCoord.xy) - 0.5) * 0.025;

  // the ink line round the silhouette: q is the eye ray's distance from the centre
  vec3 m = oc - b * rd;
  float q = length(m);
  float ew = max(fwidth(q), 1e-6);
  float ink = 1.0 - smoothstep(ew * 0.6, ew * 2.0, uR - q);
  col = mix(col, uInk, ink * 0.92);

  // marks round the centre of the disc, where the eye sees itself
  if (uMark > 0.001) {
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec2 s2 = vec2(dot(m, right), dot(m, up)) / uR;
    float rr = length(s2);
    float arm = min(abs(s2.x), abs(s2.y));
    float w = fwidth(rr);
    float tick = (1.0 - smoothstep(w * 0.8, w * 1.8, arm)) * smoothstep(0.155, 0.16, rr) * (1.0 - smoothstep(0.235, 0.24, rr));
    float ring = 1.0 - smoothstep(w * 0.5, w * 1.5, abs(rr - 0.16));
    col = mix(col, vec3(0.64, 0.23, 0.16), max(tick, ring * 0.0) * uMark);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export function makeSphereMaterial(shared, env, radius, size) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uEnv: { value: env },
      uC: shared.uC,
      uR: { value: radius },
      uLitho: shared.uLitho,
      uMark: { value: 0 },
      uSize: { value: size },
      uPaper: shared.uPaper,
      uInk: shared.uInk,
    },
    vertexShader: SPHERE_VS,
    fragmentShader: SPHERE_FS,
  });
}
