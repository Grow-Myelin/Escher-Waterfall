// Display shader: reads the straight picture from its log-polar texture
// through the map  w = α·(log z + shift),  texcoord = (Re w / ln R, Im w / 2π).
//
// The texture repeats with period 1 in both directions, which is exactly the
// statement that the straight picture is unchanged by z ↦ R·z (shift ln R)
// and by a full turn (shift 2πi). With α = (2πi + ln R)/(2πi) a full turn of
// the view, log z ↦ log z + 2πi, moves w by α·2πi = ln R + 2πi, i.e. by
// (1, 1) in texture coordinates, so the picture closes up without a seam.

import { LNR } from './geometry.js';

export const DISPLAY_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const DISPLAY_FS = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uAlpha;
uniform vec2 uShift;
uniform float uScale;
uniform float uLitho;
uniform float uGrid;
uniform float uSeam;
uniform float uCut;
uniform float uLog;
uniform vec2 uLogC;
uniform float uLogH;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec2 vUv;

#define LNR ${LNR}
#define TAU 6.283185307179586
#define LN2 0.6931471805599453

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
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b) { float d = max(dot(b, b), 1e-30); return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d; }
float l1(float d, float w, float aa) {
  float ww = max(w, 0.5 * aa);
  return clamp((ww - abs(d)) / aa + 0.5, 0.0, 1.0) * min(1.0, 2.0 * w / aa);
}

// The picture at untwisted log coordinate wp, with its screen derivatives.
// Returns the texel and the twisted coordinate w (for the grid).
vec4 picture(vec2 wp, vec2 dwx, vec2 dwy, out vec2 w, out float pw) {
  w = cmul(uAlpha, wp);
  vec2 dx = cmul(uAlpha, dwx), dy = cmul(uAlpha, dwy);
  pw = max(length(dx), length(dy));
  vec2 tc = vec2(w.x / LNR, w.y / TAU + 0.5);
  return textureGrad(uTex, tc, vec2(dx.x / LNR, dx.y / TAU), vec2(dy.x / LNR, dy.y / TAU));
}

// Log-polar grid in twisted coordinates: circles at powers of 2 and 9 rays
// (cells of ln 2 by 2π/9, almost square), the period lines drawn heavier.
vec2 grid(vec2 w, float pw) {
  float a = w.x / LN2, b = w.y / (TAU / 9.0);
  float da = abs(fract(a + 0.5) - 0.5) * LN2;
  float db = abs(fract(b + 0.5) - 0.5) * (TAU / 9.0);
  float thin = max(l1(da, pw * 0.75, pw), l1(db, pw * 0.75, pw));
  float A = w.x / LNR, B = w.y / TAU;
  float dA = abs(fract(A + 0.5) - 0.5) * LNR;
  float dB = abs(fract(B + 0.5) - 0.5) * TAU;
  float thick = max(l1(dA, pw * 1.5, pw), l1(dB, pw * 1.5, pw));
  return vec2(thin, thick);
}

void main() {
  float sm = 0.5 * min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / sm;
  float px = 1.0 / sm;

  // ---- the picture plane
  vec2 z = p * uScale;
  float th = atan(z.y, z.x);
  th = uCut - mod(uCut - th, TAU); // branch cut along the ray at angle uCut
  vec2 wv = vec2(log(max(length(z), 1e-30)), th);
  vec2 dwx = cdiv(vec2(px * uScale, 0.0), z);
  vec2 dwy = cdiv(vec2(0.0, px * uScale), z);
  vec2 w; float pw;
  vec4 s = picture(wv + uShift, dwx, dwy, w, pw);
  vec2 g = grid(w, pw);
  // the seam: while the twist is not a whole number of periods the picture
  // does not close up along the cut
  vec2 cd = vec2(cos(uCut), sin(uCut));
  float along = dot(p, cd);
  float seam = l1(abs(cd.x * p.y - cd.y * p.x), 1.3 * px, px) * step(0.0, along) * step(0.5, fract(along * 18.0));

  // ---- the log plane: the same picture before the exponential wraps it
  // round the centre. The red lines are the periods of the straight picture
  // (ln R and 2πi, turned and shrunk by α); the dashed lines bound one turn.
  float lattice = 0.0;
  if (uLog > 0.0) {
    vec2 wl = uLogC + p * uLogH;
    vec2 dl = vec2(px * uLogH, 0.0);
    vec2 w2; float pw2;
    vec4 s2 = picture(wl + uShift, dl, dl.yx, w2, pw2);
    vec2 g2 = grid(w2, pw2);
    float pl = px * uLogH;
    float e1 = abs(wl.y - uCut), e2 = abs(wl.y - (uCut - TAU));
    float strip = max(l1(e1, 1.2 * pl, pl), l1(e2, 1.2 * pl, pl)) * step(0.45, fract(wl.x * 2.5));
    s = mix(s, s2, uLog);
    g = vec2(mix(g.x, g2.x * uGrid, uLog), mix(g.y * uGrid, g2.y, uLog));
    lattice = strip * uLog;
    seam *= 1.0 - uLog;
  } else {
    g.y *= uGrid;
  }
  seam *= uSeam;
  g.x *= uGrid;

  // ---- finish: lithograph or colour, with paper grain
  float gr = vnoise(gl_FragCoord.xy * 0.55) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  float v = clamp(s.a + gr * 0.07 + gw * 0.05, 0.0, 1.0);
  vec3 litho = mix(uInk, uPaper, v);
  vec3 colour = s.rgb * (0.985 + gr * 0.04) + gw * 0.02;
  vec3 c = mix(colour, litho, uLitho);
  // with the grid on, the picture is veiled a little so the grid reads
  float veil = max(uGrid, uLog * 0.6) * 0.3;
  c = mix(c, mix(uPaper, vec3(0.93, 0.92, 0.89), 1.0 - uLitho), veil);
  vec3 red = vec3(0.64, 0.23, 0.16);
  c = mix(c, vec3(0.2, 0.17, 0.14), g.x * 0.8);
  c = mix(c, red, g.y * 0.92);
  c = mix(c, vec3(0.12, 0.11, 0.1), lattice * 0.9);
  c = mix(c, red, seam * 0.95);
  gl_FragColor = vec4(c, 1.0);
}
`;
