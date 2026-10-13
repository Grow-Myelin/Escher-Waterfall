// Geometry builder.
//
// Everything in the scene is assembled from flat-shaded primitives that carry a
// few extra attributes used by the ink shader:
//
//   acol  – albedo (sRGB, 0..1), pre-multiplied by any baked occlusion
//   fuv   – planar texture coordinates in world units (for bricks, tiles, hatching)
//   edge  – distance (world units) from the fragment to each of the triangle's
//           three edges; edges that are not real outline edges carry a huge
//           value, so the shader can draw crisp ink lines only where a face ends
//   amat  – (pattern id, haze, sway)
//
// Every primitive can also be given a `shift`: the whole piece is slid along the
// isometric view axis (1,1,1). Such a slide is invisible in the isometric view –
// it only changes which pieces are in front of which – and it is exactly how the
// impossible joins of the waterfall are made. Texture coordinates are computed
// *before* the shift, so a column split into two pieces at different depths
// still shows one continuous surface.

import * as THREE from 'three';

export const BIG = 1000;

export const PAT = {
  PLAIN: 0,
  BRICK: 1,
  ASHLAR: 2,
  TILE: 3,
  WOOD: 4,
  PLASTER: 5,
  GRASS: 6,
  COBBLE: 7,
  CLOTH: 8,
  FOLIAGE: 9,
  STONE: 10,
  PANE: 11,
  SOIL: 12,
  VINE: 13,
};

