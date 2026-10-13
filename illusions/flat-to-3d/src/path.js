// The lizard's walk: a path over the surfaces of the desk, sampled evenly,
// with a surface normal at every sample.
//
// Straight runs are sections of the scene by a vertical plane: the profile
// (distance along the run, height) of whatever the plane cuts — the edge of
// the sketchbook, the book with its rounded spine, the dodecahedron (the
// exact polygon in which the plane through its centre cuts it), the dish.
// Every corner of a profile is rounded with a circular fillet so the body
// bends smoothly over it. The runs are joined by turns on flat ground, and
// the whole path begins and ends with the lizard's own resting spine on the
// page, so the walk starts and ends in exactly the drawn pose.

import { PAGE_Y, SKETCH, BOOK, DODECA, DISH, DISH_PROFILE, DISH_RIM, dodecahedron } from './desk.js';

export const STEP = 0.004;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]);
const nrm = (a) => mul(a, 1 / (len(a) || 1));

// round every corner of a 2D polyline with an arc of radius r (r may depend
// on whether the corner is convex or concave for a walker on its left side)
function fillet(P, rConvex, rConcave) {
  const out = [P[0]];
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], v = P[i], b = P[i + 1];
    const d0 = nrm(sub(v, a)), d1 = nrm(sub(b, v));
    const cross = d0[0] * d1[1] - d0[1] * d1[0];
    const dot = Math.max(-1, Math.min(1, d0[0] * d1[0] + d0[1] * d1[1]));
    const th = Math.acos(dot);
    if (th < 1e-3) { out.push(v); continue; }
    // walking with the solid on the right, a left turn (cross > 0) is concave
    const r = cross > 0 ? rConcave : rConvex;
    let tl = r * Math.tan(th / 2);
    tl = Math.min(tl, len(sub(v, a)) * 0.48, len(sub(b, v)) * 0.48);
    const rr = tl / Math.tan(th / 2);
    const p0 = sub(v, mul(d0, tl)), p1 = add(v, mul(d1, tl));
    const side = cross > 0 ? [-d0[1], d0[0]] : [d0[1], -d0[0]];
    const c = add(p0, mul(side, rr));
    const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
    let a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const n = Math.max(2, Math.ceil(Math.abs(da) * rr / 0.01));
    for (let k = 0; k <= n; k++) {
      const t = a0 + (da * k) / n;
      out.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]);
    }
    void a1;
  }
  out.push(P[P.length - 1]);
  return out;
}

// resample a polyline at exactly `step` (arc length measured on the first
// `dims` coordinates; the rest, e.g. normals, are interpolated)
function resample(P, step, dims = 2, keepEnd = true) {
  const L = [0];
  for (let i = 1; i < P.length; i++) {
    let d = 0;
    for (let j = 0; j < dims; j++) d += (P[i][j] - P[i - 1][j]) ** 2;
    L.push(L[i - 1] + Math.sqrt(d));
  }
  const tot = L[L.length - 1];
  const m = Math.floor(tot / step + 1e-9);
  const out = [];
  let j = 0;
  for (let k = 0; k <= m; k++) {
    const s = k * step;
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const u = (s - L[j]) / (L[j + 1] - L[j] || 1);
    out.push(P[j].map((v, q) => v + (P[j + 1][q] - v) * u));
  }
  if (keepEnd && tot - m * step > step * 0.25) out.push(P[P.length - 1].slice());
  return out;
}

