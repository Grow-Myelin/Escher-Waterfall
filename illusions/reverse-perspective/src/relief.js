// The relief: the board with the five truncated pyramids that the
// collineation H makes of the five recesses.

import * as THREE from 'three';
import { BLOCKS, BOARD, pyramid, recess } from './homology.js';

// Each recess face, carried over by H, keeps its winding as seen from the
// eye (H moves points only along sight lines), so it faces the right way.
export function buildRelief(b, s) {
  const { x0, x1, y0, y1 } = BOARD;
  b.quad([x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0], s);
  for (const blk of BLOCKS) {
    const { near: n, far: f } = pyramid(blk);
    const a = (v) => [v.x, v.y, v.z];
    const faces = [
      [n[0], n[1], f[1], f[0]], // floor
      [n[3], f[3], f[2], n[2]], // ceiling
      [n[0], f[0], f[3], n[3]], // left wall
      [n[1], n[2], f[2], f[1]], // right wall
      [f[0], f[1], f[2], f[3]], // far wall: the top
    ];
    for (const q of faces) b.quad(...q.map(a), s);
  }
}

// Dashed guides for the view from above: each recess as it is meant to be
// seen (behind the board), and the sight lines from the eye through the
// corners of each top to the far corners they stand for.
export function guideSegments(eye) {
  const ghost = [], sight = [];
  for (const blk of BLOCKS) {
    const r = recess(blk), p = pyramid(blk);
    for (let i = 0; i < 4; i++) {
      ghost.push([r.far[i], r.far[(i + 1) % 4]]);
      ghost.push([r.near[i], r.far[i]]);
      sight.push([eye.clone(), r.far[i]]);
    }
    void p;
  }
  return { ghost, sight };
}
