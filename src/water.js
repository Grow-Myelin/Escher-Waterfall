// Water: the surface in the channels, the falling stream, the sheet riding
// down the wheel, foam flecks travelling round the loop and spray where the
// stream hits the wheel.

import * as THREE from 'three';
import {
  DROP, T, IW, WL, PT, LIP_X, LIP_RX, LIP_RY,
  WHEEL, FALL_SEAM_Y, FALL_END_Y, FALL_THICK, FALL_WIDTH,
} from './layout.js';

const HI = IW / 2; // half the inner width

// ------------------------------------------------------------- the water path
// The centre line of the water surface, as a list of pieces. Each piece knows
// its arc length and can give a point, a direction and a lateral axis for any
// distance along it. Straight pieces are exact; corners are quarter circles
// round the inner corner post.

function straight(p0, p1) {
  const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const L = Math.hypot(d[0], d[1], d[2]);
  const t = [d[0] / L, d[1] / L, d[2] / L];
  return {
    L,
    at: (s) => [p0[0] + t[0] * s, p0[1] + t[1] * s, p0[2] + t[2] * s],
    dir: () => t,
  };
}

// Quarter turn about pivot c from direction din to dout, radius r.
function turn(c, din, dout, r) {
  const L = (Math.PI / 2) * r;
  // start point: pivot + (-dout)*r... the path enters along din at distance r from the pivot
  const a0 = [-dout[0], -dout[2]]; // vector from pivot to start (x, z)
  return {
    L,
    at: (s) => {
      const th = s / r;
      // rotate a0 towards din
      const v = [a0[0] * Math.cos(th) + din[0] * Math.sin(th), a0[1] * Math.cos(th) + din[2] * Math.sin(th)];
      return [c[0] + v[0] * r, c[1], c[2] + v[1] * r];
    },
    dir: (s) => {
      const th = s / r;
      const v = [-a0[0] * Math.sin(th) + din[0] * Math.cos(th), -a0[1] * Math.sin(th) + din[2] * Math.cos(th)];
      return [v[0], 0, v[1]];
    },
  };
}

const NZ = [0, 0, -1], NX = [-1, 0, 0];
const R_TURN = HI; // centre line turns round the inner post at half the inner width

// Inner-corner pivots: the corner of the water area between entry and exit.
function pivot(center, din, dout) {
  return [center[0] - din[0] * HI + dout[0] * HI, WL, center[2] - din[2] * HI + dout[2] * HI];
}

export function waterPath() {
  const y = WL;
  const c1 = PT.c1, c2 = PT.c2, c3 = PT.c3;
  const S1_START = 4.2 - T;
  const pieces = [
    straight([0, y, S1_START], [0, y, c1[2] + HI]),
    turn(pivot(c1, NZ, NX), NZ, NX, R_TURN),
    straight([c1[0] - HI, y, c2[2]], [c2[0] + HI, y, c2[2]]),
    turn(pivot(c2, NX, NZ), NX, NZ, R_TURN),
    straight([c2[0], y, c2[2] - HI], [c3[0], y, c3[2] + HI]),
    turn(pivot(c3, NZ, NX), NZ, NX, R_TURN),
    straight([c3[0] - HI, y, c3[2]], [LIP_X, y, c3[2]]),
  ];
  let acc = 0;
  for (const p of pieces) { p.s0 = acc; acc += p.L; }
  return { pieces, length: acc };
}

