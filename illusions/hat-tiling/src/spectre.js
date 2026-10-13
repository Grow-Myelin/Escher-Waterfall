// The Spectre: the strictly chiral aperiodic monotile of Smith, Myers,
// Kaplan and Goodman-Strauss (2023). Tile(1,1), a 14-sided polygon with
// unit edges at multiples of 30°, tiles the plane only non-periodically if
// reflections are forbidden; bending its edges into matching S-curves
// enforces that. The tiling is generated with the paper's nine-tile
// substitution (Γ, Δ, Θ, Λ, Ξ, Π, Σ, Φ, Ψ), following Kaplan's reference
// implementation. Γ, the "mystic", is a pair of spectres.

import { pt, mul, transPt, IDENT } from './hat.js';

const S3 = Math.sqrt(3) / 2;
export const SPECTRE = [
  pt(0, 0), pt(1, 0), pt(1.5, -S3), pt(1.5 + S3, 0.5 - S3), pt(1.5 + S3, 1.5 - S3),
  pt(2.5 + S3, 1.5 - S3), pt(3 + S3, 1.5), pt(3, 2), pt(3 - S3, 1.5), pt(2.5 - S3, 1.5 + S3),
  pt(1.5 - S3, 1.5 + S3), pt(0.5 - S3, 1.5 + S3), pt(-S3, 1.5), pt(0, 1)];

const trot = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0];
const ttrans = (x, y) => [1, 0, x, 0, 1, y];
const transTo = (p, q) => ttrans(q.x - p.x, q.y - p.y);
const QUAD = [SPECTRE[3], SPECTRE[5], SPECTRE[7], SPECTRE[11]];

export class Spectre {
  constructor(label) { this.label = label; this.quad = QUAD; }
}
export class SMeta {
  constructor(quad, label) { this.quad = quad; this.label = label; this.children = []; }
  addChild(T, geom) { this.children.push({ T, geom }); }
}

export const NAMES = ['Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi'];

function base() {
  const sys = {};
  for (const lab of NAMES.slice(1)) sys[lab] = new Spectre(lab);
  const mystic = new SMeta(QUAD, 'Gamma');
  mystic.addChild(IDENT, new Spectre('Gamma1'));
  mystic.addChild(mul(ttrans(SPECTRE[8].x, SPECTRE[8].y), trot(Math.PI / 6)), new Spectre('Gamma2'));
  sys.Gamma = mystic;
  return sys;
}

const SUPER = {
  Gamma: ['Pi', 'Delta', null, 'Theta', 'Sigma', 'Xi', 'Phi', 'Gamma'],
  Delta: ['Xi', 'Delta', 'Xi', 'Phi', 'Sigma', 'Pi', 'Phi', 'Gamma'],
  Theta: ['Psi', 'Delta', 'Pi', 'Phi', 'Sigma', 'Pi', 'Phi', 'Gamma'],
  Lambda: ['Psi', 'Delta', 'Xi', 'Phi', 'Sigma', 'Pi', 'Phi', 'Gamma'],
  Xi: ['Psi', 'Delta', 'Pi', 'Phi', 'Sigma', 'Psi', 'Phi', 'Gamma'],
  Pi: ['Psi', 'Delta', 'Xi', 'Phi', 'Sigma', 'Psi', 'Phi', 'Gamma'],
  Sigma: ['Xi', 'Delta', 'Xi', 'Phi', 'Sigma', 'Pi', 'Lambda', 'Gamma'],
  Phi: ['Psi', 'Delta', 'Psi', 'Phi', 'Sigma', 'Pi', 'Phi', 'Gamma'],
  Psi: ['Psi', 'Delta', 'Psi', 'Phi', 'Sigma', 'Psi', 'Phi', 'Gamma'],
};

