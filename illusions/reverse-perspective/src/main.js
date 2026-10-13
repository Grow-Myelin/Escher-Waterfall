// A reverspective, after Patrick Hughes: truncated pyramids that stick out of
// the board are painted with a scene of rooms that go in. The painting is
// made by rendering the intended scene from the design eye and projecting it
// back onto the relief from the same eye. A visitor sways from side to side;
// the painted rooms seem to turn and follow.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { createSharedUniforms } from '../../../src/materials.js';
import { inkMaterial } from './ink.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { D, EYE, BOARD, BLOCKS, HMAX, heightFor } from './homology.js';
import { buildIntended } from './intended.js';
import { buildRelief, guideSegments } from './relief.js';

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), SKY = new THREE.Color(0xdde8ed);
renderer.setClearColor(PAPER, 1);

const roomU = createSharedUniforms();
roomU.uHatch = { value: 14 };
roomU.uLight.value.set(-0.38, 0.72, 0.58).normalize();
const paintU = { ...createSharedUniforms(), uLitho: roomU.uLitho, uHatch: { value: 5 } };
paintU.uLight.value.set(-0.45, 0.7, 0.55).normalize();

function patch(src, from, to) {
  if (!src.includes(from)) throw new Error(`shader patch failed: ${from}`);
  return src.replace(from, to);
}

// ------------------------------------------------------------------ the painting
// The intended scene, rendered from the design eye onto the board's rectangle.
const PW = 1024, PH = Math.round((PW * (BOARD.y1 - BOARD.y0)) / (BOARD.x1 - BOARD.x0));
const paintRT = new THREE.WebGLRenderTarget(PW, PH, {
  samples: 4, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter,
});
paintRT.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const paintScene = new THREE.Scene();
{
  const b = new Builder();
  buildIntended(b);
  const m = new THREE.Mesh(b.build(), inkMaterial(paintU));
  m.frustumCulled = false;
  paintScene.add(m);
}
const paintCam = new THREE.PerspectiveCamera(
  THREE.MathUtils.radToDeg(2 * Math.atan((BOARD.y1 - BOARD.y0) / 2 / D)),
  (BOARD.x1 - BOARD.x0) / (BOARD.y1 - BOARD.y0), 0.04, 100,
);
paintCam.position.copy(EYE);
paintCam.lookAt(0, 0, 0);
function renderPainting() {
  renderer.setRenderTarget(paintRT);
  renderer.setClearColor(SKY.clone().lerp(PAPER, roomU.uLitho.value), 1);
  renderer.clear();
  renderer.render(paintScene, paintCam);
  renderer.setRenderTarget(null);
  renderer.setClearColor(PAPER, 1);
}

// ------------------------------------------------------------------ the relief
// The ink shader again, plus the painting: each point of the relief takes the
// colour of the picture where the sight line from the eye through it meets
// the board.
function reliefMaterial(u) {
  const m = inkMaterial(u);
  let vs = m.vertexShader, fs = m.fragmentShader;
  vs = patch(vs, 'varying vec3 vM;', 'varying vec3 vM;\nvarying vec3 vW;');
  vs = patch(vs, 'gl_Position = projectionMatrix * viewMatrix * wp;', 'vW = wp.xyz;\n  gl_Position = projectionMatrix * viewMatrix * wp;');
  fs = patch(fs, 'varying vec3 vM;', 'varying vec3 vM;\nvarying vec3 vW;\nuniform sampler2D uPaint;\nuniform float uPaintAmt;\nuniform vec3 uEye;\nuniform vec4 uBoard;');
  fs = patch(fs, 'gl_FragColor = vec4(outc, uFade);', `
  vec2 q = uEye.xy + (vW.xy - uEye.xy) * (uEye.z / max(uEye.z - vW.z, 1e-3));
  vec2 puv = (q - uBoard.xy) / uBoard.zw;
  vec3 paint = texture2D(uPaint, puv).rgb;
  // real light on the real relief, kept gentle as in a gallery
  vec3 painted = paint * (0.82 + 0.22 * diff) * (1.0 - ink * 0.1);
  gl_FragColor = vec4(mix(outc, painted, uPaintAmt), uFade);`);
  m.vertexShader = vs;
  m.fragmentShader = fs;
  m.needsUpdate = true;
  return m;
}
const reliefU = {
  ...roomU,
  uPaint: { value: paintRT.texture },
  uPaintAmt: { value: 1 },
  uEye: { value: EYE.clone() },
  uBoard: { value: new THREE.Vector4(BOARD.x0, BOARD.y0, BOARD.x1 - BOARD.x0, BOARD.y1 - BOARD.y0) },
};
const scene = new THREE.Scene();
{
  const b = new Builder();
  buildRelief(b, st(0xf2eee4, PAT.PLAIN));
  const m = new THREE.Mesh(b.build(), reliefMaterial(reliefU));
  m.frustumCulled = false;
  scene.add(m);
}

