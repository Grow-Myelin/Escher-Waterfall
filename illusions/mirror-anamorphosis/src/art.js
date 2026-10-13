// The two drawings, each as an ink plate (black on white) and a colour wash,
// like a hand-coloured engraving.
//
//  - The picture: a masonry Penrose triangle standing on a patch of grass,
//    drawn on the eye's picture plane (tangent coordinates u, v). It is never
//    shown directly: it is mapped onto the sheet through the mirror.
//  - The sheet: what is drawn straight onto the paper around it, an engraved
//    bird's-eye view of an island in a lake, with shores, hills and a town.
//    The mapped walls of the triangle become the ruined walls of a fortress
//    on the island, and the cylinder stands where its round tower would be.

import { PIC, SHEET, TRI_M, iso, tribarRegions, trace } from './geometry.js';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h, fill = '#fff') {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = fill;
  g.fillRect(0, 0, w, h);
  return [c, g];
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

// ======================================================================= picture
export const PICTURE = (() => {
  const H = 2048;
  const k = H / (PIC.v1 - PIC.v0); // pixels per tangent unit
  const W = Math.round((PIC.u1 - PIC.u0) * k);
  return { W, H, k };
})();

// tribar 2D (iso) coordinates -> tangent (u, v)
const TRI = (() => {
  const reg = tribarRegions(TRI_M);
  const pts = [...reg.light.poly, ...reg.mid.poly, ...reg.dark.poly];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const width = Math.max(...xs) - Math.min(...xs);
  const sc = 0.088 / width;
  const vc = -0.0255;
  return { reg, cx, cy, sc, vc, bottom: (Math.min(...ys) - cy) * sc + vc, top: (Math.max(...ys) - cy) * sc + vc, half: (width / 2) * sc };
})();

export function triToUV([x, y]) {
  return [(x - TRI.cx) * TRI.sc, (y - TRI.cy) * TRI.sc + TRI.vc];
}
// key points of the triangle in (u, v): its six outer corners
export function triangleCorners() {
  const m = TRI_M;
  const P3 = [[0, 0, 0], [m + 1, 0, 0], [m + 1, 0, 1], [m + 1, m + 1, 1], [m + 1, m + 1, 0], [0, 1, 0]];
  return P3.map((p) => triToUV(iso(p)));
}

// The part of the picture that is drawn: the triangle with a margin of grass,
// and the ground below it down to the foot of the cylinder. Outside this
// window the mirror simply shows the island drawn round it.
export function pictureWindow() {
  const c = triangleCorners();
  const cu = c.reduce((s2, p) => s2 + p[0], 0) / c.length, cv = c.reduce((s2, p) => s2 + p[1], 0) / c.length;
  const pts = c.map(([x, y]) => [cu + (x - cu) * 1.32, cv + (y - cv) * 1.32]);
  pts.sort((p, q) => Math.atan2(p[1] - cv, p[0] - cu) - Math.atan2(q[1] - cv, q[0] - cu));
  const low = [...pts].sort((p, q) => p[1] - q[1]).slice(0, 2);
  const foot = PIC.v0 - 0.01;
  const out = [];
  for (const p of pts) {
    if (p === low[0] || p === low[1]) {
      // the skirt down to the foot: [higher-left low point] -> foot -> foot -> [right low point]
      if (!out.skirt) {
        const [l, r] = low[0][0] < low[1][0] ? [low[0], low[1]] : [low[1], low[0]];
        out.push(l, [l[0], foot], [r[0], foot], r);
        out.skirt = true;
      }
      continue;
    }
    out.push(p);
  }
  return out.map((p) => [p[0], p[1]]);
}

export function drawPicture() {
  const { W, H, k } = PICTURE;
  const [inkC, ink] = canvas(W, H);
  const [washC, wash] = canvas(W, H, 'rgba(0,0,0,0)');
  const win = new Path2D();
  pictureWindow().forEach(([uu, vv], i) => {
    const x = (uu - PIC.u0) * k, y = (PIC.v1 - vv) * k;
    i ? win.lineTo(x, y) : win.moveTo(x, y);
  });
  win.closePath();
  wash.save(); wash.clip(win);
  ink.save(); ink.clip(win);
  // canvas px <- tribar coords
  const toPx = ([x, y]) => {
    const [u, v] = triToUV([x, y]);
    return [(u - PIC.u0) * k, (PIC.v1 - v) * k];
  };
  const unit = TRI.sc * k; // pixels per bar width
  const P = (p3) => toPx(iso(p3));
  const path = (g, pts) => {
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  };
  const rnd = rng(11);

  // ---- the ground: the island's grass wash with a sparse stipple, so that on
  //      the sheet the mirror's region melts into the island round it
  wash.fillStyle = '#dcdcb0';
  wash.fillRect(0, 0, W, H);
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W, y = rnd() * H;
    ink.fillStyle = 'rgba(0,0,0,0.55)';
    ink.beginPath(); ink.arc(x, y, 1.3 + rnd() * 1.1, 0, Math.PI * 2); ink.fill();
  }
  // ---- grass beneath the triangle (in the mirror: the ground it stands on;
  //      on the sheet: the courtyard inside the walls)
  {
    const [bx, by] = toPx([TRI.cx, 0]);
    const yb = (PIC.v1 - TRI.bottom) * k;
    for (let i = 0; i < 900; i++) {
      const t = rnd();
      const x = W * 0.08 + rnd() * W * 0.84;
      const y = yb + 10 + Math.pow(rnd(), 0.8) * (H - yb - 40);
      const fall = 1 - Math.abs(x - W / 2) / (W * 0.46);
      if (rnd() > fall * 0.9) continue;
      ink.fillStyle = 'rgba(0,0,0,0.75)';
      if (t < 0.7) { ink.beginPath(); ink.arc(x, y, 1.6 + rnd() * 1.4, 0, Math.PI * 2); ink.fill(); }
      else {
        ink.strokeStyle = 'rgba(0,0,0,0.8)';
        ink.lineWidth = 2;
        ink.beginPath();
        for (let j = -2; j <= 2; j++) { ink.moveTo(x + j * 4, y); ink.lineTo(x + j * 6 + (rnd() - 0.5) * 4, y - 14 - rnd() * 10); }
        ink.stroke();
      }
    }
    void bx; void by;
    const grd = wash.createLinearGradient(0, yb, 0, H);
    grd.addColorStop(0, 'rgba(176,186,128,0.0)');
    grd.addColorStop(0.15, 'rgba(176,186,128,0.55)');
    grd.addColorStop(1, 'rgba(160,172,112,0.75)');
    wash.fillStyle = grd;
    wash.beginPath();
    wash.ellipse(W / 2, yb + (H - yb) * 0.55, W * 0.47, (H - yb) * 0.75, 0, 0, Math.PI * 2);
    wash.fill();
  }

  // ---- the three shade regions, face by face
  const tones = {
    light: { wash: [236, 226, 204], hatch: 0, cross: 0 },
    mid: { wash: [204, 184, 146], hatch: 0.11, cross: 0 },
    dark: { wash: [140, 122, 98], hatch: 0.075, cross: 0.1 },
  };
  for (const name of ['light', 'mid', 'dark']) {
    const reg = TRI.reg[name];
    const tone = tones[name];
    const poly = reg.poly.map(toPx);
    for (const f of reg.faces) {
      const corners = [f.o, add(f.o, f.a), add(add(f.o, f.a), f.b), add(f.o, f.b)].map(P);
      for (const g of [wash, ink]) {
        g.save();
        path(g, poly); g.clip();
        path(g, corners); g.clip();
      }
      const la = Math.hypot(...f.a), lb = Math.hypot(...f.b);
      const ua = mul(f.a, 1 / la), ub = mul(f.b, 1 / lb);
      const at = (s, t) => P(add(add(f.o, mul(ua, s)), mul(ub, t)));
      // which edge runs along the bar
      const along = la >= lb ? 'a' : 'b';
      const vertical = f.a[1] !== 0 || f.b[1] !== 0; // a side face (contains the y axis)
      // base wash with per-block variation
      wash.fillStyle = `rgb(${tone.wash.join(',')})`;
      wash.fillRect(0, 0, W, H);
      // masonry: courses of 0.5, blocks of 1.0, staggered
      const blocks = [];
      if (vertical) {
        const yAxisIsA = f.a[1] !== 0;
        const ly = yAxisIsA ? la : lb, lh = yAxisIsA ? lb : la;
        const y0 = yAxisIsA ? f.o[1] : f.o[1];
        for (let c = 0; c * 0.5 < ly - 1e-6; c++) {
          const off = ((Math.round((y0 + c * 0.5) / 0.5)) % 2) * 0.5;
          for (let h = -off; h < lh; h += 1) {
            const h0 = Math.max(0, h), h1 = Math.min(lh, h + 1);
            blocks.push(yAxisIsA ? [c * 0.5, h0, c * 0.5 + 0.5, h1] : [h0, c * 0.5, h1, c * 0.5 + 0.5]);
          }
        }
      } else {
        const lAl = along === 'a' ? la : lb, lAc = along === 'a' ? lb : la;
        for (let row = 0; row * 0.5 < lAc - 1e-6; row++) {
          const off = (row % 2) * 0.5;
          for (let h = -off; h < lAl; h += 1) {
            const h0 = Math.max(0, h), h1 = Math.min(lAl, h + 1);
            blocks.push(along === 'a' ? [h0, row * 0.5, h1, row * 0.5 + 0.5] : [row * 0.5, h0, row * 0.5 + 0.5, h1]);
          }
        }
      }
      for (const [s0, t0, s1, t1] of blocks) {
        const q = [at(s0, t0), at(s1, t0), at(s1, t1), at(s0, t1)];
        const j = (rnd() - 0.5) * 22;
        wash.fillStyle = `rgb(${tone.wash.map((c) => Math.round(c + j)).join(',')})`;
        path(wash, q); wash.fill();
        ink.lineWidth = 0.022 * unit;
        ink.strokeStyle = 'rgba(0,0,0,0.85)';
        path(ink, q); ink.stroke();
        // weathering: a few pits in each block
        for (let n = 0; n < 3; n++) {
          if (rnd() < 0.5) continue;
          const p = at(s0 + (s1 - s0) * rnd(), t0 + (t1 - t0) * rnd());
          ink.fillStyle = 'rgba(0,0,0,0.6)';
          ink.beginPath(); ink.arc(p[0], p[1], 0.008 * unit + rnd() * 0.01 * unit, 0, Math.PI * 2); ink.fill();
        }
      }
      // engraved hatching along the bar
      const hatch = (spacing, dir, width, jitter) => {
        if (!spacing) return;
        ink.strokeStyle = 'rgba(0,0,0,0.9)';
        ink.lineWidth = width * unit;
        const L1 = dir === 'a' ? la : lb, L2 = dir === 'a' ? lb : la;
        ink.beginPath();
        for (let t = spacing / 2; t < L2; t += spacing) {
          const tt = t + (rnd() - 0.5) * jitter;
          const a0 = dir === 'a' ? at(0, tt) : at(tt, 0);
          const a1 = dir === 'a' ? at(L1, tt) : at(tt, L1);
          ink.moveTo(a0[0], a0[1]); ink.lineTo(a1[0], a1[1]);
        }
        ink.stroke();
      };
      hatch(tone.hatch, along, 0.018, 0.01);
      hatch(tone.cross, along === 'a' ? 'b' : 'a', 0.014, 0.01);
      for (const g of [wash, ink]) g.restore();
    }
  }
  // ---- outlines of the three regions
  ink.lineJoin = 'round';
  for (const name of ['light', 'mid', 'dark']) {
    ink.lineWidth = 0.045 * unit;
    ink.strokeStyle = '#000';
    path(ink, TRI.reg[name].poly.map(toPx));
    ink.stroke();
  }
  wash.restore();
  ink.restore();
  return { ink: inkC, wash: washC };
}

