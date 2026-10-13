// The hat: the aperiodic monotile of Smith, Myers, Kaplan and Goodman-Strauss
// (2023), generated with their H, T, P, F metatile substitution. This follows
// the construction in Kaplan's reference implementation: each level's four
// metatiles are assembled from copies of the previous level's, glued edge to
// edge, and the new, larger metatiles are read off the assembled patch.
//
// Transforms are 2×3 affine matrices [a, b, c, d, e, f] mapping
// (x, y) → (a x + b y + c, d x + e y + f).

const HR3 = Math.sqrt(3) / 2;

export const pt = (x, y) => ({ x, y });
// points of the triangular lattice that the kite grid lives on
export const hexPt = (x, y) => pt(x + 0.5 * y, HR3 * y);

export const IDENT = [1, 0, 0, 0, 1, 0];

export function inv(T) {
  const det = T[0] * T[4] - T[1] * T[3];
  return [T[4] / det, -T[1] / det, (T[1] * T[5] - T[2] * T[4]) / det,
    -T[3] / det, T[0] / det, (T[2] * T[3] - T[0] * T[5]) / det];
}
export function mul(A, B) {
  return [A[0] * B[0] + A[1] * B[3], A[0] * B[1] + A[1] * B[4], A[0] * B[2] + A[1] * B[5] + A[2],
    A[3] * B[0] + A[4] * B[3], A[3] * B[1] + A[4] * B[4], A[3] * B[2] + A[4] * B[5] + A[5]];
}
const padd = (p, q) => pt(p.x + q.x, p.y + q.y);
const psub = (p, q) => pt(p.x - q.x, p.y - q.y);
const trot = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0];
const ttrans = (x, y) => [1, 0, x, 0, 1, y];
const rotAbout = (p, a) => mul(ttrans(p.x, p.y), mul(trot(a), ttrans(-p.x, -p.y)));
export const transPt = (M, P) => pt(M[0] * P.x + M[1] * P.y + M[2], M[3] * P.x + M[4] * P.y + M[5]);
// the similarity taking the unit segment (0,0)-(1,0) to p-q
const matchSeg = (p, q) => [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y];
// the similarity taking segment p1-q1 to segment p2-q2
const matchTwo = (p1, q1, p2, q2) => mul(matchSeg(p2, q2), inv(matchSeg(p1, q1)));
function intersect(p1, q1, p2, q2) {
  const d = (q2.y - p2.y) * (q1.x - p1.x) - (q2.x - p2.x) * (q1.y - p1.y);
  const uA = ((q2.x - p2.x) * (p1.y - p2.y) - (q2.y - p2.y) * (p1.x - p2.x)) / d;
  return pt(p1.x + uA * (q1.x - p1.x), p1.y + uA * (q1.y - p1.y));
}

// The hat: 13 corners, 8 kites. (Its outline has 14 edges, two of them in
// line, so it is a 13-gon.)
export const HAT = [
  hexPt(0, 0), hexPt(-1, -1), hexPt(0, -2), hexPt(2, -2),
  hexPt(2, -1), hexPt(4, -2), hexPt(5, -1), hexPt(4, 0),
  hexPt(3, 0), hexPt(2, 2), hexPt(0, 3), hexPt(0, 2),
  hexPt(-1, 2)];

export class HatTile {
  constructor(label) { this.label = label; }
}

export class MetaTile {
  constructor(shape, width) {
    this.shape = shape;
    this.width = width;
    this.children = [];
  }
  addChild(T, geom) { this.children.push({ T, geom }); }
  evalChild(n, i) { return transPt(this.children[n].T, this.children[n].geom.shape[i]); }
  recentre() {
    let cx = 0, cy = 0;
    for (const p of this.shape) { cx += p.x; cy += p.y; }
    cx /= this.shape.length; cy /= this.shape.length;
    this.shape = this.shape.map((p) => pt(p.x - cx, p.y - cy));
    const M = ttrans(-cx, -cy);
    for (const ch of this.children) ch.T = mul(M, ch.T);
  }
}

