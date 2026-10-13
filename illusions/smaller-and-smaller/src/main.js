// Smaller and Smaller: a self-similar tiling of dolphins that halve in size
// ring by ring toward the centre, with an endless zoom that loops because
// the tiling is the same at every power of two. Raw WebGL, one fragment shader.

import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { VERT, FRAG } from './shader.js';

const PERIOD = 7.5; // seconds per doubling of the zoom
const FIT = 0.5; // ring 0's outer square spans the print at zoom phase 0

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
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
const U = {};
for (const n of ['uRes', 'uS', 'uPhase', 'uTime', 'uLitho', 'uReveal', 'uAmp', 'uDpr']) U[n] = gl.getUniformLocation(prog, n);

// ------------------------------------------------------------------ state
const state = {
  phase: 0, // log2 of the magnification, kept in [0, 1)
  time: 0,
  playing: true,
  litho: 1, lithoTarget: 1,
  reveal: 0, revealTarget: 0,
  dirty: true,
};

let size = { w: 1, h: 1, dpr: 1 };
let quality = 1;
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
const btnReveal = document.getElementById('btn-reveal');
let badgeTimer = 0;
function setReveal(on) {
  state.revealTarget = on ? 1 : 0;
  btnReveal.setAttribute('aria-pressed', String(on));
  btnReveal.textContent = on ? 'Show the dolphins' : 'Reveal construction';
  clearTimeout(badgeTimer);
  if (on) setBadge(true, 'Each ring: four rectangles of three squares, half the size of the ring outside');
  else setBadge(false);
}
btnReveal.addEventListener('click', () => setReveal(!state.revealTarget));
const setPlaying = playButton((on) => { state.playing = on; });
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setReveal(!state.revealTarget),
});

// drag up/down or scroll to zoom by hand
const wrap = (p) => p - Math.floor(p);
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
  drag = { y: e.clientY };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dy = e.clientY - drag.y;
  drag.y = e.clientY;
  state.phase = wrap(state.phase - dy / (canvas.clientHeight * 0.6));
  state.dirty = true;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.phase = wrap(state.phase - e.deltaY * 0.0012);
  state.dirty = true;
}, { passive: false });

// ------------------------------------------------------------------ loop
function draw() {
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform1f(U.uS, FIT * canvas.width);
  gl.uniform1f(U.uPhase, state.phase);
  gl.uniform1f(U.uTime, state.time);
  gl.uniform1f(U.uLitho, state.litho);
  gl.uniform1f(U.uReveal, state.reveal);
  // the dolphins straighten into rectangles while the construction shows
  const r = state.reveal;
  gl.uniform1f(U.uAmp, 1 - r * r * (3 - 2 * r));
  gl.uniform1f(U.uDpr, size.dpr);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const approach = (v, target, rate) => v + Math.sign(target - v) * Math.min(Math.abs(target - v), rate);
let last = performance.now();
const perf = { n: 0, t: 0, last: performance.now() };
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  let changed = state.dirty;
  if (state.playing) {
    state.time += dt;
    if (!drag) state.phase = wrap(state.phase + dt / PERIOD);
    changed = true;
  }
  const l0 = state.litho, r0 = state.reveal;
  state.litho = approach(state.litho, state.lithoTarget, dt * 2.2);
  state.reveal = approach(state.reveal, state.revealTarget, dt * 0.9);
  if (l0 !== state.litho || r0 !== state.reveal) changed = true;
  if (changed) {
    draw();
    state.dirty = false;
    perf.n++; perf.t += now - perf.last;
    if (perf.n >= 40) {
      if (perf.t / perf.n > 26 && quality > 0.5 && !document.hidden) { quality *= 0.8; relayout(); }
      perf.n = 0; perf.t = 0;
    }
  }
  perf.last = now;
  requestAnimationFrame(frame);
}

draw();
markReady();
requestAnimationFrame(frame);

// debug handle for screenshots and the console
window.__page = {
  state, setReveal, setPlaying,
  setLitho: (on) => document.getElementById(on ? 'btn-litho' : 'btn-colour').click(),
  snap() { if (quality !== 1) { quality = 1; relayout(); } state.litho = state.lithoTarget; state.reveal = state.revealTarget; draw(); },
  render: draw,
};
