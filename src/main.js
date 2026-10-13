import * as THREE from 'three';
import { Builder } from './builder.js';
import { buildChannels, buildSupports, buildTowers } from './structure.js';
import { buildHouse, buildTerrace, buildWheel } from './mill.js';
import { buildGround, buildCourtyard } from './courtyard.js';
import { buildGarden } from './garden.js';
import { buildLandscape } from './landscape.js';
import { buildChannelWater, buildFall, buildWheelSheet, Flecks, Spray } from './water.js';
import {
  createSharedUniforms, makeInkMaterial, makeWaterMaterial, makeFallMaterial, makeDropMaterial,
} from './materials.js';
import { WHEEL, FALL_WIDTH, FALL_SEAM_Y, DROP, S, PT, TOWER, fromScreen } from './layout.js';

// ------------------------------------------------------------------ constants
const PRINT_ASPECT = 30 / 38; // Escher's sheet: 30 × 38 cm, portrait
const VIEW = { X: 3.2, Y: 12.3, H: 51.5 }; // composition centre and height (screen units)
const REVEAL = { az: Math.PI / 4 - 1.05, el: 0.36, zoom: 0.78, k: 1 };
const ISO_AZ = Math.PI / 4;
const ISO_EL = Math.atan(1 / Math.SQRT2); // 35.264°: the true isometric angle
const FLOW_SPEED = 2.6; // channel water, units per second
const OMEGA = FLOW_SPEED / WHEEL.r; // wheel turns with the water

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const paper = new THREE.Color(0xece5d5);
renderer.setClearColor(paper, 1);

const scene = new THREE.Scene();
const uniforms = createSharedUniforms();

// ------------------------------------------------------------------ the scene
// The impossible structure itself …
const ink = makeInkMaterial(uniforms);
{
  const b = new Builder();
  buildChannels(b);
  buildTowers(b);
  const mesh = new THREE.Mesh(b.build(), ink);
  mesh.frustumCulled = false;
  scene.add(mesh);
}
// … and everything around it, which steps aside when the trick is revealed.
const dressUniforms = { ...uniforms, uFade: { value: 1 } };
const dressing = new THREE.Mesh(undefined, makeInkMaterial(dressUniforms, { transparent: true }));
{
  const b = new Builder();
  buildSupports(b);
  buildHouse(b);
  buildTerrace(b, b);
  buildGround(b);
  buildCourtyard(b);
  buildGarden(b);
  dressing.geometry = b.build();
  dressing.frustumCulled = false;
  scene.add(dressing);
}

const landUniforms = { ...uniforms, uFade: { value: 1 } };
const landMat = makeInkMaterial(landUniforms, { transparent: true });
const land = new THREE.Mesh(buildLandscape().build(), landMat);
land.frustumCulled = false;
land.renderOrder = -1;
scene.add(land);

const wheel = new THREE.Group();
wheel.position.set(0, WHEEL.y, WHEEL.z);
const wheelMesh = new THREE.Mesh(buildWheel().build(), ink);
wheel.add(wheelMesh);
scene.add(wheel);

scene.add(new THREE.Mesh(buildChannelWater(), makeWaterMaterial(uniforms)));
const fall = new THREE.Mesh(buildFall(), makeFallMaterial(uniforms, FALL_WIDTH, 9));
fall.frustumCulled = false;
scene.add(fall);
scene.add(new THREE.Mesh(buildWheelSheet(), makeFallMaterial(uniforms, (WHEEL.half - 0.12) * 2, FLOW_SPEED * 1.4)));

const flecks = new Flecks(makeDropMaterial(uniforms));
flecks.mesh.renderOrder = 10;
scene.add(flecks.mesh);
const spray = new Spray(makeDropMaterial(uniforms));
spray.mesh.renderOrder = 10;
scene.add(spray.mesh);

