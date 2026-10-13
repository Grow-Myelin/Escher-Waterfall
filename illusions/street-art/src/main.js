// Anamorphic pavement art.
//
// A hidden 3D scene (a cistern under the paving, src/cistern.js) is rendered
// once from a single eye point into a texture. The plaza floor then looks that
// texture up by projecting each pavement point back towards the same eye
// (projective texturing): the chalk drawing is the exact central projection
// of the hidden scene onto the ground plane. From the eye point it reads as a
// pit in the paving; from anywhere else it is a long, flat, stretched picture.

import * as THREE from 'three';
import { Builder } from '../../../src/builder.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { createSharedUniforms, makeInkMaterial, makeCisternWater, makeMaskMaterial, makeGroundMaterial } from './ink.js';
import { EYE, holePolygon, buildCistern, keyPoints, COLUMN, WATER, HALL, SX, ZN, ZF, STAIR, CULVERT, CULVERT_FACE } from './cistern.js';
import { buildPlaza, buildArtist } from './plaza.js';
import { Walker, makeShadowMaterial } from './people.js';

const RED = 0xa23b2a;
const PAPER = new THREE.Color(0xece5d5);
const SKY_COLOUR = new THREE.Color(0xe3e3dc);

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(PAPER, 1);
const uniforms = createSharedUniforms();

// ------------------------------------------------------------------ the hidden scene
const hidden = new THREE.Scene();
const hole = holePolygon();
{
  const b = new Builder();
  buildCistern(b, hole);
  const geo = b.build();
  const opts = { virtual: true, hole, water: WATER, hall: HALL };
  const real = new THREE.Mesh(geo, makeInkMaterial(uniforms, opts));
  real.frustumCulled = false;
  hidden.add(real);
  // its reflection in the water: the same geometry mirrored in the water plane
  const mirror = new THREE.Mesh(geo, makeInkMaterial(uniforms, { ...opts, dim: 0.5 }));
  mirror.scale.y = -1;
  mirror.position.y = 2 * WATER;
  mirror.frustumCulled = false;
  hidden.add(mirror);
  // the water, from the left wall of the shaft to the back of the hall
  const x0 = -SX - 0.7, x1 = SX + 0.7, z0 = CULVERT_FACE - CULVERT.depth - 0.1, z1 = ZN + 0.7;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), makeCisternWater(uniforms, [
    [COLUMN.x, COLUMN.z], [-SX + 0.6, ZF + STAIR.landing + STAIR.run2 * 4.4], [COLUMN.x + 1.2, COLUMN.z + 1.9], [CULVERT.x, CULVERT_FACE + 0.15],
  ], HALL));
  water.rotation.x = -Math.PI / 2;
  water.position.set((x0 + x1) / 2, WATER, (z0 + z1) / 2);
  water.renderOrder = 2;
  water.frustumCulled = false;
  hidden.add(water);
  // the paving itself stays blank in the eye's picture
  const outer = new THREE.Shape([[-80, 80], [80, 80], [80, -80], [-80, -80]].map(([x, y]) => new THREE.Vector2(x, y)));
  outer.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x, -z))));
  const mg = new THREE.ShapeGeometry(outer);
  mg.rotateX(-Math.PI / 2);
  const mask = new THREE.Mesh(mg, makeMaskMaterial(uniforms, COLUMN));
  mask.frustumCulled = false;
  hidden.add(mask);
}

