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

// `shape` is the body built in CarModel: `top(x)` is the body's height at x,
// `widthAt(x)` its width, `axles` the front and rear axle positions.
export default function Spoiler({ style, color, geo, shape }) {
  const { L, W, R, lift, cabin } = geo;
  const { top, widthAt, axles, archR } = shape;
  const ax = -L / 2 + 0.26;
  const deckY = top(ax);
  const ww = widthAt(ax);

  const duck = useMemo(() => {
    const x0 = -L / 2 + 0.04;
    const len = Math.max(0.25, Math.min(0.5, cabin.rear - x0 - 0.05));
    return extrudeProfile([[x0, top(x0) - 0.02], [x0 + len, top(x0 + len) - 0.02], [x0, top(x0) + 0.13]], widthAt(x0) * 0.94);
  }, [L, cabin.rear, top, widthAt]);

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
          <Box size={[0.07, 0.34, 0.06]} position={[ax, deckY + 0.17, ww * 0.3]} color={DARK} />
          <Box size={[0.07, 0.34, 0.06]} position={[ax, deckY + 0.17, -ww * 0.3]} color={DARK} />
          <Wing at={[ax - 0.02, deckY + 0.36]} W={ww * 1.0} color={color} />
        </>
      );
    case 'swan':
      return (
        <>
          {[1, -1].map((s) => (
            <group key={s}>
              <Box size={[0.06, 0.48, 0.05]} position={[ax - 0.12, deckY + 0.24, s * ww * 0.28]} rotation={[0, 0, -0.15]} color={DARK} />
              <Box size={[0.2, 0.05, 0.05]} position={[ax - 0.08, deckY + 0.48, s * ww * 0.28]} color={DARK} />
            </group>
          ))}
          <Wing at={[ax - 0.04, deckY + 0.41]} W={ww * 1.02} color={color} chord={0.32} />
        </>
      );
    case 'rally': {
      // Roof spoiler (trunk lip on a convertible) plus mud flaps behind each wheel.
      const flapY = R - 0.06;
      const flapZ = (x) => widthAt(x) / 2 - 0.14;
      const roofEnd = geo.open ? null : cabin.roof[cabin.roof.length - 1];
      return (
        <>
          {roofEnd ? (
            <Box size={[0.34, 0.04, W * 0.8]} position={[roofEnd[0] - 0.08, roofEnd[1] + 0.07, 0]} rotation={[0, 0, 0.18]} color={color} />
          ) : (
            <Box size={[0.24, 0.05, ww * 0.9]} position={[-L / 2 + 0.14, top(-L / 2 + 0.14) + 0.06, 0]} rotation={[0, 0, 0.25]} color={color} />
          )}
          {axles.flatMap((x) =>
            [1, -1].map((s) => {
              const fx = x - archR - 0.02;
              return <Box key={`${x}${s}`} size={[0.03, 0.26, 0.22]} position={[fx, Math.max(lift + 0.13, flapY), s * flapZ(fx)]} color="#ff2e88" />;
            })
          )}
        </>
      );
    }
    default:
      return null;
  }
}
