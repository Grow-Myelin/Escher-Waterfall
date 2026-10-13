// The Turning Bridge: a rotating-world puzzle in true isometric projection.
//
// A crank turns a bridge on top of a tower. At two of its four positions the
// bridge's tip lines up, in the picture only, with a walkway that is really
// 2 units nearer or farther along every axis. The traveller walks across
// anyway: at the seam it is moved by k·(1, 1, 1), along the line of sight,
// which the isometric camera cannot see.

import * as THREE from 'three';
import { createUniforms, makeInkMaterial } from './ink.js';
import { buildStatic, buildBridge, buildBell, buildCloud, cloudSpecs, fromPicture, buildBirdParts } from './scene.js';
import { buildWalker } from './walker.js';
import * as LV from './level.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

// ------------------------------------------------------------------ constants
const ISO_AZ = Math.PI / 4;
const ISO_EL = Math.atan(1 / Math.SQRT2); // 35.264°: the true isometric angle
const REVEAL = { az: ISO_AZ - 1.3, el: 0.7, zoom: 0.75, k: 1 };
const VIEW = { X: 0.45, Y: 0.55, H: 12.9 }; // composition centre (screen units) and visible height
const QUARTER = Math.PI / 2;
const SPEED = 1.45; // walking speed, tiles per second
const STRIDE = 0.34;
const SQ3 = Math.sqrt(3);

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_COLOUR = new THREE.Color(0xe7e4d9);
renderer.setClearColor(PAPER, 1);

const scene = new THREE.Scene();
const uniforms = createUniforms();
const ink = makeInkMaterial(uniforms);

// ------------------------------------------------------------------ the diorama
const staticMesh = new THREE.Mesh(buildStatic().build(), ink);
staticMesh.frustumCulled = false;
scene.add(staticMesh);

const bridge = new THREE.Group();
const bridgeMesh = new THREE.Mesh(buildBridge().build(), ink);
bridgeMesh.frustumCulled = false;
bridge.add(bridgeMesh);
scene.add(bridge);

const BELL_AT = new THREE.Vector3(2, 6.15, 5.24);
const bell = new THREE.Group();
bell.position.copy(BELL_AT);
bell.add(new THREE.Mesh(buildBell().build(), ink));
scene.add(bell);

const walker = buildWalker(ink);
scene.add(walker.root);

// clouds drift slowly through the mist and step aside for the reveal
const cloudUniforms = { ...uniforms, uFade: { value: 1 } };
const cloudMat = makeInkMaterial(cloudUniforms, { transparent: true });
const hullMat = makeInkMaterial(cloudUniforms, { transparent: true, side: THREE.BackSide });
const clouds = cloudSpecs().map((c, i) => {
  const m = new THREE.Mesh(buildCloud(i * 1.37 + 0.4, c.s).build(), cloudMat);
  const hull = new THREE.Mesh(buildCloud(i * 1.37 + 0.4, c.s, 0.035).build(), hullMat);
  hull.renderOrder = 1;
  m.add(hull);
  const p = fromPicture(c.u, c.v, c.y);
  m.position.set(p[0], p[1], p[2]);
  m.userData = { base: p, ph: i * 1.9, sp: 0.05 + 0.03 * (i % 3) };
  m.renderOrder = 2;
  scene.add(m);
  return m;
});

// a few birds wheel slowly in the empty sky behind the towers
const birdParts = buildBirdParts();
const birdGeo = { body: birdParts.body.build(), left: birdParts.left.build(), right: birdParts.right.build() };
const birdMat = makeInkMaterial(cloudUniforms, { transparent: true, side: THREE.DoubleSide });
const BIRD_C = fromPicture(-4.4, 13.2, 7.4);
const birds = [0, 1, 2].map((i) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(birdGeo.body, birdMat));
  const l = new THREE.Mesh(birdGeo.left, birdMat), r = new THREE.Mesh(birdGeo.right, birdMat);
  g.add(l, r);
  g.userData = { l, r, ph: i * 2.1, rad: 1.0 + i * 0.35, sp: 0.32 - i * 0.04, fl: i * 1.7 };
  g.scale.setScalar(0.95 - i * 0.12);
  scene.add(g);
  return g;
});
function updateBirds(t) {
  for (const b of birds) {
    const { l, r, ph, rad, sp, fl } = b.userData;
    const a = ph + t * sp;
    b.position.set(BIRD_C[0] + Math.cos(a) * rad, BIRD_C[1] + Math.sin(a * 2 + ph) * 0.12, BIRD_C[2] + Math.sin(a) * rad);
    b.rotation.set(0, -a, Math.sin(a) * 0.25); // heading along the circle (local +z forward)
    const f = Math.sin(t * 7 + fl) * 0.55 + 0.15;
    const glide = Math.max(0, Math.sin(t * 0.7 + fl)) > 0.6 ? 0.25 : 1;
    l.rotation.z = f * glide;
    r.rotation.z = -f * glide;
  }
}

