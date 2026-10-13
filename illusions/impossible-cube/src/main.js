// Impossible Cube: three plates on ambiguous depth under parallel projection.
//
//   I   the Necker cube: one drawing, two cubes, mirror images in the picture plane
//   II  the impossible cube: one crossing of the frame drawn the "wrong" way
//   III a belvedere whose upper floor is turned 90°, in true isometric
//
// Plates I and II share one oblique orthographic view; plate III uses the
// isometric view down (1, 1, 1). "Reveal" swings the camera off that axis.

import * as THREE from 'three';
import { createSharedUniforms } from './ink.js';
import { resizeLines, lineMaterials } from './lines.js';
import { createNecker } from './necker.js';
import { createImpossibleCube } from './cube.js';
import { createPavilion, PAV } from './pavilion.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

const ISO_AZ = Math.PI / 4;
const ISO_EL = Math.atan(1 / Math.SQRT2);
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_C = new THREE.Color(0xe9e6dc);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const shared = createSharedUniforms();

// ------------------------------------------------------------------ views
const dirOf = (az, el) => new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
const rightOf = (az) => new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
const CUBE_AZ = 30 * DEG, CUBE_EL = 24 * DEG;
const D1 = dirOf(CUBE_AZ, CUBE_EL);
const R1 = rightOf(CUBE_AZ);
const U1 = new THREE.Vector3().crossVectors(D1, R1);

const necker = createNecker(shared, D1);
const cube = createImpossibleCube(shared, D1, [R1, U1]);
const pavilion = createPavilion(shared);

// picture centre of the pavilion, on the isometric axis
const isoCentre = (X, Y, depth) => {
  const u = X * Math.SQRT2, v = Y * Math.sqrt(6);
  const y = (depth + v) / 3, xz = 2 * y - v;
  return new THREE.Vector3((xz + u) / 2, y, (xz - u) / 2);
};
const PAV_MID = new THREE.Vector3(0, PAV.Hs * 0.55, 0);

const ACTS = [
  {
    key: 'necker', obj: necker,
    view: { az: CUBE_AZ, el: CUBE_EL }, H: 5.1, target: new THREE.Vector3(0, 0, 0).addScaledVector(U1, -0.2),
    reveal: { az: CUBE_AZ - 74 * DEG, el: 16 * DEG, zoom: 0.8 }, pivot: new THREE.Vector3(0, 0, 0),
  },
  {
    key: 'cube', obj: cube,
    view: { az: CUBE_AZ, el: CUBE_EL }, H: 5.1, target: new THREE.Vector3(0, 0, 0).addScaledVector(U1, -0.2),
    reveal: { az: CUBE_AZ - 70 * DEG, el: 18 * DEG, zoom: 0.64 }, pivot: D1.clone().multiplyScalar(1.3),
  },
  {
    key: 'pavilion', obj: pavilion,
    view: { az: ISO_AZ, el: ISO_EL }, H: 25.5, target: isoCentre(0.1, 5.4, 0),
    reveal: { az: ISO_AZ - 76 * DEG, el: 17 * DEG, zoom: 0.92 }, pivot: PAV_MID,
  },
];
for (const a of ACTS) scene.add(a.obj.group);

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
const view = { az: ACTS[0].view.az, el: ACTS[0].view.el, zoom: 1, panX: 0, panY: 0, k: 0 };
let act = 0;
let aspect = 30 / 38;
let frameH = 800;

function updateCamera() {
  const A = ACTS[act];
  const dir = dirOf(view.az, view.el);
  const right = rightOf(view.az);
  const up = new THREE.Vector3().crossVectors(dir, right);
  const target = A.target.clone().lerp(A.pivot, view.k);
  target.addScaledVector(right, view.panX).addScaledVector(up, view.panY);
  camera.position.copy(target).addScaledVector(dir, 150);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  const h = A.H / 2 / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect;
  camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}

// ------------------------------------------------------------------ overlay
const overlay = document.getElementById('overlay');
const octx = overlay.getContext('2d');
const caption = document.getElementById('caption');
let dpr = 1;

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  frameH = h;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr);
  overlay.style.width = `${w}px`; overlay.style.height = `${h}px`;
  resizeLines(w, h, Math.min(1.35, Math.max(0.62, h / 860)));
  updateCamera();
});

// ------------------------------------------------------------------ state + ui
setupPanel();
const START = [1.0, 0, 0]; // plate clocks start where the plate already shows its point
const state = { litho: 1, lithoTarget: 1, revealed: false, tween: null, time: START[0], fade: 1, switching: null };

segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
  document.body.classList.toggle('colour', !v);
}, 1);
let playing = true;
const setPlaying = playButton((on) => { playing = on; });

const plateButtons = [0, 1, 2].map((i) => document.getElementById(`btn-plate-${i + 1}`));
const setPlate = segmented(plateButtons.map((el, i) => [el, i]), (i) => goTo(i));
const revealBtn = document.getElementById('btn-reveal');
const hint = document.getElementById('hint');

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function animateView(to, dur = 2.0) { state.tween = { from: { ...view }, to: { ...view, ...to }, t: 0, dur }; }
function mainView() { const A = ACTS[act]; return { az: A.view.az, el: A.view.el, zoom: 1, panX: 0, panY: 0, k: 0 }; }
function revealView() { const A = ACTS[act]; return { ...A.reveal, panX: 0, panY: 0, k: 1 }; }

function setRevealed(on) {
  state.revealed = on;
  revealBtn.setAttribute('aria-pressed', String(on));
  revealBtn.querySelector('span').textContent = on ? 'Back to the picture' : 'Reveal the 3D';
  hint.textContent = on ? 'Drag to turn the real object · scroll to zoom · double-click to reset' : 'Drag to pan · scroll to zoom · 1 2 3 choose a plate';
  animateView(on ? revealView() : mainView(), 2.0);
}
revealBtn.addEventListener('click', () => setRevealed(!state.revealed));

// switch plates: fade out, move the camera, fade in; a new choice made in the
// middle of a switch carries on from the current fade
function goTo(i) {
  if (i === act) {
    if (state.switching) state.switching = { to: i, t: state.fade * 0.55 };
    return;
  }
  state.switching = { to: i, t: (1 - state.fade) * 0.35 };
}

function resetView() {
  if (state.revealed) setRevealed(false);
  else animateView(mainView(), 0.8);
}

keys({
  ' ': () => setPlaying(!playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRevealed(!state.revealed),
  1: () => setPlate(0), 2: () => setPlate(1), 3: () => setPlate(2),
  0: () => resetView(),
});

// pointer: drag pans (orbits when revealed); wheel zooms about the cursor
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
  const unitsPerPx = ACTS[act].H / view.zoom / canvas.clientHeight;
  if (state.revealed) {
    view.az -= dx * 0.007;
    view.el = Math.min(1.45, Math.max(-0.6, view.el + dy * 0.005));
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
  const H = ACTS[act].H;
  const before = H / view.zoom;
  const z = Math.min(6, Math.max(0.4, view.zoom * Math.exp(-e.deltaY * 0.0015)));
  const after = H / z;
  view.panX += mx * aspect * (before - after);
  view.panY += my * (before - after);
  view.zoom = z;
  updateCamera();
}, { passive: false });

// ------------------------------------------------------------------ captions
const CAPTIONS = {
  necker: {
    A: 'Shaded as if lit from above, the lower-left square is the front face: a cube seen from above.',
    none: 'Without shading the drawing has no front and no back. Either square can come forward.',
    B: 'Shade it the other way and the upper-right square comes forward: a cube seen from below.',
    reveal: 'From the side: the two readings are mirror images in the picture plane. Each corner slides along your line of sight (red), so the drawing never changes.',
  },
  cube: {
    possible: 'A frame you could build: at both circles the front beam passes in front of the back one.',
    impossible: 'At the red circle the back post now passes in front of the top beam. Each crossing is plausible alone; together no solid frame fits.',
    reveal: 'The trick in 3D: a piece of the back post is cut out and slid towards you along the line of sight (red), until it hides the front beam.',
  },
  pavilion: {
    main: 'The second pillar from the right stands at the front of the podium, yet holds up the back corner of the upper floor. Its twin on the left does the reverse.',
    reveal: 'The real building: each pillar leans along the isometric line of sight, so from that one angle it looks plumb. The middle pair cross like an X.',
  },
};
let captionText = '';
function setCaption(t) {
  if (t === captionText) return;
  captionText = t;
  caption.classList.add('swap');
  clearTimeout(setCaption.timer);
  setCaption.timer = setTimeout(() => { caption.textContent = t; caption.classList.remove('swap'); }, 260);
}

