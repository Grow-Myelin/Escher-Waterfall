// Shaders. Colours are written in display space, as in the Waterfall.
//
// Every hand vertex goes through the same steps (handMotion):
//  1. the drawing motion: a slide along the arm and a turn about a pivot in
//     the wrist, rigid for the whole hand and its pencil;
//  2. pressing into the paper: behind the wrist, heights are scaled down to
//     zero, so the arm becomes the flat drawing it grows out of.

export const COMMON = /* glsl */ `
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
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
// paper: warm, with fibres and a fine tooth (screen-space grain on top)
vec3 paperColour(vec2 wxy, vec3 paper) {
  float f = fbm(wxy * vec2(0.9, 2.2)) - 0.5;
  float fib = vnoise(wxy * vec2(9.0, 1.4)) - 0.5;
  return paper * (1.0 + f * 0.035 + fib * 0.02);
}
float grain() {
  return (vnoise(gl_FragCoord.xy * 0.6) - 0.5) * 0.05 + (hash12(gl_FragCoord.xy) - 0.5) * 0.04;
}
`;

export const MOTION = /* glsl */ `
attribute float aFing;  // how much a vertex follows the pencil (1 for the pencil)
uniform vec3 uPenW;     // the pencil turns about where it rests in the hand
uniform mat3 uPenR;     // ... by this rotation
uniform vec3 uPenS;     // ... and slides along itself by this
uniform vec4 uMotion;   // hand: turn (rad), slide (cm), lift (cm), unused
uniform vec2 uPivot;    // pivot of the turn, hand frame
uniform vec2 uFlat;     // the arm rises out of the paper between these x
uniform mat4 uPlace;    // hand frame -> world
vec3 nRound; // the normal before pressing flat: the arm still shades as round
vec3 handMotion(vec3 p, inout vec3 n, out float f) {
  // fingers move the pencil
  vec3 pf = uPenW + uPenR * (p - uPenW) + uPenS;
  p = mix(p, pf, aFing);
  n = normalize(mix(n, uPenR * n, aFing));
  // the hand slides and turns
  vec3 q = p + vec3(uMotion.y, 0.0, 0.0);
  vec2 r = q.xy - uPivot;
  float cs = cos(uMotion.x), sn = sin(uMotion.x);
  q.xy = uPivot + vec2(cs * r.x - sn * r.y, sn * r.x + cs * r.y);
  n.xy = vec2(cs * n.x - sn * n.y, sn * n.x + cs * n.y);
  q.z += uMotion.z * smoothstep(uFlat.x, uFlat.y + 2.0, q.x);
  nRound = n;
  // press flat: z -> z·f(x); the normal follows the inverse transpose
  float w = uFlat.y - uFlat.x;
  float t = clamp((q.x - uFlat.x) / w, 0.0, 1.0);
  f = t * t * (3.0 - 2.0 * t);
  float df = 6.0 * t * (1.0 - t) / w;
  float z = max(q.z, 0.0);
  n = vec3(f * n.x - z * df * n.z, f * n.y, n.z);
  q.z = z * f;
  return q;
}
`;

