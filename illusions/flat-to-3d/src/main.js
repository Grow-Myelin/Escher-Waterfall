// Flat to 3D: a lizard drawn in a tessellation on a sketchbook page swells
// into a solid animal, walks over the things on the desk and slides back into
// its place in the drawing. After Escher's Reptiles (1943).

import * as THREE from 'three';
import { createSharedUniforms, makeInkMaterial, makeDrawingMaterial } from './materials.js';
import {
  buildDesk, buildSketchbook, buildBook, buildDodecahedron, buildDish, buildPencil, SKETCH, PAGE_Y,
} from './desk.js';
import { outline, tessellate, apply, H, LEGS } from './lizard.js';
import { drawPage, drawHero, PAPER } from './drawing.js';
import { buildLizard } from './lizard3d.js';
import { buildPath, frameAt, STEP } from './path.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

const T0 = performance.now();
const TIMES = {};
const mark = (k) => { TIMES[k] = Math.round(performance.now() - T0); };
const ASPECT = 39 / 31;
const K = 0.42; // world units per tile unit
const SNOUT = [-0.95, 1.7]; // where the hero's snout lies on the page (x, z)

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0xece5d5, 1);
const scene = new THREE.Scene();
const uniforms = createSharedUniforms();
const ink = makeInkMaterial(uniforms);
const maxAniso = renderer.capabilities.getMaxAnisotropy();

function add(b, mat = ink) {
  const m = new THREE.Mesh(b.build(), mat);
  m.frustumCulled = false;
  scene.add(m);
  return m;
}
add(buildDesk());
add(buildSketchbook());
add(buildBook());
add(buildDodecahedron().b);
add(buildDish());
add(buildPencil());
mark('desk');

// ------------------------------------------------------------------ the drawing
// Choose the hero: a lizard near the edge of the patch whose head, once the
// patch is turned by ψ, points along +x towards the book.
const tiles = tessellate(9).map((pl) => ({ pl, c: apply(pl, [0, 0]) }));
const HEAD_DIR = -32 * (Math.PI / 180); // the head's direction in the base tile
let hero = null, best = Infinity;
for (const t of tiles) {
  if (t.pl.r !== 1) continue; // a grey lizard: its fill and its shading both show
  const want = t.pl.r * (2 * Math.PI / 3) + HEAD_DIR; // centre should lie this way from the patch's middle
  const d = Math.hypot(t.c[0], t.c[1]);
  let da = Math.atan2(t.c[1], t.c[0]) - want;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  const score = Math.abs(d - 4.3) + Math.abs(da) * 2.5;
  if (score < best) { best = score; hero = t; }
}
const PSI = -HEAD_DIR - hero.pl.r * (2 * Math.PI / 3);
const cP = Math.cos(PSI), sP = Math.sin(PSI);
const rotTile = (t) => [cP * t[0] - sP * t[1], -(sP * t[0] + cP * t[1])]; // tile → (x, z) offset
const snoutTile = apply(hero.pl, [1.24, -0.66]);
const PC = [SNOUT[0] - K * rotTile(snoutTile)[0], SNOUT[1] - K * rotTile(snoutTile)[1]];
const toWorld = (t) => { const r = rotTile(t); return [PC[0] + K * r[0], PC[1] + K * r[1]]; };
const heroWorld = (p) => toWorld(apply(hero.pl, p));

const page = {
  x0: SKETCH.x0 + 0.06, z0: SKETCH.z0 + 0.05, x1: SKETCH.x1 - 0.04, z1: SKETCH.z1 - 0.05,
};
page.W = page.x1 - page.x0;
page.D = page.z1 - page.z0;
const ring = outline(10);
// keep only lizards that lie wholly on the page
const onPage = tiles.filter((t) => ring.every((p) => {
  const w = toWorld(apply(t.pl, p));
  return w[0] > page.x0 + 0.08 && w[0] < page.x1 - 0.08 && w[1] > page.z0 + 0.08 && w[1] < page.z1 - 0.08;
}));
const layout = {
  W: page.W, D: page.D, res: 2048 / page.W, k: K, tiles: onPage, ring, hero,
  rIn: 2.6, rOut: 5.0,
  centreDist: (t) => Math.hypot(t.c[0], t.c[1]),
  toPage: (t) => { const w = toWorld(t); return [w[0] - page.x0, w[1] - page.z0]; },
};
const heroQ = 1 - smoothstep(layout.rIn, layout.rOut, layout.centreDist(hero));
function texture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = maxAniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
mark('layout');
const pageL = drawPage('L', layout);
mark('pageL');
const pageC = drawPage('C', layout);
mark('pageC');
const pageMat = makeDrawingMaterial(uniforms, texture(pageL), texture(pageC));
{
  const g = new THREE.BufferGeometry();
  const y = PAGE_Y + 0.0004;
  g.setAttribute('position', new THREE.Float32BufferAttribute([page.x0, y, page.z0, page.x0, y, page.z1, page.x1, y, page.z1, page.x1, y, page.z0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 1, 1], 2));
  g.setAttribute('aDist', new THREE.Float32BufferAttribute([1, 1, 1, 1], 1));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const m = new THREE.Mesh(g, pageMat);
  m.frustumCulled = false;
  scene.add(m);
}

