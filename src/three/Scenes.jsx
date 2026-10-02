import { useMemo } from 'react';
import * as THREE from 'three';
import { Toon, Glow } from './materials.jsx';

// Photo-mode backdrops. Everything is generated: a gradient sky dome painted
// on a canvas, a road running along x (the car faces +x and sits at z = 0),
// and low-poly props scattered with a seeded RNG so a scene never reshuffles.

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The initial camera looks toward -x/-z, so the sun is painted there (u ≈ 0.875).
function skyTexture({ stops, ground, sun, stars }) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 256);
  stops.forEach(([t, col]) => sky.addColorStop(t, col));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 256, 1024, 256);
  if (stars) {
    const r = rng(7);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 260; i++) {
      ctx.globalAlpha = 0.3 + r() * 0.7;
      const s = r() < 0.15 ? 2 : 1;
      ctx.fillRect(r() * 1024, r() * 210, s, s);
    }
    ctx.globalAlpha = 1;
  }
  if (sun) {
    const { y, r, top, bottom, glow, stripes } = sun;
    for (const x of [896, 896 - 1024]) {
      if (glow) {
        const halo = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.6);
        halo.addColorStop(0, glow);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      const disc = ctx.createLinearGradient(0, y - r, 0, y + r);
      disc.addColorStop(0, top);
      disc.addColorStop(1, bottom);
      ctx.fillStyle = disc;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      if (stripes) {
        // Synthwave sun: horizontal gaps that widen toward the bottom.
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 7; i++) ctx.fillRect(x - r, y + r * (0.05 + i * 0.14), r * 2, 1.5 + i * 1.6);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Building facade: wall color with a grid of windows, some of them lit.
function windowTexture({ wall, lit, dark, ratio, seed }) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 64, 64);
  const r = rng(seed);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = r() < ratio ? lit : dark;
      ctx.fillRect(col * 16 + 4, row * 16 + 4, 8, 9);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function Box({ size, position, rotation, children }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      {children}
    </mesh>
  );
}

