import { Toon } from './materials.jsx';

const TIRE = '#1c1c22';
const DARK = '#2a2a33';

function Spokes({ count, length, thick, at, color, twist = 0, offset = 0 }) {
  return Array.from({ length: count }, (_, i) => {
    const a = offset + (i / count) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * at, Math.sin(a) * at, 0.014]} rotation-z={a + twist}>
        <boxGeometry args={[length, thick, 0.02]} />
        <Toon color={color} />
      </mesh>
    );
  });
}

function Disk({ r, color, z = 0.004, seg = 24 }) {
  return (
    <mesh position-z={z}>
      <circleGeometry args={[r, seg]} />
      <Toon color={color} />
    </mesh>
  );
}

function Ring({ inner, outer, color, z = 0.01 }) {
  return (
    <mesh position-z={z}>
      <ringGeometry args={[inner, outer, 24]} />
      <Toon color={color} />
    </mesh>
  );
}

function Holes({ count, r, at, color }) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * at, Math.sin(a) * at, 0.012]}>
        <circleGeometry args={[r, 12]} />
        <Toon color={color} />
      </mesh>
    );
  });
}

// Face decoration, drawn in the XY plane facing +z.
function Face({ style, rim, R }) {
  switch (style) {
    case 'fivespoke':
      return (
        <>
          <Disk r={R * 0.66} color={DARK} />
          <Ring inner={R * 0.56} outer={R * 0.68} color={rim} />
          <Spokes count={5} length={R * 0.5} thick={R * 0.16} at={R * 0.3} color={rim} />
        </>
      );
    case 'mesh':
      return (
        <>
          <Disk r={R * 0.66} color={DARK} />
          <Ring inner={R * 0.58} outer={R * 0.7} color={rim} />
          <Spokes count={10} length={R * 0.55} thick={R * 0.05} at={R * 0.3} color={rim} twist={0.35} />
          <Spokes count={10} length={R * 0.55} thick={R * 0.05} at={R * 0.3} color={rim} twist={-0.35} />
        </>
      );
    case 'deepdish':
      return (
        <>
          <Disk r={R * 0.5} color={DARK} z={-0.02} />
          <Ring inner={R * 0.48} outer={R * 0.78} color={rim} />
          <Spokes count={4} length={R * 0.4} thick={R * 0.12} at={R * 0.22} color={rim} offset={Math.PI / 4} />
        </>
      );
    case 'turbofan':
      return (
        <>
          <Disk r={R * 0.72} color={rim} />
          <Spokes count={8} length={R * 0.36} thick={R * 0.07} at={R * 0.42} color={DARK} twist={0.6} />
        </>
      );
    case 'rally':
      return (
        <>
          <Disk r={R * 0.7} color={rim} />
          <Holes count={6} r={R * 0.1} at={R * 0.44} color={DARK} />
        </>
      );
    case 'steel':
    default:
      return (
        <>
          <Disk r={R * 0.64} color={rim} />
          <Ring inner={R * 0.38} outer={R * 0.46} color={DARK} />
          <Holes count={4} r={R * 0.05} at={R * 0.24} color={DARK} />
        </>
      );
  }
}

// side = +1 when the wheel's outer face points toward +z, -1 toward -z.
export default function Wheel({ position, side, style, rim, R, tw }) {
  return (
    <group position={position}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[R, R, tw, 28]} />
        <Toon color={TIRE} />
      </mesh>
      <group position-z={side * (tw / 2 + 0.002)} rotation-y={side < 0 ? Math.PI : 0}>
        <Face style={style} rim={rim} R={R} />
        <mesh position-z={0.02}>
          <circleGeometry args={[R * 0.12, 12]} />
          <Toon color={style === 'turbofan' ? DARK : rim} />
        </mesh>
      </group>
    </group>
  );
}