// ------------------------------------------------------------------ reveal guides
// Each projected join, drawn as a dashed line along the isometric line of
// sight: from the tip's edge (where the bridge stops) to the walkway's edge.
const RED = 0xa23b2a;
const guides = new THREE.Group();
guides.renderOrder = 20;
scene.add(guides);
const guideItems = [];
for (let ti = 0; ti < 4; ti++) {
  for (const j of LV.joinsAt(ti)) {
    if (j.k === 0) continue;
    const g = new THREE.Group();
    const mat = new THREE.LineDashedMaterial({ color: RED, dashSize: 0.22, gapSize: 0.14, transparent: true, opacity: 0, depthTest: false });
    const a = new THREE.Vector3(...j.mR), b = new THREE.Vector3(...j.mN);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mat);
    line.computeLineDistances();
    g.add(line);
    const dotMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthTest: false });
    for (const q of [a, b]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), dotMat);
      dot.position.copy(q);
      g.add(dot);
    }
    // the edge of each tile along the seam
    const seamMat = new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0, depthTest: false });
    const side = [j.d[2], 0, -j.d[0]];
    for (const m of [j.mR, j.mN]) {
      const p0 = new THREE.Vector3(m[0] - side[0] * 0.5, m[1] + 0.004, m[2] - side[2] * 0.5);
      const p1 = new THREE.Vector3(m[0] + side[0] * 0.5, m[1] + 0.004, m[2] + side[2] * 0.5);
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p0, p1]), seamMat));
    }
    g.userData = { ti, mats: [mat, dotMat, seamMat] };
    guides.add(g);
    guideItems.push(g);
  }
}
// the circle the bridge tip sweeps
{
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * 2.5, LV.H + 0.005, Math.sin(a) * 2.5));
  }
  const mat = new THREE.LineDashedMaterial({ color: 0x1d1b18, dashSize: 0.08, gapSize: 0.1, transparent: true, opacity: 0, depthTest: true });
  const circle = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
  circle.computeLineDistances();
  circle.userData = { mats: [mat], ti: -1 };
  guides.add(circle);
  guideItems.push(circle);
}

// destination marker: a small inked diamond on the chosen tile
const markerMat = new THREE.LineBasicMaterial({ color: 0x1d1b18, transparent: true, opacity: 0, depthTest: false });
const marker = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0.28, 0, 0), new THREE.Vector3(0, 0, 0.28), new THREE.Vector3(-0.28, 0, 0), new THREE.Vector3(0, 0, -0.28),
]), markerMat);
marker.renderOrder = 15;
scene.add(marker);
const markerState = { node: null, t: 0, bad: false, pos: null };

// rings that spread from the bell when it is struck
const ringMat = new THREE.LineBasicMaterial({ color: 0x1d1b18, transparent: true, opacity: 0, depthTest: false });
const rings = [];
for (let i = 0; i < 3; i++) {
  const pts = [];
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }
  const r = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat.clone());
  r.renderOrder = 16;
  r.visible = false;
  scene.add(r);
  rings.push(r);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
const CENTRE = new THREE.Vector3(0.25, 0.9, -0.68); // middle of the real structure
function fromScreen(X, Y, depth) {
  const u = X * Math.SQRT2, v = Y * Math.sqrt(6);
  const y = (depth + v) / 3;
  const xz = 2 * y - v;
  return new THREE.Vector3((xz + u) / 2, y, (xz - u) / 2);
}
const isoPivot = fromScreen(VIEW.X, VIEW.Y, CENTRE.x + CENTRE.y + CENTRE.z);
const pivot = new THREE.Vector3();
const view = { az: ISO_AZ, el: ISO_EL, zoom: 1, k: 0 };
let aspect = 30 / 38;

