// Circle Limit: an exact {p,q} tiling of the Poincaré disk, decorated with
// interlocking fish, drawn per pixel in a fragment shader (raw WebGL).

import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { VERT, FRAG } from './shader.js';
import {
  tilingParams, identity, apply, translation, translationBy, compose, renormalize, flatten,
} from './hyperbolic.js';

const TILINGS = [[6, 4], [8, 3], [7, 3], [5, 4], [4, 5]];
const NAMES = { 3: 'triangles', 4: 'squares', 5: 'pentagons', 6: 'hexagons', 7: 'heptagons', 8: 'octagons' };
const COUNT = { 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight' };
const DISK = 0.47; // disk radius as a fraction of the square print
const DRIFT = 0.075; // hyperbolic units per second
const XFADE = 0.9; // seconds to cross-fade between tilings

// ------------------------------------------------------------------ WebGL
const canvas = document.getElementById('scene');
const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true })
  || canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
if (!gl) throw new Error('WebGL unavailable');

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
const U = {};
for (const name of ['uRes', 'uR', 'uM0', 'uM1', 'uA0', 'uA1', 'uA2', 'uA3', 'uB0', 'uB1', 'uB2', 'uB3',
  'uMix', 'uTime', 'uLitho', 'uReveal', 'uBack', 'uDpr', 'uZoom']) U[name] = gl.getUniformLocation(prog, name);

// ------------------------------------------------------------------ state
const state = {
  tiling: tilingParams(6, 4),
  next: null, // tiling being faded in
  mix: 0,
  M: identity(),
  time: 0,
  playing: true,
  litho: 1, lithoTarget: 1,
  reveal: 0, revealTarget: 0,
  back: 1, backTarget: 1,
  vel: null, // momentum: { a: axis point, dir, speed }
  driftAngle: 0.6,
  recentre: false,
  zoom: 1, // debug magnifier
  dirty: true,
};

let size = { w: 1, h: 1, dpr: 1 };
let quality = 1; // lowered automatically if the GPU cannot keep up
const relayout = fitFrame(1, (w, h) => {
  const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, 2) * quality);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  size = { w, h, dpr };
  gl.viewport(0, 0, canvas.width, canvas.height);
  state.dirty = true;
});

// ------------------------------------------------------------------ ui
setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);

const btnTiling = document.getElementById('btn-tiling');
function setReveal(on) {
  state.revealTarget = on ? 1 : 0;
  btnTiling.setAttribute('aria-pressed', String(on));
  btnTiling.textContent = on ? 'Show the fish' : 'Show the tiling';
  showBadge();
}
btnTiling.addEventListener('click', () => setReveal(!state.revealTarget));

const btnBack = document.getElementById('btn-backbone');
function setBack(on) {
  state.backTarget = on ? 1 : 0;
  btnBack.setAttribute('aria-pressed', String(on));
}
btnBack.addEventListener('click', () => setBack(!state.backTarget));

const pqButtons = [...document.querySelectorAll('[data-pq]')];
const setPQ = segmented(pqButtons.map((b) => [b, b.dataset.pq]), (v) => {
  const [p, q] = v.split(',').map(Number);
  chooseTiling(p, q);
});

function chooseTiling(p, q) {
  const cur = state.next || state.tiling;
  if (cur.p === p && cur.q === q) return;
  if (state.next) { state.tiling = state.next; state.mix = 0; }
  state.next = tilingParams(p, q);
  state.mix = 0;
  showBadge();
}

let badgeTimer = 0;
function showBadge() {
  const t = state.next || state.tiling;
  const text = state.revealTarget
    ? `{${t.p},${t.q}}: triangles with angles π/2, π/${t.p}, π/${t.q}`
    : `{${t.p},${t.q}}: ${NAMES[t.p]}, ${COUNT[t.q]} at every corner`;
  setBadge(true, text);
  clearTimeout(badgeTimer);
  badgeTimer = setTimeout(() => setBadge(false), 2600);
}

const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  t: () => setReveal(!state.revealTarget),
  b: () => setBack(!state.backTarget),
  0: () => { state.recentre = true; state.vel = null; },
  1: () => setPQ('6,4'), 2: () => setPQ('8,3'), 3: () => setPQ('7,3'), 4: () => setPQ('5,4'), 5: () => setPQ('4,5'),
});

