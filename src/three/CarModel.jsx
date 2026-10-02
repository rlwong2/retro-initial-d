import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, WHEELS, byId } from '../data/options.js';
import { Toon, Glow, extrudeProfile, roundedOutline } from './materials.jsx';
import Wheel from './Wheel.jsx';
import Spoiler from './Spoiler.jsx';

const GLASS = '#1b2a4a';
const TRIM = '#202028';
const CHROME = '#d8dde6';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Highest point of a polyline where it crosses the vertical line at `x`.
function sampleTop(poly, x) {
  let best = -Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[i + 1];
    if (x1 === x2 || (x - x1) * (x - x2) > 0) continue;
    best = Math.max(best, y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
  }
  return best === -Infinity ? 0 : best;
}

// Works out every surface the details hang off: the body outline (side trace
// plus a bottom edge with wheel arches), the greenhouse, and helpers that give
// the body's height and width at any point along its length.
function buildShape(g) {
  const { L, W, R, wb, axle, lift, cabin } = g;
  const axles = [axle, axle - wb];
  const archR = R + 0.05;
  const side = roundedOutline(g.side);
  const top = (x) => sampleTop(side, x);

  const bottom = [];
  for (const ax of [...axles].reverse()) {
    bottom.push([ax - archR, lift]);
    for (let i = 0; i <= 12; i++) {
      const t = Math.PI - (i / 12) * Math.PI;
      bottom.push([ax + archR * Math.cos(t), Math.max(lift, R + archR * Math.sin(t))]);
    }
    bottom.push([ax + archR, lift]);
  }
  const outline = [...side, [-L / 2 + 0.08, lift], ...bottom, [L / 2 - 0.08, lift]];

  const beltY = top((cabin.front + cabin.rear) / 2);
  const taperF = g.taperF ?? 0.1;
  const taperR = g.taperR ?? 0.08;
  // Plan-view taper toward the nose and tail, plus a slight tuck above the belt.
  const plan = (x, y) => {
    const u = x / (L / 2);
    return (1 - (u > 0 ? taperF : taperR) * u * u) * (1 - 0.05 * clamp01((y - lift) / (beltY - lift)));
  };
  const widthAt = (x, y = lift) => W * plan(x, y);

  return { axles, archR, side, top, outline, beltY, plan, widthAt };
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
  const { L, W, R, lift, cabin } = g;
  const color = byId(COLORS, config.color);
  const paint = color.hex;
  const wheel = byId(WHEELS, config.wheel);

  const s = useMemo(() => {
    const shape = buildShape(g);
    const { top, outline, plan, beltY } = shape;

    // Greenhouse: base sunk slightly into the body, then windshield top and roof points.
    const housePts = g.open
      ? [[cabin.front, top(cabin.front) - 0.03], [cabin.front - 0.07, top(cabin.front) - 0.03], [cabin.ws[0] - 0.07, cabin.ws[1], 0.03], [...cabin.ws, 0.03]]
      : [[cabin.rear, top(cabin.rear) - 0.03], [cabin.front, top(cabin.front) - 0.03], [...cabin.ws, 0.12], ...cabin.roof.map((p) => [...p, 0.16])];
    const house = roundedOutline(housePts);
    const baseY = Math.min(top(cabin.front), top(cabin.rear ?? cabin.front));
    const roofY = Math.max(...housePts.map((p) => p[1]));
    const midX = g.open ? cabin.front : (cabin.front + cabin.rear) / 2;
    const halfRun = g.open ? 1 : (cabin.front - cabin.rear) / 2;
    // Tumblehome: the greenhouse narrows toward the roof and toward its ends.
    const tumble = (x, y) => (1 - (g.tumble ?? 0.16) * clamp01((y - baseY) / (roofY - baseY))) * (1 - (g.tumbleEnds ?? 0.06) * Math.pow((x - midX) / halfRun, 2));
    const houseW = W * (g.open ? 0.82 : 0.86);

    // Closed cars: a painted greenhouse with glass laid into it, so the
    // A-, B- and C-pillars and the roof read as body panels.
    const glass = [];
    if (!g.open) {
      const houseTop = (x) => sampleTop([...house, house[0]], x);
      const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      const lastRoof = cabin.roof[cabin.roof.length - 1];
      // Windshield and rear glass: wedges whose sloped face sits just proud of the greenhouse.
      const fBase = [cabin.front, top(cabin.front) - 0.01];
      const fTop = lerp(fBase, cabin.ws, 0.88);
      glass.push(extrudeProfile([fBase, fTop, [fTop[0], fBase[1]]].map(([x, y]) => [x + 0.014, y]), houseW * 0.84, tumble));
      const rBase = [cabin.rear, top(cabin.rear) - 0.01];
      const rTop = lerp(rBase, lastRoof, 0.86);
      glass.push(extrudeProfile([rBase, [rTop[0], rBase[1]], rTop].map(([x, y]) => [x - 0.014, y]), houseW * 0.8, tumble));

      // Side windows, split at the B-pillar, following the greenhouse's sides.
      const window = (x0, x1) => {
        const xs = Array.from({ length: 24 }, (_, i) => x0 + ((x1 - x0) * i) / 23);
        const lo = (x) => Math.max(top(x), baseY) + 0.04;
        const valid = xs.filter((x) => houseTop(x) - 0.05 - lo(x) > 0.05);
        if (valid.length < 2) return;
        const pts = [...valid.map((x) => [x, lo(x)]), ...valid.reverse().map((x) => [x, houseTop(x) - 0.05])];
        for (const side of [1, -1]) {
          const geo = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
          const pos = geo.attributes.position;
          for (let i = 0; i < pos.count; i++) pos.setZ(i, side * ((houseW / 2) * tumble(pos.getX(i), pos.getY(i)) + 0.004));
          geo.computeVertexNormals();
          glass.push(geo);
        }
      };
      window(cabin.rear + 0.04, cabin.b - 0.04);
      window(cabin.b + 0.04, cabin.front - 0.02);
    }

    let hoodPanel = null;
    if (g.hoodColor) {
      const x0 = L / 2 - (g.hoodStart ?? 0.25);
      const x1 = cabin.front - 0.05;
      const xs = Array.from({ length: 9 }, (_, i) => x0 + ((x1 - x0) * i) / 8);
      const pts = [...xs.map((x) => [x, top(x) + 0.006]), ...xs.reverse().map((x) => [x, top(x) + 0.026])];
      hoodPanel = extrudeProfile(pts, W * 0.72, plan);
    }

    const cut = lift + 0.45 * (beltY - lift);
    return {
      ...shape,
      body: extrudeProfile(outline, W, plan),
      // Same outline clamped below the two-tone line, a hair wider so it shows on the sides.
      lower: extrudeProfile(outline.map(([x, y]) => [x, Math.min(y, cut)]), W + 0.012, plan),
      house: extrudeProfile(house, houseW, tumble),
      glass,
      hoodPanel,
    };
  }, [car.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { top, widthAt, axles, archR } = s;
  const first = g.side[0];
  const last = g.side[g.side.length - 1];
  // Front and rear faces, as heights between their bottom and top edges.
  const fb = first[1];
  const ft = top(L / 2 - 0.06);
  const fy = (t) => fb + (ft - fb) * t;
  const rb = last[1];
  const rt = top(-L / 2 + 0.06);
  const ry = (t) => rb + (rt - rb) * t;
  const fw = widthAt(L / 2);
  const rw = widthAt(-L / 2);
  const fx = L / 2;
  const rx = -L / 2;

  const popupX = L / 2 - (g.popupAt ?? 0.5);
  const popupY = top(popupX);
  const mirrorX = cabin.front + (cabin.ws[0] - cabin.front) * 0.3;
  const bumperH = g.paintedBumper ? 0.26 : g.bumperH ?? 0.14;

  const wheels = axles.flatMap((x) => {
    const wz = widthAt(x) / 2 - g.tw / 2 - 0.01;
    return [
      [x, wz, 1],
      [x, -wz, -1],
    ];
  });

  return (
    <group>
      {/* soft shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <planeGeometry args={[L * 1.05, W * 1.1]} />
        <meshBasicMaterial color="#07060f" transparent opacity={0.7} />
      </mesh>

      <mesh geometry={s.body}>
        <Toon color={paint} />
      </mesh>
      {s.hoodPanel && (
        <mesh geometry={s.hoodPanel}>
          <Toon color={g.hoodColor} />
        </mesh>
      )}
      {color.lower && (
        <mesh geometry={s.lower}>
          <Toon color={color.lower} />
        </mesh>
      )}
      <mesh geometry={s.house}>
        <Toon color={g.open ? GLASS : paint} />
      </mesh>
      {s.glass.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <Toon color={GLASS} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {g.open && (
        <>
          <Box size={[cabin.front - cabin.rear, 0.02, W * 0.78]} position={[(cabin.front + cabin.rear) / 2, top(cabin.rear) + 0.005, 0]}>
            <Toon color={TRIM} />
          </Box>
          {[1, -1].map((side) => {
            const y = top(cabin.rear + 0.15);
            return (
              <group key={side}>
                <Box size={[0.12, 0.34, 0.4]} position={[cabin.rear + 0.2, y + 0.15, side * W * 0.2]} rotation={[0, 0, 0.12]}>
                  <Toon color="#3a2a4a" />
                </Box>
                {/* roll hoop */}
                {[0.18, -0.18].map((dz) => (
                  <Box key={dz} size={[0.05, 0.38, 0.05]} position={[cabin.rear + 0.04, y + 0.17, side * W * 0.2 + dz]}>
                    <Toon color={CHROME} />
                  </Box>
                ))}
                <Box size={[0.05, 0.05, 0.41]} position={[cabin.rear + 0.04, y + 0.36, side * W * 0.2]}>
                  <Toon color={CHROME} />
                </Box>
              </group>
            );
          })}
        </>
      )}

      {/* bumpers */}
      <Box size={[0.08, bumperH, fw + 0.02]} position={[fx - 0.03, fb + bumperH / 2, 0]}>
        <Toon color={g.paintedBumper ? paint : TRIM} />
      </Box>
      {g.paintedBumper && (
        <>
          <Box size={[0.1, 0.12, W * 0.5]} position={[fx - 0.02, fb + 0.1, 0]}>
            <Glow color="#0c0c12" />
          </Box>
          {[1, -1].map((side) => (
            <Box key={`fg${side}`} size={[0.1, 0.07, W * 0.14]} position={[fx - 0.03, fb + 0.1, side * fw * 0.38]}>
              <Glow color="#0c0c12" />
            </Box>
          ))}
        </>
      )}
      <Box size={[0.08, 0.14, rw + 0.02]} position={[rx + 0.03, rb + 0.08, 0]}>
        <Toon color={TRIM} />
      </Box>

      {/* side skirts */}
      {[1, -1].map((side) => {
        const x0 = axles[1] + archR + 0.04;
        const x1 = axles[0] - archR - 0.04;
        return (
          <Box key={`sk${side}`} size={[x1 - x0, 0.07, 0.05]} position={[(x0 + x1) / 2, lift + 0.035, side * (widthAt(0) / 2 + 0.005)]}>
            <Toon color={TRIM} />
          </Box>
        );
      })}
      {/* fender flares */}
      {g.flares &&
        [1, -1].flatMap((side) =>
          axles.map((x) => (
            <Box key={`fl${side}${x}`} size={[archR * 2 + 0.2, 0.08, 0.08]} position={[x, R + archR - 0.06, side * (widthAt(x) / 2 + 0.02)]}>
              <Toon color={paint} />
            </Box>
          ))
        )}
      {/* mirrors */}
      {!g.open &&
        [1, -1].map((side) => (
          <Box key={`mi${side}`} size={[0.12, 0.09, 0.12]} position={[mirrorX, top(cabin.front) + 0.1, side * (widthAt(mirrorX) / 2 + 0.03)]}>
            <Toon color={g.mirrorDark ? TRIM : paint} />
          </Box>
        ))}
      {/* hood details */}
      {g.scoop && (
        <Box size={[0.5, 0.1, 0.5]} position={[cabin.front + 0.55, top(cabin.front + 0.55) + 0.04, 0]} rotation={[0, 0, -0.08]}>
          <Toon color={TRIM} />
        </Box>
      )}
      {g.vents &&
        [1, -1].map((side) => (
          <Box key={`vt${side}`} size={[0.35, 0.03, 0.18]} position={[cabin.front + 0.55, top(cabin.front + 0.55) + 0.01, side * W * 0.2]} rotation={[0, 0, -0.08]}>
            <Toon color={TRIM} />
          </Box>
        ))}
      {/* exhaust tips */}
      {(g.dualExhaust ? [0.28, -0.28] : [0.28]).map((zf) => (
        <mesh key={`ex${zf}`} position={[rx - 0.02, lift + 0.07, zf * W]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
          <Toon color={CHROME} />
        </mesh>
      ))}
      {/* front lip */}
      <Box size={[0.14, 0.04, fw * 0.96]} position={[fx - 0.02, fb - 0.01, 0]}>
        <Toon color={TRIM} />
      </Box>
      {/* grille */}
      <Box size={[0.02, (ft - fb) * 0.16, W * 0.4]} position={[fx + 0.005, fy(g.grilleAt ?? 0.6), 0]}>
        <Glow color="#0c0c12" />
      </Box>

      {/* headlights */}
      {g.wrapLights && (
        <>
          <Box size={[0.03, 0.05, fw * 0.66]} position={[fx + 0.008, fy(0.76), 0]}>
            <Toon color={TRIM} />
          </Box>
          {[1, -1].map((side) => (
            <Box key={`wl${side}`} size={[0.05, 0.08, fw * 0.26]} position={[fx - 0.02, fy(0.8), side * fw * 0.33]} rotation={[0, side * 0.18, 0]}>
              <Glow color="#e8f0ff" />
            </Box>
          ))}
        </>
      )}
      {!g.wrapLights &&
        [1, -1].map((side) =>
          g.popups ? (
            <group key={side}>
              <Box size={[0.03, 0.04, fw * 0.22]} position={[fx + 0.005, fy(0.75), side * fw * 0.32]}>
                <Glow color="#ffb000" />
              </Box>
              {g.popups === 'open' ? (
                <group position={[popupX, popupY, side * widthAt(popupX) * 0.3]} rotation={[0, 0, -0.35]}>
                  <Box size={[0.08, 0.2, W * 0.2]} position={[0, 0.1, 0]}>
                    <Toon color={TRIM} />
                  </Box>
                  <Box size={[0.02, 0.15, W * 0.17]} position={[0.045, 0.1, 0]}>
                    <Glow color="#fff6b0" />
                  </Box>
                </group>
              ) : (
                <Box size={[0.24, 0.03, W * 0.22]} position={[popupX, popupY + 0.01, side * widthAt(popupX) * 0.3]}>
                  <Toon color={TRIM} />
                </Box>
              )}
            </group>
          ) : (
            <Box key={side} size={[0.03, (ft - fb) * 0.2, fw * 0.24]} position={[fx + 0.005, fy(g.lightsAt ?? 0.8), side * fw * 0.3]}>
              <Glow color="#fff6b0" />
            </Box>
          )
        )}
      {/* taillights */}
      {g.tails === 'quad' ? (
        [-0.36, -0.2, 0.2, 0.36].map((zf) => (
          <mesh key={zf} position={[rx - 0.006, ry(0.72), zf * rw]} rotation-y={-Math.PI / 2}>
            <circleGeometry args={[0.065, 16]} />
            <Glow color="#ff1a3c" />
          </mesh>
        ))
      ) : (
        [1, -1].map((side) => (
          <Box key={side} size={[0.03, (rt - rb) * 0.18, rw * 0.3]} position={[rx - 0.005, ry(0.72), side * rw * 0.3]}>
            <Glow color="#ff1a3c" />
          </Box>
        ))
      )}

      {g.bed && (
        <>
          {/* open bed: dark floor inside the gate rails, plus the cab guard */}
          <Box size={[g.bed.front - rx - 0.1, 0.01, widthAt(0) - 0.1]} position={[(g.bed.front + rx) / 2, top(0) + 0.004, 0]}>
            <Toon color="#3a3a46" />
          </Box>
          {[1, -1].map((side) => (
            <Box key={`gt${side}`} size={[g.bed.front - rx - 0.02, 0.03, 0.04]} position={[(g.bed.front + rx) / 2, top(0) + 0.015, side * (widthAt(0) / 2 - 0.02)]}>
              <Toon color={paint} />
            </Box>
          ))}
          <Box size={[0.04, 0.03, widthAt(rx) - 0.04]} position={[rx + 0.03, top(0) + 0.015, 0]}>
            <Toon color={paint} />
          </Box>
          {/* gate hinge seams */}
          {[1, -1].flatMap((side) =>
            [0.33, 0.66].map((t) => (
              <Box key={`sm${side}${t}`} size={[0.015, top(0) - lift - 0.1, 0.01]} position={[rx + (g.bed.front - rx) * t, (top(0) + lift) / 2 + 0.03, side * (widthAt(0) / 2 + 0.003)]}>
                <Toon color={TRIM} />
              </Box>
            ))
          )}
          <group position={[g.bed.front - 0.06, top(0), 0]}>
            {[0.42, 0.14, -0.14, -0.42].map((zf) => (
              <Box key={zf} size={[0.035, 0.62, 0.035]} position={[0, 0.31, zf * W]}>
                <Toon color={TRIM} />
              </Box>
            ))}
            {[0.3, 0.62].map((y) => (
              <Box key={y} size={[0.04, 0.04, W * 0.88]} position={[0, y, 0]}>
                <Toon color={TRIM} />
              </Box>
            ))}
          </group>
        </>
      )}

      <Spoiler style={config.spoiler} color={paint} geo={g} shape={s} />

      {wheels.map(([x, z, side]) => (
        <Wheel key={`${x}${z}`} position={[x, R, z]} side={side} style={wheel.id} rim={wheel.rim} R={R} tw={g.tw} />
      ))}
    </group>
  );
}
