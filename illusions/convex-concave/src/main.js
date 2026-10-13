// Convex and Concave: the reading of a parallel projection is decided by its
// shading, and we assume the light comes from above.
//
// The isometric camera looks down d = (1,1,1)/√3. A surface and its mirror
// image in the picture plane draw the same lines; the mirror image is the
// hollow reading (a floor becomes a ceiling, a column a niche), and its normal
// is n' = −n + 2(n·d)d. The arcade is symmetric about the picture's centre
// line; its left half is shaded with the real normals, its right half with
// the hollow ones. Turning the light half way round the picture (keeping its
// part along d) swaps which half looks solid.

import * as THREE from 'three';
import { createSharedUniforms, makeInk } from './ink.js';
import { buildArcade, ARC } from './arcade.js';
import { buildSchroeder, SCH } from './schroeder.js';
import { fitFrame, setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';

const ISO_AZ = Math.PI / 4, ISO_EL = Math.atan(1 / Math.SQRT2);
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const PAPER = new THREE.Color(0xece5d5), PAPER_C = new THREE.Color(0xe9e6dc);
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const shared = createSharedUniforms();

// picture axes for the isometric view
const R = new THREE.Vector3(1, 0, -1).normalize();
const U = new THREE.Vector3(-1, 2, -1).normalize();
const D = new THREE.Vector3(1, 1, 1).normalize();
const LIGHT_DEPTH = 40 * DEG; // how far the light leans towards the viewer
function lightDir(theta) {
  const c = Math.cos(LIGHT_DEPTH), s = Math.sin(LIGHT_DEPTH);
  return new THREE.Vector3()
    .addScaledVector(R, c * Math.cos(theta))
    .addScaledVector(U, c * Math.sin(theta))
    .addScaledVector(D, s)
    .normalize();
}
const ABOVE = 128 * DEG, BELOW = ABOVE + Math.PI;

// ------------------------------------------------------------------ scenes
const arcade = new THREE.Mesh(buildArcade().build(), makeInk(shared, { hatch: 0.75, transparent: true }));
const stairs = new THREE.Mesh(buildSchroeder().build(), makeInk(shared, { hatch: 0.55, transparent: true }));
for (const m of [arcade, stairs]) { m.frustumCulled = false; scene.add(m); }

// picture point → world point on the isometric axis at the given depth
const fromScreen = (X, Y, depth = 0) => {
  const u = X * Math.SQRT2, v = Y * Math.sqrt(6);
  const y = (depth + v) / 3, xz = 2 * y - v;
  return new THREE.Vector3((xz + u) / 2, y, (xz - u) / 2);
};
const MODES = [
  { key: 'arcade', mesh: arcade, H: 23.5, target: fromScreen(0, 1.15), split: 1 },
  { key: 'stairs', mesh: stairs, H: 17.5, target: fromScreen(0.15, 2.55), split: 0 },
];

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
let mode = 0, aspect = 30 / 38, frameW = 600, frameH = 760, dpr = 1;
function updateCamera() {
  const M = MODES[mode];
  camera.position.copy(M.target).addScaledVector(D, 150);
  camera.up.set(0, 1, 0);
  camera.lookAt(M.target);
  const h = M.H / 2;
  camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
}

const overlay = document.getElementById('overlay');
const octx = overlay.getContext('2d');
fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h; frameW = w; frameH = h;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr);
  overlay.style.width = `${w}px`; overlay.style.height = `${h}px`;
  updateCamera();
});

// ------------------------------------------------------------------ state + ui
setupPanel();
const state = {
  litho: 1, lithoTarget: 1,
  theta: ABOVE, thetaFrom: ABOVE, thetaTo: ABOVE, swing: 1,
  shade: 1, shadeTarget: 1,
  cycle: 0, fade: 1, switching: null,
};

segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => {
  state.lithoTarget = v;
  document.body.classList.toggle('colour', !v);
}, 1);

// light: above / none / below
const lightBtns = [['btn-above', 'above'], ['btn-flat', 'none'], ['btn-below', 'below']].map(([id, v]) => [document.getElementById(id), v]);
function pressLight(v) { for (const [el, k] of lightBtns) el.setAttribute('aria-pressed', String(k === v)); }
function swingTo(theta) {
  // the short way round, so the light always passes through the side
  let to = theta;
  while (to - state.theta > Math.PI) to -= 2 * Math.PI;
  while (to - state.theta < -Math.PI) to += 2 * Math.PI;
  state.thetaFrom = state.theta; state.thetaTo = to; state.swing = 0;
}
function setLight(v, user = true) {
  if (user) setPlaying(false);
  pressLight(v);
  if (v === 'none') { state.shadeTarget = 0; return; }
  state.shadeTarget = 1;
  swingTo(v === 'above' ? ABOVE : BELOW);
}
for (const [el, v] of lightBtns) el.addEventListener('click', () => setLight(v));

