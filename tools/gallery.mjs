// Writes illusions/gallery-data.js (window.GALLERY) for the gallery page,
// merging the catalogue below with each page's meta.json.
//
//   node tools/gallery.mjs
//
// The data goes in a classic script rather than JSON so the gallery also
// opens straight from the file system.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const WATERFALL = {
  slug: 'waterfall',
  href: '../index.html',
  thumb: '../assets/waterfall-thumb.jpg',
  title: 'Waterfall',
  subtitle: 'The perpetual-motion aqueduct, rebuilt in true isometric 3D',
  refs: ['M. C. Escher, Waterfall, 1961'],
  blurb: 'Water falls, turns a wheel, runs gently downhill and arrives back at the top of the fall.',
};

const SECTIONS = [
  {
    title: 'Tricks Escher used',
    items: [
      ['Impossible figures', 'Every corner is correct on its own, but the whole shape cannot exist.', ['waterfall', 'penrose-stairs']],
      ['Ambiguous depth', 'Parallel projection lets near and far edges swap places.', ['impossible-cube']],
      ['Convex/concave reversal', 'The same shapes stick out or cave in, depending on how you read the shading.', ['convex-concave']],
      ['Multiple gravities', 'Several “downs” share one scene, and each part makes sense locally.', ['relativity']],
      ['Curved perspective', 'Straight lines bend, and one vanishing point is “up” for one part of the picture and “down” for another.', ['curved-perspective']],
      ['Tessellation', 'Interlocking figures tile the plane with no gaps.', ['tessellation']],
      ['Figure–ground reversal', 'The gaps between one set of shapes form another set.', ['figure-ground']],
      ['Metamorphosis', 'Shapes change gradually into other shapes across a long strip.', ['metamorphosis']],
      ['Flat-to-3D crossover', 'Drawn figures climb out of the page and become solid.', ['flat-to-3d']],
      ['Self-reference loops', 'A picture contains itself, or draws itself.', ['drawing-hands', 'print-gallery']],
      ['Infinity in a finite space', 'Shapes shrink endlessly toward an edge or a centre.', ['circle-limit', 'smaller-and-smaller']],
      ['Reflections and layered worlds', 'Mirrors, spheres and water surfaces show several spaces at once.', ['reflecting-sphere', 'three-worlds']],
      ['One-sided surfaces', 'Ants walk forever on a band that has only one side.', ['moebius-strip']],
      ['Ordinary details as misdirection', 'Laundry, people and plants make an impossible place feel normal. See the Waterfall.', ['waterfall']],
    ],
  },
  {
    title: 'Tricks he didn’t use, or that came later',
    items: [
      ['Reutersvärd’s cube-built impossible figures', 'Impossible triangles of stacked cubes, drawn from 1934 independently of Escher.', ['reutersvard']],
      ['The devil’s fork', 'Three round prongs at one end, two square bars at the other. Widely known from 1964.', ['devils-fork']],
      ['Real impossible objects', 'Built objects that look impossible from one exact viewpoint, or different in a mirror.', ['perth-triangle', 'sugihara']],
      ['Reverse perspective', 'Painted reliefs whose nearest parts look farthest away, so the scene follows you.', ['reverse-perspective']],
      ['Anamorphic street art', 'Stretched pavement drawings that look solid from a single spot.', ['street-art']],
      ['Mirror anamorphosis and double images', 'A drawing that becomes a different picture in a cylindrical mirror.', ['mirror-anamorphosis']],
      ['Aperiodic tilings', 'Tilings that never repeat, down to a single tile shape that cannot tile any other way.', ['penrose-tiling', 'hat-tiling']],
      ['Completing Print Gallery', 'The exact conformal map behind Escher’s picture, which fills its blank centre (2003).', ['print-gallery']],
      ['Rotating-camera puzzles', 'Paths that connect only from one angle, then let you walk across.', ['rotating-puzzle']],
      ['Computer-generated hyperbolic patterns', 'Circle Limit tilings computed for any symmetry, instead of drawn by hand.', ['circle-limit']],
    ],
  },
];

function page(slug) {
  if (slug === 'waterfall') return { ...WATERFALL, ready: true };
  const dir = `illusions/${slug}`;
  const metaPath = `${dir}/meta.json`;
  const ready = existsSync(`${dir}/index.html`) && existsSync(`${dir}/bundle.js`);
  let meta = {};
  if (existsSync(metaPath)) {
    try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); } catch (e) { console.warn(`bad ${metaPath}: ${e.message}`); }
  }
  return {
    slug,
    href: `${slug}/index.html`,
    thumb: existsSync(`${dir}/thumb.jpg`) ? `${slug}/thumb.jpg` : null,
    title: meta.title || slug,
    subtitle: meta.subtitle || '',
    refs: Array.isArray(meta.refs) ? meta.refs : [],
    blurb: meta.blurb || '',
    ready,
  };
}

const data = SECTIONS.map((s) => ({
  title: s.title,
  items: s.items.map(([name, text, slugs]) => ({ name, text, pages: slugs.map(page) })),
}));

const missing = data.flatMap((s) => s.items.flatMap((i) => i.pages)).filter((p) => !p.ready).map((p) => p.slug);
writeFileSync('illusions/gallery-data.js', `// Generated by tools/gallery.mjs. Do not edit by hand.\nwindow.GALLERY = ${JSON.stringify(data, null, 2)};\n`);
console.log(`wrote illusions/gallery-data.js${missing.length ? ` (not ready yet: ${[...new Set(missing)].join(', ')})` : ''}`);
