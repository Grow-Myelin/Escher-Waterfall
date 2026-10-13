// Cylindrical-mirror anamorphosis with a double image.
//
// The sheet carries a drawing in its own right (an island fortress in a lake),
// part of which is the anamorphic image of a second picture, a masonry
// Penrose triangle. The anamorphosis is computed exactly: every eye ray of
// the picture is reflected off the cylinder and continued to the paper. The
// cylinder itself is ray-traced, so its reflection is right from any angle.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { R, H, EYE, AIM, PIC, SHEET, trace } from './geometry.js';
import { drawPicture, drawSheet, triangleCorners } from './art.js';
import { createUniforms, makeTableMaterial, makeRoomMaterial, makeCylinderMaterial, makeCopyMaterial, makeMapMaterial } from './shaders.js';

const RED = 0xa23b2a;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0xece5d5, 1);
const u = createUniforms();
u.uDim.value.set(R, H);
u.uSheetRect.value.set(SHEET.x0, SHEET.z0, SHEET.x1, SHEET.z1);

// ------------------------------------------------------------------ the sheet texture
function buildSheet(opts = {}) {
  const pic = drawPicture();
  const sh = drawSheet();
  const tex = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const picInk = tex(pic.ink), picWash = tex(pic.wash), shInk = tex(sh.ink), shWash = tex(sh.wash);
  const maxT = renderer.capabilities.maxTextureSize || 4096;
  const W = Math.min(2048, maxT);
  const Hh = Math.min(maxT, Math.round((W * (SHEET.z1 - SHEET.z0)) / (SHEET.x1 - SHEET.x0)));
  const rt = new THREE.WebGLRenderTarget(W, Hh, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    depthBuffer: false,
  });
  rt.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // the mirror map: a grid over the picture, each vertex moved to where its
  // reflected eye ray lands on the paper
  const NU = 220, NV = 360;
  const pos = new Float32Array((NU + 1) * (NV + 1) * 3);
  const uv = new Float32Array((NU + 1) * (NV + 1) * 2);
  const ok = new Uint8Array((NU + 1) * (NV + 1));
  const gx = new Float32Array((NU + 1) * (NV + 1));
  const gz = new Float32Array((NU + 1) * (NV + 1));
  for (let j = 0; j <= NV; j++) {
    for (let i = 0; i <= NU; i++) {
      const k = j * (NU + 1) + i;
      const s = i / NU, t = j / NV;
      const hit = trace(PIC.u0 + (PIC.u1 - PIC.u0) * s, PIC.v0 + (PIC.v1 - PIC.v0) * t);
      uv[k * 2] = s; uv[k * 2 + 1] = t;
      if (!hit || !hit.ground) continue;
      const g = hit.ground;
      ok[k] = 1; gx[k] = g.x; gz[k] = g.z;
      pos[k * 3] = ((g.x - SHEET.x0) / (SHEET.x1 - SHEET.x0)) * 2 - 1;
      pos[k * 3 + 1] = 1 - ((g.z - SHEET.z0) / (SHEET.z1 - SHEET.z0)) * 2;
    }
  }
  const idx = [];
  const near = (a, b) => Math.hypot(gx[a] - gx[b], gz[a] - gz[b]) < 1.2;
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
      if (ok[a] && ok[b] && ok[c] && near(a, b) && near(a, c) && near(b, c)) idx.push(a, b, c);
      if (ok[b] && ok[d] && ok[c] && near(b, d) && near(d, c) && near(b, c)) idx.push(b, d, c);
    }
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  mg.setAttribute('pic', new THREE.BufferAttribute(uv, 2));
  mg.setIndex(idx);
  const passScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), makeCopyMaterial(shInk, shWash));
  quad.frustumCulled = false;
  quad.renderOrder = 0;
  const map = new THREE.Mesh(mg, makeMapMaterial(picInk, picWash));
  map.frustumCulled = false;
  map.renderOrder = 1;
  passScene.add(quad, map);
  if (opts.noMap) map.visible = false;
  const cam = new THREE.Camera();
  renderer.setRenderTarget(rt);
  renderer.render(passScene, cam);
  renderer.setRenderTarget(null);
  for (const t of [picInk, picWash, shInk, shWash]) t.dispose();
  mg.dispose();
  return rt;
}
let sheetRT = buildSheet();
u.uSheet.value = sheetRT.texture;

