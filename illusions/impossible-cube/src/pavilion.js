// Plate III: a small belvedere in true isometric.
//
// The lower floor (the podium) is a rectangle 2a × 2b, long in x. The upper
// floor is the same rectangle turned 90°, long in z, centred above it. Seen
// from the isometric direction (1, 1, 1), a point (x, z) and its mirror image
// (−z, −x) lie on the same vertical line of the picture, because x − z is the
// same for both. So each corner of the lower floor stands, in the picture,
// exactly below a corner of the upper floor, but the opposite one in depth:
//
//   front (a, b)  ──►  back (−b, −a)        left  (−a, b) ──► left (−b, a)
//   back (−a, −b) ──►  front (b, a)         right (a, −b) ──► right (b, −a)
//
// A pillar joining those corners cannot be vertical. Each one is a shaft whose
// horizontal sections are all the same square, slid along the line of sight
// (1, 1, 1) in proportion to height: a shear the isometric camera cannot see.
// From (1, 1, 1) every shaft looks like a plumb column; from any other side the
// two middle shafts are seen to cross like an X.

import * as THREE from 'three';
import { Builder, st, PAT, planarUV, M } from '../../../src/builder.js';
import { leaningMan } from '../../../src/figures.js';
import { makeInk } from './ink.js';
import { Segments, inkLine } from './lines.js';

export const PAV = {
  a: 4, b: 2, // half-length and half-width of both floors
  c: 0.62, // pillar section
  Hs: 10, // underside of the upper floor
  ts: 0.7, // upper floor thickness
  Hp: 3.5, // upper posts
  ring: 0.62, // ring beam on the posts
  P: 1.6, // podium height (its top is y = 0)
  m: 0.9, // podium margin beyond the pillars
};

const sPodium = st(0xcdc1a8, PAT.ASHLAR);
const sTrim = st(0xdcd3be, PAT.PLAIN);
const sFloor = st(0xd8cfba, PAT.COBBLE);
const sPillar = st(0xe2d9c6, PAT.PLASTER);
const sSlab = st(0xd3c8b0, PAT.ASHLAR);
const sRail = st(0xe0d7c3, PAT.PLAIN);
const sCloth = st(0xb85a42, PAT.CLOTH);
const sPole = st(0x5c5246, PAT.PLAIN);

// ---------------------------------------------------------------- helpers

// Balustrade along an axis-aligned line from p0 to p1 (x, z) at floor height y.
function balustrade(b, x0, z0, x1, z1, y, o = {}) {
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  const hb = o.h ?? 0.86, w = o.w ?? 0.26;
  const lo = 0.16, top = 0.15;
  const box = (u0, u1, y0, y1, half) => {
    if (alongX) {
      const a = Math.min(x0, x1);
      b.box(a + u0, y0, z0 - half, a + u1, y1, z0 + half, sRail, { ao: 0.9 });
    } else {
      const a = Math.min(z0, z1);
      b.box(x0 - half, y0, a + u0, x0 + half, y1, a + u1, sRail, { ao: 0.9 });
    }
  };
  box(0, len, y, y + lo, w / 2);
  box(0, len, y + hb - top, y + hb, w / 2 + 0.03);
  const n = Math.max(1, Math.round(len / 0.36));
  const step = len / n;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) * step;
    box(u - 0.065, u + 0.065, y + lo, y + hb - top, 0.065);
  }
}

// An urn-shaped finial on a small plinth, centred at (cx, cz) on height y.
function finial(b, cx, y, cz, k = 1) {
  b.box(cx - 0.26 * k, y, cz - 0.26 * k, cx + 0.26 * k, y + 0.16 * k, cz + 0.26 * k, sTrim, {});
  const prof = [[0.2, 0], [0.2, 0.06], [0.1, 0.13], [0.25, 0.38], [0.2, 0.56], [0.07, 0.66], [0.11, 0.74], [0.0, 0.92]]
    .map(([r, h]) => [r * k, h * k]);
  b.lathe(cx, y + 0.16 * k, cz, prof, 14, sTrim, { edges: [1, 0, 1, 0, 0, 1, 0, 1] });
}

// ---------------------------------------------------------------- the shear

