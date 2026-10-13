// Reutersvärd's impossible triangle of cubes, assembled one cube at a time in
// true isometric. See figure.js for the construction.

import * as THREE from 'three';
import { Builder } from '../../../src/builder.js';
import { createSharedUniforms, makeInkMaterial } from '../../../src/materials.js';
import { cubePath, buildCube } from './figure.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

const ISO_AZ = Math.PI / 4;
const ISO_EL = Math.atan(1 / Math.SQRT2);
const ROLL = -Math.PI / 6; // turn the drawing so one side of the triangle is level
const REVEAL = { az: ISO_AZ - 1.25, el: 0.75, roll: 0, zoom: 0.85, k: 1 };
const RED = 0xa23b2a;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_C = new THREE.Color(0xeeeadf);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const uniforms = createSharedUniforms();
uniforms.uLight.value.set(0.3, 0.9, 0.5).normalize();

// ------------------------------------------------------------------ figure
const fig = { n: 3, cubes: [], group: new THREE.Group(), guides: new THREE.Group(), centre: new THREE.Vector3(), picCentre: [0, 0] };
scene.add(fig.group);
scene.add(fig.guides);

function screenOf(p) { return [(p[0] - p[2]) / Math.SQRT2, (2 * p[1] - p[0] - p[2]) / Math.sqrt(6)]; }

function buildFigure(n) {
  for (const c of fig.cubes) { c.mesh.geometry.dispose(); c.mesh.material.dispose(); }
  fig.group.clear();
  fig.guides.clear();
  fig.cubes = [];
  fig.n = n;
  const cells = cubePath(n);
  cells.forEach((cell, i) => {
    const b = new Builder();
    buildCube(b, n, i);
    const u = { ...uniforms, uFade: { value: 1 } };
    const mesh = new THREE.Mesh(b.build(), makeInkMaterial(u, { transparent: true }));
    mesh.frustumCulled = false;
    fig.group.add(mesh);
    fig.cubes.push({ mesh, u, cell });
  });
  // the real centre of the spiral, and the centre of the drawn triangle
  const c = new THREE.Vector3();
  for (const cell of cells) c.add(new THREE.Vector3(cell[0] + 0.5, cell[1] + 0.5, cell[2] + 0.5));
  fig.centre.copy(c.divideScalar(cells.length));
  const corners = [[0.5, 0.5, 0.5], [n + 0.5, 0.5, 0.5], [n + 0.5, n + 0.5, 0.5]].map(screenOf);
  fig.picCentre = [(corners[0][0] + corners[1][0] + corners[2][0]) / 3, (corners[0][1] + corners[1][1] + corners[2][1]) / 3];

  // guides for the reveal: the jump of the cut half, and the ghost of the
  // cube that would close the loop in space
  const dash = new THREE.LineDashedMaterial({ color: RED, dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0, depthTest: false });
  const dotMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthTest: false });
  const last = cells[cells.length - 1];
  const a = new THREE.Vector3(last[0] + 0.5, last[1] + 0.5, last[2] + 0.5);
  const bpt = a.clone().addScalar(-n);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([bpt, a]), dash);
  line.computeLineDistances();
  fig.guides.add(line);
  for (const q of [a, bpt]) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), dotMat);
    dot.position.copy(q);
    fig.guides.add(dot);
  }
  // ghost cube at n·(1,1,1): where the loop would have to close in space
  const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    new THREE.LineDashedMaterial({ color: RED, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0 }));
  ghost.position.set(n + 0.5, n + 0.5, n + 0.5);
  ghost.computeLineDistances();
  fig.guides.add(ghost);
  const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.5, 0.5, 0.5), new THREE.Vector3(n + 0.5, n + 0.5, n + 0.5)]),
    new THREE.LineDashedMaterial({ color: RED, dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0, depthTest: false }));
  link.computeLineDistances();
  fig.guides.add(link);
  setPivots();
}