// ------------------------------------------------------------------ the eye's camera
// Fitted so its picture just covers the hole and the column above it.
const eyeCam = new THREE.PerspectiveCamera(40, 2, 0.05, 80);
{
  const pts = hole.map(([x, z]) => new THREE.Vector3(x, 0, z));
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    pts.push(new THREE.Vector3(COLUMN.x + Math.cos(t) * (COLUMN.r + 0.05), COLUMN.top + 0.25, COLUMN.z + Math.sin(t) * (COLUMN.r + 0.05)));
  }
  let pitch = -0.4;
  let fovY = 0.7, tx = 1;
  for (let it = 0; it < 6; it++) {
    const f = new THREE.Vector3(0, Math.sin(pitch), -Math.cos(pitch));
    const u = new THREE.Vector3(0, Math.cos(pitch), Math.sin(pitch));
    let ymin = 1e9, ymax = -1e9;
    tx = 0;
    for (const p of pts) {
      const d = p.clone().sub(EYE);
      const zc = d.dot(f);
      ymin = Math.min(ymin, d.dot(u) / zc);
      ymax = Math.max(ymax, d.dot(u) / zc);
      tx = Math.max(tx, Math.abs(d.x / zc));
    }
    pitch += Math.atan((ymin + ymax) / 2);
    fovY = 2 * Math.atan((ymax - ymin) / 2);
  }
  const m = 1.03;
  eyeCam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(fovY / 2) * m));
  eyeCam.aspect = (tx * m) / Math.tan(THREE.MathUtils.degToRad(eyeCam.fov) / 2);
  eyeCam.position.copy(EYE);
  eyeCam.lookAt(EYE.clone().add(new THREE.Vector3(0, Math.sin(pitch), -Math.cos(pitch))));
  eyeCam.updateProjectionMatrix();
  eyeCam.updateMatrixWorld(true);
}
const maxTex = Math.min(4096, renderer.capabilities.maxTextureSize || 4096);
const rtH = Math.min(1536, maxTex); // above the drawing's on-screen size from the eye point
const rtW = Math.min(maxTex, Math.round(rtH * eyeCam.aspect / 64) * 64);
// The drawing is rendered twice, once per rendering style, so switching
// between lithograph and colour only cross-fades two finished pictures.
const makeRT = () => {
  const t = new THREE.WebGLRenderTarget(rtW, rtH, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    depthBuffer: true,
  });
  t.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
};
const rtLitho = makeRT(), rtColour = makeRT();
let drawingDirty = true;

function renderDrawing() {
  const prev = renderer.getClearColor(new THREE.Color());
  const prevA = renderer.getClearAlpha();
  // hatch spacing in the drawing matches the screen's when seen from the eye point
  const rtPxPerDeg = rtH / eyeCam.fov;
  const screenPxPerDeg = renderer.domElement.height / EYE_FOV;
  const hp = uniforms.uHatchPx.value, lt = uniforms.uLitho.value;
  uniforms.uHatchPx.value = hp * Math.max(1, rtPxPerDeg / screenPxPerDeg);
  renderer.setClearColor(0x000000, 0);
  for (const [target, litho] of [[rtLitho, 1], [rtColour, 0]]) {
    uniforms.uLitho.value = litho;
    renderer.setRenderTarget(target);
    renderer.clear(true, true, true);
    renderer.render(hidden, eyeCam);
  }
  renderer.setRenderTarget(null);
  renderer.setClearColor(prev, prevA);
  uniforms.uHatchPx.value = hp;
  uniforms.uLitho.value = lt;
}

// ------------------------------------------------------------------ the plaza
const world = new THREE.Scene();
const groundMat = makeGroundMaterial(uniforms, rtLitho.texture, rtColour.texture);
groundMat.uniforms.uEyeVP.value.multiplyMatrices(eyeCam.projectionMatrix, eyeCam.matrixWorldInverse);
{
  const g = new THREE.PlaneGeometry(90, 90);
  g.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(g, groundMat);
  ground.frustumCulled = false;
  world.add(ground);
}
const ink = makeInkMaterial(uniforms);
{
  const b = new Builder();
  buildPlaza(b);
  buildArtist(b, SX + 1.05, -1.2, -Math.PI / 2 - 0.2);
  const m = new THREE.Mesh(b.build(), ink);
  m.frustumCulled = false;
  world.add(m);
}