function updateCamera() {
  const ce = Math.cos(view.el), se = Math.sin(view.el);
  const dir = new THREE.Vector3(ce * Math.sin(view.az), se, ce * Math.cos(view.az));
  pivot.copy(isoPivot).lerp(CENTRE, view.k);
  camera.position.copy(pivot).addScaledVector(dir, 120);
  camera.up.set(0, 1, 0);
  camera.lookAt(pivot);
  const h = VIEW.H / 2 / view.zoom;
  camera.left = -h * aspect;
  camera.right = h * aspect;
  camera.top = h;
  camera.bottom = -h;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  updateCamera();
});

function isIso() {
  return Math.abs(view.az - ISO_AZ) < 1e-4 && Math.abs(view.el - ISO_EL) < 1e-4;
}

// ------------------------------------------------------------------ state
const state = {
  playing: true,
  litho: 1,
  lithoTarget: 1,
  revealed: false,
  viewTween: null,
  time: 0,
};

// the bridge: angle θ about +y (θ = 0: arm along +x; θ = 90°: along −z)
const BR = { th: QUARTER, tween: null, drag: null, pendingTurn: 0 };

function settledTi() {
  if (BR.tween || BR.drag) return null;
  const q = BR.th / QUARTER, r = Math.round(q);
  return Math.abs(q - r) < 1e-6 ? ((r % 4) + 4) % 4 : null;
}

function turnTo(th, dur) {
  BR.tween = { from: BR.th, to: th, t: 0, dur: Math.max(0.2, dur) };
}

// the traveller
const W = {
  node: 'start',
  seg: null, // { wps, i, s, to }
  queue: [],
  goal: null,
  pendingGoal: null,
  pos: new THREE.Vector3(...LV.NODES.start.p),
  facing: Math.PI - 0.5, // heading angle; forward = (sin, 0, cos): toward the stairs
  localFacing: 0,
  phase: 0,
  amt: 0,
};

function nodeWorld(id) {
  return LV.nodeWorld(id, BR.th);
}

function legLen(a, b) {
  return Math.hypot(b[0] - a[0], b[2] - a[2]) + Math.abs(b[1] - a[1]) * 0.35;
}

function walkTo(target) {
  const ti = settledTi();
  if (ti === null) { W.pendingGoal = target; return true; }
  const from = W.seg ? W.seg.to : W.node;
  if (from === target && !W.seg) return true;
  const steps = LV.findPath(from, target, ti);
  if (!steps) return false;
  W.queue = steps;
  W.goal = target;
  if (!W.seg) startNextSeg();
  return true;
}

function startNextSeg() {
  const step = W.queue.shift();
  if (!step) { W.goal = null; return; }
  const ti = settledTi() ?? 0;
  W.seg = { wps: LV.edgeWaypoints(step.from, step.nb, ti), i: 0, s: 0, to: step.nb.to };
}

function arrive(id) {
  W.node = id;
  if (LV.NODES[id].rot) W.localFacing = W.facing - BR.th;
  if (id === 'T') ringBell();
}

let lastJump = { k: 0, t: -10 };

function updateWalker(dt) {
  let moved = 0;
  let remaining = SPEED * dt;
  while (W.seg && remaining > 1e-9) {
    const { wps } = W.seg;
    const a = wps[W.seg.i].p, nb = wps[W.seg.i + 1];
    if (nb.jump !== undefined) {
      // the seam: slide along the line of sight, invisible from the iso angle
      W.seg.i++;
      W.seg.s = 0;
      lastJump = { k: nb.jump, t: state.time };
      continue;
    }
    const L = legLen(a, nb.p);
    const left = L - W.seg.s;
    if (remaining < left) {
      W.seg.s += remaining;
      moved += remaining;
      remaining = 0;
    } else {
      remaining -= left;
      moved += left;
      W.seg.i++;
      W.seg.s = 0;
      if (W.seg.i >= wps.length - 1) {
        const to = W.seg.to;
        W.pos.set(...wps[wps.length - 1].p);
        W.seg = null;
        arrive(to);
        if (W.queue.length && !BR.drag && !BR.pendingTurn) startNextSeg();
        else { W.queue = []; W.goal = null; }
      }
    }
  }
  if (W.seg) {
    const { wps } = W.seg;
    const a = wps[W.seg.i].p, b = wps[W.seg.i + 1].p;
    const L = legLen(a, b) || 1;
    const f = Math.min(1, W.seg.s / L);
    W.pos.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
    const dx = b[0] - a[0], dz = b[2] - a[2];
    if (Math.hypot(dx, dz) > 1e-4) {
      const target = Math.atan2(dx, dz);
      let d = target - W.facing;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      W.facing += d * Math.min(1, dt * 14);
    }
  } else if (LV.NODES[W.node].rot) {
    W.pos.set(...nodeWorld(W.node));
    W.facing = W.localFacing + BR.th;
  }
  W.phase += (moved / STRIDE) * Math.PI;
  const want = W.seg ? 1 : 0;
  W.amt += (want - W.amt) * Math.min(1, dt * 10);
  if (!W.seg && W.amt < 0.02) W.phase = 0;
  walker.root.position.copy(W.pos);
  walker.root.rotation.y = W.facing;
  walker.pose(W.phase, W.amt);
}