// Guides for the reveal: each joins the two halves of one cut. They run along
// the isometric line of sight, so from Escher's angle each is a single point.
const guides = new THREE.Group();
{
  const mat = new THREE.LineDashedMaterial({ color: 0xa23b2a, dashSize: 0.7, gapSize: 0.45, transparent: true, opacity: 0 });
  const add = (p, back) => {
    const a = new THREE.Vector3(...p);
    const b = a.clone().addScalar(-back);
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    const line = new THREE.Line(g, mat);
    line.computeLineDistances();
    guides.add(line);
    for (const q of [a, b]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: 0xa23b2a, transparent: true, opacity: 0 }));
      dot.position.copy(q);
      guides.add(dot);
    }
  };
  add([0, FALL_SEAM_Y, 0], DROP); // the waterfall
  add([PT.c1[0], TOWER.split, PT.c1[2]], S); // right tower
  add([PT.c2[0], TOWER.split, PT.c2[2]], S); // left tower
  guides.renderOrder = 20;
  scene.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
// Pivot: the point on screen at the composition centre, at the depth of the
// middle of the real (spiral) structure, so the reveal turns about it.
// The real middle of the aqueduct; the iso pivot is the point on Escher's line
// of sight through the composition centre at the same depth, so the reveal
// only has to slide a little to turn about the structure.
const CENTRE = new THREE.Vector3(-12, 9.5, -12);
const isoPivot = new THREE.Vector3(...fromScreen(VIEW.X, VIEW.Y, CENTRE.x + CENTRE.y + CENTRE.z));
const pivot = new THREE.Vector3();
const view = { az: ISO_AZ, el: ISO_EL, zoom: 1, panX: 0, panY: 0, k: 0 };
let aspect = PRINT_ASPECT;

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
  camera.left = -h * aspect;
  camera.right = h * aspect;
  camera.top = h;
  camera.bottom = -h;
  camera.updateProjectionMatrix();
}

function isIsometric() {
  return Math.abs(view.az - ISO_AZ) < 1e-4 && Math.abs(view.el - ISO_EL) < 1e-4;
}

// ------------------------------------------------------------------ layout
const frame = document.getElementById('frame');
function resize() {
  const mat = 13; // the mount drawn round the canvas with box-shadows
  const pad = (window.innerWidth < 640 ? 10 : 28) + mat;
  const top = document.getElementById('masthead').offsetHeight + 6 + mat;
  const bottom = document.getElementById('controls').offsetHeight + 8 + mat;
  const availW = window.innerWidth - pad * 2;
  const availH = window.innerHeight - top - bottom;
  let h = availH, w = h * PRINT_ASPECT;
  if (w > availW) { w = availW; h = w / PRINT_ASPECT; }
  w = Math.max(160, Math.floor(w));
  h = Math.max(200, Math.floor(h));
  frame.style.width = `${w}px`;
  frame.style.height = `${h}px`;
  frame.style.top = `${top + Math.max(0, (availH - h) / 2)}px`;
  renderer.setSize(w, h, true);
  aspect = w / h;
  updateCamera();
}
window.addEventListener('resize', resize);

// ------------------------------------------------------------------ state + ui
const state = {
  playing: true,
  litho: 1,
  lithoTarget: 1,
  revealed: false,
  tween: null,
  flowTime: 0,
  time: 0,
};

const ui = {
  litho: document.getElementById('btn-litho'),
  colour: document.getElementById('btn-colour'),
  reveal: document.getElementById('btn-reveal'),
  play: document.getElementById('btn-play'),
  info: document.getElementById('btn-info'),
  panel: document.getElementById('panel'),
  hint: document.getElementById('hint'),
};

function setLitho(on) {
  state.lithoTarget = on ? 1 : 0;
  ui.litho.setAttribute('aria-pressed', String(on));
  ui.colour.setAttribute('aria-pressed', String(!on));
  document.body.classList.toggle('colour', !on);
}

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function animateView(to, dur = 2.2) {
  state.tween = { from: { ...view }, to: { ...view, ...to }, t: 0, dur };
}

function setRevealed(on) {
  state.revealed = on;
  ui.reveal.setAttribute('aria-pressed', String(on));
  ui.reveal.querySelector('span').textContent = on ? 'Back to Escher’s view' : 'Reveal the trick';
  ui.hint.textContent = on
    ? 'Drag to turn the real structure · scroll to zoom'
    : 'Drag to pan · scroll to zoom · double-click to reset';
  if (on) animateView({ ...REVEAL, panX: 0, panY: 0 });
  else animateView({ az: ISO_AZ, el: ISO_EL, zoom: 1, panX: 0, panY: 0, k: 0 });
}

