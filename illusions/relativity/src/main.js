// Three gravities in one hall, after "Relativity" (1953).
//
// The hall is the inside corner of a cube, seen along its (1,1,1) diagonal.
// Each of its three back planes is the floor of one world. Turning the
// picture by 120° about the line of sight takes one world's "down" to the
// next one's, so the turn is a plain rotation of the camera about its own
// axis; nothing in the building moves.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { createUniforms, makeInk } from './ink.js';
import { buildHall } from './scene.js';
import { Walkers } from './walkers.js';
import { L } from './data.js';

const ASPECT = 277 / 294; // the sheet of Relativity is nearly square
const VIEW_H = 32.6; // world units across the frame height

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5);
const PAPER_C = new THREE.Color(0xe7e3d8);
renderer.setClearColor(PAPER, 1);

const scene = new THREE.Scene();
const uniforms = createUniforms();

const hall = new THREE.Mesh(buildHall(), makeInk(uniforms));
hall.frustumCulled = false;
scene.add(hall);

const walkers = new Walkers(scene, uniforms);

// ------------------------------------------------------------ camera
// Orthographic, on the cube diagonal. The roll angle turns the picture.
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
const centre = new THREE.Vector3(L / 2, L / 2, L / 2);
const axis = new THREE.Vector3(1, 1, 1).normalize();
const up0 = new THREE.Vector3(0, 1, 0).addScaledVector(axis, -axis.y).normalize(); // y, seen on screen
let aspect = ASPECT;
const view = { roll: 0, zoom: 1 };

function updateCamera() {
  camera.position.copy(centre).addScaledVector(axis, 120);
  // rotate the screen's up about the line of sight; +120° takes y to z, z to x
  camera.up.copy(up0).applyAxisAngle(axis, view.roll);
  camera.lookAt(centre);
  const h = VIEW_H / 2 / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect;
  camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}

fitFrame(ASPECT, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  // keep the whole turning hexagon inside a narrower frame
  view.zoom = Math.min(1, aspect / ASPECT);
  updateCamera();
});

// ------------------------------------------------------------ controls
setupPanel();
const state = { litho: 1, lithoTarget: 1, playing: true, t: 8, down: 0, tween: null };
const NAMES = ['I', 'II', 'III'];
const DESC = [
  'Gravity I is down: the terracotta figures stand upright',
  'Gravity II is down: the green figures stand upright',
  'Gravity III is down: the blue figures stand upright',
];

segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
  document.body.classList.toggle('colour', v === 0);
}, 1);

const downBtns = [0, 1, 2].map((i) => document.getElementById(`btn-g${i}`));
let badgeTimer = 0;
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function turnTo(i, quick) {
  // shortest way round, in steps of 120°
  const target = (i * 2 * Math.PI) / 3;
  let d = target - view.roll;
  d = ((d % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  state.down = i;
  downBtns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  if (quick || Math.abs(d) < 1e-4) { view.roll += d; state.tween = null; updateCamera(); }
  else state.tween = { from: view.roll, to: view.roll + d, t: 0, dur: 1.2 + Math.abs(d) * 0.6 };
  setBadge(true, DESC[i]);
  badgeTimer = 3.5;
}
downBtns.forEach((b, i) => b.addEventListener('click', () => turnTo(i)));
document.getElementById('btn-turn').addEventListener('click', () => turnTo((state.down + 1) % 3));
downBtns[0].setAttribute('aria-pressed', 'true');

const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  t: () => turnTo((state.down + 1) % 3),
  1: () => turnTo(0),
  2: () => turnTo(1),
  3: () => turnTo(2),
  0: () => turnTo(state.down),
});

// drag to turn the print by hand; on release it settles on the nearest gravity
let drag = null;
function angleAt(e) {
  const r = canvas.getBoundingClientRect();
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
}
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { a: angleAt(e), moved: 0 };
  state.tween = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const a = angleAt(e);
  let d = a - drag.a;
  d = ((d + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
  drag.a = a;
  drag.moved += Math.abs(d);
  // screen y points down, so a clockwise drag is a positive d. A positive roll
  // turns the camera anticlockwise about the line of sight, which turns the
  // picture clockwise: it follows the hand.
  view.roll += d;
  updateCamera();
});
const endDrag = () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  const step = (2 * Math.PI) / 3;
  const i = ((Math.round(view.roll / step) % 3) + 3) % 3;
  if (moved > 0.02) turnTo(i);
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => turnTo(0));

// ------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.t += dt;
  uniforms.uTime.value = state.t;

  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    renderer.setClearColor(PAPER.clone().lerp(PAPER_C, 1 - state.litho), 1);
  }
  uniforms.uLitho.value = state.litho;
  uniforms.uTint.value = 1 - state.litho;

  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    view.roll = tw.from + (tw.to - tw.from) * ease(tw.t);
    if (tw.t >= 1) state.tween = null;
    updateCamera();
  }
  if (badgeTimer > 0) { badgeTimer -= dt; if (badgeTimer <= 0) setBadge(false); }

  walkers.update(state.t);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
updateCamera();
markReady();
requestAnimationFrame(frame);

// debug handle for screenshots
window.__page = {
  state, view, walkers, turnTo, updateCamera,
  setTime: (t) => { state.t = t; },
  setRoll: (r) => { view.roll = r; state.tween = null; updateCamera(); },
  setLitho: (v) => { state.litho = state.lithoTarget = v; uniforms.uLitho.value = v; uniforms.uTint.value = 1 - v; renderer.setClearColor(PAPER.clone().lerp(PAPER_C, 1 - v), 1); },
};