// ------------------------------------------------------------------ the lizard
const L = buildLizard(STEP / K);
mark('lizard');
const LS = L.spine.length; // spine length, tile units
const spineWorld = L.spine.pts.map((p) => heroWorld(p));
const path = buildPath(spineWorld);
mark('path');
const heroMat = makeDrawingMaterial(uniforms, texture(drawHero('L', ring, hero.pl.r)), texture(drawHero('C', ring, hero.pl.r)), { contourStep: 0.05 });
{
  // the outline-only state must match the pencil outline drawn on the page
  const sm = (a, b, x) => smoothstep(a, b, x);
  const pencil = [0.42, 0.41, 0.39], inkC = [0.12, 0.11, 0.1];
  const f = sm(0.2, 0.8, heroQ), al = 0.5 + 0.5 * sm(0, 0.6, heroQ);
  const lc = pencil.map((v, i) => v + (inkC[i] - v) * f);
  heroMat.uniforms.uSketchLine.value.set(...lc.map((v, i) => PAPER[i] + (v - PAPER[i]) * al));
  heroMat.uniforms.uSketchPaper.value.set(...PAPER);
  heroMat.uniforms.uLineW.value = (0.011 + 0.006 * heroQ) / 2;
}
mark('hero');
const lizard = new THREE.Mesh(L.geo, heroMat);
lizard.frustumCulled = false;
lizard.renderOrder = 2;
scene.add(lizard);

// ------------------------------------------------------------------ timeline
const V = 0.62; // walking speed, world units per second
const STRIDE = 0.42;
const PAUSE = 3.2; // seconds spent on top of the dodecahedron
const U0 = LS * K, U1 = path.length;
const UP = Math.min(U1 - 1, path.marks.top + LS * K * 0.5); // body centred on the top face
// time → distance table for the walk, easing in and out and stopping at the top
const walk = (() => {
  const T = [0], U = [U0];
  let t = 0;
  const du = 0.004;
  let paused = false;
  for (let u = U0; u < U1; u += du) {
    const ramp = (x, a) => Math.max(0.22, Math.min(1, x / a));
    const v = V * ramp(u - U0, 0.5) * ramp(U1 - u, 0.6) * (Math.abs(u - UP) < 0.45 ? Math.max(0.25, Math.abs(u - UP) / 0.45) : 1);
    t += du / v;
    if (!paused && u >= UP) { t += PAUSE; paused = true; T.push(t); U.push(u); }
    T.push(t);
    U.push(Math.min(U1, u + du));
  }
  return { T, U, dur: t };
})();
function walkU(t) {
  const { T, U } = walk;
  if (t <= 0) return U[0];
  if (t >= walk.dur) return U[U.length - 1];
  let lo = 0, hi = T.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
  const f = (t - T[lo]) / (T[hi] - T[lo] || 1);
  return U[lo] + (U[hi] - U[lo]) * f;
}
const PHASES = [
  ['rest', 1.4, 'a pencil outline in the drawing'],
  ['fill', 2.2, 'the drawing is finished'],
  ['relief', 2.6, 'shaded, it rises in low relief'],
  ['rise', 1.8, 'a solid body, the outline its footprint'],
  ['walk', walk.dur, 'walking over the desk'],
  ['settle', 1.0, 'back in its place'],
  ['sink', 2.6, 'flattening into the page'],
  ['unfill', 1.8, 'only an outline again'],
];
let total = 0;
for (const p of PHASES) { p.start = total; total += p[1]; }
const TOTAL = total;

function smoothstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

