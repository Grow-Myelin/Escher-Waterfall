// The numbers behind the picture.
//
// The straight picture D is self-similar: D(z) = D(R·z). The fundamental
// region is the square "annulus" 1/R ≤ max(|x|, |y|) < 1. At level 0 it shows
// a gallery room seen through a square opening; a print hangs on the back
// wall; the print shows a harbour town; at the far end of the quay stands the
// gallery building, and its first-floor window is exactly the square
// max(|x|, |y|) < 1/R, where the next level (the same room, R times smaller)
// begins.
//
// In log coordinates w = log z, scaling by R is a shift by ln R and a full
// turn is a shift by 2πi, so D(exp(w)) is doubly periodic. The twisted
// picture is E(z) = D(exp(α·log z)) with α = (2πi + ln R) / (2πi): one turn
// round the centre (2πi) lands on 2πi + ln R, a period of D, so E is single
// valued.

export const R = 256;
export const LNR = Math.log(R);
export const TAU = Math.PI * 2;

// α_t = 1 + t·ln R / (2πi) = 1 − i·t·ln R / 2π. t = 0 straight, t = 1 Escher's twist.
export function alphaAt(t) {
  return [1, (-t * LNR) / TAU];
}

// The zoom period of the picture for twist t: γ = ln R / α. Moving the view by
// γ in log coordinates changes w by exactly ln R, a period of D.
export function gammaAt(t) {
  const [a, b] = alphaAt(t);
  const d = a * a + b * b;
  return [(LNR * a) / d, (-LNR * b) / d];
}

// --- the room (level 0). A box seen through its open front face, the square
// [-1,1]², from a pinhole camera at (RC, -RF). A point at depth Z appears at
// q = RC + (P - RC)·RF/(RF + Z).
export const ROOM = { cx: -0.07, cy: 0.04, f: 1.2, depth: 1.65 };
export const SB = ROOM.f / (ROOM.f + ROOM.depth); // scale of the back wall
// wall coordinates of the centre of similarity q = 0
export const P0 = [ROOM.cx * (1 - 1 / SB), ROOM.cy * (1 - 1 / SB)];

// --- the print on the back wall (wall coordinates)
export const PRINT = { x0: -0.53, x1: 0.61, y0: -0.37, y1: 0.53, mat: 0.055, frame: 0.07 };

// --- the town inside the print, in metres. Pinhole camera at the origin
// looking along +Z; a point (X, Y, Z) appears at u = TC + TG·(X, Y)/Z in the
// print's coordinates.
export const TOWN = { g: 1.25, quay: -8.5, sea: -9.6, quayX0: -4, housesX: 6 };
// The gallery's window: half-size HW metres, centre (XW, YW). Its image must
// be the square of half-size 1/R round q = 0, i.e. half-size HU round P0 in
// wall coordinates.
export const WIN = { hw: 1.2, xw: 0.5, yw: TOWN.quay + 5.0 };
export const HU = 1 / R / SB;
export const ZG = (TOWN.g * WIN.hw) / HU; // depth of the gallery's facade
export const TC = [P0[0] - (WIN.xw * TOWN.g) / ZG, P0[1] - (WIN.yw * TOWN.g) / ZG];

export function glslDefines() {
  const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
  const d = {
    R: R, LNR: LNR, H0: 1 / R,
    RCX: ROOM.cx, RCY: ROOM.cy, RF: ROOM.f, RD: ROOM.depth, SB,
    P0X: P0[0], P0Y: P0[1],
    PX0: PRINT.x0, PX1: PRINT.x1, PY0: PRINT.y0, PY1: PRINT.y1, PMAT: PRINT.mat, PFRAME: PRINT.frame,
    TG: TOWN.g, TCX: TC[0], TCY: TC[1], YQ: TOWN.quay, YS: TOWN.sea, XQ0: TOWN.quayX0, XH: TOWN.housesX,
    ZG, WHW: WIN.hw, WXW: WIN.xw, WYW: WIN.yw,
  };
  return Object.entries(d).map(([k, v]) => `#define ${k} ${f(v)}`).join('\n');
}
