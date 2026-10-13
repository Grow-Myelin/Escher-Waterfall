// The water surface, where the three worlds meet.
//
// For every pixel of the surface: find the rippled normal; split the eye ray
// by the exact Fresnel equations into a reflected and a refracted part; look
// the reflected ray up in the mirror image of the world above (rendered from
// the camera mirrored in the water plane); trace the refracted ray, bent by
// Snell's law, through the water to the fish, the posts or the bottom, with
// light absorbed and scattered along the way.

import * as THREE from 'three';
import { NOISE, LITHO, LITHO_UNIFORMS, WAVES, FRESNEL, LEAF_SDF } from './glsl.js';
import { POND_GLSL, POND } from './world.js';

const FISH = /* glsl */ `
uniform vec3 uFishPos;
uniform vec2 uFishDir;
uniform float uFishPhase;
uniform float uFishTurn;

float sdEll(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// world point -> the fish's own frame (x forward, y up, z to its side),
// bent by the travelling wave of swimming and by the turn it is making
const float FS = 1.3;   // the carp is 1.3 x the unit model: about 1.25 m long
vec3 fishLocal(vec3 wp) {
  vec3 q = (wp - uFishPos) / FS;
  vec3 p = vec3(dot(q.xz, uFishDir), q.y, dot(q.xz, vec2(-uFishDir.y, uFishDir.x)));
  float a = 0.008 + 0.07 * pow(clamp((0.3 - p.x) / 0.85, 0.0, 1.0), 1.5);
  p.z -= a * sin(p.x * 6.5 + uFishPhase) + uFishTurn * p.x * p.x;
  return p;
}

// a carp: deep body, blunt head, forked tail, long dorsal fin, paired fins
float fishSDF(vec3 p, out float fin) {
  float body = sdEll(p - vec3(0.05, 0.0, 0.0), vec3(0.39, 0.115, 0.09));
  float head = sdEll(p - vec3(0.27, -0.008, 0.0), vec3(0.18, 0.085, 0.076));
  float ped = sdEll(p - vec3(-0.27, 0.004, 0.0), vec3(0.19, 0.044, 0.03));
  float d = smin(smin(body, head, 0.05), ped, 0.07);
  // tail fin: a thin fan, forked at the trailing edge
  vec3 t = p - vec3(-0.42, 0.004, 0.0);
  float tx = -t.x;
  float hh = 0.028 + 0.66 * max(tx, 0.0);
  float trail = 0.17 - 0.08 * (1.0 - smoothstep(0.0, 1.0, abs(t.y) / max(hh, 1e-3)));
  float tail = max(max(max(abs(t.y) - hh, -tx) * 0.8, tx - trail), abs(t.z) - 0.006);
  // dorsal fin: tall at the front, sloping back along the spine
  float s = clamp((0.17 - p.x) / 0.36, 0.0, 1.0);
  float back = 0.095 * sqrt(max(0.0, 1.0 - pow((p.x - 0.05) / 0.39, 2.0)));
  float top = back + mix(0.075, 0.018, pow(s, 0.7));
  float dors = max(max(abs(p.x + 0.01) - 0.18, p.y - top), max(back - 0.02 - p.y, abs(p.z) - 0.004));
  // pectoral fins
  vec3 pf = vec3(p.x - 0.19, p.y + 0.07, abs(p.z) - 0.05);
  pf.yz = rot2(1.1) * pf.yz;
  pf.xz = rot2(-0.5) * pf.xz;
  float pec = sdEll(pf - vec3(-0.045, 0.0, 0.0), vec3(0.085, 0.005, 0.042));
  // pelvic and anal fins
  vec3 pv = vec3(p.x + 0.05, p.y + 0.1, abs(p.z) - 0.03);
  pv.yz = rot2(0.5) * pv.yz;
  float pel = sdEll(pv - vec3(-0.03, 0.0, 0.0), vec3(0.05, 0.005, 0.022));
  vec3 an = p - vec3(-0.22, -0.065, 0.0);
  float anal = max(max(abs(an.x) - 0.045, max(an.y, -an.y - 0.05 + an.x * 0.4)), abs(an.z) - 0.004);
  float fins = min(min(tail, dors), min(min(pec, pel), anal));
  fin = step(fins, d);
  return min(d, fins);
}
float fishMap(vec3 wp) { float f; return fishSDF(fishLocal(wp), f) * FS; }
vec3 fishNormal(vec3 wp) {
  vec2 e = vec2(0.0015, -0.0015);
  return normalize(e.xyy * fishMap(wp + e.xyy) + e.yyx * fishMap(wp + e.yyx) + e.yxy * fishMap(wp + e.yxy) + e.xxx * fishMap(wp + e.xxx));
}

// colour and line work on the fish, in its own frame
vec3 fishColour(vec3 p, vec3 n, float fin, out float lines) {
  lines = 0.0;
  float up = clamp(p.y / 0.11 * 0.5 + 0.5, 0.0, 1.0);
  vec3 back = vec3(0.2, 0.19, 0.11), flank = vec3(0.8, 0.6, 0.28), belly = vec3(0.92, 0.86, 0.68);
  vec3 c = mix(belly, flank, smoothstep(0.12, 0.45, up));
  c = mix(c, back, smoothstep(0.55, 0.9, up));
  if (fin > 0.5) {
    c = mix(vec3(0.62, 0.42, 0.26), vec3(0.38, 0.3, 0.2), smoothstep(0.0, 0.2, p.y));
    float ray = abs(fract(atan(p.y, p.x + 0.3) * 18.0) - 0.5);
    lines = (1.0 - smoothstep(0.0, 0.18, ray)) * 0.35;
    return c;
  }
  // scales: offset rows of arcs
  if (p.x < 0.25) {
    vec2 sc = vec2(p.x / 0.03, p.y / 0.024);
    float row = floor(sc.y);
    sc.x += 0.5 * mod(row, 2.0);
    vec2 f = fract(sc) - vec2(0.5, 0.0);
    float arc = abs(length(f * vec2(1.0, 1.25)) - 0.52);
    lines = max(lines, (1.0 - smoothstep(0.0, 0.1, arc)) * 0.4 * smoothstep(0.25, 0.18, p.x));
    c *= 1.0 - 0.12 * smoothstep(0.3, 0.0, fract(sc.y));
  }
  // lateral line, gill cover, eye
  lines = max(lines, (1.0 - smoothstep(0.0, 0.004, abs(p.y - 0.006 - 0.03 * p.x))) * 0.55 * step(p.x, 0.24));
  float g = length((p.xy - vec2(0.38, 0.0)) * vec2(1.0, 0.75)) - 0.14;
  lines = max(lines, (1.0 - smoothstep(0.0, 0.005, abs(g))) * 0.8 * step(p.x, 0.27));
  float e = length(vec2(p.x - 0.36, p.y - 0.025));
  c = mix(c, vec3(0.08, 0.07, 0.05), 1.0 - smoothstep(0.012, 0.016, e));
  c = mix(c, vec3(0.85, 0.75, 0.45), (1.0 - smoothstep(0.003, 0.005, abs(e - 0.019))) * 0.7);
  lines = max(lines, (1.0 - smoothstep(0.001, 0.003, abs(e - 0.022))) * 0.8);
  // the mouth
  lines = max(lines, (1.0 - smoothstep(0.0, 0.004, abs(p.y + 0.02 - 2.0 * pow(max(p.x - 0.42, 0.0), 2.0)))) * step(0.41, p.x) * 0.8);
  return c;
}
`;