// ------------------------------------------------------------------ bell
const bellState = { t: 10, amp: 0 };
function ringBell() {
  bellState.t = 0;
  bellState.amp = 0.42;
}
function updateBell(dt) {
  bellState.t += dt;
  const t = bellState.t;
  bell.rotation.x = bellState.amp * Math.exp(-t * 0.9) * Math.sin(t * 8.5);
  bell.rotation.z = bellState.amp * 0.3 * Math.exp(-t * 0.9) * Math.sin(t * 8.5 + 1.2);
  const look = camera.position.clone().sub(pivot).normalize();
  rings.forEach((r, i) => {
    const tt = t - i * 0.32;
    const on = tt > 0 && tt < 1.5;
    r.visible = on;
    if (!on) return;
    const s = 0.22 + tt * 0.55;
    r.position.copy(BELL_AT).add(new THREE.Vector3(0, -0.15, 0));
    r.lookAt(r.position.clone().add(look));
    r.scale.setScalar(s);
    r.material.opacity = 0.75 * (1 - tt / 1.5);
  });
}

// ------------------------------------------------------------------ auto demo
// The solver plans the fewest turns and steps from wherever things stand.
const GOALS = [
  { node: 'T', wait: 2.4 },
  { node: 'B2', wait: 1.8 },
  { node: 'start', wait: 1.6 },
];
const DEMO = { on: true, gi: 0, plan: null, wait: 1.0 };
const autoBtn = document.getElementById('btn-auto');

function setAuto(on) {
  DEMO.on = on;
  DEMO.plan = null;
  DEMO.wait = on ? 0.4 : 0;
  autoBtn.setAttribute('aria-pressed', String(on));
}

function signedQuarters(from, to) {
  const d = (((to - from) % 4) + 4) % 4;
  return d === 3 ? -1 : d;
}

function updateDemo(dt) {
  if (!DEMO.on) return;
  if (W.seg || W.queue.length || BR.tween || BR.drag) return;
  if (DEMO.wait > 0) { DEMO.wait -= dt; return; }
  const goal = GOALS[DEMO.gi];
  if (!DEMO.plan) {
    if (W.node === goal.node) {
      DEMO.gi = (DEMO.gi + 1) % GOALS.length;
      DEMO.wait = goal.wait;
      return;
    }
    DEMO.plan = LV.solve(W.node, settledTi(), goal.node);
    if (!DEMO.plan) { DEMO.gi = (DEMO.gi + 1) % GOALS.length; return; }
  }
  const act = DEMO.plan.shift();
  if (!act) { DEMO.plan = null; return; }
  if (act.type === 'turn') {
    let ti = settledTi();
    let q = signedQuarters(ti, act.ti);
    ti = act.ti;
    while (DEMO.plan.length && DEMO.plan[0].type === 'turn') {
      const n = DEMO.plan.shift();
      q += signedQuarters(ti, n.ti);
      ti = n.ti;
    }
    turnTo(BR.th + q * QUARTER, 0.75 + 0.55 * Math.abs(q));
    DEMO.wait = 0.45;
  } else {
    walkTo(act.to);
    DEMO.wait = 0.35;
  }
}

