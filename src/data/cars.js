// Each car is a traced side silhouette plus a few detail flags, fed to one
// shared low-poly builder (three/CarModel.jsx), so there are no external model
// files. Length, width, height, wheelbase, overhangs and tire sizes follow the
// factory specs; the outlines are traced from side-on reference photos. No
// logos or badges.
//
// Units are meters. x = length (front is +x, the car is centered on x = 0),
// y = up from the ground, z = width.
//   L, W      overall length / width
//   wb, axle  wheelbase, and the front axle's x (the rear axle is axle - wb)
//   R, tw     wheel radius / tire width
//   lift      height of the body's bottom edge
//   side      side outline from the front bumper's bottom edge, over the hood,
//             belt line and trunk, down to the rear bumper's bottom edge, as
//             [x, y, cornerRadius]. The greenhouse sits on top of it.
//   cabin     greenhouse: front / rear base x (on the body line), `ws` the
//             windshield top, `roof` the roof points running rearward (the rear
//             glass drops from the last one to `rear`), `b` the B-pillar x.
//             Convertibles give only front, ws and the cockpit's rear edge.
//   taperF/R  how much the body narrows toward the nose / tail (plan view)
//   popups    pop-up headlights (true = closed, 'open' = raised), `popupAt` m behind the nose
//   tails     'quad' round taillights (Skyline), else light bars
//   bed       open truck bed behind the cab, starting at `front`
//   tumble, tumbleEnds  how much the greenhouse narrows toward the roof / its ends
//   flares, scoop, vents, dualExhaust, mirrorDark, open, wrapLights, paintedBumper,
//   bumperH, hoodColor, hoodStart, lightsAt, grilleAt   detail flags

