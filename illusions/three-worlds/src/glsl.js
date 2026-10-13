// GLSL shared by the pond's shaders: noise, the Waterfall's lithograph finish
// (with hatching scaled to stay a constant size on screen), the ripple field
// and the exact Fresnel reflectance of a water surface.

export const NOISE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
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

// col: colour; haze: fade to the sky; ink: outline amount; huv: coordinates
// the hatching follows; dist: distance from the eye (hatching keeps a constant
// size on screen); face: offsets the cross-hatching between faces.
export const LITHO = /* glsl */ `
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float dist, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.03 + gw * 0.025) * uGrain;

  float L = pow(max(dot(col, vec3(0.30, 0.59, 0.11)), 0.0), 0.85);
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = uHatch * max(dist, 0.2);
  float hfw = fwidth(huv.x) + fwidth(huv.y);
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  float h1 = 1.0 - smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  h1 = mix(c1, h1, hl);
  h2 = mix(c2, h2, hl);
  float v = 0.2 + 0.82 * t;
  v -= h1 * 0.22 + h2 * 0.2;
  v += (g * 0.12 + gw * 0.07) * uGrain;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`;

export const LITHO_UNIFORMS = /* glsl */ `
uniform float uLitho;
uniform float uHatch;
uniform float uGrain;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
`;

// The ripple field: a few long, slow wind waves and rings spreading from
// drops (a fish kissing the surface, a drip from a branch). Heights in metres.
export const WAVES = /* glsl */ `
uniform float uWaveT;
uniform vec4 uDrops[8];   // x, z, start time, amplitude
float waveH(vec2 p) {
  float t = uWaveT;
  float h = 0.0;
  h += 0.0022 * sin(dot(p, vec2(0.80, 0.60)) * 2.3 + t * 1.35);
  h += 0.0016 * sin(dot(p, vec2(-0.35, 0.94)) * 3.6 + t * 1.8 + 1.0);
  h += 0.0009 * sin(dot(p, vec2(0.96, -0.28)) * 6.1 + t * 2.4 + 2.0);
  h += 0.0005 * sin(dot(p, vec2(-0.6, -0.8)) * 10.3 + t * 3.2 + 0.5);
  h += 0.0003 * sin(dot(p, vec2(0.2, -0.98)) * 17.0 + t * 4.1 + 4.0);
  for (int i = 0; i < 8; i++) {
    vec4 d = uDrops[i];
    float age = t - d.z;
    if (age > 0.0 && age < 9.0 && d.w > 0.0) {
      float r = length(p - d.xy);
      float front = 0.08 + age * 0.32;
      float x = r - front;
      float env = exp(-x * x * 30.0) * exp(-age * 0.42) / (1.0 + r * 2.5);
      h += d.w * env * cos(x * 38.0);
    }
  }
  return h;
}
vec3 waveN(vec2 p) {
  float e = 0.012;
  float h0 = waveH(p);
  float hx = waveH(p + vec2(e, 0.0));
  float hz = waveH(p + vec2(0.0, e));
  return normalize(vec3(h0 - hx, e, h0 - hz));
}
`;

export const FRESNEL = /* glsl */ `
// Unpolarised reflectance of a smooth boundary (exact Fresnel equations).
// cosi: cosine of the angle of incidence; eta = n1 / n2.
float fresnelExact(float cosi, float eta) {
  float s2 = eta * eta * (1.0 - cosi * cosi);
  if (s2 >= 1.0) return 1.0;
  float cost = sqrt(1.0 - s2);
  float rs = (eta * cosi - cost) / (eta * cosi + cost);
  float rp = (cosi - eta * cost) / (cosi + eta * cost);
  return 0.5 * (rs * rs + rp * rp);
}
`;

// Leaf outlines as signed distances in leaf space: x along the midrib from
// stalk (x = -0.5) to tip (x = 0.5), y across, in units of the leaf's length.
export const LEAF_SDF = /* glsl */ `
float leafSDF(vec2 p, float kind, out float vein) {
  float x = p.x, y = p.y;
  float s = clamp(x + 0.5, 0.0, 1.0);   // 0 at the stalk, 1 at the tip
  float w;
  if (kind < 0.5) {
    // oak: wavy lobes
    w = 0.33 * pow(sin(3.14159 * pow(s, 0.85)), 0.8);
    w *= 0.78 + 0.22 * cos(s * 31.0 + 0.6);
  } else if (kind < 1.5) {
    // lime: heart shaped with a drawn-out tip and a fine serration
    w = 0.46 * pow(sin(3.14159 * pow(s, 0.62)), 1.15) * (1.0 - 0.12 * s);
    w *= 1.0 - 0.03 * abs(sin(s * 70.0));
  } else {
    // willow: long and narrow
    w = 0.13 * pow(sin(3.14159 * s), 0.9);
  }
  float d = abs(y) - w;
  d = max(d, abs(x) - 0.5);
  // the stalk
  float stalk = max(abs(y) - 0.012, max(-(x + 0.66), x + 0.47));
  d = min(d, stalk);
  // veins: the midrib and side veins slanting towards the tip
  float side = abs(fract((s - abs(y) * 0.9) * (kind > 1.5 ? 9.0 : 6.0)) - 0.5);
  vein = max(1.0 - smoothstep(0.0, 0.018, abs(y)), (1.0 - smoothstep(0.0, 0.05, side)) * step(abs(y), w * 0.9) * 0.7);
  return d;
}
`;