// ======================================================================= sheet
export const SHEETPX = (() => {
  const W = 2048;
  const k = W / (SHEET.x1 - SHEET.x0);
  const H = Math.round((SHEET.z1 - SHEET.z0) * k);
  return { W, H, k };
})();

// The region of the sheet the mirror shows from the eye point (the image of
// the picture rectangle), as a radius for each direction round the cylinder.
export function coreRadius(bins = 360) {
  const r = new Float32Array(bins);
  const poly = pictureWindow();
  const N = 400;
  for (let e = 0; e < poly.length; e++) {
    const p = poly[e], q = poly[(e + 1) % poly.length];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const h = trace(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t);
      if (!h || !h.ground) continue;
      const a = Math.atan2(h.ground.x, h.ground.z);
      const b = ((Math.floor(((a + Math.PI) / (2 * Math.PI)) * bins) % bins) + bins) % bins;
      r[b] = Math.max(r[b], Math.hypot(h.ground.x, h.ground.z));
    }
  }
  return r;
}

export function islandShape() {
  const bins = 360;
  const core = coreRadius(bins);
  const floor = new Float32Array(bins);
  for (let i = 0; i < bins; i++) {
    let m = 0;
    for (let j = -5; j <= 5; j++) m = Math.max(m, core[(i + j + bins) % bins]);
    floor[i] = Math.max(m + 0.55, 2.9);
  }
  const smooth = (src, w) => {
    const o = new Float32Array(bins);
    for (let i = 0; i < bins; i++) {
      let s2 = 0, n = 0;
      for (let j = -w; j <= w; j++) { const k2 = 1 - Math.abs(j) / (w + 1); s2 += src[(i + j + bins) % bins] * k2; n += k2; }
      o[i] = s2 / n;
    }
    return o;
  };
  // a smooth curve that never dips inside the floor: smooth, push back out, repeat
  let env = Float32Array.from(floor);
  for (let pass = 0; pass < 8; pass++) {
    env = smooth(env, 14);
    for (let i = 0; i < bins; i++) env[i] = Math.max(env[i], floor[i]);
  }
  env = smooth(env, 6);
  const out = new Float32Array(bins);
  for (let i = 0; i < bins; i++) {
    const a = (i / bins) * Math.PI * 2;
    const wob = 0.1 * Math.sin(a * 5 + 0.7) + 0.07 * Math.sin(a * 11 + 1.3) + 0.04 * Math.sin(a * 23 + 0.4);
    out[i] = Math.max(env[i] + 0.05 + wob, floor[i] - 0.2);
  }
  const radius = (x, z) => {
    const a = Math.atan2(x, z);
    const f = ((a + Math.PI) / (2 * Math.PI)) * bins;
    const i0 = Math.floor(f) % bins, i1 = (i0 + 1) % bins, t = f - Math.floor(f);
    return out[i0] * (1 - t) + out[i1] * t;
  };
  const pointAt = (a, dr = 0) => {
    const f = ((a + Math.PI) / (2 * Math.PI)) * bins;
    const i0 = Math.floor(f) % bins, i1 = (i0 + 1) % bins, t = f - Math.floor(f);
    const r = out[i0] * (1 - t) + out[i1] * t + dr;
    return [Math.sin(a) * r, Math.cos(a) * r];
  };
  return { radius, pointAt, core };
}

