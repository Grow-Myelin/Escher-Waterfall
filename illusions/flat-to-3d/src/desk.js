// The desk and the things on it, built with the Waterfall's geometry builder
// so they share its ink outlines, hatching and grain.

import * as THREE from 'three';
import { Builder, PAT, st, M } from './builder.js';

export const P = { ...PAT, DESK: 14, PAGES: 15, CLOTH: 16, PEWTER: 17, STONE: 18, PENCIL: 19 };

// ------------------------------------------------------------------ layout
export const PAGE_Y = 0.12; // top of the sketchbook's page
export const SKETCH = { x0: -4.5, x1: 0.35, z0: 0.3, z1: 3.9 };
export const BOOK = { x0: 1.0, x1: 3.9, z0: 0.45, z1: 2.75, h: 0.55 };
export const DODECA = { c: [2.45, 0, 1.6], a: 0.5 }; // centre (x, -, z), edge length
export const DISH = { c: [2.45, 0, 4.55], r: 0.92, h: 0.38 };
export const BOTTLE = { c: [1.5, 0, -0.55] };
export const DESK = { x0: -7.5, x1: 7.2, z0: -5.2, z1: 6.4 };

// ------------------------------------------------------------------ dodecahedron
// The twenty vertices of a regular dodecahedron are (±1, ±1, ±1),
// (0, ±1/φ, ±φ), (±1/φ, ±φ, 0) and (±φ, 0, ±1/φ); edge length 2/φ.
const PHI = (1 + Math.sqrt(5)) / 2;
export function dodecahedron(a) {
  const V = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) V.push([x, y, z]);
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    V.push([0, s1 / PHI, s2 * PHI]);
    V.push([s1 / PHI, s2 * PHI, 0]);
    V.push([s1 * PHI, 0, s2 / PHI]);
  }
  const k = a / (2 / PHI);
  let P0 = V.map((v) => v.map((c) => c * k));
  // the twelve face normals point to the vertices of the dual icosahedron:
  // (±1, 0, ±φ), (0, ±φ, ±1), (±φ, ±1, 0); each face is the five vertices
  // furthest along its normal
  const ico = [];
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    ico.push([s1, 0, s2 * PHI], [0, s1 * PHI, s2], [s1 * PHI, s2, 0]);
  }
  const faces = ico.map((n) => {
    const l = Math.hypot(...n);
    const u = n.map((c) => c / l);
    const d = Math.max(...P0.map((p) => p[0] * u[0] + p[1] * u[1] + p[2] * u[2]));
    const idx = P0.map((p, i) => [i, p[0] * u[0] + p[1] * u[1] + p[2] * u[2]]).filter(([, v]) => v > d - 1e-6).map(([i]) => i);
    return { n: u, d, idx };
  });
  // turn it so that one face rests flat (its normal straight down)
  const down = faces[0].n;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...down), new THREE.Vector3(0, -1, 0));
  const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.31);
  q.premultiply(turn);
  const rotp = (p) => new THREE.Vector3(...p).applyQuaternion(q).toArray();
  P0 = P0.map(rotp);
  for (const f of faces) f.n = rotp(f.n);
  const minY = Math.min(...P0.map((p) => p[1]));
  P0 = P0.map((p) => [p[0], p[1] - minY, p[2]]);
  for (const f of faces) {
    // order the face's vertices counter-clockwise seen from outside
    const c = [0, 1, 2].map((i) => f.idx.reduce((s, j) => s + P0[j][i], 0) / f.idx.length);
    const n = new THREE.Vector3(...f.n);
    const e1 = new THREE.Vector3(...P0[f.idx[0]]).sub(new THREE.Vector3(...c)).normalize();
    const e2 = new THREE.Vector3().crossVectors(n, e1);
    f.idx.sort((i, j) => {
      const pi = new THREE.Vector3(...P0[i]).sub(new THREE.Vector3(...c));
      const pj = new THREE.Vector3(...P0[j]).sub(new THREE.Vector3(...c));
      return Math.atan2(pi.dot(e2), pi.dot(e1)) - Math.atan2(pj.dot(e2), pj.dot(e1));
    });
    f.c = c;
    f.d = n.dot(new THREE.Vector3(...c));
  }
  return { V: P0, faces, height: Math.max(...P0.map((p) => p[1])) };
}

