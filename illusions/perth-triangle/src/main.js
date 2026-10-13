// The Impossible Triangle, East Perth: a real, open object of three square
// bars that closes into a Penrose triangle from exactly one point in a park.
// The camera walks a ring path round it, passes through that point and on.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { createSharedUniforms } from '../../../src/materials.js';
import { inkMaterial } from './ink.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { solvePose, P, K, F, GAP, L, W0, DIST, EYE, HW } from './geometry.js';
import { buildSculpture } from './sculpture.js';
import { buildPark, buildCasters } from './park.js';

// ------------------------------------------------------------------ pose
const pose = solvePose();
const EYE_W = pose.eye.clone(); // the sweet spot, at eye height
const FAR_W = pose.world(P[0]);
const NEAR_W = pose.world(P[3]);
const RING_R = Math.hypot(EYE_W.x, EYE_W.z);
const TH_V = Math.atan2(EYE_W.x, EYE_W.z);
const TARGET = pose.world(P[1]).add(pose.world(P[2])).add(FAR_W.clone().add(NEAR_W).multiplyScalar(0.5)).multiplyScalar(1 / 3);
TARGET.y += 0.15;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), SKY = new THREE.Color(0xe3e6df);
renderer.setClearColor(PAPER, 1);

const scene = new THREE.Scene();
const uniforms = createSharedUniforms();
// light from above and slightly behind the visitor at the sweet spot, so the
// three visible faces of every bar read as light, mid and dark
uniforms.uLight.value.set(-0.15, 0.66, 0.73).normalize();
uniforms.uHatch = { value: 3.0 };
const ink = inkMaterial(uniforms);

// ------------------------------------------------------------------ the scene
const sculptureStyle = st(0xe0bb7c, PAT.PLAIN);
const cutBuilder = new Builder();
const sculptureGeo = (() => {
  const b = new Builder();
  b.push(pose.M);
  cutBuilder.push(pose.M);
  buildSculpture(b, sculptureStyle, cutBuilder);
  b.pop();
  return b.build();
})();
const sculpture = new THREE.Mesh(sculptureGeo, ink);
sculpture.frustumCulled = false;
scene.add(sculpture);
const cutFaces = new THREE.Mesh(cutBuilder.build(), ink);
cutFaces.frustumCulled = false;
scene.add(cutFaces);

const posts = [pose.world(P[1]), pose.world(P[2])];
const bAxis = new THREE.Vector3(0, 1, 0).transformDirection(pose.R);
const park = (() => {
  const b = new Builder();
  buildPark(b, EYE_W, posts, bAxis);
  const m = new THREE.Mesh(b.build(), ink);
  m.frustumCulled = false;
  return m;
})();
scene.add(park);

// cast shadows: everything that stands up, flattened onto the ground along the light
{
  const Ld = uniforms.uLight.value;
  const h = 0.06;
  const m = new THREE.Matrix4().set(
    1, -Ld.x / Ld.y, 0, (Ld.x * h) / Ld.y,
    0, 0, 0, h,
    0, -Ld.z / Ld.y, 1, (Ld.z * h) / Ld.y,
    0, 0, 0, 1,
  );
  const mat = new THREE.MeshBasicMaterial({
    color: 0x2a251e, transparent: true, opacity: 0.3, depthWrite: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
    side: THREE.DoubleSide,
  });
  const cb = new Builder();
  buildCasters(cb, EYE_W);
  for (const geo of [sculptureGeo, cutFaces.geometry, cb.build()]) {
    const sm = new THREE.Mesh(geo, mat);
    sm.matrixAutoUpdate = false;
    sm.matrix.copy(m);
    sm.matrixWorldNeedsUpdate = true;
    sm.frustumCulled = false;
    sm.renderOrder = 2;
    scene.add(sm);
  }
  // posts and the visitors' feet are close enough to the ground not to matter
}

// guides: the sight line from the sweet spot through the near end to the far end
const guides = new THREE.Group();
const guideMats = [];
{
  const dash = new THREE.LineDashedMaterial({ color: 0xa23b2a, dashSize: 0.45, gapSize: 0.3, transparent: true, opacity: 0, depthTest: false });
  guideMats.push(dash);
  const line = (a, b2) => {
    const g = new THREE.BufferGeometry().setFromPoints([a, b2]);
    const l = new THREE.Line(g, dash);
    l.computeLineDistances();
    guides.add(l);
  };
  line(EYE_W, FAR_W);
  line(new THREE.Vector3(EYE_W.x, 0.05, EYE_W.z), EYE_W);
  for (const [p, r] of [[EYE_W, 0.07], [NEAR_W, 0.09], [FAR_W, 0.09]]) {
    const mm = new THREE.MeshBasicMaterial({ color: 0xa23b2a, transparent: true, opacity: 0, depthTest: false });
    guideMats.push(mm);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mm);
    dot.position.copy(p);
    guides.add(dot);
  }
  guides.renderOrder = 20;
  guides.children.forEach((c) => { c.renderOrder = 20; });
  scene.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.PerspectiveCamera(24, 30 / 38, 0.1, 700);
const view = { off: 0, fov: 24 };
function placeCamera() {
  const th = TH_V + view.off;
  camera.position.set(Math.sin(th) * RING_R, EYE, Math.cos(th) * RING_R);
  if (Math.abs(view.off) < 1e-9) camera.position.copy(EYE_W);
  camera.lookAt(view.look || TARGET);
  camera.fov = view.fov;
  camera.updateProjectionMatrix();
}
fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  camera.aspect = w / h;
  placeCamera();
});

