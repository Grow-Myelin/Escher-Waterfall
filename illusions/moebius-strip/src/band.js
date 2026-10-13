// The band: a true parametric Möbius surface with a lattice cut out of it.
//
//   M(σ, t) = c(σ) + t·w(σ),          σ ∈ [0, 2π), t ∈ [−W, W]
//   c(σ) = (A cos σ, B sin σ, 0)                     centre line, an upright ellipse
//   w(σ) = cos α(σ)·ẑ + sin α(σ)·N(σ)                the cross-piece
//   α(σ) = (σ − σc − π)/2 + (k/2)·sin(σ − σc)
//
// N is the outward normal of the ellipse in its plane and ẑ the axis of the
// hoop. α turns through exactly π per lap (α(σ + 2π) = α(σ) + π), so
// w(σ + 2π) = −w(σ) and the point (σ + 2π, t) is the point (σ, −t): one trip
// round brings you back with the band flipped. The k term only bunches the
// half-twist up near σc so it reads as a twisted strip; away from it the band
// is a plain hoop. The surface normal n = ∂M/∂σ × ∂M/∂t changes sign after one
// trip too, so "the side you are on" is only well defined over σ ∈ [0, 4π).
//
// The lattice is a signed-distance field in the surface's own coordinates,
// measured with the surface metric ds² = g² dσ² + dt² (∂M/∂σ ⟂ ∂M/∂t here):
// two edge straps, a centre strap (the ants' road) and two zigzag braces.
// The pattern is symmetric under t → −t, so it is unchanged by the flip, as
// it must be; with an odd number of bays each zigzag also closes on itself
// after one trip (with an even number the two would join into one).
//
// The mesh is a thin solid of thickness h: the face at +h/2·n and the face at
// −h/2·n, joined by walls round every hole. Each vertex carries Σ, its place
// on the single side: σ on the first face, σ + 2π on the second.

import * as THREE from 'three';

export const A = 3.05, B = 3.75; // ellipse semi-axes (across, up)
export const R = (A + B) / 2; // nominal radius, for texture scale
export const W = 1.05;
export const THICK = 0.07;
export const BAYS = 9;
const TWIST_AT = -Math.PI * 0.42, TWIST_K = 0.8;
const EDGE_W = 0.11, CENTRE_W = 0.24, BRACE_W = 0.08, FILLET = 0.07;
const TAU = Math.PI * 2;

function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

export function centre(s) { return [A * Math.cos(s), B * Math.sin(s), 0]; }
export function alpha(s) { return (s - TWIST_AT - Math.PI) / 2 + (TWIST_K / 2) * Math.sin(s - TWIST_AT); }
export function ruling(s) {
  const nrm = norm([B * Math.cos(s), A * Math.sin(s), 0]); // outward normal of the ellipse
  const a = alpha(s), c = Math.cos(a), sn = Math.sin(a);
  return [sn * nrm[0], sn * nrm[1], c];
}
export function point(s, t) {
  const c = centre(s), w = ruling(s);
  return [c[0] + t * w[0], c[1] + t * w[1], c[2] + t * w[2]];
}
// ∂M/∂σ by central differences (the surface is smooth; h is tiny)
export function dS(s, t) {
  const h = 1e-5, p = point(s + h, t), q = point(s - h, t);
  return [(p[0] - q[0]) / (2 * h), (p[1] - q[1]) / (2 * h), (p[2] - q[2]) / (2 * h)];
}
export function normal(s, t) { return norm(cross(dS(s, t), ruling(s))); }
export function metric(s, t) { const d = dS(s, t); return Math.hypot(d[0], d[1], d[2]); }

// ---------------------------------------------------------------- lattice
function smax(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - u * dx, py - ay - u * dy);
}
const WE = W - EDGE_W; // edge straps' centre lines
const BAY = TAU / BAYS;

