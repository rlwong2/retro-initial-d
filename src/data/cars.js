// Each car is a handful of shape parameters fed to one shared low-poly builder
// (three/CarModel.jsx), so there are no external model files.
//
// Units are roughly meters. x = length (front is +x), y = up, z = width.
//   L, W      body length / width
//   H         height of the lower body slab
//   lift      ground clearance of the body
//   R, tw     wheel radius / tire width
//   wb        wheelbase
//   nose      how far the hood top is pulled back from the front face
//   tail      same for the trunk
//   cab       cabin: rear x, front x, height, windshield run, rear-glass run
//   popups    pop-up headlights
//   open      convertible (no roof)

export const CARS = [
  {
    id: 'tofu',
    name: 'Tofu Hatch',
    tagline: 'Mountain-pass delivery legend',
    stats: { speed: 5, handling: 9, drift: 10 },
    geo: { L: 4.0, W: 1.65, H: 0.55, lift: 0.26, R: 0.3, tw: 0.24, wb: 2.4, nose: 0.18, tail: 0.06,
      cab: { rear: -1.72, front: 0.42, h: 0.5, ws: 0.55, rr: 0.3 }, popups: true },
    defaults: { color: 'panda', wheel: 'steel', spoiler: 'none' },
  },
  {
    id: 'rotary',
    name: 'Rotary FC',
    tagline: 'Spins to the redline',
    stats: { speed: 8, handling: 8, drift: 8 },
    geo: { L: 4.2, W: 1.7, H: 0.5, lift: 0.24, R: 0.3, tw: 0.26, wb: 2.45, nose: 0.4, tail: 0.1,
      cab: { rear: -1.35, front: 0.3, h: 0.44, ws: 0.7, rr: 0.75 }, popups: true },
    defaults: { color: 'red', wheel: 'fivespoke', spoiler: 'ducktail' },
  },
  {
    id: 'midnight',
    name: 'Midnight GT',
    tagline: 'All-wheel-drive monster',
    stats: { speed: 10, handling: 7, drift: 5 },
    geo: { L: 4.4, W: 1.76, H: 0.6, lift: 0.26, R: 0.33, tw: 0.28, wb: 2.6, nose: 0.22, tail: 0.12,
      cab: { rear: -1.3, front: 0.5, h: 0.5, ws: 0.5, rr: 0.38 } },
    defaults: { color: 'black', wheel: 'mesh', spoiler: 'gt' },
  },
  {
    id: 'kei',
    name: 'Kei Racer',
    tagline: 'Tiny engine, huge heart',
    stats: { speed: 3, handling: 10, drift: 6 },
    geo: { L: 3.3, W: 1.48, H: 0.5, lift: 0.24, R: 0.27, tw: 0.22, wb: 2.2, nose: 0.15, tail: 0.04,
      cab: { rear: -1.45, front: 0.55, h: 0.62, ws: 0.4, rr: 0.1 } },
    defaults: { color: 'lime', wheel: 'turbofan', spoiler: 'rally' },
  },
  {
    id: 'roadster',
    name: 'Touge Roadster',
    tagline: 'Top down, eyes up',
    stats: { speed: 6, handling: 9, drift: 7 },
    geo: { L: 3.9, W: 1.68, H: 0.5, lift: 0.24, R: 0.29, tw: 0.24, wb: 2.3, nose: 0.3, tail: 0.1,
      cab: { rear: -0.75, front: 0.35, h: 0.32, ws: 0.28, rr: 0 }, popups: true, open: true },
    defaults: { color: 'cyan', wheel: 'deepdish', spoiler: 'none' },
  },
];
