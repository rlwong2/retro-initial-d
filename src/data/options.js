// Every customization category is capped below 10 options on purpose.

export const COLORS = [
  { id: 'panda', name: 'Panda White', hex: '#f2f2f2' },
  { id: 'black', name: 'Midnight Black', hex: '#3a3a4c' },
  { id: 'pink', name: 'Neon Pink', hex: '#ff2e88' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00e5ff' },
  { id: 'lime', name: 'Toxic Lime', hex: '#b6ff00' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ff7a1a' },
  { id: 'purple', name: 'Royal Purple', hex: '#8b3dff' },
  { id: 'red', name: 'Racing Red', hex: '#ff2a2a' },
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

export const byId = (list, id) => list.find((o) => o.id === id) ?? list[0];