// passers-by; the first one strolls straight across the drawing
const shadowMat = makeShadowMaterial();
const walkers = [
  new Walker(ink, shadowMat, { coat: 0x6c5a4a, trousers: 0x3c3a37, hat: 0x2c2a27 }, [[-9, 0.4], [9, 0.4], [9.5, -7.5], [-9.5, -7.5]], 1.25, 0.06),
  new Walker(ink, shadowMat, { coat: 0x8a4b3c, trousers: 0x4a4540, hair: 0x2e2620, skirt: 0x45505a, height: 0.95 }, [[-10.5, 9], [-10.5, -12], [-4, -14], [10, -12], [11, 8], [3, 12.5]], 1.05, 0.25),
  new Walker(ink, shadowMat, { coat: 0x56616b, trousers: 0x2f2d2a, hair: 0x6b5340, bag: 0x5a4030 }, [[7, 13], [-8, 13], [-7, 9.5], [8, 9.5]], 1.3, 0.5),
  new Walker(ink, shadowMat, { coat: 0xc9b48f, trousers: 0x3d3b38, hat: 0x5d4632, height: 1.03 }, [[12, -2], [5, -11], [-5, -11], [-12, -4], [-5, -6], [5, -6]], 1.15, 0.7),
  new Walker(ink, shadowMat, { coat: 0x3f4a43, trousers: 0x4b4741, hair: 0x2a2420, skirt: 0x6b4c3f, height: 0.92 }, [[4.5, 7.5], [9, 3], [7, -2], [3.8, 1.5]], 0.9, 0.1),
];
for (const w of walkers) world.add(w.group);

// the chalk mark where the viewer should stand
{
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(250,248,240,0.92)';
  g.fillStyle = 'rgba(250,248,240,0.9)';
  g.lineCap = 'round';
  g.lineWidth = 9;
  const rough = (n) => (Math.sin(n * 12.9898) * 43758.5453) % 1;
  g.beginPath();
  for (let i = 0; i <= 90; i++) {
    const t = (i / 90) * Math.PI * 2;
    const r = 210 + rough(i) * 6;
    g.lineTo(256 + Math.cos(t) * r, 256 + Math.sin(t) * r);
  }
  g.stroke();
  // two footprints, toes towards the drawing (−z, up in the texture)
  const foot = (x, y) => {
    g.beginPath(); g.ellipse(x, y, 34, 64, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x, y + 88, 27, 34, 0, 0, Math.PI * 2); g.fill();
  };
  foot(206, 220);
  foot(306, 220);
  g.lineWidth = 7;
  g.beginPath(); g.moveTo(256, 120); g.lineTo(256, 64); g.moveTo(232, 88); g.lineTo(256, 62); g.lineTo(280, 88); g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.85 }));
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(EYE.x, 0.004, EYE.z + 0.12);
  world.add(decal);
}

// ------------------------------------------------------------------ the eye point and sight lines
const eyeMarker = new THREE.Group();
const markerMats = [];
{
  const dotM = new THREE.MeshBasicMaterial({ color: RED, transparent: true });
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), dotM);
  dot.position.copy(EYE);
  const ringM = new THREE.MeshBasicMaterial({ color: RED, transparent: true, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 6, 40), ringM);
  ring.position.copy(EYE);
  const lineM = new THREE.LineDashedMaterial({ color: RED, dashSize: 0.12, gapSize: 0.08, transparent: true });
  const lg = new THREE.BufferGeometry().setFromPoints([EYE.clone(), new THREE.Vector3(EYE.x, 0, EYE.z)]);
  const line = new THREE.Line(lg, lineM);
  line.computeLineDistances();
  eyeMarker.add(dot, ring, line);
  markerMats.push(dotM, ringM, lineM);
  eyeMarker.userData.ring = ring;
  world.add(eyeMarker);
}

