// The hat and the spectre: a patch of each aperiodic monotile, generated
// exactly by substitution, with a slow zoom through the levels of the
// hierarchy that forces the tiling never to repeat.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { buildMetatiles, flatten, transPt } from './hat.js';
import { verify } from './kites.js';
import { buildSpectres as spectreSystem, flattenSpectres, verifySpectres } from './spectre.js';
import { buildHats, buildSpectres } from './build.js';
import { sharedUniforms, makeFillMaterial, makeLineMaterial } from './shaders.js';

const ASPECT = 30 / 38;
const HAT_LEVELS = 4; // substitutions: the patch is one level-5 H
const SPECTRE_LEVELS = 5; // spectres are cut from a level-5 Δ ...
// ... as a disc round its deepest point (found once, offline: the cluster is
// star-shaped, so a disc keeps the frame covered for longer as it zooms out)
const DISC = { x: 116.94, y: -225.31, r: 110 };
const CYCLE = 44; // seconds for a zoom out and back in

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const fmt = (n) => n.toLocaleString('en-GB');

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const dpr = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(dpr);
const PAPER = new THREE.Color(0xece5d5);
const PAPER_C = new THREE.Color(0xe6e1d5);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const shared = sharedUniforms();
shared.uDpr.value = dpr;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
camera.position.set(0, 0, 5);
let aspect = ASPECT;

// ------------------------------------------------------------------ the two patches
const patches = {};

// Of the given points, the one furthest from the outline of the patch, so
// the zoom stays inside the tiling for as long as possible.
function deepest(points, data, top) {
  const pq = data.lines.getAttribute('iPQ').array;
  const lv = data.lines.getAttribute('iLevel').array;
  const edge = [];
  for (let i = 0; i < lv.length; i++) if (lv[i] >= top - 0.5) edge.push(pq[i * 4], pq[i * 4 + 1]);
  let best = points[0], bestD = -1;
  for (const p of points) {
    let d = Infinity;
    for (let k = 0; k < edge.length; k += 2) d = Math.min(d, (edge[k] - p.x) ** 2 + (edge[k + 1] - p.y) ** 2);
    if (d > bestD) { bestD = d; best = p; }
  }
  return best;
}

function makeHats() {
  const [H] = buildMetatiles(HAT_LEVELS);
  const { hats } = flatten(H, HAT_LEVELS);
  const check = verify(hats);
  const data = buildHats(hats, check, HAT_LEVELS);
  // zoom towards the reflected hat deepest inside the patch (its centre: the
  // middle of the hat's outline, mapped into the world)
  const centres = hats.filter((h) => h.label === 'H1').map((h) => ({ x: h.T[0] * 1.5 + h.T[1] * 0.433 + h.T[2], y: h.T[3] * 1.5 + h.T[4] * 0.433 + h.T[5] }));
  const f = deepest(centres, data, HAT_LEVELS + 1);
  const reflected = hats.filter((h) => h.label === 'H1').length;
  return {
    data, focus: f, base: 2.0, grow: 2.618, levels: HAT_LEVELS + 1, close: 6.4,
    report: { tiles: hats.length, odd: reflected, kites: check.kites, offGrid: check.offGrid, overlaps: check.overlaps, holes: check.holes, maxErr: check.maxErr },
  };
}

function makeSpectres() {
  const sys = spectreSystem(SPECTRE_LEVELS);
  const tiles = flattenSpectres(sys.Delta).filter((t) => {
    const c = transPt(t.T, { x: 1.5, y: 0.75 });
    return Math.hypot(c.x - DISC.x, c.y - DISC.y) < DISC.r;
  });
  const data = buildSpectres(tiles, SPECTRE_LEVELS);
  const check = verifySpectres(tiles);
  // zoom towards the turned spectre nearest the middle of the disc
  let f = null, best = Infinity;
  for (const t of tiles) {
    if (t.label !== 'Gamma2') continue;
    const c = transPt(t.T, { x: 1.5, y: 0.75 });
    const d = Math.hypot(c.x - DISC.x, c.y - DISC.y);
    if (d < best) { best = d; f = c; }
  }
  const turned = tiles.filter((t) => t.label === 'Gamma2').length;
  return {
    data, focus: f, base: 2.9, grow: 2.8, levels: SPECTRE_LEVELS, close: 10.5,
    report: { tiles: tiles.length, odd: turned, handed: check.handedness.length === 1, badAngle: check.badAngle, badEdge: check.badEdge, interior: check.interiorVertices },
  };
}

