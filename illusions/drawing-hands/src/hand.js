// A right hand holding a pencil, built as a signed distance field and meshed
// with surface nets.
//
// Hand frame H (cm): origin at the centre of the wrist, x towards the
// fingers, y towards the thumb, z out of the back of the hand. Bones are
// round cones (capsules whose radius changes along their length); the palm
// is a blend of the metacarpals with the muscle pads of the palm. Fingers are
// posed by inverse kinematics so that thumb, index and middle finger meet the
// pencil in a tripod grip.
//
// Paper frame L (cm): origin at the point where the arm leaves the paper,
// x along the arm towards the fingers, y to the thumb side, z up from the
// paper. The hand is rolled onto its little-finger side and pitched down, as
// in writing; then everything behind the wrist is pressed flat into the
// paper (the flat, drawn part of the hand).

// ------------------------------------------------------------------ vectors
const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const perp = (a, d) => norm(sub(a, mul(d, dot(a, d)))); // component of a orthogonal to unit d

// ------------------------------------------------------------------ the pose
export const POSE = {
  roll: 0.36, // hand rolled onto its little-finger side (rad)
  pitch: 0.17, // fingers tilted down (rad); solved for in makeHtoL
  dev: 0.45, // the hand turned towards the thumb at the wrist (rad)
  ext: -0.42, // the forearm dipping back towards the paper (rad)
};

// The pencil in the hand frame: it rests in the web between thumb and index
// finger (W) and is pinched by thumb and index pad at C.
const PEN_W = v(7.2, 3.4, 1.2);
const PEN_C = v(10.3, 3.85, -2.9);
const PEN_D = norm(sub(PEN_C, PEN_W)); // towards the tip
export const PEN = { r: 0.37, tipLen: 0.35, coneLen: 2.1, back: 10.5 };
const PEN_TIP_S = 3.4; // pinch point to tip
const PEN_TIP = add(PEN_C, mul(PEN_D, PEN_TIP_S));

// ------------------------------------------------------------------ SDF
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// round cone between a and b with radii r1, r2 (after Inigo Quilez)
function makeRoundCone(a, b, r1, r2) {
  const ba = sub(b, a);
  const l2 = dot(ba, ba);
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  return { a, b, r1, r2, ba, l2, rr, a2, il2, k: Math.sign(rr) * rr * rr };
}
function sdRoundCone(px, py, pz, c) {
  const pax = px - c.a[0], pay = py - c.a[1], paz = pz - c.a[2];
  const bx = c.ba[0], by = c.ba[1], bz = c.ba[2];
  const y = pax * bx + pay * by + paz * bz;
  const z = y - c.l2;
  const xx = pax * c.l2 - bx * y, xy = pay * c.l2 - by * y, xz = paz * c.l2 - bz * y;
  const x2 = xx * xx + xy * xy + xz * xz;
  const y2 = y * y * c.l2;
  const z2 = z * z * c.l2;
  const k = c.k * x2;
  if (Math.sign(z) * c.a2 * z2 > k) return Math.sqrt(x2 + z2) * c.il2 - c.r2;
  if (Math.sign(y) * c.a2 * y2 < k) return Math.sqrt(x2 + y2) * c.il2 - c.r1;
  return (Math.sqrt(x2 * c.a2 * c.il2) + y * c.rr) * c.il2 - c.r1;
}
// ellipsoid (approximate distance, after Quilez), optionally rotated by a 3x3 matrix
function makeEllipsoid(c, r, m) { return { c, r, m }; }
function sdEllipsoid(px, py, pz, e) {
  let x = px - e.c[0], y = py - e.c[1], z = pz - e.c[2];
  if (e.m) {
    const m = e.m;
    const tx = m[0] * x + m[1] * y + m[2] * z, ty = m[3] * x + m[4] * y + m[5] * z, tz = m[6] * x + m[7] * y + m[8] * z;
    x = tx; y = ty; z = tz;
  }
  const ax = x / e.r[0], ay = y / e.r[1], az = z / e.r[2];
  const bx = ax / e.r[0], by = ay / e.r[1], bz = az / e.r[2];
  const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
  const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(e.r[0], e.r[1], e.r[2]);
}

