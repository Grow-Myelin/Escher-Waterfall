// Schröder's stairs (1858): one flight of steps against a wall, drawn in
// isometric. The same lines show stairs seen from above, climbing to the left,
// or an overhang of steps hanging from a ceiling, seen from below. Here the
// whole figure is shaded as one reading; the light decides which.

import { Builder, st, PAT } from '../../../src/builder.js';

const sStep = st(0xdcd3be, PAT.PLAIN);
const sSide = st(0xd2c7af, PAT.ASHLAR);
const sWall = st(0xcdc2aa, PAT.ASHLAR);
const sTop = st(0xe3dbc8, PAT.PLAIN);

export const SCH = { n: 7, t: 0.8, r: 0.8, W: 2.1, ext: 2.2, base: 0.45 };

export function buildSchroeder() {
  const b = new Builder();
  const { n, t, r, W, ext, base } = SCH;
  const x1 = (n * t) / 2; // foot of the flight
  const xR = x1 + ext, xL = -x1 - ext;
  const top = n * r;

  // the side profile (+z face), as columns so every piece is a rectangle;
  // only the zigzag outline and the outer boundary are inked
  const col = (xa, xb, y0, y1, e) => b.quad([xa, y0, W], [xb, y0, W], [xb, y1, W], [xa, y1, W], sSide, e);
  col(x1, xR, -base, 0, [1, 1, 1, 0]); // floor slab
  for (let i = 0; i < n; i++) {
    const xb = x1 - i * t, xa = xb - t;
    const h = (i + 1) * r;
    col(xa, xb, -base, h - r, [1, 0, 0, 0]); // below the previous tread
    col(xa, xb, h - r, h, [0, 1, 1, 0]); // the riser's edge and the tread line
  }
  col(xL, -x1, -base, top, [1, 0, 1, 1]); // landing block

  // treads, risers, floor and landing tops
  b.quad([x1, 0, W], [xR, 0, W], [xR, 0, -W], [x1, 0, -W], sTop, [1, 1, 1, 0]);
  b.quad([xR, -base, W], [xR, -base, -W], [xR, 0, -W], [xR, 0, W], sSide, [1, 1, 1, 1]);
  for (let i = 0; i < n; i++) {
    const xb = x1 - i * t, xa = xb - t;
    const h = (i + 1) * r;
    // riser (+x face) from h − r to h at x = xb
    b.quad([xb, h - r, W], [xb, h - r, -W], [xb, h, -W], [xb, h, W], sStep, [1, 1, 1, 1]);
    // tread (+y face) at height h
    b.quad([xa, h, W], [xb, h, W], [xb, h, -W], [xa, h, -W], sTop, [1, 1, 1, 1]);
  }
  b.quad([xL, top, W], [-x1, top, W], [-x1, top, -W], [xL, top, -W], sTop, [1, 1, 1, 1]);

  // the wall behind (z = −W), standing above the whole flight
  const wt = 0.4, wh = top + 2.6;
  b.box(xL, -base, -W - wt, xR, wh, -W, sWall, { ao: 0.9 });
  b.box(xL - 0.06, wh, -W - wt - 0.06, xR + 0.06, wh + 0.2, -W + 0.06, sTop, {});
  return b;
}