// A square shaft whose sections at picture height yp ∈ [y0, y1] are the square
// [x0, x0+c] × [z0, z0+c], slid along (1,1,1) by s(yp) = k (yp − y0)/(y1 − y0).
// Normals and texture coordinates are those of the plumb column it pretends to
// be, so its shading in the picture is exactly that column's.
function shearedShaft(b, x0, z0, c, y0, y1, k, s) {
  const P = (x, y, z) => {
    const t = (y - y0) / (y1 - y0);
    const d = k * t;
    return [x + d, y + d, z + d];
  };
  const x1 = x0 + c, z1 = z0 + c;
  const faces = [
    { n: [1, 0, 0], q: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]] },
    { n: [-1, 0, 0], q: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
    { n: [0, 0, 1], q: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
    { n: [0, 0, -1], q: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]] },
  ];
  for (const f of faces) {
    const q = f.q.map((p) => P(...p));
    b.quad(q[0], q[1], q[2], q[3], s, [1, 1, 1, 1], {
      n: [f.n, f.n, f.n, f.n],
      uv: f.q.map((p) => planarUV(p, f.n)),
    });
  }
}

// ---------------------------------------------------------------- the build

export function pillarSpecs() {
  const { a, b, c } = PAV;
  // inset square origin at the lower corner, the upper corner, and the slide k
  return [
    { name: 'front', lo: [a - c, b - c], hi: [-b, -a], k: c - a - b },
    { name: 'back', lo: [-a, -b], hi: [b - c, a - c], k: a + b - c },
    { name: 'left', lo: [-a, b - c], hi: [-b, a - c], k: a - b },
    { name: 'right', lo: [a - c, -b], hi: [b - c, -a], k: b - a },
  ];
}

