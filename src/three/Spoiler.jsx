import { useMemo } from 'react';
import { Toon, extrudeProfile } from './materials.jsx';

const DARK = '#24242e';

function Box({ size, position, rotation, color }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <Toon color={color} />
    </mesh>
  );
}

// Wing plane with endplates, centered at `at`.
function Wing({ at, W, color, chord = 0.36 }) {
  const [x, y] = at;
  return (
    <>
      <Box size={[chord, 0.04, W]} position={[x, y, 0]} rotation={[0, 0, 0.1]} color={color} />
      <Box size={[chord + 0.06, 0.16, 0.03]} position={[x, y, W / 2]} color={DARK} />
      <Box size={[chord + 0.06, 0.16, 0.03]} position={[x, y, -W / 2]} color={DARK} />
    </>
  );
}

// Drawn in body-local coordinates (the body group already applies ground clearance).
export default function Spoiler({ style, color, geo }) {
  const { L, W, H, tail, cab, wb, R, lift } = geo;
  const rearTop = -L / 2 + tail;
  const ax = -L / 2 + 0.24;

  const duck = useMemo(() => {
    const len = Math.max(0.25, Math.min(0.5, cab.rear - rearTop));
    return extrudeProfile([[rearTop, H], [rearTop + len, H], [rearTop, H + 0.14]], W * 0.94);
  }, [rearTop, H, W, cab.rear]);

  switch (style) {
    case 'ducktail':
      return (
        <mesh geometry={duck}>
          <Toon color={color} />
        </mesh>
      );
    case 'gt':
      return (
        <>
          <Box size={[0.07, 0.34, 0.06]} position={[ax, H + 0.17, W * 0.3]} color={DARK} />
          <Box size={[0.07, 0.34, 0.06]} position={[ax, H + 0.17, -W * 0.3]} color={DARK} />
          <Wing at={[ax - 0.02, H + 0.36]} W={W * 1.02} color={color} />
        </>
      );
    case 'swan':
      return (
        <>
          {[1, -1].map((s) => (
            <group key={s}>
              <Box size={[0.06, 0.48, 0.05]} position={[ax - 0.12, H + 0.24, s * W * 0.28]} rotation={[0, 0, -0.15]} color={DARK} />
              <Box size={[0.2, 0.05, 0.05]} position={[ax - 0.08, H + 0.48, s * W * 0.28]} color={DARK} />
            </group>
          ))}
          <Wing at={[ax - 0.04, H + 0.41]} W={W * 1.04} color={color} chord={0.32} />
        </>
      );
    case 'rally': {
      // Roof spoiler (trunk lip on a convertible) plus mud flaps behind each wheel.
      const roofX = cab.rear + cab.rr;
      const roofY = H + cab.h;
      const flapX = -wb / 2 - R - 0.04;
      const flapY = R - lift - 0.06;
      return (
        <>
          {geo.open ? (
            <Box size={[0.24, 0.05, W * 0.9]} position={[rearTop + 0.1, H + 0.06, 0]} rotation={[0, 0, 0.25]} color={color} />
          ) : (
            <Box size={[0.34, 0.04, W * 0.88]} position={[roofX - 0.1, roofY + 0.07, 0]} rotation={[0, 0, 0.18]} color={color} />
          )}
          {[1, -1].map((s) => (
            <Box key={s} size={[0.03, 0.26, 0.22]} position={[flapX, flapY, s * (W / 2 - 0.14)]} color="#ff2e88" />
          ))}
          {[1, -1].map((s) => (
            <Box key={`f${s}`} size={[0.03, 0.26, 0.22]} position={[wb / 2 - R - 0.04, flapY, s * (W / 2 - 0.14)]} color="#ff2e88" />
          ))}
        </>
      );
    }
    default:
      return null;
  }
}
