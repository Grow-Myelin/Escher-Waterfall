// The Reflecting Sphere: a mirror ball on a pedestal in a study, seen through
// the eye of an artist who walks round it. Wherever the artist stands, the
// reflection of their own eye sits at the exact centre of the ball.
//
// Rendering: the room is drawn into a cube map from the sphere's centre, with
// each texel's distance from the centre stored in alpha. The sphere's shader
// intersects every eye ray with the true sphere, reflects it about the normal
// and traces the reflected ray through that distance map (Szirmay-Kalos's
// "distance impostor"), so near things – the pedestal, the artist, the desk –
// land where they really are, not where a plain environment map would put them.

import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { buildRoom, ROOM, SPHERE } from './room.js';
import { buildArtist, EYE_Y } from './artist.js';
import { createSharedUniforms, makeRoomMaterial, makeSphereMaterial } from './shaders.js';

// ------------------------------------------------------------------ constants
const ASPECT = 30 / 38;
const DIST = 0.85; // eye to the sphere's centre
const DY = EYE_Y - SPHERE.c.y;
const RHO = Math.sqrt(DIST * DIST - DY * DY); // radius of the artist's walk
const FILL = 0.62; // sphere diameter as a fraction of the frame width
const WALK = (2 * Math.PI) / 100; // radians per second
const OV = { az: 0.5, el: 1.12, dist: 6.6, fov: 36, target: new THREE.Vector3(0, 0.95, 0.0) };
const RED = 0xa23b2a;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
const PAPER = new THREE.Color(0xece5d5);
renderer.setClearColor(PAPER, 1);

const shared = createSharedUniforms();
shared.uC.value.copy(SPHERE.c);

// ------------------------------------------------------------------ the scene
const scene = new THREE.Scene();
const room = buildRoom();
shared.uLamp.value.copy(room.lamp);

const groups = {};
for (const [k, geo] of Object.entries(room.groups)) {
  const fade = { value: 1 };
  const mesh = new THREE.Mesh(geo, makeRoomMaterial(shared, fade));
  mesh.frustumCulled = false;
  scene.add(mesh);
  groups[k] = { mesh, fade, cur: 1 };
}
const viewMesh = new THREE.Mesh(room.view, makeRoomMaterial(shared));
viewMesh.frustumCulled = false;
scene.add(viewMesh);

const pendPivot = new THREE.Group();
pendPivot.position.copy(room.pendulumAt.position);
pendPivot.rotation.y = room.pendulumAt.rotationY;
const pendulum = new THREE.Mesh(room.pendulum, groups.W.mesh.material);
pendulum.frustumCulled = false;
pendPivot.add(pendulum);
scene.add(pendPivot);

const artistMat = makeRoomMaterial(shared);
const artist = buildArtist(artistMat);
scene.add(artist.group);

// half-float keeps the distances exact; without it, store distance / 8 m in 8 bits
const halfOK = !/[?&]cube8/.test(location.search) && (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
if (!halfOK) shared.uDistScale.value = 1 / 8;
const cubeRT = new THREE.WebGLCubeRenderTarget(512, {
  type: halfOK ? THREE.HalfFloatType : THREE.UnsignedByteType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCam = new THREE.CubeCamera(0.05, 30, cubeRT);
cubeCam.position.copy(SPHERE.c);
scene.add(cubeCam);

const sphereMat = makeSphereMaterial(shared, cubeRT.texture, SPHERE.r, 512);
const sphere = new THREE.Mesh(new THREE.SphereGeometry(SPHERE.r, 144, 108), sphereMat);
sphere.position.copy(SPHERE.c);
scene.add(sphere);

// ------------------------------------------------------------------ the ray diagram
const OFFSETS = [-0.985, -0.82, -0.56, -0.28, 0.28, 0.56, 0.82, 0.985];
const res = new THREE.Vector2(1, 1);
const lineMat = (color, width, dashed) => new LineMaterial({
  color, linewidth: width, dashed, dashSize: 0.045, gapSize: 0.03, transparent: true, opacity: 0, resolution: res, worldUnits: false,
});
const incident = new LineSegments2(new LineSegmentsGeometry(), lineMat(0x2a2420, 2.0, true));
const reflected = new LineSegments2(new LineSegmentsGeometry(), lineMat(RED, 2.2, false));
const central = new LineSegments2(new LineSegmentsGeometry(), lineMat(RED, 4.5, false));
for (const l of [incident, reflected, central]) { l.frustumCulled = false; l.renderOrder = 5; scene.add(l); }
const dotGeo = new THREE.SphereGeometry(0.03, 12, 8);
const dotMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 });
const dots = new THREE.InstancedMesh(dotGeo, dotMat, OFFSETS.length + 1);
dots.frustumCulled = false;
dots.renderOrder = 6;
scene.add(dots);
const eyeDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthTest: false }));
eyeDot.renderOrder = 7;
scene.add(eyeDot);
const diagram = [incident, reflected, central, dots, eyeDot];

