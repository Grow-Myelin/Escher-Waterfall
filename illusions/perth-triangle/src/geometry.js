// The sculpture, in numbers.
//
// Three square bars run along the three axes of a local frame:
//
//   P0 ─A(+x)→ P1 ─B(+y)→ P2 ─C(+z)→ P3
//
// The loop does not close: P3 − P0 = (L, L, L). Seen from a point V on the
// line through P0 and P3, the two free ends fall on one sight line and the
// three bars draw a closed Penrose triangle.
//
// In perspective the near end looks bigger than the far end it hides. So the
// near end is built as an exact copy of the far corner, scaled about the eye
// by k = |V − P3| / |V − P0| (a homothety centred on V maps every sight line to
// itself). For bar C to arrive at that smaller end, the bars taper gently all
// the way round the loop, by f = k^(1/3) per bar.
//
// The far corner of the closed triangle we pretend to see is split along sight
// lines: the part of bar A that, from V, lies in front of the arriving bar
// (the "nose" W) travels forward with bar C's end; the rest stays with bar A.
// Every sight line through the corner meets the same surfaces in the same
// order as before, so the picture from V is exactly that of a closed corner.

import * as THREE from 'three';

export const L = 4.6; // bar length, corner to corner (m)
export const W0 = 0.64; // bar width at the far corner P0
export const EYE = 1.6; // eye height of a standing visitor
export const DIST = 25; // eye to far corner P0
export const BASE_Y = 1.5; // height of the two lower corners (on their posts)

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const EPS = 1e-9;

// ------------------------------------------------------------- the homothety
export const GAP = L * Math.sqrt(3); // |P3 − P0|
export const K = 1 - GAP / DIST; // scale of the near end
export const F = Math.cbrt(K); // taper per bar
export const HW = [W0 / 2, (W0 / 2) * F, (W0 / 2) * F * F, (W0 / 2) * K]; // half-widths at P0..P3

export const P = [v3(0, 0, 0), v3(L, 0, 0), v3(L, L, 0), v3(L, L, L)];
export const V_LOCAL = P[3].clone().divideScalar(1 - K); // the eye, in the sculpture's frame
// homothety centred on the eye: X → V + K (X − V)
export const H = new THREE.Matrix4().makeTranslation(V_LOCAL.x, V_LOCAL.y, V_LOCAL.z)
  .multiply(new THREE.Matrix4().makeScale(K, K, K))
  .multiply(new THREE.Matrix4().makeTranslation(-V_LOCAL.x, -V_LOCAL.y, -V_LOCAL.z));
export const H_INV = H.clone().invert();

// ------------------------------------------------------------- convex solids
// A convex solid is a list of planar faces {pts, tag}; points run
// counter-clockwise seen from outside. Built by clipping a big cube with
// half-spaces n·x ≤ d.
function cube(s) {
  const c = (x, y, z) => v3(x * s, y * s, z * s);
  return [
    { pts: [c(1, -1, 1), c(1, -1, -1), c(1, 1, -1), c(1, 1, 1)], tag: 'box' },
    { pts: [c(-1, -1, -1), c(-1, -1, 1), c(-1, 1, 1), c(-1, 1, -1)], tag: 'box' },
    { pts: [c(-1, 1, 1), c(1, 1, 1), c(1, 1, -1), c(-1, 1, -1)], tag: 'box' },
    { pts: [c(-1, -1, -1), c(1, -1, -1), c(1, -1, 1), c(-1, -1, 1)], tag: 'box' },
    { pts: [c(-1, -1, 1), c(1, -1, 1), c(1, 1, 1), c(-1, 1, 1)], tag: 'box' },
    { pts: [c(1, -1, -1), c(-1, -1, -1), c(-1, 1, -1), c(1, 1, -1)], tag: 'box' },
  ];
}

function clip(faces, pl) {
  const out = [];
  const cut = [];
  for (const f of faces) {
    const res = [];
    const Q = f.pts;
    for (let i = 0; i < Q.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length];
      const da = pl.n.dot(a) - pl.d, db = pl.n.dot(b) - pl.d;
      if (da <= 1e-9) res.push(a);
      if (Math.abs(da) <= 1e-9) cut.push(a);
      if ((da < -1e-9 && db > 1e-9) || (da > 1e-9 && db < -1e-9)) {
        const p = a.clone().lerp(b, da / (da - db));
        res.push(p);
        cut.push(p);
      }
    }
    const clean = dedupe(res, true);
    if (clean.length >= 3) out.push({ pts: clean, tag: f.tag });
  }
  const cap = dedupe(cut, false);
  if (cap.length >= 3) {
    const c = cap.reduce((s, p) => s.add(p), v3(0, 0, 0)).divideScalar(cap.length);
    const u = cap[0].clone().sub(c).normalize();
    const w = pl.n.clone().normalize().cross(u);
    cap.sort((p, q) => Math.atan2(p.clone().sub(c).dot(w), p.clone().sub(c).dot(u)) - Math.atan2(q.clone().sub(c).dot(w), q.clone().sub(c).dot(u)));
    out.push({ pts: cap, tag: pl.tag });
  }
  return out;
}

