// The geometry of a reverspective.
//
// The board is the plane z = 0; the design eye E stands in front of it at
// distance D. The painted ("intended") scene lies behind the board: a facade
// in the board plane with five deep openings.
//
// The relief is the image of that scene under a perspective collineation H
// with centre E and the board as its axis. Along every sight ray from E
// (t = 1 on the board, t = 0 at the eye) it maps
//
//     t  →  t' = t / (k + (1 − k) t),     k = −h / (D − h)
//
// so depth behind the board becomes height in front of it: the board stays
// put, infinite depth lands at height h, and far walls become the tops that
// stick out nearest to you. H maps planes to planes, so every wall, floor
// and ceiling of a corridor becomes one flat face of a truncated pyramid,
// and the painted corners fall exactly on the relief's creases.
// Because H moves points only along their own sight lines, the relief,
// painted by projecting the intended picture from E, looks exactly like the
// picture from E, and only from there.

import * as THREE from 'three';

export const D = 2.4; // eye to board (m)
export const EYE = new THREE.Vector3(0, 0, D); // board centre at eye height
export const HMAX = 0.45; // the vanishing point's height above the board
export const K = -HMAX / (D - HMAX);
export const BOARD = { x0: -0.75, x1: 0.75, y0: -0.95, y1: 0.95 };

export function H(p) {
  const t = (D - p.z) / D;
  const tp = t / (K + (1 - K) * t);
  return EYE.clone().add(p.clone().sub(EYE).multiplyScalar(tp / t));
}
export function heightFor(depth) { return H(new THREE.Vector3(0, 0, -depth)).z; }

// The openings in the facade. A side of a recess that the eye can't see is
// built along the sight line through its edge (it is seen edge-on), so the
// relief has no faces the painting does not cover.
export const BLOCKS = [
  { name: 'hall', x0: -0.29, x1: 0.29, y0: -0.7, y1: 0.48, F: 5.0, hidden: [] },
  { name: 'roomL', x0: -0.7, x1: -0.38, y0: -0.7, y1: 0.2, F: 0.95, hidden: ['x1'] },
  { name: 'roomR', x0: 0.38, x1: 0.7, y0: -0.7, y1: 0.2, F: 0.95, hidden: ['x0'] },
  { name: 'nicheL', x0: -0.66, x1: -0.44, y0: 0.36, y1: 0.66, F: 0.4, hidden: ['x1', 'y0'] },
  { name: 'nicheR', x0: 0.44, x1: 0.66, y0: 0.36, y1: 0.66, F: 0.4, hidden: ['x0', 'y0'] },
];

// Far-wall coordinate of an opening edge: straight back, or along the sight line.
export function farEdge(blk, key) {
  const v = blk[key];
  if (!blk.hidden.includes(key)) return v;
  const e = key[0] === 'x' ? EYE.x : EYE.y;
  return e + (v - e) * ((D + blk.F) / D);
}

// The eight corners of an opening's recess, [near ×4, far ×4], counter-clockwise
// as seen from the eye: (x0,y0) (x1,y0) (x1,y1) (x0,y1).
export function recess(blk) {
  const fx0 = farEdge(blk, 'x0'), fx1 = farEdge(blk, 'x1');
  const fy0 = farEdge(blk, 'y0'), fy1 = farEdge(blk, 'y1');
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  return {
    near: [v(blk.x0, blk.y0, 0), v(blk.x1, blk.y0, 0), v(blk.x1, blk.y1, 0), v(blk.x0, blk.y1, 0)],
    far: [v(fx0, fy0, -blk.F), v(fx1, fy0, -blk.F), v(fx1, fy1, -blk.F), v(fx0, fy1, -blk.F)],
  };
}

// The same block in the relief.
export function pyramid(blk) {
  const r = recess(blk);
  return { near: r.near.map(H), far: r.far.map(H) };
}