// ------------------------------------------------------------------ fingers
// A finger is a planar chain: from its knuckle, in the vertical plane through
// direction d, flexing towards the palm. Joint angles accumulate; the last
// joint flexes by c times the middle one (the tendons couple them).
function chain(base, d, lens, angles) {
  const down = [0, 0, -1];
  const pts = [base];
  let phi = 0;
  let p = base;
  for (let i = 0; i < lens.length; i++) {
    phi += angles[i];
    const dir = add(mul(d, Math.cos(phi)), mul(down, Math.sin(phi)));
    p = add(p, mul(dir, lens[i]));
    pts.push(p);
  }
  return pts;
}

// Solve a finger so that its tip reaches target T (grid search, then refine).
function solveFinger(base, lens, T, coupling, spreadBias = 0) {
  const rel = sub(T, base);
  const d = norm([rel[0], rel[1], 0]);
  const a = Math.hypot(rel[0], rel[1]);
  const b = -rel[2];
  const tipOf = (t1, t2) => {
    const ph = [t1, t1 + t2, t1 + t2 + coupling * t2];
    let x = 0, y = 0;
    for (let i = 0; i < 3; i++) { x += lens[i] * Math.cos(ph[i]); y += lens[i] * Math.sin(ph[i]); }
    return [x, y];
  };
  let best = [0, 0], be = 1e9;
  for (let t1 = -0.5; t1 <= 1.7; t1 += 0.02) {
    for (let t2 = 0; t2 <= 2.1; t2 += 0.02) {
      const [x, y] = tipOf(t1, t2);
      const e = (x - a) ** 2 + (y - b) ** 2 + 0.002 * t2 * t2;
      if (e < be) { be = e; best = [t1, t2]; }
    }
  }
  const angles = [best[0], best[1], coupling * best[1]];
  const dd = norm(add(d, [-d[1] * spreadBias, d[0] * spreadBias, 0]));
  return { pts: chain(base, d, lens, angles), d: dd, err: Math.sqrt(be) };
}

// two-link chain with an analytic elbow (used for the thumb)
function twoLink(a, T, l1, l2, bendDir) {
  const rel = sub(T, a);
  const D = Math.min(len(rel), l1 + l2 - 1e-3);
  const u = norm(rel);
  const w = perp(bendDir, u);
  const cosA = (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D);
  const al = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const elbow = add(a, add(mul(u, l1 * Math.cos(al)), mul(w, l1 * Math.sin(al))));
  const tip = add(elbow, mul(norm(sub(add(a, mul(u, D)), elbow)), l2));
  return [a, elbow, tip];
}