function dedupe(pts, cyclic) {
  const out = [];
  for (const p of pts) if (!out.some((q) => q.distanceToSquared(p) < 1e-14)) out.push(p);
  if (cyclic) {
    // keep order, drop consecutive repeats only
    const r = [];
    for (const p of pts) if (!r.length || r[r.length - 1].distanceToSquared(p) > 1e-14) r.push(p);
    while (r.length > 1 && r[0].distanceToSquared(r[r.length - 1]) < 1e-14) r.pop();
    return r;
  }
  return out;
}

export function solid(planes) {
  let faces = cube(60);
  for (const pl of planes) faces = clip(faces, pl);
  return faces;
}

const plane = (n, p, tag) => ({ n: n.clone().normalize(), d: n.clone().normalize().dot(p), tag });

const AX = [v3(1, 0, 0), v3(0, 1, 0), v3(0, 0, 1)];
const AXN = ['x', 'y', 'z'];

// A square bar from corner `a` (half-width ha) along axis `i` to corner `b`
// (half-width hb), mitred at both ends against the neighbouring bars (axes
// `prev` and `next`). It keeps a constant section for FLAT metres at each end,
// so every joint meets exactly, and tapers in between. Returned as three
// convex pieces: [start, taper, end].
export const FLAT = 1.1;
function barPieces(a, b, i, ha, hb, prev, next) {
  const u = AX[i];
  const len = b.clone().sub(a).dot(u);
  const sides = (s0, h0, s1, h1) => {
    const slope = (h1 - h0) / (s1 - s0);
    const out = [];
    for (const j of [0, 1, 2]) {
      if (j === i) continue;
      for (const sgn of [1, -1]) {
        // sgn·(p·(X − a)) − slope·(u·(X − a) − s0) ≤ h0
        const n = AX[j].clone().multiplyScalar(sgn).addScaledVector(u, -slope);
        out.push({ n, d: n.dot(a) + h0 - slope * s0, tag: `side:${sgn > 0 ? '+' : '-'}${AXN[j]}` });
      }
    }
    return out;
  };
  const cutAt = (s, keepBelow) => {
    const p = a.clone().addScaledVector(u, s);
    return plane(keepBelow ? u : u.clone().negate(), p, 'seg');
  };
  const ms = AX[prev].clone().add(u);
  const start = plane(ms.clone().negate(), a, `mitre:${AXN[3 - prev - i]}`);
  const me = u.clone().add(AX[next]);
  const end = plane(me, b, `mitre:${AXN[3 - i - next]}`);
  return [
    [...sides(0, ha, 1, ha), start, cutAt(FLAT, true)],
    [...sides(FLAT, ha, len - FLAT, hb), cutAt(FLAT, false), cutAt(len - FLAT, true)],
    [...sides(0, hb, 1, hb), cutAt(len - FLAT, false), end],
  ];
}

export const BAR_A = barPieces(P[0], P[1], 0, HW[0], HW[1], 2, 1);
export const BAR_B = barPieces(P[1], P[2], 1, HW[1], HW[2], 0, 2);
export const BAR_C = barPieces(P[2], P[3], 2, HW[2], HW[3], 1, 0);

// The end of the virtual bar C′ = H⁻¹(C) arriving at P0: the image, under
// H⁻¹, of C's last (constant) piece.
function virtualCEnd() {
  const planes = BAR_C[2].map((pl) => {
    // transform plane n·x ≤ d by H⁻¹: x = H y ⇒ n·(V + K(y − V)) ≤ d
    const d = (pl.d - pl.n.dot(V_LOCAL) * (1 - K)) / K;
    return { n: pl.n.clone(), d, tag: pl.tag };
  });
  return solid(planes);
}

