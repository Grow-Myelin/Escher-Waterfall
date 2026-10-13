// A small printed inset: the reflectance of water against the angle of
// incidence (exact Fresnel equations, unpolarised light), with the band of
// angles currently in view and a marker for the centre of the picture.

const NS = 'http://www.w3.org/2000/svg';
const X0 = 26, X1 = 146, Y0 = 22, Y1 = 84;

export function fresnel(cosi, eta = 1 / 1.333) {
  const s2 = eta * eta * (1 - cosi * cosi);
  if (s2 >= 1) return 1;
  const ct = Math.sqrt(1 - s2);
  const rs = (eta * cosi - ct) / (eta * cosi + ct);
  const rp = (cosi - eta * ct) / (cosi + eta * ct);
  return 0.5 * (rs * rs + rp * rp);
}
const R = (deg) => fresnel(Math.cos((deg * Math.PI) / 180));
const px = (deg) => X0 + ((X1 - X0) * deg) / 90;
const py = (r) => Y1 - (Y1 - Y0) * r;

function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}

export class Gauge {
  constructor(host) {
    this.host = host;
    const svg = el('svg', { viewBox: '0 0 154 104', role: 'img', 'aria-label': 'Reflectance of water against the angle of incidence' }, host);
    el('text', { x: 6, y: 12, class: 'g-title' }, svg).textContent = 'Light reflected by the water';
    for (const r of [0, 0.5, 1]) {
      el('line', { x1: X0, x2: X1, y1: py(r), y2: py(r), class: r ? 'g-grid' : 'g-axis' }, svg);
      el('text', { x: X0 - 4, y: py(r) + 3, class: 'g-tick', 'text-anchor': 'end' }, svg).textContent = `${r * 100}%`;
    }
    for (const a of [0, 45, 90]) {
      el('text', { x: px(a), y: Y1 + 10, class: 'g-tick', 'text-anchor': 'middle' }, svg).textContent = `${a}°`;
    }
    el('text', { x: X1, y: Y1 + 19, class: 'g-tick', 'text-anchor': 'end' }, svg).textContent = 'angle from straight down';
    this.band = el('rect', { y: Y0, height: Y1 - Y0, class: 'g-band' }, svg);
    let d = '';
    for (let a = 0; a <= 90; a += 1) d += `${a ? 'L' : 'M'}${px(a).toFixed(1)},${py(R(a)).toFixed(1)}`;
    el('path', { d, class: 'g-curve' }, svg);
    this.dot = el('circle', { r: 4, class: 'g-dot' }, svg);
    this.label = el('text', { class: 'g-label' }, svg);
    this.shown = null;
  }

  update(bottom, centre, top, show) {
    if (show !== this.shown) { this.host.classList.toggle('on', show); this.shown = show; }
    if (!show) return;
    const key = `${bottom.toFixed(1)}|${centre.toFixed(1)}|${top.toFixed(1)}`;
    if (key === this.key) return;
    this.key = key;
    const a = Math.min(bottom, top), b = Math.max(bottom, top);
    this.band.setAttribute('x', px(a).toFixed(1));
    this.band.setAttribute('width', Math.max(1, px(b) - px(a)).toFixed(1));
    const r = R(centre);
    const x = px(centre), y = py(r);
    this.dot.setAttribute('cx', x.toFixed(1));
    this.dot.setAttribute('cy', y.toFixed(1));
    const pct = r < 0.1 ? (r * 100).toFixed(1) : Math.round(r * 100);
    this.label.textContent = `${pct}% at ${Math.round(centre)}°`;
    const right = x < 96;
    this.label.setAttribute('x', (right ? x + 7 : x - 7).toFixed(1));
    this.label.setAttribute('y', Math.max(Y0 + 8, y - 6).toFixed(1));
    this.label.setAttribute('text-anchor', right ? 'start' : 'end');
  }
}