function supertiles(sys) {
  const quad = sys.Delta.quad;
  const R = [-1, 0, 0, 0, 1, 0]; // each level is a mirror image of the last
  const rules = [[60, 3, 1], [0, 2, 0], [60, 3, 1], [60, 3, 1], [0, 2, 0], [60, 3, 1], [-120, 3, 3]];
  const Ts = [IDENT];
  let total = 0, rot = IDENT;
  let tquad = [...quad];
  for (const [ang, from, to] of rules) {
    total += ang;
    if (ang !== 0) {
      rot = trot((total * Math.PI) / 180);
      tquad = quad.map((q) => transPt(rot, q));
    }
    Ts.push(mul(transTo(tquad[to], transPt(Ts[Ts.length - 1], quad[from])), rot));
  }
  for (let i = 0; i < Ts.length; i++) Ts[i] = mul(R, Ts[i]);
  const superQuad = [transPt(Ts[6], quad[2]), transPt(Ts[5], quad[1]), transPt(Ts[3], quad[2]), transPt(Ts[0], quad[1])];
  const out = {};
  for (const [lab, subs] of Object.entries(SUPER)) {
    const m = new SMeta(superQuad, lab);
    subs.forEach((s, i) => { if (s) m.addChild(Ts[i], sys[s]); });
    out[lab] = m;
  }
  return out;
}

export function buildSpectres(levels) {
  let sys = base();
  for (let i = 0; i < levels; i++) sys = supertiles(sys);
  return sys;
}

// World-space spectres with their ancestry (labels from the top down).
export function flattenSpectres(top, M = IDENT) {
  const tiles = [];
  const walk = (g, T, path, labels) => {
    if (g instanceof Spectre) { tiles.push({ T, label: g.label, path, labels }); return; }
    g.children.forEach((ch, i) => walk(ch.geom, mul(T, ch.T), path.concat(i), labels.concat(g.label)));
  };
  walk(top, M, [], []);
  return tiles;
}

// Check that spectres meet edge to edge with no gaps or overlaps: every
// edge used by two tiles is used once in each direction, and round every
// vertex inside the patch the corner angles add up to exactly 360°.
export function verifySpectres(tiles) {
  const key = (p) => `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)}`;
  const dirEdges = new Map();
  const angleAt = new Map();
  let dets = new Set();
  let badEdge = 0;
  for (const t of tiles) {
    const det = t.T[0] * t.T[4] - t.T[1] * t.T[3];
    dets.add(Math.sign(det));
    const P = SPECTRE.map((p) => transPt(t.T, p));
    const n = P.length;
    // orientation of the transformed polygon
    for (let i = 0; i < n; i++) {
      const a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n];
      const k = key(a) + '>' + key(b);
      if (dirEdges.has(k)) badEdge++;
      dirEdges.set(k, true);
      // interior angle at b (polygon is CCW if det > 0)
      const u = Math.atan2(a.y - b.y, a.x - b.x), v = Math.atan2(c.y - b.y, c.x - b.x);
      let ang = det > 0 ? u - v : v - u;
      while (ang <= 0) ang += 2 * Math.PI;
      while (ang > 2 * Math.PI) ang -= 2 * Math.PI;
      angleAt.set(key(b), (angleAt.get(key(b)) || 0) + ang);
    }
  }
  // interior vertices: every edge at the vertex is shared
  const boundaryV = new Set();
  let shared = 0, boundaryEdges = 0;
  for (const k of dirEdges.keys()) {
    const [a, b] = k.split('>');
    if (dirEdges.has(b + '>' + a)) shared++;
    else { boundaryEdges++; boundaryV.add(a); boundaryV.add(b); }
  }
  let badAngle = 0, interior = 0;
  for (const [k, sum] of angleAt) {
    if (boundaryV.has(k)) continue;
    interior++;
    if (Math.abs(sum - 2 * Math.PI) > 1e-6) badAngle++;
  }
  return { tiles: tiles.length, handedness: [...dets], sharedEdges: shared / 2, boundaryEdges, interiorVertices: interior, badAngle, badEdge };
}