// Hats are labelled by the metatile they belong to. H1 is the one reflected
// hat in every H.
const H1_hat = new HatTile('H1');
const H_hat = new HatTile('H');
const T_hat = new HatTile('T');
const P_hat = new HatTile('P');
const F_hat = new HatTile('F');

function initH() {
  const outline = [pt(0, 0), pt(4, 0), pt(4.5, HR3), pt(2.5, 5 * HR3), pt(1.5, 5 * HR3), pt(-0.5, HR3)];
  const meta = new MetaTile(outline, 2);
  meta.addChild(matchTwo(HAT[5], HAT[7], outline[5], outline[0]), H_hat);
  meta.addChild(matchTwo(HAT[9], HAT[11], outline[1], outline[2]), H_hat);
  meta.addChild(matchTwo(HAT[5], HAT[7], outline[3], outline[4]), H_hat);
  meta.addChild(mul(ttrans(2.5, HR3), mul([-0.5, -HR3, 0, HR3, -0.5, 0], [0.5, 0, 0, 0, -0.5, 0])), H1_hat);
  return meta;
}
function initT() {
  const outline = [pt(0, 0), pt(3, 0), pt(1.5, 3 * HR3)];
  const meta = new MetaTile(outline, 2);
  meta.addChild([0.5, 0, 0.5, 0, 0.5, HR3], T_hat);
  return meta;
}
function initP() {
  const outline = [pt(0, 0), pt(4, 0), pt(3, 2 * HR3), pt(-1, 2 * HR3)];
  const meta = new MetaTile(outline, 2);
  meta.addChild([0.5, 0, 1.5, 0, 0.5, HR3], P_hat);
  meta.addChild(mul(ttrans(0, 2 * HR3), mul([0.5, HR3, 0, -HR3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0])), P_hat);
  return meta;
}
function initF() {
  const outline = [pt(0, 0), pt(3, 0), pt(3.5, HR3), pt(3, 2 * HR3), pt(-1, 2 * HR3)];
  const meta = new MetaTile(outline, 2);
  meta.addChild([0.5, 0, 1.5, 0, 0.5, HR3], F_hat);
  meta.addChild(mul(ttrans(0, 2 * HR3), mul([0.5, HR3, 0, -HR3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0])), F_hat);
  return meta;
}

// How 29 metatiles are glued into a patch: [child, edge, new shape, its edge]
// glues a new tile along an edge of an existing one; the six-entry form
// glues it between corners of two existing tiles.
const RULES = [
  ['H'],
  [0, 0, 'P', 2], [1, 0, 'H', 2], [2, 0, 'P', 2], [3, 0, 'H', 2],
  [4, 4, 'P', 2], [0, 4, 'F', 3], [2, 4, 'F', 3], [4, 1, 3, 2, 'F', 0],
  [8, 3, 'H', 0], [9, 2, 'P', 0], [10, 2, 'H', 0], [11, 4, 'P', 2],
  [12, 0, 'H', 2], [13, 0, 'F', 3], [14, 2, 'F', 1], [15, 3, 'H', 4],
  [8, 2, 'F', 1], [17, 3, 'H', 0], [18, 2, 'P', 0], [19, 2, 'H', 2],
  [20, 4, 'F', 3], [20, 0, 'P', 2], [22, 0, 'H', 2], [23, 4, 'F', 3],
  [23, 0, 'F', 3], [16, 0, 'P', 2], [9, 4, 0, 2, 'T', 2], [4, 0, 'F', 3]];

function constructPatch(H, T, P, F) {
  const shapes = { H, T, P, F };
  const ret = new MetaTile([], H.width);
  for (const r of RULES) {
    if (r.length === 1) ret.addChild(IDENT, shapes[r[0]]);
    else if (r.length === 4) {
      const poly = ret.children[r[0]].geom.shape;
      const T0 = ret.children[r[0]].T;
      const P0 = transPt(T0, poly[(r[1] + 1) % poly.length]);
      const Q0 = transPt(T0, poly[r[1]]);
      const nshp = shapes[r[2]];
      const npoly = nshp.shape;
      ret.addChild(matchTwo(npoly[r[3]], npoly[(r[3] + 1) % npoly.length], P0, Q0), nshp);
    } else {
      const chP = ret.children[r[0]];
      const chQ = ret.children[r[2]];
      const P0 = transPt(chQ.T, chQ.geom.shape[r[3]]);
      const Q0 = transPt(chP.T, chP.geom.shape[r[1]]);
      const nshp = shapes[r[4]];
      const npoly = nshp.shape;
      ret.addChild(matchTwo(npoly[r[5]], npoly[(r[5] + 1) % npoly.length], P0, Q0), nshp);
    }
  }
  return ret;
}

