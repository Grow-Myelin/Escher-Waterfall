// Page shell shared by the illustrations. Import it from an illustration's
// src/main.js (`import { ... } from '../../shared/shell.js'`); build.mjs
// bundles it in. Every helper is optional.

// Fit the matted frame (#frame) to the window at `aspect` (width / height),
// between the masthead and the control bar. Calls onResize(width, height) in
// CSS pixels now and on every window resize.
export function fitFrame(aspect, onResize) {
  const frame = document.getElementById('frame');
  const layout = () => {
    const mat = 13; // the mount is drawn with box-shadows outside the frame
    const pad = (window.innerWidth < 640 ? 10 : 28) + mat;
    const head = document.getElementById('masthead');
    const ctrl = document.getElementById('controls');
    const top = (head ? head.offsetHeight : 0) + 6 + mat;
    const bottom = (ctrl ? ctrl.offsetHeight : 0) + 8 + mat;
    const availW = window.innerWidth - pad * 2;
    const availH = window.innerHeight - top - bottom;
    let h = availH, w = h * aspect;
    if (w > availW) { w = availW; h = w / aspect; }
    w = Math.max(160, Math.floor(w));
    h = Math.max(120, Math.floor(h));
    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;
    frame.style.top = `${top + Math.max(0, (availH - h) / 2)}px`;
    onResize?.(w, h);
  };
  window.addEventListener('resize', layout);
  layout();
  return layout;
}

// Wire up the "How it works" panel: #btn-info toggles it, #panel-close and Esc close it.
export function setupPanel() {
  const panel = document.getElementById('panel');
  const btn = document.getElementById('btn-info');
  const close = document.getElementById('panel-close');
  if (!panel) return;
  const set = (open) => {
    if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    btn?.setAttribute('aria-expanded', String(open));
  };
  btn?.addEventListener('click', () => set(panel.hasAttribute('hidden')));
  close?.addEventListener('click', () => set(false));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

// A group of buttons where exactly one is pressed. options: [[element, value], ...]
export function segmented(options, onChange, initial) {
  const set = (value) => {
    for (const [el, v] of options) el.setAttribute('aria-pressed', String(v === value));
    onChange(value);
  };
  for (const [el, v] of options) el.addEventListener('click', () => set(v));
  if (initial !== undefined) set(initial);
  return set;
}

// Keyboard shortcuts: { l: fn, ' ': fn, ... } (keys compared case-insensitively).
export function keys(map) {
  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select')) return;
    const fn = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (fn) { e.preventDefault(); fn(e); }
  });
}

// Play/pause button (#btn-play) with an icon and label. Returns a setter.
export function playButton(onChange, playing = true) {
  const btn = document.getElementById('btn-play');
  const set = (on) => {
    playing = on;
    if (btn) {
      btn.setAttribute('aria-pressed', String(!on));
      btn.querySelector('span').textContent = on ? 'Pause' : 'Play';
      btn.querySelector('.icon').textContent = on ? '❚❚' : '▶';
    }
    onChange(on);
  };
  btn?.addEventListener('click', () => set(!playing));
  set(playing && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return set;
}

export function setBadge(on, text) {
  const badge = document.getElementById('badge');
  if (badge && text) badge.textContent = text;
  document.body.classList.toggle('badge-on', !!on);
}

export function markReady() {
  document.body.classList.add('ready');
}
