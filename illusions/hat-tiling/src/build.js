// Turns a patch of hats or spectres into GPU-ready arrays:
//   fills    – every tile triangulated, with its own (tile-local) coordinates,
//              the type of the cluster it belongs to at levels 1–4, and a
//              flag for the odd ones out (reflected hats, turned spectres);
//   segments – every boundary edge once, tagged with the level of the
//              smallest cluster that contains the tiles on both sides.

import * as THREE from 'three';
import { HAT, transPt, mul, inv } from './hat.js';
import { HAT_KITES, kitePts, centre } from './kites.js';
import { SPECTRE } from './spectre.js';

const HAT_TYPES = { H: 0, H1: 0, T: 1, P: 2, F: 3 };
const SPECTRE_TYPES = { Gamma: 0, Gamma1: 0, Gamma2: 0, Delta: 1, Theta: 2, Lambda: 3, Xi: 4, Pi: 5, Sigma: 6, Phi: 7, Psi: 8 };

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function commonPrefix(a, b) {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

function triangulate(poly) {
  const v2 = poly.map((p) => new THREE.Vector2(p.x, p.y));
  return THREE.ShapeUtils.triangulateShape(v2, []);
}

// ------------------------------------------------------------------ fills
function fillArrays(tiles, local, tris, typesOf, oddOf) {
  const nv = local.length;
  const pos = new Float32Array(tiles.length * nv * 2);
  const loc = new Float32Array(tiles.length * nv * 2);
  const typ = new Float32Array(tiles.length * nv * 4);
  const inf = new Float32Array(tiles.length * nv * 4);
  const idx = new Uint32Array(tiles.length * tris.length * 3);
  tiles.forEach((t, n) => {
    const ty = typesOf(t);
    const odd = oddOf(t) ? 1 : 0;
    const r = hash(n);
    for (let k = 0; k < nv; k++) {
      const w = transPt(t.T, local[k]);
      const o = n * nv + k;
      pos[o * 2] = w.x; pos[o * 2 + 1] = w.y;
      loc[o * 2] = local[k].x; loc[o * 2 + 1] = local[k].y;
      typ.set(ty, o * 4);
      inf[o * 4] = odd; inf[o * 4 + 1] = r; inf[o * 4 + 2] = Math.sign(t.T[0] * t.T[4] - t.T[1] * t.T[3]);
    }
    tris.forEach((tri, j) => idx.set([n * nv + tri[0], n * nv + tri[1], n * nv + tri[2]], (n * tris.length + j) * 3));
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 2));
  g.setAttribute('aLocal', new THREE.BufferAttribute(loc, 2));
  g.setAttribute('aType', new THREE.BufferAttribute(typ, 4));
  g.setAttribute('aInfo', new THREE.BufferAttribute(inf, 4));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

function segmentGeometry(segs) {
  const quad = new THREE.InstancedBufferGeometry();
  quad.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2));
  quad.setIndex([0, 1, 2, 0, 2, 3]);
  const pq = new Float32Array(segs.length * 4);
  const lv = new Float32Array(segs.length);
  segs.forEach((s, i) => { pq.set([s[0], s[1], s[2], s[3]], i * 4); lv[i] = s[4]; });
  quad.setAttribute('iPQ', new THREE.InstancedBufferAttribute(pq, 4));
  quad.setAttribute('iLevel', new THREE.InstancedBufferAttribute(lv, 1));
  quad.instanceCount = segs.length;
  return quad;
}

// positions are 2D, so three cannot work out bounding spheres itself
function setSphere(geoms, box) {
  const c = new THREE.Vector3((box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2, 0);
  const r = Math.hypot(box.x1 - box.x0, box.y1 - box.y0) / 2 + 10;
  for (const g of geoms) g.boundingSphere = new THREE.Sphere(c, r);
}

function bounds(geom) {
  const p = geom.getAttribute('position').array;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, sx = 0, sy = 0;
  for (let i = 0; i < p.length; i += 2) {
    x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]);
    sx += p[i]; sy += p[i + 1];
  }
  return { x0, x1, y0, y1, cx: sx / (p.length / 2), cy: sy / (p.length / 2) };
}

