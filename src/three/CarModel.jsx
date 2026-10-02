import { useMemo } from 'react';
import { COLORS, WHEELS, byId } from '../data/options.js';
import { Toon, Glow, extrudeProfile } from './materials.jsx';
import Wheel from './Wheel.jsx';
import Spoiler from './Spoiler.jsx';

const GLASS = '#1b2a4a';
const TRIM = '#202028';

// Side profile of the lower body, with wheel arches cut into the bottom edge.
function bodyProfile({ L, H, lift, R, wb, nose, tail }) {
  const f = L / 2;
  const r = -L / 2;
  const archR = R + 0.05;
  const cy = R - lift; // wheel center in body-local y
  const pts = [[r + 0.08, 0]];
  for (const wx of [-wb / 2, wb / 2]) {
    pts.push([wx - archR, 0]);
    for (let i = 0; i <= 4; i++) {
      const t = Math.PI - (i / 4) * Math.PI;
      pts.push([wx + archR * Math.cos(t), Math.max(0, cy + archR * Math.sin(t))]);
    }
    pts.push([wx + archR, 0]);
  }
  pts.push([f - 0.08, 0], [f, 0.12], [f, H * 0.55], [f - nose, H], [r + tail, H], [r, H * 0.7], [r, 0.12]);
  return pts;
}

function Box({ size, position, rotation, children }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      {children}
    </mesh>
  );
}

export default function CarModel({ car, config }) {
  const g = car.geo;
  const { L, W, H, cab } = g;
  const paint = byId(COLORS, config.color).hex;
  const wheel = byId(WHEELS, config.wheel);

  const geos = useMemo(() => {
    const roofFront = cab.front - cab.ws;
    const roofRear = cab.rear + cab.rr;
    const top = H + cab.h;
    return {
      body: extrudeProfile(bodyProfile(g), W),
      cabin: g.open
        ? extrudeProfile([[cab.front, H], [cab.front - 0.07, H], [roofFront - 0.07, top], [roofFront, top]], W * 0.82)
        : extrudeProfile([[cab.rear, H], [cab.front, H], [roofFront, top], [roofRear, top]], W * 0.84),
      roof: g.open
        ? null
        : extrudeProfile([[roofRear - 0.03, top], [roofFront + 0.03, top], [roofFront + 0.01, top + 0.06], [roofRear - 0.01, top + 0.06]], W * 0.86),
      pillarX: (roofRear + roofFront + cab.rear + cab.front) / 4,
    };
  }, [car.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const wz = W / 2 - g.tw / 2 - 0.03;
  const wheels = [
    [g.wb / 2, wz, 1],
    [g.wb / 2, -wz, -1],
    [-g.wb / 2, wz, 1],
    [-g.wb / 2, -wz, -1],
  ];

  return (
    <group>
      {/* soft shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <planeGeometry args={[L * 1.05, W * 1.1]} />
        <meshBasicMaterial color="#07060f" transparent opacity={0.7} />
      </mesh>

      <group position-y={g.lift}>
        <mesh geometry={geos.body}>
          <Toon color={paint} />
        </mesh>
        <mesh geometry={geos.cabin}>
          <Toon color={GLASS} />
        </mesh>
        {geos.roof && (
          <>
            <mesh geometry={geos.roof}>
              <Toon color={paint} />
            </mesh>
            <Box size={[0.08, cab.h, W * 0.85]} position={[geos.pillarX, H + cab.h / 2, 0]}>
              <Toon color={paint} />
            </Box>
          </>
        )}

        {g.open && (
          <>
            <Box size={[cab.front - cab.rear - 0.1, 0.02, W * 0.78]} position={[(cab.front + cab.rear) / 2 - 0.08, H + 0.005, 0]}>
              <Toon color={TRIM} />
            </Box>
            {[1, -1].map((s) => (
              <group key={s}>
                <Box size={[0.12, 0.34, 0.4]} position={[cab.rear + 0.15, H + 0.17, s * W * 0.2]} rotation={[0, 0, 0.12]}>
                  <Toon color="#3a2a4a" />
                </Box>
              </group>
            ))}
          </>
        )}

        {/* bumpers */}
        <Box size={[0.08, 0.14, W * 1.01]} position={[L / 2 - 0.02, 0.1, 0]}>
          <Toon color={TRIM} />
        </Box>
        <Box size={[0.08, 0.14, W * 1.01]} position={[-L / 2 + 0.02, 0.1, 0]}>
          <Toon color={TRIM} />
        </Box>
        {/* grille */}
        <Box size={[0.02, H * 0.18, W * 0.4]} position={[L / 2 + 0.005, H * 0.38, 0]}>
          <Glow color="#0c0c12" />
        </Box>

        {/* headlights */}
        {[1, -1].map((s) =>
          g.popups ? (
            <group key={s}>
              <Box size={[0.03, H * 0.08, W * 0.22]} position={[L / 2 + 0.005, H * 0.46, s * W * 0.32]}>
                <Glow color="#ffb000" />
              </Box>
              <Box size={[0.22, 0.1, W * 0.24]} position={[L / 2 - g.nose - 0.08, H + 0.03, s * W * 0.31]}>
                <Toon color={paint} />
              </Box>
              <Box size={[0.02, 0.07, W * 0.2]} position={[L / 2 - g.nose + 0.04, H + 0.03, s * W * 0.31]}>
                <Glow color="#fff6b0" />
              </Box>
            </group>
          ) : (
            <Box key={s} size={[0.03, H * 0.16, W * 0.24]} position={[L / 2 + 0.005, H * 0.44, s * W * 0.3]}>
              <Glow color="#fff6b0" />
            </Box>
          )
        )}
        {/* taillights */}
        {[1, -1].map((s) => (
          <Box key={s} size={[0.03, H * 0.16, W * 0.3]} position={[-L / 2 - 0.005, H * 0.5, s * W * 0.3]}>
            <Glow color="#ff1a3c" />
          </Box>
        ))}

        <Spoiler style={config.spoiler} color={paint} geo={g} />
      </group>

      {wheels.map(([x, z, side]) => (
        <Wheel key={`${x}${z}`} position={[x, g.R, z]} side={side} style={wheel.id} rim={wheel.rim} R={g.R} tw={g.tw} />
      ))}
    </group>
  );
}
