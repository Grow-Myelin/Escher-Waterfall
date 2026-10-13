// Fat ink lines (three's LineSegments2) whose end points can be moved every
// frame without reallocating GPU buffers.

import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export const lineMaterials = new Set();

// A segment set. `count` segments; set(i, a, b) then commit().
export class Segments {
  constructor(count) {
    this.count = count;
    this.geometry = new LineSegmentsGeometry();
    this.geometry.setPositions(new Float32Array(count * 6));
    const dist = new Float32Array(count * 2);
    const buf = new THREE.InstancedInterleavedBuffer(dist, 2, 1);
    this.geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(buf, 1, 0));
    this.geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(buf, 1, 1));
    this.pos = this.geometry.attributes.instanceStart.data;
    this.dist = buf;
  }

  set(i, a, b) {
    const p = this.pos.array;
    p[i * 6] = a.x; p[i * 6 + 1] = a.y; p[i * 6 + 2] = a.z;
    p[i * 6 + 3] = b.x; p[i * 6 + 4] = b.y; p[i * 6 + 5] = b.z;
    // every segment starts its own dash pattern
    this.dist.array[i * 2] = 0;
    this.dist.array[i * 2 + 1] = a.distanceTo(b);
  }

  commit() {
    this.pos.needsUpdate = true;
    this.dist.needsUpdate = true;
  }

  // A drawable using this geometry.
  mesh(material, order = 0) {
    const m = new LineSegments2(this.geometry, material);
    m.frustumCulled = false;
    m.renderOrder = order;
    return m;
  }
}

// Line material in display (sRGB) colour; width in CSS pixels, scaled with the
// print so the drawing keeps its weight on any screen.
export function inkLine(o = {}) {
  const m = new LineMaterial({
    color: 0x1c1a17,
    linewidth: o.width ?? 2,
    dashed: !!o.dashed,
    dashSize: o.dash ?? 0.12,
    gapSize: o.gap ?? 0.09,
    transparent: true,
    opacity: o.opacity ?? 1,
    depthTest: o.depthTest ?? true,
    depthWrite: o.depthWrite ?? false,
  });
  if (o.depthFunc !== undefined) m.depthFunc = o.depthFunc;
  m.userData.baseWidth = o.width ?? 2;
  if (o.rgb) {
    m.color.setRGB(o.rgb[0], o.rgb[1], o.rgb[2], THREE.SRGBColorSpace);
    m.userData.keepColour = true;
  }
  lineMaterials.add(m);
  return m;
}

// Call on resize: `scale` multiplies every line's base width.
export function resizeLines(w, h, scale) {
  for (const m of lineMaterials) {
    m.resolution.set(w, h);
    m.linewidth = m.userData.baseWidth * scale;
  }
}
