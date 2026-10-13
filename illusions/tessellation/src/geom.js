// Geometry of the construction: a regular hexagon whose edges are bent in
// partner pairs, and the plane group p3 that carries the tile everywhere.
//
// The hexagon has circumradius 1, centre at the origin and corner V0 at the
// top; corners run counter-clockwise V0..V5. The corners alternate between two
// kinds:
//
//   A corners V0, V2, V4: fixed. They are the three-fold rotation centres.
//   B corners V1, V3, V5: free, but they move together (V3 and V5 follow V1).
//
// At each A corner the two edges that meet are partners: one is the other
// turned 120° about that corner (Heesch type C3C3C3C3C3C3). Only E0, E2 and E4
// are drawn freely ("master" edges); E5, E1 and E3 are their turned copies.
// Every point of a shared edge is computed by the exact same rotation the
// group uses to place the neighbouring tile, so the tiles meet without gaps.

export const DEG = Math.PI / 180;
export const TURN = 120 * DEG;

const C3 = [1, Math.cos(TURN), Math.cos(2 * TURN)];
const S3 = [0, Math.sin(TURN), Math.sin(2 * TURN)];

export function rotK(k, p) {
  const c = C3[k], s = S3[k];
  return [c * p[0] - s * p[1], s * p[0] + c * p[1]];
}

// Rotation by +120° (counter-clockwise) about c, applied k times.
export function turnAbout(c, p, k = 1) {
  const q = rotK(((k % 3) + 3) % 3, [p[0] - c[0], p[1] - c[1]]);
  return [q[0] + c[0], q[1] + c[1]];
}

export const HEX = Array.from({ length: 6 }, (_, k) => [Math.cos((90 + 60 * k) * DEG), Math.sin((90 + 60 * k) * DEG)]);
export const A_CORNERS = [HEX[0], HEX[2], HEX[4]];

// All six corners for a given position of the free corner V1.
export function corners(v1) {
  const V = new Array(6);
  V[0] = HEX[0]; V[2] = HEX[2]; V[4] = HEX[4];
  V[1] = v1;
  V[5] = turnAbout(V[0], v1, 1);
  V[3] = turnAbout(V[2], v1, -1); // and equally turnAbout(V[4], V[5], 1)
  return V;
}

// ------------------------------------------------------------ the plane group
// Elements are maps p -> R(k·120°) p + t, stored as { k, t }.
export function act(g, p) {
  const q = rotK(g.k, p);
  return [q[0] + g.t[0], q[1] + g.t[1]];
}
export function compose(g, h) { // g ∘ h
  const t = rotK(g.k, h.t);
  return { k: (g.k + h.k) % 3, t: [t[0] + g.t[0], t[1] + g.t[1]] };
}
function turnElement(c, k) {
  const rc = rotK(k, c);
  return { k, t: [c[0] - rc[0], c[1] - rc[1]] };
}
// The three generating turns (and their inverses) about the A corners.
const GENS = A_CORNERS.flatMap((c) => [turnElement(c, 1), turnElement(c, 2)]);

// Every copy of the tile whose centre lies inside the box [x0,x1]×[y0,y1].
// k is the orientation (and colour) of the copy.
export function tileCopies(x0, y0, x1, y1) {
  const seen = new Set();
  const out = [];
  const queue = [{ k: 0, t: [0, 0] }];
  const key = (g) => `${g.k}:${Math.round(g.t[0] * 1e4)}:${Math.round(g.t[1] * 1e4)}`;
  seen.add(key(queue[0]));
  while (queue.length) {
    const g = queue.shift();
    out.push(g);
    for (const s of GENS) {
      const h = compose(g, s);
      const [x, y] = h.t;
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      const kk = key(h);
      if (seen.has(kk)) continue;
      seen.add(kk);
      queue.push(h);
    }
  }
  return out;
}

// Rotation centres of the whole plane inside a box, by class (0: images of V0,
// 1: of V2, 2: of V4). Each is a point where three tiles meet turned by 120°.
export function rotationCentres(copies) {
  const seen = new Set();
  const out = [[], [], []];
  for (const g of copies) {
    for (let c = 0; c < 3; c++) {
      const p = act(g, A_CORNERS[c]);
      const kk = `${Math.round(p[0] * 1e3)}:${Math.round(p[1] * 1e3)}`;
      if (seen.has(kk)) continue;
      seen.add(kk);
      out[c].push(p);
    }
  }
  return out;
}

