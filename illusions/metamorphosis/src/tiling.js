// The strip as one planar map whose shape is a function of x.
//
// Every tile has hexagonal topology: six vertices, six edges, three tiles at
// each vertex. A square is the special case in which two opposite edges have
// zero length (the vertex where four squares meet is a contracted edge).
//
// Tiles are indexed by lattice coordinates (i, j): i counts columns along the
// strip, j counts tiles up a column. Lattice space is mapped to the page by
//
//   Φ(ξ, η) = ( X(ξ), η + Y(ξ) ),   X' = w(ξ),  Y' = o(ξ)
//
// where w is the column spacing and o the vertical offset from one column to
// the next: (w, o) = (1, 0) gives squares, (√3/2, 1/2) regular hexagons.
//
// Exactness does not depend on the shapes: each vertex and each edge curve is
// computed once, from the morph parameters at its own position, and is then
// shared by the tiles on either side. A tile is the face bounded by six such
// shared edges, so neighbouring tiles always meet with no gap and no overlap,
// however fast the parameters change.

import { EDGE_DESIGNS, tileDetails } from './creatures.js';

export const J = 54; // columns in one loop of the strip
const SUB = 64; // integration steps per column
const SQ3 = Math.sqrt(3);

const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const ramp = (x, a, b) => sm((x - a) / (b - a));
const band = (x, a, b, c, d) => ramp(x, a, b) - ramp(x, c, d);

export const wrapXi = (xi) => ((xi % J) + J) % J;

// Morph parameters along the strip (ξ in columns).
//   fish  – square tiles grow into fish
//   lat   – lattice: 0 squares, 1 regular hexagons
//   honey – hexagons read as wax cells
//   tort  – cells grow heads and legs: tortoises
//   cell  – the cell / shell drawing inside each hexagon (honey and tort)
//   shell – that drawing as a honeycomb cell (0) or a tortoise shell (1)
//   cube  – each hexagon splits into three rhombi: a stack of cubes
export function tracks(xi) {
  const x = wrapXi(xi);
  const cell = band(x, 21, 24, 37, 41);
  const shell = ramp(x, 26.5, 31);
  return {
    fish: band(x, 3, 8.5, 12.5, 18),
    lat: band(x, 14, 20, 42, 48),
    honey: cell * (1 - shell),
    tort: band(x, 28, 33, 37, 41),
    cell,
    shell,
    cube: band(x, 40.5, 43, 47.5, 51),
  };
}

export const STAGES = [
  { xi: 0, label: 'checkerboard' },
  { xi: 10.5, label: 'fish' },
  { xi: 19.5, label: 'hexagons' },
  { xi: 25.5, label: 'honeycomb' },
  { xi: 35, label: 'tortoises' },
  { xi: 44.5, label: 'cubes' },
];

export function lattice(xi) {
  const L = tracks(xi).lat;
  const a = 0.5 + (1 / 3 - 0.5) * L; // vertex P0 in lattice coordinates (a, a)
  return { a, b: a, w: 1 + (SQ3 / 2 - 1) * L, o: 0.5 * L };
}

// ------------------------------------------------------------- the map Φ
const N = J * SUB;
const TX = new Float64Array(N + 1);
const TY = new Float64Array(N + 1);
{
  let px = lattice(0);
  for (let k = 1; k <= N; k++) {
    const p = lattice(k / SUB);
    TX[k] = TX[k - 1] + (px.w + p.w) / (2 * SUB);
    TY[k] = TY[k - 1] + (px.o + p.o) / (2 * SUB);
    px = p;
  }
  // The column offsets must add up to a whole number of rows so the strip
  // closes on itself; the schedule is chosen so they do (28 × ½ = 14).
  const D = Math.round(TY[N]);
  const k = D / TY[N];
  for (let i = 0; i <= N; i++) TY[i] *= k;
}
export const LOOP = TX[N]; // length of one loop, in rows
export const DRIFT = TY[N]; // rows the columns climb in one loop

function table(T, total, xi) {
  const k = Math.floor(xi / J);
  const f = (xi - k * J) * SUB;
  const i = Math.min(N - 1, Math.floor(f));
  const u = f - i;
  return k * total + T[i] * (1 - u) + T[i + 1] * u;
}
export const Xof = (xi) => table(TX, LOOP, xi);
export const Yof = (xi) => table(TY, DRIFT, xi);
export function phi(xi, eta) {
  return [Xof(xi), eta + Yof(xi)];
}

// ξ for a given page x (inverse of X), by bisection.
export function xiOf(x) {
  const k = Math.floor(x / LOOP);
  const f = x - k * LOOP;
  let lo = 0, hi = N;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (TX[m] <= f) lo = m; else hi = m;
  }
  const u = (f - TX[lo]) / (TX[hi] - TX[lo] || 1);
  return k * J + (lo + u) / SUB;
}