// ------------------------------------------------------------------ the hand
export function buildHandModel() {
  const prims = { palm: [], fingers: [], pads: [] };
  const cone = (a, b, r1, r2) => makeRoundCone(a, b, r1, r2);

  // metacarpals: base near the wrist, head at the knuckle
  const MCP = {
    index: v(8.4, 2.45, 0.3),
    middle: v(8.8, 0.72, 0.42),
    ring: v(8.4, -0.95, 0.22),
    pinky: v(7.7, -2.45, -0.12),
  };
  const BASE = {
    index: v(1.6, 1.25, 0.45),
    middle: v(1.4, 0.3, 0.55),
    ring: v(1.5, -0.62, 0.45),
    pinky: v(1.7, -1.5, 0.25),
  };
  const MCR = { index: 0.84, middle: 0.86, ring: 0.8, pinky: 0.72 };
  for (const f of ['index', 'middle', 'ring', 'pinky']) {
    prims.palm.push(cone(BASE[f], MCP[f], 0.62, MCR[f]));
  }
  // palm body and muscle pads
  prims.pads.push(makeEllipsoid(v(4.7, 0.0, -0.2), [3.7, 3.0, 0.78]));
  prims.pads.push(makeEllipsoid(v(3.2, 2.15, -0.75), [2.4, 1.35, 1.0])); // thenar
  prims.pads.push(makeEllipsoid(v(4.0, -2.05, -0.6), [2.9, 0.82, 0.85])); // hypothenar
  prims.pads.push(makeEllipsoid(v(8.0, 0.0, -0.55), [1.1, 2.9, 0.6])); // pads under the knuckles
  // wrist and forearm (flattened ellipse in section, tapering to the wrist)
  prims.palm.push(cone(v(-13.5, 0, 0.0), v(-2.5, 0, 0.0), 1.82, 1.74));
  prims.palm.push(cone(v(-2.5, 0, 0.0), v(1.0, 0, 0.1), 1.74, 1.45));
  const FORE_SCALE_Y = 1.5; // the forearm and wrist are wider than deep

  // the pencil's contact points (H frame)
  const n1 = perp([0, 0, 1], PEN_D); // up, across the pencil
  const n2 = norm(cross(PEN_D, n1)); // to the thumb side, across the pencil
  const onPen = (s, ang, off) => add(add(PEN_C, mul(PEN_D, s)), mul(add(mul(n1, Math.cos(ang)), mul(n2, Math.sin(ang))), PEN.r + off));

  // index finger: pad on top of the pencil, a little in front of the pinch
  const LEN = {
    index: [4.0, 2.35, 1.85],
    middle: [4.45, 2.75, 1.95],
    ring: [4.15, 2.6, 1.85],
    pinky: [3.3, 2.0, 1.65],
  };
  const RAD = {
    index: [0.9, 0.82, 0.73, 0.6],
    middle: [0.93, 0.85, 0.75, 0.62],
    ring: [0.88, 0.8, 0.7, 0.58],
    pinky: [0.78, 0.7, 0.62, 0.5],
  };
  const fingers = {};
  fingers.index = solveFinger(MCP.index, LEN.index, onPen(0.25, -0.25, 0.62), 0.55);
  fingers.middle = solveFinger(MCP.middle, LEN.middle, onPen(1.25, Math.PI * 0.82, 0.55), 0.7);
  // ring and little finger curl under, resting on the paper
  fingers.ring = { pts: chain(MCP.ring, norm([0.97, -0.1, 0]), LEN.ring, [0.9, 1.9, 0.9]) };
  fingers.pinky = { pts: chain(MCP.pinky, norm([0.96, -0.22, 0]), LEN.pinky, [0.95, 1.85, 0.85]) };
  for (const f of ['index', 'middle', 'ring', 'pinky']) {
    const p = fingers[f].pts, r = RAD[f];
    const segs = [];
    for (let i = 0; i < 3; i++) segs.push(cone(p[i], p[i + 1], r[i], r[i + 1]));
    prims.fingers.push({ name: f, segs, pts: p, rad: r });
  }
  // thumb: carpometacarpal joint, metacarpal, then two phalanges reaching the
  // side of the pencil
  const CMC = v(1.7, 2.1, -0.55);
  const TMCP = v(5.6, 4.35, -1.15);
  const thumbTarget = onPen(-0.05, Math.PI * 0.42, 0.6);
  const th = twoLink(TMCP, thumbTarget, 3.0, 2.55, norm([-0.2, 0.55, 0.8]));
  const thumb = { name: 'thumb', segs: [cone(CMC, TMCP, 1.25, 1.02), cone(th[0], th[1], 1.02, 0.9), cone(th[1], th[2], 0.9, 0.7)], pts: [CMC, ...th], rad: [1.25, 1.02, 0.9, 0.7] };
  prims.fingers.push(thumb);

  // bounding boxes for the fingers (to skip distant ones)
  for (const f of prims.fingers) {
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (const s of f.segs) for (const q of [s.a, s.b]) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i] - 1.4); hi[i] = Math.max(hi[i], q[i] + 1.4); }
    f.lo = lo; f.hi = hi;
  }

  function sdf(x, y, z) {
    // palm: metacarpals and forearm, blended broadly
    let d = 1e9;
    for (let i = 0; i < prims.palm.length; i++) {
      const c = prims.palm[i];
      // the forearm cones are wider than deep
      const di = i >= 4 ? sdRoundCone(x, y / FORE_SCALE_Y, z, c) * 1.2 : sdRoundCone(x, y, z, c);
      d = i === 0 ? di : smin(d, di, i >= 4 ? 1.8 : 0.9);
    }
    for (const e of prims.pads) d = smin(d, sdEllipsoid(x, y, z, e), 0.9);
    // fingers: phalanges joined tightly, finger to palm more softly
    for (const f of prims.fingers) {
      const ex = Math.max(f.lo[0] - x, 0, x - f.hi[0]), ey = Math.max(f.lo[1] - y, 0, y - f.hi[1]), ez = Math.max(f.lo[2] - z, 0, z - f.hi[2]);
      if (ex * ex + ey * ey + ez * ez > (d + 1.0) * (d + 1.0) && d > 0) continue;
      let df = sdRoundCone(x, y, z, f.segs[0]);
      for (let i = 1; i < f.segs.length; i++) df = smin(df, sdRoundCone(x, y, z, f.segs[i]), 0.22);
      d = smin(d, df, f.name === 'thumb' ? 0.8 : 0.3);
    }
    return d;
  }

  return { sdf, prims, fingers, thumb, MCP, pen: { W: PEN_W, C: PEN_C, D: PEN_D, tip: PEN_TIP }, n1, n2, ik: { index: fingers.index.err, middle: fingers.middle.err } };
}

