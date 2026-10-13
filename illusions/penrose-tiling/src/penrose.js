// Penrose's P3 rhomb tiling, generated exactly by Robinson-triangle deflation.
//
// Every rhomb is cut along one diagonal into two Robinson triangles (A, B, C):
//   kind 0 – half of a thin rhomb: apex A is a 36° corner, B and C are 144° corners;
//   kind 1 – half of a thick rhomb: apex A is a 108° corner, B and C are 72° corners.
// The base BC is the cut. Deflation replaces each triangle by smaller ones,
// all scaled by 1/φ: a thin half becomes one thin and one thick half, a thick
// half becomes one thin and two thick halves. Halves that share a base pair
// up again into whole rhombs.
//
// The labels B and C carry Penrose's matching rule. Every rhomb edge is
// crossed by one arc, centred on the edge's B or C end. Arcs round B ("X",
// radius ρX) and round C ("Y", radius ρY) must continue across every edge.

export const PHI = (1 + Math.sqrt(5)) / 2;
const INV = 1 / PHI;

// Arc radii as fractions of the edge. A thick rhomb's X arc and a thin
// rhomb's X arc meet an edge from opposite ends, so their radii sum to one.
export const ARC = { xThick: 0.62, xThin: 0.38, y: 0.2 };

const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];

// The starting "sun": ten thin halves round the origin, alternately mirrored.
export function seed(rotation = 0) {
  const tris = [];
  for (let i = 0; i < 10; i++) {
    const a1 = ((2 * i - 1) * Math.PI) / 10 + rotation;
    const a2 = ((2 * i + 1) * Math.PI) / 10 + rotation;
    let B = [Math.cos(a1), Math.sin(a1)];
    let C = [Math.cos(a2), Math.sin(a2)];
    if (i % 2 === 0) [B, C] = [C, B];
    tris.push({ k: 0, A: [0, 0], B, C });
  }
  return tris;
}

export function deflate(tris, keep) {
  const out = [];
  const push = (t) => { if (!keep || keep(t)) out.push(t); };
  for (const { k, A, B, C } of tris) {
    if (k === 0) {
      const P = lerp(A, B, INV);
      push({ k: 0, A: C, B: P, C: B });
      push({ k: 1, A: P, B: C, C: A });
    } else {
      const Q = lerp(B, A, INV);
      const R = lerp(B, C, INV);
      push({ k: 1, A: R, B: C, C: A });
      push({ k: 1, A: Q, B: R, C: B });
      push({ k: 0, A: R, B: Q, C: A });
    }
  }
  return out;
}

const key = (p) => `${Math.round(p[0] * 1e7)},${Math.round(p[1] * 1e7)}`;
export const pointKey = key;

// Pair halves into rhombs. Unpaired halves (on the edge of a finite patch)
// are kept as halves: `half: true`.
export function rhombs(tris) {
  const byBase = new Map();
  const out = [];
  for (const t of tris) {
    const kb = key(t.B) + '|' + key(t.C);
    const other = byBase.get(kb);
    if (other) {
      byBase.delete(kb);
      out.push({ k: t.k, A: other.A, B: t.B, A2: t.A, C: t.C, half: false });
    } else byBase.set(kb, t);
  }
  for (const t of byBase.values()) out.push({ k: t.k, A: t.A, B: t.B, A2: null, C: t.C, half: true });
  return out;
}

export function side(r) {
  return Math.hypot(r.A[0] - r.B[0], r.A[1] - r.B[1]);
}

// Check Penrose's matching rule on every interior edge of a list of rhombs:
// both tiles must put an arc of the same family through the same point.
// Returns the number of interior edges checked and the number that fail.
export function checkMatching(list) {
  const edges = new Map();
  let checked = 0, bad = 0;
  for (const r of list) {
    const s = side(r);
    const corners = r.half ? [r.A] : [r.A, r.A2];
    for (const apex of corners) {
      for (const [end, fam] of [[r.B, 'X'], [r.C, 'Y']]) {
        const rad = fam === 'Y' ? ARC.y : r.k === 1 ? ARC.xThick : ARC.xThin;
        const cross = lerp(end, apex, rad);
        const ek = [key(apex), key(end)].sort().join('/');
        const mark = fam + key(cross);
        const prev = edges.get(ek);
        if (prev === undefined) edges.set(ek, mark);
        else {
          checked++;
          if (prev !== mark) bad++;
          edges.delete(ek);
        }
      }
    }
  }
  return { checked, bad };
}

// Centres of local five-fold symmetry. For every vertex where five thick
// rhombs meet at their sharp corners, find how far the tiling around it is
// unchanged by a turn of 72°: the distance to the nearest vertex whose
// rotated image is not a vertex. Distances are in edge lengths; `limit` is
// the radius of the patch, beyond which nothing is known.
export function fivefoldCentres(list, s, limit = Infinity, maxR = 14) {
  const verts = new Map();
  const deg = new Map();
  for (const r of list) {
    if (r.half) continue;
    for (const p of [r.A, r.B, r.A2, r.C]) {
      const k = key(p);
      verts.set(k, p);
      deg.set(k, (deg.get(k) || 0) + 1);
    }
  }
  const cell = s * 2;
  const grid = new Map();
  for (const p of verts.values()) {
    const gk = `${Math.floor(p[0] / cell)},${Math.floor(p[1] / cell)}`;
    if (!grid.has(gk)) grid.set(gk, []);
    grid.get(gk).push(p);
  }
  const c5 = Math.cos((2 * Math.PI) / 5), s5 = Math.sin((2 * Math.PI) / 5);
  const out = [];
  for (const [k, v] of verts) {
    if (deg.get(k) !== 5) continue;
    const room = (limit - Math.hypot(v[0], v[1])) / s;
    if (room < 1.5) continue;
    const top = Math.min(maxR, room);
    const gx = Math.floor(v[0] / cell), gy = Math.floor(v[1] / cell);
    // search in growing shells: most candidates fail within the first one
    let R = top, open = true;
    for (const reach of [2.6, 6, top]) {
      const lim = Math.min(reach, top);
      const n = Math.ceil((lim * s) / cell);
      const near = [];
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        const g = grid.get(`${gx + i},${gy + j}`);
        if (!g) continue;
        for (const p of g) {
          const d = Math.hypot(p[0] - v[0], p[1] - v[1]) / s;
          if (d > 1e-6 && d <= lim) near.push([d, p]);
        }
      }
      near.sort((a, b) => a[0] - b[0]);
      for (const [d, p] of near) {
        const dx = p[0] - v[0], dy = p[1] - v[1];
        if (!verts.has(key([v[0] + dx * c5 - dy * s5, v[1] + dx * s5 + dy * c5]))) { R = d; open = false; break; }
      }
      if (!open || lim >= top) break;
    }
    if (R < 1.5) continue;
    // orientation: the direction of one of the five edges that meet here
    let angle = 0;
    search: for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const q of grid.get(`${gx + i},${gy + j}`) || []) {
        if (Math.abs(Math.hypot(q[0] - v[0], q[1] - v[1]) - s) < s * 1e-6) { angle = Math.atan2(q[1] - v[1], q[0] - v[0]); break search; }
      }
    }
    out.push({ p: v, R, open, angle });
  }
  return out;
}
