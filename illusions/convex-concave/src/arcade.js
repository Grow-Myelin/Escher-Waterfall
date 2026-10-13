// The arcade: an L-shaped cloister of cross-vaulted bays round a two-storey
// tower, on a podium above a sunken court, with a flight of steps down from
// each wing. Everything is built mirror-symmetric about the vertical plane
// x = z, which the isometric camera sees edge-on as the picture's centre line,
// so the drawing is symmetric left to right. The shader then shades the left
// half as seen from above (convex) and the right half as seen from below
// (concave); see ink.js.

import { Builder, st, PAT } from '../../../src/builder.js';

export const ARC = {
  S: 2.4, // half a bay, outer face to centre
  p: 0.55, // pier section
  yf: 1.5, // podium (wing floor) height above the court
  pierH: 2.3, // floor to springing
  wallH: 2.35, // springing to string course
  band: 0.2, // string course
  rise: 1.65, // rise of the cross vaults
  m: 0.45, // podium margin round the bays
  wing: 1, // bays in each wing
};

const sStone = st(0xd8cfba, PAT.ASHLAR);
const sPier = st(0xe2d9c6, PAT.PLASTER);
const sTrim = st(0xe6decb, PAT.PLAIN);
const sVault = st(0xcfc4ad, PAT.PLASTER);
const sFloor = st(0xd4cab4, PAT.COBBLE);
const sTiles = st(0xd8cfba, PAT.TILE);
const sPodium = st(0xc6b99f, PAT.ASHLAR);
const sStep = st(0xdcd3be, PAT.PLAIN);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// A quad whose winding is chosen so that it faces `want`.
function face(b, q, want, s, edges = [1, 1, 1, 1], o = {}) {
  const n = cross(sub(q[1], q[0]), sub(q[2], q[0]));
  if (dot(n, want) >= 0) { b.quad(q[0], q[1], q[2], q[3], s, edges, o); return; }
  const r = (a) => a && [a[0], a[3], a[2], a[1]];
  b.quad(q[0], q[3], q[2], q[1], s, [edges[3], edges[2], edges[1], edges[0]], { ...o, n: r(o.n), uv: r(o.uv), k: r(o.k) });
}

// Side frames: origin at the middle of the side's outer face, U along it,
// N outward. (U, up, N) is right-handed.
function sideFrame(side, cx, cz, S) {
  if (side === 'pz') return { O: [cx, 0, cz + S], U: [1, 0, 0], N: [0, 0, 1] };
  if (side === 'nz') return { O: [cx, 0, cz - S], U: [-1, 0, 0], N: [0, 0, -1] };
  if (side === 'px') return { O: [cx + S, 0, cz], U: [0, 0, -1], N: [1, 0, 0] };
  return { O: [cx - S, 0, cz], U: [0, 0, 1], N: [-1, 0, 0] };
}

