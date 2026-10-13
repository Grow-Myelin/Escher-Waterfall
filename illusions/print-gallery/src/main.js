// Print Gallery: a picture that contains itself, straight and twisted.
//
// 1. The straight Droste picture is drawn once into a log-polar texture
//    (scene.js). It repeats when scaled by R = 256, so in log coordinates it
//    is a wallpaper with periods ln R and 2πi, and the texture tiles.
// 2. Every frame, display.js reads it through w = α_t·(log z + shift):
//    α_0 = 1 is the straight picture, α_1 = (2πi + ln R)/(2πi) is the
//    Escher/Lenstra–de Smit twist. Zooming is a shift of log z; after one
//    period γ_t = ln R / α_t the picture is back where it started.

import * as THREE from 'three';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';
import { SCENE_VS, SCENE_FS } from './scene.js';
import { DISPLAY_VS, DISPLAY_FS } from './display.js';
import { alphaAt, gammaAt, LNR, TAU } from './geometry.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0xece5d5, 1);

const params = new URLSearchParams(location.search);
const TEX = Math.min(renderer.capabilities.maxTextureSize, +params.get('tex') || 4096);

// ------------------------------------------------------------ the picture
const quad = new THREE.PlaneGeometry(2, 2);
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
const rt = new THREE.WebGLRenderTarget(TEX, TEX, {
  depthBuffer: false,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
  magFilter: THREE.LinearFilter,
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
});
rt.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
// Drawn in horizontal strips, one per frame, so a slow GPU never stalls for
// long; mipmaps are built after the last strip.
const STRIPS = TEX >= 4096 ? 8 : 2;
const painter = (() => {
  const mat = new THREE.ShaderMaterial({
    vertexShader: SCENE_VS,
    fragmentShader: SCENE_FS,
    uniforms: { uTexSize: { value: new THREE.Vector2(TEX, TEX) } },
    depthTest: false,
    depthWrite: false,
  });
  const s = new THREE.Scene();
  const m = new THREE.Mesh(quad, mat);
  m.frustumCulled = false;
  s.add(m);
  let next = 0;
  return {
    get done() { return next >= STRIPS; },
    step() {
      if (next >= STRIPS) return;
      const h = TEX / STRIPS;
      rt.texture.generateMipmaps = next === STRIPS - 1;
      rt.scissor.set(0, next * h, TEX, h);
      rt.scissorTest = true;
      renderer.setRenderTarget(rt);
      renderer.render(s, cam);
      renderer.setRenderTarget(null);
      rt.scissorTest = false;
      next++;
      if (next >= STRIPS) mat.dispose();
    },
  };
})();

// ------------------------------------------------------------ the display
const uniforms = {
  uTex: { value: rt.texture },
  uRes: { value: new THREE.Vector2(1, 1) },
  uAlpha: { value: new THREE.Vector2(1, 0) },
  uShift: { value: new THREE.Vector2(0, 0) },
  uScale: { value: 1.12 },
  uLitho: { value: 1 },
  uGrid: { value: 0 },
  uSeam: { value: 0 },
  uCut: { value: 0 },
  uLog: { value: 0 },
  uLogC: { value: new THREE.Vector2(-LNR / 2, -Math.PI) },
  uLogH: { value: 3.9 },
  uPaper: { value: new THREE.Vector3(0.925, 0.898, 0.835) },
  uInk: { value: new THREE.Vector3(0.11, 0.1, 0.09) },
};
const display = new THREE.Scene();
{
  const m = new THREE.Mesh(quad, new THREE.ShaderMaterial({ vertexShader: DISPLAY_VS, fragmentShader: DISPLAY_FS, uniforms, depthTest: false, depthWrite: false }));
  m.frustumCulled = false;
  display.add(m);
}

fitFrame(1, (w, h) => {
  renderer.setSize(w, h);
  const pr = renderer.getPixelRatio();
  uniforms.uRes.value.set(w * pr, h * pr);
});

// ------------------------------------------------------------ state
const LOG_SPEED = 0.26; // zoom speed, in natural-log units per second
// Composition: an extra turn and scale of the view, per twist. Chosen so the
// straight picture shows the room through its window and the twisted one
// sits the gallery's visitor in the lower left.
const comp = { straight: [0, 0], twist: [0.38 * 3.1172277, 0.38 * 2.7510856 + 0.6] };

const state = {
  t: 1,
  tTween: null,
  tau: 0,
  playing: true,
  litho: 1, lithoTarget: 1,
  grid: 0, gridTarget: 0,
  log: 0, logTarget: 0,
};

