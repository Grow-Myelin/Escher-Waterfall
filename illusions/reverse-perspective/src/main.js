// TEMPLATE illustration: an isometric cube drawn with the Waterfall's ink
// shader. Copy this folder, then replace the scene.
//
// - `import ... from 'three'` resolves to the shared window.THREE.
// - Builder and the ink/litho shaders are reused, read-only, from the Waterfall.
// - Build with: node build.mjs <slug>

import * as THREE from 'three';
import { Builder, PAT, st } from '../../../src/builder.js';
import { createSharedUniforms, makeInkMaterial } from '../../../src/materials.js';
import { fitFrame, setupPanel, segmented, keys, playButton, markReady } from '../../shared/shell.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0xece5d5, 1);

const scene = new THREE.Scene();
const uniforms = createSharedUniforms();

const b = new Builder();
b.box(-2, -2, -2, 2, 2, 2, st(0xc9bea8, PAT.ASHLAR));
const mesh = new THREE.Mesh(b.build(), makeInkMaterial(uniforms));
scene.add(mesh);

// true isometric orthographic camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);
const H = 12; // visible height in world units
fitFrame(30 / 38, (w, h) => {
  renderer.setSize(w, h);
  camera.left = (-H / 2) * (w / h); camera.right = (H / 2) * (w / h);
  camera.top = H / 2; camera.bottom = -H / 2;
  camera.updateProjectionMatrix();
});

setupPanel();
let litho = 1, lithoTarget = 1;
segmented([[document.getElementById('btn-litho'), 1], [document.getElementById('btn-colour'), 0]], (v) => { lithoTarget = v; }, 1);
let playing = true;
const setPlaying = playButton((on) => { playing = on; });
keys({ ' ': () => setPlaying(!playing), l: () => document.getElementById(lithoTarget ? 'btn-colour' : 'btn-litho').click() });

let t = 0, last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (playing) t += dt;
  litho += Math.sign(lithoTarget - litho) * Math.min(Math.abs(lithoTarget - litho), dt * 2.2);
  uniforms.uLitho.value = litho;
  uniforms.uTime.value = t;
  mesh.rotation.y = t * 0.4;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
markReady();
requestAnimationFrame(frame);