function ensure(mode) {
  if (patches[mode]) return patches[mode];
  const P = mode === 'hat' ? makeHats() : makeSpectres();
  P.fill = new THREE.Mesh(P.data.fill, makeFillMaterial(shared));
  P.fill.material.uniforms.uSpectre.value = mode === 'hat' ? 0 : 1;
  P.lines = new THREE.Mesh(P.data.lines, makeLineMaterial(shared, { base: P.base, grow: P.grow, levels: P.levels }));
  for (const m of [P.fill, P.lines]) { m.frustumCulled = false; m.visible = false; scene.add(m); }
  P.fill.renderOrder = 1;
  P.lines.renderOrder = 2;
  const b = P.data.box;
  P.far = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 };
  patches[mode] = P;
  return P;
}

// ------------------------------------------------------------------ state
const state = {
  playing: true,
  litho: 1, lithoTarget: 1,
  mode: 'hat',
  fade: 1, // cross-fade when switching tile
  phase: 0.0, // position in the zoom cycle, 0..1
  odd: 1, oddT: 1,
};

// zoom amount 0 (close) .. 1 (whole patch) through the cycle, with a pause at each end
function zoomOf(phase) {
  const p = phase % 1;
  const k = p < 0.5 ? p * 2 : 2 - p * 2;
  return ss(0.08, 0.92, k);
}

function viewFor(P, u) {
  const farH = Math.max(P.far.h / 2, P.far.w / 2 / aspect) * 1.03;
  const h = P.close * Math.pow(farH / P.close, u);
  const c = Math.pow(u, 1.2);
  return { h, x: P.focus.x + (P.far.x - P.focus.x) * c, y: P.focus.y + (P.far.y - P.focus.y) * c };
}

let lastCaption = '';
function caption(P, h, u) {
  // the level of cluster that stands out at this zoom
  const lv = Math.log((0.5 * h) / P.base) / Math.log(P.grow) - 0.2;
  const L = u > 0.97 ? P.levels : Math.max(0, Math.min(P.levels - 1, Math.round(lv)));
  const r = P.report;
  let text;
  if (state.mode === 'hat') {
    if (L === 0) text = 'Hats: each one eight kites of a hexagonal grid';
    else if (L === 1) text = 'Level 1: hats grouped into H, T, P and F metatiles';
    else if (L < P.levels) text = `Level ${L}: those groups grouped again into larger H, T, P and F`;
    else text = `The whole patch: one level-${P.levels} H of ${fmt(r.tiles)} hats`;
    if (state.oddT) text += ` · ${fmt(r.odd)} reflected (1 in ${(r.tiles / r.odd).toFixed(2)})`;
  } else {
    if (L === 0) text = 'Spectres: one shape, its edges bent so it cannot be flipped';
    else if (L < P.levels) text = `Level ${L}: spectres grouped into nine kinds of cluster`;
    else text = `${fmt(r.tiles)} spectres, cut as a disc from a level-${P.levels} cluster`;
    if (state.oddT) text += ` · ${fmt(r.odd)} turned by 30° (1 in ${(r.tiles / r.odd).toFixed(2)})`;
  }
  if (text !== lastCaption) { setBadge(true, text); lastCaption = text; }
}

