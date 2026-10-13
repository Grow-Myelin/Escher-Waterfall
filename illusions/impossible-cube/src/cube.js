// Plate II: the impossible cube.
//
// A frame of twelve square beams on the cube [-1, 1]^3. Seen from the plate's
// fixed direction d, two hidden beams cross two front beams in the picture:
//
//   crossing 1: the back vertical beam (x = −1, z = −1) behind the front top beam
//   crossing 2: the bottom back beam (y = −1, z = −1) behind the front right post
//
// To make the cube impossible, a short length of the back vertical beam is cut
// out and slid towards the viewer along d until it passes in front of the front
// top beam. A slide along the line of sight never moves anything in the
// picture; it only changes which beam covers which at crossing 1. The cut ends
// carry no faces and no outlines, so the joins cannot be seen from d.

import * as THREE from 'three';
import { Builder, st, planarUV } from '../../../src/builder.js';
import { makeInk } from './ink.js';
import { Segments, inkLine } from './lines.js';

const H = 0.13; // half the beam thickness
const COL = 0xd9cfbb;

// A rectangle on the plane coord[axis] = c, outward normal sign·e_axis, spanning
// [u0,u1]×[v0,v1] in the two other axes (u = axis+1, v = axis+2). `e` says which
// sides carry an outline: { u0, u1, v0, v1 }.
function rect(axis, sign, c, u0, u1, v0, v1, e) {
  return { axis, sign, c, u0, u1, v0, v1, e: { u0: 1, u1: 1, v0: 1, v1: 1, ...e } };
}

function emit(b, r, s) {
  const { axis, sign, c, u0, u1, v0, v1, e } = r;
  const u = (axis + 1) % 3, v = (axis + 2) % 3;
  const P = (uu, vv) => { const p = [0, 0, 0]; p[axis] = c; p[u] = uu; p[v] = vv; return p; };
  const n = [0, 0, 0]; n[axis] = sign;
  let q, edges;
  if (sign > 0) { q = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]; edges = [e.v0, e.u1, e.v1, e.u0]; }
  else { q = [P(u0, v1), P(u1, v1), P(u1, v0), P(u0, v0)]; edges = [e.v1, e.u1, e.v0, e.u0]; }
  b.quad(q[0], q[1], q[2], q[3], s, edges, { uv: q.map((p) => planarUV(p, n)) });
}

// All faces of the frame as rectangles.
function frameRects() {
  const R = [];
  const o = 1 + H, i = 1 - H;
  // outer rings: on each face, four corner squares and four sides; outlines
  // only on the ring's outer and inner boundaries
  const band = (sg) => (sg < 0 ? [-o, -i] : [i, o]);
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [-1, 1]) {
      const c = sign * o;
      for (const su of [-1, 1]) {
        for (const sv of [-1, 1]) {
          const [ua, ub] = band(su), [va, vb] = band(sv);
          R.push(rect(axis, sign, c, ua, ub, va, vb, { u0: su < 0, u1: su > 0, v0: sv < 0, v1: sv > 0 }));
        }
      }
      for (const sv of [-1, 1]) R.push(rect(axis, sign, c, -i, i, ...band(sv), { u0: 0, u1: 0 }));
      for (const su of [-1, 1]) R.push(rect(axis, sign, c, ...band(su), -i, i, { v0: 0, v1: 0 }));
    }
  }
  // inner faces of each beam
  for (let k = 0; k < 3; k++) {
    const j1 = (k + 1) % 3, j2 = (k + 2) % 3;
    for (const c1 of [-1, 1]) {
      for (const c2 of [-1, 1]) {
        // face square to j1 at c1·(1−H), facing the centre
        {
          const axis = j1; // its u = j1+1, v = j1+2; one of them is k, the other j2
          const lim = { [k]: [-i, i], [j2]: c2 < 0 ? [-o, -i] : [i, o] };
          const u = (axis + 1) % 3, v = (axis + 2) % 3;
          R.push(rect(axis, -c1, c1 * i, lim[u][0], lim[u][1], lim[v][0], lim[v][1], {}));
        }
        {
          const axis = j2;
          const lim = { [k]: [-i, i], [j1]: c1 < 0 ? [-o, -i] : [i, o] };
          const u = (axis + 1) % 3, v = (axis + 2) % 3;
          R.push(rect(axis, -c2, c2 * i, lim[u][0], lim[u][1], lim[v][0], lim[v][1], {}));
        }
      }
    }
  }
  return R;
}

// Split the rectangles of one beam (along y at x = bx, z = bz) at y = y1 and
// y = y2; the middle pieces are returned separately.
function splitBeam(R, bx, bz, y1, y2) {
  const keep = [], mid = [];
  const within = (lo, hi, c) => lo >= c - H - 1e-6 && hi <= c + H + 1e-6;
  for (const r of R) {
    const u = (r.axis + 1) % 3, v = (r.axis + 2) % 3;
    const range = (ax) => (ax === u ? [r.u0, r.u1] : [r.v0, r.v1]);
    let ours = false;
    if (r.axis === 0 && Math.abs(Math.abs(r.c - bx) - H) < 1e-6) ours = within(...range(2), bz);
    if (r.axis === 2 && Math.abs(Math.abs(r.c - bz) - H) < 1e-6) ours = within(...range(0), bx);
    const [ya, yb] = range(1);
    if (!ours || ya > y1 || yb < y2) { keep.push(r); continue; }
    const yKey = u === 1 ? 'u' : 'v';
    const piece = (lo, hi, eLo, eHi) => {
      const p = { ...r, e: { ...r.e } };
      p[yKey + '0'] = lo; p[yKey + '1'] = hi;
      p.e[yKey + '0'] = eLo; p.e[yKey + '1'] = eHi;
      return p;
    };
    keep.push(piece(ya, y1, r.e[yKey + '0'], 0));
    mid.push(piece(y1, y2, 0, 0));
    keep.push(piece(y2, yb, 0, r.e[yKey + '1']));
  }
  return { keep, mid };
}

