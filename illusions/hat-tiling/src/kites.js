// The hexagonal kite grid, and an exact check that a set of hats tiles it.
//
// Coordinates are the hat's own (HAT in hat.js): hexagons of side 2 centred on
// the lattice spanned by (3, √3) and (0, 2√3); each hexagon is cut into six
// kites by lines from its centre to the midpoints of its edges. A kite is
// named by its hexagon centre (lattice indices i, j) and the direction
// d = 0..5 of its long diagonal.

import { HAT, transPt, mul, inv } from './hat.js';

const R3 = Math.sqrt(3);
const E1 = [3, R3]; // lattice of hexagon centres
const E2 = [0, 2 * R3];

export function centre(i, j) { return [i * E1[0] + j * E2[0], i * E1[1] + j * E2[1]]; }

export function kitePts(i, j, d) {
  const [cx, cy] = centre(i, j);
  const a = (d * Math.PI) / 3;
  const m1 = a - Math.PI / 6, m2 = a + Math.PI / 6;
  return [
    [cx, cy],
    [cx + R3 * Math.cos(m1), cy + R3 * Math.sin(m1)],
    [cx + 2 * Math.cos(a), cy + 2 * Math.sin(a)],
    [cx + R3 * Math.cos(m2), cy + R3 * Math.sin(m2)],
  ];
}

// lattice indices of the nearest hexagon centre, and how far off it is
function nearestCentre(x, y) {
  // solve [x, y] = i E1 + j E2
  const i = x / 3;
  const j = (y - i * R3) / (2 * R3);
  const ri = Math.round(i), rj = Math.round(j);
  const [cx, cy] = centre(ri, rj);
  return { i: ri, j: rj, err: Math.hypot(x - cx, y - cy) };
}

function inPoly(x, y, poly) {
  let inside = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const [xa, ya] = [poly[a].x, poly[a].y], [xb, yb] = [poly[b].x, poly[b].y];
    if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside;
  }
  return inside;
}

// The eight kites of the reference hat.
export const HAT_KITES = (() => {
  const out = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let d = 0; d < 6; d++) {
    const p = kitePts(i, j, d);
    const cx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, cy = (p[0][1] + p[1][1] + p[2][1] + p[3][1]) / 4;
    if (inPoly(cx, cy, HAT)) out.push({ i, j, d, pts: p });
  }
  return out;
})();

export function polyArea(poly) {
  let a = 0;
  for (let k = 0, n = poly.length; k < n; k++) {
    const p = poly[k], q = poly[(k + 1) % n];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

const kiteKey = (i, j, d) => `${i},${j},${d}`;

// Map each hat (world transform T, hats drawn at scale 1/2) onto the kite
// grid fixed by the first hat. Returns per-hat kite keys and a report.
export function verify(hats) {
  const base = inv(hats[0].T);
  const used = new Map();
  let offGrid = 0, maxErr = 0, overlaps = 0, reflected = 0, mislabelled = 0;
  const perHat = [];
  hats.forEach((h, n) => {
    const M = mul(base, h.T); // an isometry of the grid, if all is well
    const det = M[0] * M[4] - M[1] * M[3];
    if (det < 0) reflected++;
    if ((det < 0) !== (h.label === 'H1')) mislabelled++;
    const keys = [];
    for (const k of HAT_KITES) {
      const q = k.pts.map(([x, y]) => transPt(M, { x, y }));
      const c = nearestCentre(q[0].x, q[0].y);
      const [cx, cy] = centre(c.i, c.j);
      const ang = Math.atan2(q[2].y - cy, q[2].x - cx);
      const d = ((Math.round(ang / (Math.PI / 3)) % 6) + 6) % 6;
      const exact = kitePts(c.i, c.j, d);
      // every corner must sit on the grid (corners 1 and 3 may swap under reflection)
      let err = c.err;
      err = Math.max(err, Math.hypot(q[2].x - exact[2][0], q[2].y - exact[2][1]));
      const e13 = Math.max(Math.hypot(q[1].x - exact[1][0], q[1].y - exact[1][1]), Math.hypot(q[3].x - exact[3][0], q[3].y - exact[3][1]));
      const e31 = Math.max(Math.hypot(q[1].x - exact[3][0], q[1].y - exact[3][1]), Math.hypot(q[3].x - exact[1][0], q[3].y - exact[1][1]));
      err = Math.max(err, Math.min(e13, e31));
      maxErr = Math.max(maxErr, err);
      if (err > 1e-6) offGrid++;
      const key = kiteKey(c.i, c.j, d);
      if (used.has(key)) overlaps++;
      else used.set(key, n);
      keys.push(key);
    }
    perHat.push(keys);
  });
  const holes = countHoles(used);
  return { hats: hats.length, kites: used.size, offGrid, maxErr, overlaps, holes, reflected, mislabelled, perHat, base };
}

// Kites not covered but enclosed by covered ones, found by flooding the
// outside of the patch through uncovered kites. Kite (i, j, d) shares its
// inner edges with (i, j, d ± 1) and its outer edges with a kite of the
// hexagons across the midpoints at angles 60d − 30° and 60d + 30°.
const NB = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]; // hexagon at 30° + 60k
function countHoles(used) {
  let i0 = Infinity, i1 = -Infinity, j0 = Infinity, j1 = -Infinity;
  const cov = [];
  for (const k of used.keys()) {
    const [i, j, d] = k.split(',').map(Number);
    cov.push([i, j, d]);
    i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j);
  }
  i0 -= 2; i1 += 2; j0 -= 2; j1 += 2;
  const W = i1 - i0 + 1, Hh = j1 - j0 + 1;
  const id = (i, j, d) => ((i - i0) * Hh + (j - j0)) * 6 + d;
  const n = W * Hh * 6;
  const covered = new Uint8Array(n);
  for (const [i, j, d] of cov) covered[id(i, j, d)] = 1;
  const seen = new Uint8Array(n);
  const stack = [id(i0, j0, 0)];
  seen[stack[0]] = 1;
  while (stack.length) {
    const k = stack.pop();
    const d = k % 6, cell = (k - d) / 6;
    const i = Math.floor(cell / Hh) + i0, j = (cell % Hh) + j0;
    const a = NB[(d + 5) % 6], b = NB[d];
    const next = [[i, j, (d + 1) % 6], [i, j, (d + 5) % 6], [i + a[0], j + a[1], (d + 2) % 6], [i + b[0], j + b[1], (d + 4) % 6]];
    for (const [ni, nj, nd] of next) {
      if (ni < i0 || ni > i1 || nj < j0 || nj > j1) continue;
      const q = id(ni, nj, nd);
      if (!seen[q] && !covered[q]) { seen[q] = 1; stack.push(q); }
    }
  }
  let holes = 0;
  for (let q = 0; q < n; q++) if (!covered[q] && !seen[q]) holes++;
  return holes;
}