// the lizard's state at time t
function stateAt(t) {
  t = ((t % TOTAL) + TOTAL) % TOTAL;
  let ph = PHASES[0];
  for (const p of PHASES) if (t >= p.start) ph = p;
  const f = (t - ph.start) / ph[1];
  const s = { fill: 0, relief: 0, u: U0, phase: ph, pauseT: -1 };
  switch (ph[0]) {
    case 'rest': break;
    case 'fill': s.fill = smoothstep(0, 1, f); break;
    case 'relief': s.fill = 1; s.relief = 0.35 * smoothstep(0, 1, f); break;
    case 'rise': s.fill = 1; s.relief = 0.35 + 0.65 * smoothstep(0, 1, f); break;
    case 'walk': {
      s.fill = 1; s.relief = 1;
      const tw = f * walk.dur;
      s.u = walkU(tw);
      // time into the pause on the dodecahedron
      const tp = tw - walk.T[walk.U.findIndex((u) => u >= UP)];
      if (Math.abs(s.u - UP) < 1e-4 && tp >= 0 && tp <= PAUSE) s.pauseT = tp;
      break;
    }
    case 'settle': s.fill = 1; s.relief = 1; s.u = U1; break;
    case 'sink': s.fill = 1; s.relief = 1 - smoothstep(0, 1, f); s.u = U1; break;
    case 'unfill': s.fill = 1 - smoothstep(0, 1, f); s.u = U1; break;
  }
  return s;
}

// ------------------------------------------------------------------ deformation
const fr = { pos: [0, 0, 0], T: [0, 0, 0], B: [0, 0, 0], N: [0, 0, 0] };
const posAttr = L.geo.getAttribute('position');
const SNECK = LS * 0.79;
const legSide = LEGS.map((_, k) => (L.joints[k][1] > 0 ? -1 : 1));
function deform(s) {
  const u = s.u >= U1 - 1e-6 ? U1 : s.u;
  const walked = Math.max(0, u - U0);
  const phi = (2 * Math.PI * walked) / STRIDE;
  // gait fades in after the first steps and out before the last
  const gait = smoothstep(0, 0.3, walked) * smoothstep(0, 0.35, U1 - u) * (s.pauseT >= 0 ? 0 : 1);
  const legA = 0.38 * gait;
  const headA = s.pauseT >= 0 ? 0.55 * Math.sin((s.pauseT / PAUSE) * Math.PI * 2) * smoothstep(0, 0.5, s.pauseT) * smoothstep(PAUSE, PAUSE - 0.5, s.pauseT) : 0;
  const headLift = s.pauseT >= 0 ? 0.12 * Math.sin((s.pauseT / PAUSE) * Math.PI) : 0;
  const P = posAttr.array;
  for (let i = 0; i < L.n; i++) {
    let sv = L.S[i], lv = L.Lat[i], hv = L.h[i];
    const k = L.legIdx[i];
    if (k >= 0 && legA > 0) {
      const leg = LEGS[k], j = L.joints[k];
      const w = L.legW[i];
      const ph = phi + leg.phase;
      const a = legSide[k] * legA * Math.sin(ph) * w;
      const ds = sv - j[0], dl = lv - j[1];
      const ca = Math.cos(a), sa = Math.sin(a);
      sv = j[0] + ds * ca - dl * sa;
      lv = j[1] + ds * sa + dl * ca;
      hv += 0.09 * w * Math.max(0, Math.cos(ph)) * gait;
    }
    // the trunk bends from side to side with the stride
    lv += 0.05 * gait * Math.sin(phi) * Math.cos((2 * Math.PI * (sv / LS - 0.45)));
    if (sv > SNECK && (headA || headLift)) {
      const w = smoothstep(SNECK, SNECK + 0.3, sv);
      const ds = sv - SNECK, a = headA * w;
      const ca = Math.cos(a), sa = Math.sin(a);
      sv = SNECK + ds * ca - lv * sa;
      lv = ds * sa + lv * ca;
      hv += headLift * w * (ds / 0.5);
    }
    frameAt(path, u - (LS - sv) * K, fr);
    const l = lv * K, h = hv * K * s.relief + 0.0015;
    P[i * 3] = fr.pos[0] + fr.B[0] * l + fr.N[0] * h;
    P[i * 3 + 1] = fr.pos[1] + fr.B[1] * l + fr.N[1] * h;
    P[i * 3 + 2] = fr.pos[2] + fr.B[2] * l + fr.N[2] * h;
  }
  posAttr.needsUpdate = true;
  L.geo.computeVertexNormals();
  heroMat.uniforms.uSolid.value = Math.min(1, s.relief * 2.4);
  heroMat.uniforms.uFill.value = s.fill;
}

