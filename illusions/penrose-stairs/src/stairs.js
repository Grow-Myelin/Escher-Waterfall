// The endless staircase, as a real spiral.
//
// Four flights run round the roof of a square building:
//
//   L0 ─F0 (+z, 14 risers)→ L1 ─F1 (+x, 14)→ L2 ─F2 (−z, 6)→ L3 ─F3 (−x, 6)→ L4
//
// Every riser is H high and every tread R deep, so the stair climbs
// 40·H = RISE in all. The flights towards the viewer (+x, +z) are longer than
// the flights away from the viewer by 8 treads, so the plan does not close:
// L4 lies (RISE, RISE) along x and z from L0, as well as RISE above it. That
// is L0 + RISE·(1, 1, 1), a slide along the isometric line of sight, so from
// the isometric angle L4 is drawn exactly on top of L0 and the loop closes.
//
// This works because R = 5·H: (14 − 6)·R = 8·R = 40·H. In true isometric a
// step back of d along both x and z looks exactly like a step up of d.
//
// The landing L0/L4 is the closing piece. It is cut along its diagonal from the
// outer corner to the inner corner, a vertical plane that contains the line of
// sight, so the cut face is seen edge-on. The half where F0 starts stays at the
// foot; the half where F3 arrives is slid RISE·(1, 1, 1) to the top.

import { PAT, st, withShift } from '../../../src/builder.js';

export const R = 0.75; // tread
export const H = 0.15; // riser
export const WR = 2.4; // width of the flights and of the landings
export const HW = WR / 2;
export const NR = [14, 14, 6, 6]; // risers per flight
export const DIRS = [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0]];
export const RISE = NR.reduce((a, b) => a + b, 0) * H; // 6
export const BASE = -6; // ground level
export const nrm = (d) => [-d[2], 0, d[0]]; // outward side of a flight running along d

// Landing centres [x, z] and heights. LAND[4] = LAND[0] + RISE·(1, 1, 1).
export const LAND = (() => {
  const out = [];
  let c = [0, 0], y = 0;
  for (let k = 0; k <= 4; k++) {
    out.push({ c: [...c], y });
    if (k === 4) break;
    const run = WR + (NR[k] - 1) * R;
    c = [c[0] + DIRS[k][0] * run, c[1] + DIRS[k][2] * run];
    y += NR[k] * H;
  }
  return out;
})();

export const COL = {
  wall: 0xcdb99a,
  plinth: 0xa99a83,
  course: 0xe0d5c0,
  tread: 0xd9d0bf,
  riser: 0xb9ae9a,
  inner: 0xc4b59c,
  pane: 0x2e2b28,
  frame: 0xe4dac6,
  door: 0x4a3a2c,
};

const sWall = st(COL.wall, PAT.ASHLAR);
const sInner = st(COL.inner, PAT.PLASTER);
const sTread = st(COL.tread, PAT.PLASTER);
const sRiser = st(COL.riser, PAT.PLAIN);
const sPlinth = st(COL.plinth, PAT.STONE);
const sCourse = st(COL.course, PAT.PLAIN);
const sPane = st(COL.pane, PAT.PANE);
const sFrame = st(COL.frame, PAT.PLAIN);
const sDoor = st(COL.door, PAT.WOOD);

// A vertical wall in the plane through o = [x, z] along the horizontal unit
// vector al; it faces al × up. prof = [[u0, u1, top], ...], contiguous in u.
// The top edge is a staircase: outlines are drawn along the top, the ground
// line and the risers, and nowhere else.
export function wall(b, o, al, prof, base, s, ends = [1, 1]) {
  const P = (u, y) => [o[0] + al[0] * u, y, o[1] + al[2] * u];
  prof.forEach(([u0, u1, yt], i) => {
    const yl = i > 0 ? prof[i - 1][2] : null;
    const yr = i < prof.length - 1 ? prof[i + 1][2] : null;
    const hs = [base, yt];
    if (yl !== null && yl > base && yl < yt) hs.push(yl);
    if (yr !== null && yr > base && yr < yt) hs.push(yr);
    const ys = [...new Set(hs)].sort((a, c) => a - c);
    for (let k = 0; k < ys.length - 1; k++) {
      const ya = ys[k], yb = ys[k + 1];
      const left = i === 0 ? ends[0] : (ya >= yl - 1e-9 ? 1 : 0);
      const right = i === prof.length - 1 ? ends[1] : (ya >= yr - 1e-9 ? 1 : 0);
      b.quad(P(u0, ya), P(u1, ya), P(u1, yb), P(u0, yb), s,
        [ya === base ? 1 : 0, right, yb === yt ? 1 : 0, left]);
    }
  });
}

