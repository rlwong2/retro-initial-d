// Every customization category is capped below 10 options on purpose.

// `lower` paints the bottom of the body a second color (the AE86's "panda" two-tone).
export const COLORS = [
  { id: 'panda', name: 'Panda Two-Tone', hex: '#f2f2f2', lower: '#1c1c24' },
  { id: 'black', name: 'Midnight Black', hex: '#3a3a4c' },
  { id: 'silver', name: 'Sonic Silver', hex: '#c4cad6' },
  { id: 'red', name: 'Racing Red', hex: '#ff2a2a' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ff7a1a' },
  { id: 'yellow', name: 'Champion Yellow', hex: '#ffd400' },
  { id: 'blue', name: 'Bayside Blue', hex: '#1f6bff' },
  { id: 'pink', name: 'Neon Pink', hex: '#ff2e88' },
  { id: 'white', name: 'Pearl White', hex: '#f4f4f0' },
];

export const WHEELS = [
  { id: 'steel', name: 'Steel', rim: '#8d939c' },
  { id: 'fivespoke', name: '5-Spoke', rim: '#e6e6ee' },
  { id: 'mesh', name: 'Mesh', rim: '#e3b341' },
  { id: 'deepdish', name: 'Deep Dish', rim: '#cfd8e3' },
  { id: 'turbofan', name: 'Turbofan', rim: '#f4f4f4' },
  { id: 'rally', name: 'Bronze Rally', rim: '#b8732e' },
];

export const SPOILERS = [
  { id: 'none', name: 'None' },
  { id: 'ducktail', name: 'Ducktail' },
  { id: 'gt', name: 'GT Wing' },
  { id: 'swan', name: 'Swan Neck' },
  { id: 'rally', name: 'Rally Kit' },
];

// Photo-mode backdrops, built in three/Scenes.jsx. `sky` is the swatch gradient.
export const SCENES = [
  { id: 'garage', name: 'Neon Garage', sky: ['#120d26', '#ff2e88'] },
  { id: 'night', name: 'Night Street Race', sky: ['#04030c', '#2a1650'] },
  { id: 'desert', name: 'Sunny Desert Street', sky: ['#1f6fd0', '#d7ab72'] },
  { id: 'city', name: 'Big City Dusk', sky: ['#241650', '#ffbf6a'] },
  { id: 'miami', name: 'Miami Tropical Highway', sky: ['#7a2a8e', '#13b2c0'] },
];

export const byId = (list, id) => list.find((o) => o.id === id) ?? list[0];
