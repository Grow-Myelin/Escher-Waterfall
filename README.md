# Waterfall, in isometric

An animated, true-isometric 3D reconstruction of M. C. Escher's lithograph *Waterfall* (1961). Water falls onto a mill wheel, runs away from you down a zigzag aqueduct, and arrives back at the top of the fall without ever climbing.

Alongside it, **Paradoxes on Paper** (`illusions/index.html`) is a gallery of animated illustrations, one or two for each trick behind impossible drawings and optical illusions: the ones Escher used, and the ones that came later.

## Run it

Open `index.html` (the Waterfall) or `illusions/index.html` (the gallery) in a browser. Every page works offline from `file://`, because the built bundles are committed and nothing is loaded from the network.

To change the code and rebuild:

```sh
npm install
npm run build                  # build everything
node build.mjs waterfall       # just the Waterfall (dist/waterfall.js)
node build.mjs <slug>          # just one illustration (illusions/<slug>/bundle.js)
node build.mjs <name> --watch  # rebuild on every change
node tools/gallery.mjs         # refresh the gallery's card data from each meta.json
npm start                      # build, then serve on http://localhost:8080
```

`node tools/screenshot.cjs <page.html> <out.png> [--frame] [--eval "js"]` takes a headless screenshot of any page and reports console errors.

## The gallery

Each illustration is an original scene that uses the device rather than a copy of any picture. Every one has a lithograph and a colour mode where that makes sense, a control that exposes the mechanism, and a "How it works" panel.

**Tricks Escher used**

| Technique | Illustrations |
|---|---|
| Impossible figures | [Waterfall](index.html), [The Endless Stair](illusions/penrose-stairs/index.html) |
| Ambiguous depth | [The Impossible Cube](illusions/impossible-cube/index.html) |
| Convex/concave reversal | [Convex and Concave](illusions/convex-concave/index.html) |
| Multiple gravities | [Three Gravities](illusions/relativity/index.html) |
| Curved perspective | [Zenith and Nadir](illusions/curved-perspective/index.html) |
| Tessellation | [Regular Division of the Plane](illusions/tessellation/index.html) |
| Figure–ground reversal | [Figure and Ground](illusions/figure-ground/index.html) |
| Metamorphosis | [Metamorphosis](illusions/metamorphosis/index.html) |
| Flat-to-3D crossover | [Flat to Solid](illusions/flat-to-3d/index.html) |
| Self-reference loops | [Drawing Hands](illusions/drawing-hands/index.html), [Print Gallery](illusions/print-gallery/index.html) |
| Infinity in a finite space | [Circle Limit](illusions/circle-limit/index.html), [Smaller and Smaller](illusions/smaller-and-smaller/index.html) |
| Reflections and layered worlds | [Reflecting Sphere](illusions/reflecting-sphere/index.html), [Three Worlds](illusions/three-worlds/index.html) |
| One-sided surfaces | [Möbius Lattice](illusions/moebius-strip/index.html) |
| Ordinary details as misdirection | [Waterfall](index.html) |

**Tricks he didn't use, or that came later**

| Technique | Illustrations |
|---|---|
| Reutersvärd's cube-built impossible figures | [Triangle of Cubes](illusions/reutersvard/index.html) |
| The devil's fork | [The Devil's Fork](illusions/devils-fork/index.html) |
| Real impossible objects | [The Sweet Spot](illusions/perth-triangle/index.html), [Square or Round](illusions/sugihara/index.html) |
| Reverse perspective | [The Rooms That Follow You](illusions/reverse-perspective/index.html) |
| Anamorphic street art | [The Cistern Stair](illusions/street-art/index.html) |
| Mirror anamorphosis and double images | [The Island and the Mirror](illusions/mirror-anamorphosis/index.html) |
| Aperiodic tilings | [Penrose Tiling](illusions/penrose-tiling/index.html), [The Hat](illusions/hat-tiling/index.html) |
| Completing *Print Gallery* | [Print Gallery](illusions/print-gallery/index.html) |
| Rotating-camera puzzles | [The Turning Bridge](illusions/rotating-puzzle/index.html) |
| Computer-generated hyperbolic patterns | [Circle Limit](illusions/circle-limit/index.html) |

## The Waterfall's controls