const guides = new THREE.Group();
const guideMats = [];
{
  // dashed lines drawn as chains of thin cylinders, so they read from afar
  const solid = new THREE.MeshBasicMaterial({ color: RED, transparent: true });
  const under = new THREE.MeshBasicMaterial({ color: RED, transparent: true, depthTest: false, depthWrite: false });
  guideMats.push([solid, 1], [under, 0.6]);
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  unitCyl.translate(0, 0.5, 0);
  const dashes = [];
  const dashed = (a, b, mat, r = 0.035, dash = 0.32, gap = 0.2) => {
    const d = b.clone().sub(a);
    const L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    for (let s = 0; s < L; s += dash + gap) {
      dashes.push({ mat, p: a.clone().addScaledVector(d, s / L), q, len: Math.min(dash, L - s), r });
    }
  };
  const dot = (p, m, r = 0.08) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m);
    d.position.copy(p);
    d.renderOrder = 31;
    guides.add(d);
  };
  for (const K of keyPoints()) {
    const t = EYE.y / (EYE.y - K.y);
    const G = EYE.clone().lerp(K, t); // where the sight line meets the paving
    G.y = 0.012;
    dashed(EYE, G, solid);
    if (K.y < 0) dashed(G, K, under, 0.025, 0.16, 0.14);
    dot(K, K.y > 0 ? solid : under, 0.07);
    dot(G, solid, 0.06);
  }
  // the column above the paving, where the eye places it
  {
    const n = 24;
    for (const y of [0.02, COLUMN.top]) {
      for (let i = 0; i < n; i += 2) {
        const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2;
        dashed(new THREE.Vector3(COLUMN.x + Math.cos(t0) * COLUMN.r, y, COLUMN.z + Math.sin(t0) * COLUMN.r),
          new THREE.Vector3(COLUMN.x + Math.cos(t1) * COLUMN.r, y, COLUMN.z + Math.sin(t1) * COLUMN.r), solid, 0.02, 1, 0);
      }
    }
    for (const a of [Math.PI * 0.5, Math.PI * 1.5, 0, Math.PI]) {
      dashed(new THREE.Vector3(COLUMN.x + Math.cos(a) * COLUMN.r, 0.02, COLUMN.z + Math.sin(a) * COLUMN.r),
        new THREE.Vector3(COLUMN.x + Math.cos(a) * COLUMN.r, COLUMN.top, COLUMN.z + Math.sin(a) * COLUMN.r), solid, 0.02, 0.12, 0.1);
    }
  }
  // the shaft beneath the paving, seen through it
  {
    const y0 = -0.5, y1 = WATER;
    const c = [[-SX, ZN], [SX, ZN], [SX, ZF], [-SX, ZF]];
    for (let i = 0; i < 4; i++) {
      const a = c[i], b = c[(i + 1) % 4];
      dashed(new THREE.Vector3(a[0], y1, a[1]), new THREE.Vector3(b[0], y1, b[1]), under, 0.018, 0.16, 0.14);
      dashed(new THREE.Vector3(a[0], y0, a[1]), new THREE.Vector3(a[0], y1, a[1]), under, 0.018, 0.16, 0.14);
    }
  }
  for (const mat of [solid, under]) {
    const list = dashes.filter((d) => d.mat === mat);
    const im = new THREE.InstancedMesh(unitCyl, mat, list.length);
    const m4 = new THREE.Matrix4();
    list.forEach((d, i) => { im.setMatrixAt(i, m4.compose(d.p, d.q, new THREE.Vector3(d.r, d.len, d.r))); });
    im.renderOrder = mat === under ? 29 : 30;
    im.frustumCulled = false;
    guides.add(im);
  }
  guides.visible = false;
  world.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.PerspectiveCamera(70, 30 / 38, 0.05, 300);
const PIVOT = new THREE.Vector3(0, 0, -2.4);
const EYE_PITCH = THREE.MathUtils.degToRad(-21);
const EYE_TARGET = EYE.clone().add(new THREE.Vector3(0, Math.sin(EYE_PITCH), -Math.cos(EYE_PITCH)).multiplyScalar(10));
const EYE_FOV = 70;
const ABOVE = { pos: new THREE.Vector3(2.9, 16.5, 10.6), target: new THREE.Vector3(0.2, 0, -1.9), fov: 50 };
const TOUR = { period: 34, hold0: 6, orbit: 22 };