// ------------------------------------------------------------------ the scene
const scene = new THREE.Scene();
{
  const g = new THREE.PlaneGeometry(80, 80);
  g.rotateX(-Math.PI / 2);
  const table = new THREE.Mesh(g, makeTableMaterial(u));
  table.frustumCulled = false;
  scene.add(table);
  const room = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), makeRoomMaterial(u));
  room.frustumCulled = false;
  room.renderOrder = -1;
  scene.add(room);
}
const cylProxy = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.06, R * 1.06, H + 0.06, 64, 1, false), makeCylinderMaterial(u));
cylProxy.frustumCulled = false;
scene.add(cylProxy);
const cylState = { x: 0, base: 0, z: 0 };
function placeCylinder() {
  cylProxy.position.set(cylState.x, cylState.base + H / 2, cylState.z);
  u.uCyl.value.set(cylState.x, cylState.base, cylState.z, 1);
}
placeCylinder();

// ------------------------------------------------------------------ rays and the eye
const overlay = new THREE.Group();
const overlayMats = [];
{
  const solid = new THREE.MeshBasicMaterial({ color: RED, transparent: true });
  const faint = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.5 });
  overlayMats.push([solid, 1], [faint, 0.55]);
  const unit = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  unit.translate(0, 0.5, 0);
  const dashes = [];
  const dashed = (a, b, mat, r = 0.036, dash = 0.3, gap = 0.17) => {
    const d = b.clone().sub(a);
    const L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    for (let s = 0; s < L; s += dash + gap) dashes.push({ mat, p: a.clone().addScaledVector(d, s / L), q, len: Math.min(dash, L - s), r });
  };
  const dot = (p, m, r = 0.06) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m);
    d.position.copy(p);
    overlay.add(d);
  };
  for (const [uu, vv] of triangleCorners()) {
    const h = trace(uu, vv);
    if (!h || !h.ground) continue;
    dashed(EYE, h.hit, solid);
    dashed(h.hit, h.ground, solid);
    dot(h.hit, solid, 0.06);
    dot(h.ground, solid, 0.09);
  }
  // the picture's frame on the mirror: its four corners' rays, faint
  for (const [uu, vv] of [[PIC.u0 * 0.97, PIC.v1 * 0.97], [PIC.u1 * 0.97, PIC.v1 * 0.97]]) {
    const h = trace(uu, vv);
    if (h && h.ground) { dashed(EYE, h.hit, faint, 0.018); dashed(h.hit, h.ground, faint, 0.018); }
  }
  for (const mat of [solid, faint]) {
    const list = dashes.filter((d) => d.mat === mat);
    const im = new THREE.InstancedMesh(unit, mat, list.length);
    const m4 = new THREE.Matrix4();
    list.forEach((d, i) => im.setMatrixAt(i, m4.compose(d.p, d.q, new THREE.Vector3(d.r, d.len, d.r))));
    im.frustumCulled = false;
    overlay.add(im);
  }
  // the eye
  dot(EYE, solid, 0.16);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 6, 40), solid);
  ring.position.copy(EYE);
  overlay.add(ring);
  overlay.userData.ring = ring;
  overlay.renderOrder = 5;
  overlay.visible = false;
  scene.add(overlay);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.PerspectiveCamera(27, 30 / 38, 0.1, 400);
const TARGET = new THREE.Vector3(0, 1.1, 1.0);
const E_REL = EYE.clone().sub(AIM);
const E_DIST = E_REL.length();
const E_EL = Math.asin(E_REL.y / E_DIST);
const EYE_FOV = 23;
const POSES = {
  eye: () => ({ pos: EYE.clone(), target: TARGET.clone(), fov: EYE_FOV, up: new THREE.Vector3(0, 1, 0) }),
  sheet: () => ({ pos: new THREE.Vector3(0, 23, 1.8 + 0.001), target: new THREE.Vector3(0, 0, 1.8), fov: 40, up: new THREE.Vector3(0, 0, -1) }),
  rays: () => ({ pos: new THREE.Vector3(-18, 9, 5.5), target: new THREE.Vector3(0, 4.4, 5.6), fov: 64, up: new THREE.Vector3(0, 1, 0) }),
};
function orbitPose(az, el, fov = EYE_FOV) {
  const pos = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(E_DIST).add(AIM);
  // keep the look direction's offset from AIM as at the eye point, turned with the orbit
  const t = TARGET.clone().sub(AIM).applyAxisAngle(new THREE.Vector3(0, 1, 0), az).add(AIM);
  return { pos, target: t, fov, up: new THREE.Vector3(0, 1, 0) };
}
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function smoothstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

