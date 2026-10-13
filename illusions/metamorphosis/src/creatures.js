// Edge designs and the drawing inside each tile.
//
// An edge design is a list of control points (t, n) in units of the edge's
// chord: t runs along the edge from its first vertex to its second, n is the
// offset to the right of travel, which is outward for the tile that owns the
// edge (its upper three edges: top, upper-left, lower-left). The tile on the
// other side sees the same curve reversed, so every bump on one side of a
// tile is a dent on the opposite side, and the tiling stays exact.

const R3 = 1 / Math.sqrt(3);

// Fish, on the square lattice. The fish faces right. Its top edge runs from
// the upper-right corner to the upper-left; its left edge from the upper-left
// corner down. The tail notch on the left is the snout of the fish behind.
const FISH = {
  track: 'fish',
  top: [
    [0, 0], [0.1, 0.03], [0.22, 0.05], [0.34, 0.07], [0.44, 0.16],
    [0.6, 0.31], [0.6, 0.13], [0.66, 0.03], [0.76, -0.07], [0.88, -0.04], [1, 0],
  ],
  ll: [
    [0, 0], [0.07, 0.07], [0.18, -0.03], [0.34, -0.18], [0.5, -0.31],
    [0.66, -0.18], [0.82, -0.03], [0.93, 0.07], [1, 0],
  ],
};

// Tortoise, on the hexagonal lattice, facing up. Head on the top edge; legs
// at the four slanted edges, each next to a dent where a neighbour's leg
// fits. The lower-left edge is the upper-left one negated, which makes the
// tortoise mirror-symmetric (only the tail sits off-centre). The shell is the
// straight hexagon between the six corners; whatever grows out of it is head,
// legs or tail.
const TORT_UL = [
  [0, 0], [0.06, 0], [0.09, 0.1], [0.06, 0.24], [0.12, 0.33], [0.21, 0.34],
  [0.29, 0.27], [0.31, 0.12], [0.38, 0.02], [0.52, 0], [0.66, -0.02], [0.72, -0.13],
  [0.81, -0.19], [0.89, -0.12], [0.95, -0.02], [1, 0],
];
const TORT = {
  track: 'tort',
  top: [
    [0, 0], [0.12, 0], [0.17, -0.05], [0.2, -0.11], [0.23, -0.05], [0.28, 0],
    [0.37, 0.03], [0.35, 0.17], [0.4, 0.29], [0.5, 0.33], [0.6, 0.29],
    [0.65, 0.17], [0.63, 0.03], [0.72, 0], [0.86, 0], [1, 0],
  ],
  ul: TORT_UL,
  ll: TORT_UL.map(([t, n]) => [t, -n]),
};

export const EDGE_DESIGNS = [FISH, TORT];

// ------------------------------------------------------------------ colour
export const INK = [0.11, 0.1, 0.09];
export const PAPER = [0.925, 0.898, 0.835];
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const tone = (t) => mix(INK, PAPER, t);
const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];

// Tortoise colours per colour class: skin, shell, shell plates.
const TORT_SKIN_L = [tone(0.1), tone(0.86), tone(0.47)];
const TORT_SKIN_C = [hex(0x3c4729), hex(0xc6a66c), hex(0x6f4329)];
const TORT_SHELL_L = [tone(0.32), tone(0.98), tone(0.7)];
const TORT_SHELL_C = [hex(0x66723f), hex(0xe6d19e), hex(0xa5704a)];

const PAL = {
  checkL: [tone(0.1), tone(1)],
  checkC: [hex(0x2c3a35), hex(0xebe2cb)],
  fishC: [hex(0x2f4b63), hex(0xe9dec2)],
  hexL: [tone(0.1), tone(1), tone(0.6)],
  hexC: [hex(0xa8743a), hex(0xebe0c6), hex(0x6e8166)],
  waxL: tone(0.9),
  waxC: hex(0xe8cd86),
};

function blendN(list) {
  const out = [0, 0, 0];
  let s = 0;
  for (const [c, w] of list) {
    if (w <= 0) continue;
    out[0] += c[0] * w; out[1] += c[1] * w; out[2] += c[2] * w; s += w;
  }
  return s > 0 ? [out[0] / s, out[1] / s, out[2] / s] : PAPER;
}

