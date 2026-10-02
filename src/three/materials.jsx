import * as THREE from 'three';

// Three-step gradient so toon shading falls into hard bands, which reads as
// hand-shaded pixel art once the canvas is upscaled.
let gradient;
function getGradient() {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([80, 160, 255]), 3, 1, THREE.RedFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
}

export function Toon({ color, ...rest }) {
  return <meshToonMaterial color={color} gradientMap={getGradient()} {...rest} />;
}

// Unlit, for lights and glowing details.
export function Glow({ color }) {
  return <meshBasicMaterial color={color} />;
}

// Extrudes a 2D side profile (x, y points) across the car's width, centered on z = 0.
export function extrudeProfile(points, depth) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return geo;
}
