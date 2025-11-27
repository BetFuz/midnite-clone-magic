import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, MeshReflectorMaterial, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

interface RouletteWheel3DProps {
  isSpinning: boolean;
  ballPosition: number;
  wheelSpeed: number;
  landedNumber: number | null;
}

function WheelMesh({ isSpinning, wheelSpeed }: { isSpinning: boolean; wheelSpeed: number }) {
  const wheelRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (wheelRef.current && isSpinning) {
      wheelRef.current.rotation.y += wheelSpeed * delta * 0.5;
    }
  });

  const rouletteNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];
  
  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  return (
    <group ref={wheelRef} position={[0, 0.5, 0]}>
      {/* Main wheel body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 0.5, 64]} />
        <meshStandardMaterial
          color="#1a4d2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Gold rim */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <torusGeometry args={[3, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.1}
          emissive="#ffaa00"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Number pockets */}
      {rouletteNumbers.map((num, idx) => {
        const angle = (idx / rouletteNumbers.length) * Math.PI * 2;
        const radius = 2.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isRed = RED_NUMBERS.includes(num);
        
        return (
          <group key={num} position={[x, 0.1, z]} rotation={[0, angle, 0]}>
            {/* Pocket */}
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.3, 0.3]} />
              <meshStandardMaterial
                color={num === 0 ? '#00ff00' : isRed ? '#ff0000' : '#000000'}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            
            {/* Number text */}
            <Center position={[0, 0.2, 0.2]}>
              <Text3D
                font="/fonts/inter_bold.json"
                size={0.15}
                height={0.02}
                rotation={[0, Math.PI, 0]}
              >
                {num}
                <meshStandardMaterial color="#ffffff" metalness={0.5} />
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
}

function Ball({ ballPosition, isSpinning }: { ballPosition: number; isSpinning: boolean }) {
  const ballRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ballRef.current && isSpinning) {
      const angle = (ballPosition / 360) * Math.PI * 2;
      const radius = 2.5;
      const height = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      
      ballRef.current.position.x = Math.cos(angle) * radius;
      ballRef.current.position.y = height;
      ballRef.current.position.z = Math.sin(angle) * radius;
    }
  });

  return (
    <mesh ref={ballRef} position={[2.5, 0.8, 0]} castShadow>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.9}
        roughness={0.1}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function RouletteWheel3D({ isSpinning, ballPosition, wheelSpeed, landedNumber }: RouletteWheel3DProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas shadows camera={{ position: [0, 6, 8], fov: 50 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.6}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffd700" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff4444" />
        
        {/* Table surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            mirror={1}
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={80}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a3d0a"
            metalness={0.8}
          />
        </mesh>
        
        <WheelMesh isSpinning={isSpinning} wheelSpeed={wheelSpeed} />
        <Ball ballPosition={ballPosition} isSpinning={isSpinning} />
        
        <Environment preset="city" />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
      
      {landedNumber !== null && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-8 py-4 rounded-full border-2 border-primary">
          <div className="text-4xl font-bold text-primary animate-pulse">
            {landedNumber}
          </div>
        </div>
      )}
    </div>
  );
}