// ------------------------------------------------------------------ construction overlay
// Red, like the Waterfall's guides: the hole's outline on the page, the
// hexagon and rotation centres it was cut from, and the path walked.
const RED = 0xa23b2a;
const guides = new THREE.Group();
const guideMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthWrite: false });
function ribbon(points, width, dash = 0, gap = 0) {
  // points: [x, y, z, ux, uy, uz] with u the side direction
  const pos = [], idx = [];
  let acc = 0, on = true, run = 0;
  for (let i = 0; i < points.length; i++) {
    if (i) acc = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1], points[i][2] - points[i - 1][2]);
    run += acc;
    if (dash && run > (on ? dash : gap)) { on = !on; run = 0; }
    const p = points[i];
    pos.push(p[0] + p[3] * width, p[1] + p[4] * width, p[2] + p[5] * width, p[0] - p[3] * width, p[1] - p[4] * width, p[2] - p[5] * width);
    if (i && (on || !dash)) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  const m = new THREE.Mesh(g, guideMat);
  m.frustumCulled = false;
  return m;
}
function flatLine(pts2, closed, w, dash, gap) {
  const P = closed ? pts2.concat([pts2[0]]) : pts2;
  const pts = P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    return [p[0], PAGE_Y + 0.003, p[1], -dz / l, 0, dx / l];
  });
  return ribbon(pts, w, dash, gap);
}
{
  const hole = outline(10).map((p) => heroWorld(p));
  guides.add(flatLine(hole, true, 0.009, 0.05, 0.03));
  guides.add(flatLine(H.map((p) => heroWorld(p)), true, 0.005, 0.03, 0.03));
  for (const i of [0, 2, 4]) {
    const c = heroWorld(H[i]);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.04, 20), guideMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(c[0], PAGE_Y + 0.004, c[1]);
    guides.add(dot);
  }
  // the walk, lifted a little off every surface
  const pts = [];
  for (let i = 0; i < path.n; i += 4) {
    const p = path.pos, n = path.N, b = path.B;
    pts.push([p[i * 3] + n[i * 3] * 0.006, p[i * 3 + 1] + n[i * 3 + 1] * 0.006, p[i * 3 + 2] + n[i * 3 + 2] * 0.006, b[i * 3], b[i * 3 + 1], b[i * 3 + 2]]);
  }
  guides.add(ribbon(pts, 0.007, 0.07, 0.05));
  guides.renderOrder = 5;
  guides.visible = false;
  scene.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
const VIEW = { H: 5.6, target: new THREE.Vector3(0.2, 0.3, 2.0) };
let fw = 1, fh = 1;
function updateCamera() {
  const t = VIEW.target;
  camera.position.set(t.x + 100, t.y + 100, t.z + 100);
  camera.up.set(0, 1, 0);
  camera.lookAt(t);
  const hh = VIEW.H / 2;
  camera.left = -hh * (fw / fh);
  camera.right = hh * (fw / fh);
  camera.top = hh;
  camera.bottom = -hh;
  camera.updateProjectionMatrix();
}
fitFrame(ASPECT, (w, h) => { fw = w; fh = h; renderer.setSize(w, h); updateCamera(); });

// ------------------------------------------------------------------ ui
setupPanel();
const state = { t: 0, playing: true, litho: 1, lithoTarget: 1, reveal: 0, revealTarget: 0 };
const setLitho = segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const btnReveal = document.getElementById('btn-reveal');
function setReveal(on) {
  state.revealTarget = on ? 1 : 0;
  btnReveal.setAttribute('aria-pressed', String(on));
}
btnReveal.addEventListener('click', () => setReveal(!state.revealTarget));
const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  r: () => setReveal(!state.revealTarget),
  ArrowRight: () => { state.t += 1; },
  ArrowLeft: () => { state.t -= 1; },
  0: () => { state.t = 0; },
});
// drag sideways to scrub through the loop
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX }; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  state.t += ((e.clientX - drag.x) / Math.max(200, fw)) * 22;
  drag.x = e.clientX;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// ------------------------------------------------------------------ loop
let last = performance.now();
let lastLabel = '';
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing && !drag) state.t += dt;
  for (const [key, target] of [['litho', 'lithoTarget'], ['reveal', 'revealTarget']]) {
    const d = state[target] - state[key];
    state[key] += Math.sign(d) * Math.min(Math.abs(d), dt * 2.4);
  }
  uniforms.uLitho.value = state.litho;
  uniforms.uTime.value = now / 1000;
  const s = stateAt(state.t);
  deform(s);
  heroMat.uniforms.uContours.value = state.reveal * Math.min(1, s.relief * 3);
  guideMat.opacity = state.reveal * 0.9;
  guides.visible = state.reveal > 0.01;
  const label = state.reveal > 0.5 ? s.phase[2] : '';
  if (label !== lastLabel) { setBadge(!!label, label); lastLabel = label; }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
mark('ready');
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, VIEW, updateCamera, TOTAL, PHASES, setPlaying,
  setLitho: (v) => { setLitho(v ? 1 : 0); state.litho = v ? 1 : 0; },
  setReveal: (v) => { setReveal(v); state.reveal = v ? 1 : 0; },
  at: (name, f = 0) => { const p = PHASES.find((q) => q[0] === name); state.t = p.start + p[1] * f; },
  path, hero, L, TIMES,
};
