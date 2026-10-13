// Penrose rhombs: an endless zoom through the self-similar P3 tiling, and a
// step-by-step view of the deflation that builds it.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { PHI, seed, deflate, rhombs, fivefoldCentres } from './penrose.js';
import { tileGeometry, centreGeometry } from './geometry.js';
import { sharedUniforms, makeFillMaterial, makeInkMaterial, makeCentreMaterial } from './shaders.js';

// ------------------------------------------------------------------ constants
const ASPECT = 30 / 38;
const DIAG = Math.hypot(1, ASPECT); // half-diagonal of the print / half-height
const PATCH = Math.cos(Math.PI / 10); // inradius of the seed decagon (circumradius 1)
const MAX_STEP = 8; // deepest level in the step-by-step view
const TOP = 9; // deepest level generated (only near the centre)
const Z0 = 6; // the zoom loops over z in [Z0, Z0 + 2)
const ZH = 7.5; // half-height of the view is ZH / φ^z
const H_STEP = 0.72; // half-height of the step-by-step view
const TWIST = -Math.PI / 10; // the view turns 18° per level, 36° per loop
const LEVEL_SECONDS = 4.2; // zoom speed
const STEP_SECONDS = 1.7; // one deflation step
const DWELL = 2.4; // pause between automatic steps

