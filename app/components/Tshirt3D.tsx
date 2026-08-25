'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Bounds } from '@react-three/drei';

function TshirtModel() {
  // Folder public/models/tshirt/ must contain scene.gltf, scene.bin, and textures/
  const { scene } = useGLTF('/models/tshirt/scene.gltf');

  return <primitive object={scene} />;
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.8, 0.1]} />
      <meshStandardMaterial color="#333333" wireframe />
    </mesh>
  );
}

export default function Tshirt3D() {
  return (
    <div className="relative h-[520px] w-[420px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-3, -2, -5]} intensity={0.3} />

        <Suspense fallback={<Loader />}>
          {/* Bounds auto-fits the camera to whatever size the model actually is,
              so we don't have to guess a scale number */}
          <Bounds fit clip observe margin={0.9}>
            <TshirtModel />
          </Bounds>
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={2.2}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
    </div>
  );
}

// Preload for snappier first paint
useGLTF.preload('/models/tshirt/scene.gltf');