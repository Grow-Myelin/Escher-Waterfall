// Drawing Hands: two hands, each drawing the other's cuff and wrist.
//
// One right hand is modelled (hand.js) and placed twice, half a turn apart
// round the centre of the sheet. Behind the wrist each arm is pressed flat
// into the paper: there it exists only as a pencil drawing, and the other
// hand's pencil is laying that drawing down, stroke by stroke (strokes.js).
// Both pencils move at once, on the same timeline, so neither hand is first.

import * as THREE from 'three';
import { buildHandModel, meshSDF, makeHtoL, vertexExtras, footprint, PEN } from './hand.js';
import { buildDrawing, makeTimeline, sampleTimeline, strokeRibbons } from './strokes.js';
import * as SH from './shaders.js';
import { fitFrame, setupPanel, segmented, keys, playButton, setBadge, markReady } from '../../shared/shell.js';

// ------------------------------------------------------------------ the hand
const T0 = performance.now();
const model = buildHandModel();
const mesh = meshSDF(model.sdf, [-13, -4.6, -6.6], [14, 7, 3.6], 0.15);
const X = makeHtoL(model, mesh.positions);

function handGeometry() {
  const gH = new THREE.BufferGeometry();
  gH.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
  gH.setIndex(new THREE.BufferAttribute(mesh.index, 1));
  gH.computeVertexNormals();
  const nH = gH.attributes.normal.array;
  const ex = vertexExtras(model, mesh.positions, nH, model.sdf);
  const n = mesh.positions.length / 3;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = X.apply([mesh.positions[3 * i], mesh.positions[3 * i + 1], mesh.positions[3 * i + 2]]);
    const q = X.rot([nH[3 * i], nH[3 * i + 1], nH[3 * i + 2]]);
    pos.set(p, 3 * i);
    nor.set(q, 3 * i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('aAO', new THREE.BufferAttribute(ex.ao, 1));
  g.setAttribute('aNail', new THREE.BufferAttribute(ex.nail, 1));
  g.setAttribute('aMat', new THREE.BufferAttribute(new Float32Array(n), 1));
  g.setAttribute('aFing', new THREE.BufferAttribute(ex.fing, 1));
  g.setIndex(new THREE.BufferAttribute(mesh.index, 1));
  return g;
}

// A hexagonal pencil, sharpened: lacquered body, bare wood cone, graphite.
function pencilGeometry(tip, axis) {
  const L = 9.2, segA = 36;
  const apo = PEN.r * Math.cos(Math.PI / 6);
  const rHex = (a) => apo / Math.cos(((a % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6);
  const rCone = (s) => (s < PEN.tipLen ? 0.012 + (0.09 - 0.012) * (s / PEN.tipLen) : 0.09 + (PEN.r - 0.09) * Math.min(1, (s - PEN.tipLen) / PEN.coneLen));
  const ax = new THREE.Vector3(...axis).normalize();
  const u = new THREE.Vector3(0, 0, 1).cross(ax).normalize();
  const w = new THREE.Vector3().crossVectors(ax, u).normalize();
  const rings = [0, 0.05, 0.12, 0.2, 0.28, PEN.tipLen, 0.45, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 1.95, 2.1, 2.25, 2.4, 2.6, 3.2, 5, 7, L];
  const pos = [], nor = [], mat = [], idx = [];
  for (const s of rings) {
    for (let k = 0; k <= segA; k++) {
      const a = (k / segA) * Math.PI * 2;
      const rh = rHex(a), rc = rCone(s);
      const r = Math.min(rh, rc);
      const p = new THREE.Vector3(...tip).addScaledVector(ax, s).addScaledVector(u, Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r);
      let nrm;
      if (rc < rh - 1e-4) {
        const slope = s < PEN.tipLen ? (0.09 - 0.012) / PEN.tipLen : (PEN.r - 0.09) / PEN.coneLen;
        nrm = new THREE.Vector3().addScaledVector(u, Math.cos(a)).addScaledVector(w, Math.sin(a)).addScaledVector(ax, -slope).normalize();
      } else {
        const fa = Math.floor((a + Math.PI / 6) / (Math.PI / 3)) * (Math.PI / 3);
        nrm = new THREE.Vector3().addScaledVector(u, Math.cos(fa)).addScaledVector(w, Math.sin(fa));
      }
      pos.push(p.x, p.y, p.z);
      nor.push(nrm.x, nrm.y, nrm.z);
      mat.push(s < PEN.tipLen + 0.02 ? 3 : rc < rh - 0.01 ? 2 : 1);
    }
  }
  const nr = segA + 1;
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < segA; k++) {
    const a = i * nr + k, b = a + 1, c = a + nr, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const capC = pos.length / 3;
  const end = new THREE.Vector3(...tip).addScaledVector(ax, L);
  pos.push(end.x, end.y, end.z); nor.push(ax.x, ax.y, ax.z); mat.push(2);
  for (let k = 0; k < segA; k++) {
    const a = (rings.length - 1) * nr + k;
    idx.push(capC, a, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aMat', new THREE.Float32BufferAttribute(mat, 1));
  g.setAttribute('aAO', new THREE.Float32BufferAttribute(new Array(pos.length / 3).fill(1), 1));
  g.setAttribute('aNail', new THREE.Float32BufferAttribute(new Array(pos.length / 3).fill(9), 1));
  g.setAttribute('aFing', new THREE.Float32BufferAttribute(new Array(pos.length / 3).fill(1), 1));
  g.setIndex(idx);
  return g;
}

const handGeo = handGeometry();
const tipL = X.apply(model.pen.tip);
const penGeo = pencilGeometry(tipL, X.rot(model.pen.D).map((v) => -v));
const fp = footprint(handGeo.attributes.position.array, -11, 0, 0.2);
const BUILD_MS = performance.now() - T0;

// ------------------------------------------------------------------ layout
// Each hand sits in its own paper frame (x along the arm). Hand B is hand A
// turned half a turn round the centre of the sheet. A's pencil rests, before
// it moves, on the middle of B's drawn cuff, which fixes where A must be.
const drawing = buildDrawing(fp);
const FLAT_CENTRE = (() => {
  let x = 0, y = 0, n = 0;
  for (const s of drawing.strokes) for (const p of s.pts) { x += p[0]; y += p[1]; n++; }
  return [x / n - 0.9, y / n + 1.9];
})();
const PHI = -Math.PI / 2 - 0.66;
const placeA = new THREE.Matrix4();
{
  const c = Math.cos(PHI), s = Math.sin(PHI);
  const tx = tipL[0] + FLAT_CENTRE[0], ty = tipL[1] + FLAT_CENTRE[1];
  const wx = -(c * tx - s * ty) / 2, wy = -(s * tx + c * ty) / 2;
  placeA.makeRotationZ(PHI).setPosition(wx, wy, 0);
}
const placeB = new THREE.Matrix4().makeRotationZ(Math.PI).multiply(placeA);
const invA = placeA.clone().invert();
const PIVOT = new THREE.Vector2(-2.6, 0);
const FLAT = new THREE.Vector2(-5.0, -0.3);

// ------------------------------------------------------------------ drawing
const tl = makeTimeline(drawing.strokes);
const HOLD = 1.8, FADE = 1.3, BACK = 0.9;
const PERIOD = tl.end + HOLD + FADE + BACK;

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x3a332c, 1);
renderer.autoClear = false;

const PAPER = new THREE.Vector3(0.93, 0.905, 0.845);
const INK = new THREE.Vector3(0.11, 0.1, 0.09);
const LIGHT = new THREE.Vector3(-0.62, 0.55, 0.56).normalize();
const PEN_W = new THREE.Vector3(...X.apply(model.pen.W));
const PEN_T = new THREE.Vector3(...tipL);
const shared = {
  uPenW: { value: PEN_W },
  uPenR: { value: new THREE.Matrix3() },
  uPenS: { value: new THREE.Vector3() },
  uMotion: { value: new THREE.Vector4(0, 0, 0, 0) },
  uPivot: { value: PIVOT },
  uFlat: { value: FLAT },
  uLight: { value: LIGHT },
  uView: { value: new THREE.Vector3(0, 0, 1) },
  uLitho: { value: 1 },
  uPaper: { value: PAPER },
  uInk: { value: INK },
};

const scene = new THREE.Scene();
const shadowScene = new THREE.Scene();
const res = new THREE.Vector2(1, 1);

function addHand(place) {
  const u = { ...shared, uPlace: { value: place } };
  const body = new THREE.Mesh(handGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: SH.HAND_VS, fragmentShader: SH.HAND_FS, side: THREE.DoubleSide }));
  const pen = new THREE.Mesh(penGeo, body.material);
  const hullMat = new THREE.ShaderMaterial({
    uniforms: { ...u, uWidth: { value: 1.8 }, uRes: { value: res }, uInkC: { value: new THREE.Vector3(0.12, 0.1, 0.09) } },
    vertexShader: SH.HULL_VS, fragmentShader: SH.HULL_FS, side: THREE.BackSide,
  });
  const hull = new THREE.Mesh(handGeo, hullMat);
  const penHull = new THREE.Mesh(penGeo, hullMat);
  for (const m of [body, pen, hull, penHull]) { m.frustumCulled = false; scene.add(m); }
  for (const mode of [0, 1]) {
    const sm = new THREE.ShaderMaterial({
      uniforms: { ...u, uMode: { value: mode } },
      vertexShader: SH.SHADOW_VS, fragmentShader: SH.SHADOW_FS,
      side: THREE.DoubleSide, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });
    for (const g of [handGeo, penGeo]) {
      const m = new THREE.Mesh(g, sm);
      m.frustumCulled = false;
      shadowScene.add(m);
    }
  }
  return { body, hull };
}
addHand(placeA);
addHand(placeB);

// paper and its shadow map
const SHEET = new THREE.Vector2(15.4, 19.6);
const SH_RECT = new THREE.Vector4(-16, -20, 32, 40);
const shadowRT = new THREE.WebGLRenderTarget(640, 800, { depthBuffer: false });
const shadowCam = new THREE.OrthographicCamera(SH_RECT.x, SH_RECT.x + SH_RECT.z, SH_RECT.y + SH_RECT.w, SH_RECT.y, -100, 100);
shadowCam.position.set(0, 0, 50);
shadowCam.lookAt(0, 0, 0);
const paper = new THREE.Mesh(new THREE.PlaneGeometry(80, 90), new THREE.ShaderMaterial({
  uniforms: {
    uShadow: { value: shadowRT.texture },
    uShadowRect: { value: SH_RECT },
    uShadowTexel: { value: new THREE.Vector2(1 / 640, 1 / 800) },
    uPaper: shared.uPaper,
    uSheet: { value: SHEET },
  },
  vertexShader: SH.PAPER_VS, fragmentShader: SH.PAPER_FS,
}));
paper.renderOrder = -10;
scene.add(paper);

// the strokes: one ribbon geometry, placed in A's and in B's paper frame
const strokeU = { uNow: { value: 0 }, uFade: { value: 1 }, uGraphite: { value: new THREE.Vector3(0.19, 0.19, 0.21) } };
{
  const r = strokeRibbons(drawing.strokes);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(r.pos, 3));
  g.setAttribute('aSide', new THREE.Float32BufferAttribute(r.side, 1));
  g.setAttribute('aTime', new THREE.Float32BufferAttribute(r.time, 1));
  g.setAttribute('aArc', new THREE.Float32BufferAttribute(r.arcl, 1));
  g.setAttribute('aWeight', new THREE.Float32BufferAttribute(r.weight, 1));
  g.setIndex(r.index);
  const mat = new THREE.ShaderMaterial({ uniforms: strokeU, vertexShader: SH.STROKE_VS, fragmentShader: SH.STROKE_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  for (const place of [placeA, placeB]) {
    const m = new THREE.Mesh(g, mat);
    m.matrixAutoUpdate = false;
    m.matrix.copy(place);
    m.matrixWorldNeedsUpdate = true;
    m.frustumCulled = false;
    m.renderOrder = 1;
    scene.add(m);
  }
}

// ------------------------------------------------------------------ guides
// In the tilted view a dashed loop runs from each pencil to the cuff it is
// drawing, through that hand and on to its pencil: A draws B draws A.
const guides = new THREE.Group();
const guideMat = new THREE.LineDashedMaterial({ color: 0xa23b2a, dashSize: 0.55, gapSize: 0.35, transparent: true, opacity: 0, depthTest: false });
const arrowMat = new THREE.MeshBasicMaterial({ color: 0xa23b2a, transparent: true, opacity: 0, depthTest: false });
{
  const W = (p, place) => new THREE.Vector3(p[0], p[1], p[2] ?? 0).applyMatrix4(place);
  const handTop = (place) => W([4.5, 3.5, 9.5], place);
  const pts = [
    W(tipL, placeA).setZ(0.3), handTop(placeB), W(tipL, placeB).setZ(0.3), handTop(placeA),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
  const line = new THREE.Line(g, guideMat);
  line.computeLineDistances();
  guides.add(line);
  for (const u of [0.13, 0.63]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 14), arrowMat);
    cone.position.copy(curve.getPointAt(u));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(u));
    guides.add(cone);
  }
  guides.renderOrder = 30;
  guides.visible = false;
  scene.add(guides);
}

// ------------------------------------------------------------------ camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
const VIEW_H = 15.3; // half height of the sheet in view
const TOP = { az: -Math.PI / 2, el: Math.PI / 2, zoom: 1 };
const SIDE = { az: -Math.PI / 2 + 0.7, el: 0.56, zoom: 0.95 };
const view = { ...TOP, px: 0, py: 0 };
let aspect = 30 / 38;
function updateCamera() {
  const ce = Math.cos(view.el), se = Math.sin(view.el);
  const d = new THREE.Vector3(ce * Math.cos(view.az), ce * Math.sin(view.az), se);
  camera.position.copy(d).multiplyScalar(150);
  // "up" on screen: the top of the sheet, blending to world up as it tilts
  const up = new THREE.Vector3(0, 1, 0).lerp(new THREE.Vector3(0, 0, 1), Math.min(1, ce * 1.5)).normalize();
  camera.up.copy(up);
  camera.position.x += view.px; camera.position.y += view.py;
  camera.lookAt(view.px, view.py, 1.5 * ce);
  const h = VIEW_H / view.zoom;
  camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
  camera.updateProjectionMatrix();
  shared.uView.value.copy(d);
}

fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  aspect = w / h;
  res.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  updateCamera();
});