// Where one colouring or rendering gives way to another, each tile switches
// on its own, at a slightly different place, so the print stays crisp instead
// of passing through muddy in-between tones.
export function crisp(v, rnd) {
  const th = 0.5 + (rnd - 0.5) * 0.7;
  return Math.min(1, Math.max(0, (v - th) / 0.08 + 0.5));
}

// Per-tile switches, shared by the fill and the details.
export function switches(tile) {
  const { lat, cell, shell, cube } = tile.tr;
  return {
    three: crisp(lat, tile.rnd), // two-colouring → three-colouring
    cell: crisp(cell, tile.rnd2), // cells and shells
    h: 1 - shell, // 1 = honeycomb, 0 = tortoise
    cube: crisp(cube, tile.rnd2),
  };
}

// Fill of a tile in both renderings, and how much litho hatching it gets.
export function tileColour(tile) {
  const { fish } = tile.tr;
  const sw = switches(tile);
  const skin = sw.cell * (1 - sw.h);
  const twoC = mix(PAL.checkC[tile.p2], PAL.fishC[tile.p2], fish), twoL = PAL.checkL[tile.p2];
  const threeC = mix(PAL.hexC[tile.p3], TORT_SKIN_C[tile.p3], skin);
  const threeL = mix(PAL.hexL[tile.p3], TORT_SKIN_L[tile.p3], skin);
  let C = mix(twoC, threeC, sw.three), L = mix(twoL, threeL, sw.three);
  C = mix(C, PAL.waxC, sw.cell * sw.h);
  L = mix(L, PAL.waxL, sw.cell * sw.h);
  C = mix(C, tone(0.6), sw.cube);
  L = mix(L, tone(0.6), sw.cube);
  const hatch = sw.three * (1 - sw.cell * sw.h) * (1 - sw.cube) * (tile.p3 === 2 ? 1 : 0);
  return { L, C, hatch };
}

// Line colour that reads on a fill: ink on light tiles, paper on dark ones.
export function lineOn(c) {
  const k = Math.min(1, Math.max(0, (0.42 - lum(c)) / 0.14));
  return mix(INK, mix(PAPER, [1, 1, 1], 0.2), k);
}

// ------------------------------------------------------------------ frames
// Least-squares affine map from a canonical tile to the actual corners, so
// the drawing inside a tile follows it however the lattice is sheared.
function affine(Q, V) {
  let qx = 0, qy = 0, vx = 0, vy = 0;
  for (let k = 0; k < 6; k++) { qx += Q[k][0]; qy += Q[k][1]; vx += V[k][0]; vy += V[k][1]; }
  qx /= 6; qy /= 6; vx /= 6; vy /= 6;
  let a = 0, b = 0, d = 0, s00 = 0, s01 = 0, s10 = 0, s11 = 0;
  for (let k = 0; k < 6; k++) {
    const x = Q[k][0] - qx, y = Q[k][1] - qy, X = V[k][0] - vx, Y = V[k][1] - vy;
    a += x * x; b += x * y; d += y * y;
    s00 += X * x; s01 += X * y; s10 += Y * x; s11 += Y * y;
  }
  const det = a * d - b * b;
  const i00 = d / det, i01 = -b / det, i11 = a / det;
  const m00 = s00 * i00 + s01 * i01, m01 = s00 * i01 + s01 * i11;
  const m10 = s10 * i00 + s11 * i01, m11 = s10 * i01 + s11 * i11;
  const f = (p) => [vx + m00 * (p[0] - qx) + m01 * (p[1] - qy), vy + m10 * (p[0] - qx) + m11 * (p[1] - qy)];
  f.scale = Math.sqrt(Math.abs(m00 * m11 - m01 * m10));
  return f;
}
const SQUARE = [[0.5, 0.5], [-0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5], [0.5, -0.5]];
const HEXQ = [[R3 / 2, 0.5], [-R3 / 2, 0.5], [-R3, 0], [-R3 / 2, -0.5], [R3 / 2, -0.5], [R3, 0]];

// point of an edge design on the canonical edge a → b
function onEdge(a, b, t, n) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return [a[0] + t * dx + n * dy, a[1] + t * dy - n * dx];
}

