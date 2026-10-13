// The giant mosses and lichens in the bottom-left corner. Escher enlarged
// them from his own studies: cup lichens (Cladonia) on long stalks, branching
// reindeer moss, the hair-cap moss with its spore capsules, and broad pointed
// leaves at the very edge.

import * as THREE from 'three';
import { PAT, st, M } from './builder.js';
import { GROUND } from './layout.js';
import { limb } from './figures.js';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sLichen = st(0xbcbc9f, PAT.FOLIAGE);
const sCoral = st(0xd5d2bf, PAT.PLAIN);
const sStalk = st(0x6b5c43, PAT.PLAIN);
const sCapsule = st(0x8a6c45, PAT.PLAIN);
const sMoss = st(0x5f6d3f, PAT.FOLIAGE);
const sLeaf = st(0x667449, PAT.FOLIAGE);

function cupLichen(b, x, z, h, rc, tiltX, tiltZ) {
  b.push(M.chain(M.T(x, GROUND, z), M.RX(tiltX), M.RZ(tiltZ)));
  const prof = [
    [0.22, 0], [0.17, 0.15], [0.13, h * 0.55], [0.15, h * 0.8], [0.36, h * 0.92],
    [rc, h], [rc * 0.93, h + 0.04], [rc * 0.55, h - 0.1], [0.05, h - 0.35],
  ];
  b.lathe(0, 0, 0, prof, 14, sLichen, { edges: [0, 0, 0, 0, 0, 1, 1, 0, 0] });
  // little proliferating cups on the rim of the bigger ones
  if (rc > 0.5) {
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      const px = Math.cos(a) * rc * 0.85, pz = Math.sin(a) * rc * 0.85;
      const hh = 0.55;
      b.lathe(px, h - 0.02, pz, [[0.05, 0], [0.04, hh * 0.6], [0.16, hh], [0.14, hh + 0.02], [0.03, hh - 0.12]], 8, sLichen, { edges: [0, 0, 1, 1, 0] });
    }
  }
  b.pop();
}

function reindeerMoss(b, x, z, h, seed) {
  const r = rng(seed);
  const tips = [];
  const branch = (p, d, len, rad, depth) => {
    const e = [p[0] + d.x * len, p[1] + d.y * len, p[2] + d.z * len];
    limb(b, p, e, rad, sCoral, { seg: 5, r1: rad * 0.8 });
    if (depth <= 0) { tips.push(e); return; }
    const kids = depth > 2 ? 2 : 2 + (r() < 0.4 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const axis = new THREE.Vector3(r() - 0.5, 0, r() - 0.5).normalize();
      const nd = d.clone().applyAxisAngle(axis, 0.35 + r() * 0.35);
      nd.y = Math.max(nd.y, 0.25);
      nd.normalize();
      branch(e, nd, len * (0.66 + r() * 0.12), rad * 0.72, depth - 1);
    }
  };
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r();
    const d = new THREE.Vector3(Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3).normalize();
    branch([x + Math.cos(a) * 0.2, GROUND, z + Math.sin(a) * 0.2], d, h * 0.32, 0.16, 4);
  }
  for (const t of tips) b.blob(t[0], t[1], t[2], 0.06, 0.06, 0.06, sCoral, { sub: 0, lump: 0 });
}

function sporophyte(b, x, z, h, bend, seed) {
  const r = rng(seed);
  let p = [x, GROUND, z];
  const n = 4;
  let ax = 0, az = 0;
  for (let i = 0; i < n; i++) {
    ax += bend[0] / n; az += bend[1] / n;
    const q = [p[0] + Math.sin(az) * h / n, p[1] + Math.cos(ax) * Math.cos(az) * h / n, p[2] + Math.sin(ax) * h / n];
    limb(b, p, q, 0.075 - i * 0.01, sStalk, { seg: 5, r1: 0.055 });
    p = q;
  }
  // capsule leaning over, with its pointed cap
  b.push(M.chain(M.T(p[0], p[1], p[2]), M.RX(ax + 0.6 + r() * 0.3), M.RZ(-az)));
  b.blob(0, 0.36, 0, 0.17, 0.42, 0.17, sCapsule, { lump: 0.03 });
  b.cyl(0, 0.68, 0, 0.13, 1.1, 8, sStalk, { r1: 0.0 });
  b.pop();
}