// Translations of the group (a lattice basis): turn about V2 after undoing the
// turn about V0, and likewise with V4.
export function latticeBasis() {
  const inv0 = turnElement(A_CORNERS[0], 2);
  return [compose(turnElement(A_CORNERS[1], 1), inv0).t, compose(turnElement(A_CORNERS[2], 1), inv0).t];
}

// ------------------------------------------------------------ curves
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Centripetal Catmull–Rom spline through pts, n samples per span.
export function catmullRom(pts, n) {
  const P = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts];
  const m = pts.length;
  P.push([2 * pts[m - 1][0] - pts[m - 2][0], 2 * pts[m - 1][1] - pts[m - 2][1]]);
  const out = [pts[0].slice()];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const t0 = 0;
    const t1 = t0 + Math.sqrt(dist(p0, p1)) + 1e-6;
    const t2 = t1 + Math.sqrt(dist(p1, p2)) + 1e-6;
    const t3 = t2 + Math.sqrt(dist(p2, p3)) + 1e-6;
    for (let j = 1; j <= n; j++) {
      const t = t1 + ((t2 - t1) * j) / n;
      const pt = [0, 0];
      for (let c = 0; c < 2; c++) {
        const a1 = ((t1 - t) / (t1 - t0)) * p0[c] + ((t - t0) / (t1 - t0)) * p1[c];
        const a2 = ((t2 - t) / (t2 - t1)) * p1[c] + ((t - t1) / (t2 - t1)) * p2[c];
        const a3 = ((t3 - t) / (t3 - t2)) * p2[c] + ((t - t2) / (t3 - t2)) * p3[c];
        const b1 = ((t2 - t) / (t2 - t0)) * a1 + ((t - t0) / (t2 - t0)) * a2;
        const b2 = ((t3 - t) / (t3 - t1)) * a2 + ((t - t1) / (t3 - t1)) * a3;
        pt[c] = ((t2 - t) / (t2 - t1)) * b1 + ((t - t1) / (t2 - t1)) * b2;
      }
      out.push(pt);
    }
  }
  out[out.length - 1] = pts[m - 1].slice();
  return out;
}

// Resample a polyline to n+1 points evenly spaced along its length.
export function resample(poly, n) {
  const L = [0];
  for (let i = 1; i < poly.length; i++) L.push(L[i - 1] + dist(poly[i], poly[i - 1]));
  const total = L[L.length - 1] || 1;
  const out = [];
  let j = 1;
  for (let i = 0; i <= n; i++) {
    const s = (total * i) / n;
    while (j < poly.length - 1 && L[j] < s) j++;
    const f = (s - L[j - 1]) / (L[j] - L[j - 1] || 1);
    out.push([poly[j - 1][0] + (poly[j][0] - poly[j - 1][0]) * f, poly[j - 1][1] + (poly[j][1] - poly[j - 1][1]) * f]);
  }
  out[0] = poly[0].slice();
  out[n] = poly[poly.length - 1].slice();
  return out;
}

// Edge frame: origin A, x along A→B, y along the outward normal (to the right
// of A→B, since the tile runs counter-clockwise). Both axes have length |AB|.
export function toEdge(A, B, p) {
  const d = sub(B, A), n = [d[1], -d[0]], q = sub(p, A);
  const l2 = d[0] * d[0] + d[1] * d[1];
  return [(q[0] * d[0] + q[1] * d[1]) / l2, (q[0] * n[0] + q[1] * n[1]) / l2];
}
export function fromEdge(A, B, u, v) {
  const d = sub(B, A), n = [d[1], -d[0]];
  return [A[0] + u * d[0] + v * n[0], A[1] + u * d[1] + v * n[1]];
}

export const SAMPLES = 120;