// ------------------------------------------------------------------ ui
setupPanel();
const state = { t: 0, playing: true, litho: 1, lithoTarget: 1, revealed: false, tween: null };
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { state.lithoTarget = v; }, 1);
const setPlaying = playButton((on) => { state.playing = on; });
if (!state.playing) state.t = tl.end + 0.2; // reduced motion: show the drawing finished
const btnReveal = document.getElementById('btn-reveal');
function setRevealed(on) {
  state.revealed = on;
  btnReveal.setAttribute('aria-pressed', String(on));
  btnReveal.querySelector('span').textContent = on ? 'Back to the print' : 'Tilt the sheet';
  state.tween = { from: { ...view }, to: on ? { ...SIDE } : { ...TOP }, k: 0, dur: 2.0 };
  setBadge(on, 'From the side: only the hands stand up; the cuffs are flat graphite');
}
btnReveal.addEventListener('click', () => setRevealed(!state.revealed));
keys({
  ' ': () => setPlaying(!state.playing),
  l: () => document.getElementById(state.lithoTarget ? 'btn-colour' : 'btn-litho').click(),
  r: () => setRevealed(!state.revealed),
});

// ------------------------------------------------------------------ motion
const vA = new THREE.Vector3();
function pencilTarget(T) {
  // where the pencil should be (in the drawn hand's frame) and how high
  if (T < tl.end) {
    const s = sampleTimeline(tl, T);
    const t0 = tl.events[0].t0;
    return { p: s.p, lift: T < t0 ? 0.6 * (1 - T / t0) : s.lift };
  }
  const k = Math.min(1, Math.max(0, (T - tl.end - HOLD) / (FADE + BACK)));
  const e = k * k * (3 - 2 * k);
  const p = [tl.last[0] + (tl.first[0] - tl.last[0]) * e, tl.last[1] + (tl.first[1] - tl.last[1]) * e];
  return { p, lift: 0.6 * Math.min(1, (T - tl.end) / 0.5) };
}
// The fingers can move the pencil tip a little way (REACH) by tilting and
// sliding the pencil where it rests in the hand; the hand itself follows,
// smoothly, only as far as it must.
const REACH = 2.3;
const TURN_MAX = 0.11;
const handState = { turn: 0, slide: 0, vTurn: 0, vSlide: 0, init: false };
const qTmp = new THREE.Quaternion(), d0 = new THREE.Vector3(), d1 = new THREE.Vector3(), m4 = new THREE.Matrix4();
function handFor(px, py) {
  const rx = px - PIVOT.x, ry = py - PIVOT.y;
  const R = Math.hypot(rx, ry);
  const tx = tipL[0] - PIVOT.x, ty = tipL[1] - PIVOT.y;
  const X0 = Math.sqrt(Math.max(1, R * R - ty * ty));
  return [Math.atan2(ry, rx) - Math.atan2(ty, X0), X0 - tx];
}
function solveMotion(T, dt) {
  const { p, lift } = pencilTarget(T);
  // the target lies in B's flat drawing; express it in A's frame
  vA.set(p[0], p[1], 0).applyMatrix4(placeB).applyMatrix4(invA);
  // where the hand should take its resting pencil tip
  let dx = vA.x - tipL[0], dy = vA.y - tipL[1];
  const d = Math.hypot(dx, dy);
  const k = d > REACH ? (d - REACH) / d : 0;
  let [turn, slide] = handFor(tipL[0] + dx * k, tipL[1] + dy * k);
  // never lean further towards the other hand than this; the fingers do the rest
  turn = Math.min(turn, TURN_MAX);
  // critically damped follow
  if (!handState.init || dt <= 0) { handState.turn = turn; handState.slide = slide; handState.init = true; }
  else {
    const w = 9.0;
    const n = Math.ceil(dt / 0.01);
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      for (const key of ['turn', 'slide']) {
        const target = key === 'turn' ? turn : slide;
        const vk = key === 'turn' ? 'vTurn' : 'vSlide';
        const a = w * w * (target - handState[key]) - 2 * w * handState[vk];
        handState[vk] += a * h;
        handState[key] += handState[vk] * h;
      }
    }
  }
  shared.uMotion.value.set(handState.turn, handState.slide, lift, 0);
  // the rest is done by the fingers: bring the target back into the hand's
  // resting frame and turn the pencil about where it rests
  const c = Math.cos(-handState.turn), s = Math.sin(-handState.turn);
  const rx = vA.x - PIVOT.x, ry = vA.y - PIVOT.y;
  const qx = PIVOT.x + c * rx - s * ry - handState.slide, qy = PIVOT.y + s * rx + c * ry;
  d0.copy(PEN_T).sub(PEN_W);
  const L0 = d0.length();
  d0.normalize();
  d1.set(qx, qy, 0).sub(PEN_W);
  const L1 = d1.length();
  d1.normalize();
  qTmp.setFromUnitVectors(d0, d1);
  m4.makeRotationFromQuaternion(qTmp);
  shared.uPenR.value.setFromMatrix4(m4);
  shared.uPenS.value.copy(d1).multiplyScalar(L1 - L0);
}