// ------------------------------------------------------------------ hats
// `check` is the result of kites.verify(hats): every hat's eight kites on
// the grid fixed by the first hat.
export function buildHats(hats, check, topLevel) {
  const fill = fillArrays(
    hats, HAT, triangulate(HAT),
    (h) => [HAT_TYPES[h.label], HAT_TYPES[h.types[2]], HAT_TYPES[h.types[3]], HAT_TYPES[h.types[4]]],
    (h) => h.label === 'H1',
  );

  // boundary edges, found through the kite grid
  const owner = new Map();
  check.perHat.forEach((keys, n) => keys.forEach((k) => owner.set(k, n)));
  const W = hats[0].T; // grid -> world
  const NB = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
  const depth = Math.min(...hats.map((h) => h.path.length));
  const segs = [];
  check.perHat.forEach((keys, n) => {
    for (const k of keys) {
      const [i, j, d] = k.split(',').map(Number);
      const p = kitePts(i, j, d); // c, m1, v, m2
      const a = NB[(d + 5) % 6], b = NB[d];
      const across = [
        [[i, j, (d + 5) % 6], p[0], p[1]],
        [[i + a[0], j + a[1], (d + 2) % 6], p[1], p[2]],
        [[i + b[0], j + b[1], (d + 4) % 6], p[2], p[3]],
        [[i, j, (d + 1) % 6], p[3], p[0]],
      ];
      for (const [nk, e0, e1] of across) {
        const m = owner.get(nk.join(','));
        if (m === n) continue; // inside the hat
        if (m !== undefined && m < n) continue; // drawn from the other side
        const level = m === undefined ? topLevel + 1 : depth - 1 - commonPrefix(hats[n].path, hats[m].path);
        const w0 = transPt(W, { x: e0[0], y: e0[1] }), w1 = transPt(W, { x: e1[0], y: e1[1] });
        segs.push([w0.x, w0.y, w1.x, w1.y, level]);
      }
    }
  });
  const lines = segmentGeometry(segs);
  const box = bounds(fill);
  setSphere([fill, lines], box);
  return { fill, lines, box, count: hats.length, segments: segs.length };
}

// ------------------------------------------------------------------ spectres
// Edges bent into an S that is symmetric about its midpoint: neighbours fit
// only if both are the same way round, which rules out mirror images.
const BEND = 0.12, SUBDIV = 6;
function bentEdge(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const out = [];
  for (let k = 0; k < SUBDIV; k++) {
    const t = k / SUBDIV;
    const o = BEND * Math.sin(2 * Math.PI * t);
    out.push({ x: a.x + dx * t - dy * o, y: a.y + dy * t + dx * o });
  }
  return out;
}
export const SPECTRE_CURVED = SPECTRE.flatMap((p, i) => bentEdge(p, SPECTRE[(i + 1) % SPECTRE.length]));

export function buildSpectres(tiles, levels) {
  const fill = fillArrays(
    tiles, SPECTRE_CURVED, triangulate(SPECTRE_CURVED),
    (t) => {
      // ancestors from the nearest up; a mystic's two spectres count as one tile
      const up = t.labels.slice().reverse();
      if (t.label.startsWith('Gamma')) up.shift();
      const at = (l) => (l === 0 ? t.label : up[l - 1] || 'Delta');
      return [0, 1, 2, 3].map((l) => SPECTRE_TYPES[at(l)]);
    },
    (t) => t.label === 'Gamma2',
  );
  const key = (p) => `${Math.round(p.x * 1e5)},${Math.round(p.y * 1e5)}`;
  const n = SPECTRE.length;
  const world = tiles.map((t) => SPECTRE.map((p) => transPt(t.T, p)));
  const edgeOwner = new Map();
  world.forEach((P, ti) => { for (let i = 0; i < n; i++) edgeOwner.set(key(P[i]) + '>' + key(P[(i + 1) % n]), ti); });
  const segs = [];
  world.forEach((P, ti) => {
    for (let i = 0; i < n; i++) {
      const m = edgeOwner.get(key(P[(i + 1) % n]) + '>' + key(P[i]));
      if (m !== undefined && m < ti) continue;
      const level = m === undefined ? levels : Math.max(0, levels - 1 - commonPrefix(tiles[ti].path, tiles[m].path));
      const local = bentEdge(SPECTRE[i], SPECTRE[(i + 1) % n]).concat([SPECTRE[(i + 1) % n]]);
      const w = local.map((p) => transPt(tiles[ti].T, p));
      for (let k = 0; k < w.length - 1; k++) segs.push([w[k].x, w[k].y, w[k + 1].x, w[k + 1].y, level]);
    }
  });
  const lines = segmentGeometry(segs);
  const box = bounds(fill);
  setSphere([fill, lines], box);
  return { fill, lines, box, count: tiles.length, segments: segs.length };
}

export { mul, inv, centre };
