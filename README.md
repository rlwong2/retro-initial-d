# Retro Initial D

A pixel-art car customizer. Pick a car from the garage, then change its paint, wheels,
and spoiler on a low-poly 3D model that renders like an old video game, and export the
result as a PNG.

Built with React, Vite, and Three.js (via `@react-three/fiber` / `@react-three/drei`).

## Run

```bash
npm install
npm run dev       # local dev server
npm run build     # static build into dist/
npm run preview   # serve the build
```

`dist/` is plain static files, so it can be hosted anywhere (GitHub Pages, Netlify, etc.).
The Vite `base` is `./`, so it also works from a subfolder.

## How it works

- **Pixelation**: `src/three/PixelCanvas.jsx` renders WebGL at `1 / pixel` of the CSS
  size with antialiasing off. CSS `image-rendering: pixelated` then scales the canvas up
  into crisp blocks. Toon materials with a 3-step gradient (`src/three/materials.jsx`)
  give hard-banded shading.
- **Cars** (`src/data/cars.js`) are shape parameters, not model files. `CarModel.jsx`
  extrudes a side profile (with wheel arches) for the body, then adds the cabin, roof,
  lights, wheels (`Wheel.jsx`) and spoiler (`Spoiler.jsx`).
- **Options** (`src/data/options.js`): 8 colors, 6 wheels, 5 spoilers. Each category is
  kept under 10.
- **Export** (`src/utils/exportImage.js`) upscales the low-res frame with
  nearest-neighbor sampling, adds a caption bar, and downloads it as a PNG.

To add a car, add an entry to `CARS` with its own `geo` parameters. To add an option,
add it to the list in `options.js`. New wheel or spoiler styles also need a case in
`Wheel.jsx` / `Spoiler.jsx`.