| | |
|---|---|
| **Lithograph / Colour** (`L`) | Toggle between black-and-white print rendering and muted colour |
| **Reveal the trick** (`R`) | Swing the camera off Escher's axis to show the real structure |
| **Pause** (`Space`) | Stop and resume the water, the wheel and the laundry |
| Drag / scroll | Pan and zoom; when revealed, drag orbits the structure |
| Double-click / `0` | Reset the view |

## How the Waterfall's impossible loop works

The camera is orthographic and sits on the cube diagonal (1, 1, 1), the true isometric angle. From there a horizontal step of (−d, 0, −d) looks exactly like a vertical step of (0, +d, 0), because the two differ by d·(1, 1, 1), which projects to a single point.

The aqueduct has four reaches, all running away from the viewer:

```
wheel ─S1(−z)→ C1 ─S2(−x)→ C2 ─S3(−z)→ C3 ─S4(−x)→ lip ─fall→ wheel
```

All four lie on one level in 3D. In the picture they climb `DROP = A + S = 26` units: two and a half tower storeys. That is exactly the height the water then falls.

In 3D the loop is an open spiral whose top sits 26·√3 behind its bottom. Three elements bridge gaps that exist only in the picture:

1. **The waterfall** hangs from the real end of S4 and lands on the real wheel.
2. **The lower storey of the right tower** stands on C1 and holds up C3.
3. **The lower storey of the left tower** stands on C2 and holds up S4 at P.

Each one is cut once at mid-height. Its upper half is slid back along the line of sight to meet the part it carries. A slide along (1, 1, 1) is invisible from the isometric angle; it only changes which surfaces hide which. These are the three Penrose tribars Escher built the print from. Texture coordinates are computed before the slide, so the two halves of each cut join without a visible seam. **Reveal the trick** draws a dashed red line across each of the three gaps.

The numbers are in `src/layout.js`.

## What's in the Waterfall

- The compound of three cubes on the left tower, and Escher's solid (the first stellation of the rhombic dodecahedron) on the right tower. Each is turned slightly so the isometric view does not look straight down a three-fold axis.
- The towers' arcaded top storeys, with columns, capitals and entablatures.
- A brick aqueduct with stone copings and string courses.
- The mill house with its tiled roof, chimney, shutters and turning overshot wheel.
- The terrace where a woman pegs out laundry that sways in the wind.
- The man leaning on the parapet, watching the water go by.
- The giant mosses and lichens in the lower left: cup lichens, reindeer moss, hair-cap moss with spore capsules, and broad leaves.
- Terraced vineyards wrapping the far side of the valley, with the slender tower at the top left.

Every face carries its own outline distances and planar texture coordinates. One shader draws the bricks, ashlar, roof tiles, cobbles and plaster. It adds graphite tone, surface-following cross-hatching in shadow, and inked outlines for the lithograph look.

## Layout

```
index.html           the Waterfall: page, styles, controls
src/main.js          renderer, isometric camera, interaction, animation loop
src/layout.js        the impossible geometry, as numbers
src/builder.js       geometry builder (outline + texture attributes, view-axis shift)
src/materials.js     ink, water, waterfall and spray shaders
src/structure.js     channels, corners, supports, towers, polyhedra
src/water.js         channel water, the fall, wheel sheet, foam and spray
src/mill.js          mill house, terrace, laundry, wheel
src/courtyard.js     ground, courtyard buildings, stairs, well, the man
src/figures.js       people and limbs
src/garden.js        giant mosses and lichens
src/landscape.js     terraced hillside
dist/waterfall.js    built bundle (committed so the page runs offline)

illusions/index.html         the gallery (cards from illusions/gallery-data.js)
illusions/<slug>/            one illustration: index.html, src/, bundle.js, thumb.jpg, meta.json
illusions/shared/            common page style (page.css) and shell helpers (shell.js)
illusions/_template/         starting point for a new illustration
vendor/three.min.js          one shared copy of three.js for the illustrations (window.THREE)
build.mjs                    builds the Waterfall, the shared three.js and every illustration
tools/                       screenshot checker and gallery data generator
assets/                      the Waterfall's gallery thumbnail
```

## Credit

An homage to *Waterfall* (1961) by M. C. Escher, and to the artists and mathematicians credited on each gallery page. Every model, texture and shader here is original; no part of any artwork is reproduced. Built with [three.js](https://threejs.org).