function buildStructure(b) {
  const { a, b: bb, c, Hs, ts, Hp, ring, P, m } = PAV;
  const X = a + m, Z = bb + m;

  // podium
  b.box(-X - 0.16, -P, -Z - 0.16, X + 0.16, -P + 0.34, Z + 0.16, sTrim, { ao: 0.85 });
  b.box(-X, -P + 0.34, -Z, X, -0.2, Z, sPodium, { ao: 0.9 });
  b.box(-X - 0.12, -0.2, -Z - 0.12, X + 0.12, 0, Z + 0.12, sTrim, { top: sFloor });
  // steps on the long front face (+z)
  const nSt = 5, rise = P / nSt, tread = 0.42, sw = 1.5;
  for (let i = 0; i < nSt; i++) {
    b.box(-sw, -P + i * rise, Z + 0.12, sw, -P + (i + 1) * rise, Z + 0.12 + (nSt - i) * tread, sTrim, { ao: 0.88 });
  }
  // cheek blocks either side of the steps
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? -sw - 0.45 : sw, x1 = x0 + 0.45;
    b.box(x0, -P, Z + 0.12, x1, -P + 0.62, Z + 0.12 + nSt * tread + 0.1, sPodium, { ao: 0.85 });
    b.box(x0 - 0.04, -P + 0.62, Z + 0.08, x1 + 0.04, -P + 0.78, Z + 0.12 + nSt * tread + 0.14, sTrim, {});
  }
  // balustrade round the podium, open over the steps
  const e = 0.3, yB = 0;
  const bx = X - e, bz = Z - e;
  balustrade(b, -bx, bz, -sw - 0.2, bz, yB);
  balustrade(b, sw + 0.2, bz, bx, bz, yB);
  balustrade(b, bx, -bz, bx, bz, yB);
  balustrade(b, -bx, -bz, bx, -bz, yB);
  balustrade(b, -bx, -bz, -bx, bz, yB);
  for (const [px, pz] of [[-bx, bz], [bx, bz], [bx, -bz], [-bx, -bz], [-sw - 0.2, bz], [sw + 0.2, bz]]) {
    b.box(px - 0.2, yB, pz - 0.2, px + 0.2, yB + 1.0, pz + 0.2, sRail, { ao: 0.9 });
    b.box(px - 0.24, yB + 1.0, pz - 0.24, px + 0.24, yB + 1.1, pz + 0.24, sTrim, {});
  }

  // the four pillars: base on the podium, sheared shaft, capital under the slab
  for (const p of pillarSpecs()) {
    const [lx, lz] = p.lo, [ux, uz] = p.hi;
    const yb = 0.34, yc = 0.4; // base and capital heights
    b.box(lx - 0.1, 0, lz - 0.1, lx + c + 0.1, 0.2, lz + c + 0.1, sTrim, { ao: 0.85 });
    b.box(lx - 0.05, 0.2, lz - 0.05, lx + c + 0.05, yb, lz + c + 0.05, sTrim, {});
    // picture height of the shaft's top: Hs − yc − k
    shearedShaft(b, lx, lz, c, yb, Hs - yc - p.k, p.k, sPillar);
    b.box(ux - 0.05, Hs - yc, uz - 0.05, ux + c + 0.05, Hs - 0.18, uz + c + 0.05, sTrim, {});
    b.box(ux - 0.11, Hs - 0.18, uz - 0.11, ux + c + 0.11, Hs, uz + c + 0.11, sTrim, {});
  }

  // upper floor: a slab long in z, with a projecting moulded edge
  const o = 0.16;
  b.box(-bb - o + 0.1, Hs, -a - o + 0.1, bb + o - 0.1, Hs + 0.25, a + o - 0.1, sSlab, { ao: 0.85 });
  b.box(-bb - o, Hs + 0.25, -a - o, bb + o, Hs + ts, a + o, sTrim, { top: sFloor });
  const yF = Hs + ts;
  // upper posts, continuing the pillars above the floor
  for (const p of pillarSpecs()) {
    const [ux, uz] = p.hi;
    b.box(ux - 0.07, yF, uz - 0.07, ux + c + 0.07, yF + 0.22, uz + c + 0.07, sTrim, { ao: 0.85 });
    b.box(ux, yF + 0.22, uz, ux + c, yF + Hp - 0.3, uz + c, sPillar, { skip: ['py'] });
    b.box(ux - 0.07, yF + Hp - 0.3, uz - 0.07, ux + c + 0.07, yF + Hp, uz + c + 0.07, sTrim, {});
  }
  // balustrade between the posts
  const ib = 0.14;
  balustrade(b, bb - ib - 0.02, -a + c, bb - ib - 0.02, a - c, yF, { h: 0.82 });
  balustrade(b, -bb + ib + 0.02, -a + c, -bb + ib + 0.02, a - c, yF, { h: 0.82 });
  balustrade(b, -bb + c, a - ib - 0.02, bb - c, a - ib - 0.02, yF, { h: 0.82 });
  balustrade(b, -bb + c, -a + ib + 0.02, bb - c, -a + ib + 0.02, yF, { h: 0.82 });
  // ring beam: impost blocks over the posts, beams between them
  const yR = yF + Hp, yT = yR + ring;
  const half = c / 2 + 0.12;
  for (const p of pillarSpecs()) {
    const cx = p.hi[0] + c / 2, cz = p.hi[1] + c / 2;
    b.box(cx - half, yR, cz - half, cx + half, yT + 0.08, cz + half, sTrim, {});
    finial(b, cx, yT + 0.08, cz, 1.05);
  }
  const bw = 0.2; // beam half-width
  const cxs = [-bb + c / 2, bb - c / 2], czs = [-a + c / 2, a - c / 2];
  for (const cx of cxs) b.box(cx - bw, yR + 0.04, czs[0] + half, cx + bw, yT, czs[1] - half, sRail, { open: ['pz', 'nz'] });
  for (const cz of czs) b.box(cxs[0] + half, yR + 0.04, cz - bw, cxs[1] - half, yT, cz + bw, sRail, { open: ['px', 'nx'] });

  // someone on the upper floor, leaning on the rail and looking out
  const k = 0.82;
  b.push(M.chain(M.T(bb - ib - 0.62, yF, 0.9), M.S(k)));
  leaningMan(b, 0, 0, 0, -Math.PI / 2, 0.84 / k, 0.62 / k);
  b.pop();
}

