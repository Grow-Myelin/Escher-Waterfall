// Three Worlds: a winter pond where one surface holds three spaces at once:
// leaves floating on it, bare trees and sky mirrored in it, and a carp
// beneath it. How much of each you see is set by the angle you look at it,
// through the Fresnel equations: looking straight down, water reflects 2% of
// the light and you see through it; at a grazing angle it becomes a mirror.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';
import { buildWorld, createUniforms, makeAboveMaterial, makeSky, POSTS } from './world.js';
import { makeWaterMaterial, waterUniforms } from './water.js';
import { Leaves, LEAF_BOX } from './leaves.js';
import { Gauge } from './gauge.js';

// ------------------------------------------------------------------ constants
const ASPECT = 30 / 38;
const TARGET = new THREE.Vector3(0.25, 0, 0.35);
const DIST = 6.5;
const FOV = 36;
const EL_MIN = 4, EL_MAX = 88, EL_START = 24;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
const PAPER = new THREE.Color(0xece5d5);
renderer.setClearColor(PAPER, 1);

const u = createUniforms();
const wu = waterUniforms();
u.uWaveT = wu.uWaveT;
u.uDrops = wu.uDrops;
wu.uPosts.value.forEach((v, i) => v.set(POSTS[i].x, POSTS[i].z, POSTS[i].r, POSTS[i].top));

// ------------------------------------------------------------------ the scene
const scene = new THREE.Scene();
const sky = makeSky(u);
scene.add(sky);
const world = new THREE.Mesh(buildWorld(), makeAboveMaterial(u));
world.frustumCulled = false;
scene.add(world);
const water = new THREE.Mesh(new THREE.PlaneGeometry(140, 140).rotateX(-Math.PI / 2), makeWaterMaterial(u, wu));
water.frustumCulled = false;
scene.add(water);
const leaves = new Leaves(u);
scene.add(leaves.mesh);

// the sun's direction under the water, bent by Snell's law
{
  const s = u.uSun.value, eta = 1 / 1.333, cosi = s.y;
  const k = 1 - eta * eta * (1 - cosi * cosi);
  const t = s.clone().negate().multiplyScalar(eta).add(new THREE.Vector3(0, eta * cosi - Math.sqrt(k), 0));
  wu.uSunUW.value.copy(t.negate().normalize());
}

// ------------------------------------------------------------------ cameras + targets
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.05, 700);
const mirrorCam = new THREE.PerspectiveCamera(FOV, ASPECT, 0.05, 700);
const mirrorRT = new THREE.WebGLRenderTarget(4, 4, { samples: 4 });
wu.uMirror.value = mirrorRT.texture;

const SB = LEAF_BOX;
const shadowCam = new THREE.OrthographicCamera(-(SB.x1 - SB.x0) / 2, (SB.x1 - SB.x0) / 2, (SB.z1 - SB.z0) / 2, -(SB.z1 - SB.z0) / 2, 0.1, 20);
shadowCam.position.set((SB.x0 + SB.x1) / 2, 10, (SB.z0 + SB.z1) / 2);
shadowCam.up.set(0, 0, -1);
shadowCam.lookAt((SB.x0 + SB.x1) / 2, 0, (SB.z0 + SB.z1) / 2);
shadowCam.updateMatrixWorld();
const shadowRT = new THREE.WebGLRenderTarget(512, 512, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
wu.uShadow.value = shadowRT.texture;
wu.uShadowBox.value.set(SB.x0, SB.z1, SB.x1 - SB.x0, SB.z1 - SB.z0);

const view = { el: THREE.MathUtils.degToRad(EL_START), az: 0 };
let aspect = ASPECT;

function updateCamera() {
  const ce = Math.cos(view.el);
  camera.position.set(TARGET.x + Math.sin(view.az) * ce * DIST, Math.sin(view.el) * DIST, TARGET.z + Math.cos(view.az) * ce * DIST);
  camera.up.set(0, 1, 0);
  camera.lookAt(TARGET);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  // the same camera mirrored in the water plane
  mirrorCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
  mirrorCam.up.set(0, -1, 0);
  mirrorCam.lookAt(TARGET);
  mirrorCam.fov = camera.fov;
  mirrorCam.aspect = aspect;
  mirrorCam.updateProjectionMatrix();
  mirrorCam.updateMatrixWorld();
  wu.uMirrorVP.value.multiplyMatrices(mirrorCam.projectionMatrix, mirrorCam.matrixWorldInverse);
}

// The angle of incidence (from the vertical) where a pixel's ray meets the
// flat water, for the centre, top and bottom of the frame.
function incidence(ndcY) {
  const v = new THREE.Vector3(0, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
  if (v.y >= -1e-4) return 90;
  return THREE.MathUtils.radToDeg(Math.acos(-v.y));
}

// ------------------------------------------------------------------ layout
const gauge = new Gauge(document.getElementById('gauge'));
fitFrame(ASPECT, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  const pr = renderer.getPixelRatio();
  mirrorRT.setSize(Math.round(w * pr), Math.round(h * pr));
  updateCamera();
});

// ------------------------------------------------------------------ state + ui
const state = { playing: true, litho: 1, lithoTarget: 1, t: 0, fishT: 3.6, phase: 0, nextDrop: 1.5, drop: 0, gaugeHold: 5 };

setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });
const slider = document.getElementById('elev');
const elevOut = document.getElementById('elev-out');
function setElevation(deg, fromSlider) {
  deg = Math.min(EL_MAX, Math.max(EL_MIN, deg));
  view.el = THREE.MathUtils.degToRad(deg);
  if (!fromSlider) slider.value = String(Math.round(deg));
  elevOut.textContent = `${Math.round(deg)}°`;
  state.gaugeHold = 4;
  updateCamera();
}
slider.addEventListener('input', () => setElevation(+slider.value, true));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  ArrowUp: () => setElevation(THREE.MathUtils.radToDeg(view.el) + 3),
  ArrowDown: () => setElevation(THREE.MathUtils.radToDeg(view.el) - 3),
});

