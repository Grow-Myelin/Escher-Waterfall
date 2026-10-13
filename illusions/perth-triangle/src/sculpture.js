// Emits the sculpture into a Builder, with ink outlines only where the
// closed triangle we pretend to see has a crease.

import * as THREE from 'three';
import { sculptureParts, faceNormal, H, P } from './geometry.js';

// Which of a face's edges are inked. Side faces: long edges always; edges on
// a mitre only where the joint really folds (the face is not continued,
// coplanar, by the next bar); never along the sight-line cuts of the nose.
// End and cut faces themselves are only seen off the sweet spot: ink them.
function edgeFlags(face, all) {
  const Q = face.pts;
  const flags = [];
  const side = face.tag.startsWith('side:');
  const axis = side ? face.tag.slice(-1) : null;
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i], b = Q[(i + 1) % Q.length];
    if (!side) { flags.push(1); continue; }
    let nb = null;
    for (const g of all) {
      if (g === face) continue;
      const R = g.pts;
      for (let k = 0; k < R.length; k++) {
        const p = R[k], q = R[(k + 1) % R.length];
        if (p.distanceToSquared(b) < 1e-10 && q.distanceToSquared(a) < 1e-10) { nb = g; break; }
      }
      if (nb) break;
    }
    if (!nb) { flags.push(1); continue; }
    if (nb.tag.startsWith('side:')) flags.push(1);
    else if (nb.tag.startsWith('mitre:')) flags.push(nb.tag.slice(-1) === axis ? 0 : 1);
    else flags.push(0); // cut, or the seam between two pieces of one bar
  }
  return flags;
}

function emitFace(b, Q, flags, s) {
  const n = Q.length;
  const arr = (p) => [p.x, p.y, p.z];
  for (let i = 1; i < n - 1; i++) {
    b.tri(arr(Q[0]), arr(Q[i]), arr(Q[i + 1]), s, [flags[i], i + 1 === n - 1 ? flags[n - 1] : 0, i === 1 ? flags[0] : 0]);
  }
}

function emitSolid(b, faces, s, skip, bCut) {
  for (const f of faces) {
    if (skip.includes(f.tag)) continue;
    emitFace(f.tag === 'cut' && bCut ? bCut : b, f.pts, edgeFlags(f, faces), s);
  }
}

// The real object, in the sculpture's own frame (push the world pose first).
// Faces of the nose cut along sight lines go to `bCut`: from the sweet spot
// they are seen exactly edge-on, so the page hides them there.
export function buildSculpture(b, s, bCut) {
  const { A, B, C, W } = sculptureParts();
  const SEG = 'seg';
  emitSolid(b, A[0], s, [SEG]); // the far end is open to view
  emitSolid(b, A[1], s, [SEG]);
  emitSolid(b, A[2], s, [SEG, 'mitre:z']); // glued to B at K1
  emitSolid(b, B[0], s, [SEG, 'mitre:z']);
  emitSolid(b, B[1], s, [SEG]);
  emitSolid(b, B[2], s, [SEG, 'mitre:x']);
  emitSolid(b, C[0], s, [SEG, 'mitre:x']);
  emitSolid(b, C[1], s, [SEG]);
  emitSolid(b, C[2], s, [SEG, 'mitre:y']); // its end is glued to the nose
  // the nose is built in the frame of the far corner, then scaled about the
  // eye; texture coordinates come from the unscaled frame, so its hatching
  // continues bar A's exactly in the picture
  b.push(H);
  if (bCut) bCut.push(H);
  emitSolid(b, W, s, ['mitre:y', SEG], bCut);
  b.pop();
  if (bCut) bCut.pop();
}

// Centres of the two ends that meet in the picture, in the sculpture's frame.
export const FAR_END = P[0].clone();
export const NEAR_END = P[3].clone();
export { faceNormal };
