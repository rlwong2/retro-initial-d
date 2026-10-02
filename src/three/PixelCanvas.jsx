import { useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';

export const CAR_CENTER = [0, 0.55, 0];

// Renders at a fraction of the CSS size (dpr = 1 / pixel) with antialiasing
// off; CSS `image-rendering: pixelated` then upscales it into crisp blocks.
export default function PixelCanvas({ pixel = 4, camera, onCreated, children, className = '' }) {
  return (
    <div className={`pixel-canvas ${className}`}>
      <Canvas
        dpr={1 / pixel}
        flat
        gl={{ antialias: false, preserveDrawingBuffer: true }}
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

export function Stage({ grid = true, target = CAR_CENTER }) {
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