// ------------------------------------------------------------------ dragging
// The point under the pointer stays under the pointer: each move applies the
// hyperbolic translation along the geodesic from the new pointer position to
// the old one. Releasing keeps the last velocity, which decays.
function toDisk(e) {
  const r = canvas.getBoundingClientRect();
  const R = DISK * r.width;
  let x = (e.clientX - r.left - r.width / 2) / R;
  let y = -(e.clientY - r.top - r.height / 2) / R;
  const m = Math.hypot(x, y);
  if (m > 0.97) { x *= 0.97 / m; y *= 0.97 / m; }
  return [x, y];
}
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
  drag = { z: toDisk(e), t: performance.now(), samples: [] };
  state.vel = null;
  state.recentre = false;
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const z = toDisk(e);
  const now = performance.now();
  const [dx, dy] = [z[0] - drag.z[0], z[1] - drag.z[1]];
  if (Math.hypot(dx, dy) < 1e-6) return;
  state.M = compose(state.M, translation(z, drag.z));
  // velocity, measured at the pointer, in hyperbolic units per second
  const lam = 2 / (1 - (z[0] * z[0] + z[1] * z[1]));
  const dt = Math.max(1, now - drag.t) / 1000;
  drag.samples.push({ z, d: [-dx * lam, -dy * lam], dt, t: now });
  while (drag.samples.length > 5) drag.samples.shift();
  drag.z = z;
  drag.t = now;
  state.dirty = true;
});
const endDrag = () => {
  if (!drag) return;
  const now = performance.now();
  const recent = drag.samples.filter((s) => now - s.t < 120);
  if (recent.length) {
    let sx = 0, sy = 0, st = 0;
    for (const s of recent) { sx += s.d[0]; sy += s.d[1]; st += s.dt; }
    const speed = Math.hypot(sx, sy) / Math.max(st, 0.016);
    if (speed > 0.05) {
      state.vel = { a: recent[recent.length - 1].z, dir: [sx / Math.hypot(sx, sy), sy / Math.hypot(sx, sy)], speed: Math.min(speed, 6) };
    }
  }
  drag = null;
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('dblclick', () => { state.recentre = true; state.vel = null; });

// ------------------------------------------------------------------ loop
function upload() {
  const [m0, m1] = flatten(state.M);
  gl.uniform4fv(U.uM0, m0);
  gl.uniform4fv(U.uM1, m1);
  const A = state.tiling.packed, B = (state.next || state.tiling).packed;
  for (let i = 0; i < 4; i++) {
    gl.uniform4fv(U[`uA${i}`], A.slice(i * 4, i * 4 + 4));
    gl.uniform4fv(U[`uB${i}`], B.slice(i * 4, i * 4 + 4));
  }
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform1f(U.uR, DISK * canvas.width);
  gl.uniform1f(U.uDpr, size.dpr);
  gl.uniform1f(U.uMix, state.next ? state.mix : 0);
  gl.uniform1f(U.uTime, state.time);
  gl.uniform1f(U.uLitho, state.litho);
  gl.uniform1f(U.uReveal, state.reveal);
  gl.uniform1f(U.uBack, state.back);
  gl.uniform1f(U.uZoom, state.zoom);
}

const approach = (v, target, rate) => v + Math.sign(target - v) * Math.min(Math.abs(target - v), rate);
const ease = (t) => t * t * (3 - 2 * t);

let last = performance.now();
let fadeT = 0;
const perf = { n: 0, t: 0, last: performance.now() };
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  let moved = false;

  if (state.playing) {
    state.time += dt;
    // slow drift along a gently turning geodesic through the centre of view
    if (!drag && !state.recentre) {
      state.driftAngle += dt * 0.045;
      const d = [Math.cos(state.driftAngle), Math.sin(state.driftAngle)];
      state.M = compose(state.M, translationBy([0, 0], d, DRIFT * dt));
      moved = true;
    }
  }
  if (state.vel && !drag) {
    state.M = compose(state.M, translationBy(state.vel.a, state.vel.dir, state.vel.speed * dt));
    state.vel.speed *= Math.exp(-dt * 1.6);
    if (state.vel.speed < 0.02) state.vel = null;
    moved = true;
  }
  if (state.recentre) {
    // glide back toward the centre of a polygon
    const w = apply(state.M, [0, 0]);
    const m = Math.hypot(w[0], w[1]);
    if (m < 1e-4) state.recentre = false;
    else {
      const step = Math.min(1, dt * 3.5);
      // the view centre should show a point a little nearer the pattern's origin
      state.M = compose(state.M, translation([0, 0], apply(inverse(state.M), [w[0] * (1 - step), w[1] * (1 - step)])));
    }
    moved = true;
  }
  if (state.next) {
    fadeT += dt / XFADE;
    state.mix = ease(Math.min(1, fadeT));
    if (fadeT >= 1) { state.tiling = state.next; state.next = null; state.mix = 0; fadeT = 0; }
    moved = true;
  } else fadeT = 0;
  if (!state.next) state.M = renormalize(state.M, state.tiling);

  const l0 = state.litho, r0 = state.reveal, b0 = state.back;
  state.litho = approach(state.litho, state.lithoTarget, dt * 2.2);
  state.reveal = approach(state.reveal, state.revealTarget, dt * 2.0);
  state.back = approach(state.back, state.backTarget, dt * 3.0);
  if (l0 !== state.litho || r0 !== state.reveal || b0 !== state.back) moved = true;

  if (moved || state.dirty || state.playing) {
    upload();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.dirty = false;
    // adapt the resolution: if frames are consistently slow, render fewer pixels
    perf.n++; perf.t += now - perf.last;
    if (perf.n >= 40) {
      if (perf.t / perf.n > 26 && quality > 0.5 && !document.hidden) { quality *= 0.8; relayout(); }
      perf.n = 0; perf.t = 0;
    }
  }
  perf.last = now;
  requestAnimationFrame(frame);
}

function inverse(f) {
  const [a, b, c, d] = f.m;
  return { m: [d, [-b[0], -b[1]], [-c[0], -c[1]], a], flip: false };
}

upload();
gl.drawArrays(gl.TRIANGLES, 0, 3);
markReady();
requestAnimationFrame(frame);

// debug handle for screenshots and the console
window.__page = {
  state,
  setReveal, setBack, setPlaying,
  setLitho: (on) => document.getElementById(on ? 'btn-litho' : 'btn-colour').click(),
  setPQ,
  // jump: set litho/reveal/mix instantly
  snap() { if (quality !== 1) { quality = 1; relayout(); } state.litho = state.lithoTarget; state.reveal = state.revealTarget; state.back = state.backTarget; if (state.next) { state.tiling = state.next; state.next = null; state.mix = 0; } state.dirty = true; },
  move(x, y, s) { state.M = compose(state.M, translationBy([0, 0], [x, y], s)); state.dirty = true; },
  render() { upload(); gl.drawArrays(gl.TRIANGLES, 0, 3); },
};