// ------------------------------------------------------------------ meshing
// Surface nets on a regular grid, with a coarse pass to find the narrow band.
export function meshSDF(sdf, lo, hi, h) {
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1;
  const ny = Math.ceil((hi[1] - lo[1]) / h) + 1;
  const nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  // coarse field
  const H = h * 4;
  const cx = Math.ceil((hi[0] - lo[0]) / H) + 2, cy = Math.ceil((hi[1] - lo[1]) / H) + 2, cz = Math.ceil((hi[2] - lo[2]) / H) + 2;
  const coarse = new Float32Array(cx * cy * cz);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    coarse[i + cx * (j + cy * k)] = sdf(lo[0] + i * H, lo[1] + j * H, lo[2] + k * H);
  }
  const band = H * 0.65;
  const field = new Float32Array(nx * ny * nz);
  const cxy = cx * cy;
  for (let k = 0; k < nz; k++) {
    const z = lo[2] + k * h, fk = (k * h) / H, k0 = Math.floor(fk), tk = fk - k0;
    for (let j = 0; j < ny; j++) {
      const y = lo[1] + j * h, fj = (j * h) / H, j0 = Math.floor(fj), tj = fj - j0;
      const r00 = cx * j0 + cxy * k0, r10 = r00 + cx, r01 = r00 + cxy, r11 = r10 + cxy;
      let o = nx * (j + ny * k);
      for (let i = 0; i < nx; i++, o++) {
        const fi = (i * h) / H, i0 = Math.floor(fi), ti = fi - i0;
        const c00 = coarse[r00 + i0] * (1 - ti) + coarse[r00 + i0 + 1] * ti;
        const c10 = coarse[r10 + i0] * (1 - ti) + coarse[r10 + i0 + 1] * ti;
        const c01 = coarse[r01 + i0] * (1 - ti) + coarse[r01 + i0 + 1] * ti;
        const c11 = coarse[r11 + i0] * (1 - ti) + coarse[r11 + i0 + 1] * ti;
        const est = (c00 * (1 - tj) + c10 * tj) * (1 - tk) + (c01 * (1 - tj) + c11 * tj) * tk;
        field[o] = est > band || est < -band ? est : sdf(lo[0] + i * h, y, z);
      }
    }
  }
  // one vertex per cell that the surface crosses
  const mx = nx - 1, my = ny - 1, mz = nz - 1;
  const idx = new Int32Array(mx * my * mz).fill(-1);
  const pos = [];
  const sxy = nx * ny;
  const coff = [0, 1, nx, nx + 1, sxy, sxy + 1, sxy + nx, sxy + nx + 1];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const val = new Float64Array(8);
  for (let k = 0; k < mz; k++) for (let j = 0; j < my; j++) {
    const base = nx * (j + ny * k);
    for (let i = 0; i < mx; i++) {
      const b0 = base + i;
      let neg = 0;
      for (let c = 0; c < 8; c++) { const fv = field[b0 + coff[c]]; val[c] = fv; if (fv < 0) neg++; }
      if (neg === 0 || neg === 8) continue;
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (let e = 0; e < 12; e++) {
        const a = edges[e][0], b = edges[e][1];
        const va = val[a], vb = val[b];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb);
        const ca = corner[a], cb = corner[b];
        sx += ca[0] + (cb[0] - ca[0]) * t;
        sy += ca[1] + (cb[1] - ca[1]) * t;
        sz += ca[2] + (cb[2] - ca[2]) * t;
        n++;
      }
      idx[i + mx * (j + my * k)] = pos.length / 3;
      pos.push(lo[0] + (i + sx / n) * h, lo[1] + (j + sy / n) * h, lo[2] + (k + sz / n) * h);
    }
  }
  const F = (i, j, k) => field[i + nx * (j + ny * k)];
  // quads across every grid edge with a sign change
  const tri = [];
  const C = (i, j, k) => idx[i + mx * (j + my * k)];
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const f0 = F(i, j, k) < 0;
    // x edge
    if (i < nx - 1 && f0 !== (F(i + 1, j, k) < 0)) {
      const a = C(i, j - 1, k - 1), b = C(i, j, k - 1), c = C(i, j, k), d = C(i, j - 1, k);
      if (f0) tri.push(a, b, c, a, c, d); else tri.push(a, c, b, a, d, c);
    }
    if (j < ny - 1 && f0 !== (F(i, j + 1, k) < 0)) {
      const a = C(i - 1, j, k - 1), b = C(i, j, k - 1), c = C(i, j, k), d = C(i - 1, j, k);
      if (f0) tri.push(a, c, b, a, d, c); else tri.push(a, b, c, a, c, d);
    }
    if (k < nz - 1 && f0 !== (F(i, j, k + 1) < 0)) {
      const a = C(i - 1, j - 1, k), b = C(i, j - 1, k), c = C(i, j, k), d = C(i - 1, j, k);
      if (f0) tri.push(a, b, c, a, c, d); else tri.push(a, c, b, a, d, c);
    }
  }
  return { positions: new Float32Array(pos), index: new Uint32Array(tri) };
}