// ------------------------------------------------------------------ ui
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
}, 1);
const setPlaying = playButton((on) => { state.playing = on; });
autoBtn.addEventListener('click', () => {
  setAuto(!DEMO.on);
  if (DEMO.on && !state.playing) setPlaying(true);
});
const revealBtn = document.getElementById('btn-reveal');
const hint = document.getElementById('hint');
const HINT_ISO = 'Drag the crank to turn the bridge · click a walkway to walk there';
const HINT_REV = 'Drag to turn the view · the dashed lines run along the isometric line of sight';

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function animateView(to, dur = 2.0) {
  state.viewTween = { from: { ...view }, to: { ...view, ...to }, t: 0, dur };
}

function setRevealed(on) {
  state.revealed = on;
  revealBtn.setAttribute('aria-pressed', String(on));
  revealBtn.querySelector('span').textContent = on ? 'Back to the iso view' : 'Reveal the trick';
  hint.textContent = on ? HINT_REV : HINT_ISO;
  if (on) animateView(REVEAL);
  else animateView({ az: ISO_AZ, el: ISO_EL, zoom: 1, k: 0 });
}
revealBtn.addEventListener('click', () => setRevealed(!state.revealed));

function userTurn(q) {
  setAuto(false);
  if (!state.playing) setPlaying(true);
  if (W.seg) { W.queue = []; BR.pendingTurn += q; return; }
  const base = BR.tween ? BR.tween.to : BR.th;
  turnTo(base + q * QUARTER, 0.7);
}

keys({
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRevealed(!state.revealed),
  a: () => autoBtn.click(),
  ' ': () => setPlaying(!state.playing),
  '0': () => { if (state.revealed) setRevealed(false); },
  ArrowLeft: () => userTurn(1),
  ArrowRight: () => userTurn(-1),
  q: () => userTurn(1),
  e: () => userTurn(-1),
});

// ------------------------------------------------------------------ pointer
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function toNdc(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  return ndc;
}

function screenOf(p) {
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(camera);
  const r = canvas.getBoundingClientRect();
  return [(v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height, v.z];
}

// angle of the pointer round the crank axis, in the plane of the handle
const CRANK_Y = LV.H + 0.5;
function pointerAngle(e) {
  ray.setFromCamera(toNdc(e), camera);
  const o = ray.ray.origin, d = ray.ray.direction;
  if (Math.abs(d.y) < 1e-6) return null;
  const t = (CRANK_Y - o.y) / d.y;
  const x = o.x + d.x * t, z = o.z + d.z * t;
  return Math.atan2(-z, x);
}

function overCrank(e) {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  const knob = LV.rotP([-0.32, CRANK_Y + 0.05, 0], BR.th);
  const k = screenOf(knob), c = screenOf([0, LV.H + 0.3, 0]);
  const pxPerUnit = r.height / (VIEW.H / view.zoom);
  const near = Math.hypot(mx - k[0], my - k[1]) < Math.max(18, pxPerUnit * 0.32);
  const wheel = Math.hypot((mx - c[0]) / 1.0, (my - c[1]) / 0.62) < pxPerUnit * 0.46;
  return near || wheel;
}

function pickNode(e, strict = false) {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  let best = null, bestDepth = -Infinity, near = null, nearD = strict ? 0 : 34;
  for (const id of Object.keys(LV.NODES)) {
    const c = nodeWorld(id);
    const corners = [[0.5, 0.5], [0.5, -0.5], [-0.5, -0.5], [-0.5, 0.5]].map(([dx, dz]) => screenOf([c[0] + dx, c[1], c[2] + dz]));
    let inside = false;
    for (let i = 0, j = 3; i < 4; j = i++) {
      const [xi, yi] = corners[i], [xj, yj] = corners[j];
      if ((yi > my) !== (yj > my) && mx < ((xj - xi) * (my - yi)) / (yj - yi) + xi) inside = !inside;
    }
    const s = screenOf(c);
    if (inside && -s[2] > bestDepth) { best = id; bestDepth = -s[2]; }
    const d = Math.hypot(mx - s[0], my - s[1]);
    if (d < nearD) { near = id; nearD = d; }
  }
  return best || near;
}

let ptr = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  if (overCrank(e)) {
    setAuto(false);
    if (!state.playing) setPlaying(true);
    W.queue = [];
    W.pendingGoal = null;
    const base = BR.tween ? BR.tween.to : BR.th;
    BR.tween = null;
    BR.th = base;
    BR.drag = { phi: pointerAngle(e), th: BR.th, id: e.pointerId };
    canvas.style.cursor = 'grabbing';
    return;
  }
  ptr = { x: e.clientX, y: e.clientY, moved: false };
  state.viewTween = null;
});

