// The endless staircase: a closed loop of stairs on a roof that always climbs,
// drawn in true isometric. See stairs.js for the construction.

import * as THREE from 'three';
import { Builder } from '../../../src/builder.js';
import { createSharedUniforms, makeInkMaterial } from './ink.js';
import { buildStairs, LAND, RISE, BASE } from './stairs.js';
import { sceneryMesh } from './scenery.js';
import { Walkers } from './walkers.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

const ISO_AZ = Math.PI / 4;
const ISO_EL = Math.atan(1 / Math.SQRT2); // 35.264°
const VIEW = { X: -2.1, Y: -6.6, H: 25.5 }; // composition centre and height, screen units
const REVEAL = { az: ISO_AZ - 0.6, el: 0.6, zoom: 0.86, k: 1 };

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_C = new THREE.Color(0xe9e6dc);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const uniforms = createSharedUniforms();
const ink = makeInkMaterial(uniforms);

// the building and its stair: the real structure
{
  const b = new Builder();
  buildStairs(b);
  const mesh = new THREE.Mesh(b.build(), ink);
  mesh.frustumCulled = false;
  scene.add(mesh);
}
// the surroundings, which step aside for the reveal
const dressUniforms = { ...uniforms, uFade: { value: 1 } };
const dressing = sceneryMesh(new Builder(), makeInkMaterial(dressUniforms, { transparent: true }));
dressing.renderOrder = -1;
scene.add(dressing);

const walkers = new Walkers(ink);
scene.add(walkers.group);

// Guides for the reveal: the cut through the closing landing, from the foot of
// the stair to the top. They run along the line of sight, so from the
// isometric angle each is a single point.
const RED = 0xa23b2a;
const guides = new THREE.Group();
{
  const mat = new THREE.LineDashedMaterial({ color: RED, dashSize: 0.45, gapSize: 0.3, transparent: true, opacity: 0, depthTest: false });
  const dotMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthTest: false });
  const add = (p) => {
    const a = new THREE.Vector3(...p);
    const c = a.clone().addScalar(RISE);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, c]), mat);
    line.computeLineDistances();
    guides.add(line);
    for (const q of [a, c]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), dotMat);
      dot.position.copy(q);
      guides.add(dot);
    }
  };
  add([0, 0.02, 0]); // centre of the closing landing
  add([-1.2, 0.02, -1.2]); // its outer corner
  add([1.2, 0.02, 1.2]); // its inner corner, over the light well
  guides.renderOrder = 20;
  scene.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
function fromScreen(X, Y, depth) {
  const u = X * Math.SQRT2, v = Y * Math.sqrt(6);
  const y = (depth + v) / 3, xz = 2 * y - v;
  return [(xz + u) / 2, y, (xz - u) / 2];
}
const CENTRE = new THREE.Vector3(6.5, -1.0, 6.5); // middle of the real spiral
const isoPivot = new THREE.Vector3(...fromScreen(VIEW.X, VIEW.Y, CENTRE.x + CENTRE.y + CENTRE.z));
const pivot = new THREE.Vector3();
const view = { az: ISO_AZ, el: ISO_EL, zoom: 1, panX: 0, panY: 0, k: 0 };
let aspect = 30 / 38;

function updateCamera() {
  const ce = Math.cos(view.el), se = Math.sin(view.el);
  const dir = new THREE.Vector3(ce * Math.sin(view.az), se, ce * Math.cos(view.az));
  const right = new THREE.Vector3(Math.cos(view.az), 0, -Math.sin(view.az));
  const up = new THREE.Vector3().crossVectors(dir, right);
  pivot.copy(isoPivot).lerp(CENTRE, view.k);
  const target = pivot.clone().addScaledVector(right, view.panX).addScaledVector(up, view.panY);
  camera.position.copy(target).addScaledVector(dir, 1500);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  const h = VIEW.H / 2 / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  updateCamera();
});

// ------------------------------------------------------------------ ui
setupPanel();
const state = { litho: 1, lithoTarget: 1, playing: true, revealed: false, tween: null, t: 0 };
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });
const btnReveal = document.getElementById('btn-reveal');
const hint = document.getElementById('hint');

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function animateView(to, dur = 2.2) { state.tween = { from: { ...view }, to: { ...view, ...to }, t: 0, dur }; }

function setRevealed(on) {
  state.revealed = on;
  btnReveal.setAttribute('aria-pressed', String(on));
  btnReveal.querySelector('span').textContent = on ? 'Back to the isometric view' : 'Reveal the trick';
  hint.textContent = on ? 'Drag to turn the real building · scroll to zoom' : 'Drag to pan · scroll to zoom · double-click to reset';
  if (on) animateView({ ...REVEAL, panX: 0, panY: 0 });
  else animateView({ az: ISO_AZ, el: ISO_EL, zoom: 1, panX: 0, panY: 0, k: 0 });
}
function resetView() {
  if (state.revealed) setRevealed(false);
  else animateView({ zoom: 1, panX: 0, panY: 0 }, 0.8);
}
btnReveal.addEventListener('click', () => setRevealed(!state.revealed));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRevealed(!state.revealed),
  0: resetView,
});

// pointer: drag pans (orbits when revealed), wheel zooms about the cursor
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY };
  state.tween = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag = { x: e.clientX, y: e.clientY };
  const unitsPerPx = VIEW.H / view.zoom / canvas.clientHeight;
  if (state.revealed) {
    view.az -= dx * 0.006;
    view.el = Math.min(1.45, Math.max(0.05, view.el + dy * 0.004));
  } else {
    view.panX -= dx * unitsPerPx;
    view.panY += dy * unitsPerPx;
  }
  updateCamera();
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', resetView);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.tween = null;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / rect.width - 0.5;
  const my = 0.5 - (e.clientY - rect.top) / rect.height;
  const before = VIEW.H / view.zoom;
  const z = Math.min(6, Math.max(0.5, view.zoom * Math.exp(-e.deltaY * 0.0015)));
  const after = VIEW.H / z;
  view.panX += mx * aspect * (before - after);
  view.panY += my * (before - after);
  view.zoom = z;
  updateCamera();
}, { passive: false });

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.t += dt;
  uniforms.uTime.value = state.t;

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
    for (const key of ['az', 'el', 'zoom', 'panX', 'panY', 'k']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * k;
    if (tw.t >= 1) state.tween = null;
    updateCamera();
  }
  const off = Math.hypot(view.az - ISO_AZ, view.el - ISO_EL);
  dressUniforms.uFade.value = Math.max(0, 1 - Math.max(0, off - 0.03) / 0.25);
  dressing.visible = dressUniforms.uFade.value > 0.001;
  const g = Math.min(1, Math.max(0, (off - 0.15) / 0.3));
  guides.visible = g > 0;
  guides.children.forEach((c) => { c.material.opacity = g; });
  setBadge(off > 0.02, 'Off the isometric axis: the stair is a spiral');

  walkers.update(state.t, off < 1e-3);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
updateCamera();
markReady();
requestAnimationFrame(frame);

window.__page = { view, state, setRevealed, setPlaying, updateCamera, LAND, BASE };
