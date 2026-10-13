// Möbius Lattice: ants on a one-sided band.
//
// The band is the parametric surface in band.js with a lattice cut out of it.
// Nine ants walk its centre strap in single file. Each ant's place is a
// number Σ in [0, 4π): after Σ = 2π it is back over its starting point but on
// the far face, upside down; only at Σ = 4π (720°) is it home.

import * as THREE from 'three';
import { createUniforms, makeMaterial } from './ink.js';
import { buildBand, roadFrame, R } from './band.js';
import { Ant, makeAntGeometry, STRIDE } from './ant.js';
import { fitFrame, setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';

const TAU = Math.PI * 2;
const FOUR_PI = Math.PI * 4;
const N_ANTS = 9;
const SPEED = 0.5; // units per second along the centre line
const ORBIT = 0.045; // radians per second
const ASPECT = 30 / 38;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_COLOUR = new THREE.Color(0xe7e3d8);
renderer.setClearColor(PAPER, 1);

const scene = new THREE.Scene();
const uniforms = createUniforms();
const mat = makeMaterial(uniforms);

// the band stands upright, leaning back a touch
const band = new THREE.Group();
band.rotation.set(-0.3, 0, 0.06);
scene.add(band);
const bandMesh = new THREE.Mesh(buildBand({ face: 0xdfe2c8, wall: 0x8e9878 }), mat);
band.add(bandMesh);

// ants
const antGeo = makeAntGeometry(0x3b2620, 4);
const leadGeo = makeAntGeometry(0xb8432c, 5);
const ants = [];
for (let i = 0; i < N_ANTS; i++) {
  const a = new Ant(i === 0 ? leadGeo : antGeo, mat);
  band.add(a.root);
  ants.push(a);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.PerspectiveCamera(28, ASPECT, 0.5, 200);
const view = { az: 2.2, el: 0.4, dist: 24, auto: true, resume: 0 };
const TARGET = new THREE.Vector3(0, -1.0, 0);
// The light turns with the camera (from the upper left, in front), so the
// orbit never swings round into an all-shadow view.
const LIGHT_CAM = new THREE.Vector3(-0.42, 0.78, 0.46).normalize();
function updateCamera() {
  const ce = Math.cos(view.el);
  camera.position.set(TARGET.x + view.dist * ce * Math.sin(view.az), TARGET.y + view.dist * Math.sin(view.el), TARGET.z + view.dist * ce * Math.cos(view.az));
  camera.lookAt(TARGET);
  camera.updateMatrixWorld();
  uniforms.uLight.value.copy(LIGHT_CAM).transformDirection(camera.matrixWorld);
}
fitFrame(ASPECT, (w, h) => {
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// ------------------------------------------------------------------ state
const state = {
  playing: true,
  litho: 1,
  lithoTarget: 1,
  time: 0,
  lead: Math.PI * 0.5, // Σ of the lead ant
  start: Math.PI * 0.5, // where the lead ant's count began
  paintOn: false,
  paint: 0,
};
uniforms.uPaintFrom.value = state.start;
uniforms.uMark.value = state.start;

// ------------------------------------------------------------------ readout
const ro = {
  deg: document.getElementById('ro-deg'),
  lap: document.getElementById('ro-lap'),
  dot: document.getElementById('ro-dot'),
  trail: document.getElementById('ro-trail'),
  ant: document.getElementById('ro-ant'),
};
// a two-turn spiral: the first lap on the outside, the second inside
const SP = { cx: 30, cy: 30, r0: 26, r1: 12 };
function spiralPoint(a) { // a in [0, 4π]
  const r = SP.r0 + (SP.r1 - SP.r0) * (a / FOUR_PI);
  const th = -Math.PI / 2 + a;
  return [SP.cx + r * Math.cos(th), SP.cy + r * Math.sin(th)];
}
{
  const path = [];
  for (let i = 0; i <= 160; i++) path.push(spiralPoint((i / 160) * FOUR_PI).map((v) => v.toFixed(2)).join(','));
  document.getElementById('ro-track').setAttribute('points', path.join(' '));
  const [x0, y0] = spiralPoint(0), [x1, y1] = spiralPoint(TAU), [x2, y2] = spiralPoint(FOUR_PI);
  document.getElementById('ro-t0').setAttribute('cx', x0); document.getElementById('ro-t0').setAttribute('cy', y0);
  document.getElementById('ro-t1').setAttribute('cx', x1); document.getElementById('ro-t1').setAttribute('cy', y1);
  document.getElementById('ro-t2').setAttribute('cx', x2); document.getElementById('ro-t2').setAttribute('cy', y2);
}
let lastText = '';
function updateReadout() {
  const a = (((state.lead - state.start) % FOUR_PI) + FOUR_PI) % FOUR_PI;
  const deg = Math.floor((a * 180) / Math.PI);
  const [x, y] = spiralPoint(a);
  ro.dot.setAttribute('cx', x.toFixed(2));
  ro.dot.setAttribute('cy', y.toFixed(2));
  const pts = [];
  for (let i = 0; i <= 64; i++) pts.push(spiralPoint((i / 64) * a).map((v) => v.toFixed(2)).join(','));
  ro.trail.setAttribute('points', pts.join(' '));
  // the ant icon turns over on the second lap
  ro.ant.style.transform = a < TAU ? 'none' : 'scaleY(-1)';
  let text;
  if (deg < 8) text = 'At the start mark, right way up';
  else if (a < TAU - 0.14) text = 'First time round';
  else if (a < TAU + 0.14) text = 'Over the start mark, but on the far face';
  else if (a < FOUR_PI - 0.14) text = 'Second time round, on the far face';
  else text = 'Home again after 720°';
  const t = `${deg}°`;
  if (ro.deg.textContent !== t) ro.deg.textContent = t;
  if (text !== lastText) { ro.lap.textContent = text; lastText = text; }
}

// ------------------------------------------------------------------ ui
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });
const paintBtn = document.getElementById('btn-paint');
function setPaint(on) {
  state.paintOn = on;
  paintBtn.setAttribute('aria-pressed', String(on));
  if (on) {
    // start the brush at the lead ant and run it forward along the road
    uniforms.uPaintFrom.value = state.lead;
    state.paint = 0;
  }
}
paintBtn.addEventListener('click', () => setPaint(!state.paintOn));
keys({
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  p: () => paintBtn.click(),
  ' ': () => setPlaying(!state.playing),
  '0': () => { view.auto = true; },
});

// drag to turn the view; it drifts on by itself again after a while
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY };
  view.auto = false;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  view.az -= (e.clientX - drag.x) * 0.006;
  view.el = Math.max(-1.2, Math.min(1.2, view.el + (e.clientY - drag.y) * 0.005));
  drag = { x: e.clientX, y: e.clientY };
});
const endDrag = () => { if (drag) { drag = null; view.resume = 4; } };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => { view.auto = true; view.resume = 0; });