export function rgb(hex) {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

// A style bundles colour, pattern, haze, sway and view-axis shift.
export function st(color, pattern = PAT.PLAIN, o = {}) {
  return {
    c: typeof color === 'number' ? rgb(color) : color,
    p: pattern,
    f: o.f || 0,
    w: o.w || 0,
    s: o.s || 0,
  };
}

export function withShift(style, s) {
  return { ...style, s };
}

const SIDES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function len(a) { return Math.hypot(a[0], a[1], a[2]); }
function norm(a) { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

export function planarUV(p, n) {
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  if (ax >= ay && ax >= az) return [p[2], p[1]];
  if (az >= ay) return [p[0], p[1]];
  return [p[0], p[2]];
}

export class Builder {
  constructor() {
    this.pos = [];
    this.nrm = [];
    this.col = [];
    this.uv = [];
    this.edg = [];
    this.mat = [];
    this.m = null;
    this.nm = null;
    this.stack = [];
  }

  get triangleCount() { return this.pos.length / 9; }

  push(m) {
    this.stack.push(this.m);
    this.m = this.m ? this.m.clone().multiply(m) : m.clone();
    this.nm = new THREE.Matrix3().getNormalMatrix(this.m);
    return this;
  }

  pop() {
    this.m = this.stack.pop() || null;
    this.nm = this.m ? new THREE.Matrix3().getNormalMatrix(this.m) : null;
    return this;
  }

  _tp(p) {
    if (!this.m) return [p[0], p[1], p[2]];
    const e = this.m.elements, x = p[0], y = p[1], z = p[2];
    return [
      e[0] * x + e[4] * y + e[8] * z + e[12],
      e[1] * x + e[5] * y + e[9] * z + e[13],
      e[2] * x + e[6] * y + e[10] * z + e[14],
    ];
  }

  _tn(n) {
    if (!this.nm) return n;
    const e = this.nm.elements, x = n[0], y = n[1], z = n[2];
    return norm([e[0] * x + e[3] * y + e[6] * z, e[1] * x + e[4] * y + e[7] * z, e[2] * x + e[5] * y + e[8] * z]);
  }

  // Emit one triangle (a, b, c counter-clockwise seen from the front).
  // real[i] says whether the edge opposite vertex i is an outline edge.
  // o.uv: explicit texture coords, o.n: explicit vertex normals (local),
  // o.k: per-vertex shade multipliers (baked occlusion).
  tri(a, b, c, s, real = [1, 1, 1], o = {}) {
    const pa = this._tp(a), pb = this._tp(b), pc = this._tp(c);
    const ln = norm(cross(sub(b, a), sub(c, a)));
    const uvs = o.uv || [planarUV(a, ln), planarUV(b, ln), planarUV(c, ln)];
    const wn = norm(cross(sub(pb, pa), sub(pc, pa)));
    const ns = o.n ? o.n.map((n) => this._tn(n)) : [wn, wn, wn];
    const area2 = len(cross(sub(pb, pa), sub(pc, pa)));
    const h = [
      area2 / (len(sub(pc, pb)) || 1),
      area2 / (len(sub(pa, pc)) || 1),
      area2 / (len(sub(pb, pa)) || 1),
    ];
    const k = o.k || [1, 1, 1];
    const sh = s.s || 0;
    const P = [pa, pb, pc];
    for (let i = 0; i < 3; i++) {
      const p = P[i];
      this.pos.push(p[0] + sh, p[1] + sh, p[2] + sh);
      this.nrm.push(ns[i][0], ns[i][1], ns[i][2]);
      this.col.push(s.c[0] * k[i], s.c[1] * k[i], s.c[2] * k[i]);
      this.uv.push(uvs[i][0], uvs[i][1]);
      for (let j = 0; j < 3; j++) {
        if (!real[j]) this.edg.push(BIG);
        else this.edg.push(i === j ? h[j] : 0);
      }
      this.mat.push(s.p, s.f, s.w);
    }
  }

  // Quad a-b-c-d (counter-clockwise from the front). edges = [ab, bc, cd, da].
  quad(a, b, c, d, s, edges = [1, 1, 1, 1], o = {}) {
    const k = o.k || [1, 1, 1, 1];
    const n = o.n;
    const uv = o.uv;
    this.tri(a, b, c, s, [edges[1], 0, edges[0]], {
      k: [k[0], k[1], k[2]],
      n: n && [n[0], n[1], n[2]],
      uv: uv && [uv[0], uv[1], uv[2]],
    });
    this.tri(a, c, d, s, [edges[2], edges[3], 0], {
      k: [k[0], k[2], k[3]],
      n: n && [n[0], n[2], n[3]],
      uv: uv && [uv[0], uv[2], uv[3]],
    });
  }

  // Axis-aligned box.
  //   o.open   – sides where the box continues into a neighbour: that face is
  //              skipped and the outline along that side is suppressed
  //              ('py' / 'ny' are used for the hidden seams in split columns)
  //   o.skip   – faces to omit without touching outlines
  //   o.bottom – emit the bottom face (default false: it is never seen)
  //   o.ao     – shade multiplier for the lower vertices of the side faces
  //   o.top    – optional style override for the top face
  box(x0, y0, z0, x1, y1, z1, s, o = {}) {
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (y0 > y1) [y0, y1] = [y1, y0];
    if (z0 > z1) [z0, z1] = [z1, z0];
    const open = new Set(o.open || []);
    const skip = new Set(o.skip || []);
    if (!o.bottom) skip.add('ny');
    const ao = o.ao ?? 1;
    const aoTop = o.aoTop ?? 1;
    const lim = { px: [0, x1], nx: [0, x0], py: [1, y1], ny: [1, y0], pz: [2, z1], nz: [2, z0] };
    const faces = {
      px: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],
      nx: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
      pz: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      nz: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
      py: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],
      ny: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
    };
    for (const f of SIDES) {
      if (skip.has(f) || open.has(f)) continue;
      const q = faces[f];
      const edges = [];
      for (let i = 0; i < 4; i++) {
        const p = q[i], r = q[(i + 1) % 4];
        let real = 1;
        for (const sd of SIDES) {
          if (sd === f) continue;
          const [ax, v] = lim[sd];
          if (Math.abs(p[ax] - v) < 1e-9 && Math.abs(r[ax] - v) < 1e-9 && open.has(sd)) real = 0;
        }
        edges.push(real);
      }
      let k;
      if (f === 'py' || f === 'ny') k = [aoTop, aoTop, aoTop, aoTop];
      else k = [ao, ao, 1, 1];
      const sty = f === 'py' && o.top ? { ...o.top, s: s.s } : s;
      this.quad(q[0], q[1], q[2], q[3], sty, edges, { k });
    }
  }

  // Cylinder along local +y from y0 to y1 centred at (cx, cz).
  cyl(cx, y0, cz, r, y1, seg, s, o = {}) {
    const caps = o.caps ?? [true, true];
    const rim = o.rim ?? [1, 1];
    const r1 = o.r1 ?? r;
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      const a = [cx + r * c0, y0, cz + r * s0];
      const b = [cx + r1 * c0, y1, cz + r1 * s0];
      const c = [cx + r1 * c1, y1, cz + r1 * s1];
      const d = [cx + r * c1, y0, cz + r * s1];
      const slope = (r - r1) / Math.max(1e-6, y1 - y0);
      const n0 = norm([c0, slope, s0]), n1 = norm([c1, slope, s1]);
      const u0 = (t0 * (r + r1)) / 2, u1 = (t1 * (r + r1)) / 2;
      this.quad(a, b, c, d, s, [0, rim[1], 0, rim[0]], {
        n: [n0, n0, n1, n1],
        uv: [[u0, y0], [u0, y1], [u1, y1], [u1, y0]],
        k: o.k,
      });
      if (caps[1] && r1 > 0) this.tri([cx, y1, cz], c, b, s, [1, 0, 0]);
      if (caps[0]) this.tri([cx, y0, cz], a, d, s, [1, 0, 0]);
    }
  }

  // Surface of revolution around local y through (cx, cz).
  // prof: [[r, y], ...]; o.edges: per profile point, ring is an outline.
  lathe(cx, cy, cz, prof, seg, s, o = {}) {
    const n = prof.length;
    const segN = [];
    for (let j = 0; j < n - 1; j++) {
      const dr = prof[j + 1][0] - prof[j][0], dy = prof[j + 1][1] - prof[j][1];
      segN.push(norm([dy, -dr, 0]));
    }
    const vn = prof.map((_, j) => {
      const a = segN[Math.max(0, j - 1)], b = segN[Math.min(n - 2, j)];
      return norm([a[0] + b[0], a[1] + b[1], 0]);
    });
    const edges = o.edges || [];
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      for (let j = 0; j < n - 1; j++) {
        const [ra, ya] = prof[j], [rb, yb] = prof[j + 1];
        const a = [cx + ra * c0, cy + ya, cz + ra * s0];
        const b = [cx + rb * c0, cy + yb, cz + rb * s0];
        const c = [cx + rb * c1, cy + yb, cz + rb * s1];
        const d = [cx + ra * c1, cy + ya, cz + ra * s1];
        const na = o.flat ? segN[j] : vn[j], nb = o.flat ? segN[j] : vn[j + 1];
        this.quad(a, b, c, d, s, [0, edges[j + 1] ? 1 : 0, 0, edges[j] ? 1 : 0], {
          n: [
            [na[0] * c0, na[1], na[0] * s0],
            [nb[0] * c0, nb[1], nb[0] * s0],
            [nb[0] * c1, nb[1], nb[0] * s1],
            [na[0] * c1, na[1], na[0] * s1],
          ],
          uv: [[t0 * 1.2, ya], [t0 * 1.2, yb], [t1 * 1.2, yb], [t1 * 1.2, ya]],
        });
      }
    }
  }

  // Flat convex polygon (points counter-clockwise from the front).
  poly(pts, s, o = {}) {
    for (let i = 1; i < pts.length - 1; i++) {
      this.tri(pts[0], pts[i], pts[i + 1], s, [1, i === pts.length - 2 ? 1 : 0, i === 1 ? 1 : 0], o);
    }
  }

  // Smooth lumpy blob (bushes, heads) – octahedron subdivided and pushed out.
  blob(cx, cy, cz, rx, ry, rz, s, o = {}) {
    const sub = o.sub ?? 1;
    const seed = o.seed ?? 0;
    let tris = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
      [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
      [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [[0, 0, 1], [-1, 0, 0], [0, -1, 0]],
      [[-1, 0, 0], [0, 0, -1], [0, -1, 0]], [[0, 0, -1], [1, 0, 0], [0, -1, 0]],
    ];
    for (let k = 0; k < sub; k++) {
      const nt = [];
      for (const [a, b, c] of tris) {
        const ab = norm([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
        const bc = norm([(b[0] + c[0]) / 2, (b[1] + c[1]) / 2, (b[2] + c[2]) / 2]);
        const ca = norm([(c[0] + a[0]) / 2, (c[1] + a[1]) / 2, (c[2] + a[2]) / 2]);
        nt.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
      }
      tris = nt;
    }
    const bump = (v) => 1 + (o.lump ?? 0.12) * Math.sin(v[0] * 5.1 + seed) * Math.sin(v[1] * 4.3 + seed * 1.7) * Math.sin(v[2] * 3.7 + seed * 0.3);
    const P = (v) => { const k = bump(v); return [cx + v[0] * rx * k, cy + v[1] * ry * k, cz + v[2] * rz * k]; };
    for (const [a, b, c] of tris) {
      this.tri(P(a), P(b), P(c), s, [0, 0, 0], { n: [a, b, c], k: o.k });
    }
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('acol', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('fuv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('edge', new THREE.Float32BufferAttribute(this.edg, 3));
    g.setAttribute('amat', new THREE.Float32BufferAttribute(this.mat, 3));
    g.computeBoundingSphere();
    return g;
  }
}

// Rotation helpers -----------------------------------------------------------
export const M = {
  T: (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z),
  RX: (a) => new THREE.Matrix4().makeRotationX(a),
  RY: (a) => new THREE.Matrix4().makeRotationY(a),
  RZ: (a) => new THREE.Matrix4().makeRotationZ(a),
  S: (x, y, z) => new THREE.Matrix4().makeScale(x, y ?? x, z ?? x),
  chain: (...ms) => ms.reduce((acc, m) => acc.multiply(m), new THREE.Matrix4()),
};