const zoomH = (z) => ZH * Math.pow(PHI, -z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ------------------------------------------------------------------ tiling
// Levels 0..MAX_STEP cover the whole decagon; deeper ones only the middle,
// which is all the zoom ever shows of them.
function neededRadius(k) {
  if (k <= MAX_STEP) return Infinity;
  return zoomH(Math.max(Z0, k - 1.35)) * DIAG + 2.5 * Math.pow(PHI, -k);
}
const levels = [];
{
  let tris = seed();
  for (let k = 0; k <= TOP; k++) {
    if (k > 0) {
      const r = neededRadius(k);
      tris = deflate(tris, Number.isFinite(r) ? (t) => {
        const cx = (t.A[0] + t.B[0] + t.C[0]) / 3, cy = (t.A[1] + t.B[1] + t.C[1]) / 3;
        return Math.hypot(cx, cy) < r;
      } : null);
    }
    const list = rhombs(tris);
    const full = list.filter((r) => !r.half);
    const thick = full.filter((r) => r.k === 1).length;
    levels.push({
      k, s: Math.pow(PHI, -k), list, genR: neededRadius(k),
      thick, thin: full.length - thick,
      fill: null, ink: null, centres: null, zoomCentres: null,
    });
  }
}

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const dpr = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(dpr);
const PAPER = new THREE.Color(0xece5d5);
const PAPER_C = new THREE.Color(0xe9e4d8);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const shared = sharedUniforms();
shared.uDpr.value = dpr;

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
camera.position.set(0, 0, 5);
let aspect = ASPECT;

function ensureMeshes(L) {
  if (L.fill) return;
  const g = tileGeometry(L.list);
  L.fill = new THREE.Mesh(g, makeFillMaterial(shared));
  L.ink = new THREE.Mesh(g, makeInkMaterial(shared));
  for (const m of [L.fill, L.ink]) { m.frustumCulled = false; m.visible = false; scene.add(m); }
}

// Symmetry centres. In the zoom, level k + 2 is level k shrunk by φ² and
// turned −36°, so its centres are derived from level k: the loop then
// joins up exactly.
function centresFor(L, zoom) {
  if (L.k <= MAX_STEP - 1) zoom = false; // the same either way
  const key = zoom ? 'zoomCentres' : 'centres';
  if (L[key]) return L[key];
  let list;
  if (zoom && L.k > MAX_STEP - 1) {
    const src = centresFor(levels[L.k - 2], true).list;
    const c = Math.cos(-Math.PI / 5), s = Math.sin(-Math.PI / 5), f = 1 / (PHI * PHI);
    list = src.map((o) => ({ ...o, p: [(o.p[0] * c - o.p[1] * s) * f, (o.p[0] * s + o.p[1] * c) * f], angle: o.angle - Math.PI / 5 }));
  } else {
    list = fivefoldCentres(L.list, L.s, Number.isFinite(L.genR) ? L.genR : PATCH);
  }
  const mesh = new THREE.Mesh(centreGeometry(list, L.s), makeCentreMaterial(shared));
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.renderOrder = 300;
  scene.add(mesh);
  L[key] = { list, mesh };
  return L[key];
}

// ------------------------------------------------------------------ state
const state = {
  playing: true,
  litho: 1, lithoTarget: 1,
  mode: 'zoom', m: 0, // m: 0 zoom, 1 steps (animated)
  z: Z0 + 0.15, // zoom position
  lam: 6, target: 6, dwell: 0, dir: 1, // step-by-step position
  arcs: 1, arcsT: 1,
  marks: 1, marksT: 1,
};

// How strongly each part of level k is drawn, given σ = λ − k (how many
// levels coarser than the current one it is) and the mode blend m.
function weights(sig, m) {
  const L = (a, b) => a + (b - a) * m;
  // new edges appear, the old arcs lift, the fill changes, the new arcs
  // settle, and the old edges fade: one deflation, in that order
  const line = ss(L(-0.62, -0.85), L(-0.45, -0.6), sig);
  const fill = ss(L(-0.42, -0.55), L(-0.26, -0.35), sig);
  const arcIn = ss(L(-0.26, -0.35), L(-0.1, -0.15), sig);
  const arcOut = 1 - ss(L(0.42, 0.45), L(0.58, 0.62), sig);
  const heavy = ss(L(0.45, 0.4), L(0.7, 0.6), sig);
  const fade = 1 - ss(L(0.8, 0.68), L(1.1, 0.95), sig);
  const mark = fill * (1 - ss(L(0.58, 0.45), L(0.74, 0.65), sig));
  const cut = m * ss(0.03, 0.2, sig) * (1 - ss(0.55, 0.8, sig));
  return { line: line * fade, lineW: 0.45 + heavy * 0.85, fill, arc: arcIn * arcOut, mark, cut };
}

function view() {
  // zoom view and step view, blended by m
  const k = easeInOut(state.m);
  const hz = zoomH(state.z), tz = TWIST * (state.z - Z0);
  const h = Math.exp(lerp(Math.log(hz), Math.log(H_STEP), k));
  const theta = lerp(tz, 0, k);
  const lam = lerp(state.z, state.lam, k);
  return { h, theta, lam, m: k };
}

function render() {
  const v = view();
  camera.left = -v.h * aspect; camera.right = v.h * aspect;
  camera.top = v.h; camera.bottom = -v.h;
  camera.rotation.z = v.theta;
  camera.updateProjectionMatrix();
  shared.uPx.value = (2 * v.h) / Math.max(1, canvas.height);
  const viewR = v.h * Math.hypot(1, aspect);

  // fills, coarse to fine; skip any level that a finer one fully covers
  const live = [];
  for (const L of levels) {
    const w = weights(v.lam - L.k, v.m);
    const room = Number.isFinite(L.genR) ? ss(1.0, 0.92, viewR / L.genR) : 1;
    w.line *= room; w.fill *= room; w.arc *= room; w.cut *= room; w.mark *= room;
    live.push([L, w]);
  }
  let firstOpaque = 0;
  live.forEach(([, w], i) => { if (w.fill > 0.999) firstOpaque = i; });
  let mainCentres = [];
  live.forEach(([L, w], i) => {
    const showFill = i >= firstOpaque && w.fill > 0.001;
    const showInk = (w.line > 0.002 || w.arc * state.arcs > 0.002 || w.cut > 0.002) && i >= firstOpaque - 2;
    if (!showFill && !showInk) {
      if (L.fill) { L.fill.visible = false; L.ink.visible = false; }
      return;
    }
    ensureMeshes(L);
    L.fill.visible = showFill;
    L.fill.material.uniforms.uAlpha.value = i === firstOpaque ? 1 : w.fill;
    L.fill.renderOrder = 10 + L.k;
    L.ink.visible = showInk;
    const u = L.ink.material.uniforms;
    u.uLine.value = w.line;
    u.uLineW.value = w.lineW;
    u.uArc.value = w.arc * state.arcs;
    u.uCut.value = w.cut;
    L.ink.renderOrder = 200 - L.k;
    if (w.mark * state.marks > 0.002) mainCentres.push([L, w.mark * state.marks]);
  });
  for (const L of levels) for (const key of ['centres', 'zoomCentres']) if (L[key]) L[key].mesh.visible = false;
  for (const [L, a] of mainCentres) {
    const c = centresFor(L, v.m < 0.5);
    c.mesh.visible = true;
    c.mesh.material.uniforms.uAlpha.value = a;
  }
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------ layout + ui
let dirty = true; // redraw only when something has changed
const layout = fitFrame(ASPECT, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  dirty = true;
});
setupPanel();

const $ = (id) => document.getElementById(id);
const setLitho = segmented([[$('btn-litho'), 1], [$('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setMode = segmented([[$('btn-zoom'), 'zoom'], [$('btn-steps'), 'steps']], (mode) => {
  if (mode === state.mode) return;
  state.mode = mode;
  if (mode === 'steps') {
    const n = Math.max(0, Math.min(MAX_STEP, Math.round(state.z)));
    state.lam = state.z; state.target = n; state.dwell = 0; state.dir = n >= MAX_STEP ? -1 : 1;
  } else {
    state.z = Math.min(Z0 + 1.999, Math.max(Z0, state.lam));
  }
  document.body.classList.toggle('steps', mode === 'steps');
  dirty = true;
  layout();
  updateBadge();
}, 'zoom');

function step(d) {
  if (state.mode !== 'steps') setMode('steps');
  state.target = Math.max(0, Math.min(MAX_STEP, Math.round(state.target) + d));
  state.dir = d > 0 ? 1 : -1;
  state.dwell = 0;
  updateBadge();
}
$('btn-finer').addEventListener('click', () => step(1));
$('btn-coarser').addEventListener('click', () => step(-1));

function toggle(btn, key) {
  const on = state[key + 'T'] < 0.5;
  state[key + 'T'] = on ? 1 : 0;
  btn.setAttribute('aria-pressed', String(on));
}
$('btn-arcs').addEventListener('click', () => toggle($('btn-arcs'), 'arcs'));
$('btn-marks').addEventListener('click', () => toggle($('btn-marks'), 'marks'));

const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  z: () => setMode(state.mode === 'zoom' ? 'steps' : 'zoom'),
  '[': () => step(-1),
  ']': () => step(1),
  ArrowLeft: () => step(-1),
  ArrowRight: () => step(1),
  a: () => $('btn-arcs').click(),
  c: () => $('btn-marks').click(),
});

function fmt(n) { return n.toLocaleString('en-GB'); }
function updateBadge() {
  if (state.mode !== 'steps') { setBadge(false); return; }
  const n = Math.round(state.target);
  const L = levels[n];
  $('level').textContent = String(n);
  const text = n === 0
    ? 'Level 0 · the seed: ten half-rhombs round a point'
    : `Level ${n} · ${fmt(L.thick)} thick, ${fmt(L.thin)} thin · ratio ${(L.thick / L.thin).toFixed(3)}`;
  setBadge(true, text);
}

// drag or scroll to zoom by hand
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { y: e.clientY, x: e.clientX }; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag || state.mode !== 'zoom') return;
  const dy = e.clientY - drag.y;
  drag = { y: e.clientY, x: e.clientX };
  nudgeZoom(-dy / 160);
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  if (state.mode !== 'zoom') return;
  e.preventDefault();
  nudgeZoom(-e.deltaY * 0.0022);
}, { passive: false });
function nudgeZoom(dz) {
  dirty = true;
  state.z += dz;
  while (state.z >= Z0 + 2) state.z -= 2;
  while (state.z < Z0) state.z += 2;
}

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  // mode blend
  const mT = state.mode === 'steps' ? 1 : 0;
  state.m += Math.sign(mT - state.m) * Math.min(Math.abs(mT - state.m), dt / 1.1);

  if (state.mode === 'zoom') {
    if (state.playing) nudgeZoom(dt / LEVEL_SECONDS);
  } else {
    const d = state.target - state.lam;
    if (Math.abs(d) > 1e-4) {
      state.lam += Math.sign(d) * Math.min(Math.abs(d), dt / STEP_SECONDS);
    } else if (state.playing && state.m > 0.99) {
      state.dwell += dt;
      if (state.dwell > DWELL * (state.target === 0 || state.target === MAX_STEP ? 1.6 : 1)) {
        if (state.target >= MAX_STEP) state.dir = -1;
        if (state.target <= 0) state.dir = 1;
        state.target += state.dir;
        state.dwell = 0;
        updateBadge();
      }
    }
  }

  // cross-fades
  const fade = (k, rate) => { state[k] += Math.sign(state[k + 'T'] - state[k]) * Math.min(Math.abs(state[k + 'T'] - state[k]), dt * rate); };
  fade('arcs', 3);
  fade('marks', 3);
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    shared.uLitho.value = state.litho;
    renderer.setClearColor(PAPER_C.clone().lerp(PAPER, state.litho), 1);
  }

  const settled = !state.playing && Math.abs(state.target - state.lam) < 1e-4 && (state.m === 0 || state.m === 1)
    && state.arcs === state.arcsT && state.marks === state.marksT && state.litho === state.lithoTarget;
  if (!settled || dirty) { render(); dirty = false; }
  requestAnimationFrame(frame);
}

updateBadge();
markReady();
requestAnimationFrame(frame);

// debug handle for screenshots
window.__page = {
  state, levels, setMode, setLitho, step, render,
  set(o) { Object.assign(state, o); if ('litho' in o) { shared.uLitho.value = o.litho; renderer.setClearColor(PAPER_C.clone().lerp(PAPER, o.litho), 1); } updateBadge(); render(); },
};