function setPlaying(on) {
  state.playing = on;
  ui.play.setAttribute('aria-pressed', String(!on));
  ui.play.querySelector('span').textContent = on ? 'Pause' : 'Play';
  ui.play.querySelector('.icon').textContent = on ? '❚❚' : '▶';
}

ui.litho.addEventListener('click', () => setLitho(true));
ui.colour.addEventListener('click', () => setLitho(false));
ui.reveal.addEventListener('click', () => setRevealed(!state.revealed));
ui.play.addEventListener('click', () => setPlaying(!state.playing));
ui.info.addEventListener('click', () => {
  const open = ui.panel.hasAttribute('hidden');
  if (open) ui.panel.removeAttribute('hidden'); else ui.panel.setAttribute('hidden', '');
  ui.info.setAttribute('aria-expanded', String(open));
});
document.getElementById('panel-close').addEventListener('click', () => {
  ui.panel.setAttribute('hidden', '');
  ui.info.setAttribute('aria-expanded', 'false');
});

window.addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === ' ') { e.preventDefault(); setPlaying(!state.playing); }
  else if (e.key === 'l' || e.key === 'L') setLitho(state.lithoTarget < 0.5);
  else if (e.key === 'r' || e.key === 'R') setRevealed(!state.revealed);
  else if (e.key === '0') resetView();
  else if (e.key === 'Escape') { ui.panel.setAttribute('hidden', ''); ui.info.setAttribute('aria-expanded', 'false'); }
});

function resetView() {
  if (state.revealed) setRevealed(false);
  else animateView({ zoom: 1, panX: 0, panY: 0 }, 0.8);
}

// pointer: drag pans (or orbits when revealed), wheel zooms about the cursor
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
  const z = Math.min(8, Math.max(0.35, view.zoom * Math.exp(-e.deltaY * 0.0015)));
  const after = VIEW.H / z;
  // keep the point under the cursor fixed
  view.panX += mx * aspect * (before - after);
  view.panY += my * (before - after);
  view.zoom = z;
  updateCamera();
}, { passive: false });

// ------------------------------------------------------------------ loop
let last = performance.now();
function frameLoop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) {
    state.time += dt;
    state.flowTime += dt;
    spray.update(dt);
  }
  uniforms.uTime.value = state.time;
  uniforms.uFlowTime.value = state.flowTime;
  wheel.rotation.x = state.flowTime * OMEGA;
  flecks.update(state.flowTime, FLOW_SPEED);

  // litho <-> colour cross-fade
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    uniforms.uLitho.value = state.litho;
    const c = new THREE.Color(0xece5d5).lerp(new THREE.Color(0xe9e6dc), 1 - state.litho);
    renderer.setClearColor(c, 1);
  }

  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = ease(tw.t);
    for (const key of ['az', 'el', 'zoom', 'panX', 'panY', 'k']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * k;
    if (tw.t >= 1) state.tween = null;
    updateCamera();
  }
  // the far hillside and the surroundings only make sense from Escher's angle
  const off = Math.hypot(view.az - ISO_AZ, view.el - ISO_EL);
  landUniforms.uFade.value = Math.max(0, 1 - off / 0.12);
  land.visible = landUniforms.uFade.value > 0.001;
  dressUniforms.uFade.value = Math.max(0, 1 - Math.max(0, off - 0.05) / 0.3);
  dressing.visible = dressUniforms.uFade.value > 0.001;
  const g = Math.min(1, Math.max(0, (off - 0.15) / 0.3));
  guides.visible = g > 0;
  guides.children.forEach((c) => { c.material.opacity = g; });
  document.body.classList.toggle('off-axis', !isIsometric());

  renderer.render(scene, camera);
  requestAnimationFrame(frameLoop);
}

setLitho(true);
setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
resize();
document.body.classList.add('ready');
requestAnimationFrame(frameLoop);

// handy for debugging from the console
window.__waterfall = { view, updateCamera, state, setRevealed, setLitho, setPlaying, renderer };