canvas.addEventListener('pointermove', (e) => {
  if (BR.drag) {
    const phi = pointerAngle(e);
    if (phi === null || BR.drag.phi === null) { BR.drag.phi = phi; return; }
    if (W.seg) { BR.drag.phi = phi; BR.drag.th = BR.th; return; } // wait for the traveller to stop
    let d = phi - BR.drag.phi;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    BR.drag.phi = phi;
    BR.th += d;
    return;
  }
  if (ptr) {
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    if (!ptr.moved && Math.hypot(dx, dy) > 5) ptr.moved = true;
    if (ptr.moved && state.revealed) {
      view.az -= (e.clientX - (ptr.lx ?? ptr.x)) * 0.006;
      view.el = Math.min(1.45, Math.max(-0.2, view.el + (e.clientY - (ptr.ly ?? ptr.y)) * 0.004));
      updateCamera();
    }
    ptr.lx = e.clientX;
    ptr.ly = e.clientY;
    return;
  }
  canvas.style.cursor = overCrank(e) ? 'grab' : pickNode(e, true) ? 'pointer' : state.revealed ? 'grab' : 'default';
});

function endPointer(e) {
  if (BR.drag) {
    const snap = Math.round(BR.th / QUARTER) * QUARTER;
    turnTo(snap, 0.18 + Math.abs(snap - BR.th) * 0.5);
    BR.drag = null;
    canvas.style.cursor = 'grab';
    return;
  }
  if (ptr && !ptr.moved && e.type === 'pointerup') {
    const id = pickNode(e);
    if (id) {
      setAuto(false);
      if (!state.playing) setPlaying(true);
      const ok = walkTo(id);
      markerState.node = id;
      markerState.t = 0;
      markerState.bad = !ok;
    }
  }
  ptr = null;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('dblclick', () => { if (state.revealed) animateView(REVEAL, 0.8); });

// ------------------------------------------------------------------ badge
let lastBadge;
function updateBadge() {
  const ti = settledTi();
  const j = ti === null ? null : LV.joinsAt(ti).find((x) => x.k !== 0);
  let text = null;
  if (!isIso()) {
    text = j
      ? `Off the isometric axis: the bridge stops ${(Math.abs(j.k) * SQ3).toFixed(1)} tiles short of the ${j.n === 'T' ? 'bell tower' : 'garden'}`
      : 'Off the isometric axis: the dashed lines show where the joins open up';
  } else if (j) {
    text = j.n === 'T'
      ? 'Joined in the picture only: the bell tower is 3.5 tiles nearer to you'
      : 'Joined in the picture only: the garden is 3.5 tiles farther from you';
  }
  if (text === lastBadge) return;
  lastBadge = text;
  setBadge(!!text, text || undefined);
}

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const rdt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  step(state.playing ? rdt : 0, rdt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function step(dt, rdt) {
  state.time += dt;
  uniforms.uTime.value = state.time;

  // litho <-> colour
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), rdt * 2.2);
    uniforms.uLitho.value = state.litho;
    renderer.setClearColor(PAPER_COLOUR.clone().lerp(PAPER, state.litho), 1);
  }

  // bridge
  if (BR.tween) {
    const tw = BR.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    BR.th = tw.from + (tw.to - tw.from) * ease(tw.t);
    if (tw.t >= 1) { BR.th = tw.to; BR.tween = null; }
  }
  if (!BR.tween && !BR.drag) {
    // keep θ tidy and exact once settled
    const q = Math.round(BR.th / QUARTER);
    if (Math.abs(BR.th - q * QUARTER) < 1e-6) BR.th = q * QUARTER;
    if (BR.pendingTurn && !W.seg) { turnTo(BR.th + BR.pendingTurn * QUARTER, 0.7); BR.pendingTurn = 0; }
    else if (W.pendingGoal && settledTi() !== null) { const g = W.pendingGoal; W.pendingGoal = null; walkTo(g); }
  }
  bridge.rotation.y = BR.th;

  updateDemo(dt);
  updateWalker(dt);
  updateBell(dt);

  updateBirds(state.time);
  for (const b of birds) b.visible = cloudUniforms.uFade.value > 0.001;
  // clouds drift
  for (const c of clouds) {
    const { base, ph, sp } = c.userData;
    const s = Math.sin(state.time * sp + ph) * 0.35;
    c.position.set(base[0] + s, base[1] + Math.sin(state.time * 0.3 + ph) * 0.05, base[2] - s);
  }

  // marker
  if (markerState.node) {
    markerState.t += rdt;
    const p = nodeWorld(markerState.node);
    marker.position.set(p[0], p[1] + 0.01, p[2]);
    marker.rotation.y = LV.NODES[markerState.node].rot ? BR.th : 0;
    marker.material.color.setHex(markerState.bad ? RED : 0x1d1b18);
    const life = markerState.bad ? 1.0 : 1.6;
    const done = !markerState.bad && W.node === markerState.node && !W.seg;
    marker.material.opacity = done ? Math.max(0, marker.material.opacity - rdt * 3) : Math.max(0, 1 - markerState.t / life) * 0.9 + (markerState.bad ? 0 : 0.1);
    marker.scale.setScalar(markerState.bad ? 1 + 0.15 * Math.sin(markerState.t * 30) * Math.max(0, 1 - markerState.t * 2) : 1 + 0.1 * Math.sin(markerState.t * 6));
    if (markerState.t > 4 && !W.seg) markerState.node = null;
  } else marker.material.opacity = 0;

  // view
  if (state.viewTween) {
    const tw = state.viewTween;
    tw.t = Math.min(1, tw.t + rdt / tw.dur);
    const k = ease(tw.t);
    for (const key of ['az', 'el', 'zoom', 'k']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * k;
    if (tw.t >= 1) state.viewTween = null;
    updateCamera();
  }
  const off = Math.hypot(view.az - ISO_AZ, view.el - ISO_EL);
  const g = Math.min(1, Math.max(0, (off - 0.12) / 0.35));
  const ti = settledTi();
  for (const item of guideItems) {
    const live = item.userData.ti === ti || item.userData.ti === -1;
    const a = g * (item.userData.ti === -1 ? 0.45 : live ? 1 : 0.35);
    item.visible = a > 0.001;
    for (const m of item.userData.mats) m.opacity = a;
  }
  cloudUniforms.uFade.value = Math.max(0, 1 - off / 0.3);
  for (const c of clouds) c.visible = cloudUniforms.uFade.value > 0.001;
  document.body.classList.toggle('off-axis', !isIso());
  updateBadge();
}