// ------------------------------------------------------------------ profiles
// The section of the dodecahedron by the vertical plane z = z0, as the chain
// of its upper boundary from where it meets the book on the left to the right.
function dodecaSection(z0) {
  const D = dodecahedron(DODECA.a);
  const [cx, , cz] = DODECA.c;
  const y0 = BOOK.h;
  let poly = [[-20, -20], [20, -20], [20, 20], [-20, 20]];
  for (const f of D.faces) {
    // n · (p − offset) ≤ d  with p = (x, y, z0)
    const nx = f.n[0], ny = f.n[1], nz = f.n[2];
    const d = f.d + nx * cx + ny * y0 + nz * cz - nz * z0;
    const inside = (p) => nx * p[0] + ny * p[1] <= d + 1e-9;
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) {
        const fa = nx * a[0] + ny * a[1] - d, fb = nx * b[0] + ny * b[1] - d;
        const t = fa / (fa - fb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    poly = out;
  }
  // counter-clockwise polygon; its bottom edge lies on the book (y = y0)
  const bottom = poly.filter((p) => Math.abs(p[1] - y0) < 1e-6);
  const xl = Math.min(...bottom.map((p) => p[0])), xr = Math.max(...bottom.map((p) => p[0]));
  let i0 = poly.findIndex((p) => Math.abs(p[1] - y0) < 1e-6 && Math.abs(p[0] - xr) < 1e-9);
  const chain = [];
  for (let k = 0; k < poly.length; k++) {
    const p = poly[(i0 + k) % poly.length];
    chain.push(p);
    if (Math.abs(p[1] - y0) < 1e-6 && Math.abs(p[0] - xl) < 1e-9 && k > 0) break;
  }
  // chain runs right → over the top → left; we want left → right
  return { chain: chain.reverse(), xl, xr, top: Math.max(...poly.map((p) => p[1])) };
}

// Run A, along +x at z = DODECA z: page, sketchbook edge, desk, the book's
// spine, the cover, the dodecahedron, the cover, the fore-edge, the desk.
function profileA(x0, x1) {
  const B = BOOK, h = B.h, py = PAGE_Y;
  const P = [[x0, py], [SKETCH.x1, py], [SKETCH.x1, 0]];
  // the rounded spine: a half-ellipse bulging out of the book's left side
  const sx = B.x0 + 0.02, rx = 0.1375, ry = h / 2;
  P.push([sx + 0.0, 0]);
  for (let k = 1; k < 12; k++) {
    const th = (k / 12) * Math.PI;
    P.push([sx - rx * Math.sin(th), ry - ry * Math.cos(th)]);
  }
  P.push([sx, h]);
  const sec = dodecaSection(DODECA.c[2]);
  for (const p of sec.chain) P.push(p);
  // the fore-edge: boards to x1, the pages set back
  P.push([B.x1, h], [B.x1, h - 0.05], [B.x1 - 0.06, h - 0.05], [B.x1 - 0.06, 0.05], [B.x1, 0.05], [B.x1, 0], [x1, 0]);
  return { P, top: sec.top };
}

// Run C, along −x through the dish's centre: desk, over the rim, across the
// well, out over the far rim, desk.
function profileC(xStart, xEnd) {
  const cx = DISH.c[0], R = DISH.r;
  const outerUp = DISH_PROFILE.slice(4, DISH_RIM + 1); // foot … top of the rim (r, y)
  const inner = DISH_PROFILE.slice(DISH_RIM); // rim … centre, r shrinking
  // t is measured along −x; positions are x values
  const P = [[xStart, 0]];
  for (const [r, y] of outerUp) P.push([cx + r * R, y]);
  for (const [r, y] of inner.slice(1)) P.push([cx + r * R, y]);
  for (const [r, y] of inner.slice().reverse().slice(1)) P.push([cx - r * R, y]);
  for (const [r, y] of outerUp.slice().reverse().slice(1)) P.push([cx - r * R, y]);
  P.push([xEnd, 0]);
  // express as (distance along the run, height)
  return P.map(([x, y]) => [xStart - x, y]);
}

// ------------------------------------------------------------------ assembly
// sample: [x, y, z, nx, ny, nz]
function runSamples(start, dir, prof, rConvex = 0.07, rConcave = 0.15) {
  const F = fillet(prof, rConvex, rConcave);
  const out = [];
  const R = resample(F, STEP / 2);
  for (let i = 0; i < R.length; i++) {
    const a = R[Math.max(0, i - 1)], b = R[Math.min(R.length - 1, i + 1)];
    const t = nrm(sub(b, a));
    const n = [-t[1], t[0]]; // left of the direction of travel in (t, y): up on level ground
    out.push([start[0] + dir[0] * R[i][0], R[i][1], start[1] + dir[1] * R[i][0], dir[0] * n[0], n[1], dir[1] * n[0]]);
  }
  return out;
}

function flat(points2, y) {
  return points2.map(([x, z]) => [x, y, z, 0, 1, 0]);
}

function bezier(p0, p1, p2, p3, n = 200) {
  const out = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n, s = 1 - t;
    out.push([
      s * s * s * p0[0] + 3 * s * s * t * p1[0] + 3 * s * t * t * p2[0] + t * t * t * p3[0],
      s * s * s * p0[1] + 3 * s * s * t * p1[1] + 3 * s * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

// a quarter turn on level ground from heading d0 to heading d1 about corner c
function turn(c, d0, d1, r) {
  const p0 = sub(c, mul(d0, r)), p1 = add(c, mul(d1, r));
  return bezier(p0, add(p0, mul(d0, r * 0.552)), sub(p1, mul(d1, r * 0.552)), p1, 60);
}

export const ROUTE = {
  zA: DODECA.c[2],
  xA0: -0.35,
  xC1: 4.75,
  zC: DISH.c[2],
  xD: -1.05,
  zD1: 3.2,
  r: 0.55,
};

// spine: world samples [x, z] of the resting spine (tail tip → snout)
export function buildPath(spine) {
  const R = ROUTE;
  const pieces = [];
  const marks = {};
  pieces.push(flat(spine, PAGE_Y));
  const snout = spine[spine.length - 1], beforeSnout = spine[spine.length - 6];
  const dS = nrm(sub(snout, beforeSnout));
  const A0 = [R.xA0, R.zA];
  pieces.push(flat(bezier(snout, add(snout, mul(dS, 0.35)), sub(A0, [0.35, 0]), A0), PAGE_Y));
  // run A: +x
  const C1 = [R.xC1, R.zA];
  const pa = profileA(R.xA0, R.xC1 - R.r);
  const runA = runSamples([R.xA0, R.zA], [1, 0], pa.P);
  marks.topY = pa.top;
  pieces.push(runA);
  pieces.push(flat(turn(C1, [1, 0], [0, 1], R.r), 0));
  // run B: +z on the desk
  const C2 = [R.xC1, R.zC];
  pieces.push(flat([[C1[0], C1[1] + R.r], [C2[0], C2[1] - R.r]], 0));
  pieces.push(flat(turn(C2, [0, 1], [-1, 0], R.r), 0));
  // run C: −x through the dish
  const C3 = [R.xD, R.zC];
  const pc = profileC(C2[0] - R.r, C3[0] + R.r);
  pieces.push(runSamples([C2[0] - R.r, R.zC], [-1, 0], pc, 0.05, 0.12));
  pieces.push(flat(turn(C3, [-1, 0], [0, -1], R.r), 0));
  // run D: −z, up the front edge of the sketchbook onto the page
  const D1 = [R.xD, R.zD1];
  const z0 = C3[1] - R.r;
  const pd = [[0, 0], [z0 - SKETCH.z1, 0], [z0 - SKETCH.z1, PAGE_Y], [z0 - D1[1], PAGE_Y]];
  pieces.push(runSamples([R.xD, z0], [0, -1], pd));
  // back into the drawing, arriving along the tail
  const tip = spine[0], afterTip = spine[5];
  const dT = nrm(sub(afterTip, tip));
  pieces.push(flat(bezier(D1, add(D1, [0, -0.6]), sub(tip, mul(dT, 0.6)), tip), PAGE_Y));
  pieces.push(flat(spine, PAGE_Y));

  // join, resample evenly, and build frames
  const all = [];
  for (const p of pieces) for (const q of p) {
    const last = all[all.length - 1];
    if (last && Math.hypot(q[0] - last[0], q[1] - last[1], q[2] - last[2]) < 1e-6) continue;
    all.push(q);
  }
  // keep the resting spine exactly: resample only between the two copies
  const nSpine = spine.length;
  const head = all.slice(0, nSpine), tail = all.slice(all.length - nSpine);
  const mid = resample(all.slice(nSpine - 1, all.length - nSpine + 1), STEP, 3, false);
  const S = head.concat(mid.slice(1, mid.length - 1), tail);
  const n = S.length;
  const pos = new Float32Array(n * 3), T = new Float32Array(n * 3), B = new Float32Array(n * 3), N = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = S[Math.max(0, i - 2)], b = S[Math.min(n - 1, i + 2)];
    let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2];
    const tl = Math.hypot(tx, ty, tz) || 1;
    tx /= tl; ty /= tl; tz /= tl;
    let nx = S[i][3], ny = S[i][4], nz = S[i][5];
    // make the normal perpendicular to the tangent
    const d = nx * tx + ny * ty + nz * tz;
    nx -= d * tx; ny -= d * ty; nz -= d * tz;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    // left = normal × tangent
    const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx;
    pos.set([S[i][0], S[i][1], S[i][2]], i * 3);
    T.set([tx, ty, tz], i * 3);
    N.set([nx, ny, nz], i * 3);
    B.set([bx, by, bz], i * 3);
  }
  // smooth the frames a little (the fillets already keep them continuous)
  for (const A of [N, B]) {
    const C = A.slice();
    for (let i = 2; i < n - 2; i++) for (let j = 0; j < 3; j++) A[i * 3 + j] = (C[(i - 2) * 3 + j] + C[(i - 1) * 3 + j] * 2 + C[i * 3 + j] * 3 + C[(i + 1) * 3 + j] * 2 + C[(i + 2) * 3 + j]) / 9;
  }
  // where along the path is the top of the dodecahedron?
  let iTop = 0;
  for (let i = 0; i < n; i++) if (pos[i * 3 + 1] > pos[iTop * 3 + 1]) iTop = i;
  marks.top = iTop * STEP;
  return { pos, T, B, N, n, length: (n - 1) * STEP, marks };
}

// frame at arc length u (linear interpolation between samples)
export function frameAt(path, u, out) {
  const f = Math.min(path.n - 1.0001, Math.max(0, u / STEP));
  const i = Math.floor(f), t = f - i;
  for (const key of ['pos', 'T', 'B', 'N']) {
    const A = path[key], o = out[key];
    o[0] = A[i * 3] + (A[i * 3 + 3] - A[i * 3]) * t;
    o[1] = A[i * 3 + 1] + (A[i * 3 + 4] - A[i * 3 + 1]) * t;
    o[2] = A[i * 3 + 2] + (A[i * 3 + 5] - A[i * 3 + 2]) * t;
  }
  return out;
}