// ------------------------------------------------------------- shared vertices
// A(i, j) is P0 (upper right) of tile (i, j), B(i, j) its P1 (upper left).
// The six corners of tile (i, j) are
//   P0 = A(i,j)  P1 = B(i,j)  P2 = A(i-1,j)  P3 = B(i,j-1)  P4 = A(i,j-1)  P5 = B(i+1,j-1)
const vcache = new Map();
function vA(i, j) {
  const key = `A${i},${j}`;
  let v = vcache.get(key);
  if (!v) {
    const p = lattice(i + 0.4);
    v = phi(i + p.a, j + p.b);
    vcache.set(key, v);
  }
  return v;
}
function vB(i, j) {
  const key = `B${i},${j}`;
  let v = vcache.get(key);
  if (!v) {
    const p = lattice(i - 0.4);
    v = phi(i - p.a, j + 1 - p.b);
    vcache.set(key, v);
  }
  return v;
}

// ------------------------------------------------------------- shared edges
// Catmull–Rom through control points (t, n), each moved from its rest place
// on the straight chord (t = k/(m-1), n = 0) towards its design place by amp.
function morphSpline(ctrl, amp, samples) {
  const m = ctrl.length;
  const P = ctrl.map(([t, n], k) => {
    const t0 = k / (m - 1);
    return [t0 + (t - t0) * amp, n * amp];
  });
  const out = [];
  const segs = m - 1;
  for (let s = 0; s <= samples; s++) {
    const g = (s / samples) * segs;
    const k = Math.min(segs - 1, Math.floor(g));
    const u = g - k;
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(m - 1, k + 2)];
    const u2 = u * u, u3 = u2 * u;
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

const SAMPLES = 72;
const ecache = new Map();
// kind: 'top' | 'ul' | 'll'; params from ξ at the edge's middle
function edge(kind, i, j, v1, v2, xi) {
  const key = `${kind}${i},${j}`;
  let e = ecache.get(key);
  if (e) return e;
  const tr = tracks(xi);
  const dx = v2[0] - v1[0], dy = v2[1] - v1[1];
  const parts = [];
  for (const d of EDGE_DESIGNS) {
    const amp = tr[d.track];
    const ctrl = d[kind];
    if (ctrl && amp > 1e-4) parts.push(morphSpline(ctrl, amp, SAMPLES));
  }
  if (!parts.length || Math.hypot(dx, dy) < 1e-9) {
    e = [v1, v2];
  } else {
    e = [];
    for (let s = 0; s <= SAMPLES; s++) {
      let t = s / SAMPLES, n = 0;
      for (const p of parts) { t += p[s][0] - s / SAMPLES; n += p[s][1]; }
      // right of travel (dy, -dx) is outward for the owner
      e.push([v1[0] + t * dx + n * dy, v1[1] + t * dy - n * dx]);
    }
    e[0] = v1;
    e[SAMPLES] = v2;
  }
  ecache.set(key, e);
  return e;
}

const mod = (a, n) => ((a % n) + n) % n;

function hash(i, j) {
  let h = (i * 374761393 + j * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ------------------------------------------------------------- tiles
export function buildTile(i, j) {
  const V = [vA(i, j), vB(i, j), vA(i - 1, j), vB(i, j - 1), vA(i, j - 1), vB(i + 1, j - 1)];
  const top = edge('top', i, j, V[0], V[1], i);
  const ul = edge('ul', i, j, V[1], V[2], i - 0.5);
  const ll = edge('ll', i, j, V[2], V[3], i - 0.5);
  const bot = edge('top', i, j - 1, V[4], V[3], i).slice().reverse();
  const lr = edge('ul', i + 1, j - 1, V[5], V[4], i + 0.5).slice().reverse();
  const ur = edge('ll', i + 1, j, V[0], V[5], i + 0.5).slice().reverse();
  const ring = [];
  for (const e of [top, ul, ll, bot, lr, ur]) {
    for (let k = 0; k < e.length - 1; k++) ring.push(e[k]);
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of ring) {
    if (p[0] < x0) x0 = p[0];
    if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }
  const path = new Path2D();
  path.moveTo(ring[0][0], ring[0][1]);
  for (let k = 1; k < ring.length; k++) path.lineTo(ring[k][0], ring[k][1]);
  path.closePath();

  const tr = tracks(i);
  const tile = {
    i, j, V, ring, path, tr,
    bbox: [x0, y0, x1, y1],
    p2: mod(i + j, 2),
    p3: mod(j - i, 3),
    rnd: hash(i, j),
    rnd2: hash(j * 7 + 3, i * 13 + 5),
  };
  tile.ops = tileDetails(tile);
  return tile;
}

// Every tile of one loop whose rows fall in [ylo, yhi].
export function buildStrip(ylo, yhi) {
  const tiles = [];
  for (let i = 0; i < J; i++) {
    const y = Yof(i);
    for (let j = Math.floor(ylo - y) - 1; j <= Math.ceil(yhi - y) + 1; j++) tiles.push(buildTile(i, j));
  }
  vcache.clear();
  ecache.clear();
  tiles.sort((a, b) => a.bbox[0] - b.bbox[0]);
  return tiles;
}
