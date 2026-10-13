// The building, as numbers. No three.js here, so the layout can be checked
// from node as well.
//
// The hall is the inside corner of a cube [0, L]^3, seen from the (1,1,1)
// diagonal with its three near walls cut away. Its three back planes are the
// floors of three worlds:
//
//   world 0  gravity -y   floor y = 0   colour I   (terracotta)
//   world 1  gravity -z   floor z = 0   colour II  (green)
//   world 2  gravity -x   floor x = 0   colour III (blue)
//
// The building is designed once, for world 0, in "canonical" coordinates
// (u, h, v) with h = up, and then placed three times by the cyclic
// permutations P_k of the axes. A cyclic permutation is a rotation by 120°
// about (1,1,1), so it maps the hall onto itself and each world onto the
// next. Things that span two worlds (the stairs, the doors in another
// world's floor) are written in canonical coordinates too, so the three
// copies interlock.

export const L = 17; // inside size of the hall
export const T = 0.8; // wall thickness
export const Q0 = 4, Q1 = 9; // the central block [Q0, Q1]^3
export const STEP = 0.5;
export const NSTEP = 8;

// axis maps: canonical axis i (0 = u, 1 = h, 2 = v) goes to actual axis PERM[k][i]
export const PERM = [
  [0, 1, 2], // k = 0: u→x, h→y, v→z
  [1, 2, 0], // k = 1: u→y, h→z, v→x
  [2, 0, 1], // k = 2: u→z, h→x, v→y
];
// canonical "up" (h) of copy k is the up of world k
export const UP_AXIS = [1, 2, 0];

export function mapPt(k, p) {
  const q = [0, 0, 0];
  for (let i = 0; i < 3; i++) q[PERM[k][i]] = p[i];
  return q;
}
export function mapAxis(k, i) { return PERM[k][i]; }

// 4x4 column-major matrix for P_k (for THREE.Matrix4.fromArray)
export function permMatrix(k) {
  const m = new Array(16).fill(0);
  for (let i = 0; i < 3; i++) m[i * 4 + PERM[k][i]] = 1; // column i has a 1 in row PERM[k][i]
  m[15] = 1;
  return m;
}

// ---------------------------------------------------------------- the stair
// One flight, shared by two worlds. It runs from the edge of the block's top
// (u = Q0, h = Q1) up and back to the left wall (u = 0, h = Q1 + Q0).
// Treads face +h and risers face +u, so the risers are treads for the world
// whose floor is u = 0. Two lanes: the near one (larger v) is used by this
// world, the far one by the other.
export const STAIR = {
  foot: [Q0, Q1], // (u, h) of the bottom of the first riser
  v0: 5.4,
  v1: 8.6,
  laneSplit: 7.0,
  thick: 0.8, // vertical depth of the slab below the inner corners
};
export const LANE_SELF = 7.8; // centre of this world's lane (v)
export const LANE_OTHER = 6.2; // centre of the other world's lane (v)

// ---------------------------------------------------------------- blocks
// Boxes in canonical coordinates: [u0, h0, v0, u1, h1, v1].
export const BLOCKS = [
  // a small door-house on top of the central block
  { box: [7.2, Q1, Q0, Q1, 12.5, 5.4], style: 'plaster' },
  { box: [7.05, 12.5, Q0, Q1, 12.75, 5.55], style: 'cornice' },
  // a door-house on the left wall, high up: the other world's way in
  { box: [0, 13.2, 2.6, 3.4, 16.6, 5.0], style: 'plaster' },
  { box: [3.4, 13.05, 2.6, 3.65, 16.6, 5.15], style: 'cornice' },
  // a balcony on the left wall, with a parapet
  { box: [0, 6.0, 13.6, 2.0, 6.4, 16.6], style: 'stone' },
  { box: [1.75, 6.4, 13.6, 2.0, 7.3, 16.6], style: 'stone' },
  { box: [0, 6.4, 13.6, 1.75, 7.3, 13.85], style: 'stone' },
  { box: [0, 6.4, 16.35, 1.75, 7.3, 16.6], style: 'stone' },
];