// One bay: four piers, an arch on each side, a string course, and either a
// cross vault or a flat terrace on top. Returns the height of its top.
export function bay(b, cx, cz, yf, o = {}) {
  const { S, p, pierH, wallH, band, rise } = ARC;
  const ys = yf + pierH, ye = ys + wallH, yv = ye + band;
  const r = S - p; // arch radius: the arches span between the piers
  const sides = o.sides || ['px', 'nx', 'pz', 'nz'];

  // piers with a base and an impost
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx < 0 ? cx - S : cx + S - p, z0 = sz < 0 ? cz - S : cz + S - p;
    b.box(x0 - 0.05, yf, z0 - 0.05, x0 + p + 0.05, yf + 0.16, z0 + p + 0.05, sTrim, { ao: 0.85 });
    b.box(x0, yf + 0.16, z0, x0 + p, ys - 0.18, z0 + p, sPier, { ao: 0.9 });
    b.box(x0 - 0.06, ys - 0.18, z0 - 0.06, x0 + p + 0.06, ys, z0 + p + 0.06, sTrim, {});
  }

  // arched walls
  const n = 16;
  for (const side of sides) {
    const { O, U, N } = sideFrame(side, cx, cz, S);
    const P = (u, y, w) => [O[0] + U[0] * u - N[0] * w, y, O[2] + U[2] * u - N[2] * w];
    const In = [-N[0], 0, -N[2]];
    // outer face over the piers (rectangles) and above the arch (strips)
    face(b, [P(-S, ys, 0), P(-r, ys, 0), P(-r, ye, 0), P(-S, ye, 0)], N, sStone, [0, 0, 0, 1]);
    face(b, [P(r, ys, 0), P(S, ys, 0), P(S, ye, 0), P(r, ye, 0)], N, sStone, [0, 1, 0, 0]);
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI;
      const ua = r * Math.cos(a0), ub = r * Math.cos(a1);
      const ya = ys + r * Math.sin(a0), yb = ys + r * Math.sin(a1);
      face(b, [P(ua, ya, 0), P(ub, yb, 0), P(ub, ye, 0), P(ua, ye, 0)], N, sStone, [1, 0, 0, 0]);
      face(b, [P(ua, ya, p), P(ub, yb, p), P(ub, ye, p), P(ua, ye, p)], In, sStone, [1, i === n - 1 ? 1 : 0, 0, i === 0 ? 1 : 0]);
      // soffit, facing the arch's centre
      const mid = [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2)];
      const want = [-(U[0] * mid[0]), -mid[1], -(U[2] * mid[0])];
      face(b, [P(ua, ya, 0), P(ub, yb, 0), P(ub, yb, p), P(ua, ya, p)], want, sStone, [1, 0, 1, 0], { k: [0.82, 0.82, 0.82, 0.82] });
    }
  }

  // string course
  b.box(cx - S - 0.08, ye, cz - S - 0.08, cx + S + 0.08, yv, cz + S + 0.08, sTrim, { top: o.vault === false ? sFloor : sTrim });
  if (o.vault === false) return yv;

  // cross vault: over the square, height H(min(|dx|, |dz|)) — two barrels
  // crossing, with the groins on the diagonals
  const H = (t) => rise * Math.sqrt(Math.max(0, 1 - (t / S) ** 2));
  const dH = (t) => -rise * (t / (S * S)) / Math.sqrt(Math.max(0.02, 1 - (t / S) ** 2));
  const m = 14;
  for (const side of ['px', 'nx', 'pz', 'nz']) {
    const { U, N } = sideFrame(side, cx, cz, S);
    const Q = (u, w) => [cx + U[0] * u + N[0] * w, yv + H(Math.abs(u)), cz + U[2] * u + N[2] * w];
    const nrm = (u) => {
      const g = -dH(Math.abs(u)) * Math.sign(u);
      const v = [U[0] * g, 1, U[2] * g];
      const l = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / l, v[1] / l, v[2] / l];
    };
    for (let i = 0; i < m; i++) {
      const ua = -S + (2 * S * i) / m, ub = -S + (2 * S * (i + 1)) / m;
      const q = [Q(ua, Math.abs(ua)), Q(ub, Math.abs(ub)), Q(ub, S), Q(ua, S)];
      const nn = [nrm(ua), nrm(ub), nrm(ub), nrm(ua)];
      // texture runs along the barrel (w) and round it (arc length of the profile)
      const arc = (u) => Math.sign(u) * Math.hypot(Math.abs(u), rise - H(Math.abs(u)));
      const uvq = [[Math.abs(ua), arc(ua)], [Math.abs(ub), arc(ub)], [S, arc(ub)], [S, arc(ua)]];
      face(b, q, [0, 1, 0], sVault, [1, 0, 1, 0], { n: nn, uv: uvq });
    }
    // tympanum under the vault's edge
    const { O } = sideFrame(side, cx, cz, S);
    const T = (u, y) => [O[0] + U[0] * u, y, O[2] + U[2] * u];
    for (let i = 0; i < m; i++) {
      const ua = -S + (2 * S * i) / m, ub = -S + (2 * S * (i + 1)) / m;
      face(b, [T(ua, yv), T(ub, yv), T(ub, yv + H(Math.abs(ub))), T(ua, yv + H(Math.abs(ua)))], N, sStone, [0, 0, 1, 0]);
    }
  }
  // a ball at the crown: a finial from above, a hanging boss from below
  b.box(cx - 0.16, yv + rise - 0.02, cz - 0.16, cx + 0.16, yv + rise + 0.12, cz + 0.16, sTrim, {});
  b.blob(cx, yv + rise + 0.32, cz, 0.22, 0.22, 0.22, sTrim, { sub: 2, lump: 0 });
  return yv + rise;
}

