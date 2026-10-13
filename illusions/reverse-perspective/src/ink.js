// The Waterfall's ink shader (src/materials.js, used read-only), with one
// change for perspective scenes: the hatching runs on texture coordinates
// scaled by uHatch, so its period suits a camera standing tens of metres away
// rather than an isometric view of a whole valley.

import * as THREE from 'three';
import { makeInkMaterial } from '../../../src/materials.js';

function patch(src, from, to) {
  if (!src.includes(from)) throw new Error(`ink shader patch failed: ${from}`);
  return src.replace(from, to);
}

export function inkMaterial(uniforms, opts = {}) {
  if (!uniforms.uHatch) uniforms.uHatch = { value: 1 };
  const m = makeInkMaterial(uniforms, opts);
  let fs = m.fragmentShader;
  fs = patch(fs, 'uniform float uFade;', 'uniform float uFade;\nuniform float uHatch;');
  fs = patch(fs, 'vec3 outc = finish(col, vM.y, ink, uv, fw, face);', 'vec3 outc = finish(col, vM.y, ink, uv * uHatch, fw * uHatch, face);');
  m.fragmentShader = fs;
  m.needsUpdate = true;
  return m;
}

export { THREE };
