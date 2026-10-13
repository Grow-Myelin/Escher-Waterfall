# Waterfall, in isometric

An animated, true-isometric 3D reconstruction of M. C. Escher's lithograph *Waterfall* (1961). Water falls onto a mill wheel, runs away from you down a zigzag aqueduct, and arrives back at the top of the fall without ever climbing.

## Run it

Open `index.html` in a browser. The page works offline from `file://`: the built bundle (`dist/waterfall.js`) is committed and has no network dependencies.

To change the code and rebuild:

```sh
npm install
npm run build      # bundle src/ into dist/waterfall.js
npm run dev        # rebuild on every change
npm start          # build, then serve on http://localhost:8080
```

## Controls

| | |
|---|---|
| **Lithograph / Colour** (`L`) | Toggle between black-and-white print rendering and muted colour |
| **Reveal the trick** (`R`) | Swing the camera off Escher's axis to show the real structure |
| **Pause** (`Space`) | Stop and resume the water, the wheel and the laundry |
| Drag / scroll | Pan and zoom; when revealed, drag orbits the structure |
| Double-click / `0` | Reset the view |

## How the impossible part works

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

## What's in the picture

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
index.html           page, styles, controls
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
```

## Credit

An homage to *Waterfall* (1961) by M. C. Escher. Every model, texture and shader here is original; no part of the print is reproduced. Built with [three.js](https://threejs.org).
