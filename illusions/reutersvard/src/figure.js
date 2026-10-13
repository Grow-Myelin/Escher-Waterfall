// Reutersvärd's triangle of cubes, as real geometry.
//
// Unit cubes are laid along +x, then +y, then +z, n steps per side:
//
//   (0,0,0) → (n,0,0) → (n,n,0) → (n,n,n−1)
//
// The next cube would sit at (n,n,n) = n·(1,1,1), which the isometric camera
// draws exactly on top of the first cube at the origin. So the picture closes
// into a triangle while the cubes in space form an open spiral, each cube one
// unit nearer the viewer than the one before.
//
// Seen from the isometric angle, every cube overlaps the one before it. To close
// the loop, the last cube must also be overlapped by the first. So it is cut along
// its diagonal plane y = z, a plane that contains the line of sight (1,1,1)
// and is therefore seen edge-on. The upper half (y ≥ z, the half that touches
// its real neighbour) stays where it is. The lower half (y ≤ z, the half that
// meets the first cube) is slid back n·(1,1,1), to just behind the first cube.

import { PAT, st, withShift } from '../../../src/builder.js';

export function cubePath(n) {
  const cells = [];
  for (let i = 0; i < n; i++) cells.push([i, 0, 0]);
  for (let i = 0; i < n; i++) cells.push([n, i, 0]);
  for (let i = 0; i < n; i++) cells.push([n, n, i]);
  return cells; // 3n cubes; the last one closes the loop
}

// Muted colours along the loop, from warm (far) to cool (near): in colour mode
// the tint shows each cube's true depth.
export function cubeColour(i, count) {
  const t = i / (count - 1);
  const a = [0.95, 0.74, 0.55], m = [0.93, 0.88, 0.7], b = [0.62, 0.76, 0.86];
  const lerp = (p, q, k) => p.map((v, j) => v + (q[j] - v) * k);
  return t < 0.5 ? lerp(a, m, t * 2) : lerp(m, b, (t - 0.5) * 2);
}

// Cubes are a little smaller than the unit cells they sit in, so each one
// reads as a separate block, as in Reutersvärd's drawing.
export const SIZE = 0.9;
const G = (1 - SIZE) / 2;

export function solidCube(b, p, s) {
  b.box(p[0] + G, p[1] + G, p[2] + G, p[0] + G + SIZE, p[1] + G + SIZE, p[2] + G + SIZE, s, { bottom: true });
}

// One half of the cube at p, cut by the plane y = z (local coordinates).
// half 'upper' keeps y ≥ z; half 'lower' keeps y ≤ z.
export function halfCube(b, p, s, half) {
  const P = (x, y, z) => [p[0] + G + x * SIZE, p[1] + G + y * SIZE, p[2] + G + z * SIZE];
  if (half === 'upper') {
    b.quad(P(1, 0, 0), P(0, 0, 0), P(0, 1, 0), P(1, 1, 0), s); // −z
    b.quad(P(0, 1, 1), P(1, 1, 1), P(1, 1, 0), P(0, 1, 0), s); // +y
    b.tri(P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), s, [1, 0, 1]); // +x
    b.tri(P(0, 0, 0), P(0, 1, 1), P(0, 1, 0), s, [1, 1, 0]); // −x
    b.quad(P(0, 0, 0), P(1, 0, 0), P(1, 1, 1), P(0, 1, 1), s); // cut, seen edge-on
  } else {
    b.quad(P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1), s); // +z
    b.quad(P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1), s); // −y
    b.tri(P(1, 0, 1), P(1, 0, 0), P(1, 1, 1), s, [0, 1, 1]); // +x
    b.tri(P(0, 0, 0), P(0, 0, 1), P(0, 1, 1), s, [1, 0, 1]); // −x
    b.quad(P(0, 0, 0), P(0, 1, 1), P(1, 1, 1), P(1, 0, 0), s); // cut
  }
}

// Build cube i of the figure into builder b.
export function buildCube(b, n, i) {
  const cells = cubePath(n);
  const s = st(cubeColour(i, cells.length), PAT.PLAIN);
  if (i < cells.length - 1) { solidCube(b, cells[i], s); return; }
  halfCube(b, cells[i], s, 'upper');
  halfCube(b, cells[i], withShift(s, -n), 'lower');
}