// Frame of flight k: u along the flight from the centre of L_k, l outwards.
function frame(k) {
  const d = DIRS[k], n = nrm(d), C = LAND[k].c;
  return (u, l, y) => [C[0] + d[0] * u + n[0] * l, y, C[1] + d[2] * u + n[2] * l];
}

// Height of the top of the stair at distance u along flight k.
export function stairTop(k, u) {
  const Y = LAND[k].y;
  if (u < HW) return Y;
  const j = Math.floor((u - HW) / R) + 1;
  return Y + Math.min(j, NR[k]) * H;
}

function treads(b, k) {
  const P = frame(k), Y = LAND[k].y, N = NR[k];
  for (let j = 1; j <= N; j++) {
    const u0 = HW + (j - 1) * R, u1 = u0 + R;
    const y0 = Y + (j - 1) * H, y1 = Y + j * H;
    // riser, facing back down the flight
    b.quad(P(u0, -HW, y0), P(u0, HW, y0), P(u0, HW, y1), P(u0, -HW, y1), sRiser);
    if (j < N) b.quad(P(u0, -HW, y1), P(u0, HW, y1), P(u1, HW, y1), P(u1, -HW, y1), sTread);
  }
}

function landingTop(b, k) {
  const P = frame(k), Y = LAND[k].y;
  b.quad(P(-HW, -HW, Y), P(-HW, HW, Y), P(HW, HW, Y), P(HW, -HW, Y), sTread);
}

// The closing landing, cut along its diagonal. half 'foot' keeps the corner
// where F0 leaves (x ≤ z); half 'top' keeps the corner where F3 arrives and is
// slid RISE·(1, 1, 1). Both are built in the frame of L0.
function closingHalf(b, half) {
  const sh = half === 'top' ? RISE : 0;
  const sT = withShift(sTread, sh), sW = withShift(sWall, sh);
  const a = [-HW, 0, -HW], c = [HW, 0, HW];
  const s2 = Math.SQRT1_2;
  if (half === 'foot') {
    b.tri(a, [-HW, 0, HW], c, sT, [1, 0, 1]);
    // cut face, looking towards +x −z
    wall(b, [HW, HW], [-s2, 0, -s2], [[0, WR * Math.SQRT2, 0]], BASE, sW);
  } else {
    b.tri(a, c, [HW, 0, -HW], sT, [1, 1, 0]);
    wall(b, [-HW, -HW], [s2, 0, s2], [[0, WR * Math.SQRT2, 0]], BASE, sW);
  }
}

function outerProfile(k) {
  const Y = LAND[k].y, N = NR[k];
  const prof = [[-HW, HW, Y]];
  for (let j = 1; j < N; j++) prof.push([HW + (j - 1) * R, HW + j * R, Y + j * H]);
  const e = HW + (N - 1) * R;
  prof.push([e, e + WR, LAND[k + 1].y]);
  return prof;
}

// ------------------------------------------------------------------ facades

// Convex window outline in a wall: rectangle with a round head when `arch`.
function opening(b, o, al, n, u0, u1, y0, y1, arch, off, s) {
  const P = (u, y) => [o[0] + al[0] * u + n[0] * off, y, o[1] + al[2] * u + n[2] * off];
  const pts = [P(u0, y0), P(u1, y0)];
  if (arch) {
    const r = (u1 - u0) / 2, cu = (u0 + u1) / 2, cy = y1 - r;
    pts.push(P(u1, cy));
    for (let i = 1; i < 8; i++) {
      const t = (i / 8) * Math.PI;
      pts.push(P(cu + r * Math.cos(t), cy + r * Math.sin(t)));
    }
    pts.push(P(u0, cy));
  } else {
    pts.push(P(u1, y1), P(u0, y1));
  }
  b.poly(pts, s);
}

