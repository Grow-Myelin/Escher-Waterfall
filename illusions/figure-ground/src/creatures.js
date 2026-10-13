// The two creatures: an original swallow-like bird seen from above (wings
// swept back, heading left) and a fish seen from the side (heading left).
// The beak of each bird sits in the fork of a fish's tail; the snout of each
// fish sits between a bird's trailing wings.
//
// The four bird edges were found by fitting both outlines at once to
// drawings of the two animals (a small least-squares search), then tidied.
// Each edge: handles [u, v] in its own frame (u along the edge, v outward
// from the bird, in edge lengths). Edges run counter-clockwise round the
// bird: right, top, left, bottom.

export const DESIGN = {
  P: [0.9149, 0.5001],
  Q: [-0.3081, 0.5242],
  handles: [
    [[0.2704, -0.1201], [0.3141, -0.3538], [0.4287, -0.535], [0.5872, -0.6088], [0.6271, -0.5134], [0.6672, -0.3265], [0.7199, -0.101]],
    [[0.3787, 0.2675], [0.4187, 0.096], [0.4587, 0.0022], [0.4987, 0.0612], [0.5387, 0.1382], [0.5787, 0.079], [0.907, 0.0349]],
    [[0.221, -0.0452], [0.3797, 0.2091], [0.4197, 0.4116], [0.5623, 0.464], [0.6024, 0.3625], [0.6424, 0.1624], [0.8687, -0.0732]],
    [[0.3658, 0.0602], [0.4058, -0.0838], [0.4458, -0.1409], [0.4858, -0.0087], [0.5258, 0.1734], [0.6916, 0.2372], [0.7316, 0.2922]],
  ],
};

// Detail drawn on each creature, in its own frame (bird centred on its cell,
// fish centred on its cell). level: the detail amount at which it appears.
export const BIRD_MARKS = [];
export const FISH_MARKS = [];