// Ray-cast against the room's walls and simple boxes round the furniture.
const { W, D, H } = ROOM;
const ray = new THREE.Ray();
const tmpV = new THREE.Vector3();
const artistBox = new THREE.Box3();
function castRoom(o, d) {
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const half = [W / 2, H / 2, D / 2][i], mid = i === 1 ? H / 2 : 0;
    const di = d.getComponent(i), oi = o.getComponent(i) - mid;
    if (Math.abs(di) > 1e-9) {
      const t = ((di > 0 ? half : -half) - oi) / di;
      if (t > 0) best = Math.min(best, t);
    }
  }
  ray.set(o, d);
  for (const bx of [...room.boxes, artistBox]) {
    if (bx.containsPoint(o)) continue;
    if (ray.intersectBox(bx, tmpV)) best = Math.min(best, tmpV.distanceTo(o));
  }
  return best;
}

const segA = [], segB = [];
function updateDiagram(E) {
  const C = SPHERE.c, r = SPHERE.r;
  const toC = C.clone().sub(E);
  const L = toC.length();
  toC.normalize();
  const side = new THREE.Vector3().crossVectors(toC, new THREE.Vector3(0, 1, 0)).normalize();
  segA.length = 0; segB.length = 0;
  const m = new THREE.Matrix4();
  OFFSETS.forEach((o, i) => {
    const beta = Math.asin((o * r) / L);
    const d = toC.clone().multiplyScalar(Math.cos(beta)).addScaledVector(side, Math.sin(beta));
    const oc = E.clone().sub(C);
    const b = oc.dot(d), c = oc.lengthSq() - r * r;
    const t = -b - Math.sqrt(Math.max(0, b * b - c));
    const P = E.clone().addScaledVector(d, t);
    const n = P.clone().sub(C).normalize();
    const R = d.clone().addScaledVector(n, -2 * d.dot(n));
    const s = castRoom(P.clone().addScaledVector(R, 1e-3), R);
    const Q = P.clone().addScaledVector(R, Math.min(s, 9));
    segA.push(E.x, E.y, E.z, P.x, P.y, P.z);
    segB.push(P.x, P.y, P.z, Q.x, Q.y, Q.z);
    dots.setMatrixAt(i, m.makeTranslation(Q.x, Q.y, Q.z));
  });
  const P0 = E.clone().addScaledVector(toC, L - r);
  dots.setMatrixAt(OFFSETS.length, m.makeTranslation(P0.x, P0.y, P0.z));
  dots.instanceMatrix.needsUpdate = true;
  incident.geometry.setPositions(segA);
  incident.computeLineDistances();
  reflected.geometry.setPositions(segB);
  central.geometry.setPositions([E.x, E.y, E.z, P0.x, P0.y, P0.z]);
  eyeDot.position.copy(E);
}