function Sky({ texture }) {
  return (
    <mesh>
      <sphereGeometry args={[95, 32, 16]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

// Road along x. `center` shifts it sideways so the car sits in a lane;
// `lines` are [z, color, dashed] markings.
function Road({ center = 0, width = 7.6, color = '#2c2b33', lines = [] }) {
  const dashes = [];
  for (let x = -60; x < 60; x += 4) dashes.push(x);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, center]}>
        <planeGeometry args={[140, width]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {lines.map(([z, col, dashed]) =>
        dashed ? (
          dashes.map((x) => (
            <mesh key={`${z}${x}`} rotation-x={-Math.PI / 2} position={[x, 0.004, z]}>
              <planeGeometry args={[2, 0.12]} />
              <meshBasicMaterial color={col} />
            </mesh>
          ))
        ) : (
          <mesh key={z} rotation-x={-Math.PI / 2} position={[0, 0.004, z]}>
            <planeGeometry args={[140, 0.12]} />
            <meshBasicMaterial color={col} />
          </mesh>
        )
      )}
    </group>
  );
}

function Ground({ color }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
      <circleGeometry args={[94, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function StreetLamp({ x, z, side, light = '#ffd890', pool = true }) {
  // `side` = which way the arm reaches (toward the road).
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={2.6}>
        <cylinderGeometry args={[0.07, 0.09, 5.2, 8]} />
        <Toon color="#2a2a34" />
      </mesh>
      <Box size={[0.08, 0.08, 1.4]} position={[0, 5.15, side * 0.7]}>
        <Toon color="#2a2a34" />
      </Box>
      <Box size={[0.5, 0.14, 0.3]} position={[0, 5.05, side * 1.35]}>
        <Glow color={light} />
      </Box>
      {pool && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, side * 1.6]}>
          <circleGeometry args={[2.2, 20]} />
          <meshBasicMaterial color={light} transparent opacity={0.14} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function Buildings({ items, palette }) {
  const textures = useMemo(
    () => items.map((b, i) => {
      const t = windowTexture({ ...palette, seed: 100 + i });
      t.repeat.set(Math.max(1, Math.round(b.w / 2)), Math.max(1, Math.round(b.h / 2.4)));
      return t;
    }),
    [items, palette]
  );
  return items.map((b, i) => (
    <group key={i}>
      <Box size={[b.w, b.h, b.d]} position={[b.x, b.h / 2, b.z]}>
        <meshBasicMaterial map={textures[i]} />
      </Box>
      <Box size={[b.w + 0.2, 0.3, b.d + 0.2]} position={[b.x, b.h + 0.15, b.z]}>
        <meshBasicMaterial color={palette.roof} />
      </Box>
    </group>
  ));
}

function Palm({ x, z, h = 6, lean = 0.4, seed = 1 }) {
  const r = rng(seed);
  const segs = 6;
  const yaw = r() * Math.PI * 2;
  const trunk = Array.from({ length: segs }, (_, i) => {
    const t = (i + 0.5) / segs;
    return [Math.sin(t * 1.2) * lean * h * 0.25, t * h];
  });
  const tip = [Math.sin(1.2) * lean * h * 0.25, h];
  return (
    <group position={[x, 0, z]} rotation-y={yaw}>
      {trunk.map(([dx, y], i) => (
        <mesh key={i} position={[dx, y, 0]} rotation-z={-lean * 0.35}>
          <cylinderGeometry args={[0.16 - i * 0.012, 0.19 - i * 0.012, h / segs + 0.02, 7]} />
          <Toon color={i % 2 ? '#8a6848' : '#7a5a3e'} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[tip[0], tip[1], 0]} rotation-y={(i / 8) * Math.PI * 2 + r() * 0.3}>
          <Box size={[1.9, 0.05, 0.42]} position={[0.85, -0.28, 0]} rotation={[0, 0, -0.42 - r() * 0.25]}>
            <Toon color={i % 2 ? '#2f8a4a' : '#3aa05a'} />
          </Box>
        </group>
      ))}
      <mesh position={[tip[0], tip[1] - 0.1, 0]}>
        <sphereGeometry args={[0.28, 8, 6]} />
        <Toon color="#5a4a2a" />
      </mesh>
    </group>
  );
}

function Cactus({ x, z, h = 3, seed = 1 }) {
  const r = rng(seed);
  const arms = [
    [1, 0.45 + r() * 0.2, 0.8 + r() * 0.5],
    [-1, 0.3 + r() * 0.2, 0.6 + r() * 0.5],
  ];
  const col = '#4f7a3a';
  return (
    <group position={[x, 0, z]} rotation-y={r() * Math.PI}>
      <mesh position-y={h / 2}>
        <cylinderGeometry args={[0.22, 0.26, h, 8]} />
        <Toon color={col} />
      </mesh>
      <mesh position-y={h}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <Toon color={col} />
      </mesh>
      {arms.map(([s, at, len], i) => (
        <group key={i} position={[s * 0.4, h * at, 0]}>
          <Box size={[0.5, 0.26, 0.26]} position={[-s * 0.1, 0, 0]}>
            <Toon color={col} />
          </Box>
          <mesh position={[s * 0.1, len / 2, 0]}>
            <cylinderGeometry args={[0.14, 0.15, len, 7]} />
            <Toon color={col} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mesa({ x, z, r, h, color }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={h / 2}>
        <cylinderGeometry args={[r * 0.8, r, h, 7]} />
        <Toon color={color} />
      </mesh>
      <mesh position-y={h * 0.35}>
        <cylinderGeometry args={[r * 1.02, r * 1.12, h * 0.12, 7]} />
        <Toon color="#c9784a" />
      </mesh>
    </group>
  );
}

// Buildings in a band along both sides of the road (|z| from zMin to zMax).
function cityBlock({ seed, count, xSpan, zMin, zMax, hMin, hMax, sides = [1, -1] }) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const side = sides[i % sides.length];
    const w = 4 + r() * 5;
    const d = 4 + r() * 5;
    out.push({ x: -xSpan + r() * xSpan * 2, z: side * (zMin + r() * (zMax - zMin) + d / 2), w, d, h: hMin + r() * (hMax - hMin) });
  }
  return out;
}

function NightStreet() {
  const sky = useMemo(
    () => skyTexture({ stops: [[0, '#04030c'], [0.7, '#120a2e'], [1, '#2a1650']], ground: '#0c0a14', stars: true }),
    []
  );
  const buildings = useMemo(() => cityBlock({ seed: 3, count: 28, xSpan: 45, zMin: 9, zMax: 13, hMin: 5, hMax: 18 }), []);
  const palette = useMemo(() => ({ wall: '#16142a', lit: '#ffd27a', dark: '#22203a', roof: '#0e0c1c', ratio: 0.35 }), []);
  const lamps = [];
  for (let x = -40; x <= 40; x += 10) lamps.push(x);
  return (
    <>
      <Sky texture={sky} />
      <fog attach="fog" args={['#1a1035', 16, 70]} />
      <ambientLight intensity={0.5} color="#9a9aff" />
      <directionalLight position={[6, 8, 6]} intensity={1.6} color="#c8c8ff" />
      <pointLight position={[0, 4.5, 3.4]} intensity={18} distance={12} color="#ffcf80" />
      <pointLight position={[-4, 3, -4]} intensity={10} distance={10} color="#ff2e88" />
      <Ground color="#141220" />
      <Road center={0} width={9} lines={[[-4.3, '#e8e8e8'], [4.3, '#e8e8e8'], [-1.6, '#e8e8e8', true], [1.6, '#e8e8e8', true]]} />
      {/* start line */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[3.3 + (i % 2) * 0.5, 0.005, -4.25 + i * 0.5]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#f4f4f4" />
        </mesh>
      ))}
      {/* sidewalks */}
      {[1, -1].map((s) => (
        <Box key={s} size={[140, 0.15, 4]} position={[0, 0.075, s * 6.5]}>
          <Toon color="#2a2838" />
        </Box>
      ))}
      {lamps.map((x) => [1, -1].map((s) => <StreetLamp key={`${x}${s}`} x={x + (s > 0 ? 5 : 0)} z={s * 5.2} side={-s} />))}
      <Buildings items={buildings} palette={palette} />
      {/* neon signs on the nearest storefronts */}
      {[[-6, -8.9, '#ff2e88'], [8, -8.9, '#00e5ff'], [-14, 8.9, '#b6ff00'], [4, 8.9, '#ff2e88']].map(([x, z, c]) => (
        <Box key={x} size={[3, 0.35, 0.08]} position={[x, 3.4, z]}>
          <Glow color={c} />
        </Box>
      ))}
    </>
  );
}

function DesertStreet() {
  const sky = useMemo(
    () =>
      skyTexture({
        stops: [[0, '#1f6fd0'], [0.75, '#86c4f0'], [1, '#f2e6c8']],
        ground: '#d7ab72',
        sun: { y: 120, r: 22, top: '#ffffff', bottom: '#fff4c0', glow: 'rgba(255,250,220,0.55)' },
      }),
    []
  );
  const r = useMemo(() => rng(11), []);
  const props = useMemo(() => {
    const mesas = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + r() * 0.4;
      const d = 45 + r() * 25;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, r: 5 + r() * 7, h: 6 + r() * 10 };
    });
    const cacti = Array.from({ length: 22 }, (_, i) => ({
      x: -40 + r() * 80,
      z: (i % 2 ? 1 : -1) * (8 + r() * 18),
      h: 2.2 + r() * 2,
      seed: i + 1,
    }));
    return { mesas, cacti };
  }, [r]);
  const poles = [];
  for (let x = -45; x <= 45; x += 12) poles.push(x);
  return (
    <>
      <Sky texture={sky} />
      <fog attach="fog" args={['#ecdcb8', 28, 90]} />
      <ambientLight intensity={1.0} color="#fff0d8" />
      <directionalLight position={[-6, 10, -4]} intensity={2.4} color="#fff4d6" />
      <directionalLight position={[6, 4, 6]} intensity={1.2} color="#ffffff" />
      <Ground color="#d9ae74" />
      <Road center={1.9} width={7.6} color="#3a3940" lines={[[-1.75, '#f0f0f0'], [5.55, '#f0f0f0'], [1.8, '#ffc400'], [2.0, '#ffc400']]} />
      {/* sandy shoulders */}
      {[1, -1].map((s) => (
        <mesh key={s} rotation-x={-Math.PI / 2} position={[0, 0.001, 1.9 + s * 4.6]}>
          <planeGeometry args={[140, 1.6]} />
          <meshBasicMaterial color="#c99a62" />
        </mesh>
      ))}
      {props.mesas.map((m, i) => (
        <Mesa key={i} {...m} color={i % 2 ? '#b3603c' : '#a4532f'} />
      ))}
      {props.cacti.map((c, i) => (
        <Cactus key={i} {...c} />
      ))}
      {/* telephone poles */}
      {poles.map((x) => (
        <group key={x} position={[x, 0, -4]}>
          <mesh position-y={3.5}>
            <cylinderGeometry args={[0.1, 0.12, 7, 6]} />
            <Toon color="#6a4a32" />
          </mesh>
          <Box size={[0.1, 0.1, 1.6]} position={[0, 6.6, 0]}>
            <Toon color="#6a4a32" />
          </Box>
        </group>
      ))}
    </>
  );
}