// ------------------------------------------------------------------ helpers
function polyPath(pts, close = true) {
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let k = 1; k < pts.length; k++) p.lineTo(pts[k][0], pts[k][1]);
  if (close) p.closePath();
  return p;
}
// smooth curve through points (Catmull–Rom), mapped by m
function curve(m, pts, steps = 8) {
  const P = pts.map(m);
  const out = [];
  for (let k = 0; k < P.length - 1; k++) {
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
    for (let s = 0; s < steps; s++) {
      const u = s / steps, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
function circle(m, c, r) {
  const p = m(c);
  const path = new Path2D();
  path.arc(p[0], p[1], r * m.scale, 0, Math.PI * 2);
  return path;
}
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const centroid = (V) => {
  let x = 0, y = 0;
  for (const v of V) { x += v[0]; y += v[1]; }
  return [x / V.length, y / V.length];
};
const scaleAbout = (c, V, k) => V.map((v) => lerp2(c, v, k));

// ------------------------------------------------------------------ details
// Each op: { kind: 'fill' | 'stroke' | 'hatch', path, c, a, w }
//   c: 'line' (contrasting line colour), 'ink', 'paper', or { L, C } colours
//   w: stroke width in screen pixels at the reference tile size
// Everything is clipped to its tile when drawn.
export function tileDetails(tile) {
  const ops = [];
  const { fish, tort } = tile.tr;
  const sw = switches(tile);
  if (fish > 0.02) fishDetails(tile, ops, fish);
  if (sw.cell > 0.001) cellDetails(tile, ops, sw);
  if (tort > 0.02 && sw.cell > 0.001) tortoiseDetails(tile, ops, tort * sw.cell);
  if (sw.cube > 0.001) cubeDetails(tile, ops, sw.cube);
  return ops;
}

function fishDetails(tile, ops, f) {
  const m = affine(SQUARE, tile.V);
  const a = Math.min(1, Math.max(0, (f - 0.35) / 0.5));
  if (a <= 0) return;
  const S = (pts, w = 1.1, steps = 8, aa = a) => ops.push({ kind: 'stroke', path: polyPath(curve(m, pts, steps), false), c: 'line', a: aa, w });
  // gill cover
  S([[0.47, 0.31], [0.39, 0.15], [0.38, -0.05], [0.44, -0.24]], 1.3);
  // mouth
  S([[0.79, -0.03], [0.73, -0.06], [0.68, -0.05]], 1.1);
  // scales: rows of small arcs, each bulging towards the tail
  for (let row = -2; row <= 2; row++) {
    for (let col = 0; col < 4; col++) {
      const u = 0.24 - col * 0.13 + (row & 1 ? 0.065 : 0);
      const v = row * 0.115;
      if (u < -0.18 || Math.abs(v) > 0.3 - Math.max(0, -u) * 0.4) continue;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const th = -Math.PI / 2 + (k / 6) * Math.PI;
        pts.push([u - 0.04 * Math.cos(th) + 0.02, v + 0.055 * Math.sin(th)]);
      }
      ops.push({ kind: 'stroke', path: polyPath(pts.map(m), false), c: 'line', a: a * 0.85, w: 0.8 });
    }
  }
  // dorsal fin rays
  for (let k = 0; k < 4; k++) {
    const u = 0.1 - k * 0.07;
    S([[u, 0.47], [u - 0.075, 0.62 + 0.02 * k]], 0.8, 2);
  }
  // tail: rays fanning from the root of the tail to each lobe
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const th = 0.5 + k * 0.32;
      S([[-0.26, s * 0.03], [-0.26 - 0.26 * Math.cos(th), s * (0.03 + 0.3 * Math.sin(th))]], 0.75, 2, a * 0.8);
    }
  }
  // eye
  ops.push({ kind: 'fill', path: circle(m, [0.6, 0.11], 0.062), c: { L: PAPER, C: [0.97, 0.95, 0.9] }, a });
  ops.push({ kind: 'stroke', path: circle(m, [0.6, 0.11], 0.062), c: 'ink', a, w: 1.1 });
  ops.push({ kind: 'fill', path: circle(m, [0.615, 0.11], 0.03), c: 'ink', a });
}