// H frame -> L frame: roll onto the little-finger side, pitch the fingers
// down until the hand rests on the paper at the same height as the pencil
// tip, then lift everything so both touch the paper. Two bends at the wrist:
// the hand turns towards the thumb (radial deviation, POSE.dev) and the
// forearm dips back down towards the paper (POSE.ext).
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function makeHtoL(model, verts) {
  const cr = Math.cos(POSE.roll), sr = Math.sin(POSE.roll);
  const rotP = (p, pitch) => {
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const y1 = p[1] * cr - p[2] * sr, z1 = p[1] * sr + p[2] * cr;
    return [p[0] * cp + z1 * sp, y1, -p[0] * sp + z1 * cp];
  };
  const bend = (q, xh) => {
    const w = smooth(-2.6, 0.9, xh);
    // forearm: turn about the y axis through the wrist
    const e = POSE.ext * (1 - w);
    const ce = Math.cos(e), se = Math.sin(e);
    let x = q[0] * ce + q[2] * se, z = -q[0] * se + q[2] * ce, y = q[1];
    // hand: turn about the z axis through the wrist
    const d = POSE.dev * w;
    const cd = Math.cos(d), sd = Math.sin(d);
    return [x * cd - y * sd, x * sd + y * cd, z];
  };
  let pitch = POSE.pitch;
  if (verts) {
    const cand = [];
    for (let i = 0; i < verts.length; i += 9) if (verts[i] > 1.5) cand.push([verts[i], verts[i + 1], verts[i + 2]]);
    const gap = (pt) => {
      let mz = 1e9;
      for (const c of cand) mz = Math.min(mz, rotP(c, pt)[2]);
      return mz - rotP(model.pen.tip, pt)[2];
    };
    let a = -0.3, b = 0.9;
    for (let it = 0; it < 30; it++) { const m = (a + b) / 2; if (gap(m) > 0) b = m; else a = m; }
    pitch = (a + b) / 2;
  }
  const tip = rotP(model.pen.tip, pitch);
  const lift = -tip[2];
  const apply = (p) => { const q = bend(rotP(p, pitch), p[0]); return [q[0], q[1], q[2] + lift]; };
  // directions on the hand (the pencil): roll, pitch and the hand's turn
  const rot = (p) => { const q = rotP(p, pitch); const d = POSE.dev, cd = Math.cos(d), sd = Math.sin(d); return [q[0] * cd - q[1] * sd, q[0] * sd + q[1] * cd, q[2]]; };
  return { rot, pitch, lift, apply };
}