// Read the four larger metatiles off the patch by tracing round their children.
function constructMetatiles(patch) {
  const bps1 = patch.evalChild(8, 2);
  const bps2 = patch.evalChild(21, 2);
  const rbps = transPt(rotAbout(bps1, (-2.0 * Math.PI) / 3.0), bps2);
  const p72 = patch.evalChild(7, 2);
  const p252 = patch.evalChild(25, 2);
  const llc = intersect(bps1, rbps, patch.evalChild(6, 2), p72);
  let w = psub(patch.evalChild(6, 2), llc);

  const hOut = [llc, bps1];
  w = transPt(trot(-Math.PI / 3), w);
  hOut.push(padd(hOut[1], w));
  hOut.push(patch.evalChild(14, 2));
  w = transPt(trot(-Math.PI / 3), w);
  hOut.push(psub(hOut[3], w));
  hOut.push(patch.evalChild(6, 2));
  const H = new MetaTile(hOut, patch.width * 2);
  for (const ch of [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]) H.addChild(patch.children[ch].T, patch.children[ch].geom);

  const P = new MetaTile([p72, padd(p72, psub(bps1, llc)), bps1, llc], patch.width * 2);
  for (const ch of [7, 2, 3, 4, 28]) P.addChild(patch.children[ch].T, patch.children[ch].geom);

  const F = new MetaTile([bps2, patch.evalChild(24, 2), patch.evalChild(25, 0), p252, padd(p252, psub(llc, bps1))], patch.width * 2);
  for (const ch of [21, 20, 22, 23, 24, 25]) F.addChild(patch.children[ch].T, patch.children[ch].geom);

  const AAA = hOut[2];
  const BBB = padd(hOut[1], psub(hOut[4], hOut[5]));
  const CCC = transPt(rotAbout(BBB, -Math.PI / 3), AAA);
  const T = new MetaTile([BBB, CCC, AAA], patch.width * 2);
  T.addChild(patch.children[11].T, patch.children[11].geom);

  H.recentre(); P.recentre(); F.recentre(); T.recentre();
  return [H, T, P, F];
}

// Build `levels` rounds of substitution. Returns the four metatiles of the
// top level.
export function buildMetatiles(levels) {
  let tiles = [initH(), initT(), initP(), initF()];
  for (let i = 0; i < levels; i++) tiles = constructMetatiles(constructPatch(...tiles));
  return tiles;
}

// Flatten a metatile into world-space hats, plus the outlines of every
// metatile at every level (level 1 = the H, T, P, F clusters of hats).
export function flatten(top, topLevel, M = IDENT) {
  const hats = [];
  const outlines = [];
  // kinds: the types of the enclosing metatiles, from the top down
  const walk = (geom, T, level, path, kinds) => {
    if (geom instanceof HatTile) {
      const types = {};
      for (let l = 1; l <= kinds.length; l++) types[l] = kinds[kinds.length - l];
      hats.push({ T, label: geom.label, path, types });
      return;
    }
    const k = kindOf(geom);
    outlines.push({ level, kind: k, pts: geom.shape.map((p) => transPt(T, p)) });
    geom.children.forEach((ch, i) => walk(ch.geom, mul(T, ch.T), level - 1, path.concat(i), kinds.concat(k)));
  };
  walk(top, M, topLevel + 1, [], []);
  return { hats, outlines };
}

function kindOf(geom) {
  const n = geom.shape.length;
  return n === 6 ? 'H' : n === 3 ? 'T' : n === 4 ? 'P' : 'F';
}