// A flight of n steps from height y0 down to 0, hugging a podium face.
// alongZ: the flight runs towards +z at x ∈ [c0, c0 + w]; otherwise towards
// +x at z ∈ [c0, c0 + w]. It leaves the landing at t = start. Built as
// stacked slabs: slab k lies between treads k and k+1 and reaches out to the
// k-th riser, so every tread and riser is a real face.
function flight(b, alongZ, c0, w, start, y0, n, tread) {
  const rise = y0 / n;
  for (let k = 1; k < n; k++) {
    const y1 = y0 - k * rise, ya = y1 - rise, e = start + k * tread;
    if (alongZ) b.box(c0, ya, start, c0 + w, y1, e, sStep, { ao: 0.92, open: ['nz'] });
    else b.box(start, ya, c0, e, y1, c0 + w, sStep, { ao: 0.92, open: ['nx'] });
  }
}

export function buildArcade() {
  const b = new Builder();
  const { S, yf, m, wing } = ARC;
  const span = 2 * S;
  const Lw = S + wing * span; // far end of a wing, from the centre
  const E = Lw + m; // podium end

  // ground plate (the court) and its edge
  const G = E + 2.3, g0 = -S - m - 1.0;
  b.box(g0, -0.5, g0, G, 0, G, sPodium, { top: sTiles, ao: 0.9 });
  b.box(g0 - 0.12, -0.5, g0 - 0.12, G + 0.12, -0.32, G + 0.12, sTrim, {});

  // podium: an L of three blocks, faces placed by hand so that the top reads
  // as one surface and every visible corner is inked
  const a = -S - m, c = S + m;
  // top
  face(b, [[a, yf, a], [c, yf, a], [c, yf, c], [a, yf, c]], [0, 1, 0], sFloor, [1, 0, 0, 1]);
  face(b, [[a, yf, c], [c, yf, c], [c, yf, E], [a, yf, E]], [0, 1, 0], sFloor, [0, 1, 1, 1]);
  face(b, [[c, yf, a], [E, yf, a], [E, yf, c], [c, yf, c]], [0, 1, 0], sFloor, [1, 1, 1, 0]);
  // visible sides: wing ends and the faces towards the court
  face(b, [[a, 0, E], [c, 0, E], [c, yf, E], [a, yf, E]], [0, 0, 1], sPodium);
  face(b, [[c, 0, c], [c, 0, E], [c, yf, E], [c, yf, c]], [1, 0, 0], sPodium);
  face(b, [[E, 0, a], [E, 0, c], [E, yf, c], [E, yf, a]], [1, 0, 0], sPodium);
  face(b, [[c, 0, c], [E, 0, c], [E, yf, c], [c, yf, c]], [0, 0, 1], sPodium);

  // the bays: the tower in the corner, the wings along +z and +x
  bay(b, 0, 0, yf, { vault: false, sides: ['nx', 'nz'] });
  const yUp = yf + ARC.pierH + ARC.wallH + ARC.band;
  bay(b, 0, 0, yUp);
  for (let k = 1; k <= wing; k++) {
    bay(b, 0, k * span, yf);
    bay(b, k * span, 0, yf);
  }

  // stairs: a square landing in the inner corner, on the centre line, and a
  // flight down from it along each wing, mirror images of each other
  const n = 6, tread = 0.42, w = 1.25;
  const lw = c + w; // landing's outer edge
  b.box(c, 0, c, lw, yf, lw, sStep, { ao: 0.9, top: sStep });
  flight(b, true, c, w, lw, yf, n, tread);
  flight(b, false, c, w, lw, yf, n, tread);
  return b;
}
