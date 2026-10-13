// A stairwell tower drawn in curvilinear perspective, after "High and Low"
// (1947) and "House of Stairs" (1951).
//
// The camera hangs in the middle of the open well and looks level. Each
// vertex is placed by its direction from the eye (see shaders.js), so the
// picture spans 180° from bottom to top: the nadir is the point at the
// bottom of the frame, the zenith the point at the top, and every vertical
// line in the tower bows out from one to the other.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { createUniforms, makeInk, makeLine } from './shaders.js';
import { buildTower, A, W, TOP } from './tower.js';
import { Climbers } from './climbers.js';

const ASPECT = 30 / 38;
const HALF_Y = Math.PI / 2 + 0.065; // the frame reaches just past the zenith and nadir
const DRIFT = { mid: 23, amp: 17, period: 110 };

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const SKY_L = new THREE.Color(0xf1ece0), SKY_C = new THREE.Color(0xdfe6e6);
renderer.setClearColor(SKY_L, 1);

const scene = new THREE.Scene();
const uniforms = createUniforms();
uniforms.uTop.value = TOP;

const tower = new THREE.Mesh(buildTower(), makeInk(uniforms));
tower.frustumCulled = false;
scene.add(tower);

const climbers = new Climbers(scene, uniforms);

// ------------------------------------------------------------ guides
// Dashed lines along the four inside corners of the well (true verticals,
// extended far beyond the tower) and round the horizon at eye level.
const guides = new THREE.Group();
const guideMats = [];
{
  const ys = [];
  for (let y = -900; y < -80; y += 20) ys.push(y);
  for (let y = -80; y <= 140; y += 0.5) ys.push(y);
  for (let y = 160; y <= 1000; y += 20) ys.push(y);
  const mat = makeLine(uniforms, 0xa23b2a, 0.9);
  guideMats.push(mat);
  for (const [x, z] of [[A, A], [-A, A], [A, -A], [-A, -A]]) {
    const pos = [], dist = [];
    for (let i = 0; i < ys.length - 1; i++) {
      pos.push(x, ys[i], z, x, ys[i + 1], z);
      dist.push(ys[i], ys[i + 1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('dist', new THREE.Float32BufferAttribute(dist, 1));
    const l = new THREE.LineSegments(g, mat); l.frustumCulled = false;
    guides.add(l);
  }
  // horizon: a level circle round the eye
  const hm = makeLine(uniforms, 0x2f5f8a, 0.7);
  guideMats.push(hm);
  const pos = [], dist = [];
  const N = 720, R = W;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
    pos.push(R * Math.cos(a0), 0, R * Math.sin(a0), R * Math.cos(a1), 0, R * Math.sin(a1));
    dist.push(a0 * R, a1 * R);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('dist', new THREE.Float32BufferAttribute(dist, 1));
  const horizon = new THREE.LineSegments(g, hm); horizon.frustumCulled = false;
  guides.add(horizon);
  guides.userData.horizon = horizon;
  guides.renderOrder = 10;
  scene.add(guides);
}
const labels = {
  zenith: document.getElementById('lbl-zenith'),
  nadir: document.getElementById('lbl-nadir'),
  horizon: document.getElementById('lbl-horizon'),
};

// a dummy camera: the projection is done in the vertex shader
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

// ------------------------------------------------------------ view
const view = { yaw: 0.3, height: 0, morph: 1, morphTarget: 1, guides: 0, guidesTarget: 0 };
let aspect = ASPECT;
fitFrame(ASPECT, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  uniforms.uHalf.value.set(HALF_Y * aspect, HALF_Y);
});

// project a direction (in camera angles) to the frame, as the shader does
function projectDir(phi, lam, s) {
  let x, y;
  if (s < 1e-3) { x = phi; y = lam; } else {
    const lim = 1.56;
    y = Math.tan(Math.max(-lim, Math.min(lim, s * lam))) / s;
    x = Math.tan(Math.max(-lim, Math.min(lim, s * phi))) / s / Math.pow(Math.max(Math.cos(lam), 1e-3), s);
  }
  return [x / uniforms.uHalf.value.x, y / uniforms.uHalf.value.y];
}
function placeLabel(el, ndc, show) {
  const ok = show && Math.abs(ndc[0]) < 0.98 && Math.abs(ndc[1]) < 0.995;
  el.style.opacity = ok ? String(view.guides) : '0';
  if (ok) {
    el.style.left = `${(ndc[0] * 0.5 + 0.5) * 100}%`;
    el.style.top = `${(0.5 - ndc[1] * 0.5) * 100}%`;
  }
}

// ------------------------------------------------------------ controls
setupPanel();
const state = { t: 0, litho: 1, lithoTarget: 1, playing: true };
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });

const slider = document.getElementById('morph');
slider.addEventListener('input', () => { view.morphTarget = slider.value / 1000; view.morph = view.morphTarget; });
function setMorph(m) { view.morphTarget = Math.max(0, Math.min(1, m)); slider.value = String(Math.round(view.morphTarget * 1000)); }

const guideBtn = document.getElementById('btn-guides');
function setGuides(on) {
  view.guidesTarget = on ? 1 : 0;
  guideBtn.setAttribute('aria-pressed', String(on));
}
guideBtn.addEventListener('click', () => setGuides(!view.guidesTarget));

keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  g: () => setGuides(!view.guidesTarget),
  c: () => setMorph(view.morphTarget > 0.5 ? 0 : 1),
  '[': () => setMorph(view.morphTarget - 0.1),
  ']': () => setMorph(view.morphTarget + 0.1),
  ArrowLeft: () => { view.yaw -= 0.15; },
  ArrowRight: () => { view.yaw += 0.15; },
  ArrowUp: () => { view.height += 2; },
  ArrowDown: () => { view.height -= 2; },
  0: () => { view.yaw = 0.3; view.height = 0; },
});

// drag: sideways turns, up and down rises and sinks
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag = { x: e.clientX, y: e.clientY };
  view.yaw += (dx / canvas.clientWidth) * 2.4;
  view.height += (dy / canvas.clientHeight) * 30;
});
const end = () => { drag = null; };
canvas.addEventListener('pointerup', end);
canvas.addEventListener('pointercancel', end);
canvas.addEventListener('dblclick', () => { view.yaw = 0.3; view.height = 0; });

// ------------------------------------------------------------ loop
function eyeHeight() {
  const y = DRIFT.mid + view.height + DRIFT.amp * Math.sin((state.t / DRIFT.period) * Math.PI * 2);
  return Math.max(2.5, Math.min(TOP - 3, y));
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.t += dt;
  uniforms.uTime.value = state.t;

  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    renderer.setClearColor(SKY_L.clone().lerp(SKY_C, 1 - state.litho), 1);
  }
  uniforms.uLitho.value = state.litho;

  view.morph += (view.morphTarget - view.morph) * Math.min(1, dt * 3.5);
  if (Math.abs(view.morphTarget - view.morph) < 1e-4) view.morph = view.morphTarget;
  uniforms.uS.value = 1 - view.morph;
  view.guides += Math.sign(view.guidesTarget - view.guides) * Math.min(Math.abs(view.guidesTarget - view.guides), dt * 3);
  guideMats.forEach((m) => { m.uniforms.uOpacity.value = view.guides; });
  guides.visible = view.guides > 0.001;

  const eye = uniforms.uEye.value;
  eye.set(0, eyeHeight(), 0);
  const f = uniforms.uFwd.value.set(Math.sin(view.yaw), 0, -Math.cos(view.yaw));
  uniforms.uRight.value.crossVectors(f, uniforms.uUp.value).normalize();
  guides.userData.horizon.position.y = eye.y;

  const s = uniforms.uS.value;
  placeLabel(labels.zenith, projectDir(0, Math.PI / 2 - 1e-4, s), true);
  placeLabel(labels.nadir, projectDir(0, -Math.PI / 2 + 1e-4, s), true);
  placeLabel(labels.horizon, projectDir(0.62, 0, s), true);

  climbers.update(state.t);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);

window.__page = {
  view, state, uniforms, setMorph, setGuides,
  setTime: (t) => { state.t = t; },
  setLitho: (v) => { state.litho = state.lithoTarget = v; uniforms.uLitho.value = v; renderer.setClearColor(SKY_L.clone().lerp(SKY_C, 1 - v), 1); },
  setMorphNow: (m) => { setMorph(m); view.morph = view.morphTarget; },
  setGuidesNow: (on) => { setGuides(on); view.guides = on ? 1 : 0; },
};
void setBadge;
