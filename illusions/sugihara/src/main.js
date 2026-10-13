// Ambiguous cylinders in front of a mirror, after Kokichi Sugihara. Each tube's
// rim is a space curve built so that, from the design direction, it looks
// like a square in front and like a circle in the mirror behind it.
// The camera is a parallel (orthographic) projection, so the construction
// is exact; the mirror is a real reflection of the 3D scene.

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { createSharedUniforms } from '../../../src/materials.js';
import { inkMaterial } from './ink.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { buildTube, rimPoint } from './tube.js';

// ------------------------------------------------------------------ layout
const TH = THREE.MathUtils.degToRad(42); // elevation of both design views
const TAN = Math.tan(TH);
const ZM = -2.2; // the mirror plane z = ZM, facing +z
const GLASS = { x0: -2.4, x1: 2.6, y0: 0.14, y1: 4.85 };
const WALL_Z = -2.75;
const TABLE = { x0: -8, x1: 8, z0: WALL_Z, z1: 2.75, top: 0, th: 0.3 };
const TUBES = [
  { x: -0.6, z: 0.2, r: 1.0, hMin: 0.95, wall: 0.07, col: 0xd99063, inner: 0xe8c3a2, turn: 0 },
  { x: 1.78, z: 0.55, r: 0.52, hMin: 0.5, wall: 0.05, col: 0x93a9bd, inner: 0xc9d6e0, turn: Math.PI },
];
for (const t of TUBES) t.y0 = t.hMin + (TAN * t.r) / 2;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.autoClear = false;
const PAPER = new THREE.Color(0xece5d5), CREAM = new THREE.Color(0xe9e4da);
renderer.setClearColor(PAPER, 1);

const uniforms = createSharedUniforms();
uniforms.uHatch = { value: 2.6 };
uniforms.uLight.value.set(-0.42, 0.78, 0.47).normalize();
// the mirror world is lit by the mirror image of the same lamp
const mirrorUniforms = { ...uniforms, uLight: { value: uniforms.uLight.value.clone().multiply(new THREE.Vector3(1, 1, -1)) } };
const ink = inkMaterial(uniforms);
const inkMirror = inkMaterial(mirrorUniforms);
Object.assign(inkMirror, {
  stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc,
  stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp,
});

const scene = new THREE.Scene(); // the room
const mirrorScene = new THREE.Scene(); // what the mirror shows: the room reflected in z = ZM
const maskScene = new THREE.Scene(); // the glass, into the stencil buffer

const reflect = new THREE.Group();
reflect.matrixAutoUpdate = false;
reflect.matrix.makeTranslation(0, 0, ZM).multiply(new THREE.Matrix4().makeScale(1, 1, -1)).multiply(new THREE.Matrix4().makeTranslation(0, 0, -ZM));
reflect.matrixWorldNeedsUpdate = true;
mirrorScene.add(reflect);

// ------------------------------------------------------------------ the room
function mesh(build, mat = ink) {
  const b = new Builder();
  build(b);
  const m = new THREE.Mesh(b.build(), mat);
  m.frustumCulled = false;
  return m;
}
const wood = st(0xb08a62, PAT.WOOD);
const woodDark = st(0x6e5038, PAT.WOOD);
const plaster = st(0xe3dccb, PAT.PLASTER);