// > 0 inside the lattice
export function lattice(s, t) {
  const g = metric(s, t);
  let f = EDGE_W - Math.abs(Math.abs(t) - WE);
  f = smax(f, CENTRE_W - Math.abs(t), FILLET);
  const i0 = Math.floor(s / BAY);
  for (let i = i0 - 1; i <= i0 + 1; i++) {
    const sa = i * BAY, sb = (i + 1) * BAY;
    const sign = i % 2 === 0 ? 1 : -1; // (−1)^i, also right for negative i
    // zigzag one runs from −WE to +WE across even bays; zigzag two mirrors it
    for (const z of [1, -1]) {
      const ta = -sign * z * WE, tb = sign * z * WE;
      const d = segDist((s - sa) * g, t, 0, ta, (sb - sa) * g, tb);
      f = smax(f, BRACE_W - d, FILLET);
    }
  }
  return f;
}

// ---------------------------------------------------------------- mesh
const BIG = 1000;

class Mesh {
  constructor() { this.pos = []; this.nrm = []; this.col = []; this.uv = []; this.edg = []; this.mat = []; this.sig = []; }
  // one triangle; v = [{p, n, uv, sig}] ×3, real[i]: edge opposite vertex i is an outline
  tri(v, real, colour, pat, haze = 0) {
    const [a, b, c] = v.map((q) => q.p);
    const sub = (x, y) => [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
    const len = (x) => Math.hypot(x[0], x[1], x[2]);
    const area2 = len(cross(sub(b, a), sub(c, a)));
    const h = [area2 / (len(sub(c, b)) || 1), area2 / (len(sub(a, c)) || 1), area2 / (len(sub(b, a)) || 1)];
    for (let i = 0; i < 3; i++) {
      const q = v[i];
      this.pos.push(q.p[0], q.p[1], q.p[2]);
      this.nrm.push(q.n[0], q.n[1], q.n[2]);
      this.col.push(colour[0], colour[1], colour[2]);
      this.uv.push(q.uv[0], q.uv[1]);
      this.sig.push(q.sig);
      for (let j = 0; j < 3; j++) this.edg.push(real[j] ? (i === j ? h[j] : 0) : BIG);
      this.mat.push(pat, haze, 0);
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('acol', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('fuv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('edge', new THREE.Float32BufferAttribute(this.edg, 3));
    g.setAttribute('amat', new THREE.Float32BufferAttribute(this.mat, 3));
    g.setAttribute('asig', new THREE.Float32BufferAttribute(this.sig, 1));
    g.computeBoundingSphere();
    return g;
  }
}

function rgb(hex) { return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255]; }

// Marching squares over (σ, t) ∈ [0, 2π] × [−W, W], then lift each piece to
// both faces of the thin solid and wall in the holes.
export function buildBand(opts = {}) {
  const NS = opts.ns ?? BAYS * 44, NT = opts.nt ?? 44;
  const face = rgb(opts.face ?? 0xe9dfc8), wall = rgb(opts.wall ?? 0xb7a585);
  const ds = TAU / NS, dt = (2 * W) / NT;
  const F = new Float64Array((NS + 1) * (NT + 1));
  for (let i = 0; i <= NS; i++) for (let j = 0; j <= NT; j++) F[i * (NT + 1) + j] = lattice(i * ds, -W + j * dt);
  // make the seam exact: (2π, t) is (0, −t)
  for (let j = 0; j <= NT; j++) F[NS * (NT + 1) + j] = F[NT - j];
  // the outer rim is always cut (the band's own edge)
  const val = (i, j) => (j === 0 || j === NT ? Math.min(-1e-4, F[i * (NT + 1) + j]) : F[i * (NT + 1) + j]);

  const m = new Mesh();
  const half = THICK / 2;
  const lift = (s, t, side) => {
    const p = point(s, t), n = normal(s, t);
    const k = side * half;
    return { p: [p[0] + n[0] * k, p[1] + n[1] * k, p[2] + n[2] * k], n: side > 0 ? n : [-n[0], -n[1], -n[2]] };
  };
  const vert = (q, side) => {
    const L = lift(q[0], q[1], side);
    return { p: L.p, n: L.n, uv: [q[0] * R, q[1]], sig: side > 0 ? q[0] : q[0] + TAU };
  };

  for (let i = 0; i < NS; i++) {
    for (let j = 0; j < NT; j++) {
      const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      const fv = corners.map(([a, b]) => val(a, b));
      if (fv.every((v) => v <= 0)) continue;
      // polygon of the solid part, counter-clockwise in (σ, t), with flags
      // saying whether the edge leaving each vertex runs along a contour
      const poly = [], cut = [];
      for (let k = 0; k < 4; k++) {
        const [a, b] = corners[k], [a2, b2] = corners[(k + 1) % 4];
        const f0 = fv[k], f1 = fv[(k + 1) % 4];
        if (f0 > 0) { poly.push([a * ds, -W + b * dt]); cut.push(false); }
        if ((f0 > 0) !== (f1 > 0)) {
          const u = f0 / (f0 - f1);
          poly.push([(a + (a2 - a) * u) * ds, -W + (b + (b2 - b) * u) * dt]);
          cut.push(f0 > 0); // leaving the solid: the next edge crosses the cell along the contour
        }
      }
      const n = poly.length;
      if (n < 3) continue;
      const top = poly.map((q) => vert(q, 1)), bot = poly.map((q) => vert(q, -1));
      for (let k = 1; k < n - 1; k++) {
        // fan (0, k, k+1); edge opposite 0 is k→k+1, opposite k is k+1→0, opposite k+1 is 0→k
        const real = [cut[k] ? 1 : 0, k + 1 === n - 1 && cut[n - 1] ? 1 : 0, k === 1 && cut[0] ? 1 : 0];
        m.tri([top[0], top[k], top[k + 1]], real, face, 2);
        m.tri([bot[0], bot[k + 1], bot[k]], [real[0], real[2], real[1]], face, 2);
      }
      // walls along the contour edges
      for (let k = 0; k < n; k++) {
        if (!cut[k]) continue;
        const p = poly[k], q = poly[(k + 1) % n];
        const tp = vert(p, 1), tq = vert(q, 1), bp = vert(p, -1), bq = vert(q, -1);
        // outward: to the right of p→q in (σ, t); check against the 3D quad normal
        const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const out = [(q[1] - p[1]), -(q[0] - p[0])];
        const ol = Math.hypot(out[0] * metric(mid[0], mid[1]), out[1]) || 1;
        const pm = point(mid[0], mid[1]);
        const po = point(mid[0] + (out[0] / ol) * 0.01, mid[1] + (out[1] / ol) * 0.01);
        const on = norm([po[0] - pm[0], po[1] - pm[1], po[2] - pm[2]]);
        const e = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const sl = (mid[0] * R + mid[1]) * 1.0;
        const wv = (v, side, along) => ({ p: v.p, n: on, uv: [sl + along * e, side * half * 4], sig: -1 });
        let A = wv(tp, 1, 0), B = wv(bp, -1, 0), Cc = wv(bq, -1, 1), D = wv(tq, 1, 1);
        const qn = cross([B.p[0] - A.p[0], B.p[1] - A.p[1], B.p[2] - A.p[2]], [Cc.p[0] - A.p[0], Cc.p[1] - A.p[1], Cc.p[2] - A.p[2]]);
        if (qn[0] * on[0] + qn[1] * on[1] + qn[2] * on[2] < 0) [A, B, Cc, D] = [D, Cc, B, A];
        // quad A-B-C-D: edges AB (side), BC (bottom rim), CD (side), DA (top rim)
        m.tri([A, B, Cc], [1, 0, 0], wall, 3);
        m.tri([A, Cc, D], [1, 0, 0], wall, 3);
      }
    }
  }
  return m.build();
}

// The ants' road: the centre line on the face at +h/2·n, for Σ ∈ [0, 4π).
// Using the 4π-periodic formulas, Σ ≥ 2π lands on the other face by itself.
export function roadFrame(S, lift = 0) {
  const p = point(S, 0), n = normal(S, 0), f = norm(dS(S, 0));
  const k = THICK / 2 + lift;
  return { p: [p[0] + n[0] * k, p[1] + n[1] * k, p[2] + n[2] * k], up: n, fwd: f };
}