// Honeycomb cells, and the shells they turn into. A cell is drawn as a wax
// rim, six inner walls lit from the upper left and a bottom holding honey;
// the same lines become a tortoise shell: a marginal ring, six side plates
// and a central plate.
function cellDetails(tile, ops, sw) {
  const V = tile.V;
  const c = centroid(V);
  const s = sw.cell;
  const h = sw.h; // 1 = honeycomb, 0 = shell
  const tort = tile.tr.tort;
  const kOut = 0.9 - 0.06 * (1 - h);
  const kIn = 0.54 - 0.08 * (1 - h);
  const O = scaleAbout(c, V, kOut);
  // seen a little from the upper left, the floor of a deep cell sits lower
  // right of its mouth; on a shell the central plate is centred
  const off = [0.07 * h, -0.045 * h];
  const I = scaleAbout(c, V, kIn).map((p) => [p[0] + off[0], p[1] + off[1]]);
  const p = tile.p3;
  const shellL = TORT_SHELL_L[p], shellC = TORT_SHELL_C[p];
  // the shell itself: the straight hexagon (in a cell, the wax rim)
  ops.push({ kind: 'fill', path: polyPath(V), c: { L: mix(shellL, PAL.waxL, h), C: mix(shellC, PAL.waxC, h) }, a: s });
  if (p === 2) ops.push({ kind: 'hatch', path: polyPath(V), a: s * (1 - h) * 0.8 });
  const light = [-0.55, 0.83];
  for (let k = 0; k < 6; k++) {
    const q = [O[k], O[(k + 1) % 6], I[(k + 1) % 6], I[k]];
    const ex = O[(k + 1) % 6][0] - O[k][0], ey = O[(k + 1) % 6][1] - O[k][1];
    const len = Math.hypot(ex, ey) || 1;
    const d = (-ey / len) * light[0] + (ex / len) * light[1]; // inward normal · light
    const wallL = tone(0.6 + 0.32 * d);
    const wallC = mix(hex(0x9a6424), hex(0xf2d894), 0.5 + 0.5 * d);
    const plateL = mix(shellL, tone(1), 0.08), plateC = mix(shellC, [1, 1, 1], 0.08);
    ops.push({ kind: 'fill', path: polyPath(q), c: { L: mix(plateL, wallL, h), C: mix(plateC, wallC, h) }, a: s });
    if (d < -0.1) ops.push({ kind: 'hatch', path: polyPath(q), a: s * h * Math.min(1, -d * 1.2) });
  }
  // bottom of the cell / central plate
  const r = tile.rnd;
  const kind = r < 0.3 ? 'empty' : r < 0.78 ? 'honey' : 'capped';
  const bottomL = { empty: tone(0.22), honey: tone(0.46), capped: tone(0.93) }[kind];
  const bottomC = { empty: hex(0x5e3f1b), honey: hex(0xbd7a1e), capped: hex(0xf3e3b6) }[kind];
  const cenL = mix(shellL, tone(1), 0.14), cenC = mix(shellC, [1, 1, 1], 0.14);
  ops.push({ kind: 'fill', path: polyPath(I), c: { L: mix(cenL, bottomL, h), C: mix(cenC, bottomC, h) }, a: s });
  if (kind === 'empty') ops.push({ kind: 'hatch', path: polyPath(I), a: s * h * 0.8 });
  const ci = centroid(I);
  if (kind === 'honey') {
    // a glint on the surface of the honey
    ops.push({ kind: 'fill', path: polyPath(scaleAbout(lerp2(ci, I[1], 0.35), I, 0.12)), c: { L: tone(0.98), C: hex(0xfbe9b5) }, a: s * h });
  }
  if (kind === 'capped') {
    ops.push({ kind: 'stroke', path: polyPath(scaleAbout(ci, I, 0.6)), c: 'ink', a: s * h * 0.3, w: 0.8 });
    ops.push({ kind: 'fill', path: polyPath(scaleAbout(lerp2(ci, I[1], 0.3), I, 0.16)), c: { L: tone(1), C: hex(0xfffaf0) }, a: s * h * 0.8 });
  }
  // the lines between plates
  ops.push({ kind: 'stroke', path: polyPath(I), c: 'shell', a: s, w: 1.05 });
  ops.push({ kind: 'stroke', path: polyPath(O), c: 'shell', a: s, w: 1.05 });
  for (let k = 0; k < 6; k++) {
    ops.push({ kind: 'stroke', path: polyPath([I[k], O[k]], false), c: 'shell', a: s, w: 1.0 });
  }
  if (tort > 0.02) {
    const a = Math.min(1, tort * 1.6) * (1 - h);
    // shell rim: across the bases of head, legs and tail
    ops.push({ kind: 'stroke', path: polyPath(V), c: 'shell', a, w: 1.4 });
    // marginal plates
    for (let k = 0; k < 6; k++) {
      ops.push({ kind: 'stroke', path: polyPath([O[k], V[k]], false), c: 'shell', a, w: 0.9 });
    }
    // a growth ring on the central plate
    ops.push({ kind: 'stroke', path: polyPath(scaleAbout(c, I, 0.55)), c: 'shell', a: a * 0.55, w: 0.75 });
  }
}