export function drawSheet() {
  const { W, H, k } = SHEETPX;
  const [inkC, ink] = canvas(W, H);
  const [washC, wash] = canvas(W, H);
  const px = (x, z) => [(x - SHEET.x0) * k, (z - SHEET.z0) * k];
  const rnd = rng(5);
  const island = islandShape();
  const inIsland = (x, z, m = 0) => Math.hypot(x, z) < island.radius(x, z) + m;

  // ---- far shores: the land along the back edge and the two front corners
  const shore = (pts) => {
    const p = new Path2D();
    pts.forEach(([x, z], i) => { const q = px(x, z); i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); });
    p.closePath();
    return p;
  };
  const backPts = [[SHEET.x0 - 1, SHEET.z0 - 1]];
  for (let i = 0; i <= 60; i++) {
    const x = SHEET.x0 + (SHEET.x1 - SHEET.x0) * (i / 60);
    const z = -3.7 + 0.35 * Math.sin(x * 0.9 + 0.5) + 0.22 * Math.sin(x * 2.3) - 0.5 * Math.exp(-((x - 4.4) ** 2) / 1.5) + 0.3 * Math.exp(-((x + 3.8) ** 2) / 2);
    backPts.push([x, z]);
  }
  backPts.push([SHEET.x1 + 1, SHEET.z0 - 1]);
  const back = shore(backPts);
  const leftPts = [[SHEET.x0 - 1, 2.4]];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    leftPts.push([SHEET.x0 + 0.2 + 2.2 * Math.sin(t * Math.PI * 0.5) + 0.12 * Math.sin(t * 19), 2.6 + t * 7 + 0.1 * Math.sin(t * 11)]);
  }
  leftPts.push([SHEET.x0 - 1, SHEET.z1 + 1]);
  const left = shore(leftPts);
  const rightPts = [[SHEET.x1 + 1, 4.8]];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    rightPts.push([SHEET.x1 - 0.1 - 1.7 * Math.sin(t * Math.PI * 0.5) - 0.1 * Math.sin(t * 17), 5.0 + t * 5]);
  }
  rightPts.push([SHEET.x1 + 1, SHEET.z1 + 1]);
  const right = shore(rightPts);
  const islandPath = (dr = 0) => {
    const p = new Path2D();
    for (let i = 0; i <= 360; i++) {
      const a = (i / 360) * Math.PI * 2 - Math.PI;
      const [x, z] = island.pointAt(a, dr);
      const q = px(x, z);
      i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]);
    }
    p.closePath();
    return p;
  };

  // ---- washes
  wash.fillStyle = '#c4d3cf'; // the lake
  wash.fillRect(0, 0, W, H);
  wash.fillStyle = '#d7d5a8';
  for (const p of [back, left, right]) wash.fill(p);
  wash.fillStyle = '#e6dcb4'; // sand round the island
  wash.fill(islandPath(0));
  wash.fillStyle = '#dcdcb0'; // island grass
  wash.fill(islandPath(-0.22));

  // ---- the lake: ruled water lines, with lines following each shore
  ink.save();
  const lake = new Path2D();
  lake.rect(0, 0, W, H);
  lake.addPath(islandPath(0.02));
  lake.addPath(back); lake.addPath(left); lake.addPath(right);
  ink.clip(lake, 'evenodd');
  ink.strokeStyle = 'rgba(0,0,0,0.7)';
  ink.lineWidth = 1.6;
  for (let z = SHEET.z0; z < SHEET.z1; z += 0.085) {
    ink.beginPath();
    let x = SHEET.x0;
    while (x < SHEET.x1) {
      const len = 0.4 + rnd() * 2.2;
      const gap = rnd() < 0.25 ? 0.15 + rnd() * 0.5 : 0;
      const a = px(x, z), b = px(Math.min(SHEET.x1, x + len), z + (rnd() - 0.5) * 0.004);
      ink.moveTo(a[0], a[1]); ink.lineTo(b[0], b[1]);
      x += len + gap;
    }
    ink.stroke();
  }
  // contour lines round the island
  for (let n = 1; n <= 7; n++) {
    ink.lineWidth = 2.2 - n * 0.18;
    ink.setLineDash([40 + n * 25, 8 + n * 6]);
    ink.stroke(islandPath(0.07 * n + 0.012 * n * n));
  }
  ink.setLineDash([]);
  ink.restore();

  // ---- shores: a firm line, then stipple
  ink.lineWidth = 3;
  ink.strokeStyle = '#000';
  ink.stroke(islandPath(0));
  for (const p of [back, left, right]) ink.stroke(p);
  ink.fillStyle = 'rgba(0,0,0,0.75)';
  for (let i = 0; i < 2600; i++) {
    const a = rnd() * Math.PI * 2 - Math.PI;
    const d = -Math.pow(rnd(), 1.7) * 0.32;
    const [x, z] = island.pointAt(a, d);
    const q = px(x, z);
    ink.beginPath(); ink.arc(q[0], q[1], 1.2 + rnd() * 1.1, 0, Math.PI * 2); ink.fill();
  }

  // ---- the island's ground outside the mirror's view: grass, rocks, trees
  const coreR = (x, z) => {
    const a = Math.atan2(x, z);
    const b = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 360) % 360;
    let m = 0;
    for (let j = -3; j <= 3; j++) m = Math.max(m, island.core[(b + j + 360) % 360]);
    return m;
  };
  const free = (x, z, pad = 0.15) => {
    const r = Math.hypot(x, z);
    return r > 1.15 && inIsland(x, z, -0.35) && r > coreR(x, z) + pad;
  };
  for (let i = 0; i < 1500; i++) {
    const x = (rnd() - 0.5) * 12, z = -3 + rnd() * 12;
    if (!free(x, z)) continue;
    const q = px(x, z);
    ink.fillStyle = 'rgba(0,0,0,0.7)';
    ink.beginPath(); ink.arc(q[0], q[1], 1.2 + rnd(), 0, Math.PI * 2); ink.fill();
  }
  const tree = (x, z, r, kind) => {
    const q = px(x, z), rr = r * k;
    // shadow, cast away from the light (towards +x, −z)
    wash.fillStyle = 'rgba(80,90,60,0.35)';
    wash.beginPath(); wash.ellipse(q[0] + rr * 0.6, q[1] - rr * 0.35, rr * 1.05, rr * 0.8, -0.5, 0, Math.PI * 2); wash.fill();
    ink.save();
    ink.beginPath(); ink.ellipse(q[0] + rr * 0.6, q[1] - rr * 0.35, rr * 1.05, rr * 0.8, -0.5, 0, Math.PI * 2); ink.clip();
    ink.strokeStyle = 'rgba(0,0,0,0.75)'; ink.lineWidth = 1.4;
    ink.beginPath();
    for (let t = -rr * 2; t < rr * 2; t += 5) { ink.moveTo(q[0] + t - rr, q[1] - rr * 2); ink.lineTo(q[0] + t + rr * 2, q[1] + rr); }
    ink.stroke();
    ink.restore();
    wash.fillStyle = kind ? '#8b9a68' : '#9aa775';
    wash.beginPath();
    const lobes = 9;
    for (let i = 0; i <= lobes * 4; i++) {
      const a = (i / (lobes * 4)) * Math.PI * 2;
      const rad = rr * (0.86 + 0.14 * Math.abs(Math.sin(a * lobes / 2)));
      const pp = [q[0] + Math.cos(a) * rad, q[1] + Math.sin(a) * rad];
      i ? wash.lineTo(pp[0], pp[1]) : wash.moveTo(pp[0], pp[1]);
    }
    wash.fill();
    ink.lineWidth = 2;
    ink.strokeStyle = '#000';
    ink.beginPath();
    for (let i = 0; i <= lobes * 4; i++) {
      const a = (i / (lobes * 4)) * Math.PI * 2;
      const rad = rr * (0.86 + 0.14 * Math.abs(Math.sin(a * lobes / 2)));
      const pp = [q[0] + Math.cos(a) * rad, q[1] + Math.sin(a) * rad];
      i ? ink.lineTo(pp[0], pp[1]) : ink.moveTo(pp[0], pp[1]);
    }
    ink.stroke();
    // shading on the side away from the light
    ink.save();
    ink.beginPath(); ink.arc(q[0], q[1], rr * 0.95, 0, Math.PI * 2); ink.clip();
    ink.lineWidth = 1.3;
    ink.beginPath();
    for (let t = 0; t < rr * 1.6; t += 4.5) {
      const ox = q[0] + rr * 0.95 - t * 0.45, oy = q[1] - rr * 0.95 + t;
      ink.moveTo(ox - rr * 0.3, oy - rr * 0.6); ink.lineTo(ox + rr * 0.6, oy + rr * 0.3);
    }
    ink.stroke();
    ink.restore();
  };
  // trees on the island behind and beside the tower
  for (let i = 0, n = 0; i < 400 && n < 16; i++) {
    const a = rnd() * Math.PI * 2 - Math.PI;
    const r = 1.3 + rnd() * 1.6;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const rad = 0.18 + rnd() * 0.12;
    if (!free(x, z, rad + 0.12) || !inIsland(x, z, -rad - 0.25)) continue;
    tree(x, z, rad, n % 2);
    n++;
  }
  // ---- the foundations of the round tower, where the cylinder stands
  {
    const c = px(0, 0);
    const r1 = 0.97 * k, r0 = 0.62 * k;
    wash.fillStyle = '#d9cdb2';
    wash.beginPath(); wash.arc(c[0], c[1], r1, 0, Math.PI * 2); wash.fill();
    wash.fillStyle = '#c7c59a';
    wash.beginPath(); wash.arc(c[0], c[1], r0, 0, Math.PI * 2); wash.fill();
    ink.fillStyle = '#fff';
    ink.beginPath(); ink.arc(c[0], c[1], r1, 0, Math.PI * 2); ink.fill();
    ink.strokeStyle = '#000';
    ink.lineWidth = 3.2;
    ink.beginPath(); ink.arc(c[0], c[1], r1, 0, Math.PI * 2); ink.stroke();
    ink.lineWidth = 2.2;
    ink.beginPath(); ink.arc(c[0], c[1], r0, 0, Math.PI * 2); ink.stroke();
    ink.lineWidth = 1.4;
    ink.beginPath(); ink.arc(c[0], c[1], (r0 + r1) / 2, 0, Math.PI * 2); ink.stroke();
    // block joints, staggered between the two courses
    ink.beginPath();
    for (let i = 0; i < 28; i++) {
      const a0 = (i / 28) * Math.PI * 2, a1 = a0 + Math.PI / 28;
      const m = (r0 + r1) / 2;
      ink.moveTo(c[0] + Math.cos(a0) * r0, c[1] + Math.sin(a0) * r0); ink.lineTo(c[0] + Math.cos(a0) * m, c[1] + Math.sin(a0) * m);
      ink.moveTo(c[0] + Math.cos(a1) * m, c[1] + Math.sin(a1) * m); ink.lineTo(c[0] + Math.cos(a1) * r1, c[1] + Math.sin(a1) * r1);
    }
    ink.stroke();
    // rubble inside, in shade on the side away from the light
    ink.save();
    ink.beginPath(); ink.arc(c[0], c[1], r0 - 2, 0, Math.PI * 2); ink.clip();
    ink.fillStyle = 'rgba(0,0,0,0.7)';
    for (let i = 0; i < 160; i++) {
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * r0;
      ink.beginPath(); ink.arc(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, 1.5 + rnd() * 2.5, 0, Math.PI * 2); ink.fill();
    }
    ink.lineWidth = 1.3;
    ink.beginPath();
    for (let t = -r0; t < r0; t += 6) { ink.moveTo(c[0] + t, c[1] - r0); ink.lineTo(c[0] + t + r0, c[1]); }
    ink.stroke();
    ink.restore();
  }

  // ---- the far shore: hills with hatching, a small town, woods
  ink.save();
  ink.clip(back);
  for (let row = 0; row < 4; row++) {
    const zc = SHEET.z0 + 0.5 + row * 0.55;
    for (let hx = SHEET.x0 - 0.5 + (row % 2) * 0.9; hx < SHEET.x1 + 0.5; hx += 1.6 + rnd() * 0.8) {
      const w = 0.9 + rnd() * 0.7, h = 0.35 + rnd() * 0.2;
      const c = px(hx, zc);
      wash.fillStyle = row % 2 ? '#c8c491' : '#bfbf8c';
      wash.beginPath(); wash.ellipse(c[0], c[1], w * k, h * k, 0, Math.PI, 0); wash.fill();
      ink.fillStyle = '#fff';
      ink.beginPath(); ink.ellipse(c[0], c[1], w * k, h * k, 0, Math.PI, 0); ink.fill();
      ink.lineWidth = 2;
      ink.strokeStyle = '#000';
      ink.beginPath(); ink.ellipse(c[0], c[1], w * k, h * k, 0, Math.PI, 0); ink.stroke();
      ink.save();
      ink.beginPath(); ink.ellipse(c[0], c[1], w * k, h * k, 0, Math.PI, 0); ink.clip();
      ink.lineWidth = 1.2;
      ink.beginPath();
      for (let t = 0; t < w * k; t += 5) {
        ink.moveTo(c[0] + t, c[1] - h * k); ink.lineTo(c[0] + t - h * k * 0.6, c[1]);
      }
      ink.stroke();
      ink.restore();
    }
  }
  ink.restore();
  // the town on the far shore, left of centre
  const house = (x, z, w, h, roof) => {
    const q = px(x, z);
    const ww = w * k, hh = h * k;
    wash.fillStyle = '#e9e1cc'; wash.fillRect(q[0] - ww / 2, q[1] - hh, ww, hh);
    wash.fillStyle = roof; wash.beginPath(); wash.moveTo(q[0] - ww / 2 - 3, q[1] - hh); wash.lineTo(q[0], q[1] - hh - ww * 0.55); wash.lineTo(q[0] + ww / 2 + 3, q[1] - hh); wash.fill();
    ink.fillStyle = '#fff'; ink.fillRect(q[0] - ww / 2, q[1] - hh - ww * 0.55, ww, hh + ww * 0.55);
    ink.lineWidth = 1.8; ink.strokeStyle = '#000';
    ink.strokeRect(q[0] - ww / 2, q[1] - hh, ww, hh);
    ink.beginPath(); ink.moveTo(q[0] - ww / 2 - 3, q[1] - hh); ink.lineTo(q[0], q[1] - hh - ww * 0.55); ink.lineTo(q[0] + ww / 2 + 3, q[1] - hh); ink.closePath(); ink.stroke();
    ink.lineWidth = 1.1;
    ink.beginPath();
    for (let t = 4; t < ww * 0.5; t += 4) { ink.moveTo(q[0] + t, q[1] - hh - (ww * 0.55) * (1 - t / (ww * 0.5))); ink.lineTo(q[0] + t, q[1] - hh); }
    ink.stroke();
    ink.fillStyle = '#000'; ink.fillRect(q[0] - ww * 0.12, q[1] - hh * 0.45, ww * 0.24, hh * 0.45);
  };
  const town = [];
  for (let i = 0; i < 14; i++) town.push([-3.6 + (rnd() - 0.5) * 2.8, -4.45 + (rnd() - 0.5) * 0.6]);
  town.sort((a, b) => a[1] - b[1]);
  for (const [x, z] of town) house(x, z, 0.32 + rnd() * 0.16, 0.22 + rnd() * 0.12, rnd() < 0.5 ? '#b56a4f' : '#a5584a');
  // a church tower
  {
    const q = px(-3.0, -4.25);
    wash.fillStyle = '#e9e1cc'; wash.fillRect(q[0] - 14, q[1] - 120, 28, 120);
    ink.fillStyle = '#fff'; ink.fillRect(q[0] - 14, q[1] - 150, 28, 150);
    ink.lineWidth = 2; ink.strokeRect(q[0] - 14, q[1] - 120, 28, 120);
    ink.beginPath(); ink.moveTo(q[0] - 17, q[1] - 120); ink.lineTo(q[0], q[1] - 175); ink.lineTo(q[0] + 17, q[1] - 120); ink.closePath();
    wash.fillStyle = '#7b8c8c'; wash.beginPath(); wash.moveTo(q[0] - 17, q[1] - 120); wash.lineTo(q[0], q[1] - 175); wash.lineTo(q[0] + 17, q[1] - 120); wash.fill();
    ink.stroke();
    ink.fillStyle = '#000'; ink.fillRect(q[0] - 4, q[1] - 100, 8, 14);
  }
  // woods on the far shore and in the front corners
  const woods = [];
  for (let i = 0; i < 26; i++) woods.push([1.2 + rnd() * 4.8, -4.95 + rnd() * 1.0]);
  for (let i = 0; i < 12; i++) woods.push([SHEET.x0 + 0.3 + rnd() * 1.4, 4.0 + rnd() * 4.6]);
  for (let i = 0; i < 9; i++) woods.push([SHEET.x1 - 0.3 - rnd() * 1.1, 6.6 + rnd() * 2.2]);
  woods.sort((a, b) => a[1] - b[1]);
  for (const [x, z] of woods) {
    const inside = [back, left, right].some((p) => { const q = px(x, z); return ink.isPointInPath(p, q[0], q[1]); });
    if (inside) tree(x, z, 0.16 + rnd() * 0.1, rnd() < 0.5 ? 1 : 0);
  }
  // reeds along the front shores
  ink.lineWidth = 1.4;
  ink.strokeStyle = 'rgba(0,0,0,0.8)';
  for (let i = 0; i < 160; i++) {
    const side = i % 2;
    const t = rnd();
    const x = side ? SHEET.x0 + 0.2 + 2.2 * Math.sin(t * Math.PI * 0.5) + 0.1 : SHEET.x1 - 0.1 - 1.7 * Math.sin(t * Math.PI * 0.5) - 0.1;
    const z = side ? 2.6 + t * 7 : 5.0 + t * 5;
    const q = px(x + (side ? 0.12 : -0.12) * rnd(), z);
    ink.beginPath();
    for (let j = 0; j < 3; j++) { ink.moveTo(q[0] + j * 3, q[1]); ink.lineTo(q[0] + j * 3 + (rnd() - 0.5) * 8, q[1] - 12 - rnd() * 10); }
    ink.stroke();
  }

  // ---- a boat with a sail, and birds
  {
    const q = px(-3.9, 5.6);
    wash.fillStyle = '#9a7a55';
    wash.beginPath(); wash.ellipse(q[0], q[1], 46, 12, -0.15, 0, Math.PI * 2); wash.fill();
    ink.fillStyle = '#fff'; ink.beginPath(); ink.ellipse(q[0], q[1], 46, 12, -0.15, 0, Math.PI * 2); ink.fill();
    ink.lineWidth = 2.2; ink.strokeStyle = '#000'; ink.stroke();
    ink.beginPath(); ink.moveTo(q[0] - 2, q[1]); ink.lineTo(q[0] - 2, q[1] - 70); ink.stroke();
    wash.fillStyle = '#efe6d2';
    const sail = () => { const p = new Path2D(); p.moveTo(q[0], q[1] - 66); p.quadraticCurveTo(q[0] + 30, q[1] - 40, q[0] + 4, q[1] - 6); p.closePath(); return p; };
    wash.fill(sail()); ink.fillStyle = '#fff'; ink.fill(sail()); ink.stroke(sail());
    ink.lineWidth = 1.2;
    for (let t = 6; t < 60; t += 6) { ink.beginPath(); ink.moveTo(q[0] + 2, q[1] - 66 + t); ink.lineTo(q[0] + 8 + t * 0.2, q[1] - 66 + t); ink.stroke(); }
    // its wake
    ink.lineWidth = 1.3;
    for (let j = 1; j < 5; j++) { ink.beginPath(); ink.moveTo(q[0] + 46 + j * 12, q[1] - 6 + j * 3); ink.lineTo(q[0] + 70 + j * 22, q[1] - 2 + j * 4); ink.stroke(); }
  }
  ink.lineWidth = 1.8;
  for (const [x, z, s] of [[2.9, -2.9, 1], [3.4, -3.1, 0.8], [3.1, -2.6, 0.7], [-5.1, -2.4, 0.9], [4.9, 2.9, 0.8]]) {
    const q = px(x, z);
    ink.beginPath();
    ink.moveTo(q[0] - 14 * s, q[1] - 2); ink.quadraticCurveTo(q[0] - 6 * s, q[1] - 10 * s, q[0], q[1]);
    ink.quadraticCurveTo(q[0] + 6 * s, q[1] - 10 * s, q[0] + 14 * s, q[1] - 2);
    ink.stroke();
  }

  // ---- a compass rose in the lake, front right
  {
    const q = px(4.5, 7.5);
    const r0 = 0.62 * k;
    ink.lineWidth = 2; ink.strokeStyle = '#000';
    ink.fillStyle = '#fff';
    ink.beginPath(); ink.arc(q[0], q[1], r0 * 0.75, 0, Math.PI * 2); ink.fill(); ink.stroke();
    ink.beginPath(); ink.arc(q[0], q[1], r0 * 0.68, 0, Math.PI * 2); ink.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const L = i % 2 ? r0 * 0.6 : r0;
      const tip = [q[0] + Math.sin(a) * L, q[1] - Math.cos(a) * L];
      const l = [q[0] + Math.sin(a - 0.5) * r0 * 0.14, q[1] - Math.cos(a - 0.5) * r0 * 0.14];
      const rr = [q[0] + Math.sin(a + 0.5) * r0 * 0.14, q[1] - Math.cos(a + 0.5) * r0 * 0.14];
      ink.fillStyle = '#fff';
      ink.beginPath(); ink.moveTo(l[0], l[1]); ink.lineTo(tip[0], tip[1]); ink.lineTo(rr[0], rr[1]); ink.lineTo(q[0], q[1]); ink.closePath(); ink.fill(); ink.stroke();
      ink.fillStyle = '#000';
      ink.beginPath(); ink.moveTo(q[0], q[1]); ink.lineTo(tip[0], tip[1]); ink.lineTo(rr[0], rr[1]); ink.closePath(); ink.fill();
    }
    wash.fillStyle = '#d8c79a';
    wash.beginPath(); wash.arc(q[0], q[1], r0 * 0.75, 0, Math.PI * 2); wash.fill();
  }

  // ---- the engraved border
  ink.strokeStyle = '#000';
  ink.lineWidth = 5;
  ink.strokeRect(0.32 * k, 0.32 * k, W - 0.64 * k, H - 0.64 * k);
  ink.lineWidth = 1.6;
  ink.strokeRect(0.42 * k, 0.42 * k, W - 0.84 * k, H - 0.84 * k);
  // outside the border: plain paper
  for (const g of [ink, wash]) {
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, 0.3 * k); g.fillRect(0, H - 0.3 * k, W, 0.3 * k);
    g.fillRect(0, 0, 0.3 * k, H); g.fillRect(W - 0.3 * k, 0, 0.3 * k, H);
  }
  return { ink: inkC, wash: washC, island };
}