// ------------------------------------------------------------------ details
// Per-vertex extras for the shader, from the hand frame mesh:
//  nail: signed distance (cm) to the outline of a finger nail (negative inside)
//  ao:   ambient occlusion from the coarse distance field
export function vertexExtras(model, pos, normals, sdf) {
  const n = pos.length / 3;
  const nail = new Float32Array(n).fill(9);
  const ao = new Float32Array(n).fill(1);
  // nails sit on the back of each distal phalanx
  const nails = [];
  for (const f of model.prims.fingers) {
    const p = f.pts, r = f.rad;
    const j3 = p[p.length - 2], tip = p[p.length - 1];
    const u = norm(sub(tip, j3));
    let dors;
    if (f.name === 'thumb') dors = perp(norm([-0.15, 0.6, 0.8]), u);
    else dors = perp([0, 0, 1], u);
    const side = cross(u, dors);
    const L = len(sub(tip, j3));
    nails.push({ j3, u, dors, side, L, r: r[r.length - 2], rt: r[r.length - 1] });
  }
  for (let i = 0; i < n; i++) {
    const p = [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]];
    let best = 9;
    for (const N of nails) {
      const rel = sub(p, N.j3);
      const s = dot(rel, N.u);
      if (s < -0.2 || s > N.L + N.rt + 0.3) continue;
      const rv = sub(rel, mul(N.u, s));
      const rad = len(rv);
      const rr = N.r + (N.rt - N.r) * Math.min(1, Math.max(0, s / N.L));
      if (Math.abs(rad - rr) > 0.35) continue;
      const a = Math.atan2(dot(rv, N.side), dot(rv, N.dors));
      // nail plate: from 35% along the phalanx to just past the tip, ~70° either side
      const along = s - (0.35 * N.L + (N.L + 0.35 * N.rt)) / 2;
      const halfL = ((N.L + 0.35 * N.rt) - 0.35 * N.L) / 2;
      const across = a * rr;
      const halfW = 0.62 * rr;
      // rounded rectangle, rounder at the free edge
      const dx = Math.abs(along) - halfL + 0.18, dy = Math.abs(across) - halfW + 0.18;
      const d = Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - 0.18;
      if (d < best) best = d;
    }
    nail[i] = best;
    // ambient occlusion: how far the field opens up along the normal
    const nx = normals[3 * i], ny = normals[3 * i + 1], nz = normals[3 * i + 2];
    let occ = 0, w = 1;
    for (let k = 1; k <= 4; k++) {
      const dd = 0.35 * k;
      const s = sdf(p[0] + nx * dd, p[1] + ny * dd, p[2] + nz * dd);
      occ += w * Math.max(0, dd - s);
      w *= 0.55;
    }
    ao[i] = Math.max(0, 1 - occ * 0.9);
  }
  return { nail, ao };
}

// Plan outline of the arm behind the wrist (L frame): for each x, the
// extreme y of the mesh. The flat drawing follows these lines.
export function footprint(posL, x0, x1, step) {
  const nb = Math.round((x1 - x0) / step) + 1;
  const lo = new Float32Array(nb).fill(1e9), hi = new Float32Array(nb).fill(-1e9);
  for (let i = 0; i < posL.length; i += 3) {
    const b = Math.round((posL[i] - x0) / step);
    if (b < 0 || b >= nb) continue;
    lo[b] = Math.min(lo[b], posL[i + 1]);
    hi[b] = Math.max(hi[b], posL[i + 1]);
  }
  return { x0, step, lo, hi, at(x) {
    const f = Math.min(nb - 1.001, Math.max(0, (x - x0) / step));
    const i = Math.floor(f), t = f - i;
    return [lo[i] * (1 - t) + lo[i + 1] * t, hi[i] * (1 - t) + hi[i + 1] * t];
  } };
}