// The nose: the part of bar A that, seen from V, lies in front of C′'s end.
// It is A ∩ hull(V ∪ C′end): C′end's faces turned away from V, plus the
// planes through V and C′end's silhouette edges.
function nosePlanes(cEnd) {
  const planes = [];
  const front = cEnd.map((f) => {
    const n = faceNormal(f.pts);
    return n.dot(V_LOCAL.clone().sub(f.pts[0])) > 0;
  });
  cEnd.forEach((f, i) => {
    if (!front[i]) planes.push(plane(faceNormal(f.pts), f.pts[0], 'cut'));
  });
  // silhouette edges: shared by a front and a back face
  for (let i = 0; i < cEnd.length; i++) {
    const Q = cEnd[i].pts;
    for (let e = 0; e < Q.length; e++) {
      const a = Q[e], b = Q[(e + 1) % Q.length];
      for (let j = 0; j < cEnd.length; j++) {
        if (j === i || front[i] === front[j]) continue;
        if (!hasEdge(cEnd[j].pts, a, b)) continue;
        if (!front[i]) continue; // handle each edge once, from its front face
        let n = b.clone().sub(a).cross(V_LOCAL.clone().sub(a)).normalize();
        // orient so the solid is inside
        const c = centroid(cEnd.flatMap((f) => f.pts));
        if (n.dot(c.clone().sub(a)) > 0) n.negate();
        planes.push({ n, d: n.dot(a), tag: 'cut' });
      }
    }
  }
  return planes;
}

function hasEdge(Q, a, b) {
  for (let k = 0; k < Q.length; k++) {
    const p = Q[k], q = Q[(k + 1) % Q.length];
    if ((p.distanceToSquared(a) < 1e-10 && q.distanceToSquared(b) < 1e-10) || (p.distanceToSquared(b) < 1e-10 && q.distanceToSquared(a) < 1e-10)) return true;
  }
  return false;
}

export function faceNormal(Q) {
  const n = v3(0, 0, 0);
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i], b = Q[(i + 1) % Q.length];
    n.x += (a.y - b.y) * (a.z + b.z);
    n.y += (a.z - b.z) * (a.x + b.x);
    n.z += (a.x - b.x) * (a.y + b.y);
  }
  return n.normalize();
}

function centroid(pts) {
  return pts.reduce((s, p) => s.add(p), v3(0, 0, 0)).divideScalar(pts.length);
}

export function sculptureParts() {
  const cEnd = virtualCEnd();
  return {
    A: BAR_A.map(solid),
    B: BAR_B.map(solid),
    C: BAR_C.map(solid),
    W: solid([...BAR_A[0], ...nosePlanes(cEnd)]),
    cEnd,
  };
}

// ------------------------------------------------------------- world pose
// The sculpture is turned so that bar B lies level (it rests on two posts),
// the eye sits at standing height and the far corner is DIST away.
// Unknown: the elevation α of the sight line; found by bisection so the two
// lower corners are at BASE_Y.
function frameFor(alpha) {
  const n = v3(1, 1, 1).normalize();
  const hz = v3(0, 0, 1); // the viewer looks towards −z
  const m = hz.clone().multiplyScalar(Math.cos(alpha)).add(v3(0, -Math.sin(alpha), 0)); // from P0 towards the eye
  const cb = 1 / (Math.sqrt(3) * Math.cos(alpha));
  const sb = Math.sqrt(Math.max(0, 1 - cb * cb));
  let best = null;
  for (const sgnB of [1, -1]) {
    const b = v3(sgnB * sb, 0, cb); // horizontal, b·m = 1/√3
    const s = m.clone().multiplyScalar(Math.sqrt(3)).sub(b); // a + c
    for (const sgnD of [1, -1]) {
      const d = b.clone().cross(s).multiplyScalar(sgnD); // a − c
      const a = s.clone().add(d).multiplyScalar(0.5);
      const c = s.clone().sub(d).multiplyScalar(0.5);
      if (a.clone().cross(b).dot(c) < 0.99) continue; // right-handed only
      if (!(a.y < 0 && c.y > 0)) continue; // apex up
      if (!best || a.x < best.a.x) best = { a, b, c, m, n };
    }
  }
  return best;
}

export function solvePose() {
  const eyeW = v3(0, EYE, 0);
  const at = (alpha) => {
    const fr = frameFor(alpha);
    const R = new THREE.Matrix4().makeBasis(fr.a, fr.b, fr.c);
    const T = eyeW.clone().sub(V_LOCAL.clone().applyMatrix4(R));
    const M = new THREE.Matrix4().makeTranslation(T.x, T.y, T.z).multiply(R);
    return { M, R, fr };
  };
  let lo = 0.0, hi = 0.6;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const y = P[1].clone().applyMatrix4(at(mid).M).y;
    if (y > BASE_Y) hi = mid; else lo = mid;
  }
  const alpha = (lo + hi) / 2;
  const pose = at(alpha);
  // move everything so the middle of the base sits over the origin
  const k1 = P[1].clone().applyMatrix4(pose.M), k2 = P[2].clone().applyMatrix4(pose.M);
  const mid = k1.clone().add(k2).multiplyScalar(0.5);
  const shift = new THREE.Matrix4().makeTranslation(-mid.x, 0, -mid.z);
  const M = shift.clone().multiply(pose.M);
  const eye = V_LOCAL.clone().applyMatrix4(M);
  return { alpha, M, R: pose.R, frame: pose.fr, eye, world: (p) => p.clone().applyMatrix4(M) };
}