updateCamera();
markReady();
requestAnimationFrame(frame);

// debug / screenshot handle
window.__page = {
  BR, W, DEMO, view, state, LV,
  setRevealed, setAuto, setPlaying, turnTo, walkTo,
  // jump straight to a state: { th (degrees), node, revealed, litho, at: [edgeFrom, edgeTo, fraction] }
  set(o = {}) {
    if (o.auto !== undefined) setAuto(o.auto);
    if (o.th !== undefined) { BR.tween = null; BR.th = (o.th * Math.PI) / 180; bridge.rotation.y = BR.th; }
    if (o.node) { W.seg = null; W.queue = []; W.node = o.node; W.pos.set(...nodeWorld(o.node)); if (o.facing !== undefined) W.facing = o.facing; W.localFacing = W.facing - BR.th; }
    if (o.walk) walkTo(o.walk);
    if (o.litho !== undefined) { state.lithoTarget = o.litho; state.litho = o.litho; uniforms.uLitho.value = o.litho; renderer.setClearColor(PAPER_COLOUR.clone().lerp(PAPER, o.litho), 1); document.getElementById(o.litho ? 'btn-litho' : 'btn-colour').setAttribute('aria-pressed', 'true'); document.getElementById(o.litho ? 'btn-colour' : 'btn-litho').setAttribute('aria-pressed', 'false'); }
    if (o.revealed !== undefined) { setRevealed(o.revealed); if (o.instant) { state.viewTween = null; Object.assign(view, o.revealed ? REVEAL : { az: ISO_AZ, el: ISO_EL, zoom: 1, k: 0 }); updateCamera(); } }
    if (o.view) { Object.assign(view, o.view); updateCamera(); }
    if (o.ring) ringBell();
    if (o.playing !== undefined) setPlaying(o.playing);
    if (o.advance) { for (let i = 0; i < o.advance * 30; i++) step(1 / 30, 1 / 30); }
  },
  screen(p) { return screenOf(p); },
  until(cond, max = 4000) { let i = 0; for (; i < max && !cond(); i++) step(1 / 60, 1 / 60); return i; },
};