// ------------------------------------------------------------------ the gallery
const FLOOR = -1.6; // the eye is at the board's centre, 1.6 m up
const ink = inkMaterial(roomU);
{
  const b = new Builder();
  const plaster = st(0xe8e1d2, PAT.PLASTER);
  const { x0, x1, y0, y1 } = BOARD;
  b.box(-6, FLOOR - 0.1, -0.5, 6, 4, -0.045, plaster, {});
  b.box(-6, FLOOR, -0.045, 6, FLOOR + 0.12, -0.02, st(0xcfc5b0, PAT.PLAIN), {});
  b.box(-6, FLOOR - 0.1, -0.045, 6, FLOOR, 7, st(0xc7ab83, PAT.WOOD), {});
  // the board's edges and a slim frame
  b.box(x0, y0, -0.04, x1, y1, -0.002, st(0xd9d1c0, PAT.PLAIN), { skip: ['pz'] });
  const f = 0.04, fs = st(0x7a6248, PAT.WOOD);
  b.box(x0 - f, y0 - f, -0.045, x1 + f, y0, 0.03, fs, {});
  b.box(x0 - f, y1, -0.045, x1 + f, y1 + f, 0.03, fs, {});
  b.box(x0 - f, y0, -0.045, x0, y1, 0.03, fs, {});
  b.box(x1, y0, -0.045, x1 + f, y1, 0.03, fs, {});
  // a label beside it
  b.box(x1 + 0.28, -0.2, -0.045, x1 + 0.5, -0.06, -0.035, st(0xf6f2e8, PAT.PLAIN), {});
  for (let i = 0; i < 4; i++) b.box(x1 + 0.3, -0.09 - i * 0.025, -0.035, x1 + 0.3 + (i === 0 ? 0.14 : 0.18 - i * 0.03), -0.082 - i * 0.025, -0.033, st(0x5a534a, PAT.PLAIN), {});
  // a bench for the visitors
  b.box(-0.8, FLOOR, 3.6, 0.8, FLOOR + 0.42, 4.0, st(0x8a6a4a, PAT.WOOD), {});
  const m = new THREE.Mesh(b.build(), ink);
  m.frustumCulled = false;
  scene.add(m);
}

// guides for the view from above
const guides = new THREE.Group();
const guideMats = [];
{
  const { ghost, sight } = guideSegments(EYE);
  const red = new THREE.LineDashedMaterial({ color: 0xa23b2a, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0, depthTest: false });
  const faint = new THREE.LineDashedMaterial({ color: 0x7d6a55, dashSize: 0.03, gapSize: 0.04, transparent: true, opacity: 0, depthTest: false });
  guideMats.push([red, 0.95], [faint, 0.7]);
  for (const [segs, mat] of [[ghost, red], [sight, faint]]) {
    for (const [a, b] of segs) {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mat);
      l.computeLineDistances();
      l.renderOrder = 30;
      guides.add(l);
    }
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xa23b2a, transparent: true, opacity: 0, depthTest: false });
  guideMats.push([eyeMat, 1]);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), eyeMat);
  eye.position.copy(EYE);
  eye.renderOrder = 31;
  guides.add(eye);
  guides.visible = false;
  scene.add(guides);
}
// the visitor, as seen from above
const visitor = new THREE.Group();
{
  const b = new Builder();
  const coat = st(0x55504a, PAT.CLOTH);
  b.cyl(0, FLOOR, 0, 0.16, FLOOR + 0.85, 10, st(0x3e3a35, PAT.CLOTH), { r1: 0.14 });
  b.cyl(0, FLOOR + 0.85, 0, 0.19, -0.14, 10, coat, { r1: 0.15 });
  b.blob(0, -0.05, 0, 0.1, 0.12, 0.1, st(0xd8b89c, PAT.PLAIN), { sub: 1 });
  b.blob(0, 0.03, 0.02, 0.105, 0.07, 0.1, st(0x3a2f27, PAT.PLAIN), { sub: 1 });
  const m = new THREE.Mesh(b.build(), ink);
  m.frustumCulled = false;
  visitor.add(m);
  visitor.visible = false;
  scene.add(visitor);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.PerspectiveCamera(50, 30 / 38, 0.03, 60);
const TOP = { pos: new THREE.Vector3(2.15, 3.15, 3.55), target: new THREE.Vector3(-0.05, -0.35, -0.2), fov: 50 };
const SWAY = 0.8; // metres either side of the design point
const view = { sway: 0, top: 0 };
function placeCamera() {
  const e = view.top < 0.5 ? 4 * view.top ** 3 : 1 - (-2 * view.top + 2) ** 3 / 2;
  const eye = new THREE.Vector3(view.sway, EYE.y, D);
  camera.position.copy(eye).lerp(TOP.pos, e);
  const target = new THREE.Vector3(0, 0, 0).lerp(TOP.target, e);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  camera.fov = 50 + (TOP.fov - 50) * e;
  camera.updateProjectionMatrix();
  visitor.position.set(view.sway, 0, D + 0.02);
  visitor.visible = e > 0.02;
  guides.visible = e > 0.02;
  for (const [m, o] of guideMats) m.opacity = o * Math.max(0, (e - 0.3) / 0.7);
}
fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  camera.aspect = w / h;
  placeCamera();
});