// the tour: rest at the eye point, then lean to either side and back
const TOUR = [
  [0, 0, 0], [6, 0, 0], [10.5, 0.62, 0.2], [12, 0.62, 0.2], [17.5, -0.5, -0.17], [19, -0.5, -0.17], [23.5, 0, 0], [26, 0, 0],
];
const TOUR_T = 26;
function tourPose(time) {
  const t = ((time % TOUR_T) + TOUR_T) % TOUR_T;
  let i = 0;
  while (i < TOUR.length - 2 && TOUR[i + 1][0] <= t) i++;
  const [t0, a0, e0] = TOUR[i], [t1, a1, e1] = TOUR[i + 1];
  const k = ease(Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0))));
  if (a0 === 0 && e0 === 0 && a1 === 0 && e1 === 0) return POSES.eye();
  return orbitPose(a0 + (a1 - a0) * k, E_EL + e0 + (e1 - e0) * k);
}

const state = {
  mode: 'tour', // tour | manual | sheet | rays
  tourTime: 0,
  playing: true,
  litho: 1,
  lithoTarget: 1,
  tween: null,
  cur: POSES.eye(),
  orbit: { az: 0, el: E_EL, fov: EYE_FOV },
  rays: 0,
  cyl: null, // cylinder move
};

function applyPose(p) {
  camera.position.copy(p.pos);
  camera.up.copy(p.up).normalize();
  camera.lookAt(p.target);
  if (camera.fov !== p.fov) { camera.fov = p.fov; camera.updateProjectionMatrix(); }
}
function clonePose(p) { return { pos: p.pos.clone(), target: p.target.clone(), fov: p.fov, up: p.up.clone() }; }
function tweenTo(to, dur = 2.2, then) {
  state.tween = { from: clonePose(state.cur), to, t: 0, dur, then };
}
function moveCylinder(to, dur = 2) {
  state.cyl = { from: { ...cylState }, to, t: 0, dur };
}

// ------------------------------------------------------------------ ui
const hint = document.getElementById('hint');
const btnRays = document.getElementById('btn-rays');
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setView = segmented([[document.getElementById('btn-mirror'), 'mirror'], [document.getElementById('btn-sheet'), 'sheet']], (v) => {
  if (v === 'sheet') showSheet();
  else if (state.mode === 'sheet' || state.mode === 'rays') { btnRays.setAttribute('aria-pressed', 'false'); backToEye(); }
}, 'mirror');
const setPlaying = playButton((on) => { state.playing = on; });

function showSheet() {
  setRays(false, true);
  state.mode = 'sheet';
  moveCylinder({ x: 8.8, base: 0, z: -1.2 }, 2.2);
  tweenTo(POSES.sheet(), 2.6);
  hint.textContent = 'The sheet on its own: an island fortress in a lake';
}
function backToEye() {
  state.mode = 'returning';
  if (cylState.x !== 0 || cylState.z !== 0) moveCylinder({ x: 0, base: 0, z: 0 }, 2.2);
  tweenTo(POSES.eye(), 2.4, () => { state.mode = 'tour'; state.tourTime = 0; });
  hint.textContent = 'Drag to look from elsewhere · scroll to zoom · double-click to return to the eye point';
}
function setRays(on, quiet) {
  btnRays.setAttribute('aria-pressed', String(on));
  if (on) {
    if (state.mode === 'sheet') { setView('mirror'); }
    if (cylState.x !== 0) moveCylinder({ x: 0, base: 0, z: 0 }, 2);
    state.mode = 'rays';
    tweenTo(POSES.rays(), 2.6);
    hint.textContent = 'Red: eye rays from the corners of the triangle, reflected by the cylinder onto the paper';
  } else if (!quiet && state.mode === 'rays') {
    backToEye();
  }
}
btnRays.addEventListener('click', () => setRays(state.mode !== 'rays'));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  s: () => setView(state.mode === 'sheet' ? 'mirror' : 'sheet'),
  m: () => setView('mirror'),
  r: () => setRays(state.mode !== 'rays'),
  e: () => { setView('mirror'); setRays(false, true); backToEye(); },
  0: () => { setView('mirror'); setRays(false, true); backToEye(); },
});