const approach = (v, t, r) => v + Math.sign(t - v) * Math.min(Math.abs(t - v), r);
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (state.playing) state.t = (state.t + dt) % PERIOD;
  const T = state.t;
  solveMotion(T, state.playing ? dt : 0);
  strokeU.uNow.value = T;
  strokeU.uFade.value = 1 - Math.min(1, Math.max(0, (T - tl.end - HOLD) / FADE));

  state.litho = approach(state.litho, state.lithoTarget, dt * 2.2);
  shared.uLitho.value = state.litho;
  if (state.tween) {
    const tw = state.tween;
    tw.k = Math.min(1, tw.k + dt / tw.dur);
    const e = ease(tw.k);
    for (const key of ['az', 'el', 'zoom']) view[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * e;
    if (tw.k >= 1) state.tween = null;
    updateCamera();
  }
  const tilt = Math.min(1, Math.max(0, (Math.PI / 2 - view.el) / (Math.PI / 2 - SIDE.el)));
  guideMat.opacity = arrowMat.opacity = Math.max(0, tilt * 1.4 - 0.4);
  guides.visible = guideMat.opacity > 0.01;

  renderer.setRenderTarget(shadowRT);
  renderer.setClearColor(0x000000, 1);
  renderer.clear();
  renderer.render(shadowScene, shadowCam);
  renderer.setRenderTarget(null);
  renderer.setClearColor(0x3a332c, 1);
  renderer.clear();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

markReady();
requestAnimationFrame(frame);

window.__page = { pencilTarget, BUILD_MS, state, view, updateCamera, setRevealed, setPlaying, shared, tl, PERIOD, solveMotion, fp, drawing, strokeU, scene, placeA, placeB };
