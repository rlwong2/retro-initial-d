import { useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import Scenery from './Scenes.jsx';

export const CAR_CENTER = [0, 0.55, 0];

// Renders at full device resolution with antialiasing; the retro look comes
// from the toon shading and the CRT styling around it.
export default function PixelCanvas({ pixel = 2, camera, onCreated, children, className = '' }) {
  return (
    <div className={`pixel-canvas ${className}`}>
      <Canvas
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={camera ?? { position: [5.6, 2.6, 5.6], fov: 32 }}
        onCreated={onCreated}
      >
        {children}
      </Canvas>
    </div>
  );
}

// Points the camera at the car's middle rather than the ground origin.
function LookAt({ target }) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => camera.lookAt(...target), [camera, target]);
  return null;
}

// `scene` picks a photo-mode backdrop (three/Scenes.jsx); the default is the neon garage.
export function Stage({ grid = true, target = CAR_CENTER, scene = 'garage' }) {
  if (scene !== 'garage') {
    return (
      <>
        <LookAt target={target} />
        <Scenery id={scene} />
      </>
    );
  }
  return (
    <>
      <LookAt target={target} />
      <color attach="background" args={['#120d26']} />
      <fog attach="fog" args={['#120d26', 9, 24]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 3]} intensity={3} />
      <directionalLight position={[-5, 3, -4]} intensity={1.4} color="#ff2e88" />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002}>
        <circleGeometry args={[3.4, 12]} />
        <meshBasicMaterial color="#1f1745" />
      </mesh>
      {grid && <gridHelper args={[48, 24, '#ff2e88', '#4a2a8a']} />}
    </>
  );
}