// ---------------------------------------------------------------- hand + pencil
export const HAND_VS = /* glsl */ `
attribute float aAO;
attribute float aNail;
attribute float aMat;
varying vec3 vN;
varying vec3 vRest;
varying vec3 vW;
varying float vF;
varying float vAO;
varying float vNail;
varying float vMat;
${MOTION}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vN = normalize(mat3(uPlace) * nRound);
  vRest = position;
  vW = wp.xyz;
  vF = f;
  vAO = aAO;
  vNail = aNail;
  vMat = aMat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const HAND_FS = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uView;
uniform float uLitho;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec3 vN;
varying vec3 vRest;
varying vec3 vW;
varying float vF;
varying float vAO;
varying float vNail;
varying float vMat;
${COMMON}

// hatching lines along coordinate s (in line spacings); w = half-width fraction.
// Families that are badly resolved on screen fade out.
float hfam(float s, float w, out float ok) {
  float fw = fwidth(s);
  ok = smoothstep(0.05, 0.12, fw) * (1.0 - smoothstep(0.5, 0.8, fw));
  float d = abs(fract(s) - 0.5);       // distance from the line at the middle of each period
  float aa = fw * 0.75 + 1e-4;
  float line = (1.0 - smoothstep(w - aa, w + aa, d)) * smoothstep(0.0, aa, w);
  return mix(2.0 * w, line, smoothstep(0.55, 0.3, fw));
}

void main() {
  // Where the arm sinks into the paper the solid thins out into the paper
  // like crayon, in a fine stipple.
  float solidity = smoothstep(0.06, 0.42, vF);
  float st = hash12(floor(gl_FragCoord.xy)) * 0.7 + hash12(floor(gl_FragCoord.xy * 0.5) + 7.0) * 0.3;
  if (vMat < 0.5 && st > solidity * 1.02) discard;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLight);
  float wrap = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
  float diff = clamp(ndl, 0.0, 1.0);
  float ao = mix(1.0, vAO, 0.6);
  vec3 h = normalize(uLight + uView);
  float rim = pow(1.0 - clamp(dot(n, uView), 0.0, 1.0), 3.0);

  vec3 alb;
  float gloss = 0.0;
  if (vMat < 0.5) { alb = vec3(0.91, 0.76, 0.64); gloss = 0.14; }
  else if (vMat < 1.5) { alb = vec3(0.84, 0.64, 0.27); gloss = 0.55; }
  else if (vMat < 2.5) { alb = vec3(0.88, 0.75, 0.56); }
  else { alb = vec3(0.2, 0.2, 0.22); gloss = 0.4; }
  float fn = max(fwidth(vNail), 1e-3);
  float nail = (1.0 - smoothstep(-fn, fn, vNail)) * step(vMat, 0.5);
  alb = mix(alb, vec3(0.96, 0.84, 0.79), nail * 0.85);
  gloss = mix(gloss, 0.6, nail);
  float nailEdge = (1.0 - smoothstep(0.0, fn * 1.5, abs(vNail + 0.01))) * step(vMat, 0.5);

  float light = (0.1 + 0.9 * mix(wrap * wrap, diff, 0.72)) * ao + 0.05 * rim;
  float spec = pow(max(dot(n, h), 0.0), 26.0) * gloss;
  vec3 colour = alb * (0.22 + 0.86 * light) + spec * vec3(1.0, 0.97, 0.9);
  colour *= 1.0 - 0.3 * nailEdge;

  // ---- lithograph: crayon tone that keeps the paper as its highlight,
  // with hatching that goes round the form in the shadows
  float t = clamp(light * lum(alb) / 0.79 + spec * 0.7, 0.0, 1.0);
  float tv = smoothstep(0.0, 0.86, t);
  float dk = 1.0 - t;
  vec3 hp = vRest;
  float ok1, ok2, ok3;
  float s1 = dot(hp, normalize(vec3(0.95, 0.2, 0.3))) / 0.11;
  float s2 = dot(hp, normalize(vec3(-0.3, 0.9, 0.35))) / 0.12;
  float s3 = (gl_FragCoord.x * 0.6 - gl_FragCoord.y * 0.8) / 3.6;
  float w1 = clamp(dk * 0.62 - 0.11, 0.0, 0.4);
  float w2 = clamp(dk * 0.66 - 0.38, 0.0, 0.4);
  float w3 = clamp(dk * 0.7 - 0.52, 0.0, 0.4);
  float h1 = hfam(s1, w1, ok1);
  float h2 = hfam(s2, w2, ok2);
  float h3 = hfam(s3, w3, ok3);
  float hh = 1.0 - (1.0 - h1 * ok1 - (1.0 - ok1) * 2.0 * w1) * (1.0 - h2 * ok2 - (1.0 - ok2) * 2.0 * w2) * (1.0 - h3);
  float g = grain();
  float v = mix(1.0, tv, 0.86) * (1.0 - 0.42 * hh) + g * 1.3;
  v *= 1.0 - 0.35 * nailEdge;
  vec3 litho = mix(uInk, uPaper, clamp(v, 0.0, 1.0));
  vec3 col = mix(colour + g * 0.6, litho, uLitho);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------- outline hull
export const HULL_VS = /* glsl */ `
uniform float uWidth;   // px
uniform vec2 uRes;      // px
varying float vF;
${MOTION}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vec3 wn = normalize(mat3(uPlace) * n);
  vec4 c = projectionMatrix * viewMatrix * wp;
  vec4 cn = projectionMatrix * viewMatrix * vec4(wp.xyz + wn, 1.0);
  vec2 dir = cn.xy / cn.w - c.xy / c.w;
  float l = length(dir);
  dir = l > 1e-6 ? dir / l : vec2(0.0);
  float wpx = uWidth * (0.45 + 0.55 * smoothstep(0.3, 0.85, f)) * smoothstep(0.08, 0.3, f);
  c.xy += dir * wpx * 2.0 / uRes * c.w;
  c.z += 0.0009 * c.w; // just behind the surface, so it shows only at silhouettes
  vF = f;
  gl_Position = c;
}
`;

export const HULL_FS = /* glsl */ `
uniform vec3 uInkC;
varying float vF;
${COMMON}
void main() {
  // the outline thins out with the form, in the same stipple
  float solidity = smoothstep(0.06, 0.42, vF);
  float st = hash12(floor(gl_FragCoord.xy)) * 0.7 + hash12(floor(gl_FragCoord.xy * 0.5) + 7.0) * 0.3;
  if (st > solidity * 1.02) discard;
  gl_FragColor = vec4(uInkC, 1.0);
}
`;

// ---------------------------------------------------------------- shadows
// The hands are squashed onto the paper along the light (shCast shadow, red)
// and straight down (contact shade, green); the paper reads both, blurred.
export const SHADOW_VS = /* glsl */ `
uniform vec3 uLight;
uniform float uMode;    // 0: shCast along the light, 1: straight down
varying float vH;
varying float vF;
${MOTION}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vH = wp.z;
  vF = f;
  vec3 p = wp.xyz;
  p.xy -= uMode < 0.5 ? uLight.xy * (p.z / uLight.z) : vec2(0.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(p.xy, 0.0, 1.0);
}
`;

export const SHADOW_FS = /* glsl */ `
uniform float uMode;
varying float vH;
varying float vF;
void main() {
  if (vF < 0.5) discard;
  float shCast = (0.8 - 0.5 * smoothstep(0.0, 9.0, vH)) * smoothstep(0.5, 0.9, vF);
  float contact = (1.0 - smoothstep(0.0, 1.1, vH)) * smoothstep(0.5, 0.9, vF);
  gl_FragColor = uMode < 0.5 ? vec4(shCast, 0.0, 0.0, 1.0) : vec4(0.0, contact, 0.0, 1.0);
}
`;

// ---------------------------------------------------------------- paper
export const PAPER_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const PAPER_FS = /* glsl */ `
uniform sampler2D uShadow;
uniform vec4 uShadowRect;   // x0, y0, width, height (world)
uniform vec2 uShadowTexel;
uniform vec3 uPaper;
uniform vec2 uSheet;        // half size of the sheet
varying vec3 vW;
${COMMON}
void main() {
  vec2 uv = (vW.xy - uShadowRect.xy) / uShadowRect.zw;
  // soft shCast shadow: a ring of taps, wider than the contact shade
  float shCast = 0.0, contact = 0.0;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 2.39996;
    float r = sqrt((float(i) + 0.5) / 12.0);
    vec2 o = vec2(cos(a), sin(a)) * r;
    shCast += texture2D(uShadow, uv + o * uShadowTexel * 9.0).r;
    contact += texture2D(uShadow, uv + o * uShadowTexel * 3.0).g;
  }
  shCast /= 12.0; contact /= 12.0;
  vec3 c = paperColour(vW.xy, uPaper);
  c *= 1.0 - 0.42 * shCast - 0.3 * contact;
  // the sheet's edge, seen when the camera turns away
  vec2 e = abs(vW.xy) - uSheet;
  float inside = 1.0 - smoothstep(-0.02, 0.02, max(e.x, e.y));
  vec3 desk = vec3(0.36, 0.31, 0.26) * (0.9 + 0.1 * vnoise(vW.xy * 0.4));
  c = mix(desk, c, inside);
  gl_FragColor = vec4(c + grain(), 1.0);
}
`;

// ---------------------------------------------------------------- strokes
export const STROKE_VS = /* glsl */ `
attribute float aSide;
attribute float aTime;
attribute float aArc;
attribute float aWeight;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
void main() {
  vSide = aSide; vTime = aTime; vArc = aArc; vWeight = aWeight;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWxy = wp.xy;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const STROKE_FS = /* glsl */ `
uniform float uNow;
uniform float uFade;
uniform vec3 uGraphite;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
${COMMON}
void main() {
  float shown = smoothstep(vTime - 0.02, vTime + 0.02, uNow);
  if (shown <= 0.0) discard;
  float fs = fwidth(vSide);
  float edge = 1.0 - smoothstep(1.0 - fs * 1.5, 1.0 + fs * 0.5, abs(vSide));
  // graphite catches on the paper's tooth
  float tooth = vnoise(vWxy * 22.0) * 0.6 + vnoise(vWxy * 61.0) * 0.4;
  float a = edge * vWeight * (0.72 + 0.4 * tooth) * shown * uFade;
  a *= 0.85 + 0.15 * sin(vArc * 7.0);
  gl_FragColor = vec4(uGraphite, clamp(a, 0.0, 1.0));
}
`;