function mossTuft(b, x, z, rad, seed) {
  const r = rng(seed);
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.3;
    const L = rad * (0.6 + r() * 0.5);
    const up = 0.6 + r() * 0.6;
    const dir = [Math.cos(a), up, Math.sin(a)];
    const base = [x, GROUND + 0.05, z];
    const tip = [x + dir[0] * L, GROUND + dir[1] * L, z + dir[2] * L];
    const side = [-Math.sin(a) * 0.07, 0, Math.cos(a) * 0.07];
    const a1 = [base[0] + side[0], base[1], base[2] + side[2]];
    const a2 = [base[0] - side[0], base[1], base[2] - side[2]];
    b.tri(a1, a2, tip, sMoss, [1, 1, 0]);
    b.tri(a2, a1, tip, sMoss, [1, 1, 0]);
  }
}

// Broad lanceolate leaves fanning out of one root, bending as they rise.
function bigLeaves(b, x, z, n, len, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    const tilt = 0.25 + r() * 0.5;
    const L = len * (0.7 + r() * 0.4);
    const wdt = 0.35 + r() * 0.2;
    const segs = 5;
    const pts = [];
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      const lean = tilt + t * t * 0.9;
      const rr = L * t;
      pts.push([x + Math.cos(a) * Math.sin(lean) * rr, GROUND + Math.cos(lean) * rr * 0.95, z + Math.sin(a) * Math.sin(lean) * rr]);
    }
    const side = [-Math.sin(a), 0, Math.cos(a)];
    const wAt = (t) => wdt * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.02;
    for (let k = 0; k < segs; k++) {
      const t0 = k / segs, t1 = (k + 1) / segs;
      const p0 = pts[k], p1 = pts[k + 1];
      const w0 = wAt(t0), w1 = wAt(t1);
      const l0 = [p0[0] + side[0] * w0, p0[1], p0[2] + side[2] * w0];
      const r0 = [p0[0] - side[0] * w0, p0[1], p0[2] - side[2] * w0];
      const l1 = [p1[0] + side[0] * w1, p1[1], p1[2] + side[2] * w1];
      const r1 = [p1[0] - side[0] * w1, p1[1], p1[2] - side[2] * w1];
      // midrib slightly raised so the two halves catch the light differently
      const m0 = [p0[0], p0[1] + 0.04, p0[2]], m1 = [p1[0], p1[1] + 0.04, p1[2]];
      const e0 = k === 0 ? 1 : 0;
      b.quad(l0, m0, m1, l1, sLeaf, [e0, 0, 0, 1]);
      b.quad(m0, r0, r1, m1, sLeaf, [e0, 1, 0, 0]);
      b.quad(m0, l0, l1, m1, sLeaf, [e0, 1, 0, 0]);
      b.quad(r0, m0, m1, r1, sLeaf, [e0, 0, 0, 1]);
    }
  }
}

export function buildGarden(b) {
  // cup lichens, giant as in the print
  const cups = [
    [-6.2, 13.8, 7.4, 1.05, 0.05, -0.08],
    [-4.4, 12.7, 5.6, 0.85, -0.08, 0.1],
    [-7.8, 12.5, 4.6, 0.75, 0.1, 0.12],
    [-3.6, 15.0, 8.8, 1.1, 0.02, 0.05],
    [-8.6, 15.2, 3.4, 0.6, -0.1, -0.1],
    [-5.6, 16.4, 9.8, 0.95, -0.05, -0.12],
  ];
  for (const c of cups) cupLichen(b, ...c);
  // reindeer moss
  reindeerMoss(b, -1.8, 12.5, 4.6, 11);
  reindeerMoss(b, -9.6, 16.4, 4.0, 23);
  // hair-cap moss: tufts and tall capsules
  mossTuft(b, -3.0, 12.3, 1.2, 5);
  mossTuft(b, -0.8, 14.8, 1.4, 7);
  mossTuft(b, -9.0, 12.8, 1.3, 9);
  mossTuft(b, -6.8, 17.2, 1.5, 13);
  sporophyte(b, -0.9, 14.5, 8.6, [0.15, -0.25], 3);
  sporophyte(b, -0.4, 15.3, 6.8, [-0.1, -0.35], 4);
  sporophyte(b, -2.8, 17.0, 10.4, [0.25, -0.1], 6);
  sporophyte(b, -2.1, 17.8, 8.0, [0.05, 0.25], 8);
  // broad leaves at the edge of the picture
  bigLeaves(b, -10.8, 13.0, 9, 7.0, 17);
  bigLeaves(b, -12.4, 17.0, 7, 5.6, 19);
}
