// The solid lizard, made from the exact outline of the drawn tile.
//
// The outline and a grid of interior points are triangulated (Delaunay). Each
// vertex gets a height that depends only on its distance d to the outline,
// h = A·√d: the body is "inflated" from the drawing, so seen from above its
// silhouette is the tile itself, thin parts (toes, tail tip) stay low and the
// trunk rises highest. A low ridge runs down the back and the eyes bulge.
//
// For animation every vertex is also given coordinates (s, l) along and across
// the spine. The walking body is redrawn each frame by laying the spine along
// a path over the desk: a vertex goes to path(s) + l·left + h·up, so the body
// bends over every edge it crosses. Legs swing about their joints in (s, l).

import * as THREE from 'three';
import { outline, SPINE, LEGS, EYES } from './lizard.js';
import { HERO_SPAN } from './drawing.js';

const A = 0.5; // height = A·√d (tile units)

function resample(P, step, closed) {
  const L = [0];
  const n = P.length + (closed ? 1 : 0);
  for (let i = 1; i < n; i++) { const a = P[i - 1], b = P[i % P.length]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const tot = L[L.length - 1];
  const m = Math.max(2, Math.round(tot / step));
  const out = [];
  let j = 0;
  for (let k = 0; k < (closed ? m : m + 1); k++) {
    const s = (k / m) * tot;
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const u = (s - L[j]) / (L[j + 1] - L[j] || 1);
    const a = P[j], b = P[(j + 1) % P.length];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return { pts: out, length: tot };
}

function catmull(P, per) {
  const out = [];
  for (let k = 0; k < P.length - 1; k++) {
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
    for (let s = 0; s < per; s++) {
      const u = s / per, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}

// The spine as dense samples exactly `step` apart (tile units), with unit
// tangents and left normals. The walking path reuses these very samples.
export function spineSamples(step) {
  const dense = catmull(SPINE, 40);
  const L = [0];
  for (let i = 1; i < dense.length; i++) L.push(L[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const pts = [];
  let j = 0;
  for (let s = 0; s <= L[L.length - 1] + 1e-9; s += step) {
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const u = (s - L[j]) / (L[j + 1] - L[j] || 1);
    pts.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u]);
  }
  const length = (pts.length - 1) * step;
  const T = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 2)], b = pts[Math.min(pts.length - 1, i + 2)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [dx / l, dy / l];
  });
  return { pts, T, N: T.map(([x, y]) => [-y, x]), length, step };
}

function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function distToPoly(poly, x, y) {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], b = poly[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    let t = ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1);
    t = Math.max(0, Math.min(1, t));
    const ex = a[0] + t * dx - x, ey = a[1] + t * dy - y;
    d = Math.min(d, ex * ex + ey * ey);
  }
  return Math.sqrt(d);
}

// Bowyer–Watson Delaunay triangulation (the point sets here are small)
function delaunay(P) {
  const n = P.length;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of P) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const dm = Math.max(x1 - x0, y1 - y0) * 20, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const pts = P.concat([[mx - dm, my - dm], [mx, my + dm], [mx + dm, my - dm]]);
  const circ = (a, b, c) => {
    const [ax, ay] = pts[a], [bx, by] = pts[b], [cx, cy] = pts[c];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return [ux, uy, (ax - ux) ** 2 + (ay - uy) ** 2];
  };
  let tris = [[n, n + 1, n + 2, ...circ(n, n + 1, n + 2)]];
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[i];
    const keep = [], edges = new Map();
    for (const t of tris) {
      if ((px - t[3]) ** 2 + (py - t[4]) ** 2 < t[5]) {
        for (const [a, b] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) {
          const key = a < b ? `${a},${b}` : `${b},${a}`;
          if (edges.has(key)) edges.delete(key); else edges.set(key, [a, b]);
        }
      } else keep.push(t);
    }
    for (const [a, b] of edges.values()) keep.push([a, b, i, ...circ(a, b, i)]);
    tris = keep;
  }
  return tris.filter((t) => t[0] < n && t[1] < n && t[2] < n).map((t) => [t[0], t[1], t[2]]);
}

