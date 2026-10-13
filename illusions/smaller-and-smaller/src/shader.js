// The whole picture is one fragment shader.
//
// Rings: ring k is the square annulus 2^(k−1) ≤ max(|x|, |y|) < 2^k. Scaled
// to ring 0 (half-sizes ½ to 1) it is a pinwheel of four 3 × 1 rectangles
// (unit = ½), turned by quarter turns: the Top arm is x ∈ [−½, 1], y ∈ [½, 1].
// In an arm's own frame (x along 0..3, y across 0..1, y = 1 on the outside):
//
//   back  y = 1 + T(x)         free: the dolphin's back and dorsal fin
//   head  x = 3 + E(y)         free: beak and melon
//   tail  x = L(y)             free: the flukes
//   belly y = B(x), forced by the neighbours:
//         x in [0, ½]  B = E(1 − 2x) / 2   the head of a half-size dolphin (ring k−1)
//         x in [½, 2]  B = T(2x − 1) / 2   the back of a half-size dolphin (ring k−1)
//         x in [2, 3]  B = −L(x − 2)        the tail of the dolphin ahead (same ring)
//
// so every edge is shared exactly, for any T, E, L. A pixel is first placed
// in its undeformed rectangle, then handed to the neighbour across whichever
// bent edge it lies beyond.

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uS;          // device px per world unit at zoom phase 0
uniform float uPhase;      // zoom phase in [0, 1): magnification 2^phase
uniform float uTime;
uniform float uLitho;
uniform float uReveal;
uniform float uAmp;        // 1: dolphins, 0: plain rectangles
uniform float uDpr;

const float PI = 3.14159265359;
const vec3 PAPER = vec3(0.925, 0.898, 0.835);
const vec3 PAPER_C = vec3(0.914, 0.902, 0.863);
const vec3 INK = vec3(0.11, 0.10, 0.09);
const vec3 RED = vec3(0.64, 0.23, 0.16);

float gSw;   // tail beat, −1..1

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
float line(float d, float w, float px) {
  float ww = max(w, 0.5 * px);
  return clamp((ww - abs(d)) / px + 0.5, 0.0, 1.0) * min(1.0, w / (0.5 * px));
}
float fill(float d, float px) { return clamp(0.5 - d / px, 0.0, 1.0); }
float sq(float x) { return x * x; }
float gauss(float x, float c, float w) { float t = (x - c) / w; return exp(-t * t); }

// ---- the three free edges
float edgeT(float x) {               // back: positive is outward
  float s = (x - 1.20) / 0.78;      // dorsal fin, 0 at its trailing base, 1 at its leading base
  float fin = 0.0;
  if (s > 0.0 && s < 1.0) fin = s < 0.26 ? pow(s / 0.26, 1.7) : 1.0 - pow((s - 0.26) / 0.74, 1.5);
  float stock = smoothstep(0.06, 0.40, x) * smoothstep(1.12, 0.70, x);
  float melon = gauss(x, 2.80, 0.13);
  float win = smoothstep(0.0, 0.06, x) * smoothstep(3.0, 2.94, x);
  return uAmp * win * (0.46 * fin - 0.17 * stock + 0.05 * melon);
}
float edgeE(float y) {               // head: positive is forward
  float win = smoothstep(0.0, 0.05, y) * smoothstep(1.0, 0.95, y);
  return uAmp * win * (0.42 * gauss(y, 0.30, 0.09) + 0.15 * gauss(y, 0.64, 0.17) - 0.04 * gauss(y, 0.10, 0.05));
}
float edgeL(float y) {               // tail: positive is into the tile
  float win = smoothstep(0.0, 0.05, y) * smoothstep(1.0, 0.95, y);
  float b = 0.05 * gSw;
  return uAmp * win * (0.30 * gauss(y, 0.50 + 0.6 * b, 0.13)
    - 0.40 * gauss(y, 0.17 + b, 0.075) - 0.40 * gauss(y, 0.83 + b, 0.075));
}
float edgeB(float x) {               // belly, forced by the neighbours
  if (x < 0.5) return 0.5 * edgeE(1.0 - 2.0 * x);
  if (x < 2.0) return 0.5 * edgeT(2.0 * x - 1.0);
  return -edgeL(x - 2.0);
}