function frames(poly) {
  const n = poly.length - 1;
  const T = [], N = [];
  for (let i = 0; i <= n; i++) {
    const a = poly[Math.max(0, i - 1)], b = poly[Math.min(n, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    T.push([tx / l, ty / l]);
    N.push([ty / l, -tx / l]); // right-hand normal: outward
  }
  return { T, N };
}

function baseCurve(A, B, handles, wiggle) {
  const pts = [A];
  for (const h of handles) pts.push(fromEdge(A, B, h[0], h[1] + (wiggle ? wiggle(h) : 0)));
  pts.push(B);
  return resample(catmullRom(pts, 12), SAMPLES);
}

// The fine shape of a design that a few handles cannot hold: the difference
// between the full design curve and the spline through the chosen handles,
// in the spline's own frame (tangent, normal), in edge lengths.
export function residualFor(A, B, full, majors) {
  const fine = baseCurve(A, B, full);
  const base = baseCurve(A, B, majors);
  const { T, N } = frames(base);
  const L = dist(A, B);
  return base.map((p, i) => {
    const dx = (fine[i][0] - p[0]) / L, dy = (fine[i][1] - p[1]) / L;
    return [dx * T[i][0] + dy * T[i][1], dx * N[i][0] + dy * N[i][1]];
  });
}

// One master edge from A to B: a smooth curve through the handles plus the
// design's residual, bent from the straight edge by s (0 straight … 1 full),
// with small fixed lobes (toes) [t, amplitude, half-width] scaled by sd.
// Returns SAMPLES+1 points.
export function masterEdge(A, B, handles, residual, bumps, s, sd, wiggle) {
  const base = baseCurve(A, B, handles, wiggle);
  const L = dist(A, B);
  let cur = base;
  if (residual) {
    const { T, N } = frames(base);
    cur = base.map((p, i) => {
      const r = residual[i];
      return [p[0] + L * (r[0] * T[i][0] + r[1] * N[i][0]), p[1] + L * (r[0] * T[i][1] + r[1] * N[i][1])];
    });
  }
  if (s < 1) {
    cur = cur.map((p, i) => {
      const t = i / SAMPLES;
      const q = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
      return [q[0] + (p[0] - q[0]) * s, q[1] + (p[1] - q[1]) * s];
    });
  }
  if (bumps && bumps.length && sd > 0) {
    const { N } = frames(cur);
    cur = cur.map((p, i) => {
      if (i === 0 || i === SAMPLES) return p;
      const t = i / SAMPLES;
      let off = 0;
      for (const [bt, a, w] of bumps) {
        const x = (t - bt) / w;
        if (x > -1 && x < 1) off += a * (1 - x * x) * (1 - x * x);
      }
      return off ? [p[0] + N[i][0] * off * sd * L, p[1] + N[i][1] * off * sd * L] : p;
    });
  }
  cur[0] = A.slice();
  cur[SAMPLES] = B.slice();
  return cur;
}

// The six edges of the tile, each running counter-clockwise, from the three
// master edges. Returns { edges: [E0..E5], outline: closed polygon }.
export function tileEdges(V, masters) {
  const E = new Array(6);
  for (let j = 0; j < 3; j++) {
    const a = 2 * j;
    E[a] = masters[j];
    // the partner ends at the same A corner: the master turned 120° about it, reversed
    const turned = masters[j].map((p) => turnAbout(V[a], p, 1));
    E[(a + 5) % 6] = turned.reverse();
  }
  const outline = [];
  for (const e of E) for (let i = 0; i < e.length - 1; i++) outline.push(e[i]);
  return { edges: E, outline };
}

// Where (if anywhere) a closed polygon crosses itself. Only checked while editing.
export function selfCrosses(poly) {
  const n = poly.length;
  const seg = (i) => [poly[i], poly[(i + 1) % n]];
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  // bucket segments in a grid to keep this fast
  const cell = 0.08, grid = new Map();
  for (let i = 0; i < n; i++) {
    const [a, b] = seg(i);
    const x0 = Math.floor(Math.min(a[0], b[0]) / cell), x1 = Math.floor(Math.max(a[0], b[0]) / cell);
    const y0 = Math.floor(Math.min(a[1], b[1]) / cell), y1 = Math.floor(Math.max(a[1], b[1]) / cell);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      const k = x * 7919 + y;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    }
  }
  for (const list of grid.values()) {
    for (let p = 0; p < list.length; p++) for (let q = p + 1; q < list.length; q++) {
      const i = list[p], j = list[q];
      if (Math.abs(i - j) <= 1 || Math.abs(i - j) === n - 1) continue;
      const [a, b] = seg(i), [c, d] = seg(j);
      const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
      if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) {
        const t = d1 / (d1 - d2);
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
    }
  }
  return null;
}
