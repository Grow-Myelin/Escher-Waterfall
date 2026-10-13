// Geometry of the two-creature tiling: a checkerboard of light and dark
// cells, deformed so that every light cell is a bird and every dark cell a
// fish. It has only translations as symmetries (plane group p1, with two
// creatures in each repeat).
//
// Birds sit at m·A + n·B, fish at the same points plus F = (A + B) / 2.
// The bird is bounded by four free curves, from its corners
//   P (top right), Q (top left), P − A (bottom left), Q + B (bottom right),
// and the fish is bounded by the same four curves, each moved by a lattice
// translation and run backwards. So the two shapes fit together exactly,
// whatever the curves are.

export const W = 1.2; // cell width
export const H = 1.0; // cell height
export const A = [W, H];
export const B = [W, -H];
export const F = [W, 0];

const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function corners(P, Q) {
  return { TR: P, TL: Q, BL: sub(P, A), BR: add(Q, B) };
}

// edge frames (u along the edge, v outward from the bird, in edge lengths)
export function fromEdge(a, b, u, v) {
  const d = sub(b, a), n = [d[1], -d[0]];
  return [a[0] + u * d[0] + v * n[0], a[1] + u * d[1] + v * n[1]];
}
export function toEdge(a, b, p) {
  const d = sub(b, a), n = [d[1], -d[0]], q = sub(p, a);
  const l2 = d[0] * d[0] + d[1] * d[1];
  return [(q[0] * d[0] + q[1] * d[1]) / l2, (q[0] * n[0] + q[1] * n[1]) / l2];
}

export function catmullRom(pts, n) {
  const P = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts];
  const m = pts.length;
  P.push([2 * pts[m - 1][0] - pts[m - 2][0], 2 * pts[m - 1][1] - pts[m - 2][1]]);
  const out = [pts[0].slice()];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const t0 = 0, t1 = t0 + Math.sqrt(dist(p0, p1)) + 1e-6, t2 = t1 + Math.sqrt(dist(p1, p2)) + 1e-6, t3 = t2 + Math.sqrt(dist(p2, p3)) + 1e-6;
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

export const SAMPLES = 90;

// the four bird edges, counter-clockwise: right (BR→TR), top (TR→TL),
// left (TL→BL), bottom (BL→BR)
export function edgeEnds(P, Q) {
  const c = corners(P, Q);
  return [[c.BR, c.TR], [c.TR, c.TL], [c.TL, c.BL], [c.BL, c.BR]];
}

export function birdEdges(P, Q, handles) {
  return edgeEnds(P, Q).map(([a, b], k) => {
    const pts = [a, ...handles[k].map((h) => fromEdge(a, b, h[0], h[1])), b];
    return resample(catmullRom(pts, 10), SAMPLES);
  });
}

const shift = (poly, t) => poly.map((p) => [p[0] + t[0], p[1] + t[1]]);
const rev = (poly) => poly.slice().reverse();

// Outlines (closed, counter-clockwise, without repeated end points) of the
// bird at the origin and of the fish at F.
export function outlines(edges) {
  const [right, top, left, bottom] = edges;
  const join = (list) => { const o = []; for (const e of list) for (let i = 0; i < e.length - 1; i++) o.push(e[i]); return o; };
  const bird = join([right, top, left, bottom]);
  const fish = join([rev(right), shift(rev(top), B), shift(rev(left), add(A, B)), shift(rev(bottom), A)]);
  return { bird, fish };
}

export function selfCrosses(poly) {
  const n = poly.length;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    const a = poly[i], b = poly[(i + 1) % n], c = poly[j], d = poly[(j + 1) % n];
    const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    if ((d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0)) return a;
  }
  return null;
}