// ------------------------------------------------------------------ loop
const tmpM = new THREE.Matrix4();
const vL = new THREE.Vector3(), vU = new THREE.Vector3(), vF = new THREE.Vector3();

function placeAnts() {
  const spacing = FOUR_PI / N_ANTS;
  for (let i = 0; i < N_ANTS; i++) {
    const S = state.lead - i * spacing;
    const f = roadFrame(((S % FOUR_PI) + FOUR_PI) % FOUR_PI);
    vU.set(...f.up);
    vF.set(...f.fwd);
    vL.crossVectors(vU, vF).normalize();
    vF.crossVectors(vL, vU).normalize();
    tmpM.makeBasis(vL, vU, vF);
    const a = ants[i];
    a.root.quaternion.setFromRotationMatrix(tmpM);
    a.root.position.set(...f.p);
    a.pose(((S * R) / STRIDE) * TAU + i * 0.7, state.time + i * 1.3);
  }
}

function step(dt, rdt) {
  state.time += dt;
  uniforms.uTime.value = state.time;
  state.lead += (SPEED / R) * dt;
  if (state.lead > 1e4) state.lead -= FOUR_PI * 400;

  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), rdt * 2.2);
    uniforms.uLitho.value = state.litho;
    renderer.setClearColor(PAPER_COLOUR.clone().lerp(PAPER, state.litho), 1);
  }
  // the brush runs round both laps in about seven seconds; off, it drains back
  if (state.paintOn) state.paint = Math.min(1, state.paint + rdt / 7);
  else state.paint = Math.max(0, state.paint - rdt / 1.2);
  uniforms.uPaint.value = state.paint;

  if (!view.auto && !drag && view.resume > 0) {
    view.resume -= rdt;
    if (view.resume <= 0) view.auto = true;
  }
  if (view.auto) view.az += ORBIT * dt;
  updateCamera();
  placeAnts();
  updateReadout();
}

let last = performance.now();
function frame(now) {
  const rdt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  step(state.playing ? rdt : 0, rdt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

updateCamera();
placeAnts();
updateReadout();
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, view, band, uniforms, setPaint, setPlaying,
  antScreen(i) {
    const v = new THREE.Vector3();
    ants[i].root.getWorldPosition(v);
    v.project(camera);
    const r = canvas.getBoundingClientRect();
    return [(v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height];
  },
  set(o = {}) {
    if (o.lead !== undefined) state.lead = state.start + (o.lead * Math.PI) / 180;
    if (o.az !== undefined) view.az = o.az;
    if (o.el !== undefined) view.el = o.el;
    if (o.dist !== undefined) view.dist = o.dist;
    if (o.auto !== undefined) view.auto = o.auto;
    if (o.paint !== undefined) setPaint(o.paint);
    if (o.paintAmount !== undefined) state.paint = o.paintAmount;
    if (o.litho !== undefined) { state.lithoTarget = o.litho; state.litho = o.litho; uniforms.uLitho.value = o.litho; renderer.setClearColor(PAPER_COLOUR.clone().lerp(PAPER, o.litho), 1); }
    if (o.playing !== undefined) setPlaying(o.playing);
    if (o.tilt) band.rotation.set(...o.tilt);
    if (o.advance) for (let i = 0; i < o.advance * 30; i++) step(1 / 30, 1 / 30);
    step(0, 0);
  },
};