// ------------------------------------------------------------------ paper grid
// Faint isometric graph paper in the picture plane, behind the figure.
const grid = (() => {
  const pts = [];
  const D = -40; // the plane x + y + z = D
  const dirs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((d) => new THREE.Vector3(...d).addScalar(-1 / 3).normalize());
  const base = new THREE.Vector3(D / 3, D / 3, D / 3);
  for (let k = 0; k < 3; k++) {
    const d = dirs[k];
    const off = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 1, 1).normalize()); // across the lines
    const step = Math.SQRT1_2; // through every corner of the cube lattice
    for (let i = -60; i <= 60; i++) {
      const o = base.clone().addScaledVector(off, i * step);
      pts.push(o.clone().addScaledVector(d, -40), o.clone().addScaledVector(d, 40));
    }
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = new THREE.LineBasicMaterial({ color: 0x9c8f78, transparent: true, opacity: 0.16 });
  const l = new THREE.LineSegments(g, m);
  l.renderOrder = -2;
  scene.add(l);
  return l;
})();

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
const view = { az: ISO_AZ, el: ISO_EL, roll: ROLL, zoom: 1, panX: 0, panY: 0, k: 0 };
const isoPivot = new THREE.Vector3();
const pivot = new THREE.Vector3();
let aspect = 30 / 38, VH = 7;

function fromScreen(X, Y, depth) {
  const u = X * Math.SQRT2, v = Y * Math.sqrt(6);
  const y = (depth + v) / 3, xz = 2 * y - v;
  return [(xz + u) / 2, y, (xz - u) / 2];
}
function setPivots() {
  const c = fig.centre;
  isoPivot.set(...fromScreen(fig.picCentre[0], fig.picCentre[1], c.x + c.y + c.z));
  VH = (fig.n + 1) * 2.05; // the triangle's height plus a margin
  updateCamera();
}
function updateCamera() {
  const ce = Math.cos(view.el), se = Math.sin(view.el);
  const dir = new THREE.Vector3(ce * Math.sin(view.az), se, ce * Math.cos(view.az));
  const right = new THREE.Vector3(Math.cos(view.az), 0, -Math.sin(view.az));
  const up = new THREE.Vector3().crossVectors(dir, right);
  const r2 = right.clone().multiplyScalar(Math.cos(view.roll)).addScaledVector(up, Math.sin(view.roll));
  const u2 = up.clone().multiplyScalar(Math.cos(view.roll)).addScaledVector(right, -Math.sin(view.roll));
  pivot.copy(isoPivot).lerp(fig.centre, view.k);
  const target = pivot.clone().addScaledVector(r2, view.panX).addScaledVector(u2, view.panY);
  camera.position.copy(target).addScaledVector(dir, 1500);
  camera.up.copy(u2);
  camera.lookAt(target);
  const h = VH / 2 / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}
fitFrame(30 / 38, (w, h) => { renderer.setSize(w, h); aspect = w / h; updateCamera(); });

// ------------------------------------------------------------------ timeline
// Each cycle: the cubes arrive one by one, the triangle holds, then they lift
// away in reverse order.
const STEP = 0.75, DROP = 0.6, HOLD = 5.0, LEAVE = 0.18, GAP = 1.0;
function cycleLength() { const N = fig.cubes.length; return N * STEP + HOLD + N * LEAVE + 0.6 + GAP; }
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { litho: 1, lithoTarget: 1, playing: true, revealed: false, tween: null, t: 0, manual: null };

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
// Returns, for cube i at time t: [arrival progress 0..1, departure progress 0..1]
function cubeState(i, t) {
  const N = fig.cubes.length;
  if (state.manual !== null) return [i < state.manual ? 1 : 0, 0];
  const tc = ((t % cycleLength()) + cycleLength()) % cycleLength();
  const tin = tc - i * STEP;
  const arrive = Math.min(1, Math.max(0, tin / DROP));
  const tout = tc - (N * STEP + HOLD + (N - 1 - i) * LEAVE);
  const leave = Math.min(1, Math.max(0, tout / 0.6));
  return [arrive, leave];
}
function placed(t) {
  let k = 0;
  fig.cubes.forEach((_, i) => { const [a, l] = cubeState(i, t); if (a >= 1 && l <= 0) k++; });
  return k;
}

