// The puzzle as numbers: walk tiles, the turning bridge, and the joins.
//
// Units: one tile = 1. A node is the centre of a tile's walking surface,
// [x, y, z] with y up. The camera looks down the cube diagonal (1, 1, 1), so
// two points that differ by k·(1, 1, 1) land on the same spot of the picture.
//
// The bridge turns about the y axis through the hub at (0, H, 0). Its tip can
// meet three static walkways:
//
//   θ =   0°  tip → A   at the top of the stairs: a real join (k = 0)
//   θ = 270°  tip → T   the bell-tower top, 2 units higher and 2 units nearer
//                       along every axis (k = +2): it meets only in the picture
//   θ =  90°  tip → B   the garden terrace, 2 lower and 2 farther (k = −2)
//
// A join is found, not listed: at a settled angle, a tip and a walkway end are
// joined when the walkway tile sits exactly one tile beyond the tip *plus some
// multiple k of (1, 1, 1)*. The lower tile in the picture must also be the
// nearer one (k ≥ 0 when the step points toward the viewer), otherwise its
// neighbour's front face would show across the seam and give the trick away.

export const H = 3; // bridge level
export const ARM = 2; // walkable bridge tiles beyond the hub
export const SLAB = 0.42; // bridge deck thickness
export const BASE = -6.5; // where piers end, far down in the mist

export const DIRS = {
  '+x': [1, 0, 0],
  '-x': [-1, 0, 0],
  '+z': [0, 0, 1],
  '-z': [0, 0, -1],
};

// rotating nodes are given in the bridge's own frame (θ = 0: arm along +x)
export const NODES = {
  start: { p: [3, 0, 4] },
  porch: { p: [4, 0, 4] },
  A: { p: [3, H, 0], ports: ['-x'] },
  T: { p: [2, 5, 5], ports: ['-z'] },
  B: { p: [-2, 1, -5], ports: ['+z'] },
  B2: { p: [-2, 1, -6] },
  B3: { p: [-3, 1, -5] },
  r1: { p: [1, H, 0], rot: true },
  r2: { p: [2, H, 0], rot: true, ports: ['+x'] },
};

// Stairs from the landing A down to the start platform: twelve risers of a
// quarter unit over a run of three tiles toward +z.
export const STAIR = { x: 3, z0: 0.5, run: 3, risers: 12, top: H };
export function treadY(z) {
  const { z0, run, risers, top } = STAIR;
  if (z <= z0) return top;
  if (z >= z0 + run) return top - run;
  const i = Math.floor(((z - z0) / run) * risers);
  return top - (i + 1) * (run / risers) * (top / run);
}

function stairPath() {
  const { x, z0, run, risers } = STAIR;
  const pts = [[3, 0, 4], [3, 0, z0 + run]];
  for (let i = risers - 1; i >= 0; i--) {
    const z = z0 + ((i + 0.5) / risers) * run;
    pts.push([x, treadY(z), z]);
  }
  pts.push([3, H, z0], [3, H, 0]);
  return pts;
}

// static and bridge-internal edges: [a, b, waypoints from a to b (optional)]
export const EDGES = [
  ['start', 'porch'],
  ['start', 'A', stairPath()],
  ['B', 'B2'],
  ['B', 'B3'],
  ['r1', 'r2'],
];

// ---------------------------------------------------------------- geometry
export const ANG = (ti) => ((((ti % 4) + 4) % 4) * Math.PI) / 2;

// a point in the bridge frame -> world, for bridge angle θ (radians, about +y)
export function rotP(p, th) {
  const c = Math.cos(th), s = Math.sin(th);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

export function nodeWorld(id, th) {
  const n = NODES[id];
  return n.rot ? rotP(n.p, th) : n.p.slice();
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

// All joins between a bridge tip and a walkway end at quarter-turn ti.
export function joinsAt(ti) {
  const th = ANG(ti);
  const out = [];
  for (const [rid, r] of Object.entries(NODES)) {
    if (!r.rot || !r.ports) continue;
    for (const pd of r.ports) {
      const R = rotP(r.p, th);
      const d = rotP(DIRS[pd], th).map((v) => Math.round(v));
      const q = add(R, d);
      for (const [nid, n] of Object.entries(NODES)) {
        if (n.rot || !n.ports) continue;
        for (const nd of n.ports) {
          const dn = DIRS[nd];
          if (dn[0] !== -d[0] || dn[2] !== -d[2]) continue;
          const diff = sub(n.p, q);
          if (Math.abs(diff[0] - diff[1]) > 1e-6 || Math.abs(diff[1] - diff[2]) > 1e-6) continue;
          const k = Math.round(diff[0]);
          const towardViewer = d[0] + d[2] > 0;
          if (towardViewer ? k < 0 : k > 0) continue;
          const mR = add(R, scale(d, 0.5));
          out.push({ r: rid, n: nid, k, d, R, N: n.p.slice(), mR, mN: add(mR, [k, k, k]) });
        }
      }
    }
  }
  return out;
}

const JOINS = [0, 1, 2, 3].map(joinsAt);

// Neighbours of a node at quarter-turn ti, or with ti = null while the
// bridge is between positions (then nothing joins it to the walkways).
export function neighbours(id, ti) {
  const out = [];
  for (const [a, b, pts] of EDGES) {
    if (a === id) out.push({ to: b, pts, dir: 1 });
    else if (b === id) out.push({ to: a, pts, dir: -1 });
  }
  if (ti !== null) {
    for (const j of JOINS[((ti % 4) + 4) % 4]) {
      if (j.r === id) out.push({ to: j.n, join: j, dir: 1 });
      else if (j.n === id) out.push({ to: j.r, join: j, dir: -1 });
    }
  }
  return out;
}

function len(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]);
  return s;
}