// ------------------------------------------------------------------ cameras
const eyeCam = new THREE.PerspectiveCamera(45, ASPECT, 0.02, 40);
const insetCam = new THREE.PerspectiveCamera(45, 1, 0.02, 40);
const camera = new THREE.PerspectiveCamera(45, ASPECT, 0.02, 60);
let aspect = ASPECT;
let frameW = 300, frameH = 380;
const halfAngle = Math.asin(SPHERE.r / DIST);
const eyeFov = (a) => THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfAngle) / FILL / Math.min(1, a)));
const eye = new THREE.Vector3();

function eyeAt(phi, out) {
  return out.set(Math.sin(phi) * RHO, EYE_Y, Math.cos(phi) * RHO);
}

const ovPos = new THREE.Vector3();
function overviewPose() {
  const ce = Math.cos(OV.el);
  ovPos.set(Math.sin(OV.az) * ce, Math.sin(OV.el), Math.cos(OV.az) * ce).multiplyScalar(OV.dist).add(OV.target);
}
overviewPose();

// ------------------------------------------------------------------ layout
const inset = document.getElementById('inset');
fitFrame(ASPECT, (w, h) => {
  frameW = w; frameH = h;
  renderer.setSize(w, h);
  aspect = w / h;
  res.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  const s = Math.round(Math.min(w, h) * (w < 420 ? 0.4 : 0.36));
  inset.style.width = inset.style.height = `${s}px`;
});

// ------------------------------------------------------------------ state + ui
const state = {
  phi: 2.7, // where the artist stands
  playing: true,
  litho: 1, lithoTarget: 1,
  rays: false, k: 0, // 0: the artist's eye, 1: the overview
  t: 0,
  mark: 0, markHold: 0,
  dirty: 3,
};

setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });
const btnRays = document.getElementById('btn-rays');
const hint = document.getElementById('hint');
function setRays(on) {
  state.rays = on;
  btnRays.setAttribute('aria-pressed', String(on));
  btnRays.querySelector('span').textContent = on ? 'Back to the artist’s eye' : 'Show the rays';
  hint.textContent = on ? 'Drag to walk the artist round the sphere · the inset is what they see' : 'Drag to walk round the sphere';
  setBadge(on, 'Seen from outside · the red ray returns to the eye');
}
btnRays.addEventListener('click', () => setRays(!state.rays));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRays(!state.rays),
  ArrowLeft: () => { state.phi -= 0.12; state.markHold = 1.5; },
  ArrowRight: () => { state.phi += 0.12; state.markHold = 1.5; },
});

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.x = e.clientX;
  state.phi -= dx * (state.k > 0.5 ? 0.012 : 0.006);
  state.markHold = 1.5;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// ------------------------------------------------------------------ loop
const clock0 = (() => { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); })();
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
let last = performance.now();
let lastPhi = NaN;

