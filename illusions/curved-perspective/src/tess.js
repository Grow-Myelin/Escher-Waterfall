// A geometry builder for curved projection: every face is cut into small
// cells, so that a straight edge, projected vertex by vertex, can bend.
//
// Per vertex it stores the distance to each of the face's (up to four)
// outline edges. Those distances are affine on a flat face, so they
// interpolate exactly, and the shader can ink the face's true outline no
// matter how finely it was cut.

import * as THREE from 'three';

export const BIG = 1000;

export const PAT = { PLAIN: 0, ASHLAR: 2, WOOD: 4, PLASTER: 5, STONE: 14, VOID: 15, GLOW: 16, MOSAIC: 17, WATER: 18 };

export function st(hex, p = PAT.PLAIN) {
  return { c: [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255], p };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function planarUV(p, n) {
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  if (ax >= ay && ax >= az) return [p[2], p[1]];
  if (az >= ay) return [p[0], p[1]];
  return [p[0], p[2]];
}

export class Tess {
  constructor(cell = 0.6) {
    this.cell = cell;
    this.pos = []; this.nrm = []; this.col = []; this.uv = []; this.edg = []; this.mat = [];
  }

  _vert(p, n, s, e, uv) {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    this.col.push(s.c[0], s.c[1], s.c[2]);
    const t = uv || planarUV(p, n);
    this.uv.push(t[0], t[1]);
    this.edg.push(e[0], e[1], e[2], e[3]);
    this.mat.push(s.p, 0);
  }

  // distances from p to the lines of the polygon's edges (in its plane)
  _edgeDist(p, poly, n, real) {
    const out = [BIG, BIG, BIG, BIG];
    for (let i = 0; i < poly.length; i++) {
      if (!real[i]) continue;
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const inward = norm(cross(n, sub(b, a)));
      out[i] = Math.abs(dot(sub(p, a), inward));
    }
    return out;
  }

  // Convex planar quad, corners counter-clockwise seen from the side `hint`
  // points to (if given, the winding is fixed up). edges: [01, 12, 23, 30].
  quad(p0, p1, p2, p3, s, edges = [1, 1, 1, 1], o = {}) {
    let P = [p0, p1, p2, p3], E = edges;
    let n = norm(cross(sub(p1, p0), sub(p2, p0)));
    if (len(cross(sub(p1, p0), sub(p2, p0))) < 1e-9) n = norm(cross(sub(p2, p0), sub(p3, p0)));
    if (o.hint && dot(n, o.hint) < 0) { P = [p0, p3, p2, p1]; E = [edges[3], edges[2], edges[1], edges[0]]; n = mul(n, -1); }
    const cell = o.cell || this.cell;
    const nu = Math.max(1, Math.ceil(Math.max(len(sub(P[1], P[0])), len(sub(P[2], P[3]))) / cell));
    const nv = Math.max(1, Math.ceil(Math.max(len(sub(P[3], P[0])), len(sub(P[2], P[1]))) / cell));
    const at = (i, j) => lerp(lerp(P[0], P[1], i / nu), lerp(P[3], P[2], i / nu), j / nv);
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
        for (const q of [a, b, c, a, c, d]) this._vert(q, n, s, this._edgeDist(q, P, n, E), o.uv && o.uv(q));
      }
    }
  }

  // Triangle a-b-c. edges: [ab, bc, ca].
  tri(a, b, c, s, edges = [1, 1, 1], o = {}) {
    let P = [a, b, c];
    let n = norm(cross(sub(b, a), sub(c, a)));
    let E = edges;
    if (o.hint && dot(n, o.hint) < 0) { P = [a, c, b]; E = [edges[2], edges[1], edges[0]]; n = mul(n, -1); }
    const cell = o.cell || this.cell;
    const N = Math.max(1, Math.ceil(Math.max(len(sub(P[1], P[0])), len(sub(P[2], P[1])), len(sub(P[0], P[2]))) / cell));
    const at = (i, j) => add(P[0], add(mul(sub(P[1], P[0]), i / N), mul(sub(P[2], P[0]), j / N)));
    const E4 = [E[0], E[1], E[2], 0];
    const v = (q) => this._vert(q, n, s, this._edgeDist(q, P, n, E4), o.uv && o.uv(q));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N - i; j++) {
        v(at(i, j)); v(at(i + 1, j)); v(at(i, j + 1));
        if (i + j < N - 1) { v(at(i + 1, j)); v(at(i + 1, j + 1)); v(at(i, j + 1)); }
      }
    }
  }

  // Axis-aligned box; o.skip lists faces to leave out ('px', 'nx', ...).
  box(x0, y0, z0, x1, y1, z1, s, o = {}) {
    const skip = new Set(o.skip || []);
    const F = {
      px: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],
      nx: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
      pz: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      nz: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
      py: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],
      ny: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
    };
    for (const k of Object.keys(F)) {
      if (skip.has(k)) continue;
      const q = F[k];
      this.quad(q[0], q[1], q[2], q[3], (k === 'py' && o.top) || s, [1, 1, 1, 1], o);
    }
  }

  // Surface of revolution about the vertical through (cx, cz); prof: [[r, y], ...]
  lathe(cx, cy, cz, prof, seg, s, o = {}) {
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      for (let j = 0; j < prof.length - 1; j++) {
        const [ra, ya] = prof[j], [rb, yb] = prof[j + 1];
        const A = [cx + ra * Math.cos(t0), cy + ya, cz + ra * Math.sin(t0)];
        const B = [cx + ra * Math.cos(t1), cy + ya, cz + ra * Math.sin(t1)];
        const C = [cx + rb * Math.cos(t1), cy + yb, cz + rb * Math.sin(t1)];
        const D = [cx + rb * Math.cos(t0), cy + yb, cz + rb * Math.sin(t0)];
        const mid = [cx + (ra + rb) / 2 * Math.cos((t0 + t1) / 2), 0, cz + (ra + rb) / 2 * Math.sin((t0 + t1) / 2)];
        const out = norm([mid[0] - cx, (ra - rb) * 0.0, mid[2] - cz]);
        const e = (o.edges || [])[j] ? 1 : 0, e2 = (o.edges || [])[j + 1] ? 1 : 0;
        if (Math.abs(ra) < 1e-6) this.tri(A, C, D, s, [0, e2, 0], { hint: o.inside ? mul(out, -1) : [out[0], (ra - rb), out[2]], cell: o.cell });
        else if (Math.abs(rb) < 1e-6) this.tri(A, B, C, s, [e, 0, 0], { hint: o.inside ? mul(out, -1) : [out[0], (ra - rb) + (yb - ya) * 0, out[2]], cell: o.cell });
        else this.quad(A, B, C, D, s, [e, 0, e2, 0], { hint: o.inside ? mul(out, -1) : [out[0], (ra - rb), out[2]], cell: o.cell, uv: o.uv });
      }
    }
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('acol', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('fuv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('edge', new THREE.Float32BufferAttribute(this.edg, 4));
    g.setAttribute('amat', new THREE.Float32BufferAttribute(this.mat, 2));
    g.computeBoundingSphere();
    return g;
  }

  get triangles() { return this.pos.length / 9; }
}
