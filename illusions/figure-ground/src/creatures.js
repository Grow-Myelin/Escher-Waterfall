// The two creatures: an original swallow-like bird seen from above (wings
// swept back, heading left) and a fish seen from the side (heading left).
// The beak of each bird sits in the fork of a fish's tail; the snout of each
// fish sits between a bird's trailing wings.
//
// The four bird edges were found by fitting both outlines at once to
// drawings of the two animals (a small least-squares search), then tidied.
// Each edge: handles [u, v] in its own frame (u along the edge, v outward
// from the bird, in edge lengths). Edges run counter-clockwise round the
// bird: right, top, left, bottom.

export const DESIGN = {
  P: [0.9149, 0.5001],
  Q: [-0.3081, 0.5242],
  handles: [
    [[0.2704, -0.1201], [0.3141, -0.3538], [0.4287, -0.535], [0.5872, -0.6088], [0.6271, -0.5134], [0.6672, -0.3265], [0.7199, -0.101]],
    [[0.3787, 0.2675], [0.4187, 0.096], [0.4587, 0.0022], [0.4987, 0.0612], [0.5387, 0.1382], [0.5787, 0.079], [0.907, 0.0349]],
    [[0.221, -0.0452], [0.3797, 0.2091], [0.44, 0.37], [0.515, 0.515], [0.59, 0.37], [0.6424, 0.1624], [0.8687, -0.0732]],
    [[0.3658, 0.0602], [0.4058, -0.0838], [0.4458, -0.1409], [0.4858, -0.0087], [0.5258, 0.1734], [0.6916, 0.2372], [0.7316, 0.2922]],
  ],
};

// Detail drawn on each creature, in its own frame (each centred on its cell).
// level: how far from the band (0 … 1 of the detail ramp) the mark appears.
// Birds are marked in ink; fish in pale lines, like white-line engraving.
export const BIRD_MARKS = [
  { level: 0, width: 1.1, dots: [[-0.6, 0.065, 0.024], [-0.6, -0.055, 0.024]] },
  { level: 0.22, width: 1.1, strokes: [
    [[-0.37, 0.16], [-0.12, 0.175], [0.16, 0.13], [0.3, 0.08]],
    [[-0.34, -0.17], [-0.1, -0.17], [0.18, -0.12], [0.36, -0.06]],
  ] },
  { level: 0.42, width: 1, strokes: [
    [[-0.22, 0.27], [0.0, 0.41], [0.22, 0.5], [0.4, 0.58]],
    [[-0.2, -0.27], [0.0, -0.42], [0.2, -0.52], [0.34, -0.62]],
  ] },
  { level: 0.58, width: 0.9, strokes: [
    [[0.14, 0.52], [0.47, 0.75]], [[0.22, 0.46], [0.62, 0.64]], [[0.27, 0.38], [0.74, 0.5]], [[0.3, 0.28], [0.78, 0.36]],
    [[0.14, -0.53], [0.52, -0.72]], [[0.2, -0.45], [0.66, -0.64]], [[0.25, -0.36], [0.76, -0.5]], [[0.31, -0.26], [0.78, -0.34]],
  ] },
  { level: 0.74, width: 0.85, strokes: [
    [[0.44, 0.18], [0.82, 0.3]], [[0.44, -0.11], [0.8, -0.26]],
    [[-0.05, 0.25], [0.05, 0.33]], [[0.06, 0.22], [0.16, 0.3]], [[-0.05, -0.25], [0.05, -0.34]], [[0.06, -0.21], [0.16, -0.3]],
    [[-0.5, 0.0], [-0.38, 0.0]],
  ] },
];

function scales() {
  const out = [];
  for (let r = -2; r <= 2; r++) {
    const y = 0.02 + r * 0.115;
    for (let c = -4; c <= 4; c++) {
      const x = c * 0.095 + (r & 1 ? 0.047 : 0);
      if ((x / 0.42) ** 2 + ((y - 0.02) / 0.3) ** 2 > 1 || x < -0.36) continue;
      // an arc open toward the head, like an overlapping scale
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 6;
        pts.push([x + 0.05 * Math.cos(a), y + 0.055 * Math.sin(a)]);
      }
      out.push(pts);
    }
  }
  return out;
}

export const FISH_MARKS = [
  { level: 0, width: 1, dots: [[-0.63, 0.06, 0.06]], light: true },
  { level: 0, width: 1.1, circles: [[-0.63, 0.06, 0.06]], strokes: [[[-0.875, 0.0], [-0.78, -0.02]]] },
  { level: 0, width: 1, dots: [[-0.622, 0.062, 0.028]], dark: true },
  { level: 0.2, width: 1.2, strokes: [[[-0.5, 0.2], [-0.42, 0.04], [-0.5, -0.16]]] },
  { level: 0.42, width: 0.85, strokes: scales() },
  { level: 0.62, width: 0.85, strokes: [
    [[0.1, 0.43], [0.24, 0.6]], [[0.18, 0.38], [0.26, 0.58]], [[0.27, 0.33], [0.27, 0.52]],
    [[0.5, 0.2], [0.86, 0.44]], [[0.52, 0.15], [0.9, 0.32]], [[0.54, 0.12], [0.84, 0.2]],
    [[0.5, -0.14], [0.86, -0.42]], [[0.52, -0.12], [0.9, -0.31]], [[0.54, -0.1], [0.84, -0.18]],
    [[-0.3, -0.25], [-0.31, -0.42]], [[-0.22, -0.3], [-0.28, -0.42]], [[0.27, -0.33], [0.36, -0.4]], [[0.34, -0.27], [0.4, -0.36]],
  ] },
  { level: 0.8, width: 0.9, strokes: [[[-0.4, 0.1], [-0.1, 0.13], [0.2, 0.09], [0.46, 0.04]]] },
];