// drag: look from elsewhere (orbit about the cylinder); wheel: zoom
let drag = null;
function enterManual() {
  if (state.mode === 'manual') return;
  if (state.mode === 'sheet') return; // the sheet view stays put
  const rel = state.cur.pos.clone().sub(AIM);
  state.orbit = { az: Math.atan2(rel.x, rel.z), el: Math.asin(Math.min(0.99, Math.max(-0.2, rel.y / rel.length()))), fov: state.cur.fov };
  if (state.mode === 'rays') { btnRays.setAttribute('aria-pressed', 'false'); }
  state.mode = 'manual';
  state.tween = null;
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
  if (state.mode === 'sheet') return;
  const keepRays = state.mode === 'rays';
  enterManual();
  if (keepRays) state.rays = 1;
  state.orbit.az -= dx * 0.005;
  state.orbit.el = Math.min(1.45, Math.max(0.08, state.orbit.el + dy * 0.004));
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => { setView('mirror'); setRays(false, true); backToEye(); });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (state.mode === 'sheet') return;
  enterManual();
  state.orbit.fov = Math.min(60, Math.max(10, state.orbit.fov * Math.exp(e.deltaY * 0.001)));
}, { passive: false });

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// ------------------------------------------------------------------ loop
let last = performance.now();
function step(dt) {
  if (state.playing && state.mode === 'tour') state.tourTime += dt;
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
    u.uLitho.value = state.litho;
  }
  // the cylinder's journey
  if (state.cyl) {
    const c = state.cyl;
    c.t = Math.min(1, c.t + dt / c.dur);
    const k = ease(c.t);
    cylState.x = c.from.x + (c.to.x - c.from.x) * k;
    cylState.z = c.from.z + (c.to.z - c.from.z) * k;
    cylState.base = Math.sin(Math.PI * k) * 1.4 * (Math.abs(c.to.x - c.from.x) > 0.1 ? 1 : 0);
    if (c.t >= 1) state.cyl = null;
    placeCylinder();
  }
  // camera
  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = ease(tw.t);
    state.cur = {
      pos: tw.from.pos.clone().lerp(tw.to.pos, k),
      target: tw.from.target.clone().lerp(tw.to.target, k),
      fov: tw.from.fov + (tw.to.fov - tw.from.fov) * k,
      up: tw.from.up.clone().lerp(tw.to.up, k).normalize(),
    };
    if (tw.t >= 1) { state.tween = null; tw.then?.(); }
  } else if (state.mode === 'tour') {
    state.cur = tourPose(state.tourTime);
  } else if (state.mode === 'manual') {
    state.cur = orbitPose(state.orbit.az, state.orbit.el, state.orbit.fov);
  }
  applyPose(state.cur);

  // rays fade in with their view, and stay while you turn round them
  const rTarget = state.mode === 'rays' || (state.mode === 'manual' && btnRays.getAttribute('aria-pressed') === 'true') ? 1 : 0;
  state.rays += Math.sign(rTarget - state.rays) * Math.min(Math.abs(rTarget - state.rays), dt * 1.4);
  overlay.visible = state.rays > 0.01;
  for (const [m, o] of overlayMats) m.opacity = o * state.rays;
  overlay.userData.ring.lookAt(camera.position);

  const off = camera.position.distanceTo(EYE);
  const ang = THREE.MathUtils.radToDeg(camera.position.clone().sub(AIM).angleTo(E_REL));
  if (state.mode === 'sheet' && !state.tween) setBadge(true, 'Sheet only: the drawing as a picture in its own right');
  else if (state.mode === 'rays' && !state.tween) setBadge(true, 'Each eye ray keeps its slope and is mirrored sideways');
  else if (off < 0.05) setBadge(true, 'At the eye point: the mirror rebuilds the picture');
  else setBadge(true, `${Math.max(1, Math.round(ang))}° from the eye point: the reflection bends`);

  renderer.render(scene, camera);
}
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  step(dt);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, camera, renderer, u, step, setView, setRays,
  setLitho(on) { document.getElementById(on ? 'btn-litho' : 'btn-colour').click(); state.litho = on ? 1 : 0; u.uLitho.value = state.litho; },
  setTour(t) { state.mode = 'tour'; state.tween = null; state.tourTime = t; },
  orbit(az, el, fov = EYE_FOV) { state.mode = 'manual'; state.tween = null; state.orbit = { az, el, fov }; },
  finish() { if (state.tween) { state.tween.t = 1; } if (state.cyl) state.cyl.t = 1; step(0.0001); step(0.0001); },
  fov(f) { state.cur.fov = f; },
  rebuild(o) { sheetRT.dispose(); sheetRT = buildSheet(o); u.uSheet.value = sheetRT.texture; },
};