vec2 armLocal(vec2 P, float k, float a) {
  vec2 Q = P * exp2(-k);
  for (int i = 0; i < 3; i++) if (float(i) < a) Q = vec2(-Q.y, Q.x);
  return vec2(2.0 * Q.x + 1.0, 2.0 * Q.y - 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float pxw = 1.0 / (uS * exp2(uPhase));            // world units per device px
  vec2 P = (fc - 0.5 * uRes) * pxw;
  float m = max(abs(P.x), abs(P.y));

  gSw = sin(uTime * 2.6);

  // ---- which ring, which arm, before bending
  float k = floor(log2(max(m, 1e-30))) + 1.0;
  vec2 Q = P * exp2(-k);
  float a = 0.0;
  for (int i = 0; i < 3; i++) {
    if (Q.y >= 0.5 && Q.x >= -0.5) break;
    Q = vec2(-Q.y, Q.x);
    a += 1.0;
  }
  vec2 l0 = vec2(2.0 * Q.x + 1.0, 2.0 * Q.y - 1.0);
  float pxl0 = pxw * 2.0 * exp2(-k);               // local units per px in that ring

  // ---- hand the pixel to whichever tile's bent edge it lies inside
  float vT = l0.y - 1.0 - edgeT(l0.x);
  float vE = l0.x - 3.0 - edgeE(l0.y);
  float vL = edgeL(l0.y) - l0.x;
  float vB = edgeB(l0.x) - l0.y;
  float vmax = max(max(vT, vE), max(vL, vB));
  float kk = k, aa = a;
  vec2 l = l0;
  if (vmax > 0.0) {
    if (vmax == vT) kk = k + 1.0;
    else if (vmax == vE) { kk = k + 1.0; aa = a + 1.0; }
    else if (vmax == vL) aa = a - 1.0;
    else if (l0.x < 0.5) { kk = k - 1.0; aa = a - 1.0; }
    else if (l0.x < 2.0) kk = k - 1.0;
    else aa = a + 1.0;
    aa = mod(aa + 4.0, 4.0);
    l = armLocal(P, kk, aa);
  }
  float px = pxw * 2.0 * exp2(-kk);                 // local units per px for the owner
  float x = l.x, y = l.y;
  float fam = mod(aa, 2.0);

  // ---- the tile outline, from the owner's side
  float h = 0.004;
  float dT = (1.0 + edgeT(x) - y) / sqrt(1.0 + sq((edgeT(x + h) - edgeT(x - h)) / (2.0 * h)));
  float dE = (3.0 + edgeE(y) - x) / sqrt(1.0 + sq((edgeE(y + h) - edgeE(y - h)) / (2.0 * h)));
  float dL = (x - edgeL(y)) / sqrt(1.0 + sq((edgeL(y + h) - edgeL(y - h)) / (2.0 * h)));
  float dB = (y - edgeB(x)) / sqrt(1.0 + sq((edgeB(x + h) - edgeB(x - h)) / (2.0 * h)));
  float dOut = min(min(dT, dE), min(dL, dB));
  float lineO = line(dOut, 0.022, px);

  // ---- the dolphin, drawn in its tile's frame
  float detail = 1.0 - 0.75 * uReveal;
  // countershading: dark cape above, pale belly below
  float yc = 0.38 + 0.15 * smoothstep(0.25, 1.6, x) - 0.10 * smoothstep(2.1, 3.15, x) + 0.03 * sin(x * 2.4);
  float dC = (y - yc) / 1.05;
  float cape = smoothstep(-0.5 * px, 0.5 * px, dC);
  float lineC = line(dC, 0.008, px) * detail;
  // fins: the dorsal fin above the back line, the flipper below the belly, the flukes
  float inFin = max(step(1.0, y) * step(1.15, x) * step(x, 2.05),
                max(step(y, 0.0) * step(2.25, x) * step(x, 2.85), step(x, 0.22 + 0.1 * (y - 0.5) * (y - 0.5))));
  float finLine = 0.0;
  finLine = max(finLine, line(y - 1.0, 0.007, px) * step(1.22, x) * step(x, 1.97) * step(0.0, edgeT(x) - 0.01));
  finLine = max(finLine, line(y + 0.01 * sin((x - 2.3) * 9.0), 0.007, px) * step(2.3, x) * step(x, 2.8) * step(0.0, -edgeB(x) - 0.01));
  float fb = 0.22 + 0.1 * (y - 0.5) * (y - 0.5);
  finLine = max(finLine, line(x - fb, 0.007, px) * step(0.08, y) * step(y, 0.92));
  finLine *= detail;
  // eye, mouth, blowhole
  float dEye = length(vec2(x - 2.63, y - 0.56));
  float rE = 0.052;
  float eyeW = fill(dEye - rE, px) * detail;
  float eyeP = fill(dEye - rE * 0.52, px) * detail;
  float eyeL = line(dEye - rE, 0.008, px) * detail;
  float ym = 0.285 - 0.05 * smoothstep(3.05, 2.72, x) + 0.03 * smoothstep(2.82, 2.70, x);
  float lineM = line(y - ym, 0.008, px) * step(2.70, x) * step(x, 3.0 + edgeE(ym) - 0.04) * detail;
  float dBh = length(vec2(x - 2.36, y - 0.93) * vec2(1.0, 2.2));
  float lineH = line(dBh - 0.035, 0.007, px) * step(y, 0.93) * detail;
  // engraved shading that follows the body
  float hs = 0.045;
  float hh = abs(fract((y - yc) / hs) - 0.5) * hs;
  float hl = smoothstep(2.0, 4.0, hs / px);

  // ---- tone and colour
  float backL = fam < 0.5 ? 0.40 : 0.13;
  float bellyL = fam < 0.5 ? 0.96 : 0.74;
  vec3 backC = fam < 0.5 ? vec3(0.33, 0.44, 0.52) : vec3(0.52, 0.30, 0.21);
  vec3 bellyC = fam < 0.5 ? vec3(0.93, 0.90, 0.82) : vec3(0.90, 0.77, 0.58);
  float lit = mix(bellyL, backL, cape);
  vec3 col = mix(bellyC, backC, cape);
  // lithograph: the cape is engraved with lines, the belly lightly shaded toward the cape
  float engr = line(hh, 0.012 + 0.008 * fam, px) * hl * cape;
  float capeL = mix(backL, mix(backL + 0.32, backL - 0.08, engr), hl);
  float shade = (1.0 - cape) * smoothstep(-0.25, 0.0, dC) * 0.12;
  lit = mix(bellyL - shade, capeL, cape);
  col *= 1.0 - 0.10 * inFin;
  lit -= 0.06 * inFin * (1.0 - cape);
  float pale = fam < 0.5 ? 0.0 : 1.0;
  lit = mix(lit, 0.08, max(lineC, finLine * (1.0 - cape)));
  col = mix(col, INK, max(lineC, finLine) * 0.8);
  lit = mix(lit, mix(0.08, 0.75, cape), max(finLine * cape, lineH));
  lit = mix(lit, 0.08, lineM);
  col = mix(col, INK, lineM);
  lit = mix(lit, 0.97, eyeW); col = mix(col, vec3(0.97, 0.95, 0.89), eyeW);
  lit = mix(lit, 0.05, max(eyeP, eyeL)); col = mix(col, INK, max(eyeP, eyeL));
  lit = mix(lit, 0.04, lineO);
  col = mix(col, INK, lineO);

  // ---- far toward the centre a whole ring is smaller than a pixel: average it
  float lod = smoothstep(1.4, 3.5, 1.0 / px);
  float meanL = 0.52;
  vec3 meanC = vec3(0.58, 0.55, 0.52);
  lit = mix(meanL, lit, lod);
  col = mix(meanC, col, lod);

  // ---- the construction: the square subdivision, in red
  float red = 0.0;
  if (uReveal > 0.0) {
    float px0 = pxl0;
    float frameD = min(min(abs(l0.y), abs(l0.y - 1.0)), min(abs(l0.x), abs(l0.x - 3.0)));
    float solid = line(frameD, 0.016, px0);
    float dashP = fract(l0.y * 4.0);
    float dashA = smoothstep(0.0, 0.08, dashP) * (1.0 - smoothstep(0.55, 0.63, dashP));
    float inner = line(min(abs(l0.x - 1.0), abs(l0.x - 2.0)), 0.010, px0) * dashA;
    float lodR = smoothstep(2.0, 6.0, 1.0 / px0);
    red = max(solid, inner * 0.9) * uReveal * lodR;
  }

  // ---- paper grain
  float g = vnoise(fc * 0.55 / uDpr) - 0.5;
  float gw = hash12(fc) - 0.5;
  float blot = vnoise(fc * 0.012 / uDpr) - 0.5;
  vec3 colour = col + g * 0.025 + gw * 0.02;
  float v = clamp(lit + g * 0.07 + gw * 0.05 + blot * 0.05 * (1.0 - lit), 0.0, 1.0);
  vec3 litho = mix(INK, PAPER, v);
  gl_FragColor = vec4(mix(mix(colour, litho, uLitho), RED, red), 1.0);
}
`;