scene.add(mesh((b) => {
  // back wall with a dado rail and skirting
  b.box(-12, -3, WALL_Z - 0.3, 12, 12, WALL_Z, plaster, { skip: ['nz'] });
  b.box(-12, 1.6, WALL_Z, 12, 1.72, WALL_Z + 0.06, st(0xd2c8b4, PAT.PLAIN), {});
  // the mirror: frame, a bevelled edge and two feet resting on the table
  const { x0, x1, y0, y1 } = GLASS;
  const f = 0.2, d0 = ZM - 0.14, d1 = ZM + 0.07;
  b.box(x0 - f, y0 - f, d0, x1 + f, y0, d1, woodDark, {});
  b.box(x0 - f, y1, d0, x1 + f, y1 + f, d1, woodDark, {});
  b.box(x0 - f, y0, d0, x0, y1, d1, woodDark, {});
  b.box(x1, y0, d0, x1 + f, y1, d1, woodDark, {});
  b.box(x0 - f - 0.02, y1 + f, d0 - 0.02, x1 + f + 0.02, y1 + f + 0.08, d1 + 0.02, woodDark, {});
  for (const x of [x0 + 0.5, x1 - 0.5]) b.box(x - 0.18, 0, ZM - 0.75, x + 0.18, 0.14, ZM - 0.1, woodDark, {});
  // the table behind the mirror, and the table's front edge
  b.box(TABLE.x0, TABLE.top - TABLE.th, TABLE.z0, TABLE.x1, TABLE.top, ZM, wood, { top: wood });
}));
// the part of the table in front of the mirror is also seen in it
const tableFront = (b) => b.box(TABLE.x0, TABLE.top - TABLE.th, ZM, TABLE.x1, TABLE.top, TABLE.z1, wood, { skip: ['nz'] });
scene.add(mesh(tableFront));
reflect.add(mesh(tableFront, inkMirror));
// a small printed card on the table
const card = (b) => {
  b.box(-0.55, 0, 1.75, 0.55, 0.012, 2.35, st(0xf3eee2, PAT.PLAIN), {});
  b.box(-0.42, 0.012, 1.86, 0.3, 0.016, 1.9, st(0x5a534a, PAT.PLAIN), {});
  b.box(-0.42, 0.012, 1.98, 0.42, 0.016, 2.01, st(0x8f877b, PAT.PLAIN), {});
  b.box(-0.42, 0.012, 2.08, 0.36, 0.016, 2.11, st(0x8f877b, PAT.PLAIN), {});
  b.box(-0.42, 0.012, 2.18, 0.1, 0.016, 2.21, st(0x8f877b, PAT.PLAIN), {});
};
scene.add(mesh(card));
reflect.add(mesh(card, inkMirror));

// ------------------------------------------------------------------ the tubes
const tubeObjs = TUBES.map((t) => {
  const geo = (() => {
    const b = new Builder();
    buildTube(b, t.r, t.y0, TH, t.wall, st(t.col, PAT.PLAIN), st(t.inner, PAT.PLAIN));
    return b.build();
  })();
  const real = new THREE.Group();
  real.position.set(t.x, 0, t.z);
  const m = new THREE.Mesh(geo, ink);
  m.frustumCulled = false;
  real.add(m);
  scene.add(real);
  const seen = new THREE.Group();
  seen.position.copy(real.position);
  const mm = new THREE.Mesh(geo, inkMirror);
  mm.frustumCulled = false;
  seen.add(mm);
  reflect.add(seen);
  const g = makeGuides(t);
  real.add(g.direct);
  seen.add(g.mirror);
  return { t, real, seen, guides: g, angle: t.turn };
});

// Guides: the square and the circle the rim is seen as, at height y0, and
// the lines of sight joining rim corners to them. Square + its sight lines
// belong to the front view, circle + its sight lines to the mirror view.
function makeGuides(t) {
  const { r, y0 } = t;
  const mat = new THREE.LineDashedMaterial({ color: 0xa23b2a, dashSize: 0.09, gapSize: 0.06, transparent: true, opacity: 0, depthTest: false });
  const matM = mat.clone();
  Object.assign(matM, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilZPass: THREE.KeepStencilOp });
  const lines = (segs, m) => {
    const g = new THREE.Group();
    for (const pts of segs) {
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
      const l = new THREE.Line(geo, m);
      l.computeLineDistances();
      l.renderOrder = 30;
      g.add(l);
    }
    return g;
  };
  const sq = [[r, y0, r], [-r, y0, r], [-r, y0, -r], [r, y0, -r], [r, y0, r]];
  const circ = [];
  for (let i = 0; i <= 72; i++) { const a = (i / 72) * Math.PI * 2; circ.push([r * Math.cos(a), y0, r * Math.sin(a)]); }
  const corners = [rimPoint(r, y0, TH, r, false), rimPoint(r, y0, TH, -r, false), rimPoint(r, y0, TH, -r, true), rimPoint(r, y0, TH, r, true)];
  const sqC = [[r, y0, r], [-r, y0, r], [-r, y0, -r], [r, y0, -r]];
  const circC = [[r, y0, 0], [-r, y0, 0], [-r, y0, 0], [r, y0, 0]];
  const sqSet = [sq, ...corners.map((c, i) => [c, sqC[i]])];
  const circSet = [circ, ...corners.map((c, i) => [c, circC[i]])];
  return {
    // which set goes where is swapped when the tube is turned
    direct: lines(sqSet, mat), directAlt: lines(circSet, mat),
    mirror: lines(circSet, matM), mirrorAlt: lines(sqSet, matM),
    mats: [mat, matM],
  };
}
for (const o of tubeObjs) {
  o.real.add(o.guides.directAlt);
  o.seen.add(o.guides.mirrorAlt);
}