// ------------------------------------------------------------------ ui
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; if (on) state.manual = null; });
const btnReveal = document.getElementById('btn-reveal');
const hint = document.getElementById('hint');
const setFigure = segmented([[document.getElementById('btn-9'), 3], [document.getElementById('btn-15'), 5]], (n) => {
  if (n !== fig.n || !fig.cubes.length) buildFigure(n);
  state.t = reduced ? fig.cubes.length * STEP : 0;
}, 3);
void setFigure;

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function animateView(to, dur = 2.0) { state.tween = { from: { ...view }, to: { ...view, ...to }, t: 0, dur }; }
function setRevealed(on) {
  state.revealed = on;
  btnReveal.setAttribute('aria-pressed', String(on));
  btnReveal.querySelector('span').textContent = on ? 'Back to the isometric view' : 'Reveal the trick';
  hint.textContent = on ? 'Drag to turn the cubes · scroll to zoom' : '← → place or remove one cube · drag to pan · scroll to zoom';
  if (on) animateView({ ...REVEAL, panX: 0, panY: 0 });
  else animateView({ az: ISO_AZ, el: ISO_EL, roll: ROLL, zoom: 1, panX: 0, panY: 0, k: 0 });
}
function resetView() {
  if (state.revealed) setRevealed(false);
  else animateView({ zoom: 1, panX: 0, panY: 0 }, 0.8);
}
btnReveal.addEventListener('click', () => setRevealed(!state.revealed));
function stepCubes(d) {
  if (state.manual === null) state.manual = placed(state.t);
  setPlaying(false);
  state.manual = Math.max(0, Math.min(fig.cubes.length, state.manual + d));
}
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRevealed(!state.revealed),
  0: resetView,
  ArrowRight: () => stepCubes(1),
  ArrowLeft: () => stepCubes(-1),
});

// pointer: drag pans (orbits when revealed), wheel zooms
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; state.tween = null; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag = { x: e.clientX, y: e.clientY };
  const unitsPerPx = VH / view.zoom / canvas.clientHeight;
  if (state.revealed) {
    view.az -= dx * 0.006;
    view.el = Math.min(1.45, Math.max(-1.2, view.el + dy * 0.004));
  } else { view.panX -= dx * unitsPerPx; view.panY += dy * unitsPerPx; }
  updateCamera();
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', resetView);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.tween = null;
  view.zoom = Math.min(5, Math.max(0.4, view.zoom * Math.exp(-e.deltaY * 0.0015)));
  updateCamera();
}, { passive: false });

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.t += dt;
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    uniforms.uLitho.value = state.litho;
    renderer.setClearColor(PAPER.clone().lerp(PAPER_C, 1 - state.litho), 1);
  }
  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = ease(tw.t);
    for (const key of ['az', 'el', 'roll', 'zoom', 'panX', 'panY', 'k']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * k;
    if (tw.t >= 1) state.tween = null;
    updateCamera();
  }
  // cubes drop in from above the drawing and lift away again
  fig.cubes.forEach((c, i) => {
    const [a, l] = cubeState(i, state.t);
    const vis = a * (1 - l);
    c.mesh.visible = vis > 0.001;
    c.u.uFade.value = vis;
    c.mesh.position.y = (1 - easeOut(a)) * 1.6 + l * l * 1.6;
    c.mesh.material.depthWrite = vis > 0.98;
  });
  const off = Math.hypot(view.az - ISO_AZ, view.el - ISO_EL);
  grid.material.opacity = 0.16 * Math.max(0, 1 - off / 0.15);
  grid.visible = grid.material.opacity > 0.002;
  const g = Math.min(1, Math.max(0, (off - 0.12) / 0.3));
  fig.guides.visible = g > 0;
  fig.guides.children.forEach((c) => { c.material.opacity = g * (c.isLineSegments ? 0.8 : 1); });
  setBadge(off > 0.02, 'Off the isometric axis: the cubes form an open spiral');
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
if (!fig.cubes.length) buildFigure(3);
markReady();
requestAnimationFrame(frame);

window.__page = { view, state, setRevealed, setPlaying, updateCamera, fig, buildFigure, stepCubes };