function pose(pos, target, fov) { return { pos: pos.clone(), target: target.clone(), fov }; }
const eyePose = () => pose(EYE, EYE_TARGET, EYE_FOV);

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

// The tour: hold at the eye point, walk once round the drawing, come back.
const E_REL = EYE.clone().sub(PIVOT);
const E_R = Math.hypot(E_REL.x, E_REL.z);
const E_AZ = Math.atan2(E_REL.x, E_REL.z);
function tourPose(time) {
  const t = ((time % TOUR.period) + TOUR.period) % TOUR.period;
  if (t < TOUR.hold0 || t > TOUR.hold0 + TOUR.orbit) return eyePose();
  const s = ease((t - TOUR.hold0) / TOUR.orbit);
  const th = s * Math.PI * 2;
  const k = Math.sin(th / 2) ** 2; // 0 at the eye point, 1 opposite it
  const r = E_R + 1.8 * k;
  const h = EYE.y + 3.0 * k + 1.6 * Math.sin(th) ** 2;
  const az = E_AZ + th;
  const pos = new THREE.Vector3(PIVOT.x + Math.sin(az) * r, h, PIVOT.z + Math.cos(az) * r);
  const w = smooth(0, 0.16, s) * (1 - smooth(0.84, 1, s));
  const target = EYE_TARGET.clone().lerp(new THREE.Vector3(0, 0.2, PIVOT.z - 1.0), w);
  return { pos, target, fov: EYE_FOV + (56 - EYE_FOV) * w };
}

const state = {
  mode: 'tour', // 'tour' | 'manual' | 'above'
  tourTime: 0,
  playing: true,
  litho: 1,
  lithoTarget: 1,
  tween: null,
  cur: eyePose(),
  orbit: { az: 0, el: 0.3, dist: 10 },
  guide: 0,
};

function applyPose(p) {
  camera.position.copy(p.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(p.target);
  if (camera.fov !== p.fov) { camera.fov = p.fov; camera.updateProjectionMatrix(); }
}

function tweenTo(to, dur = 2.4, then) {
  state.tween = { from: { pos: state.cur.pos.clone(), target: state.cur.target.clone(), fov: state.cur.fov }, to, t: 0, dur, then };
}

function orbitPose() {
  const o = state.orbit;
  const pos = new THREE.Vector3(
    PIVOT.x + Math.sin(o.az) * Math.cos(o.el) * o.dist,
    PIVOT.y + Math.sin(o.el) * o.dist,
    PIVOT.z + Math.cos(o.az) * Math.cos(o.el) * o.dist,
  );
  return { pos, target: PIVOT.clone(), fov: 55 };
}

// ------------------------------------------------------------------ ui
const btnAbove = document.getElementById('btn-above');
const hint = document.getElementById('hint');
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });

function setAbove(on) {
  btnAbove.setAttribute('aria-pressed', String(on));
  if (on) {
    state.mode = 'above';
    tweenTo(pose(ABOVE.pos, ABOVE.target, ABOVE.fov), 2.6);
    hint.textContent = 'Red lines: sight lines from the eye, through the chalk, to the hidden scene';
  } else {
    goToEye();
  }
}
function goToEye() {
  btnAbove.setAttribute('aria-pressed', 'false');
  state.mode = 'returning';
  tweenTo(eyePose(), 2.4, () => { state.mode = 'tour'; state.tourTime = 0; });
  hint.textContent = 'Drag to walk round the drawing · scroll to zoom · double-click to return to the eye point';
}
btnAbove.addEventListener('click', () => setAbove(state.mode !== 'above'));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  a: () => setAbove(state.mode !== 'above'),
  e: () => goToEye(),
  0: () => goToEye(),
});