const LINEUP = [
  {
    id: 'ae86',
    make: 'Toyota',
    model: 'AE86 Trueno',
    tagline: 'Downhill tofu delivery legend',
    stats: { speed: 5, handling: 9, drift: 10 },
    // 4180 x 1625 x 1335 mm, 2400 mm wheelbase, 185/70R13
    geo: {
      L: 4.18, W: 1.625, wb: 2.4, axle: 1.24, R: 0.295, tw: 0.185, lift: 0.17,
      side: [
        [2.05, 0.2], [2.1, 0.3, 0.03], [2.09, 0.5, 0.03], [2.09, 0.62, 0.02],
        [1.2, 0.76, 0.5], [0.48, 0.86, 0.06], [-1.0, 0.89, 0.3], [-1.95, 0.92, 0.06],
        [-2.08, 0.9, 0.04], [-2.09, 0.5, 0.04], [-2.06, 0.22],
      ],
      cabin: { front: 0.48, rear: -1.95, ws: [-0.3, 1.26], roof: [[-1.05, 1.29]], b: -0.5 },
      taperF: 0.08, taperR: 0.05,
      popups: 'open', popupAt: 0.45, bumperH: 0.3, mirrorDark: true,
    },
    defaults: { color: 'panda', wheel: 'steel', spoiler: 'none' },
  },
  {
    id: 'fd3s',
    make: 'Mazda',
    model: 'RX-7 FD3S',
    tagline: 'Yellow rotary rocket',
    stats: { speed: 8, handling: 9, drift: 8 },
    // 4285 x 1760 x 1230 mm, 2425 mm wheelbase, 225/50R16
    geo: {
      L: 4.285, W: 1.76, wb: 2.425, axle: 1.29, R: 0.316, tw: 0.225, lift: 0.13,
      side: [
        [2.11, 0.16], [2.15, 0.28, 0.06], [2.13, 0.45, 0.1], [1.9, 0.58, 0.15],
        [1.3, 0.72, 0.4], [0.4, 0.8, 0.12], [-0.8, 0.84, 0.3], [-1.25, 0.9, 0.35],
        [-1.95, 0.88, 0.2], [-2.13, 0.76, 0.1], [-2.14, 0.42, 0.06], [-2.1, 0.18],
      ],
      cabin: { front: 0.4, rear: -1.75, ws: [-0.42, 1.17], roof: [[-0.95, 1.19], [-1.35, 1.06]], b: -0.8 },
      taperF: 0.2, taperR: 0.14,
      popups: 'open', popupAt: 0.6, hoodColor: '#1c1c24', hoodStart: 0.2, paintedBumper: true, flares: true, dualExhaust: true,
    },
    defaults: { color: 'yellow', wheel: 'fivespoke', spoiler: 'gt' },
  },
  {
    id: 'r32',
    make: 'Nissan',
    model: 'Skyline GT-R R32',
    tagline: 'Black all-wheel-drive monster',
    stats: { speed: 9, handling: 7, drift: 5 },
    // 4545 x 1755 x 1340 mm, 2615 mm wheelbase, 225/50R16
    geo: {
      L: 4.545, W: 1.755, wb: 2.615, axle: 1.4, R: 0.316, tw: 0.225, lift: 0.16,
      side: [
        [2.24, 0.19], [2.28, 0.3, 0.04], [2.27, 0.52, 0.05], [2.22, 0.66, 0.06],
        [1.5, 0.76, 0.45], [0.62, 0.84, 0.08], [-1.0, 0.88, 0.3], [-1.55, 0.92, 0.1],
        [-2.15, 0.93, 0.1], [-2.27, 0.86, 0.05], [-2.28, 0.36, 0.05], [-2.24, 0.2],
      ],
      cabin: { front: 0.62, rear: -1.55, ws: [-0.22, 1.27], roof: [[-1.0, 1.3]], b: -0.5 },
      taperF: 0.14, taperR: 0.1,
      tails: 'quad', flares: true, dualExhaust: true, paintedBumper: true, wrapLights: true,
    },
    defaults: { color: 'black', wheel: 'fivespoke', spoiler: 'gt' },
  },
  {
    id: 'evo3',
    make: 'Mitsubishi',
    model: 'Lancer Evo III',
    tagline: 'Rally-bred mountain killer',
    stats: { speed: 8, handling: 8, drift: 6 },
    // 4310 x 1695 x 1420 mm, 2500 mm wheelbase, 205/60R15
    geo: {
      L: 4.31, W: 1.695, wb: 2.5, axle: 1.235, R: 0.31, tw: 0.205, lift: 0.17,
      side: [
        [2.12, 0.2], [2.16, 0.32, 0.04], [2.15, 0.56, 0.04], [2.1, 0.7, 0.05],
        [1.3, 0.8, 0.35], [0.65, 0.86, 0.08], [-0.9, 0.9, 0.3], [-1.4, 0.95, 0.08],
        [-2.05, 0.97, 0.08], [-2.15, 0.9, 0.04], [-2.16, 0.36, 0.04], [-2.12, 0.2],
      ],
      cabin: { front: 0.65, rear: -1.4, ws: [-0.1, 1.34], roof: [[-0.95, 1.37]], b: -0.32 },
      taperF: 0.1, taperR: 0.08,
      scoop: true, flares: true,
    },
    defaults: { color: 'red', wheel: 'rally', spoiler: 'gt' },
  },
  {
    id: 'supra',
    make: 'Toyota',
    model: 'Supra Mk IV',
    tagline: 'The ten-second car',
    stats: { speed: 10, handling: 7, drift: 6 },
    // 4520 x 1810 x 1275 mm, 2550 mm wheelbase, 235/45R17
    geo: {
      L: 4.52, W: 1.81, wb: 2.55, axle: 1.31, R: 0.322, tw: 0.245, lift: 0.14,
      side: [
        [2.21, 0.17], [2.26, 0.27, 0.06], [2.24, 0.42, 0.12], [1.95, 0.56, 0.2],
        [1.3, 0.69, 0.4], [0.3, 0.83, 0.1], [-0.85, 0.87, 0.3], [-1.3, 0.93, 0.35],
        [-1.98, 0.92, 0.2], [-2.25, 0.84, 0.1], [-2.26, 0.4, 0.06], [-2.22, 0.19],
      ],
      cabin: { front: 0.3, rear: -1.75, ws: [-0.5, 1.21], roof: [[-1.0, 1.235], [-1.38, 1.12]], b: -0.85 },
      taperF: 0.2, taperR: 0.14,
      flares: true, dualExhaust: true,
    },
    defaults: { color: 'orange', wheel: 'fivespoke', spoiler: 'gt' },
  },
  {
    id: 'r34',
    make: 'Nissan',
    model: 'Skyline GT-R R34',
    tagline: 'Two fast, two furious',
    stats: { speed: 9, handling: 8, drift: 6 },
    // 4600 x 1785 x 1360 mm, 2665 mm wheelbase, 245/40R18
    geo: {
      L: 4.6, W: 1.785, wb: 2.665, axle: 1.4, R: 0.327, tw: 0.245, lift: 0.16,
      side: [
        [2.27, 0.19], [2.31, 0.3, 0.04], [2.3, 0.54, 0.04], [2.26, 0.68, 0.05],
        [1.5, 0.78, 0.4], [0.6, 0.86, 0.08], [-1.1, 0.91, 0.3], [-1.5, 0.96, 0.08],
        [-2.17, 0.99, 0.08], [-2.29, 0.94, 0.04], [-2.3, 0.36, 0.04], [-2.26, 0.2],
      ],
      cabin: { front: 0.6, rear: -1.5, ws: [-0.2, 1.29], roof: [[-1.05, 1.32]], b: -0.5 },
      taperF: 0.1, taperR: 0.08,
      tails: 'quad', vents: true, flares: true, dualExhaust: true, paintedBumper: true,
    },
    defaults: { color: 'blue', wheel: 'fivespoke', spoiler: 'ducktail' },
  },
  {
    id: 'pixis',
    make: 'Toyota',
    model: 'Pixis Truck',
    tagline: 'Kei-class farm hauler',
    stats: { speed: 2, handling: 6, drift: 4 },
    // 3395 x 1475 x 1780 mm, 1900 mm wheelbase, 145R12. Cab-over: the front
    // wheels sit under the seats and the bed starts right behind the cab.
    geo: {
      L: 3.395, W: 1.475, wb: 1.9, axle: 1.1, R: 0.27, tw: 0.145, lift: 0.2,
      side: [
        [1.66, 0.22], [1.7, 0.3, 0.02], [1.7, 0.55, 0.02], [1.69, 1.0, 0.06], [1.6, 1.04, 0.04],
        [0.46, 1.04], [0.42, 0.97], [-1.68, 0.97, 0.02], [-1.7, 0.9, 0.02], [-1.7, 0.3, 0.02], [-1.66, 0.22],
      ],
      cabin: { front: 1.6, rear: 0.46, ws: [1.5, 1.72], roof: [[0.5, 1.74]], b: 0.62 },
      taperF: 0.02, taperR: 0, tumble: 0.05, tumbleEnds: 0,
      bed: { front: 0.42 }, lightsAt: 0.62, grilleAt: 0.62, mirrorDark: true,
    },
    defaults: { color: 'white', wheel: 'steel', spoiler: 'none' },
  },
  {
    id: 's2000',
    make: 'Honda',
    model: 'S2000',
    tagline: 'Hot-pink street race queen',
    stats: { speed: 7, handling: 9, drift: 7 },
    // 4135 x 1750 x 1285 mm, 2400 mm wheelbase, 205/55R16
    geo: {
      L: 4.135, W: 1.75, wb: 2.4, axle: 1.25, R: 0.316, tw: 0.215, lift: 0.14,
      side: [
        [2.03, 0.17], [2.07, 0.27, 0.05], [2.06, 0.43, 0.1], [1.92, 0.55, 0.12],
        [1.1, 0.72, 0.35], [0.3, 0.8, 0.05], [-0.6, 0.82, 0.2], [-1.25, 0.85, 0.2],
        [-1.95, 0.87, 0.12], [-2.06, 0.78, 0.06], [-2.07, 0.4, 0.05], [-2.03, 0.19],
      ],
      cabin: { front: 0.3, ws: [-0.12, 1.12], rear: -0.85 },
      taperF: 0.14, taperR: 0.1,
      open: true,
    },
    defaults: { color: 'pink', wheel: 'mesh', spoiler: 'none' },
  },
];

// `name` (make + model) is what the customize screen and the export caption show.
export const CARS = LINEUP.map((car) => ({ ...car, name: `${car.make} ${car.model}` }));
