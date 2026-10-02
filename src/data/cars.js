// Each car is a handful of shape parameters fed to one shared low-poly builder
// (three/CarModel.jsx), so there are no external model files. The shapes are
// loose low-poly impressions of each car, with no logos or badges.
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
//   open      convertible (no roof, roll hoops behind the seats)
//   tails     'quad' for four round taillights (Skyline style), else light bars
//   blower    supercharger sticking out of the hood

export const SERIES = [
  { id: 'initiald', name: 'INITIAL D' },
  { id: 'fnf', name: 'FAST & FURIOUS' },
];

const LINEUP = [
  {
    id: 'ae86',
    series: 'initiald',
    make: 'Toyota',
    model: 'AE86 Trueno',
    tagline: 'Downhill tofu delivery legend',
    stats: { speed: 5, handling: 9, drift: 10 },
    geo: { L: 4.0, W: 1.65, H: 0.55, lift: 0.26, R: 0.3, tw: 0.24, wb: 2.4, nose: 0.18, tail: 0.06,
      cab: { rear: -1.72, front: 0.42, h: 0.5, ws: 0.55, rr: 0.3 }, popups: true },
    defaults: { color: 'panda', wheel: 'steel', spoiler: 'none' },
  },
  {
    id: 'fd3s',
    series: 'initiald',
    make: 'Mazda',
    model: 'RX-7 FD3S',
    tagline: 'Yellow rotary rocket',
    stats: { speed: 8, handling: 9, drift: 8 },
    geo: { L: 4.3, W: 1.76, H: 0.45, lift: 0.22, R: 0.31, tw: 0.27, wb: 2.42, nose: 0.55, tail: 0.14,
      cab: { rear: -1.25, front: 0.2, h: 0.42, ws: 0.72, rr: 0.8 }, popups: true },
    defaults: { color: 'yellow', wheel: 'fivespoke', spoiler: 'gt' },
  },
  {
    id: 'r32',
    series: 'initiald',
    make: 'Nissan',
    model: 'Skyline GT-R R32',
    tagline: 'Black all-wheel-drive monster',
    stats: { speed: 9, handling: 7, drift: 5 },
    geo: { L: 4.55, W: 1.76, H: 0.57, lift: 0.26, R: 0.33, tw: 0.28, wb: 2.62, nose: 0.22, tail: 0.12,
      cab: { rear: -1.3, front: 0.5, h: 0.5, ws: 0.52, rr: 0.4 }, tails: 'quad' },
    defaults: { color: 'black', wheel: 'mesh', spoiler: 'ducktail' },
  },
  {
    id: 'evo3',
    series: 'initiald',
    make: 'Mitsubishi',
    model: 'Lancer Evo III',
    tagline: 'Rally-bred mountain killer',
    stats: { speed: 8, handling: 8, drift: 6 },
    geo: { L: 4.3, W: 1.7, H: 0.58, lift: 0.27, R: 0.31, tw: 0.26, wb: 2.5, nose: 0.2, tail: 0.1,
      cab: { rear: -1.25, front: 0.5, h: 0.52, ws: 0.5, rr: 0.35 } },
    defaults: { color: 'red', wheel: 'rally', spoiler: 'gt' },
  },
  {
    id: 'supra',
    series: 'fnf',
    make: 'Toyota',
    model: 'Supra Mk IV',
    tagline: 'The ten-second car',
    stats: { speed: 10, handling: 7, drift: 6 },
    geo: { L: 4.5, W: 1.81, H: 0.5, lift: 0.24, R: 0.33, tw: 0.29, wb: 2.55, nose: 0.42, tail: 0.12,
      cab: { rear: -1.2, front: 0.35, h: 0.46, ws: 0.75, rr: 0.9 } },
    defaults: { color: 'orange', wheel: 'fivespoke', spoiler: 'gt' },
  },
  {
    id: 'r34',
    series: 'fnf',
    make: 'Nissan',
    model: 'Skyline GT-R R34',
    tagline: 'Two fast, two furious',
    stats: { speed: 9, handling: 8, drift: 6 },
    geo: { L: 4.6, W: 1.78, H: 0.6, lift: 0.26, R: 0.34, tw: 0.29, wb: 2.66, nose: 0.22, tail: 0.1,
      cab: { rear: -1.35, front: 0.5, h: 0.48, ws: 0.55, rr: 0.5 }, tails: 'quad' },
    defaults: { color: 'blue', wheel: 'fivespoke', spoiler: 'ducktail' },
  },
  {
    id: 'charger',
    series: 'fnf',
    make: 'Dodge',
    model: "Charger R/T '70",
    tagline: 'Supercharged family muscle',
    stats: { speed: 10, handling: 4, drift: 7 },
    geo: { L: 5.2, W: 1.95, H: 0.62, lift: 0.26, R: 0.35, tw: 0.32, wb: 3.0, nose: 0.1, tail: 0.1,
      cab: { rear: -1.35, front: 0.15, h: 0.46, ws: 0.6, rr: 0.7 }, blower: true },
    defaults: { color: 'black', wheel: 'deepdish', spoiler: 'none' },
  },
  {
    id: 's2000',
    series: 'fnf',
    make: 'Honda',
    model: 'S2000',
    tagline: 'Hot-pink street race queen',
    stats: { speed: 7, handling: 9, drift: 7 },
    geo: { L: 4.1, W: 1.75, H: 0.5, lift: 0.24, R: 0.3, tw: 0.25, wb: 2.4, nose: 0.32, tail: 0.1,
      cab: { rear: -0.7, front: 0.3, h: 0.32, ws: 0.3, rr: 0 }, open: true },
    defaults: { color: 'pink', wheel: 'mesh', spoiler: 'none' },
  },
];

// `name` (make + model) is what the customize screen and the export caption show.
export const CARS = LINEUP.map((car) => ({ ...car, name: `${car.make} ${car.model}` }));