// ------------------------------------------------------------------ the glass
const glassGeo = new THREE.PlaneGeometry(GLASS.x1 - GLASS.x0, GLASS.y1 - GLASS.y0);
glassGeo.translate((GLASS.x0 + GLASS.x1) / 2, (GLASS.y0 + GLASS.y1) / 2, ZM);
maskScene.add(new THREE.Mesh(glassGeo, new THREE.MeshBasicMaterial({
  colorWrite: false, depthWrite: false, depthTest: false,
  stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
})));
// in the room, the glass hides the wall behind it …
const glassDepth = new THREE.Mesh(glassGeo, new THREE.MeshBasicMaterial({ colorWrite: false }));
glassDepth.renderOrder = -10;
scene.add(glassDepth);
// … and tints what it reflects a little, with a soft sheen
const sheen = (() => {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, 'rgba(255,255,255,0.10)');
  grd.addColorStop(0.32, 'rgba(255,255,255,0.02)');
  grd.addColorStop(0.36, 'rgba(255,255,255,0.13)');
  grd.addColorStop(0.42, 'rgba(255,255,255,0.03)');
  grd.addColorStop(1, 'rgba(255,255,255,0.0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();
const glassTint = new THREE.Mesh(glassGeo, new THREE.MeshBasicMaterial({ color: 0x9fb2ad, transparent: true, opacity: 0.1, depthWrite: false }));
glassTint.renderOrder = 10;
scene.add(glassTint);
const glassSheen = new THREE.Mesh(glassGeo, new THREE.MeshBasicMaterial({ map: sheen, transparent: true, depthWrite: false }));
glassSheen.renderOrder = 11;
scene.add(glassSheen);

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
const TARGET = new THREE.Vector3(0.1, 1.55, -0.75);
const VIEW_H = 7.2;
const DESIGN = { az: 0, el: TH, zoom: 1 };
const REVEAL = { az: 0.78, el: 0.36, zoom: 0.92 };
const view = { ...DESIGN };
let aspect = 30 / 38;
function placeCamera() {
  const ce = Math.cos(view.el), se = Math.sin(view.el);
  const dir = new THREE.Vector3(ce * Math.sin(view.az), se, ce * Math.cos(view.az));
  camera.position.copy(TARGET).addScaledVector(dir, 60);
  camera.up.set(0, 1, 0);
  camera.lookAt(TARGET);
  const h = VIEW_H / 2 / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}
fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  placeCamera();
});