// drag: walk round the drawing (leaves the tour); wheel: closer / further
let drag = null;
function enterManual() {
  if (state.mode === 'manual') return;
  const rel = state.cur.pos.clone().sub(PIVOT);
  const dist = rel.length();
  state.orbit = { az: Math.atan2(rel.x, rel.z), el: Math.asin(Math.min(0.99, Math.max(0.03, rel.y / dist))), dist: Math.min(26, Math.max(4, dist)) };
  state.mode = 'manual';
  btnAbove.setAttribute('aria-pressed', 'false');
  tweenTo(orbitPose(), 0.6);
}
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) < 1) return;
  drag = { x: e.clientX, y: e.clientY };
  enterManual();
  state.orbit.az -= dx * 0.006;
  state.orbit.el = Math.min(1.45, Math.max(0.03, state.orbit.el + dy * 0.004));
  if (!state.tween) state.cur = orbitPose();
  else state.tween.to = orbitPose();
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', goToEye);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  enterManual();
  state.orbit.dist = Math.min(26, Math.max(4, state.orbit.dist * Math.exp(e.deltaY * 0.0012)));
  if (!state.tween) state.cur = orbitPose();
  else state.tween.to = orbitPose();
}, { passive: false });

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  drawingDirty = true;
});

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  step(dt);
  requestAnimationFrame(frame);
}

function step(dt) {
  if (state.playing) {
    for (const w of walkers) w.update(dt);
    if (state.mode === 'tour') state.tourTime += dt;
  }
  // litho <-> colour
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    uniforms.uLitho.value = state.litho;
    renderer.setClearColor(PAPER.clone().lerp(SKY_COLOUR, 1 - state.litho), 1);
  }
  if (drawingDirty) { renderDrawing(); drawingDirty = false; }

  // camera
  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = ease(tw.t);
    state.cur = {
      pos: tw.from.pos.clone().lerp(tw.to.pos, k),
      target: tw.from.target.clone().lerp(tw.to.target, k),
      fov: tw.from.fov + (tw.to.fov - tw.from.fov) * k,
    };
    if (tw.t >= 1) { state.tween = null; tw.then?.(); }
  } else if (state.mode === 'tour') {
    state.cur = tourPose(state.tourTime);
  } else if (state.mode === 'manual') {
    state.cur = orbitPose();
  }
  applyPose(state.cur);

  // eye marker and guides
  const off = camera.position.distanceTo(EYE);
  const mk = smooth(0.25, 1.2, off);
  eyeMarker.visible = mk > 0.01;
  for (const m of markerMats) m.opacity = mk;
  eyeMarker.userData.ring.lookAt(camera.position);
  const gTarget = state.mode === 'above' ? 1 : 0;
  state.guide += Math.sign(gTarget - state.guide) * Math.min(Math.abs(gTarget - state.guide), dt * 1.2);
  guides.visible = state.guide > 0.01;
  for (const [m, o] of guideMats) m.opacity = o * state.guide;

  if (off < 0.05) setBadge(true, 'At the eye point: the chalk reads as a pit in the paving');
  else if (state.mode === 'above') setBadge(true, 'From above: the true shape of the drawing');
  else setBadge(true, `${off.toFixed(1)} m from the eye point: the drawing is flat and stretched`);

  renderer.render(world, camera);
}

markReady();
requestAnimationFrame(frame);

// debug handle for tests and screenshots
window.__page = {
  state, camera, renderer, walkers, eyeCam,
  setAbove, goToEye,
  setTour(t) { state.mode = 'tour'; state.tween = null; state.tourTime = t; },
  setWalk(t) { for (const w of walkers) { w.dist = w.dist0; w.update(t); } },
  setLitho(on) { document.getElementById(on ? 'btn-litho' : 'btn-colour').click(); state.litho = on ? 1 : 0; uniforms.uLitho.value = state.litho; renderer.setClearColor(PAPER.clone().lerp(SKY_COLOUR, 1 - state.litho), 1); },
  orbit(az, el, dist) { state.mode = 'manual'; state.tween = null; state.orbit = { az, el, dist }; },
  step,
  showGuides(v) { state.guide = v; },
};
