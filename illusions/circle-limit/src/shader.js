// The whole picture is one fragment shader.
//
// Each pixel z of the disk is moved by the current Möbius map M, then folded
// into the fundamental triangle T of the {p,q} tiling by reflections:
// rotations about the centre and one reflection put it in the wedge
// 0 ≤ arg ≤ π/p, then an inversion in the circle of side BC pushes it back
// toward the centre; repeat until it stays. The parity of the reflections
// picks which mirror image of T the pixel was in. Unfolding odd pixels once
// more lands every pixel, by a rotation of the tiling, in the kite D, where
// the fish are drawn.

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uR;            // disk radius, device px
uniform vec4 uM0, uM1;       // Möbius map: a, b | c, d
uniform vec4 uA0, uA1, uA2, uA3;
uniform vec4 uB0, uB1, uB2, uB3;
uniform float uMix;          // cross-fade from tiling A to tiling B
uniform float uTime;
uniform float uLitho;
uniform float uReveal;
uniform float uBack;
uniform float uDpr;
uniform float uZoom;        // debug magnifier, 1 normally

const float PI = 3.14159265359;
const vec3 PAPER = vec3(0.925, 0.898, 0.835);
const vec3 PAPER_C = vec3(0.914, 0.902, 0.863);
const vec3 INK = vec3(0.11, 0.10, 0.09);
const vec3 RED = vec3(0.64, 0.23, 0.16);

float atanh_(float x) { x = clamp(x, -0.9999999, 0.9999999); return 0.5 * log((1.0 + x) / (1.0 - x)); }
float asinh_(float x) { return sign(x) * log(abs(x) + sqrt(x * x + 1.0)); }
float sinh_(float x) { float e = exp(x); return 0.5 * (e - 1.0 / e); }
float cosh_(float x) { float e = exp(x); return 0.5 * (e + 1.0 / e); }
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b) { return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / dot(b, b); }
vec2 crot(vec2 z, float a) { float c = cos(a), s = sin(a); return vec2(c * z.x - s * z.y, s * z.x + c * z.y); }

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

// Coverage of a line of half-width w at distance d; px is the pixel size, all
// in the same units. Lines thinner than a pixel fade rather than vanish.
float line(float d, float w, float px) {
  float ww = max(w, 0.5 * px);
  return clamp((ww - abs(d)) / px + 0.5, 0.0, 1.0) * min(1.0, w / (0.5 * px));
}
// coverage of the region d < 0
float fill(float d, float px) { return clamp(0.5 - d / px, 0.0, 1.0); }