// ------------------------------------------------------------------ build
export function buildDesk() {
  const b = new Builder();
  const wood = st(0xd9c3a2, P.DESK);
  // desk top and its front edges
  b.box(DESK.x0, -0.45, DESK.z0, DESK.x1, 0, DESK.z1, wood, { top: st(0xeadcc4, P.DESK) });
  return b;
}

export function buildSketchbook() {
  const b = new Builder();
  const { x0, x1, z0, z1 } = SKETCH;
  // back board, then the block of pages slightly inset
  b.box(x0, 0, z0, x1, 0.04, z1, st(0x8c857a, P.CLOTH), { ao: 0.85 });
  b.box(x0 + 0.06, 0.04, z0 + 0.05, x1 - 0.04, PAGE_Y, z1 - 0.05, st(0xefe9da, P.PAGES), { skip: ['py'] });
  // spiral binding along the left edge
  const rings = 22;
  for (let i = 0; i < rings; i++) {
    const z = z0 + 0.25 + (i / (rings - 1)) * (z1 - z0 - 0.5);
    const cx = x0 + 0.22, r = 0.16, tube = 0.022;
    const steps = 10;
    for (let k = 0; k < steps; k++) {
      const a0 = Math.PI * (0.15 + (k / steps) * 0.85), a1 = Math.PI * (0.15 + ((k + 1) / steps) * 0.85);
      const p0 = [cx + Math.cos(a0) * r, PAGE_Y * 0.5 + Math.sin(a0) * r, z];
      const p1 = [cx + Math.cos(a1) * r, PAGE_Y * 0.5 + Math.sin(a1) * r, z];
      tubeSeg(b, p0, p1, tube, st(0x8e8a84, P.PLAIN));
    }
  }
  return b;
}

function tubeSeg(b, p0, p1, r, s) {
  const a = new THREE.Vector3(...p0), c = new THREE.Vector3(...p1);
  const d = c.clone().sub(a);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
  b.push(m);
  b.cyl(0, 0, 0, r, len, 6, s, { caps: [false, false], rim: [0, 0] });
  b.pop();
}

export function buildBook() {
  const b = new Builder();
  const { x0, x1, z0, z1, h } = BOOK;
  const cloth = st(0xbf9474, P.CLOTH);
  const t = 0.05; // board thickness
  b.box(x0, 0, z0, x1, t, z1, cloth, { ao: 0.85 });
  b.box(x0 + 0.04, t, z0 + 0.05, x1 - 0.06, h - t, z1 - 0.05, st(0xece4d0, P.PAGES), { skip: ['py', 'nx'] });
  b.box(x0, h - t, z0, x1, h, z1, cloth);
  // the spine: a half-round along the left edge
  b.push(M.chain(M.T(x0 + 0.02, h / 2, (z0 + z1) / 2), M.RX(Math.PI / 2), M.RZ(0)));
  const seg = 10;
  for (let k = 0; k < seg; k++) {
    const a0 = Math.PI / 2 + (k / seg) * Math.PI, a1 = Math.PI / 2 + ((k + 1) / seg) * Math.PI;
    const R = h / 2;
    const L = (z1 - z0) / 2;
    const pa = [Math.cos(a0) * R * 0.5, -L, Math.sin(a0) * R];
    const pb = [Math.cos(a1) * R * 0.5, -L, Math.sin(a1) * R];
    const pc = [Math.cos(a1) * R * 0.5, L, Math.sin(a1) * R];
    const pd = [Math.cos(a0) * R * 0.5, L, Math.sin(a0) * R];
    b.quad(pa, pb, pc, pd, cloth, [k === 0 ? 1 : 0, 1, k === seg - 1 ? 1 : 0, 1]);
  }
  b.pop();
  // two bands across the spine and a title panel on the cover
  b.box(x0 + 0.5, h, z0 + 0.6, x0 + 1.6, h + 0.004, z1 - 0.6, st(0xa8795e, P.CLOTH));
  return b;
}

export function buildDodecahedron() {
  const b = new Builder();
  const D = dodecahedron(DODECA.a);
  const [cx, , cz] = DODECA.c;
  const y0 = BOOK.h;
  const s = st(0xe6e1d6, P.STONE);
  for (const f of D.faces) {
    const pts = f.idx.map((i) => [D.V[i][0] + cx, D.V[i][1] + y0, D.V[i][2] + cz]);
    b.poly(pts, s);
  }
  return { b, D };
}

