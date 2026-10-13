// The lizard tile and its tessellation.
//
// The tile is a hexagon (circumradius 1, corners H0..H5 counter-clockwise from
// the right) whose edges are bent in pairs. Three alternate corners, H0, H2
// and H4, are centres of three-fold rotation: the edge leaving each of them
// on one side is the edge on the other side turned by 120° about it. So only
// three curves are free (c from H0, d from H2, e from H4); the other three are
// copies. Three lizards meet at each of these corners — at H0 their heads, at
// H2 their left hind legs, at H4 their right hind legs — and copies of the
// tile turned by 0°, 120° and 240° fill the plane with no gaps (wallpaper
// group p3, the symmetry of Escher's Reptiles; the creature itself is new).

const S3 = Math.sqrt(3) / 2;
export const H = [[1, 0], [0.5, S3], [-0.5, S3], [-1, 0], [-0.5, -S3], [0.5, -S3]];

// The three free edge curves, as (t, n) points relative to their edge: t runs
// along the straight edge from its first corner (0) to its second (1), n is
// the offset outward (to the right of travel), both in units of the edge.
// A bump on one of these edges is the same lizard's limb; its turned copy on
// the partner edge is a dent that holds a neighbour's limb.
const C = [ // H0 → H1: the left front leg, a neighbour's head, the left flank
  [0, 0], [0.035, 0.07], [0.045, 0.15], [0.025, 0.23], [-0.025, 0.28], [-0.05, 0.33], [-0.015, 0.36],
  [0.0, 0.41], [0.05, 0.41], [0.09, 0.44], [0.13, 0.4], [0.15, 0.32], [0.17, 0.22], [0.21, 0.12],
  [0.26, 0.04], [0.29, -0.06], [0.28, -0.18], [0.28, -0.32], [0.33, -0.45], [0.42, -0.54],
  [0.52, -0.57], [0.62, -0.53], [0.68, -0.43], [0.69, -0.3], [0.68, -0.18], [0.69, -0.07],
  [0.74, 0.02], [0.82, 0.06], [0.9, 0.06], [0.96, 0.03], [1, 0],
];
const D = [ // H2 → H3: a neighbour's left hind leg, then the tail
  [0, 0], [0.04, -0.07], [0.06, -0.16], [0.05, -0.25], [0.02, -0.3], [0.03, -0.35], [0.08, -0.36],
  [0.11, -0.4], [0.15, -0.37], [0.19, -0.37], [0.2, -0.3], [0.21, -0.21], [0.24, -0.11],
  [0.29, -0.03], [0.34, 0.04], [0.37, 0.14], [0.44, 0.24], [0.55, 0.31], [0.68, 0.35],
  [0.82, 0.35], [0.94, 0.31], [1.03, 0.25], [1.07, 0.2], [0.99, 0.19], [0.87, 0.2],
  [0.76, 0.17], [0.68, 0.11], [0.65, 0.03], [0.72, 0.0], [0.86, 0.0], [1, 0],
];
const E = [ // H4 → H5: the right front leg, then a neighbour's right hind leg
  [0, 0], [0.1, 0.04], [0.2, 0.06], [0.29, 0.05], [0.35, 0.03],
  [0.38, 0.1], [0.42, 0.19], [0.47, 0.26], [0.53, 0.3], [0.58, 0.33], [0.6, 0.38], [0.65, 0.37],
  [0.68, 0.4], [0.72, 0.36], [0.74, 0.31], [0.72, 0.25], [0.67, 0.2], [0.64, 0.13], [0.63, 0.05],
  [0.67, -0.01], [0.71, -0.07], [0.73, -0.16], [0.72, -0.24], [0.74, -0.3], [0.79, -0.31],
  [0.83, -0.35], [0.87, -0.31], [0.9, -0.3], [0.9, -0.22], [0.91, -0.13], [0.94, -0.05], [1, 0],
];
const onEdge = (a, b, [t, n]) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return [a[0] + t * dx + n * dy, a[1] + t * dy - n * dx];
};

