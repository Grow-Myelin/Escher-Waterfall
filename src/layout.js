// The impossible geometry, in numbers.
//
// The water runs round a closed loop in the picture:
//
//   wheel ─S1→ C1 ─S2→ C2 ─S3→ C3 ─S4→ lip ─fall→ wheel
//
// S1 and S3 run along −z and S2 and S4 run along −x, so every segment *recedes*
// from the viewer and the water seems to flow gently "downhill". In true
// isometric projection (camera on the (1,1,1) diagonal) a horizontal step of
// (−d, 0, −d) looks exactly like a vertical step of (0, +d, 0), because the
// two differ only by d·(1,1,1), which projects to a single point. So in
// the picture the loop climbs DROP = A + S units while in 3D it stays level.
// The water then falls DROP units straight back to where it started.
//
// In 3D the loop is an open spiral whose top end sits DROP·√3 behind its
// bottom. Three things bridge gaps that exist only in the picture: the
// waterfall itself, the lower storey of the right tower (C1 up to C3) and the
// lower storey of the left tower (C2 up to P on S4). Each is cut once at
// mid-height, and the upper half is slid back along the view axis to meet
// the piece it holds up.
// These are the three Penrose tribars Escher built the print from.

export const S = 10; // storey height = length of the rungs S2 and S3
export const D = 6; // extra run of S1/S4, keeps the waterfall clear of the left tower
export const A = S + D; // length of S1 and S4, corner to corner
export const DROP = A + S; // apparent height of the waterfall

export const W = 3.5; // outer width of the channel = tower footprint
export const HW = W / 2;
export const T = 0.45; // wall thickness
export const IW = W - 2 * T; // inner width
export const FLOOR = 0.5; // channel floor thickness (below y = 0)
export const WALL = 1.3; // wall height above the channel bed
export const COPE = 0.2; // coping on the wall tops
export const TOPW = WALL + COPE; // top of a channel wall
export const WL = 0.85; // water level
export const GROUND = -9;

// Real 3D centres of the corners (channel bed level).
export const PT = {
  wbot: [0, 0, 0],
  c1: [0, 0, -A],
  c2: [-S, 0, -A],
  c3: [-S, 0, -A - S],
  p: [-2 * S, 0, -A - S],
  wtop: [-A - S, 0, -A - S],
};

// Where the water leaves S4. The falling stream ends up centred on x = wtop.x.
export const LIP_RX = 1.1; // horizontal reach of the spout curve
export const LIP_RY = 1.5; // vertical radius of the spout curve
export const LIP_X = PT.wtop[0] + LIP_RX;

// The mill wheel, in the frame of the wheel (W_bot).
export const WHEEL = { y: 4.9, z: -0.9, r: 4.6, half: 0.8 };

// The stream is cut at this height (W_bot frame): above it, it hangs from S4.
export const FALL_SEAM_Y = 17;
export const FALL_END_Y = 9.05;
export const FALL_THICK = 0.8;
export const FALL_WIDTH = 2.4;

// Tower storeys (heights in the frame of the floor each storey stands on).
export const TOWER = {
  col: 0.6, // column section
  st1Top: S - FLOOR, // top of the storey-1 columns (underside of the upper channel)
  split: 5.5, // height of the hidden seam in storey 1
  st2Top: 9.5,
  ent: [9.5, 10.3],
  arcadeTop: 15.0,
  spring: 13.3,
  slab: [15.0, 15.7],
  plinth: [15.7, 16.05],
};

// Apparent screen position of a world point under the isometric camera
// (x right, y up). Useful for laying things out.
export function screen(p) {
  return [(p[0] - p[2]) / Math.SQRT2, (2 * p[1] - p[0] - p[2]) / Math.sqrt(6)];
}

// World point with the given screen position and depth (x + y + z).
export function fromScreen(X, Y, depth) {
  const u = X * Math.SQRT2;
  const v = Y * Math.sqrt(6);
  const y = (depth + v) / 3;
  const xz = 2 * y - v;
  return [(xz + u) / 2, y, (xz - u) / 2];
}