function CityDusk() {
  const sky = useMemo(
    () =>
      skyTexture({
        stops: [[0, '#241650'], [0.45, '#6a3088'], [0.8, '#ff6a5a'], [1, '#ffbf6a']],
        ground: '#2a2232',
        sun: { y: 246, r: 34, top: '#ffd27a', bottom: '#ff7a3a', glow: 'rgba(255,140,80,0.5)' },
      }),
    []
  );
  const near = useMemo(() => cityBlock({ seed: 21, count: 16, xSpan: 45, zMin: 9, zMax: 12, hMin: 8, hMax: 22, sides: [1] }), []);
  const skyline = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 80 }, () => {
      const a = r() * Math.PI * 2;
      const d = 34 + r() * 26;
      const w = 5 + r() * 7;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, w, d: w, h: 20 + r() * 45 };
    }).filter((b) => Math.abs(b.z) > 9);
  }, []);
  const nearPalette = useMemo(() => ({ wall: '#3a2c48', lit: '#ffd890', dark: '#5a4a70', roof: '#241a30', ratio: 0.3 }), []);
  const farPalette = useMemo(() => ({ wall: '#4a3460', lit: '#ffe0a0', dark: '#6a5288', roof: '#2a1e3a', ratio: 0.22 }), []);
  const lamps = [];
  for (let x = -40; x <= 40; x += 12) lamps.push(x);
  return (
    <>
      <Sky texture={sky} />
      <fog attach="fog" args={['#c06a78', 30, 115]} />
      <ambientLight intensity={0.75} color="#ffc0b0" />
      <directionalLight position={[6, 7, 6]} intensity={2.0} color="#ffd8c0" />
      <directionalLight position={[-8, 3, -8]} intensity={1.6} color="#ff8a5a" />
      <Ground color="#2e2636" />
      <Road center={0} width={9} color="#34303c" lines={[[-4.3, '#e8e0d8'], [4.3, '#e8e0d8'], [0, '#ffc400', true]]} />
      {[1, -1].map((s) => (
        <Box key={s} size={[140, 0.15, 4]} position={[0, 0.075, s * 6.5]}>
          <Toon color="#4a4252" />
        </Box>
      ))}
      {lamps.map((x) => [1, -1].map((s) => <StreetLamp key={`${x}${s}`} x={x} z={s * 5.2} side={-s} pool={false} />))}
      <Buildings items={near} palette={nearPalette} />
      <Buildings items={skyline} palette={farPalette} />
    </>
  );
}