// a shallow pewter dish: a lathe with a foot ring, a rolled rim and a well
export const DISH_PROFILE = [
  [0, 0.03], [0.55, 0.035], [0.7, 0.04], [0.72, 0.0], [0.8, 0.0], [0.88, 0.12], [0.96, 0.25],
  [1.02, 0.33], [1.03, 0.36], [1.0, 0.378], [0.95, 0.36], [0.9, 0.3], [0.8, 0.2], [0.62, 0.11],
  [0.35, 0.075], [0, 0.07],
];
export const DISH_RIM = 9; // index of the top of the rim
export function buildDish() {
  const b = new Builder();
  const [cx, , cz] = DISH.c;
  const prof = DISH_PROFILE.map(([r, y]) => [r * DISH.r, y]);
  // outer surface from the centre underneath out to the rim, then the inside
  const outer = prof.slice(0, DISH_RIM + 1);
  const inner = prof.slice(DISH_RIM);
  // (a lathe's normals point to the right of the profile's direction)
  b.lathe(cx, 0, cz, outer, 48, st(0xb8b5ad, P.PEWTER), { edges: outer.map((_, i) => i === 4 || i === DISH_RIM) });
  b.lathe(cx, 0, cz, inner, 48, st(0xc9c6be, P.PEWTER), { edges: inner.map((_, i) => i === 2) });
  return b;
}

export function buildPencil() {
  const b = new Builder();
  const a = new THREE.Vector3(-3.9, 0.06, -0.75), c = new THREE.Vector3(-1.3, 0.06, -0.15);
  const d = c.clone().sub(a);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  b.push(new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1)));
  b.push(M.RY(0.3));
  b.cyl(0, 0, 0, 0.06, len - 0.34, 6, st(0x6f7f63, P.PENCIL));
  b.cyl(0, len - 0.34, 0, 0.06, len - 0.06, 6, st(0xdcc39a, P.WOOD), { r1: 0.012, caps: [false, false] });
  b.cyl(0, len - 0.06, 0, 0.012, len, 6, st(0x3a3936, P.PLAIN), { r1: 0.0, caps: [false, false] });
  b.cyl(0, -0.12, 0, 0.062, 0, 12, st(0xb0a998, P.PLAIN));
  b.cyl(0, -0.22, 0, 0.055, -0.12, 12, st(0xc98f86, P.PLAIN));
  b.pop();
  b.pop();
  return b;
}

// an ink bottle: a squat glass bottle with a cork
export function buildBottle() {
  const b = new Builder();
  const [cx, , cz] = BOTTLE.c;
  const prof = [[0, 0.0], [0.34, 0.0], [0.36, 0.03], [0.36, 0.36], [0.33, 0.42], [0.2, 0.47], [0.12, 0.5], [0.12, 0.6], [0.14, 0.62], [0.14, 0.66], [0.11, 0.67]];
  b.lathe(cx, 0, cz, prof, 28, st(0x4d5a63, P.PLAIN), { edges: prof.map((_, i) => i === 1 || i === 4 || i === 7 || i === 9) });
  b.cyl(cx, 0.66, cz, 0.1, 0.78, 14, st(0xb08a62, P.WOOD));
  // a paper label
  b.push(M.T(cx, 0, cz));
  const seg = 10;
  for (let k = 0; k < seg; k++) {
    const a0 = 0.15 + (k / seg) * 1.4, a1 = 0.15 + ((k + 1) / seg) * 1.4;
    const r = 0.365;
    b.quad([Math.cos(a0) * r, 0.1, Math.sin(a0) * r], [Math.cos(a1) * r, 0.1, Math.sin(a1) * r], [Math.cos(a1) * r, 0.28, Math.sin(a1) * r], [Math.cos(a0) * r, 0.28, Math.sin(a0) * r], st(0xe8e0cc, P.PLAIN), [1, k === seg - 1 ? 1 : 0, 1, k === 0 ? 1 : 0], { n: [[Math.cos(a0), 0, Math.sin(a0)], [Math.cos(a1), 0, Math.sin(a1)], [Math.cos(a1), 0, Math.sin(a1)], [Math.cos(a0), 0, Math.sin(a0)]] });
  }
  b.pop();
  return b;
}