export function createImpossibleCube(shared, D, R2) {
  const group = new THREE.Group();
  const s = st(COL);

  // crossing 1, found in the picture: the back post's axis (−1, y, −1) meets
  // the front top beam's axis (x, 1, 1)
  const [r, u] = R2; // picture right / up for direction D
  const pic = (p) => [p.dot(r), p.dot(u)];
  const solveX = (Xt) => { // point (x, 1, 1) with picture X = Xt
    const a = pic(new THREE.Vector3(0, 1, 1)), g = r.x;
    return (Xt - a[0]) / g;
  };
  const backPost = (y) => new THREE.Vector3(-1, y, -1);
  const X1 = pic(backPost(0))[0];
  const frontPt1 = new THREE.Vector3(solveX(X1), 1, 1);
  const Y1 = pic(frontPt1)[1];
  const yc = (Y1 - pic(backPost(0))[1]) / u.y;
  const cross1 = { front: frontPt1, back: backPost(yc) };
  // crossing 2: bottom back beam (x, −1, −1) meets the front right post (1, y, 1)
  const X2 = pic(new THREE.Vector3(1, 0, 1))[0];
  const bx = (X2 - pic(new THREE.Vector3(0, -1, -1))[0]) / r.x;
  const back2 = new THREE.Vector3(bx, -1, -1);
  const Y2 = pic(back2)[1];
  const fy = (Y2 - pic(new THREE.Vector3(1, 0, 1))[1]) / u.y;
  const cross2 = { front: new THREE.Vector3(1, fy, 1), back: back2 };

  // the cut and the slide
  const L = 0.86;
  const y1 = yc - L / 2, y2 = yc + L / 2;
  const depthGap = cross1.front.dot(D) - cross1.back.dot(D);
  const SLIDE = depthGap + 2 * H * (Math.abs(D.x) + Math.abs(D.y) + Math.abs(D.z)) + 0.25;

  const { keep, mid } = splitBeam(frameRects(), -1, -1, y1, y2);
  const mat = makeInk(shared, { hatch: 0.32, transparent: true });

  const bFrame = new Builder();
  keep.forEach((rc) => emit(bFrame, rc, s));
  const frame = new THREE.Mesh(bFrame.build(), mat);
  group.add(frame);

  const bSeg = new Builder();
  mid.forEach((rc) => emit(bSeg, rc, s));
  const segment = new THREE.Mesh(bSeg.build(), mat);
  group.add(segment);

  // end caps for the reveal only (from d they would be hidden anyway)
  const capMat = makeInk(shared, { hatch: 0.32, transparent: true, fade: 0 });
  capMat.depthWrite = false;
  const cap = (y, up) => rect(1, up ? 1 : -1, y, -1 - H, -1 + H, -1 - H, -1 + H, {});
  const bCapFixed = new Builder();
  emit(bCapFixed, cap(y1, true), s); emit(bCapFixed, cap(y2, false), s);
  const bCapSeg = new Builder();
  emit(bCapSeg, cap(y1, false), s); emit(bCapSeg, cap(y2, true), s);
  const capsFixed = new THREE.Mesh(bCapFixed.build(), capMat);
  const capsSeg = new THREE.Mesh(bCapSeg.build(), capMat);
  group.add(capsFixed, capsSeg);

  // guides: the line of sight through each end of the cut
  const guide = new Segments(2);
  const gMat = inkLine({ width: 1.4, dashed: true, dash: 0.09, gap: 0.07, rgb: [0.64, 0.23, 0.16], opacity: 0, depthTest: false });
  const guideMesh = guide.mesh(gMat, 6);
  group.add(guideMesh);
  const a1 = new THREE.Vector3(-1, y1, -1), a2 = new THREE.Vector3(-1, y2, -1);
  guide.set(0, a1, a1.clone().addScaledVector(D, SLIDE));
  guide.set(1, a2, a2.clone().addScaledVector(D, SLIDE));
  guide.commit();

  // cycle: possible (hold) → slide → impossible (hold) → slide back
  const T = 12;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function cycle(t) {
    const x = ((t % T) + T) % T;
    const k = ss(2.6, 4.4, x) * (1 - ss(9.2, 11.0, x));
    return { k, x };
  }
  let state = cycle(0);
  // the moment the segment's front passes the front beam's back (in depth)
  const kFlip = (depthGap) / SLIDE;

  return {
    group,
    cross1, cross2,
    mats: [mat, capMat],
    lineMats: [gMat],
    get state() { return state; },
    get impossible() { return state.k > kFlip; },
    update(t, off, fade) {
      state = cycle(t);
      const k = state.k;
      segment.position.copy(D).multiplyScalar(SLIDE * k);
      capsSeg.position.copy(segment.position);
      mat.uniforms.uFade.value = fade;
      capMat.uniforms.uFade.value = fade * off;
      capsFixed.visible = capsSeg.visible = off > 0.01;
      gMat.opacity = fade * off;
      guideMesh.visible = off > 0.01;
    },
  };
}