function MiamiHighway() {
  const sky = useMemo(
    () =>
      skyTexture({
        stops: [[0, '#1b1450'], [0.45, '#7a2a8e'], [0.78, '#ff3c8e'], [1, '#ffb26a']],
        ground: '#16a9b8',
        sun: { y: 222, r: 58, top: '#ffe66a', bottom: '#ff3c8e', glow: 'rgba(255,90,150,0.45)', stripes: true },
      }),
    []
  );
  const palms = useMemo(() => {
    const r = rng(5);
    const out = [];
    for (let x = -42; x <= 42; x += 7) {
      out.push({ x: x + r() * 2, z: 7.4 + r() * 1.5, h: 5.5 + r() * 2.5, lean: 0.2 + r() * 0.4, seed: out.length + 1 });
      out.push({ x: x + 3.5 + r() * 2, z: -7.6 - r() * 1.2, h: 5 + r() * 2.5, lean: 0.25 + r() * 0.4, seed: out.length + 1 });
    }
    return out;
  }, []);
  const posts = [];
  for (let x = -60; x <= 60; x += 2.5) posts.push(x);
  return (
    <>
      <Sky texture={sky} />
      <fog attach="fog" args={['#ff8aa8', 30, 92]} />
      <ambientLight intensity={0.8} color="#ffc8e0" />
      <directionalLight position={[6, 8, 6]} intensity={2.2} color="#ffe0c8" />
      <directionalLight position={[-8, 3, -8]} intensity={1.6} color="#ff3c8e" />
      {/* ocean on the -z side, beach and grass on the +z side */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -52]}>
        <planeGeometry args={[190, 90]} />
        <meshBasicMaterial color="#13b2c0" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -6]}>
        <planeGeometry args={[190, 5]} />
        <meshBasicMaterial color="#f0d49a" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 48]}>
        <planeGeometry args={[190, 92]} />
        <meshBasicMaterial color="#3f9a5a" />
      </mesh>
      <Road center={1.9} width={11.4} color="#3a3444" lines={[[-1.75, '#f4f4f4'], [7.45, '#f4f4f4'], [1.9, '#f4f4f4', true], [5.0, '#f4f4f4', true]]} />
      {/* guardrail along the water */}
      {posts.map((x) => (
        <Box key={x} size={[0.1, 0.6, 0.1]} position={[x, 0.3, -4.3]}>
          <Toon color="#c8ccd6" />
        </Box>
      ))}
      <Box size={[140, 0.16, 0.06]} position={[0, 0.52, -4.36]}>
        <Toon color="#e0e4ec" />
      </Box>
      {palms.map((p, i) => (
        <Palm key={i} {...p} />
      ))}
    </>
  );
}

const SCENERY = { night: NightStreet, desert: DesertStreet, city: CityDusk, miami: MiamiHighway };

export default function Scenery({ id }) {
  const Scene = SCENERY[id];
  return Scene ? <Scene /> : null;
}