// project a point onto the spine: arc length s and signed lateral offset l
function project(sp, x, y) {
  let bi = 0, bd = Infinity;
  for (let i = 0; i < sp.pts.length; i++) {
    const d = (sp.pts[i][0] - x) ** 2 + (sp.pts[i][1] - y) ** 2;
    if (d < bd) { bd = d; bi = i; }
  }
  // refine within the neighbouring samples so the offset is perpendicular
  const ST = sp.step;
  let s = bi * ST;
  for (let it = 0; it < 4; it++) {
    const f = Math.min(sp.pts.length - 1.001, Math.max(0, s / ST));
    const i = Math.floor(f), u = f - i;
    const p = [sp.pts[i][0] + (sp.pts[i + 1][0] - sp.pts[i][0]) * u, sp.pts[i][1] + (sp.pts[i + 1][1] - sp.pts[i][1]) * u];
    const t = [sp.T[i][0] + (sp.T[i + 1][0] - sp.T[i][0]) * u, sp.T[i][1] + (sp.T[i + 1][1] - sp.T[i][1]) * u];
    const along = (x - p[0]) * t[0] + (y - p[1]) * t[1];
    s = Math.min((sp.pts.length - 1) * ST, Math.max(0, s + along * 0.9));
  }
  const f = Math.min(sp.pts.length - 1.001, s / ST);
  const i = Math.floor(f), u = f - i;
  const p = [sp.pts[i][0] + (sp.pts[i + 1][0] - sp.pts[i][0]) * u, sp.pts[i][1] + (sp.pts[i + 1][1] - sp.pts[i][1]) * u];
  const nn = [sp.N[i][0] + (sp.N[i + 1][0] - sp.N[i][0]) * u, sp.N[i][1] + (sp.N[i + 1][1] - sp.N[i][1]) * u];
  const l = (x - p[0]) * nn[0] + (y - p[1]) * nn[1];
  return [s, l];
}

// position of the spine and its frame at arc length s
function spineAt(sp, s) {
  const f = Math.min(sp.pts.length - 1.001, Math.max(0, s / sp.step));
  const i = Math.floor(f), u = f - i;
  const lerp = (A) => [A[i][0] + (A[i + 1][0] - A[i][0]) * u, A[i][1] + (A[i + 1][1] - A[i][1]) * u];
  return { p: lerp(sp.pts), t: lerp(sp.T), n: lerp(sp.N) };
}
// v = S(s) + a·T(s) + l·N(s): exact for any choice of s
function decompose(sp, s, x, y) {
  const f = spineAt(sp, s);
  const dx = x - f.p[0], dy = y - f.p[1];
  return [dx * f.t[0] + dy * f.t[1], dx * f.n[0] + dy * f.n[1]];
}

