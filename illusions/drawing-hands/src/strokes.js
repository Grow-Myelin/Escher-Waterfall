// The flat part of each hand: a pencil drawing of the wrist and shirt cuff,
// made of strokes in the hand's own paper frame (x along the arm towards the
// fingers, y to the thumb side). The other hand's pencil lays these strokes
// down one after another; the timeline says where its tip is at any moment.

// deterministic noise for a hand-drawn wobble
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function polyLen(p) {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return L;
}

// resample a curve f(t), t in [0,1], at roughly `step` cm, with a slow wobble
function curve(f, step, wob, rand) {
  const raw = [];
  for (let i = 0; i <= 64; i++) raw.push(f(i / 64));
  const L = polyLen(raw);
  const n = Math.max(2, Math.ceil(L / step));
  const ph = rand() * 6.28, ph2 = rand() * 6.28;
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = f(t);
    const q = f(Math.min(1, t + 1e-3)), r = f(Math.max(0, t - 1e-3));
    let tx = q[0] - r[0], ty = q[1] - r[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const w = wob * (Math.sin(t * 5.1 + ph) * 0.6 + Math.sin(t * 13.7 + ph2) * 0.4);
    out.push([p[0] - ty * w, p[1] + tx * w]);
  }
  return out;
}

const lerp = (a, b, t) => a + (b - a) * t;
const line = (a, b) => (t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
// half ellipse centred at c, radii (rx along the arm, ry across), from -y to +y
// through the side given by sgn (+1: towards the fingers)
const arc = (c, rx, ry, sgn, a0 = -Math.PI / 2, a1 = Math.PI / 2) => (t) => {
  const a = lerp(a0, a1, t);
  return [c[0] + sgn * rx * Math.cos(a), c[1] + ry * Math.sin(a)];
};

export function buildDrawing(fp) {
  const rand = rng(11);
  const S = [];
  const add = (pts, o = {}) => S.push({ pts, w: o.w ?? 0.05, dark: o.dark ?? 0.85, speed: o.speed ?? 12, kind: o.kind ?? 'line' });
  const XW = -3.9; // where the drawn wrist meets the rising form
  const XC = -5.65; // the cuff's opening
  const XB = -8.3; // the cuff's far edge
  const W = (x) => fp.at(x); // [lo, hi] of the arm's outline
  const rimY = Math.max(-W(XC)[0], W(XC)[1]) + 0.55;
  const RX = 0.5;

  // 1. the wrist: two contours from the hand back to the cuff
  add(curve(line([XW, W(XW)[1]], [XC + 0.15, W(XC)[1]]), 0.12, 0.02, rand), { w: 0.055 });
  add(curve(line([XW, W(XW)[0]], [XC + 0.15, W(XC)[0]]), 0.12, 0.02, rand), { w: 0.055 });
  // 2. the cuff's opening: the near side of its rim, then the far side
  //    beside the wrist
  add(curve(arc([XC, 0], RX, rimY, 1, -Math.PI / 2, Math.PI / 2), 0.12, 0.02, rand), { w: 0.055 });
  const wl = W(XC);
  const aLo = Math.asin(Math.max(-1, wl[0] / rimY)), aHi = Math.asin(Math.min(1, wl[1] / rimY));
  add(curve((t) => { const a = lerp(Math.PI * 0.5, Math.PI - aHi, t); return [XC + RX * Math.cos(a), rimY * Math.sin(a)]; }, 0.1, 0.01, rand), { w: 0.045, dark: 0.75 });
  add(curve((t) => { const a = lerp(-Math.PI * 0.5, -Math.PI - aLo, t); return [XC + RX * Math.cos(a), rimY * Math.sin(a)]; }, 0.1, 0.01, rand), { w: 0.045, dark: 0.75 });
  // 3. the cuff's sides and far edge
  add(curve(line([XC, rimY], [XB, rimY + 0.12]), 0.14, 0.025, rand), { w: 0.055 });
  add(curve(line([XC, -rimY], [XB, -rimY - 0.12]), 0.14, 0.025, rand), { w: 0.055 });
  add(curve(arc([XB, 0], RX * 0.9, rimY + 0.12, 1), 0.14, 0.02, rand), { w: 0.05 });
  // 4. a stitched seam inside the rim, and two buttons
  add(curve(arc([XC - 0.42, 0], RX * 0.9, rimY - 0.12, 1, -Math.PI * 0.46, Math.PI * 0.46), 0.12, 0.01, rand), { w: 0.03, dark: 0.55 });
  for (const [bx, by] of [[-6.55, rimY - 0.75], [-7.45, rimY - 0.72]]) {
    add(curve((t) => [bx + 0.21 * Math.cos(t * 6.6), by + 0.21 * Math.sin(t * 6.6)], 0.06, 0.004, rand), { w: 0.038, speed: 7 });
  }
  // 5. the sleeve beyond the cuff, left unfinished
  add(curve(line([XB - 0.05, rimY + 0.14], [XB - 1.0, rimY + 0.3]), 0.14, 0.02, rand), { w: 0.045, dark: 0.6 });
  add(curve(line([XB - 0.05, -rimY - 0.14], [XB - 1.0, -rimY - 0.32]), 0.14, 0.02, rand), { w: 0.045, dark: 0.6 });
  add(curve((t) => [XB - 0.35 - 0.2 * t, lerp(-1.4, 0.6, t) + 0.15 * Math.sin(t * 3.0)], 0.12, 0.02, rand), { w: 0.035, dark: 0.5 });

  // 6. shading: the inside of the cuff beside the wrist (the darkest part)
  for (const sgn of [1, -1]) {
    const yIn = sgn > 0 ? wl[1] : wl[0];
    const yOut = sgn * rimY;
    for (let k = 0; k < 6; k++) {
      const t = (k + 0.5) / 6;
      const y = lerp(yIn, yOut, t);
      const xr = XC + RX * Math.sqrt(Math.max(0, 1 - (y / rimY) ** 2));
      add(curve(line([xr - 0.05, y], [XC - 0.32, y + sgn * 0.12]), 0.08, 0.004, rand), { w: 0.032, dark: 0.8, speed: 26, kind: 'hatch' });
    }
  }
  // 7. the little-finger side of the wrist, in diagonal strokes
  for (let k = 0; k < 9; k++) {
    const x = lerp(XW - 0.25, XC + 0.35, k / 8);
    const y0 = W(x)[0] + 0.06;
    add(curve(line([x + 0.22, y0], [x - 0.12, y0 + 0.95 - 0.35 * (k % 2)]), 0.08, 0.004, rand), { w: 0.03, dark: 0.7, speed: 26, kind: 'hatch' });
  }
  // 8. the cuff, shaded along its lower side, then cross-hatched in the corner
  for (let k = 0; k < 6; k++) {
    const y = -rimY + 0.16 + k * 0.2;
    const x0 = XC - 0.55 - 0.05 * k, x1 = XB + 0.2 + 0.35 * k;
    add(curve(line([x0, y], [x1, y - 0.05]), 0.12, 0.006, rand), { w: 0.03, dark: 0.65, speed: 28, kind: 'hatch' });
  }
  for (let k = 0; k < 5; k++) {
    const x = XB + 0.45 + k * 0.36;
    add(curve(line([x, -rimY + 0.08], [x + 0.32, -rimY + 0.9 - 0.1 * k]), 0.08, 0.004, rand), { w: 0.028, dark: 0.6, speed: 26, kind: 'hatch' });
  }
  // 9. a few strokes of shade under the rim on the thumb side
  for (let k = 0; k < 5; k++) {
    const y = rimY - 0.12 - k * 0.17;
    add(curve(line([XC - 0.5, y], [XC - 1.4 + 0.12 * k, y + 0.03]), 0.1, 0.004, rand), { w: 0.026, dark: 0.55, speed: 28, kind: 'hatch' });
  }
  return { strokes: S, XW, XC, XB, rimY };
}

// Timeline: strokes one after another, with the pencil lifted between them.
export function makeTimeline(strokes, opts = {}) {
  const travelSpeed = opts.travel ?? 34;
  const events = [];
  let t = opts.start ?? 0.4;
  let prev = null;
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    const p0 = s.pts[0];
    if (prev) {
      const d = Math.hypot(p0[0] - prev[0], p0[1] - prev[1]);
      const dur = 0.12 + d / travelSpeed;
      events.push({ type: 'move', from: prev, to: p0, t0: t, t1: t + dur });
      t += dur;
    }
    // cumulative arc length for constant speed along the stroke
    const cum = [0];
    for (let j = 1; j < s.pts.length; j++) cum.push(cum[j - 1] + Math.hypot(s.pts[j][0] - s.pts[j - 1][0], s.pts[j][1] - s.pts[j - 1][1]));
    const L = cum[cum.length - 1];
    const dur = L / s.speed + 0.04;
    s.cum = cum; s.len = L; s.t0 = t; s.t1 = t + dur;
    events.push({ type: 'draw', stroke: s, t0: t, t1: t + dur });
    t += dur;
    prev = s.pts[s.pts.length - 1];
  }
  return { events, end: t, first: strokes[0].pts[0], last: prev };
}