// ---------------------------------------------------------------- openings
// n: axis of the face normal (canonical), c: plane coordinate,
// up: axis that is "up" for the world the door belongs to, ac: the other axis,
// upR: [sill, springing], acR: [left, right], r: arch radius,
// depth: how far it goes in; through: an opening right through the wall.
export const DOORS = [
  // top of the stair, in the left wall
  { n: 0, c: 0, up: 1, ac: 2, upR: [Q1 + 4, Q1 + 6.5], acR: [7.15, 8.45], r: 0.65, depth: 0.8 },
  // top of the other world's lane: a door in the top of the block
  { n: 1, c: Q1, up: 0, ac: 2, upR: [Q0, Q0 + 2.5], acR: [5.55, 6.85], r: 0.65, depth: 1.2 },
  // the door-house on the block
  { n: 2, c: 5.4, up: 1, ac: 0, upR: [Q1, Q1 + 2.5], acR: [7.45, 8.75], r: 0.65, depth: 1.0 },
  // the door-house on the left wall (the other world's door)
  { n: 2, c: 5.0, up: 0, ac: 1, upR: [0, 2.5], acR: [14.0, 15.3], r: 0.65, depth: 1.2 },
  // a door at floor level in the right wall
  { n: 2, c: 0, up: 1, ac: 0, upR: [0, 2.5], acR: [5.35, 6.65], r: 0.65, depth: 0.9 },
  // the balcony's door
  { n: 0, c: 0, up: 1, ac: 2, upR: [6.4, 8.9], acR: [14.45, 15.75], r: 0.65, depth: 0.9 },
  // the garden arch in the left wall, under the balcony
  { n: 0, c: 0, up: 1, ac: 2, upR: [0, 3.2], acR: [7.4, 11.6], r: 2.1, depth: T, through: true },
];

// All openings of the whole hall, in actual coordinates.
export function allDoors() {
  const out = [];
  for (let k = 0; k < 3; k++) {
    for (const d of DOORS) {
      out.push({ ...d, n: PERM[k][d.n], up: PERM[k][d.up], ac: PERM[k][d.ac], world: k });
    }
  }
  return out;
}

// ---------------------------------------------------------------- the garden
// Behind the arch in the left wall (canonical u < -T), on the level of the
// floor, in garden coordinates (a along the wall = v, d = depth behind it).
// A point there shows through the wall plane at (a + d, h + d), so only the
// band with a + d inside the arch is built.
export const GARDEN = {
  arch: [7.4, 11.6],
  path: [8.7, 10.3],
  shrubs: [[7.55, 1.55, 0.55], [4.5, 4.1, 0.8], [6.2, 4.9, 0.6], [10.95, 1.5, 0.45]],
  tree: [5.9, 2.5],
};

// ---------------------------------------------------------------- walks
// Each walk is a polyline of foot positions in canonical coordinates, with
// the index of the canonical axis that is "up" for the walker (1 = this
// world, 0 = the world whose floor is u = 0). `stair` marks segments that
// climb. Walkers fade in and out inside doorways.
const S = STAIR;
const H = (u) => Q1 + Q0 + 0.25 - u; // tread midpoints of the flight, seen by this world
export const WALKS = [
  {
    id: 'up-to-wall', up: 1,
    pts: [[8.1, Q1, 4.95], [8.1, Q1, LANE_SELF], [Q0 + 0.25, Q1, LANE_SELF], [0.25, H(0.25), LANE_SELF], [-0.45, Q1 + Q0, LANE_SELF]],
    stair: [2],
  },
  {
    id: 'other-down-to-block', up: 0,
    pts: [[0, 14.65, 4.55], [0, 14.65, LANE_OTHER], [0, Q1 + Q0 + 0.25, LANE_OTHER], [Q0, Q1 + 0.25, LANE_OTHER], [Q0, Q1 - 0.45, LANE_OTHER]],
    stair: [2],
  },
  {
    id: 'floor-to-garden', up: 1,
    pts: [[6.0, 0, -0.45], [6.0, 0, 9.5], [-4.6, 0, 9.5]],
    stair: [],
    fadeEnd: 2.6,
  },
  {
    id: 'balcony', up: 1,
    pts: [[-0.45, 6.4, 15.1], [1.0, 6.4, 15.1], [1.0, 6.4, 14.35]],
    stair: [],
    linger: true,
  },
];
export { S as STAIR_DEF };