let playing = true;
const setPlaying = playButton((on) => { playing = on; if (on) state.cycle = 0; });

const modeBtns = [document.getElementById('btn-arcade'), document.getElementById('btn-stairs')];
const setMode = segmented(modeBtns.map((el, i) => [el, i]), (i) => {
  if (i === mode) { if (state.switching) state.switching = { to: i, t: state.fade * 0.5 }; return; }
  state.switching = { to: i, t: (1 - state.fade) * 0.35 };
});

keys({
  ' ': () => setPlaying(!playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  a: () => setLight('above'), b: () => setLight('below'), n: () => setLight('none'),
  s: () => setLight(Math.sin(state.thetaTo) > 0 ? 'below' : 'above'),
  1: () => setMode(0), 2: () => setMode(1),
});

// drag anywhere on the print to put the light where the pointer is
let drag = false;
function lightFromPointer(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2, y = rect.height / 2 - (e.clientY - rect.top);
  if (Math.hypot(x, y) < 6) return;
  state.theta = Math.atan2(y, x);
  state.thetaTo = state.theta; state.swing = 1;
  state.shadeTarget = 1;
  const s = Math.sin(state.theta);
  pressLight(s > 0.25 ? 'above' : s < -0.25 ? 'below' : '');
}
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = true;
  setPlaying(false);
  lightFromPointer(e);
});
canvas.addEventListener('pointermove', (e) => { if (drag) lightFromPointer(e); });
const end = () => { drag = false; };
canvas.addEventListener('pointerup', end);
canvas.addEventListener('pointercancel', end);