// ------------------------------------------------------------------ the walk
// keyframes: [time (s), offset from the sweet spot (degrees)]
const KEYS = [[0, -38], [6.5, 0], [10, 0], [16.5, 38], [18, 38], [24.5, 0], [28, 0], [34.5, -38], [36, -38]];
const CYCLE = 36;
const smooth = (t) => t * t * (3 - 2 * t);
function walk(phase) {
  const t = ((phase % CYCLE) + CYCLE) % CYCLE;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, a0] = KEYS[i], [t1, a1] = KEYS[i + 1];
    if (t <= t1) return THREE.MathUtils.degToRad(a0 + (a1 - a0) * smooth((t - t0) / (t1 - t0)));
  }
  return THREE.MathUtils.degToRad(KEYS[0][1]);
}

const state = {
  playing: true,
  phase: 7, // start just arrived at the sweet spot, then walk on
  litho: 1,
  lithoTarget: 1,
  manual: null, // offset set by dragging or the button, while the walk is paused
  blend: 1, // 0..1 from the manual offset back into the walk
  tween: null,
  standing: false,
};

const btnSpot = document.getElementById('btn-spot');
function setStanding(on) {
  state.standing = on;
  btnSpot.setAttribute('aria-pressed', String(on));
}

setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => {
  if (on && !state.playing) {
    // rejoin the walk from wherever we are standing
    if (state.manual !== null) {
      state.phase = state.standing ? 10 - 0.001 : nearestPhase(state.manual);
      state.blend = state.standing ? 1 : 0;
    }
    state.tween = null;
    setStanding(false);
  }
  state.playing = on;
});
function nearestPhase(off) {
  let best = 0, bd = Infinity;
  for (let t = 0; t < CYCLE; t += 0.05) {
    const d = Math.abs(walk(t) - off) + (walk(t + 0.5) > walk(t) ? 0 : 0.001);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}
function standAtSpot() {
  if (state.standing) { setPlaying(true); return; }
  const from = state.manual ?? view.off;
  state.manual = from;
  state.tween = { from, to: 0, t: 0, dur: Math.max(0.6, Math.abs(from) * 2.6) };
  setPlaying(false);
  setStanding(true);
}
btnSpot.addEventListener('click', standAtSpot);
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  s: standAtSpot,
  ArrowLeft: () => nudge(-3),
  ArrowRight: () => nudge(3),
});
function nudge(deg) {
  setPlaying(false);
  setStanding(false);
  state.tween = null;
  state.manual = (state.manual ?? view.off) + THREE.MathUtils.degToRad(deg);
}

// drag to walk round; wheel to zoom
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX };
  setPlaying(false);
  setStanding(false);
  state.tween = null;
  state.manual = view.off;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.x = e.clientX;
  state.manual -= dx * 0.004;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  view.fov = THREE.MathUtils.clamp(view.fov * Math.exp(e.deltaY * 0.001), 10, 50);
}, { passive: false });
canvas.addEventListener('dblclick', standAtSpot);

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) {
    state.phase += dt;
    if (state.blend < 1) state.blend = Math.min(1, state.blend + dt / 1.6);
  }
  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
    state.manual = tw.from + (tw.to - tw.from) * k;
    if (tw.t >= 1) state.tween = null;
  }
  if (state.playing) {
    const w = walk(state.phase);
    view.off = state.manual === null || state.blend >= 1 ? w : state.manual + (w - state.manual) * smooth(state.blend);
    if (state.blend >= 1) state.manual = null;
  } else if (state.manual !== null) {
    view.off = state.manual;
  }
  placeCamera();

  // litho <-> colour
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    renderer.setClearColor(SKY.clone().lerp(PAPER, state.litho), 1);
  }
  uniforms.uLitho.value = state.litho;
  uniforms.uTime.value = now / 1000;

  // the guides show once you have stepped off the spot
  const dist = camera.position.distanceTo(EYE_W);
  const g = THREE.MathUtils.clamp((dist - 0.6) / 2.5, 0, 1);
  guides.visible = g > 0.001;
  guideMats.forEach((m) => { m.opacity = g * 0.9; });
  const at = dist < 0.05;
  cutFaces.visible = dist > 1e-3;
  setBadge(at && !state.noBadge, 'Sweet spot: the far end hides exactly behind the near end');
  if (at !== state.wasAt) {
    state.wasAt = at;
    if (!at && state.standing && !state.tween) setStanding(false);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

markReady();
requestAnimationFrame(frame);

// numbers for the panel
const fmt = (x, d = 1) => x.toFixed(d);
const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
setText('n-gap', fmt(GAP));
setText('n-dist', fmt(DIST));
setText('n-near', fmt(DIST - GAP));
setText('n-k', fmt(K, 2));
setText('n-taper', fmt((1 - F) * 100, 0));
setText('n-wfar', fmt(W0 * 100, 0));
setText('n-wnear', fmt(HW[3] * 200, 0));
setText('n-len', fmt(L));

// debug handle
window.__page = {
  state, view, pose,
  setOffset(deg) { setPlaying(false); setStanding(false); state.tween = null; state.manual = THREE.MathUtils.degToRad(deg); },
  stand() { setPlaying(false); state.tween = null; state.manual = 0; setStanding(true); },
  setLitho(on) { document.getElementById(on ? 'btn-litho' : 'btn-colour').click(); state.litho = on ? 1 : 0; renderer.setClearColor(SKY.clone().lerp(PAPER, state.litho), 1); },
  setFov(f) { view.fov = f; },
  setPhase(p) { state.phase = p; },
  lookApex(on) { view.look = on ? FAR_W.clone() : null; },
  scene,
};