// Fermi coordinates about the geodesic L that crosses the positive real axis
// at right angles at xX: t is arc length along L (positive counterclockwise
// about the origin), h the signed distance from L (positive toward the origin).
vec2 fermi(vec2 u, float xX) {
  vec2 v = cdiv(u - vec2(xX, 0.0), vec2(1.0 - xX * u.x, -xX * u.y));
  float a = v.x, b = v.y;
  float t = 0.5 * log(((1.0 + b) * (1.0 + b) + a * a) / ((1.0 - b) * (1.0 - b) + a * a));
  float h = asinh_(-2.0 * a / max(1.0 - dot(v, v), 1e-7));
  return vec2(t, h);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
// fin profile: steep convex leading edge, long concave trailing edge
float finShape(float f) {
  f = clamp(f, 0.0, 1.0);
  return f < 0.3 ? pow(sin(1.5707963 * f / 0.3), 0.8) : 1.0 - pow((f - 0.3) / 0.7, 0.6);
}
// A fish in its own coordinates: u along the swim (snout at +0.93, tail tips
// near −1.1), v across (back positive), in units of the fish height scale.
// Returns (silhouette, body without fins), negative inside; not true distances.
vec2 fishSDF(float u, float v, float sw) {
  float x = clamp((u + 0.62) / 1.55, 0.0, 1.0);    // 0 at the tail stalk, 1 at the snout
  float fr = clamp((x - 0.42) / 0.58, 0.0, 1.0);
  float bk = clamp((0.42 - x) / 0.42, 0.0, 1.0);
  float prof = x > 0.42 ? pow(1.0 - fr * fr, 0.95) : pow(1.0 - bk * bk, 0.75);
  float hb = 0.06 * (1.0 - fr * fr) + 0.255 * prof;
  float vb = v - 0.03 * sin(PI * x) + 0.035 * fr * fr + 0.25 * sw * bk * bk;
  float dB = abs(vb) - hb;
  dB = max(dB, max(-0.66 - u, u - 0.93));
  // forked tail, swishing
  float tt = clamp((-0.58 - u) / 0.48, 0.0, 1.0);
  float vs = v - sw * (0.3 + tt * tt);
  float lc = 0.05 + 0.30 * pow(tt, 1.1);
  float lw = 0.075 + 0.035 * sin(PI * tt) - 0.07 * tt * tt * tt;
  float dT = abs(abs(vs) - lc) - lw;
  dT = max(dT, max(u + 0.52, -1.07 - u));
  // dorsal, anal and pelvic fins
  float dD = max(v - (0.27 + 0.20 * finShape((0.28 - u) / 0.62)), max(0.12 - v, max(u - 0.28, -0.34 - u)));
  float dA = max(-v - (0.21 + 0.15 * finShape((-0.05 - u) / 0.42)), max(v + 0.10, max(u + 0.05, -0.47 - u)));
  float dP = max(-v - (0.24 + 0.10 * finShape((0.42 - u) / 0.22)), max(v + 0.10, max(u - 0.42, 0.20 - u)));
  float dF = min(min(dT, dD), min(dA, dP));
  return vec2(smin(dB, dF, 0.02), dB);
}

vec3 gCol;     // colour rendering
float gLit;    // lithograph grey, 0 ink .. 1 paper
float gRed;    // coverage of the red construction lines, drawn over either rendering

void pattern(vec2 w, float pxh, vec4 P0, vec4 P1, vec4 P2, vec4 P3) {
  float p = P0.x, q = P0.y, seg = P0.z, hf = P0.w;
  float cx = P1.x, cr2 = P1.y, xB = P1.z, ell = P1.w;
  float dp = P2.x, dq = P2.y, xXp = P2.z, xXq = P2.w;
  float cr = P3.z;

  // where a whole fish is under a pixel or two, show the average
  vec3 lightC = vec3(0.80, 0.66, 0.46), darkC = vec3(0.22, 0.31, 0.36);
  float wl = dp / (dp + dq);
  vec3 meanC = mix(darkC, lightC, wl);
  float meanL = mix(0.22, 0.78, wl);
  float meanR = 0.62;
  float lod = smoothstep(0.8, 2.4, ell / pxh);
  if (lod <= 0.0) {
    gCol = mix(meanC, vec3(meanR), uReveal);
    gLit = mix(meanL, meanR, uReveal);
    gRed = 0.0;
    return;
  }

  // ---- fold into T
  vec2 z = w;
  float par = 0.0;
  for (int i = 0; i < 96; i++) {
    float a = atan(z.y, z.x);
    float r = length(z);
    a -= seg * floor(a / seg);
    if (a > hf) { a = seg - a; par += 1.0; }
    z = r * vec2(cos(a), sin(a));
    vec2 d = z - vec2(cx, 0.0);
    float dd = dot(d, d);
    if (dd >= cr2) break;
    z = vec2(cx, 0.0) + d * (cr2 / dd);
    par += 1.0;
  }
  bool odd = mod(par, 2.0) > 0.5;

  // ---- into the kite D, then into the frame of the ring this pixel is in
  vec2 zf = odd ? crot(vec2(z.x, -z.y), 2.0 * hf) : z;
  vec2 wp = crot(zf, -hf);
  float cL = 0.5 * (xXp + 1.0 / xXp), RL = 0.5 * (1.0 / xXp - xXp);
  vec2 dl = wp - vec2(cL, 0.0);
  bool isP = dot(dl, dl) > RL * RL;
  vec2 u;
  float n, D, xX;
  if (isP) { u = wp; n = p; D = dp; xX = xXp; }
  else { u = -cdiv(wp - vec2(xB, 0.0), vec2(1.0 - xB * wp.x, -xB * wp.y)); n = q; D = dq; xX = xXq; }

  // ---- ring frame: polar coordinates about the ring centre
  float rho = 2.0 * atanh_(length(u));
  float Wsig = max(sinh_(rho) * PI / n, 1e-5);    // hyperbolic length per unit of sg
  float th = atan(u.y, u.x);
  vec2 fs = fermi(u, xX);                          // about the lane L of this slice

  // the carousel: an annulus between the medallion and the inscribed circle
  float Dn = D / ell;
  float rm = clamp(Dn - 0.80, 0.19, 4.0) * ell;   // medallion radius
  float rOut = D - 0.045 * ell;
  float thick = rOut - rm;
  float rMid = 0.5 * (rm + rOut);
  float len = 2.03 * sinh_(rMid) * PI / n;
  float Hf = min(thick / 0.94, len / (2.05 * 0.62)); // fish height scale
  float ph = uTime * 3.2 + (isP ? 0.0 : 1.7);
  float sw = 0.045 * sin(ph);

  // every fish of the ring turns about the centre; one fish length every few seconds
  float turn = uTime * 0.11 * (isP ? 1.0 : 1.35) * (6.0 / n);
  float sg = (th - turn * PI / n * 2.0) * n / PI;
  float k = floor((sg + 1.0) * 0.5);
  float so = sg - 2.0 * k;
  float v = (rho - rMid) / Hf;

  // the fish ahead may reach back into this window with its tail
  vec2 f0 = fishSDF(so, v, sw);
  vec2 f1 = fishSDF(so - 2.0, v, sw);
  if (f1.x < f0.x) { so -= 2.0; f0 = f1; }
  float e = 0.004;
  vec2 fu = fishSDF(so + e, v, sw), fv = fishSDF(so, v + e, sw);
  vec2 gS = vec2((fu.x - f0.x) / (e * Wsig), (fv.x - f0.x) / (e * Hf));
  vec2 gB = vec2((fu.y - f0.y) / (e * Wsig), (fv.y - f0.y) / (e * Hf));
  float dS = f0.x / max(length(gS), 1e-4);         // to the silhouette, hyperbolic
  float dB = f0.y / max(length(gB), 1e-4);         // to the body (fins excluded)
  float inFish = fill(dS, pxh);
  float inBody = fill(dB, pxh) * inFish;
  float fin = inFish * (1.0 - inBody);
  float lineO = line(dS, 0.020 * Hf, pxh);
  float lineB = line(dB, 0.011 * Hf, pxh) * inFish * step(0.0, -dS - 0.03 * Hf);

  // eye, gill cover, mouth, lateral line (in the fish's own coordinates)
  float rE = 0.062 * Hf;
  float dEye = length(vec2((so - 0.56) * Wsig, (v - 0.06) * Hf));
  float gill = 0.36 - 0.30 * (v / 0.26) * (v / 0.26);
  float lineG = line((so - gill) * Wsig, 0.010 * Hf, pxh) * step(abs(v), 0.25) * inBody;
  float lineM = line((v + 0.04 + 0.5 * pow(max(0.0, so - 0.78), 2.0)) * Hf, 0.009 * Hf, pxh) * step(0.76, so) * inBody;
  float lat = 0.035 + 0.05 * sin(PI * clamp((so + 0.6) / 1.0, 0.0, 1.0));
  float lineL = line((v - lat) * Hf, 0.006 * Hf, pxh) * step(-0.55, so) * step(so, gill - 0.05) * inBody;

  // fin rays and scales
  float rayU = abs(fract(so / 0.05) - 0.5) * 0.05 * Wsig;
  float tt = clamp((-0.58 - so) / 0.48, 0.0, 1.0);
  float fanA = (v - sw * tt * tt) / max(0.12 + (-0.58 - so), 0.05);
  float rayT = abs(fract(fanA * 3.0) - 0.5) / 3.0 * max(0.12 + (-0.58 - so), 0.05) * Hf;
  float ray = so < -0.58 ? rayT : rayU;
  float rayLod = smoothstep(2.0, 5.0, 0.05 * Wsig / pxh);
  float lineR = line(ray, 0.006 * Hf, pxh) * fin * rayLod * step(0.0, -dS - 0.035 * Hf);
  float sc = 0.085 * Hf;
  vec2 gq = vec2(so * Wsig / sc, v * Hf / (sc * 0.8));
  float row = floor(gq.y);
  gq.x += 0.5 * mod(row, 2.0);
  float dSc = abs(length(fract(gq) - vec2(1.0, 0.5)) - 0.5) * sc;
  float scLod = smoothstep(2.5, 6.0, sc / pxh);
  float lineS = line(dSc, 0.006 * Hf, pxh) * inBody * step(so, gill - 0.04) * step(0.0, -dB - 0.025 * Hf) * scLod;

  // ---- the medallion: a starfish of n arms
  float rs = rm * 0.82;
  float rr = rho / rs;
  float ca = th - 0.45 * rr * rr;
  float arm = pow(0.5 + 0.5 * cos(n * ca), 1.4);
  float sdStar = rho - rs * (0.30 + 0.70 * arm);
  float inStar = fill(sdStar, pxh);
  float lineSt = line(sdStar, 0.010 * ell, pxh);
  float dsp = 0.05 * ell;
  vec2 gd = vec2(ca * sinh_(rho) / dsp, rho / dsp);
  gd.x += 0.5 * mod(floor(gd.y), 2.0);
  float dDot = length(fract(gd) - 0.5) * dsp;
  float dots = fill(dDot - 0.17 * dsp, pxh) * inStar * smoothstep(2.5, 5.0, dsp / pxh) * step(rr, 0.9);

  // ---- water: ripples round the ring centre
  float rsp = (isP ? 0.05 : 0.07) * ell;
  float rip = abs(fract(rho / rsp) - 0.5) * rsp;
  float lineW = line(rip, 0.005 * ell, pxh) * smoothstep(2.5, 6.0, rsp / pxh) * (1.0 - inFish) * (1.0 - inStar);

  // ---- tone (lithograph) and colour
  float vert = clamp(v / 0.3 * 0.5 + 0.5, 0.0, 1.0);    // 0 belly .. 1 back
  float hs = 0.035 * ell;
  float hl = smoothstep(2.2, 4.5, hs / pxh);
  float hatch = abs(fract(rho / hs) - 0.5) * 2.0;        // follows the curve of the swim
  gRed = 0.0;
  vec3 col;
  float lit;
  if (isP) {
    // dark water, pale fish
    lit = 0.13; col = vec3(0.14, 0.25, 0.30);
    lit = mix(lit, 0.42, lineW); col = mix(col, vec3(0.28, 0.42, 0.46), lineW);
    float sl = mix(0.80, 0.30, dots);
    vec3 scl = mix(vec3(0.86, 0.52, 0.36), vec3(0.58, 0.27, 0.17), dots);
    lit = mix(lit, sl, inStar); col = mix(col, scl, inStar);
    float dark = smoothstep(0.55, 1.0, vert) * 0.45 * inBody + 0.12 * fin;
    float h = 1.0 - smoothstep(dark - 0.12, dark + 0.12, hatch);
    float fl = mix(0.96 - dark * 0.4, 0.96 - h * 0.7, hl);
    vec3 fc = mix(vec3(0.94, 0.85, 0.66), vec3(0.80, 0.60, 0.36), smoothstep(0.45, 1.0, vert));
    fc = mix(fc, vec3(0.86, 0.72, 0.52), fin);
    lit = mix(lit, fl, inFish); col = mix(col, fc, inFish);
    float lines = max(max(lineB, lineG), max(max(lineM, lineL), max(lineR * 0.8, lineS * 0.6)));
    lit = mix(lit, 0.08, lines); col = mix(col, INK, lines * 0.85);
  } else {
    // pale water, dark fish
    lit = 0.95; col = vec3(0.84, 0.87, 0.81);
    lit = mix(lit, 0.45, lineW * 0.7); col = mix(col, vec3(0.55, 0.64, 0.62), lineW * 0.7);
    float sl = mix(0.34, 0.80, dots);
    vec3 scl = mix(vec3(0.68, 0.36, 0.22), vec3(0.93, 0.80, 0.62), dots);
    lit = mix(lit, sl, inStar); col = mix(col, scl, inStar);
    float fl = mix(0.13, 0.20, 1.0 - vert);
    fl = mix(fl, 0.36, fin);
    vec3 fc = mix(vec3(0.66, 0.30, 0.20), vec3(0.42, 0.16, 0.10), smoothstep(0.3, 1.0, vert));
    fc = mix(fc, vec3(0.74, 0.42, 0.28), fin);
    lit = mix(lit, fl, inFish); col = mix(col, fc, inFish);
    float pale = max(max(lineG, lineM), max(lineL, max(lineR * 0.8, lineS * 0.75)));
    lit = mix(lit, 0.80, pale); col = mix(col, vec3(0.95, 0.86, 0.72), pale * 0.75);
    lit = mix(lit, 0.06, lineB * 0.8); col = mix(col, INK, lineB * 0.7);
  }
  lit = mix(lit, 0.08, lineSt); col = mix(col, INK, lineSt);

  // eye: white with a dark pupil
  float eyeW = fill(dEye - rE, pxh) * inFish;
  float eyeP = fill(dEye - rE * 0.5, pxh) * inFish;
  float eyeL = line(dEye - rE, 0.012 * Hf, pxh) * inFish;
  lit = mix(lit, 0.97, eyeW); col = mix(col, vec3(0.97, 0.95, 0.89), eyeW);
  lit = mix(lit, 0.05, max(eyeP, eyeL)); col = mix(col, INK, max(eyeP, eyeL));

  // the fish's outline
  lit = mix(lit, 0.04, lineO);
  col = mix(col, INK, lineO);
  float lineI = lineO;

  // ---- the lanes: geodesics through consecutive edge midpoints
  float hL = abs(fs.y);
  float bw = 0.030 * ell;
  float edgeL = line(hL - bw, 0.011 * ell, pxh);
  float whiteL = fill(hL - bw, pxh);
  float plain = line(hL, 0.016 * ell, pxh);
  lit = mix(lit, mix(0.04, 1.0, whiteL * (1.0 - edgeL)), max(whiteL, edgeL) * uBack);
  col = mix(col, mix(INK, vec3(0.97, 0.95, 0.90), whiteL * (1.0 - edgeL)), max(whiteL, edgeL) * uBack);
  lit = mix(lit, 0.04, plain * (1.0 - uBack));
  col = mix(col, INK, plain * (1.0 - uBack));

  // ---- the construction (Coxeter's figure): triangles, mirrors, polygons
  if (uReveal > 0.0) {
    float q2 = max(1.0 - dot(z, z), 1e-7);
    float m1 = asinh_(2.0 * z.y / q2);
    float m2 = asinh_(2.0 * abs(-sin(hf) * z.x + cos(hf) * z.y) / q2);
    vec2 dc = z - vec2(cx, 0.0);
    float m3 = asinh_(abs(dot(dc, dc) - cr2) / (cr * q2));
    float tri = odd ? 0.52 : 0.97;
    vec3 rc = vec3(tri) * vec3(1.0, 0.985, 0.95);
    float rl = tri;
    float ghost = lineO * 0.25;
    rl = mix(rl, 0.1, ghost); rc = mix(rc, INK, ghost);
    float mir = line(min(m1, m2), 0.006 * ell, pxh) * 0.7;
    float poly = line(m3, 0.024 * ell, pxh);
    rl = mix(rl, 0.08, max(mir, poly)); rc = mix(rc, INK, max(mir, poly));
    // dashes symmetric about the lane's midpoint X, with a gap centred on each
    // edge midpoint C (|t| = ell), so neighbouring segments of a lane agree
    float dP = ell / 4.5;
    float dph = abs(fract(abs(fs.x) / dP + 0.5) - 0.5);
    float dpx = pxh / dP;
    float dash = 1.0 - smoothstep(0.29 - dpx, 0.29 + dpx, dph);
    float lane = line(hL, 0.016 * ell, pxh) * mix(1.0, dash, smoothstep(1.5, 4.0, dP / pxh));
    gRed = lane * uReveal * lod;
    lit = mix(lit, rl, uReveal);
    col = mix(col, rc, uReveal);
  }

  vec3 meanRC = mix(meanC, vec3(meanR), uReveal);
  float meanRL = mix(meanL, meanR, uReveal);
  gCol = mix(meanRC, col, lod);
  gLit = mix(meanRL, lit, lod);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 zc = (fc - 0.5 * uRes) / (uR * uZoom);
  float r2 = dot(zc, zc);
  float r = sqrt(r2);
  float px = 1.0 / (uR * uZoom);
  float inside = clamp((1.0 - r) / px + 0.5, 0.0, 1.0);

  vec3 col = PAPER_C;
  float lit = 1.0;
  float red = 0.0;
  if (r < 1.0) {
    float pxh = 2.0 * px / max(1.0 - r2, 1e-6);
    vec2 a = uM0.xy, b = uM0.zw, c = uM1.xy, d = uM1.zw;
    vec2 w = cdiv(cmul(a, zc) + b, cmul(c, zc) + d);
    float l2 = dot(w, w);
    if (l2 >= 0.999999) w *= 0.9999995 / sqrt(l2);
    pattern(w, pxh, uA0, uA1, uA2, uA3);
    vec3 cA = gCol; float lA = gLit; float rA = gRed;
    if (uMix > 0.0) {
      pattern(w, pxh, uB0, uB1, uB2, uB3);
      cA = mix(cA, gCol, uMix);
      lA = mix(lA, gLit, uMix);
      rA = mix(rA, gRed, uMix);
    }
    red = rA * inside;
    col = mix(col, cA, inside);
    lit = mix(lit, lA, inside);
  }
  // the rim, inked just outside the disk
  float rim = line(r - 1.0 - 1.2 * px * uDpr, 0.7 * px * uDpr, px);
  col = mix(col, INK, rim * 0.9);
  lit = mix(lit, 0.05, rim);

  // paper grain and a little printing unevenness
  float g = vnoise(fc * 0.55 / uDpr) - 0.5;
  float gw = hash12(fc) - 0.5;
  float blot = vnoise(fc * 0.012 / uDpr) - 0.5;
  vec3 colour = col + g * 0.025 + gw * 0.02;
  float v = clamp(lit + g * 0.07 + gw * 0.05 + blot * 0.05 * (1.0 - lit), 0.0, 1.0);
  vec3 litho = mix(INK, PAPER, v);
  gl_FragColor = vec4(mix(mix(colour, litho, uLitho), RED, red), 1.0);
}
`;