// ------------------------------------------------------------------ captions
const caption = document.getElementById('caption');
const CAPTIONS = {
  arcade: {
    above: 'Lit from above: the left half is seen from above, the right half (the same lines) from below.',
    side: 'With the light from the side, the habit of assuming light from above has nothing to work with.',
    below: 'Lit from below, the readings swap: the right half looks solid, the left half hollow.',
    none: 'Without shading the drawing is symmetric, and either half reads either way.',
  },
  stairs: {
    above: 'Lit from above: steps seen from above, climbing to the left against a wall.',
    side: 'With the light from the side, the habit of assuming light from above has nothing to work with.',
    below: 'Lit from below: the same lines become steps hanging from a ceiling.',
    none: 'Schröder’s stairs (1858): unshaded, the drawing flips between both readings by itself.',
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

// ------------------------------------------------------------------ light dial
function drawDial() {
  octx.clearRect(0, 0, overlay.width, overlay.height);
  const k = dpr * Math.min(1.25, Math.max(0.75, frameH / 860));
  const R0 = 21 * k;
  const cx = overlay.width - (R0 + 26 * k), cy = R0 + 24 * k;
  const ink = state.litho > 0.5 ? 'rgba(36, 32, 28, ' : 'rgba(52, 44, 36, ';
  octx.save();
  octx.globalAlpha = state.fade;
  octx.lineWidth = 1.1 * k;
  octx.strokeStyle = ink + '0.55)';
  octx.setLineDash([2.5 * k, 2.5 * k]);
  octx.beginPath(); octx.arc(cx, cy, R0, 0, Math.PI * 2); octx.stroke();
  octx.setLineDash([]);
  // the picture's up, as a tick
  octx.beginPath(); octx.moveTo(cx, cy - R0 - 3 * k); octx.lineTo(cx, cy - R0 + 3 * k); octx.stroke();
  const a = state.shade;
  const sx = cx + Math.cos(state.theta) * R0, sy = cy - Math.sin(state.theta) * R0;
  octx.globalAlpha = state.fade * (0.25 + 0.75 * a);
  // rays
  octx.strokeStyle = ink + '0.9)';
  octx.lineWidth = 1.2 * k;
  for (let i = 0; i < 8; i++) {
    const g = (i / 8) * Math.PI * 2;
    octx.beginPath();
    octx.moveTo(sx + Math.cos(g) * 6.5 * k, sy + Math.sin(g) * 6.5 * k);
    octx.lineTo(sx + Math.cos(g) * 9.5 * k, sy + Math.sin(g) * 9.5 * k);
    octx.stroke();
  }
  octx.fillStyle = 'rgba(236, 229, 213, 1)';
  octx.beginPath(); octx.arc(sx, sy, 4.6 * k, 0, Math.PI * 2); octx.fill(); octx.stroke();
  // arrow towards the centre: the direction the light travels
  const ex = cx + (sx - cx) * 0.18, ey = cy + (sy - cy) * 0.18;
  const bx = cx + (sx - cx) * 0.62, by = cy + (sy - cy) * 0.62;
  octx.beginPath(); octx.moveTo(bx, by); octx.lineTo(ex, ey); octx.stroke();
  const ang = Math.atan2(ey - by, ex - bx);
  octx.beginPath();
  octx.moveTo(ex, ey);
  octx.lineTo(ex - Math.cos(ang - 0.45) * 5 * k, ey - Math.sin(ang - 0.45) * 5 * k);
  octx.moveTo(ex, ey);
  octx.lineTo(ex - Math.cos(ang + 0.45) * 5 * k, ey - Math.sin(ang + 0.45) * 5 * k);
  octx.stroke();
  octx.globalAlpha = state.fade;
  octx.fillStyle = ink + '0.7)';
  octx.font = `italic ${Math.round(11 * k)}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'top';
  octx.fillText('light', cx, cy + R0 + 7 * k);
  octx.restore();
}

// ------------------------------------------------------------------ loop
// the automatic swing: hold above, turn, hold below, turn back
const HOLD = 6.5, TURN = 2.6;
let last = performance.now();
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function frameLoop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  if (playing) {
    state.cycle += dt;
    if (state.cycle > HOLD && state.swing >= 1) {
      state.cycle = 0;
      state.shadeTarget = 1;
      const toBelow = Math.sin(state.theta) > 0;
      pressLight(toBelow ? 'below' : 'above');
      swingTo(toBelow ? BELOW : ABOVE);
    }
  }
  if (state.swing < 1) {
    state.swing = Math.min(1, state.swing + dt / TURN);
    state.theta = state.thetaFrom + (state.thetaTo - state.thetaFrom) * ease(state.swing);
  }
  state.shade += Math.sign(state.shadeTarget - state.shade) * Math.min(Math.abs(state.shadeTarget - state.shade), dt * 1.8);

  if (state.litho !== state.lithoTarget) {
    const d = state.lithoTarget - state.litho;
    state.litho += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2);
  }
  shared.uLitho.value = state.litho;
  const bg = PAPER_C.clone().lerp(PAPER, state.litho);
  renderer.setClearColor(bg, 1);
  const bgs = bg.clone().convertLinearToSRGB();
  shared.uBg.value.set(bgs.r, bgs.g, bgs.b);

  // switching between the arcade and the stairs
  if (state.switching) {
    const sw = state.switching;
    sw.t += dt;
    if (sw.to !== mode) {
      state.fade = Math.max(0, 1 - sw.t / 0.35);
      if (state.fade === 0) { mode = sw.to; updateCamera(); sw.t = 0; }
    } else {
      state.fade = Math.min(1, sw.t / 0.5);
      if (state.fade >= 1) state.switching = null;
    }
  }
  MODES.forEach((M, i) => {
    M.mesh.visible = i === mode;
    M.mesh.material.uniforms.uFade.value = state.fade;
  });

  shared.uLight.value.copy(lightDir(state.theta));
  shared.uShade.value = state.shade;
  shared.uSplit.value = MODES[mode].split;
  shared.uTime.value = now / 1000;

  renderer.render(scene, camera);
  drawDial();

  const sinT = Math.sin(state.theta);
  let reading = sinT > 0.3 ? 'above' : sinT < -0.3 ? 'below' : 'side';
  if (state.shade < 0.35) reading = 'none';
  setCaption(CAPTIONS[MODES[mode].key][reading]);
  caption.style.opacity = String(state.fade);

  requestAnimationFrame(frameLoop);
}

markReady();
requestAnimationFrame(frameLoop);

window.__page = {
  state, setLight, setPlaying, setMode, updateCamera, MODES, ARC, SCH, shared,
  renderer,
  get mode() { return mode; },
  rebuild(o) { Object.assign(ARC, o); arcade.geometry.dispose(); arcade.geometry = buildArcade().build(); },
  // jump to a mode and light angle (degrees) for stills; shade 0..1
  show(i, thetaDeg = 128, shade = 1) {
    setPlaying(false);
    mode = i; setMode(i); state.switching = null; state.fade = 1;
    state.theta = state.thetaTo = thetaDeg * DEG; state.swing = 1;
    state.shade = state.shadeTarget = shade;
    const sn = Math.sin(state.theta);
    pressLight(shade < 0.5 ? 'none' : sn > 0.25 ? 'above' : sn < -0.25 ? 'below' : '');
    updateCamera();
  },
};