function windowAt(b, o, al, n, u, y0, w, h, arch, sill = true) {
  opening(b, o, al, n, u - w / 2 - 0.12, u + w / 2 + 0.12, y0 - 0.12, y0 + h + 0.12, arch, 0.012, sFrame);
  opening(b, o, al, n, u - w / 2, u + w / 2, y0, y0 + h, arch, 0.024, sPane);
  if (!sill) return;
  const p0 = [o[0] + al[0] * (u - w / 2 - 0.2), o[1] + al[2] * (u - w / 2 - 0.2)];
  const p1 = [o[0] + al[0] * (u + w / 2 + 0.2) + n[0] * 0.14, o[1] + al[2] * (u + w / 2 + 0.2) + n[2] * 0.14];
  b.box(p0[0], y0 - 0.2, p0[1], p1[0], y0 - 0.08, p1[1], sCourse, {});
}

// Horizontal band along an outer wall, from u0 to u1 (projecting `pr`).
function band(b, o, al, n, u0, u1, y0, y1, pr, s) {
  const A = [o[0] + al[0] * u0, o[1] + al[2] * u0];
  const B = [o[0] + al[0] * u1 + n[0] * pr, o[1] + al[2] * u1 + n[2] * pr];
  b.box(A[0], y0, A[1], B[0], y1, B[1], s, { ao: 0.9 });
}

const GROUND_FLOOR = [BASE + 0.9, 2.1];
const COURSE = BASE + 3.3;
const FIRST_FLOOR = [BASE + 4.0, 1.5];

function outerFacade(b, k) {
  const d = DIRS[k], n = nrm(d), C = LAND[k].c;
  const o = [C[0] + n[0] * HW, C[1] + n[2] * HW];
  const prof = outerProfile(k);
  const u0 = prof[0][0], u1 = prof[prof.length - 1][1];
  const s = k === 3 ? sWall : sWall;
  wall(b, o, d, prof, BASE, s);
  // plinth and string course; each runs on round the convex corner at its end
  band(b, o, d, n, u0, u1 + 0.08, BASE, BASE + 0.55, 0.08, sPlinth);
  band(b, o, d, n, u0, u1 + 0.1, COURSE, COURSE + 0.22, 0.1, sCourse);
  // windows: two storeys, evenly spaced, plus stepped stair windows above
  const len = u1 - u0;
  const bays = Math.max(2, Math.round(len / 2.4));
  for (let i = 0; i < bays; i++) {
    const u = u0 + ((i + 0.5) / bays) * len;
    const door = (k === 1 && i === Math.floor(bays / 2)) || (k === 2 && i === 1);
    if (door) doorway(b, o, d, n, u);
    else windowAt(b, o, d, n, u, GROUND_FLOOR[0], 0.8, GROUND_FLOOR[1], true);
    windowAt(b, o, d, n, u, FIRST_FLOOR[0], 0.7, FIRST_FLOOR[1], false);
    // a small window lighting the stair, set a fixed distance below it
    const top = stairTopAlong(k, u);
    const y = top - 1.6;
    if (y > FIRST_FLOOR[0] + FIRST_FLOOR[1] + 0.7) windowAt(b, o, d, n, u, y, 0.45, 0.62, true);
  }
}

// height of the stair (lowest point under a 0.8-wide window) on outer wall k
function stairTopAlong(k, u) {
  const e = HW + (NR[k] - 1) * R;
  if (u > e) return LAND[k + 1].y;
  return Math.min(stairTop(k, u - 0.5), stairTop(k, u + 0.5));
}

function doorway(b, o, al, n, u) {
  const w = 1.15, h = 2.5, y0 = BASE;
  opening(b, o, al, n, u - w / 2 - 0.25, u + w / 2 + 0.25, y0 + 0.55, y0 + h + 0.25, true, 0.012, sFrame);
  opening(b, o, al, n, u - w / 2, u + w / 2, y0 + 0.55, y0 + h, true, 0.024, sDoor);
  // two steps up to the door
  for (let i = 0; i < 2; i++) {
    const A = [o[0] + al[0] * (u - w / 2 - 0.35 + i * 0.12), o[1] + al[2] * (u - w / 2 - 0.35 + i * 0.12)];
    const ext = 0.7 - i * 0.3;
    const B = [o[0] + al[0] * (u + w / 2 + 0.35 - i * 0.12) + n[0] * ext, o[1] + al[2] * (u + w / 2 + 0.35 - i * 0.12) + n[2] * ext];
    b.box(A[0], y0, A[1], B[0], y0 + 0.28 * (i + 1), B[1], sPlinth, {});
  }
}

