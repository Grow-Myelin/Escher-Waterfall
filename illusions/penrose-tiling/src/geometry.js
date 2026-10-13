// Turns rhombs and symmetry centres into GPU geometry. Every attribute is an
// affine function of position (distances to edge lines, offsets from arc
// centres, projections for hatching), so interpolating it across a triangle
// is exact and the fragment shader can draw crisp edges and arcs.

import * as THREE from 'three';
import { ARC } from './penrose.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const len = (a) => Math.hypot(a[0], a[1]);

// signed distance from p to the line through a and b, positive on the side of `inside`
function lineDist(a, b, inside) {
  const d = sub(b, a);
  const L = len(d);
  const sgn = Math.sign(cross(d, sub(inside, a))) || 1;
  return (p) => (sgn * cross(d, sub(p, a))) / L;
}

export function tileGeometry(list) {
  let nv = 0, ni = 0;
  for (const r of list) { nv += r.half ? 3 : 4; ni += r.half ? 3 : 6; }
  const pos = new Float32Array(nv * 3);
  const edge = new Float32Array(nv * 4);
  const arc = new Float32Array(nv * 4);
  const info = new Float32Array(nv * 4);
  const hatch = new Float32Array(nv * 2);
  const cut = new Float32Array(nv * 2);
  const index = new Uint32Array(ni);
  let v = 0, i = 0;
  for (const r of list) {
    const { A, B, C } = r;
    const s = len(sub(A, B));
    const rX = (r.k === 1 ? ARC.xThick : ARC.xThin) * s;
    const rY = ARC.y * s;
    const pts = r.half ? [A, B, C] : [A, B, r.A2, C];
    const mid = r.half ? [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3] : [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const lines = r.half
      ? [lineDist(A, B, mid), lineDist(B, C, mid), lineDist(C, A, mid), () => 1e3]
      : [lineDist(A, B, mid), lineDist(B, r.A2, mid), lineDist(r.A2, C, mid), lineDist(C, A, mid)];
    // hatching: across the long diagonal, and across edge AB
    const longD = r.k === 1 ? sub(C, B) : sub(A, mid);
    const n1 = [-longD[1] / len(longD), longD[0] / len(longD)];
    const ab = sub(B, A);
    const n2 = [-ab[1] / len(ab), ab[0] / len(ab)];
    const cutL = lineDist(B, C, A);
    const bc = sub(C, B);
    const bcU = [bc[0] / len(bc), bc[1] / len(bc)];
    const base = v;
    for (const p of pts) {
      pos.set([p[0], p[1], 0], v * 3);
      edge.set(lines.map((f) => f(p)), v * 4);
      arc.set([p[0] - B[0], p[1] - B[1], p[0] - C[0], p[1] - C[1]], v * 4);
      info.set([r.k, rX, rY, s], v * 4);
      hatch.set([dot(p, n1) / s, dot(p, n2) / s], v * 2);
      cut.set([cutL(p) / s, dot(sub(p, B), bcU) / s], v * 2);
      v++;
    }
    if (r.half) { index.set([base, base + 1, base + 2], i); i += 3; }
    else { index.set([base, base + 1, base + 3, base + 2, base + 3, base + 1], i); i += 6; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aEdge', new THREE.BufferAttribute(edge, 4));
  g.setAttribute('aArc', new THREE.BufferAttribute(arc, 4));
  g.setAttribute('aInfo', new THREE.BufferAttribute(info, 4));
  g.setAttribute('aHatch', new THREE.BufferAttribute(hatch, 2));
  g.setAttribute('aCut', new THREE.BufferAttribute(cut, 2));
  g.setIndex(new THREE.BufferAttribute(index, 1));
  return g;
}

// One quad per symmetry centre, large enough for its dashed ring.
export function centreGeometry(centres, s) {
  const n = centres.length;
  const pos = new Float32Array(n * 4 * 3);
  const loc = new Float32Array(n * 4 * 2);
  const info = new Float32Array(n * 4 * 4);
  const index = new Uint32Array(n * 6);
  centres.forEach((c, j) => {
    const R = c.open ? 1.6 * s : c.R * s;
    const ext = Math.max(R, 1.4 * s) + 0.3 * s;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([x, y], q) => {
      const k = j * 4 + q;
      pos.set([c.p[0] + x * ext, c.p[1] + y * ext, 0], k * 3);
      loc.set([x * ext, y * ext], k * 2);
      info.set([c.open ? 0 : c.R * s, s, c.angle || 0, c.open ? 1 : 0], k * 4);
    });
    index.set([j * 4, j * 4 + 1, j * 4 + 2, j * 4, j * 4 + 2, j * 4 + 3], j * 6);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aLocal', new THREE.BufferAttribute(loc, 2));
  g.setAttribute('aC', new THREE.BufferAttribute(info, 4));
  g.setIndex(new THREE.BufferAttribute(index, 1));
  return g;
}
