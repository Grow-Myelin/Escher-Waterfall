// The view from above: an exact plan, cut at eye level, drawn on a 2D canvas
// over the scene. It shows the real relief (sticking out of the board), the
// rooms as they are painted (going in, behind the board), the design eye
// and its sight lines, and the visitor where they stand now.

import * as THREE from 'three';
import { BLOCKS, D, EYE, H, recess } from './homology.js';

const v = (x, z) => new THREE.Vector3(x, 0, z);

// Sections at eye level (y = 0) of the recesses that reach it, and of their pyramids.
function sections() {
  const out = [];
  for (const b of BLOCKS) {
    if (!(b.y0 < 0 && b.y1 > 0)) continue;
    const r = recess(b);
    // at y = 0 the near edge is x0..x1; the far edge runs between the far corners' x
    const fx0 = r.far[0].x, fx1 = r.far[1].x;
    const ghost = [v(b.x0, 0), v(b.x1, 0), v(fx1, -b.F), v(fx0, -b.F)];
    out.push({ b, ghost, relief: ghost.map(H) });
  }
  return out;
}
const SEC = sections();

export function drawPlan(ctx, W, Hh, opt) {
  const { sway, litho } = opt;
  const ink = '#1d1b18', paper = litho > 0.5 ? '#ece5d5' : '#ebe7dd', red = '#a23b2a';
  const soft = litho > 0.5 ? '#d9d1c0' : '#e7d3ae';
  const zMin = -2.15, zMax = 2.85;
  const pad = 26;
  const s = Math.min((Hh - pad * 2) / (zMax - zMin), (W - pad * 2) / 2.3);
  const ox = W / 2, oz = pad + (-zMin) * s + (Hh - pad * 2 - (zMax - zMin) * s) / 2;
  const P = (p) => [ox + p.x * s, oz + p.z * s];
  const font = (px, it = true) => `${it ? 'italic ' : ''}${px}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;

  ctx.save();
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, Hh);

  // the wall, cut: hatched
  const wz0 = -0.3, wz1 = -0.045;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, oz + wz0 * s, W, (wz1 - wz0) * s);
  ctx.clip();
  ctx.strokeStyle = 'rgba(29,27,24,0.55)';
  ctx.lineWidth = 1;
  for (let x = -Hh; x < W + Hh; x += 7) { ctx.beginPath(); ctx.moveTo(x, oz + wz0 * s); ctx.lineTo(x + (wz1 - wz0) * s, oz + wz1 * s); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, oz + wz0 * s); ctx.lineTo(W, oz + wz0 * s);
  ctx.moveTo(0, oz + wz1 * s); ctx.lineTo(W, oz + wz1 * s);
  ctx.stroke();
  // the board
  ctx.fillStyle = soft;
  ctx.fillRect(ox - 0.75 * s, oz - 0.045 * s, 1.5 * s, 0.045 * s);
  ctx.strokeRect(ox - 0.75 * s, oz - 0.045 * s, 1.5 * s, 0.045 * s);

  // rooms as painted: dashed red, behind the board
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = red;
  ctx.lineWidth = 1.3;
  for (const sec of SEC) {
    ctx.beginPath();
    sec.ghost.forEach((p, i) => { const [x, y] = P(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.closePath();
    ctx.stroke();
  }
  // design sight lines: from the eye through each top corner to the far corner it stands for
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = 'rgba(162,59,42,0.75)';
  ctx.lineWidth = 1;
  for (const sec of SEC) {
    for (const p of [sec.ghost[2], sec.ghost[3]]) {
      const [ex, ey] = P(EYE), [x, y] = P(p);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x, y); ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  // the real relief: solid
  for (const sec of SEC) {
    ctx.beginPath();
    sec.relief.forEach((p, i) => { const [x, y] = P(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.closePath();
    ctx.fillStyle = soft;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // the visitor: where they stand, and their sight lines to the tops
  const you = v(sway, D);
  ctx.strokeStyle = 'rgba(29,27,24,0.55)';
  ctx.lineWidth = 1;
  for (const sec of SEC) {
    for (const p of [sec.relief[2], sec.relief[3]]) {
      // extend to the board plane to show where the top now appears
      const dir = p.clone().sub(you);
      const t = -you.z / dir.z;
      const hit = you.clone().addScaledVector(dir, t);
      const [ax, ay] = P(you), [bx, by] = P(hit);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
  }
  // markers
  const dot = (p, r, fill, stroke) => {
    const [x, y] = P(p);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  };
  dot(EYE, 4.5, red);
  dot(you, 7, null, ink);
  dot(you, 2.2, ink);

  // labels
  ctx.fillStyle = ink;
  ctx.font = font(Math.max(11, Math.round(s * 0.075)));
  ctx.textAlign = 'left';
  const lab = (t, p, dx = 0, dy = 0, align = 'left', col = ink) => {
    const [x, y] = P(p);
    ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(t, x + dx, y + dy);
  };
  lab('wall', v(-1.12, -0.12), 0, 4);
  lab('board', v(0.78, 0), 4, -2);
  const hall = SEC.find((x) => x.b.name === 'hall');
  lab('relief: the real shape', hall.relief[2], 10, 18);
  lab('the hall as painted', v(0.32, -1.6), 0, 0, 'left', red);
  lab('(it goes on to 5 m)', v(0.32, -1.6), 0, 15, 'left', red);
  lab('rooms as painted', v(-1.1, -1.05), 0, 0, 'left', red);
  // keep the two labels apart: 'you' on the side you have stepped to
  const right = sway >= 0;
  lab('design eye', EYE, right ? -10 : 10, 4, right ? 'right' : 'left', red);
  lab('you', you, right ? 13 : -13, 4, right ? 'left' : 'right');
  lab('sight lines', EYE, 0, 26, 'center', 'rgba(29,27,24,0.6)');

  // scale bar and title
  const [sx0, sy] = [pad, Hh - pad];
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(sx0, sy); ctx.lineTo(sx0 + s, sy); ctx.moveTo(sx0, sy - 4); ctx.lineTo(sx0, sy + 4); ctx.moveTo(sx0 + s, sy - 4); ctx.lineTo(sx0 + s, sy + 4); ctx.stroke();
  ctx.fillStyle = ink; ctx.textAlign = 'center';
  ctx.font = font(11);
  ctx.fillText('1 m', sx0 + s / 2, sy - 7);
  ctx.textAlign = 'left';
  ctx.font = font(12, false);
  ctx.fillText('PLAN, CUT AT EYE LEVEL', pad, pad + 4);
  ctx.restore();
}