// World-space waypoints for walking one edge. A join contributes a jump: the
// walker reaches the tip's edge, is moved by k·(1, 1, 1), and walks on.
export function edgeWaypoints(from, nb, ti) {
  const th = ANG(ti);
  if (nb.join) {
    const j = nb.join;
    const fwd = nb.dir === 1;
    const seq = fwd
      ? [{ p: j.R }, { p: j.mR }, { p: j.mN, jump: j.k }, { p: j.N }]
      : [{ p: j.N }, { p: j.mN }, { p: j.mR, jump: -j.k }, { p: j.R }];
    return seq;
  }
  let pts = nb.pts ? nb.pts.slice() : [NODES[from].p, NODES[nb.to].p];
  if (!nb.pts) pts = [NODES[from].p, NODES[nb.to].p];
  else if (nb.dir === -1) pts = pts.slice().reverse();
  const rot = NODES[from].rot;
  return pts.map((p) => ({ p: rot ? rotP(p, th) : p.slice() }));
}

export function edgeCost(from, nb) {
  if (nb.join) return 1;
  return len(nb.pts || [NODES[from].p, NODES[nb.to].p]);
}

// Shortest walk from `from` to `to` with the bridge fixed at ti (null if none).
export function findPath(from, to, ti) {
  const dist = { [from]: 0 }, prev = {};
  const open = [from];
  while (open.length) {
    open.sort((a, b) => dist[a] - dist[b]);
    const u = open.shift();
    if (u === to) break;
    for (const nb of neighbours(u, ti)) {
      const d = dist[u] + edgeCost(u, nb);
      if (dist[nb.to] === undefined || d < dist[nb.to] - 1e-9) {
        dist[nb.to] = d;
        prev[nb.to] = { u, nb };
        if (!open.includes(nb.to)) open.push(nb.to);
      }
    }
  }
  if (dist[to] === undefined) return null;
  const steps = [];
  for (let v = to; v !== from; v = prev[v].u) steps.unshift({ from: prev[v].u, nb: prev[v].nb });
  return steps;
}

// Solve the puzzle: fewest turns and shortest walk from (node, ti) to a goal
// node, over states (node, quarter-turn). A turn carries the walker along if
// it stands on the bridge. Returns a list of actions:
//   { type: 'turn', ti }  or  { type: 'walk', to }
export function solve(from, ti0, goal) {
  const key = (n, t) => `${n}|${t}`;
  const TURN = 3;
  const dist = { [key(from, ti0)]: 0 }, prev = {};
  const open = [[from, ti0]];
  let found = null;
  while (open.length) {
    open.sort((a, b) => dist[key(...a)] - dist[key(...b)]);
    const [n, t] = open.shift();
    const kc = key(n, t);
    if (n === goal) { found = kc; break; }
    const moves = [];
    for (const nb of neighbours(n, t)) moves.push([nb.to, t, edgeCost(n, nb), { type: 'walk', to: nb.to }]);
    for (const dt of [1, -1]) {
      const t2 = (t + dt + 4) % 4;
      moves.push([n, t2, TURN, { type: 'turn', ti: t2 }]);
    }
    for (const [n2, t2, c, act] of moves) {
      const k2 = key(n2, t2);
      const d = dist[kc] + c;
      if (dist[k2] === undefined || d < dist[k2] - 1e-9) {
        dist[k2] = d;
        prev[k2] = { k: kc, act };
        if (!open.some(([a, b]) => key(a, b) === k2)) open.push([n2, t2]);
      }
    }
  }
  if (!found) return null;
  const acts = [];
  for (let k = found; prev[k]; k = prev[k].k) acts.unshift(prev[k].act);
  // merge consecutive walks into one walk to the last node
  const out = [];
  for (const a of acts) {
    const last = out[out.length - 1];
    if (a.type === 'walk' && last && last.type === 'walk') last.to = a.to;
    else out.push({ ...a });
  }
  return out;
}