const WATER_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const WATER_FS = /* glsl */ `
uniform float uTime;
uniform sampler2D uMirror;
uniform mat4 uMirrorVP;
uniform sampler2D uShadow;
uniform vec4 uShadowBox;
uniform vec3 uSun;
uniform vec3 uSunUW;
uniform vec4 uPosts[2];
uniform vec3 uWorlds;
uniform float uDebug;
${LITHO_UNIFORMS}
varying vec3 vW;
${NOISE}
${LITHO}
${WAVES}
${FRESNEL}
${LEAF_SDF}
${POND_GLSL}
${FISH}

const float ETA = 1.0 / 1.333;
const vec3 SIGMA = vec3(0.5, 0.3, 0.38);   // absorption + scattering per metre
const vec3 MURK = vec3(0.15, 0.2, 0.17);    // light scattered back by the water itself

float reflDist(vec3 P, vec3 R) {
  vec2 c = vec2(${POND.cx.toFixed(3)}, ${POND.cz.toFixed(3)});
  vec2 rad = vec2(${POND.rx.toFixed(3)}, ${POND.rz.toFixed(3)}) * 1.12;
  vec2 o = (P.xz - c) / rad;
  vec2 d = R.xz / rad;
  float a = dot(d, d), b = dot(o, d), cc = dot(o, o) - 1.0;
  float s = (-b + sqrt(max(b * b - a * cc, 0.0))) / max(a, 1e-6);
  return clamp(s + 1.5, 1.0, 40.0);
}

float bottomY(vec2 p) {
  float deep = 1.5 + 0.2 * sin(p.x * 0.41 + 1.0) * sin(p.y * 0.33 - 0.5) + 0.05 * sin(p.x * 1.7 + p.y * 1.3);
  return max(-deep, pondD(p) * 0.35);
}

// light under the surface, seen from a point underwater: shadows of the
// floating leaves (soft, from a map rendered from above) and of the fish
float shadowAt(vec3 X) {
  vec3 S = X + uSunUW * (-X.y / uSunUW.y);
  vec2 uv = vec2(S.x - uShadowBox.x, uShadowBox.y - S.z) / uShadowBox.zw;
  float blur = log2(1.0 + (-X.y) * 18.0);
  float leaf = textureLod(uShadow, uv, blur).r;
  // the fish: an ellipse where the sun ray crosses the fish's depth
  vec3 F = X + uSunUW * ((uFishPos.y - X.y) / uSunUW.y);
  vec3 q = F - uFishPos;
  vec2 fl = vec2(dot(q.xz, uFishDir), dot(q.xz, vec2(-uFishDir.y, uFishDir.x)));
  float soft = 0.05 + max(0.0, uFishPos.y - X.y) * 0.18;
  float fe = length(fl / vec2(0.62, 0.11)) - 1.0;
  float fish = 1.0 - (1.0 - smoothstep(-soft * 4.0, soft * 6.0, fe)) * 0.55;
  return mix(1.0, leaf, 0.8) * (X.y < uFishPos.y ? fish : 1.0);
}

// moving bright webs of light focused by the ripples
float caustic(vec2 p, float t) {
  float c = 0.0;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    vec2 q = p * (2.1 + fl * 1.6) + fl * 7.3;
    vec2 i = floor(q), f = fract(q);
    float d1 = 9.0, d2 = 9.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash22(i + g);
        o = 0.5 + 0.42 * sin(t * (0.55 + 0.25 * fl) + 6.2831 * o);
        float d = length(g + o - f);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
    }
    c += pow(1.0 - smoothstep(0.0, 0.13, d2 - d1), 2.0);
  }
  return c * 0.4;
}

vec3 underLight(vec3 X, vec3 n) {
  float depth = -X.y;
  float sun = max(dot(n, uSunUW), 0.0) * shadowAt(X);
  float cau = mix(0.45, caustic(X.xz, uTime), exp(-depth * 0.6));
  vec3 down = exp(-SIGMA * depth);
  return down * (0.5 + 0.25 * max(n.y, 0.0) + sun * (0.4 + 1.2 * cau));
}

vec3 bottomColour(vec3 X, out float lines) {
  vec2 p = X.xz;
  lines = 0.0;
  vec3 c = vec3(0.46, 0.4, 0.3) * (0.8 + 0.35 * fbm(p * 2.2));
  // pebbles
  vec2 g = p / 0.15;
  vec2 i = floor(g), f = fract(g);
  float peb = 9.0;
  vec3 pc = c;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(i + o);
      if (h.x < 0.5) {
        float r = 0.18 + 0.22 * h.y;
        float d = length(o + h * 0.6 + 0.2 - f) - r;
        if (d < peb) { peb = d; pc = mix(vec3(0.55, 0.53, 0.47), vec3(0.62, 0.5, 0.34), h.y) * (0.8 + 0.3 * h.x); }
      }
    }
  }
  float inP = 1.0 - smoothstep(-0.02, 0.02, peb);
  c = mix(c, pc, inP * 0.85);
  lines = (1.0 - smoothstep(0.0, 0.05, abs(peb))) * 0.35;
  // sunken leaves, dark and soft
  vec2 lg = p / 0.8;
  vec2 li = floor(lg);
  vec2 lh = hash22(li + 31.0);
  if (lh.x < 0.45) {
    vec2 q = (fract(lg) - 0.5 - (lh - 0.5) * 0.4) * 0.8 / (0.14 + 0.06 * lh.y);
    q = rot2(lh.y * 6.28) * q;
    float vein;
    float d = leafSDF(q, floor(lh.x * 6.6), vein);
    float inL = 1.0 - smoothstep(-0.02, 0.03, d);
    c = mix(c, vec3(0.28, 0.2, 0.12) * (0.9 + 0.2 * vein), inL * 0.85);
    lines = max(lines, (1.0 - smoothstep(0.0, 0.03, abs(d))) * 0.4);
  }
  // twigs
  vec2 tg = p / 1.3;
  vec2 ti = floor(tg);
  vec2 th = hash22(ti + 7.0);
  if (th.x < 0.18) {
    vec2 q = (fract(tg) - 0.5) * 1.3;
    q = rot2(th.y * 6.28) * q;
    float d = max(abs(q.y + 0.02 * sin(q.x * 9.0)) - 0.007, abs(q.x) - 0.22);
    c = mix(c, vec3(0.2, 0.16, 0.11), 1.0 - smoothstep(0.0, 0.006, d));
  }
  // weed
  float wd = fbm(p * 1.4 + 3.0);
  c = mix(c, vec3(0.3, 0.36, 0.22), smoothstep(0.62, 0.74, wd) * (0.4 + 0.6 * vnoise(p * 40.0)) * 0.7);
  return c;
}

vec3 underwater(vec3 P, vec3 T, float pixAng, float camDist, out float ink) {
  ink = 0.0;
  // the bottom
  float tb = (P.y + 1.5) / -T.y;
  for (int i = 0; i < 5; i++) {
    vec3 X = P + T * tb;
    tb = (P.y - bottomY(X.xz)) / -T.y;
  }
  float tHit = tb;
  int what = 0;
  // the posts
  vec4 hitPost = vec4(0.0);
  for (int k = 0; k < 2; k++) {
    vec4 po = uPosts[k];
    vec2 o = P.xz - po.xy;
    float a = dot(T.xz, T.xz), b = dot(o, T.xz), c = dot(o, o) - po.z * po.z;
    float h = b * b - a * c;
    if (h > 0.0) {
      float t = (-b - sqrt(h)) / a;
      if (t > 0.0 && t < tHit) { tHit = t; what = 2; hitPost = po; }
    }
  }
  // the fish: march inside its bounding sphere
  vec3 oc = P - uFishPos;
  float b = dot(oc, T), c = dot(oc, oc) - 0.8 * 0.8;
  float h = b * b - c;
  float fin = 0.0;
  if (h > 0.0) {
    float t0 = max(-b - sqrt(h), 0.0), t1 = min(-b + sqrt(h), tHit);
    float t = t0, minD = 1e9;
    for (int i = 0; i < 72; i++) {
      if (t > t1) break;
      float d = fishMap(P + T * t);
      minD = min(minD, d);
      if (d < 0.0012) { if (t < tHit) { tHit = t; what = 1; } break; }
      t += max(d * 0.7, 0.002);
    }
    if (what != 1) {
      float px = pixAng * (camDist + t0);
      ink = (1.0 - smoothstep(px * 0.4, px * 1.4, minD)) * 0.9;
    }
  }
  vec3 X = P + T * tHit;
  vec3 col;
  if (what == 1) {
    vec3 n = fishNormal(X);
    vec3 lp = fishLocal(X);
    float f;
    fishSDF(lp, f);
    float lines;
    col = fishColour(lp, n, f, lines) * underLight(X, n);
    col *= 1.0 - lines * 0.55;
    float rim = 1.0 - abs(dot(n, -T));
    ink = max(lines * 0.25, smoothstep(0.55, 0.95, rim) * 0.75);
    col *= uWorlds.z;
  } else if (what == 2) {
    vec3 n = normalize(vec3(X.x - hitPost.x, 0.0, X.z - hitPost.y));
    float a = atan(n.z, n.x);
    vec3 wood = vec3(0.4, 0.34, 0.26) * (0.75 + 0.3 * vnoise(vec2(a * 9.0, X.y * 2.0)));
    wood = mix(wood, vec3(0.25, 0.32, 0.18), smoothstep(-0.05, -0.5, X.y) * 0.7 + 0.2);
    col = wood * underLight(X, n);
    float rim = 1.0 - abs(dot(n, -T));
    ink = smoothstep(0.6, 0.95, rim);
  } else {
    float lines;
    col = bottomColour(X, lines) * underLight(X, vec3(0.0, 1.0, 0.0));
    col *= 1.0 - lines * 0.5;
    ink = max(ink, 0.0);
  }
  // absorbed and scattered along the path through the water
  vec3 tr = exp(-SIGMA * tHit);
  vec3 murk = MURK * (0.75 + 0.25 * max(dot(-T, vec3(0.0, 1.0, 0.0)), 0.0));
  ink *= tr.g;
  return col * tr + murk * (1.0 - tr);
}

void main() {
  vec3 P = vec3(vW.x, 0.0, vW.z);
  vec3 I = normalize(P - cameraPosition);
  float dist = length(P - cameraPosition);
  float pixAng = length(fwidth(I));
  vec3 N = waveN(P.xz);
  // ripples smaller than a pixel would only alias: let them fade with distance
  float fp = fwidth(P.x) + fwidth(P.z);
  N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(0.03, 0.2, fp)));
  float cosi = clamp(-dot(I, N), 0.0, 1.0);
  float F = fresnelExact(cosi, ETA);

  // the world above, in the mirror
  vec3 R = reflect(I, N);
  R.y = max(R.y, 0.004);
  // the mirror image was rendered from the eye mirrored in the water plane, so
  // a point on the reflected ray projects straight into it. With a flat surface
  // any point on the ray gives the same pixel; with ripples the point should be
  // about as far away as what is reflected there: the banks round the pond.
  vec3 Q = P + R * reflDist(P, R);
  vec4 cq = uMirrorVP * vec4(Q, 1.0);
  vec2 muv = cq.xy / cq.w * 0.5 + 0.5;
  vec3 refl = texture2D(uMirror, muv).rgb * uWorlds.x;

  // the world beneath, through the surface
  vec3 T = refract(I, N, ETA);
  float ink;
  vec3 under = underwater(P, T, pixAng, dist, ink);

  vec3 col = F * refl + (1.0 - F) * under;
  if (uDebug > 0.5) { gl_FragColor = vec4(uDebug > 1.5 ? under : refl, 1.0); return; }
  // the shore line
  float shore = 1.0 - smoothstep(0.0, 0.03 + fp, abs(pondD(P.xz)));
  ink = max(ink * (1.0 - F), shore * 0.6);
  gl_FragColor = vec4(finish(col, 0.0, ink, P.xz, dist, 0.0), 1.0);
}
`;

export function makeWaterMaterial(u, extra) {
  return new THREE.ShaderMaterial({
    uniforms: { ...u, ...extra },
    vertexShader: WATER_VS,
    fragmentShader: WATER_FS,
  });
}

export function waterUniforms() {
  const drops = [];
  for (let i = 0; i < 8; i++) drops.push(new THREE.Vector4(0, 0, -100, 0));
  return {
    uWaveT: { value: 0 },
    uDrops: { value: drops },
    uMirror: { value: null },
    uMirrorVP: { value: new THREE.Matrix4() },
    uShadow: { value: null },
    uShadowBox: { value: new THREE.Vector4(-10, -13, 20, 20) },
    uSunUW: { value: new THREE.Vector3(0, 1, 0) },
    uPosts: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    uFishPos: { value: new THREE.Vector3(0, -0.4, 0) },
    uFishDir: { value: new THREE.Vector2(1, 0) },
    uFishPhase: { value: 0 },
    uFishTurn: { value: 0 },
    uWorlds: { value: new THREE.Vector3(1, 1, 1) },
    uDebug: { value: 0 },
  };
}
