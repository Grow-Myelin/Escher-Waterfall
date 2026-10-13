// An ambiguous cylinder: a tube whose top rim is a space curve that, under a
// parallel view from the front at elevation θ, projects exactly onto the
// image of a horizontal square, and from the back at the same elevation (as a
// mirror shows it) onto the image of a horizontal circle.
//
// Front view: a point (x, y, z) appears at (u, s1) = (x, y cosθ − z sinθ).
// Back view (in the mirror): (u, s2) = (x, y cosθ + z sinθ).
// A horizontal square of half-side r at height y0 appears as s1 = y0 cosθ ± r sinθ,
// a horizontal circle as s2 = y0 cosθ ± sinθ √(r² − x²). For each x the two
// views share u = x; solving the two linear equations for y and z gives
//
//   front half:  y = y0 + tanθ (√(r² − x²) − r) / 2,   z =  (√(r² − x²) + r) / 2
//   back half:   y = y0 − tanθ (√(r² − x²) − r) / 2,   z = −(√(r² − x²) + r) / 2
//
// and at x = ±r the square's vertical sides become straight segments that run
// along the back view's line of sight (so the circle sees them as one point).

export function rimPoint(r, y0, th, x, back) {
  const s = Math.sqrt(Math.max(0, r * r - x * x));
  const t = Math.tan(th);
  return back
    ? [x, y0 - (t * (s - r)) / 2, -(s + r) / 2]
    : [x, y0 + (t * (s - r)) / 2, (s + r) / 2];
}

// The closed rim, as samples (front half from +x to −x, left side, back half,
// right side),
// { p:[x,y,z], n:[nx,0,nz] (outward footprint normal), corner } .
export function rimCurve(r, y0, th, n = 48, nSide = 6) {
  const pts = [];
  const t = Math.tan(th);
  // front: x from +r to −r (counter-clockwise from above means +x → −x along +z side)
  for (let i = 0; i <= n; i++) {
    const ph = (i / n) * Math.PI; // x = r cos φ
    const x = r * Math.cos(ph);
    const p = rimPoint(r, y0, th, x, false);
    // footprint z = (r sin φ + r)/2 → tangent d/dφ = (−r sin φ, r cos φ / 2)
    const tx = -r * Math.sin(ph), tz = (r * Math.cos(ph)) / 2;
    const L = Math.hypot(tx, tz) || 1;
    // outward normal for a counter-clockwise curve (seen from +y): (tz, −tx) rotated: n = (tz, -tx)? choose pointing +z here
    let nx = tz / L, nz = -tx / L;
    if (nz < 0) { nx = -nx; nz = -nz; }
    pts.push({ p, n: [nx, 0, nz], corner: i === 0 || i === n });
  }
  // left side at x = −r: from the front corner to the back corner
  for (let j = 1; j < nSide; j++) {
    const k = j / nSide;
    const zf = r / 2, zb = -r / 2;
    pts.push({ p: [-r, y0 - (t * r) / 2 + k * t * r, zf + (zb - zf) * k], n: [-1, 0, 0], corner: false });
  }
  // back: x from −r to +r
  for (let i = 0; i <= n; i++) {
    const ph = Math.PI + (i / n) * Math.PI;
    const x = r * Math.cos(ph);
    const p = rimPoint(r, y0, th, x, true);
    const tx = -r * Math.sin(ph), tz = -(r * Math.cos(ph)) / 2;
    const L = Math.hypot(tx, tz) || 1;
    let nx = tz / L, nz = -tx / L;
    if (nz > 0) { nx = -nx; nz = -nz; }
    pts.push({ p, n: [nx, 0, nz], corner: i === 0 || i === n });
  }
  // right side at x = +r: back corner to front corner
  for (let j = 1; j < nSide; j++) {
    const k = j / nSide;
    const zb = -r / 2, zf = r / 2;
    pts.push({ p: [r, y0 + (t * r) / 2 - k * t * r, zb + (zf - zb) * k], n: [1, 0, 0], corner: false });
  }
  // fix the normals at the four corners: exactly ±x (the ellipse meets the side tangentially)
  for (const q of pts) if (q.corner) q.n = [Math.sign(q.p[0]), 0, 0];
  return pts;
}

// Build the tube into a Builder: outer wall down to the table (y = 0), inner
// wall (the same construction with r − wall), and the rim band between them.
export function buildTube(b, r, y0, th, wall, s, sIn) {
  const out = rimCurve(r, y0, th);
  const inn = rimCurve(r - wall, y0, th);
  const N = out.length;
  // arc length along the outer footprint, for texture coordinates
  const arc = [0];
  for (let i = 1; i <= N; i++) {
    const a = out[i - 1].p, c = out[i % N].p;
    arc.push(arc[i - 1] + Math.hypot(c[0] - a[0], c[2] - a[2]));
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    const A = out[i], B = out[j], Ai = inn[i], Bi = inn[j];
    const u0 = arc[i], u1 = arc[i + 1];
    // a vertical ink line where the straight sides meet the curved halves
    const edgeA = A.corner ? 1 : 0, edgeB = B.corner ? 1 : 0;
    // outer wall (the curve runs clockwise seen from above, so B comes first)
    b.quad(
      [B.p[0], 0, B.p[2]], [A.p[0], 0, A.p[2]], A.p, B.p, s, [1, edgeA, 1, edgeB],
      { n: [B.n, A.n, A.n, B.n], uv: [[u1, 0], [u0, 0], [u0, A.p[1]], [u1, B.p[1]]] },
    );
    // inner wall, facing in
    const ni = (q) => [-q.n[0], 0, -q.n[2]];
    b.quad(
      [Ai.p[0], 0, Ai.p[2]], [Bi.p[0], 0, Bi.p[2]], Bi.p, Ai.p, sIn, [0, edgeB, 1, edgeA],
      { n: [ni(Ai), ni(Bi), ni(Bi), ni(Ai)], uv: [[u0, 0], [u1, 0], [u1, Bi.p[1]], [u0, Ai.p[1]]] },
    );
    // rim band
    b.quad(B.p, A.p, Ai.p, Bi.p, s, [1, 0, 1, 0]);
  }
  return out;
}