const ui = {
  slider: document.getElementById('twist'),
  grid: document.getElementById('btn-grid'),
  log: document.getElementById('btn-log'),
  hint: document.getElementById('hint'),
};

setupPanel();
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });

function setTwist(t, animate) {
  t = Math.min(1, Math.max(0, t));
  if (animate) state.tTween = { from: state.t, to: t, k: 0, dur: 2.4 * Math.abs(t - state.t) + 0.2 };
  else { state.tTween = null; state.t = t; }
}
function setGrid(on) {
  state.gridTarget = on ? 1 : 0;
  ui.grid.setAttribute('aria-pressed', String(on));
}
function setLog(on) {
  state.logTarget = on ? 1 : 0;
  ui.log.setAttribute('aria-pressed', String(on));
  ui.log.querySelector('span').textContent = on ? 'Back to the picture' : 'Log plane';
}
ui.slider.addEventListener('input', () => setTwist(ui.slider.value / 1000, false));
ui.grid.addEventListener('click', () => setGrid(!state.gridTarget));
ui.log.addEventListener('click', () => setLog(!state.logTarget));

keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  t: () => setTwist(state.t > 0.5 ? 0 : 1, true),
  g: () => setGrid(!state.gridTarget),
  v: () => setLog(!state.logTarget),
  ArrowLeft: () => setTwist(state.t - 0.05, true),
  ArrowRight: () => setTwist(state.t + 0.05, true),
  '0': () => { state.tau = 0; },
});

// wheel and vertical drag zoom by hand
function zoomBy(dlog) {
  const g = gammaAt(state.t);
  state.tau += dlog / g[0];
}
canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomBy(e.deltaY * 0.0025); }, { passive: false });
let drag = null;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = e.clientY; });
canvas.addEventListener('pointermove', (e) => {
  if (drag === null) return;
  zoomBy(-(e.clientY - drag) * 0.01);
  drag = e.clientY;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

function badgeText(t) {
  if (t < 0.001) return 'Straight: the picture repeats at 1/256 scale';
  if (t > 0.999) return 'Twisted: one turn round the centre = ×256';
  return `Twist ${(t * 100).toFixed(0)}% — the picture does not yet close up`;
}

const approach = (v, target, rate) => v + Math.sign(target - v) * Math.min(Math.abs(target - v), rate);
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

let last = performance.now();
let badgeShown = '';
let badgeSince = -1e9;
let badgeOn = false;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (!painter.done) {
    painter.step();
    if (painter.done) markReady();
    requestAnimationFrame(frame);
    return;
  }
  if (state.tTween) {
    const tw = state.tTween;
    tw.k = Math.min(1, tw.k + dt / tw.dur);
    state.t = tw.from + (tw.to - tw.from) * ease(tw.k);
    if (tw.k >= 1) state.tTween = null;
  }
  const t = state.t;
  if (+ui.slider.value !== Math.round(t * 1000)) ui.slider.value = String(Math.round(t * 1000));
  const g = gammaAt(t);
  if (state.playing) state.tau += (dt * LOG_SPEED) / g[0];
  state.tau -= Math.floor(state.tau);
  const a = alphaAt(t);
  const c = [comp.straight[0] + (comp.twist[0] - comp.straight[0]) * t, comp.straight[1] + (comp.twist[1] - comp.straight[1]) * t];
  uniforms.uAlpha.value.set(a[0], a[1]);
  uniforms.uShift.value.set(c[0] - state.tau * g[0], c[1] - state.tau * g[1]);
  // the seam guide shows only while the twist is not whole
  uniforms.uSeam.value = Math.min(1, Math.min(t, 1 - t) * 25);

  state.litho = approach(state.litho, state.lithoTarget, dt * 2.2);
  state.grid = approach(state.grid, state.gridTarget, dt * 3);
  state.log = approach(state.log, state.logTarget, dt * 2.2);
  uniforms.uLitho.value = state.litho;
  uniforms.uGrid.value = state.grid;
  uniforms.uLog.value = ease(state.log);

  // the badge explains the current twist: shown while it changes, and kept
  // while the picture is open at the seam
  const text = badgeText(t);
  if (text !== badgeShown) { badgeShown = text; badgeSince = now; }
  const showBadge = (t > 0.001 && t < 0.999) || now - badgeSince < 3500;
  if (showBadge !== badgeOn) { badgeOn = showBadge; setBadge(showBadge, text); }
  else if (showBadge) setBadge(true, text);

  renderer.render(display, cam);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.__page = { state, uniforms, comp, setTwist, setGrid, setLog, setPlaying, TEX };