const ease = (k) => k * k * (3 - 2 * k);

// Where the pencil tip is at time T, and how high it is lifted.
export function sampleTimeline(tl, T) {
  const ev = tl.events;
  if (T <= ev[0].t0) return { p: tl.first, lift: 0.5, drawing: false };
  for (const e of ev) {
    if (T > e.t1) continue;
    const k = (T - e.t0) / (e.t1 - e.t0);
    if (e.type === 'move') {
      const kk = ease(k);
      return { p: [lerp(e.from[0], e.to[0], kk), lerp(e.from[1], e.to[1], kk)], lift: 0.5 * Math.sin(Math.PI * k) ** 0.6, drawing: false };
    }
    const s = e.stroke;
    const target = Math.min(1, k * 1.04) * s.len;
    let j = 1;
    while (j < s.cum.length - 1 && s.cum[j] < target) j++;
    const a = s.pts[j - 1], b = s.pts[j];
    const seg = s.cum[j] - s.cum[j - 1] || 1;
    const u = Math.min(1, Math.max(0, (target - s.cum[j - 1]) / seg));
    return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], lift: 0, drawing: true };
  }
  return { p: tl.last, lift: 0, drawing: false };
}

// Ribbon geometry for the strokes: per vertex the time the pencil passes it,
// which side of the stroke it is on, its arc length and its weight.
export function strokeRibbons(strokes) {
  const pos = [], side = [], time = [], arcl = [], weight = [], index = [];
  for (const s of strokes) {
    const base = pos.length / 3;
    const n = s.pts.length;
    for (let j = 0; j < n; j++) {
      const p = s.pts[j];
      const q = s.pts[Math.min(n - 1, j + 1)], r = s.pts[Math.max(0, j - 1)];
      let tx = q[0] - r[0], ty = q[1] - r[1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const u = s.cum[j] / (s.len || 1);
      // pressure: light at the start, heavier through the middle, lifting off
      const press = Math.min(1, u * 6 + 0.25) * Math.min(1, (1 - u) * 4 + 0.15);
      const hw = s.w * (0.55 + 0.45 * press) * 0.5 + 0.012;
      const tt = s.t0 + (s.t1 - s.t0 - 0.04) * u / 1.04;
      for (const sg of [-1, 1]) {
        pos.push(p[0] - ty * hw * sg, p[1] + tx * hw * sg, 0.004);
        side.push(sg);
        time.push(tt);
        arcl.push(s.cum[j]);
        weight.push(s.dark * (0.6 + 0.4 * press));
      }
      if (j < n - 1) {
        const a = base + 2 * j;
        index.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
    }
  }
  return { pos, side, time, arcl, weight, index };
}