// Pennant on a pole above the front corner post.
function buildPennant() {
  const { b: bb, a, c, Hs, ts, Hp, ring } = PAV;
  const b = new Builder();
  const cx = bb - c / 2, cz = a - c / 2;
  const y0 = Hs + ts + Hp + ring + 0.08 + 1.0;
  b.cyl(cx, y0 - 0.2, cz, 0.05, y0 + 2.6, 6, sPole, {});
  b.blob(cx, y0 + 2.66, cz, 0.09, 0.09, 0.09, sTrim, { sub: 1, lump: 0 });
  // cloth: a tapering strip along (1, 0, −1)/√2, seen broadside
  const len = 2.3, n = 10;
  const dir = [Math.SQRT1_2, 0, -Math.SQRT1_2];
  const top = y0 + 2.45, h0 = 0.62;
  const start = b.pos.length / 3;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const P = (t, up) => {
      const h = h0 * (1 - t * 0.92);
      const y = top - (h0 - h) * 0.45 - (up ? 0 : h);
      return [cx + dir[0] * len * t, y, cz + dir[2] * len * t];
    };
    const e = [0, i === n - 1 ? 1 : 0, 0, i === 0 ? 1 : 0];
    const uv = [[t0 * len, 0], [t1 * len, 0], [t1 * len, 1], [t0 * len, 1]];
    b.quad(P(t0, false), P(t1, false), P(t1, true), P(t0, true), sCloth, [1, e[1], 1, e[3]], { uv });
    b.quad(P(t1, false), P(t0, false), P(t0, true), P(t1, true), sCloth, [1, e[3], 1, e[1]], { uv: [uv[1], uv[0], uv[3], uv[2]] });
  }
  // sway grows from the pole to the tip
  for (let v = start; v < b.pos.length / 3; v++) b.mat[v * 3 + 2] = Math.min(1, b.uv[v * 2] / len) * 1.0;
  return b;
}

// Everything around the building: it steps aside in the reveal. The court
// is a grid whose haze rises towards its edges, so it dissolves into the paper.
function buildDressing(b) {
  const { P } = PAV;
  const sGround = st(0xd6cdb8, PAT.COBBLE);
  const sFol = st(0x8a9670, PAT.FOLIAGE);
  const sTrunk = st(0x5b4b3b, PAT.PLAIN);
  const yG = -P;
  const N = 24, R = 15;
  const haze = (x, z) => {
    const d = Math.max(Math.abs(x), Math.abs(z)) / R;
    const t = Math.min(1, Math.max(0, (d - 0.42) / 0.5));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x0 = -R + (2 * R * i) / N, x1 = -R + (2 * R * (i + 1)) / N;
      const z0 = -R + (2 * R * j) / N, z1 = -R + (2 * R * (j + 1)) / N;
      const start = b.pos.length / 3;
      b.quad([x0, yG, z1], [x1, yG, z1], [x1, yG, z0], [x0, yG, z0], sGround, [0, 0, 0, 0]);
      for (let v = start; v < b.pos.length / 3; v++) b.mat[v * 3 + 1] = haze(b.pos[v * 3], b.pos[v * 3 + 2]);
    }
  }
  // cypresses, kept clear of the building in the picture
  const cyp = (x, z, h, r) => {
    b.cyl(x, yG, z, 0.12, yG + 0.6, 6, sTrunk, {});
    b.lathe(x, yG + 0.4, z, [[0.0, 0], [r * 0.7, 0.1], [r, h * 0.3], [r * 0.85, h * 0.62], [r * 0.45, h * 0.88], [0, h]], 12, sFol, { edges: [0, 0, 0, 0, 0, 0] });
  };
  cyp(-9.6, 1.4, 7.6, 0.85);
  cyp(-7.6, 4.6, 6.4, 0.78);
  cyp(-11.2, -1.6, 8.4, 0.9);
  cyp(1.4, -9.6, 7.8, 0.85);
  cyp(4.4, -7.8, 6.2, 0.78);
  cyp(-1.4, -11.4, 8.6, 0.9);
}