function render() {
  const P = ensure(state.mode);
  for (const k of Object.keys(patches)) {
    const on = k === state.mode;
    patches[k].fill.visible = on;
    patches[k].lines.visible = on;
  }
  const u = zoomOf(state.phase);
  const v = viewFor(P, u);
  camera.left = -v.h * aspect; camera.right = v.h * aspect;
  camera.top = v.h; camera.bottom = -v.h;
  camera.position.set(v.x, v.y, 5);
  camera.updateProjectionMatrix();
  shared.uPx.value = (2 * v.h) / Math.max(1, canvas.height);
  const fu = P.fill.material.uniforms;
  // colour by clusters a little smaller than the ones being outlined
  const lv = Math.log((0.66 * v.h) / P.base) / Math.log(P.grow);
  fu.uLevel.value = Math.max(0, Math.min(3, lv - 1.6));
  fu.uOdd.value = state.odd;
  fu.uKites.value = 1;
  P.lines.material.uniforms.uH.value = v.h;
  P.lines.material.uniforms.uAlpha.value = 1;
  caption(P, v.h, u);
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------ ui
let dirty = true; // redraw only when something has changed
fitFrame(ASPECT, (w, h) => { renderer.setSize(w, h); aspect = w / h; dirty = true; });
setupPanel();
const $ = (id) => document.getElementById(id);
const setLitho = segmented([[$('btn-litho'), 1], [$('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setMode = segmented([[$('btn-hat'), 'hat'], [$('btn-spectre'), 'spectre']], (m) => {
  if (m === state.mode) return;
  if (!patches[m]) {
    // first visit: let the button and a note paint before the patch is built
    setBadge(true, m === 'spectre' ? 'Building the spectres…' : 'Building the hats…');
    lastCaption = '';
    setTimeout(() => { ensure(m); setMode(m); }, 30);
    return;
  }
  state.mode = m;
  lastCaption = '';
  document.body.classList.toggle('spectre', m === 'spectre');
  updateReport();
  dirty = true;
}, 'hat');
$('btn-odd').addEventListener('click', () => {
  state.oddT = state.oddT ? 0 : 1;
  $('btn-odd').setAttribute('aria-pressed', String(!!state.oddT));
  lastCaption = '';
  dirty = true;
});
const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => setLitho(state.lithoTarget ? 0 : 1),
  m: () => setMode(state.mode === 'hat' ? 'spectre' : 'hat'),
  s: () => setMode(state.mode === 'hat' ? 'spectre' : 'hat'),
  h: () => $('btn-odd').click(),
});

// scroll or drag to zoom by hand
function nudge(dz) {
  // dz > 0 zooms out; stay within the current half of the cycle so the
  // zoom stops at either end instead of bouncing back
  const p = state.phase % 1;
  state.phase = p < 0.5 ? Math.min(0.5, Math.max(0, p + dz * 0.5)) : Math.min(0.9999, Math.max(0.5, p - dz * 0.5));
  dirty = true;
}
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = e.clientY; });
canvas.addEventListener('pointermove', (e) => { if (drag === null) return; nudge((drag - e.clientY) / -500); drag = e.clientY; });
const end = () => { drag = null; };
canvas.addEventListener('pointerup', end);
canvas.addEventListener('pointercancel', end);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); nudge(e.deltaY * 0.0009); }, { passive: false });

function updateReport() {
  const el = $('report');
  if (!el) return;
  const P = patches[state.mode];
  if (!P) return;
  const r = P.report;
  el.textContent = state.mode === 'hat'
    ? `Checked in your browser: ${fmt(r.tiles)} hats cover ${fmt(r.kites)} kites, exactly eight each; ${r.offGrid === 0 ? 'every corner lies on the kite grid' : `${r.offGrid} kites off the grid`}; ${r.overlaps} kites covered twice; ${r.holes} gaps.`
    : `Checked in your browser: ${fmt(r.tiles)} spectres, ${r.handed ? 'all the same way round' : 'mixed handedness'}; they meet edge to edge${r.badEdge ? ' (with errors)' : ''}, and the corners round each of the ${fmt(r.interior)} inner vertices add up to 360°${r.badAngle ? ` except at ${r.badAngle}` : ''}.`;
}

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.phase = (state.phase + dt / CYCLE) % 1;
  state.odd += Math.sign(state.oddT - state.odd) * Math.min(Math.abs(state.oddT - state.odd), dt * 3);
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    shared.uLitho.value = state.litho;
    renderer.setClearColor(PAPER_C.clone().lerp(PAPER, state.litho), 1);
  }
  const moving = state.playing || state.litho !== state.lithoTarget || state.odd !== state.oddT;
  if (moving || dirty) { render(); dirty = false; }
  requestAnimationFrame(frame);
}

ensure('hat');
updateReport();
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, patches, setMode, setLitho, render, ensure,
  set(o) {
    const { mode, ...rest } = o;
    Object.assign(state, rest);
    if ('litho' in o) { shared.uLitho.value = o.litho; renderer.setClearColor(PAPER_C.clone().lerp(PAPER, o.litho), 1); }
    if (mode) setMode(mode);
    lastCaption = '';
    updateReport();
    render();
  },
};
