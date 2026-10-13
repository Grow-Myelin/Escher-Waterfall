// The catoptric construction, in numbers.
//
// A polished cylinder of radius R and height H stands on the sheet at the
// origin (y is up, the eye is on the +z side). The picture is defined on the
// eye's picture plane, in "tangent" coordinates (u, v): the ray through (u, v)
// leaves the eye along f + u·r + v·up. Each ray is followed to the cylinder,
// reflected about the surface normal (which is horizontal, so the ray keeps
// its downward slope), and continued to the sheet. Where it lands is where
// the picture's ink must go.

import * as THREE from 'three';

export const R = 1;
export const H = 3.2;
export const EYE = new THREE.Vector3(0, 9, 13);
export const AIM = new THREE.Vector3(0, 1.6, 0);

// the eye's frame
export const F = AIM.clone().sub(EYE).normalize();
export const RIGHT = new THREE.Vector3().crossVectors(F, new THREE.Vector3(0, 1, 0)).normalize();
export const UP = new THREE.Vector3().crossVectors(RIGHT, F);

// the picture: a rectangle of the eye's picture plane covering the cylinder
// (the cylinder spans u in ±0.067 and v from −0.1266 at its foot to 0.067 at its top;
// the picture keeps to the middle two thirds of its width)
export const PIC = { u0: -0.05, u1: 0.05, v0: -0.1266, v1: 0.0215 };

// the sheet of paper (table top coordinates, x and z)
export const SHEET = { x0: -6.2, x1: 6.2, z0: -5.4, z1: 9.0 };

export function eyeRay(u, v, out = new THREE.Vector3()) {
  return out.copy(F).addScaledVector(RIGHT, u).addScaledVector(UP, v).normalize();
}

// Trace the eye ray through (u, v). Returns null if it misses the cylinder's
// side (y in [base, base + H]); otherwise the hit point, the normal and the
// point where the reflected ray meets the table (y = 0).
export function trace(u, v, eye = EYE, base = 0) {
  const d = eyeRay(u, v);
  return traceRay(eye, d, base);
}

export function traceRay(o, d, base = 0) {
  const a = d.x * d.x + d.z * d.z;
  const b = 2 * (o.x * d.x + o.z * d.z);
  const c = o.x * o.x + o.z * o.z - R * R;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  if (t <= 0) return null;
  const hit = o.clone().addScaledVector(d, t);
  if (hit.y < base || hit.y > base + H) return null;
  const n = new THREE.Vector3(hit.x, 0, hit.z).divideScalar(R);
  const r = d.clone().addScaledVector(n, -2 * d.dot(n));
  if (r.y >= 0) return { hit, n, r, ground: null };
  const ground = hit.clone().addScaledVector(r, -hit.y / r.y);
  return { hit, n, r, ground };
}

// ---------------------------------------------------------------- the tribar
// The Penrose triangle as three bars of a 3D open frame along x, y and z,
// seen in isometric projection; the third bar's end lands exactly on the
// first bar's start. Each shade region is the union of two coplanar faces.
const s3 = Math.sqrt(3) / 2;
export const TRI_M = 4;

// isometric projection of a 3D point (bars of unit section), rotated so the
// triangle stands on its base
export function iso([X, Y, Z]) {
  const x = s3 * (X - Z), y = Y - (X + Z) / 2;
  return [y, -x];
}

export function tribarRegions(m = TRI_M) {
  const r = (P) => P.map(([x, y]) => [y, -x]);
  // visible outlines (derived from the occlusions of the three bars)
  const LZ = r([[-s3, -0.5], [s3 * m, -(m + 2) / 2], [s3 * m, (m - 2) / 2], [s3 * (m - 1), (m - 3) / 2], [s3 * (m - 1), (1 - m) / 2], [-s3, 0.5]]);
  const LX = r([[s3 * (m + 1), -(m + 1) / 2], [s3 * (m + 1), (m + 1) / 2], [s3, 0.5], [2 * s3, 0], [s3 * m, (m - 2) / 2], [s3 * m, -(m + 2) / 2]]);
  const LY = r([[s3 * m, (m + 2) / 2], [s3 * (m + 1), (m + 1) / 2], [s3, 0.5], [s3 * (m - 1), (3 - m) / 2], [s3 * (m - 1), (1 - m) / 2], [-s3, 0.5]]);
  // faces: 3D rectangles given by an origin and two edge vectors
  const face = (o, a, b) => ({ o, a, b });
  return {
    light: { poly: LZ, faces: [face([0, 0, 1], [m + 1, 0, 0], [0, 1, 0]), face([m, 0, 1], [1, 0, 0], [0, m, 0])] },
    mid: { poly: LY, faces: [face([m, m + 1, 0], [1, 0, 0], [0, 0, m + 1]), face([0, 1, 0], [m, 0, 0], [0, 0, 1])] },
    dark: { poly: LX, faces: [face([m + 1, 0, 0], [0, m + 1, 0], [0, 0, 1]), face([m + 1, m, 0], [0, 1, 0], [0, 0, m + 1])] },
  };
}