function setFades(all) {
  for (const g of Object.values(groups)) g.fade.value = all ? 1 : g.cur;
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) { state.t += dt; state.phi += WALK * dt; }
  shared.uTime.value = state.t;
  shared.uClock.value = clock0 + state.t;

  if (state.litho !== state.lithoTarget) {
    state.litho += Math.sign(state.lithoTarget - state.litho) * Math.min(Math.abs(state.lithoTarget - state.litho), dt * 2.2);
    shared.uLitho.value = state.litho;
    renderer.setClearColor(PAPER.clone().lerp(new THREE.Color(0xe9e6dc), 1 - state.litho), 1);
    state.dirty = 1;
  }

  // the artist, the clock's pendulum, the drawing hand
  eyeAt(state.phi, eye);
  artist.group.position.set(eye.x, 0, eye.z);
  artist.group.rotation.y = state.phi;
  artist.arm.rotation.set(0.05 * Math.sin(state.t * 2.3), 0.08 * Math.sin(state.t * 1.7), 0);
  artistBox.setFromCenterAndSize(new THREE.Vector3(eye.x, 0.88, eye.z), new THREE.Vector3(0.44, 1.76, 0.44));
  shared.uFeet.value.set(eye.x, 0, eye.z);
  pendulum.rotation.z = 0.075 * Math.sin(state.t * Math.PI);
  if (state.playing || state.phi !== lastPhi) state.dirty = 1;
  lastPhi = state.phi;

  eyeCam.fov = eyeFov(aspect);
  eyeCam.aspect = aspect;
  eyeCam.position.copy(eye);
  eyeCam.up.set(0, 1, 0);
  eyeCam.lookAt(SPHERE.c);
  eyeCam.updateProjectionMatrix();

  // tween between the artist's eye and the overview
  const kT = state.rays ? 1 : 0;
  state.k += Math.sign(kT - state.k) * Math.min(Math.abs(kT - state.k), dt / 2.0);
  const k = ease(state.k);
  camera.position.lerpVectors(eye, ovPos, k);
  camera.fov = lerp(eyeCam.fov, OV.fov, k);
  camera.aspect = aspect;
  camera.up.set(0, 1, 0);
  camera.lookAt(tmpV.copy(SPHERE.c).lerp(OV.target, k));
  camera.updateProjectionMatrix();

  // cut away the walls the camera has passed through
  const p = camera.position, m = 0.02;
  const out = { N: p.z < -D / 2 + m, S: p.z > D / 2 - m, E: p.x > W / 2 - m, W: p.x < -W / 2 + m, ceiling: p.y > H - m, core: false };
  for (const [key, g] of Object.entries(groups)) {
    const target = out[key] ? 0 : 1;
    g.cur += Math.sign(target - g.cur) * Math.min(Math.abs(target - g.cur), dt * 3);
  }
  const inside = !(out.N || out.S || out.E || out.W || out.ceiling);

  // the centre marks: while walking by hand, and always in the inset
  state.markHold = Math.max(0, state.markHold - dt);
  const markT = state.markHold > 0 ? 1 : 0;
  state.mark += Math.sign(markT - state.mark) * Math.min(Math.abs(markT - state.mark), dt * 3);

  // 1. the room as seen from the sphere's centre
  if (state.dirty > 0) {
    setFades(true);
    viewMesh.visible = true;
    artist.group.visible = true;
    sphere.visible = false;
    for (const o of diagram) o.visible = false;
    shared.uHatch.value = 0.011;
    shared.uAir.value = 0;
    shared.uCubePass.value = 1;
    cubeCam.update(renderer, scene);
    shared.uCubePass.value = 0;
    state.dirty = Math.max(0, state.dirty - 1);
  }

  // 2. the main view
  setFades(false);
  viewMesh.visible = inside;
  artist.group.visible = camera.position.distanceTo(eye) > 0.3;
  sphere.visible = true;
  const dA = Math.max(0, (state.k - 0.6) / 0.4);
  for (const o of diagram) { o.visible = dA > 0.01; o.material.opacity = dA; }
  if (dA > 0.01) updateDiagram(eye);
  sphereMat.uniforms.uMark.value = state.mark * (1 - k);
  shared.uHatch.value = 0.0045;
  shared.uAir.value = 0.22 * (1 - k);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, frameW, frameH);
  renderer.render(scene, camera);

  // 3. in the overview: what the artist sees
  const showInset = state.k > 0.98;
  inset.classList.toggle('on', showInset);
  if (showInset) {
    const s = parseFloat(inset.style.width);
    const x = frameW - s - 10, y = frameH - s - 10;
    setFades(true);
    viewMesh.visible = true;
    artist.group.visible = false;
    for (const o of diagram) o.visible = false;
    insetCam.position.copy(eye);
    insetCam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfAngle) / 0.8));
    insetCam.lookAt(SPHERE.c);
    insetCam.updateProjectionMatrix();
    sphereMat.uniforms.uMark.value = 1;
    shared.uAir.value = 0;
    renderer.setScissorTest(true);
    renderer.setScissor(x, y, s, s);
    renderer.setViewport(x, y, s, s);
    renderer.render(scene, insetCam);
    renderer.setScissorTest(false);
  }
  requestAnimationFrame(frame);
}

setRays(false);
markReady();
requestAnimationFrame(frame);

window.__page = { state, setRays, setPlaying, renderer, camera, eye, scene, groups, sphere, artist, viewMesh, shared, THREE };
