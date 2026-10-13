// The lizard: an original design for the hexagon with three turning corners.
//
// Anatomy on the hexagon: the snout end of the head sits by corner V0, the
// knees of the hind legs are the corners V2 and V4 (so three heads, three
// left knees and three right knees each meet at a rotation centre), and the
// free corners carry the fore feet and the tip of the tail. Turning the free
// corner about V0 puts one fore foot forward and the other back: a walking gait.
//
// The outline was found by fitting the three master edges to a drawing of a
// walking lizard (a small least-squares search over the handles), then
// adjusted by hand.
//
// full:   every handle of each master edge [u, v] in the edge frame
//         (u along the edge, v outward, in edge lengths)
// majors: which of them are offered for dragging; the rest of the shape is
//         kept as a fine residual on top of the spline through the majors
// toes:   small fixed lobes [t, amplitude, half-width] along each edge

export const LIZARD = {
  v1: [-1.0028, 0.5328],
  full: [
    [[0.1181, 0.1746], [0.1896, 0.2778], [0.2373, 0.3897], [0.394, 0.353], [0.5048, 0.265], [0.5134, 0.1395], [0.533, -0.0229], [0.6017, -0.1496], [0.6727, -0.1927], [0.7424, -0.1779], [0.7827, -0.0875], [0.8315, 0.0182], [0.8615, 0.0687], [0.9116, 0.0739]],
    [[0.0424, 0.2525], [0.1494, 0.3939], [0.1795, 0.531], [0.3883, 0.6284], [0.4834, 0.6441], [0.5232, 0.5095], [0.5532, 0.2815], [0.5833, 0.0586], [0.6443, -0.0851], [0.7143, -0.1444], [0.7456, -0.1787], [0.7776, -0.201], [0.97, -0.2347]],
    [[0.0989, 0.1422], [0.1651, 0.1964], [0.2713, 0.2337], [0.3907, 0.2023], [0.421, 0.0195], [0.451, -0.2415], [0.4811, -0.4882], [0.5524, -0.6256], [0.6572, -0.5981], [0.7322, -0.4335], [0.7709, -0.2278], [0.8009, -0.0365], [0.8722, 0.09]],
  ],
  majors: [[2, 4, 7, 9, 12], [1, 3, 5, 8, 11], [1, 3, 6, 8, 11]],
  toes: [
    [[0.885, 0.09, 0.025], [0.94, 0.09, 0.022]],
    [[0.27, 0.09, 0.03], [0.335, 0.1, 0.03], [0.4, 0.09, 0.03]],
    [[0.09, 0.09, 0.028], [0.15, 0.1, 0.028], [0.21, 0.09, 0.028]],
  ],
  // the walk: the free corner swings about V0 by this many degrees
  stride: 7,
};

// Interior marks, in the lizard's own coordinates. They are tied to the
// outline (mean-value coordinates), so they follow it when it is edited.
const SPINE = [[-0.32, 0.86], [-0.2, 0.6], [-0.12, 0.35], [-0.04, 0.05], [0.04, -0.28], [0.18, -0.58], [0.33, -0.85], [0.45, -1.05], [0.54, -1.18]];

function along(poly, n) {
  const L = [0];
  for (let i = 1; i < poly.length; i++) L.push(L[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const out = [];
  for (let k = 0; k <= n; k++) {
    const s = (L[L.length - 1] * k) / n;
    let i = 1;
    while (i < poly.length - 1 && L[i] < s) i++;
    const f = (s - L[i - 1]) / (L[i] - L[i - 1]);
    const p = [poly[i - 1][0] + (poly[i][0] - poly[i - 1][0]) * f, poly[i - 1][1] + (poly[i][1] - poly[i - 1][1]) * f];
    const tx = poly[i][0] - poly[i - 1][0], ty = poly[i][1] - poly[i - 1][1], tl = Math.hypot(tx, ty);
    out.push({ p, t: [tx / tl, ty / tl], n: [-ty / tl, tx / tl], s: s / L[L.length - 1] });
  }
  return out;
}

function buildMarks() {
  const eyes = [{ p: [-0.485, 1.025], r: 0.045 }, { p: [-0.2, 1.045], r: 0.045 }];
  const lines = [{ pts: SPINE }];
  const dots = [{ p: [-0.43, 1.19], r: 0.011 }, { p: [-0.365, 1.21], r: 0.011 }];
  // chevrons of scales down the back, narrowing to the tail
  for (const q of along(SPINE, 22).slice(2, -1)) {
    const w = 0.07 * (1 - 0.6 * q.s);
    const b = [q.p[0] - q.t[0] * w * 0.8, q.p[1] - q.t[1] * w * 0.8];
    lines.push({ pts: [[b[0] + q.n[0] * w, b[1] + q.n[1] * w], q.p, [b[0] - q.n[0] * w, b[1] - q.n[1] * w]] });
  }
  // rows of round scales along the flanks
  for (const q of along(SPINE, 16).slice(2, 11)) {
    for (const side of [-1, 1]) {
      const d = 0.15 * (1 - 0.35 * q.s);
      dots.push({ p: [q.p[0] + side * q.n[0] * d, q.p[1] + side * q.n[1] * d], r: 0.022 * (1 - 0.3 * q.s) });
    }
  }
  return { eyes, lines, dots };
}

export const MARKS = buildMarks();