let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag = { x: e.clientX, y: e.clientY };
  view.az = Math.max(-0.55, Math.min(0.55, view.az - dx * 0.004));
  setElevation(THREE.MathUtils.radToDeg(view.el) + dy * 0.25);
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
const panel = document.getElementById('panel');

// ------------------------------------------------------------------ the fish
// It swims a slow figure of eight under the leaves, rising and sinking a little.
const W = 0.1;
function fishAt(t, out) {
  return out.set(0.3 + 1.3 * Math.sin(W * t), -0.38 + 0.08 * Math.sin(0.5 * W * t + 1.3), 0.5 + 0.95 * Math.sin(2 * W * t + 0.6));
}
const fp = new THREE.Vector3(), fv = new THREE.Vector3(), fa = new THREE.Vector3(), tmp = new THREE.Vector3();
function updateFish(dt) {
  const t = state.fishT, e = 0.05;
  fishAt(t, fp);
  fv.copy(fishAt(t + e, tmp)).sub(fishAt(t - e, fa)).divideScalar(2 * e);
  fa.copy(fishAt(t + e, tmp)).add(fishAt(t - e, fa)).addScaledVector(fp, -2).divideScalar(e * e);
  const speed = Math.hypot(fv.x, fv.z);
  const kappa = (fv.x * fa.z - fv.z * fa.x) / Math.pow(Math.max(speed, 1e-3), 3);
  wu.uFishPos.value.copy(fp);
  wu.uFishDir.value.set(fv.x / speed, fv.z / speed);
  wu.uFishTurn.value = THREE.MathUtils.clamp(kappa * 0.5, -1.2, 1.2);
  state.phase += dt * (4.5 + 14 * speed);
  wu.uFishPhase.value = state.phase;
}

// rings from drips off the branches, somewhere in view
function addDrop() {
  const d = wu.uDrops.value[state.drop++ % 8];
  const r = Math.random() * 3.0, a = Math.random() * Math.PI * 2;
  d.set(TARGET.x + Math.cos(a) * r, TARGET.z - 1 + Math.sin(a) * r * 1.3, state.t, 0.004 + Math.random() * 0.003);
}

// ------------------------------------------------------------------ loop
let last = performance.now();
const white = new THREE.Color(1, 1, 1);
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) {
    state.t += dt;
    state.fishT += dt;
    leaves.update(dt, state.t);
    updateFish(dt);
    if (state.t > state.nextDrop) { addDrop(); state.nextDrop = state.t + 2.5 + Math.random() * 4; }
  }
  u.uTime.value = state.t;
  wu.uWaveT.value = state.t;
  if (state.litho !== state.lithoTarget) {
    state.litho += Math.sign(state.lithoTarget - state.litho) * Math.min(Math.abs(state.lithoTarget - state.litho), dt * 2.2);
    renderer.setClearColor(PAPER.clone().lerp(new THREE.Color(0xe9e6dc), 1 - state.litho), 1);
  }

  // 1. shadows of the leaves, seen from above
  const clear = renderer.getClearColor(new THREE.Color());
  sky.visible = false; world.visible = false; water.visible = false;
  leaves.mesh.material = leaves.shadowMaterial;
  renderer.setClearColor(white, 1);
  renderer.setRenderTarget(shadowRT);
  renderer.render(scene, shadowCam);
  leaves.mesh.material = leaves.material;

  // 2. the world above, from the mirrored camera, in plain colour
  sky.visible = true; world.visible = true; leaves.mesh.visible = false;
  sky.position.copy(mirrorCam.position);
  u.uLitho.value = 0; u.uGrain.value = 0; u.uClip.value = 1;
  renderer.setClearColor(clear, 1);
  renderer.setRenderTarget(mirrorRT);
  renderer.render(scene, mirrorCam);

  // 3. the picture
  water.visible = true; leaves.mesh.visible = true;
  sky.position.copy(camera.position);
  u.uLitho.value = state.litho; u.uGrain.value = 1; u.uClip.value = 0;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // the reflectance gauge: shown while the angle changes and while the notes are open
  state.gaugeHold = Math.max(0, state.gaugeHold - dt);
  const show = state.gaugeHold > 0 || !panel.hasAttribute('hidden');
  gauge.update(incidence(-1), incidence(0), incidence(1), show);
  requestAnimationFrame(frame);
}

updateFish(0);
setElevation(EL_START);
markReady();
requestAnimationFrame(frame);

window.__page = { view, state, setElevation, setPlaying, camera, renderer, wu, u, leaves, scene, updateFish };