// ------------------------------------------------------------------ state + ui
const state = {
  playing: true, litho: 1, lithoTarget: 1, revealed: false, tween: null,
  turn: null, // { from, t, dur }
  turned: false, clock: 0,
};
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; state.clock = 0; });
const btnTurn = document.getElementById('btn-turn');
const btnReveal = document.getElementById('btn-reveal');
function turn() {
  if (state.turn) return;
  state.turn = { t: 0, dur: 2.6 };
  state.clock = 0;
}
function setRevealed(on) {
  state.revealed = on;
  btnReveal.setAttribute('aria-pressed', String(on));
  btnReveal.querySelector('span').textContent = on ? 'Back to the design view' : 'Show the real shape';
  document.getElementById('hint').textContent = on ? 'Drag to turn the view · double-click for the design view' : 'Drag to look from elsewhere · the mirror shows the back of each tube';
  animateView(on ? REVEAL : DESIGN);
}
function animateView(to, dur = 2.0) { state.tween = { from: { ...view }, to: { ...to }, t: 0, dur }; }
btnTurn.addEventListener('click', turn);
btnReveal.addEventListener('click', () => setRevealed(!state.revealed));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  t: turn,
  r: () => setRevealed(!state.revealed),
  0: () => setRevealed(false),
});

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
  view.az = THREE.MathUtils.clamp(view.az - dx * 0.006, -1.4, 1.4);
  view.el = THREE.MathUtils.clamp(view.el + dy * 0.004, 0.08, 1.35);
  if (!state.revealed && Math.hypot(view.az - DESIGN.az, view.el - DESIGN.el) > 0.05) {
    state.revealed = true;
    btnReveal.setAttribute('aria-pressed', 'true');
    btnReveal.querySelector('span').textContent = 'Back to the design view';
  }
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => setRevealed(false));
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  view.zoom = THREE.MathUtils.clamp(view.zoom * Math.exp(-e.deltaY * 0.0012), 0.6, 4);
}, { passive: false });

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  // turn the tubes half a turn every few seconds while playing
  if (state.playing && !state.turn && !state.revealed) {
    state.clock += dt;
    if (state.clock > 6.5) turn();
  }
  let k = state.turned ? 1 : 0;
  if (state.turn) {
    const tw = state.turn;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    k = state.turned ? 1 - ease(tw.t) : ease(tw.t);
    if (tw.t >= 1) { state.turn = null; state.turned = !state.turned; k = state.turned ? 1 : 0; }
  }
  for (const o of tubeObjs) {
    const a = o.t.turn + Math.PI * k;
    o.real.rotation.y = a;
    o.seen.rotation.y = a;
  }

  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const e = ease(tw.t);
    for (const key of ['az', 'el', 'zoom']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * e;
    if (tw.t >= 1) state.tween = null;
  }
  placeCamera();

  // guides: only off the design view, and not while turning
  const off = Math.hypot(view.az - DESIGN.az, view.el - DESIGN.el);
  const g = state.turn ? 0 : THREE.MathUtils.clamp((off - 0.1) / 0.35, 0, 1);
  for (const o of tubeObjs) {
    const flip = Math.round((o.real.rotation.y / Math.PI) % 2) === 1;
    o.guides.direct.visible = !flip; o.guides.directAlt.visible = flip;
    o.guides.mirror.visible = !flip; o.guides.mirrorAlt.visible = flip;
    for (const m of o.guides.mats) m.opacity = g;
    o.guides.mats.forEach(() => {});
  }
  for (const o of tubeObjs) for (const grp of [o.guides.direct, o.guides.directAlt, o.guides.mirror, o.guides.mirrorAlt]) grp.children.forEach((l) => { l.material.opacity = g; });

  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
  }
  uniforms.uLitho.value = state.litho;
  renderer.setClearColor(CREAM.clone().lerp(PAPER, state.litho), 1);
  const atDesign = off < 1e-3 && !state.turn;
  setBadge(atDesign && !state.noBadge, state.turned ? 'Design view: round tubes in front, square in the mirror' : 'Design view: square tubes in front, round in the mirror');
  document.body.classList.toggle('off-axis', off > 1e-3);

  renderer.clear(true, true, true);
  renderer.render(maskScene, camera);
  renderer.render(mirrorScene, camera);
  renderer.clearDepth();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);

window.__page = {
  state, view,
  setView(az, el, zoom = 1) { state.tween = null; Object.assign(view, { az, el, zoom }); },
  setTurned(on) { state.turn = null; state.turned = on; state.clock = 0; },
  setTurnPhase(t) { state.turn = { t, dur: 1e9 }; },
  setLitho(on) { document.getElementById(on ? 'btn-litho' : 'btn-colour').click(); state.litho = on ? 1 : 0; },
  reveal: setRevealed,
};