// ------------------------------------------------------------------ overlay drawing
const vtmp = new THREE.Vector3();
function toScreen(p) {
  vtmp.copy(p).project(camera);
  return [(vtmp.x * 0.5 + 0.5) * overlay.width, (0.5 - vtmp.y * 0.5) * overlay.height];
}
function drawOverlay(alpha) {
  octx.clearRect(0, 0, overlay.width, overlay.height);
  const on = ACTS[act].key === 'cube' && alpha >= 0.01;
  overlay.style.visibility = on ? 'visible' : 'hidden';
  if (!on) return;
  const s = overlay.height / (ACTS[act].H / view.zoom);
  const ring = (p, bad) => {
    const [x, y] = toScreen(p);
    const r = 0.34 * s;
    octx.save();
    octx.globalAlpha = alpha;
    octx.lineWidth = Math.max(1.2, 1.6 * dpr * (frameH / 860));
    octx.strokeStyle = bad ? 'rgba(162, 59, 42, 0.95)' : 'rgba(40, 36, 31, 0.7)';
    octx.setLineDash(bad ? [] : [4 * dpr, 3 * dpr]);
    octx.beginPath(); octx.arc(x, y, r, 0, Math.PI * 2); octx.stroke();
    octx.restore();
  };
  ring(cube.cross1.front, cube.impossible);
  ring(cube.cross2.front, false);
}

// ------------------------------------------------------------------ loop
const INK_L = [0.11, 0.1, 0.09], INK_C = [0.2, 0.175, 0.15];
let last = performance.now();
function offAxis() {
  const A = ACTS[act];
  return Math.min(1, Math.hypot(view.az - A.view.az, view.el - A.view.el) / 0.35);
}

function frameLoop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (playing) state.time += dt;

  // litho <-> colour
  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
  }
  shared.uLitho.value = state.litho;
  const bg = PAPER_C.clone().lerp(PAPER, state.litho);
  renderer.setClearColor(bg, 1);
  const bgs = bg.clone().convertLinearToSRGB();
  shared.uBg.value.set(bgs.r, bgs.g, bgs.b);
  const ink = INK_C.map((c, i) => c + (INK_L[i] - c) * state.litho);
  for (const m of lineMaterials) if (!m.userData.keepColour) m.color.setRGB(ink[0], ink[1], ink[2], THREE.SRGBColorSpace);

  // switching plates: fade out, move, fade in
  if (state.switching) {
    const sw = state.switching;
    sw.t += dt;
    if (sw.to !== act) {
      state.fade = Math.max(0, 1 - sw.t / 0.35);
      if (state.fade === 0) {
        act = sw.to;
        state.time = START[act];
        state.tween = null;
        Object.assign(view, state.revealed ? revealView() : mainView());
        updateCamera();
        sw.t = 0;
      }
    } else {
      state.fade = Math.min(1, sw.t / 0.55);
      if (state.fade >= 1) state.switching = null;
    }
  }

  if (state.tween) {
    const tw = state.tween;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const k = ease(tw.t);
    for (const key of ['az', 'el', 'zoom', 'panX', 'panY', 'k']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * k;
    if (tw.t >= 1) state.tween = null;
    updateCamera();
  }

  const off = offAxis();
  shared.uTime.value = state.time;
  ACTS.forEach((A, i) => { A.obj.group.visible = i === act; });
  ACTS[act].obj.update(state.time, off, state.fade);
  setBadge(off > 0.5, 'Off the picture’s axis: the illusion is broken');

  renderer.render(scene, camera);
  drawOverlay(state.fade * (1 - off));

  // caption
  const key = ACTS[act].key;
  let text;
  if (off > 0.5) text = CAPTIONS[key].reveal;
  else if (key === 'necker') text = CAPTIONS.necker[necker.state.phase];
  else if (key === 'cube') text = CAPTIONS.cube[cube.impossible ? 'impossible' : 'possible'];
  else text = CAPTIONS.pavilion.main;
  setCaption(text);
  caption.style.opacity = String(state.fade);

  requestAnimationFrame(frameLoop);
}

markReady();
requestAnimationFrame(frameLoop);

// debugging handle
window.__page = {
  view, state, updateCamera, setRevealed, setPlaying, setPlate, ACTS,
  renderer,
  get act() { return act; },
  // jump straight to a plate and a time (for stills)
  show(i, t = 0, revealed = false) {
    act = i; state.switching = null; state.fade = 1; state.time = t; state.tween = null;
    setPlate(i);
    state.switching = null;
    state.revealed = revealed;
    revealBtn.setAttribute('aria-pressed', String(revealed));
    Object.assign(view, revealed ? revealView() : mainView());
    updateCamera();
  },
};