export function createPavilion(shared) {
  const group = new THREE.Group();
  const mat = makeInk(shared, { hatch: 0.9, transparent: true });
  const b = new Builder();
  buildStructure(b);
  const mesh = new THREE.Mesh(b.build(), mat);
  mesh.frustumCulled = false;
  group.add(mesh);

  const pennantMat = makeInk(shared, { hatch: 0.9, transparent: true, side: THREE.DoubleSide });
  const pen = new THREE.Mesh(buildPennant().build(), pennantMat);
  pen.frustumCulled = false;
  group.add(pen);

  const dressMat = makeInk(shared, { hatch: 0.9, transparent: true });
  const bd = new Builder();
  buildDressing(bd);
  const dressing = new THREE.Mesh(bd.build(), dressMat);
  dressing.frustumCulled = false;
  dressing.renderOrder = -1;
  group.add(dressing);

  // guides: for each pillar, the line of sight from its real top to the top
  // of the plumb column the eye sees, plus that imagined column
  const { c, Hs } = PAV;
  const specs = pillarSpecs();
  const sight = new Segments(specs.length);
  const ghost = new Segments(specs.length);
  specs.forEach((p, i) => {
    const top = new THREE.Vector3(p.hi[0] + c / 2, Hs - 0.4, p.hi[1] + c / 2);
    const seen = top.clone().addScalar(-p.k);
    const foot = new THREE.Vector3(p.lo[0] + c / 2, 0.34, p.lo[1] + c / 2);
    sight.set(i, top, seen);
    ghost.set(i, foot, seen);
  });
  sight.commit(); ghost.commit();
  const red = [0.64, 0.23, 0.16];
  const sightMat = inkLine({ width: 1.6, dashed: true, dash: 0.42, gap: 0.3, rgb: red, opacity: 0, depthTest: false });
  const ghostMat = inkLine({ width: 1.2, dashed: true, dash: 0.25, gap: 0.25, rgb: [0.35, 0.33, 0.3], opacity: 0, depthTest: false });
  const sightMesh = sight.mesh(sightMat, 8), ghostMesh = ghost.mesh(ghostMat, 7);
  group.add(sightMesh, ghostMesh);
  const dotGeo = new THREE.SphereGeometry(0.14, 12, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...red, THREE.SRGBColorSpace), transparent: true, opacity: 0, depthTest: false });
  const dots = [];
  specs.forEach((p) => {
    for (const q of [[p.hi[0] + c / 2, Hs - 0.4, p.hi[1] + c / 2], [p.hi[0] + c / 2 - p.k, Hs - 0.4 - p.k, p.hi[1] + c / 2 - p.k]]) {
      const d = new THREE.Mesh(dotGeo, dotMat);
      d.position.set(...q);
      d.renderOrder = 9;
      dots.push(d);
      group.add(d);
    }
  });

  // swifts wheeling round the upper storey: each an ink 'm' of four strokes
  const NB = 5;
  const birds = new Segments(NB * 4);
  const birdMat = inkLine({ width: 1.7 });
  const birdMesh = birds.mesh(birdMat, 3);
  group.add(birdMesh);
  const B = [];
  for (let i = 0; i < NB; i++) {
    B.push({
      r: 7.8 + (i % 3) * 1.4, y: 15.4 + ((i * 7) % 5) * 0.6, w: 0.85 + (i % 2) * 0.15,
      om: (0.32 + (i % 3) * 0.05) * (i === 3 ? -1 : 1), ph: i * 1.31, fl: 7 + i * 0.9, cx: (i % 2) * 0.6, cz: -(i % 3) * 0.4,
    });
  }
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  function updateBirds(t) {
    B.forEach((bd, i) => {
      const a = bd.ph + bd.om * t;
      const c = v(bd.cx + bd.r * Math.cos(a), bd.y + 0.6 * Math.sin(a * 2.3 + i), bd.cz + bd.r * Math.sin(a));
      const T = v(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(Math.sign(bd.om));
      const S = v(T.z, 0, -T.x); // wing direction
      const f = Math.sin(t * bd.fl + i * 2.1);
      const up = 0.28 * bd.w * f;
      for (const sd of [-1, 1]) {
        const mid = c.clone().addScaledVector(S, sd * bd.w * 0.5).add(v(0, 0.18 * bd.w + up * 0.5, 0)).addScaledVector(T, -0.08);
        const tip = c.clone().addScaledVector(S, sd * bd.w).add(v(0, up * 1.2 - 0.05, 0)).addScaledVector(T, -0.22);
        const k = i * 4 + (sd < 0 ? 0 : 2);
        birds.set(k, c, mid);
        birds.set(k + 1, mid, tip);
      }
    });
    birds.commit();
  }

  return {
    group,
    mats: [mat, pennantMat, dressMat],
    lineMats: [sightMat, ghostMat],
    update(t, off, fade) {
      updateBirds(t);
      birdMat.opacity = fade * Math.max(0, 1 - off * 1.6);
      birdMesh.visible = birdMat.opacity > 0.01;
      mat.uniforms.uFade.value = fade;
      pennantMat.uniforms.uFade.value = fade;
      const dressFade = fade * Math.max(0, 1 - off * 1.6);
      dressMat.uniforms.uFade.value = dressFade;
      dressing.visible = dressFade > 0.002;
      const g = fade * Math.min(1, Math.max(0, (off - 0.25) / 0.5));
      sightMat.opacity = g; ghostMat.opacity = g * 0.8; dotMat.opacity = g;
      const vis = g > 0.002;
      sightMesh.visible = ghostMesh.visible = vis;
      dots.forEach((d) => { d.visible = vis; });
    },
  };
}