function tortoiseDetails(tile, ops, t) {
  const m = affine(HEXQ, tile.V);
  const a = Math.min(1, Math.max(0, (t - 0.45) / 0.4));
  if (a <= 0) return;
  // eyes and mouth on the head
  for (const s of [-1, 1]) {
    ops.push({ kind: 'fill', path: circle(m, [s * 0.052, 0.6], 0.022), c: 'line', a });
  }
  ops.push({ kind: 'stroke', path: polyPath(curve(m, [[-0.035, 0.665], [0, 0.676], [0.035, 0.665]]), false), c: 'line', a: a * 0.8, w: 0.9 });
  // claws: three on each foot, pointing out of the foot
  const Q = HEXQ;
  const feet = [];
  const toeUL = onEdge(Q[1], Q[2], 0.165, 0.34), baseUL = onEdge(Q[1], Q[2], 0.2, 0.0);
  const toeLL = onEdge(Q[2], Q[3], 0.81, 0.19), baseLL = onEdge(Q[2], Q[3], 0.81, 0.0);
  feet.push([toeUL, baseUL], [toeLL, baseLL]);
  feet.push([[-toeUL[0], toeUL[1]], [-baseUL[0], baseUL[1]]], [[-toeLL[0], toeLL[1]], [-baseLL[0], baseLL[1]]]);
  for (const [toe, base] of feet) {
    const dx = toe[0] - base[0], dy = toe[1] - base[1];
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    for (let k = -1; k <= 1; k++) {
      const px = toe[0] - ux * 0.035 + uy * 0.03 * k, py = toe[1] - uy * 0.035 - ux * 0.03 * k;
      ops.push({ kind: 'stroke', path: polyPath([m([px, py]), m([px + ux * 0.04, py + uy * 0.04])], false), c: 'line', a: a * 0.9, w: 1 });
    }
    // a couple of scales on the leg
    const mid = lerp2(base, toe, 0.45);
    ops.push({ kind: 'fill', path: circle(m, mid, 0.012), c: 'line', a: a * 0.6 });
  }
}

// A stack of cubes: three rhombi meeting at the centre of each hexagon.
function cubeDetails(tile, ops, k) {
  const V = tile.V;
  const c = centroid(V);
  const faces = [
    { q: [c, V[5], V[0], V[1]], L: tone(0.95), C: hex(0xefe2c4) },
    { q: [c, V[1], V[2], V[3]], L: tone(0.6), C: hex(0xb98a5c) },
    { q: [c, V[3], V[4], V[5]], L: tone(0.2), C: hex(0x5d4532) },
  ];
  for (const f of faces) {
    ops.push({ kind: 'fill', path: polyPath(f.q), c: { L: f.L, C: f.C }, a: k });
  }
  ops.push({ kind: 'hatch', path: polyPath(faces[1].q), a: k * 0.8 });
  ops.push({ kind: 'stroke', path: polyPath([V[1], c, V[3]], false), c: 'ink', a: k, w: 1.2 });
  ops.push({ kind: 'stroke', path: polyPath([c, V[5]], false), c: 'ink', a: k, w: 1.2 });
}

// colour of the shell lines: they must read on dark shells too
export function shellLine(tile, litho) {
  const shell = mix(TORT_SHELL_C[tile.p3], TORT_SHELL_L[tile.p3], litho);
  const wax = mix(PAL.waxC, PAL.waxL, litho);
  const base = mix(shell, wax, switches(tile).h);
  const ink = mix([0.2, 0.15, 0.1], INK, litho);
  return lum(base) < 0.4 ? mix(PAPER, [1, 1, 1], 0.1) : ink;
}