// -------------------------------------------------------- channel water mesh
export function buildChannelWater() {
  const pos = [], flow = [];
  const { pieces } = waterPath();
  const lat = 10;
  for (const p of pieces) {
    const n = Math.max(2, Math.ceil(p.L / 0.6));
    for (let i = 0; i < n; i++) {
      const sa = (p.L * i) / n, sb = (p.L * (i + 1)) / n;
      for (let j = 0; j < lat; j++) {
        const la = -HI + (IW * j) / lat, lb = -HI + (IW * (j + 1)) / lat;
        const P = (s, l) => {
          const c = p.at(s), d = p.dir(s);
          // lateral axis = right of the direction of flow
          const rx = -d[2], rz = d[0];
          return [c[0] + rx * l, c[1], c[2] + rz * l];
        };
        const v = [[sa, la], [sb, la], [sb, lb], [sa, lb]];
        const q = v.map(([s, l]) => P(s, l));
        // make it face up
        const e1 = [q[1][0] - q[0][0], q[1][2] - q[0][2]], e2 = [q[2][0] - q[0][0], q[2][2] - q[0][2]];
        const up = e1[1] * e2[0] - e1[0] * e2[1] > 0;
        const order = up ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
        for (const k of order) {
          pos.push(q[k][0], q[k][1], q[k][2]);
          flow.push(p.s0 + v[k][0], v[k][1]);
        }
      }
    }
  }
  // the corner pieces are quarter discs; fill the outer corner of each square
  for (const [center, din, dout, s0] of [[PT.c1, NZ, NX, pieces[1].s0], [PT.c2, NX, NZ, pieces[3].s0], [PT.c3, NZ, NX, pieces[5].s0]]) {
    const pv = pivot(center, din, dout);
    const outer = [center[0] + din[0] * HI - dout[0] * HI, WL, center[2] + din[2] * HI - dout[2] * HI];
    // square = pivot .. outer; the quarter annulus covers radius <= 2*HI; patch the rest with a fan
    const m = 16;
    const ring = [];
    for (let k = 0; k <= m; k++) {
      const th = (k / m) * (Math.PI / 2);
      const a0 = [-dout[0], -dout[2]];
      const v = [a0[0] * Math.cos(th) + din[0] * Math.sin(th), a0[1] * Math.cos(th) + din[2] * Math.sin(th)];
      ring.push({ p: [pv[0] + v[0] * IW, WL, pv[2] + v[1] * IW], s: s0 + th * R_TURN });
    }
    for (let k = 0; k < m; k++) {
      const a = ring[k], b = ring[k + 1];
      const tri = [outer, a.p, b.p];
      const e1 = [tri[1][0] - tri[0][0], tri[1][2] - tri[0][2]], e2 = [tri[2][0] - tri[0][0], tri[2][2] - tri[0][2]];
      const up = e1[1] * e2[0] - e1[0] * e2[1] > 0;
      const fl = [[s0 + R_TURN * Math.PI / 4, HI * 1.1], [a.s, HI], [b.s, HI]];
      const ord = up ? [0, 1, 2] : [0, 2, 1];
      for (const i of ord) { pos.push(...tri[i]); flow.push(...fl[i]); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('flow', new THREE.Float32BufferAttribute(flow, 2));
  g.computeBoundingSphere();
  return g;
}

// ---------------------------------------------------------- the falling water
// The stream is described once, in the frame of the wheel (W_bot): it leaves
// the lip high up, bends over and drops onto the wheel. Everything above
// FALL_SEAM_Y is then slid back by DROP along the view axis so that it hangs
// from the real end of S4. Both pieces carry the same texture coordinates, so
// the cut cannot be seen.

function fallCentre(u) {
  // u: arc length from the lip. First a quarter ellipse, then straight down.
  const lipX = LIP_X + DROP; // lip in the W_bot frame
  const yTop = WL / 2 + DROP;
  const arc = (Math.PI / 2) * Math.sqrt((LIP_RX * LIP_RX + LIP_RY * LIP_RY) / 2);
  if (u <= arc) {
    const th = (u / arc) * (Math.PI / 2);
    const p = [lipX - LIP_RX * Math.sin(th), yTop - LIP_RY + LIP_RY * Math.cos(th), 0];
    const d = [-LIP_RX * Math.cos(th), -LIP_RY * Math.sin(th), 0];
    const l = Math.hypot(d[0], d[1]);
    return { p, t: [d[0] / l, d[1] / l, 0] };
  }
  return { p: [lipX - LIP_RX, yTop - LIP_RY - (u - arc), 0], t: [0, -1, 0] };
}

function fallLength() {
  const arc = (Math.PI / 2) * Math.sqrt((LIP_RX * LIP_RX + LIP_RY * LIP_RY) / 2);
  const yStraight = WL / 2 + DROP - LIP_RY;
  return { arc, total: arc + (yStraight - FALL_END_Y) };
}

export function buildFall() {
  const pos = [], nrm = [], uv = [];
  const { arc, total } = fallLength();
  const seamU = arc + (WL / 2 + DROP - LIP_RY - FALL_SEAM_Y);
  const pushQuad = (q, n, f, shift) => {
    for (const k of [0, 1, 2, 0, 2, 3]) {
      pos.push(q[k][0] + shift, q[k][1] + shift, q[k][2] + shift);
      nrm.push(...n[k]);
      uv.push(...f[k]);
    }
  };
  const halfW = FALL_WIDTH / 2;
  // thickness tapers slightly as the water accelerates
  const thick = (u) => FALL_THICK * (1 - 0.25 * Math.min(1, u / total)) * (u < 0.4 ? 0.8 + u * 0.5 : 1);
  const width = (u) => halfW * (1 - 0.08 * Math.min(1, u / total));
  const sample = [];
  const du = 0.25;
  for (let u = 0; u < total - 1e-6; u += du) sample.push(Math.min(u, total));
  sample.push(total);
  if (!sample.includes(seamU)) { sample.push(seamU); sample.sort((a, b) => a - b); }
  for (let i = 0; i < sample.length - 1; i++) {
    const ua = sample[i], ub = sample[i + 1];
    const mid = (ua + ub) / 2;
    const shift = mid < seamU ? -DROP : 0;
    const A0 = fallCentre(ua), B0 = fallCentre(ub);
    const frame = (C, u) => {
      // n = normal in the xy plane pointing "outwards" (+x / up side of the curve)
      const n = [-C.t[1], C.t[0], 0];
      return { c: C.p, n, h: thick(u) / 2, w: width(u) };
    };
    const fa = frame(A0, ua), fb = frame(B0, ub);
    const P = (f, sn, sz) => [f.c[0] + f.n[0] * f.h * sn, f.c[1] + f.n[1] * f.h * sn, f.c[2] + f.w * sz];
    const nn = (f) => [-f.n[0], -f.n[1], 0];
    const zN = [0, 0, 1], zB = [0, 0, -1];
    const across = [[ua, -halfW], [ua, halfW], [ub, halfW], [ub, -halfW]];
    const thru = [[ua, -halfW], [ua, halfW], [ub, halfW], [ub, -halfW]];
    // inner side of the bend: the underside at the lip, the +x face once vertical
    pushQuad([P(fa, 1, -1), P(fa, 1, 1), P(fb, 1, 1), P(fb, 1, -1)], [fa.n, fa.n, fb.n, fb.n], across, shift);
    // outer side: the top of the water at the lip, the -x face once vertical
    pushQuad([P(fa, -1, -1), P(fa, -1, 1), P(fb, -1, 1), P(fb, -1, -1)], [nn(fa), nn(fa), nn(fb), nn(fb)], across, shift);
    // front (+z) and back (-z) edges of the sheet
    pushQuad([P(fa, -1, 1), P(fa, 1, 1), P(fb, 1, 1), P(fb, -1, 1)], [zN, zN, zN, zN], thru, shift);
    pushQuad([P(fa, 1, -1), P(fa, -1, -1), P(fb, -1, -1), P(fb, 1, -1)], [zB, zB, zB, zB], thru, shift);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('fuv', new THREE.Float32BufferAttribute(uv, 2));
  fixWinding(g);
  g.computeBoundingSphere();
  return g;
}

// Make every triangle wind counter-clockwise around its stored normal.
function fixWinding(g) {
  const p = g.attributes.position.array, n = g.attributes.normal.array, u = g.attributes.fuv.array;
  for (let i = 0; i < p.length; i += 9) {
    const ax = p[i], ay = p[i + 1], az = p[i + 2];
    const e1 = [p[i + 3] - ax, p[i + 4] - ay, p[i + 5] - az];
    const e2 = [p[i + 6] - ax, p[i + 7] - ay, p[i + 8] - az];
    const c = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const nx = n[i] + n[i + 3] + n[i + 6], ny = n[i + 1] + n[i + 4] + n[i + 7], nz = n[i + 2] + n[i + 5] + n[i + 8];
    if (c[0] * nx + c[1] * ny + c[2] * nz < 0) {
      for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
      for (let k = 0; k < 3; k++) { const t = n[i + 3 + k]; n[i + 3 + k] = n[i + 6 + k]; n[i + 6 + k] = t; }
      const j = (i / 3) * 2;
      for (let k = 0; k < 2; k++) { const t = u[j + 2 + k]; u[j + 2 + k] = u[j + 4 + k]; u[j + 4 + k] = t; }
    }
  }
}

// Water riding down the descending side of the wheel, between the rims.
export function buildWheelSheet() {
  const pos = [], nrm = [], uv = [];
  const R = WHEEL.r - 0.3;
  const half = WHEEL.half - 0.12;
  const a0 = 0.15, a1 = Math.PI - 0.35;
  const n = 30;
  const P = (a, x, r = R) => [x, WHEEL.y + r * Math.cos(a), WHEEL.z + r * Math.sin(a)];
  for (let i = 0; i < n; i++) {
    const aa = a0 + ((a1 - a0) * i) / n, ab = a0 + ((a1 - a0) * (i + 1)) / n;
    const na = [0, Math.cos(aa), Math.sin(aa)], nb = [0, Math.cos(ab), Math.sin(ab)];
    const q = [P(aa, -half), P(aa, half), P(ab, half), P(ab, -half)];
    const nn = [na, na, nb, nb];
    const f = [[aa * R * 1.6, -half], [aa * R * 1.6, half], [ab * R * 1.6, half], [ab * R * 1.6, -half]];
    for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(...q[k]); nrm.push(...nn[k]); uv.push(...f[k]); }
    // the +x edge of the sheet
    const q2 = [P(aa, half, R - 0.25), P(aa, half, R), P(ab, half, R), P(ab, half, R - 0.25)];
    const xn = [1, 0, 0];
    for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(...q2[k]); nrm.push(...xn); uv.push(f[k][0], half); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('fuv', new THREE.Float32BufferAttribute(uv, 2));
  fixWinding(g);
  g.computeBoundingSphere();
  return g;
}

// ------------------------------------------------------------------ particles

// Foam flecks that ride the whole loop: along the channels, over the lip,
// down the fall (where they jump frames at the seam without a visible
// change) and round the wheel back into S1.
export class Flecks {
  constructor(material, count = 120) {
    const geo = new THREE.BoxGeometry(0.3, 0.03, 0.07);
    this.alpha = new Float32Array(count);
    geo.setAttribute('alpha', new THREE.InstancedBufferAttribute(this.alpha, 1));
    this.mesh = new THREE.InstancedMesh(geo, material, count);
    this.mesh.frustumCulled = false;
    this.count = count;
    this.path = waterPath();
    const { arc, total } = fallLength();
    this.fallLen = total;
    this.fallArc = arc;
    this.seamU = arc + (WL / 2 + DROP - LIP_RY - FALL_SEAM_Y);
    this.seed = [];
    for (let i = 0; i < count; i++) {
      this.seed.push({ phase: Math.random(), lat: (Math.random() * 2 - 1) * HI * 0.82, len: 0.6 + Math.random() * 0.8, side: Math.random() });
    }
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.v = new THREE.Vector3();
    this.sc = new THREE.Vector3();
  }

  update(time, speed) {
    // a fleck spends this long on each leg of the loop (seconds)
    const chanT = this.path.length / speed;
    const fallT = 1.25;
    const wheelT = 2.6;
    const period = chanT + fallT + wheelT;
    const up = new THREE.Vector3(1, 0, 0);
    for (let i = 0; i < this.count; i++) {
      const sd = this.seed[i];
      let t = ((time / period + sd.phase) % 1) * period;
      let pos, dir, a = 1, flat = true, shift = 0;
      if (t < chanT) {
        const s = t * speed;
        let piece = this.path.pieces[0];
        for (const p of this.path.pieces) if (s >= p.s0) piece = p;
        const ls = Math.min(piece.L, s - piece.s0);
        const c = piece.at(ls), d = piece.dir(ls);
        const rx = -d[2], rz = d[0];
        pos = [c[0] + rx * sd.lat, c[1] + 0.02, c[2] + rz * sd.lat];
        dir = d;
        a = Math.min(1, t / 1.5) * 0.7;
      } else if (t < chanT + fallT) {
        const k = (t - chanT) / fallT;
        // accelerate down the fall: u = total * k^2-ish
        const u = this.fallLen * (0.35 * k + 0.65 * k * k);
        const C = fallCentre(u);
        const nrm = [-C.t[1], C.t[0], 0];
        const off = FALL_THICK * 0.42;
        // ride on the outer (+x) face or the front (+z) face
        const zf = sd.side < 0.5 ? (sd.lat / HI) * FALL_WIDTH * 0.45 : FALL_WIDTH / 2 + 0.03;
        const nf = sd.side < 0.5 ? off + 0.03 : (sd.lat / HI) * off;
        pos = [C.p[0] + nrm[0] * nf, C.p[1] + nrm[1] * nf, C.p[2] + zf];
        dir = C.t;
        flat = false;
        shift = u < this.seamU ? -DROP : 0;
        a = 0.9;
      } else {
        // carried round the wheel on the +z side, then dropped into S1
        const k = (t - chanT - fallT) / wheelT;
        const ang = 0.15 + k * (Math.PI - 0.3);
        const r = WHEEL.r - 0.2;
        pos = [sd.lat * 0.45, WHEEL.y + r * Math.cos(ang), WHEEL.z + r * Math.sin(ang) + 0.05];
        dir = [0, -Math.sin(ang), Math.cos(ang)];
        flat = false;
        a = 0.85 * (1 - Math.max(0, k - 0.85) / 0.15);
      }
      this.v.set(dir[0], dir[1], dir[2]).normalize();
      this.q.setFromUnitVectors(up, this.v);
      const L = sd.len * (flat ? 1 : 1.6);
      this.sc.set(L, 1, flat ? 1 : 1.4);
      this.m.compose(new THREE.Vector3(pos[0] + shift, pos[1] + shift, pos[2] + shift), this.q, this.sc);
      this.mesh.setMatrixAt(i, this.m);
      this.alpha[i] = a;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.geometry.attributes.alpha.needsUpdate = true;
  }
}

// Spray thrown up where the stream lands on the wheel, and foam where the
// wheel drops its water into S1.
export class Spray {
  constructor(material, count = 260) {
    const geo = new THREE.BoxGeometry(0.11, 0.11, 0.11);
    this.alpha = new Float32Array(count);
    geo.setAttribute('alpha', new THREE.InstancedBufferAttribute(this.alpha, 1));
    this.mesh = new THREE.InstancedMesh(geo, material, count);
    this.mesh.frustumCulled = false;
    this.count = count;
    this.p = [];
    for (let i = 0; i < count; i++) this.p.push(this.spawn({}, Math.random() * 1.2));
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.last = 0;
  }

  spawn(o, age = 0) {
    const atWheel = Math.random() < 0.62;
    if (atWheel) {
      // impact zone on top of the wheel
      o.x = (Math.random() * 2 - 1) * FALL_THICK * 0.6;
      o.y = FALL_END_Y + 0.2;
      o.z = (Math.random() * 2 - 1) * FALL_WIDTH * 0.45;
      const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 2.6;
      o.vx = Math.cos(a) * s * 0.7;
      o.vz = Math.sin(a) * s * 0.9 + 0.6;
      o.vy = 1.5 + Math.random() * 3.0;
      o.life = 0.5 + Math.random() * 0.6;
    } else {
      // tumbling foam where the buckets empty into the channel
      o.x = (Math.random() * 2 - 1) * (HI - 0.2);
      o.y = WL + 0.05;
      o.z = WHEEL.z + 1.0 - Math.random() * 4.5;
      o.vx = (Math.random() * 2 - 1) * 0.6;
      o.vz = -0.5 - Math.random() * 1.5;
      o.vy = 0.6 + Math.random() * 1.6;
      o.life = 0.35 + Math.random() * 0.45;
    }
    o.age = age;
    o.size = 0.6 + Math.random() * 0.9;
    return o;
  }

  update(dt) {
    const g = 9.0;
    for (let i = 0; i < this.count; i++) {
      const o = this.p[i];
      o.age += dt;
      if (o.age > o.life) this.spawn(o);
      o.vy -= g * dt;
      o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
      if (o.y < WL && o.z > -HI * 8) { o.y = WL; o.vy = 0; }
      const k = o.age / o.life;
      const s = o.size * (1 - k * 0.6);
      this.m.makeScale(s, s, s);
      this.m.setPosition(o.x, o.y, o.z);
      this.mesh.setMatrixAt(i, this.m);
      this.alpha[i] = Math.min(1, (1 - k) * 1.6) * 0.9;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.geometry.attributes.alpha.needsUpdate = true;
  }
}