function innerWall(b, k) {
  const d = DIRS[k], n = nrm(d), C = LAND[k].c, Y = LAND[k].y, N = NR[k];
  const o = [C[0] - n[0] * HW, C[1] - n[2] * HW];
  const al = [-d[0], 0, -d[2]];
  const prof = [];
  for (let j = N - 1; j >= 1; j--) prof.push([-(HW + j * R), -(HW + (j - 1) * R), Y + j * H]);
  wall(b, o, al, prof, BASE, sInner);
  // small windows on the light well, each a fixed distance below its tread
  const m = [-n[0], 0, -n[2]];
  for (let j = 3; j < N - 1; j += 4) {
    const u = -(HW + (j - 0.5) * R);
    windowAt(b, o, al, m, u, Y + j * H - 1.9, 0.42, 0.7, true, false);
  }
}

// ------------------------------------------------------------------ build
export function buildStairs(b) {
  for (let k = 0; k < 4; k++) {
    treads(b, k);
    if (k > 0) landingTop(b, k);
    outerFacade(b, k);
    innerWall(b, k);
  }
  closingHalf(b, 'foot');
  closingHalf(b, 'top');
}

// ------------------------------------------------------------------ walking lanes
// A lane runs at offset o from the centre line (o > 0 outwards). It is a loop of
// straight runs and quarter circles, starting on the cut through L0, where the
// arc round the landing crosses the diagonal.
export function lane(o, rho = 0.6) {
  const pieces = [];
  const add = (p) => { p.s0 = pieces.length ? pieces[pieces.length - 1].s0 + pieces[pieces.length - 1].L : 0; pieces.push(p); };
  const arc = (k, from, to) => {
    const a = DIRS[(k + 3) % 4], bdir = DIRS[k % 4];
    const C = LAND[k].c, na = nrm(a), nb = nrm(bdir);
    const K = [C[0] + o * (na[0] + nb[0]), C[1] + o * (na[2] + nb[2])];
    const Q = [K[0] - a[0] * rho + bdir[0] * rho, K[1] - a[2] * rho + bdir[2] * rho];
    const y = LAND[k].y;
    return {
      L: rho * (to - from), y0: y,
      at(s) {
        const t = from + s / rho;
        const c = Math.cos(t), sn = Math.sin(t);
        return [Q[0] + rho * (-bdir[0] * c + a[0] * sn), y, Q[1] + rho * (-bdir[2] * c + a[2] * sn)];
      },
      dir(s) {
        const t = from + s / rho;
        const c = Math.cos(t), sn = Math.sin(t);
        return [bdir[0] * sn + a[0] * c, bdir[2] * sn + a[2] * c];
      },
      height() { return y; },
    };
  };
  const run = (k) => {
    const d = DIRS[k], C = LAND[k].c;
    const n = nrm(d);
    const us = rho - o, ue = WR + (NR[k] - 1) * R + o - rho;
    return {
      L: ue - us,
      at(s) {
        const u = us + s;
        return [C[0] + d[0] * u + n[0] * o, 0, C[1] + d[2] * u + n[2] * o];
      },
      dir() { return [d[0], d[2]]; },
      height(s) { return smoothStairs(k, us + s); },
    };
  };
  add(arc(0, Math.PI / 4, Math.PI / 2));
  for (let k = 0; k < 4; k++) {
    add(run(k));
    add(arc(k + 1, 0, k + 1 === 4 ? Math.PI / 4 : Math.PI / 2));
  }
  const last = pieces[pieces.length - 1];
  return { pieces, length: last.s0 + last.L };
}

// Height of a walker's body along a flight: the step up is eased over a short
// stretch around each riser, the way the body lifts when climbing.
const EASE = 0.22;
function smoothStairs(k, u) {
  let y = LAND[k].y;
  for (let j = 0; j < NR[k]; j++) {
    const x = (u - (HW + j * R)) / EASE;
    if (x >= 1) y += H;
    else if (x > -1) { const t = (x + 1) / 2; y += H * t * t * (3 - 2 * t); }
  }
  return y;
}

// Position (x, y, z) and heading (dx, dz) at arc length s on a lane.
export function laneAt(ln, s) {
  s = ((s % ln.length) + ln.length) % ln.length;
  let p = ln.pieces[0];
  for (const q of ln.pieces) { if (s >= q.s0) p = q; else break; }
  const t = Math.min(p.L, s - p.s0);
  const xyz = p.at(t);
  xyz[1] = p.height(t);
  return { pos: xyz, dir: p.dir(t), s };
}