export function buildLizard(spineStep) {
  const ring = resample(outline(14), 0.018, true).pts;
  const pts = ring.map((p) => p.slice());
  const nb = pts.length;
  // interior points on a jittered triangular grid, kept clear of the outline
  const g = 0.04;
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  for (let j = -40; j <= 40; j++) {
    for (let i = -40; i <= 40; i++) {
      const x = i * g + (j & 1) * g * 0.5 + rnd() * 0.002, y = j * g * 0.866 + rnd() * 0.002;
      if (Math.abs(x) > 1.5 || Math.abs(y) > 1.5) continue;
      if (!inside(ring, x, y)) continue;
      if (distToPoly(ring, x, y) < g * 0.55) continue;
      pts.push([x, y]);
    }
  }
  const tris = delaunay(pts).filter(([a, b, c]) => {
    const cx = (pts[a][0] + pts[b][0] + pts[c][0]) / 3, cy = (pts[a][1] + pts[b][1] + pts[c][1]) / 3;
    return inside(ring, cx, cy);
  });
  const n = pts.length;
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) dist[i] = i < nb ? 0 : distToPoly(ring, pts[i][0], pts[i][1]);

  // spine coordinates (the nearest point on the whole spine)
  const sp = spineSamples(spineStep);
  const S = new Float32Array(n), Lat = new Float32Array(n);
  for (let i = 0; i < n; i++) { const [s, l] = project(sp, pts[i][0], pts[i][1]); S[i] = s; Lat[i] = l; }
  // Attachments for the animation. Only the tail itself rides on the curled
  // part of the spine; everything else hangs from the trunk (s ≥ TAIL_BASE),
  // offset along it by a and across it by l.
  const TAIL_BASE = project(sp, -0.62, 0.46)[0];
  const sAtt = new Float32Array(n), along = new Float32Array(n), across = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tail = S[i] < TAIL_BASE && Math.abs(Lat[i]) < 0.2;
    sAtt[i] = tail ? S[i] : Math.max(TAIL_BASE, S[i]);
    const [a, l] = decompose(sp, sAtt[i], pts[i][0], pts[i][1]);
    along[i] = a; across[i] = l;
  }

  // heights: inflation, a ridge down the back, bulging eyes; then smoothed
  let h = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (i < nb) continue;
    const d = dist[i];
    const f = S[i] / sp.length;
    const ridge = 0.035 * Math.exp(-((Lat[i] / 0.07) ** 2)) * Math.min(1, d / 0.12) * (f > 0.15 && f < 0.9 ? 1 : 0.4);
    let eye = 0;
    for (const e of EYES) eye += 0.075 * Math.exp(-(((pts[i][0] - e[0]) ** 2 + (pts[i][1] - e[1]) ** 2) / 0.05 ** 2));
    h[i] = A * Math.sqrt(d) * (d < 0.03 ? 0.75 + (d / 0.03) * 0.25 : 1) + ridge + eye * Math.min(1, d / 0.05);
  }
  const nbrs = Array.from({ length: n }, () => new Set());
  for (const [a, b, c] of tris) { nbrs[a].add(b).add(c); nbrs[b].add(a).add(c); nbrs[c].add(a).add(b); }
  for (let it = 0; it < 10; it++) {
    const h2 = h.slice();
    for (let i = nb; i < n; i++) {
      let s = 0, k = 0;
      for (const j of nbrs[i]) { s += h[j]; k++; }
      if (k) h2[i] = h[i] * 0.5 + (s / k) * 0.5;
    }
    h = h2;
  }

  // legs: vertices nearer a leg's axis than the spine swing about its joint
  const legIdx = new Int8Array(n).fill(-1), legW = new Float32Array(n);
  const joints = LEGS.map((L) => {
    const s = Math.max(TAIL_BASE, project(sp, L.joint[0], L.joint[1])[0]);
    const [a, l] = decompose(sp, s, L.joint[0], L.joint[1]);
    return { s, a, l };
  });
  const legA = new Float32Array(n), legL = new Float32Array(n); // offsets in the joint's frame
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    let best = -1, bd = Infinity, bt = 0;
    LEGS.forEach((L, k) => {
      const dx = L.foot[0] - L.joint[0], dy = L.foot[1] - L.joint[1];
      const len2 = dx * dx + dy * dy;
      const t = ((x - L.joint[0]) * dx + (y - L.joint[1]) * dy) / len2;
      const tc = Math.max(0, Math.min(1, t));
      const d = Math.hypot(L.joint[0] + dx * tc - x, L.joint[1] + dy * tc - y);
      if (d < bd) { bd = d; best = k; bt = t; }
    });
    if (best >= 0 && bt > -0.12 && bd < Math.abs(Lat[i]) * 0.95 + 0.02 && bd < 0.32) {
      legIdx[i] = best;
      legW[i] = Math.min(1, Math.max(0, (bt + 0.1) / 0.5)) ** 1.5;
      const [a, l] = decompose(sp, joints[best].s, x, y);
      legA[i] = a; legL[i] = l;
    }
  }

  const uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    uv[i * 2] = (pts[i][0] + HERO_SPAN) / (2 * HERO_SPAN);
    uv[i * 2 + 1] = (pts[i][1] + HERO_SPAN) / (2 * HERO_SPAN);
  }
  const index = [];
  for (const [a, b, c] of tris) {
    // counter-clockwise in tile space is counter-clockwise seen from above
    const cr = (pts[b][0] - pts[a][0]) * (pts[c][1] - pts[a][1]) - (pts[b][1] - pts[a][1]) * (pts[c][0] - pts[a][0]);
    if (cr > 0) index.push(a, b, c); else index.push(a, c, b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  geo.setIndex(index);
  return { geo, n, nb, pts, ring, S, Lat, h, dist, legIdx, legW, legA, legL, joints, sAtt, along, across, spine: sp, tris };
}
