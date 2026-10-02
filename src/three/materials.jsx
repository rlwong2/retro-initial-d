import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Three-step gradient so toon shading falls into hard bands, which reads as
// hand-shaded pixel art once the canvas is upscaled.
let gradient;
function getGradient() {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([90, 140, 200, 255]), 4, 1, THREE.RedFormat);
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

// Rounds the corners of a closed 2D outline. Points are [x, y] or [x, y, radius].
export function roundedOutline(points, seg = 5) {
  const out = [];
  const n = points.length;
  points.forEach(([x, y, r = 0], i) => {
    if (!r) return out.push([x, y]);
    const [px, py] = points[(i + n - 1) % n];
    const [nx, ny] = points[(i + 1) % n];
    const l1 = Math.hypot(px - x, py - y);
    const l2 = Math.hypot(nx - x, ny - y);
    const d1 = Math.min(r, l1 / 2) / l1;
    const d2 = Math.min(r, l2 / 2) / l2;
    const a = [x + (px - x) * d1, y + (py - y) * d1];
    const b = [x + (nx - x) * d2, y + (ny - y) * d2];
    for (let k = 0; k <= seg; k++) {
      const t = k / seg;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * x + t * t * b[0], u * u * a[1] + 2 * u * t * y + t * t * b[1]]);
    }
  });
  return out;
}

// Extrudes a 2D side profile (x, y points) across the car's width, centered on
// z = 0. `scaleZ(x, y)` narrows the body (plan-view taper, tumblehome), and the
// edges are beveled and smooth-shaded so the panels read as curved sheet metal.
export function extrudeProfile(points, depth, scaleZ) {
  const bevel = Math.min(0.035, depth / 8);
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  let geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.translate(0, 0, -(depth - bevel * 2) / 2);
  if (scaleZ) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * scaleZ(pos.getX(i), pos.getY(i)));
  }
  geo.deleteAttribute('normal');
  geo = toCreasedNormals(geo, 0.7);
  return geo;
}