// ------------------------------------------------------------------ state + ui
const state = {
  playing: true, phase: 0, manual: null,
  litho: 1, lithoTarget: 1, paint: 1, paintTarget: 1, top: 0, topTarget: 0,
  paintDirty: true,
};
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => {
  if (on && state.manual !== null) {
    // carry on swaying from where the visitor was left
    state.phase = Math.asin(THREE.MathUtils.clamp(state.manual / SWAY, -1, 1)) / OMEGA;
    state.manual = null;
  }
  state.playing = on;
});
const OMEGA = (Math.PI * 2) / 9;
const btnPaint = document.getElementById('btn-paint');
const btnTop = document.getElementById('btn-top');
function setPaint(on) {
  state.paintTarget = on ? 1 : 0;
  btnPaint.setAttribute('aria-pressed', String(!on));
}
function setTop(on) {
  state.topTarget = on ? 1 : 0;
  btnTop.setAttribute('aria-pressed', String(on));
  document.getElementById('hint').textContent = on
    ? 'Red: the rooms as painted, behind the board · dotted: sight lines from the design eye'
    : 'Drag sideways to step left or right · the rooms seem to turn to follow you';
}
btnPaint.addEventListener('click', () => setPaint(state.paintTarget < 0.5));
btnTop.addEventListener('click', () => setTop(state.topTarget < 0.5));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  p: () => btnPaint.click(),
  t: () => btnTop.click(),
  0: () => { setPlaying(false); state.manual = 0; },
  ArrowLeft: () => { setPlaying(false); state.manual = THREE.MathUtils.clamp((state.manual ?? view.sway) - 0.1, -SWAY * 1.2, SWAY * 1.2); },
  ArrowRight: () => { setPlaying(false); state.manual = THREE.MathUtils.clamp((state.manual ?? view.sway) + 0.1, -SWAY * 1.2, SWAY * 1.2); },
});
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX };
  setPlaying(false);
  state.manual = view.sway;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.x = e.clientX;
  state.manual = THREE.MathUtils.clamp(state.manual + dx * 0.004, -SWAY * 1.2, SWAY * 1.2);
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => { setPlaying(false); state.manual = 0; });

const step = (v, target, rate) => v + Math.sign(target - v) * Math.min(Math.abs(target - v), rate);

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.phase += dt;
  const target = state.manual !== null ? state.manual : SWAY * Math.sin(state.phase * OMEGA);
  view.sway = state.manual !== null ? step(view.sway, target, dt * 2.5) : target;
  state.top = step(state.top, state.topTarget, dt / 1.8);
  view.top = state.top;
  placeCamera();

  if (state.litho !== state.lithoTarget) {
    state.litho = step(state.litho, state.lithoTarget, dt * 2.2);
    state.paintDirty = true;
  }
  roomU.uLitho.value = state.litho;
  state.paint = step(state.paint, state.paintTarget, dt * 1.6);
  reliefU.uPaintAmt.value = state.paint;
  if (state.paintDirty) { renderPainting(); state.paintDirty = false; }

  const atDesign = Math.abs(view.sway) < 0.03 && state.top < 0.01 && state.paint > 0.99;
  setBadge(atDesign && !state.noBadge, 'Design point: from here the painting is exact');

  renderer.setClearColor(PAPER, 1);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);

// numbers for the panel
const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
setText('n-d', D.toFixed(1));
setText('n-h', Math.round(HMAX * 100));
setText('n-hall', Math.round(heightFor(BLOCKS[0].F) * 100));
setText('n-hallF', BLOCKS[0].F.toFixed(0));
setText('n-room', Math.round(heightFor(BLOCKS[1].F) * 100));

window.__page = {
  state, view,
  setSway(x) { setPlaying(false); state.manual = x; view.sway = x; },
  setTop(on) { setTop(on); state.top = on ? 1 : 0; },
  setPaint(on) { setPaint(on); state.paint = on ? 1 : 0; },
  setLitho(on) { document.getElementById(on ? 'btn-litho' : 'btn-colour').click(); state.litho = on ? 1 : 0; state.paintDirty = true; },
};