function rot(p, c, a) {
  const s = Math.sin(a), k = Math.cos(a);
  const x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + k * x - s * y, c[1] + s * x + k * y];
}

// Catmull–Rom through the points, `per` samples per span, endpoints exact.
function spline(P, per) {
  const out = [];
  for (let k = 0; k < P.length - 1; k++) {
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
    for (let s = 0; s < per; s++) {
      const u = s / per, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}

const T120 = (2 * Math.PI) / 3;

// The closed outline, counter-clockwise, as six sampled edges.
export function outlineEdges(per = 10) {
  const c = spline(C.map((p) => onEdge(H[0], H[1], p)), per);
  const d = spline(D.map((p) => onEdge(H[2], H[3], p)), per);
  const e = spline(E.map((p) => onEdge(H[4], H[5], p)), per);
  const e0 = c;
  const e1 = d.map((p) => rot(p, H[2], T120)).reverse(); // H1 → H2
  const e2 = d;
  const e3 = e.map((p) => rot(p, H[4], T120)).reverse(); // H3 → H4
  const e4 = e;
  const e5 = c.map((p) => rot(p, H[0], T120)).reverse(); // H5 → H0
  return [e0, e1, e2, e3, e4, e5];
}

export function outline(per = 10) {
  const ring = [];
  for (const e of outlineEdges(per)) for (let k = 0; k < e.length - 1; k++) ring.push(e[k]);
  return ring;
}

// A placement is x' = A x + t with A a rotation by a multiple of 120°.
// orient (0, 1, 2) is that multiple; it picks the tile's colour.
function compose(a, b) { // a ∘ b
  return { r: (a.r + b.r) % 3, t: apply(a, b.t) };
}
export function apply(pl, p) {
  const a = (pl.r * T120);
  const s = Math.sin(a), k = Math.cos(a);
  return [k * p[0] - s * p[1] + pl.t[0], s * p[0] + k * p[1] + pl.t[1]];
}
function rotAbout(c, n) { // rotation by n·120° about point c, as a placement
  const a = n * T120, s = Math.sin(a), k = Math.cos(a);
  return { r: ((n % 3) + 3) % 3, t: [c[0] - (k * c[0] - s * c[1]), c[1] - (s * c[0] + k * c[1])] };
}

// Every placement whose centre lies within `radius` of the origin.
export function tessellate(radius) {
  const seen = new Map();
  const key = (p) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;
  const start = { r: 0, t: [0, 0] };
  const queue = [start];
  seen.set(key([0, 0]), start);
  const out = [];
  while (queue.length) {
    const pl = queue.shift();
    out.push(pl);
    for (const hi of [0, 2, 4]) {
      const c = apply(pl, H[hi]);
      for (const n of [1, 2]) {
        const q = compose(rotAbout(c, n), pl);
        const centre = apply(q, [0, 0]);
        if (Math.hypot(centre[0], centre[1]) > radius) continue;
        const k = key(centre);
        if (seen.has(k)) continue;
        seen.set(k, q);
        queue.push(q);
      }
    }
  }
  return out;
}

// The lizard's skeleton in tile coordinates: the spine from the tip of the
// tail to the snout, the joints its legs swing about and their feet, and the
// eyes.
export const SPINE = [
  [-1.215, 0.06], [-1.2, 0.22], [-1.13, 0.42], [-0.98, 0.55], [-0.76, 0.52], [-0.5, 0.36],
  [-0.2, 0.16], [0.1, -0.03], [0.43, -0.24], [0.68, -0.37], [0.9, -0.48], [1.1, -0.58], [1.24, -0.66],
];
export const LEGS = [
  { name: 'left front', joint: [0.74, 0.0], foot: [1.33, 0.3], phase: 0 },
  { name: 'right front', joint: [0.2, -0.68], foot: [0.18, -1.22], phase: Math.PI },
  { name: 'left hind', joint: [-0.3, 0.68], foot: [-0.42, 1.22], phase: Math.PI },
  { name: 'right hind', joint: [-0.7, -0.06], foot: [-1.24, -0.33], phase: 0 },
];
export const EYES = [[1.06, -0.46], [0.95, -0.69]];
