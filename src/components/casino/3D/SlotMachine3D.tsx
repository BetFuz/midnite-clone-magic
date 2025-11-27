import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text3D, Center, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SlotMachine3DProps {
  reels: any[];
  spinning: boolean;
  result: any[][];
  winLines: number[];
}

function Reel({ symbols, position, spinning, reelIndex }: any) {
  const reelRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState(0);
  
  useFrame((state, delta) => {
    if (reelRef.current && spinning) {
      const speed = 10 + reelIndex * 0.5;
      setRotation((prev) => prev + delta * speed);
      reelRef.current.rotation.x = rotation;
    }
  });

  const symbolEmojis = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '7️⃣', '💰'];

  return (
    <group ref={reelRef} position={position}>
      {/* Reel cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Symbols on reel */}
      {symbolEmojis.map((symbol, idx) => {
        const angle = (idx / symbolEmojis.length) * Math.PI * 2;
        const radius = 0.85;
        
        return (
          <group
            key={idx}
            position={[
              Math.sin(angle) * radius,
              0,
              Math.cos(angle) * radius
            ]}
            rotation={[0, -angle, 0]}
          >
            <Center>
              <Text3D
                font="/fonts/inter_bold.json"
                size={0.3}
                height={0.05}
              >
                {symbol}
                <meshStandardMaterial
                  color="#ffd700"
                  emissive="#ffaa00"
                  emissiveIntensity={0.5}
                />
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
}

function SlotFrame({ winLines }: { winLines: number[] }) {
  return (
    <group>
      {/* Main frame */}
      <mesh position={[0, 0, -1]} castShadow>
        <boxGeometry args={[8, 5, 0.5]} />
        <meshStandardMaterial
          color="#8b0000"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Gold trim */}
      <mesh position={[0, 0, -0.7]}>
        <boxGeometry args={[8.2, 5.2, 0.1]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.1}
          emissive="#ffaa00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Glass panel */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[7.5, 4.5, 0.1]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.2}
          roughness={0.05}
          chromaticAberration={0.5}
          anisotropy={1}
        />
      </mesh>
      
      {/* Win line indicators */}
      {winLines.map((line, idx) => (
        <mesh
          key={idx}
          position={[0, 1.5 - line * 1.5, 1]}
          castShadow
        >
          <boxGeometry args={[7, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function SlotMachine3D({ reels, spinning, result, winLines }: SlotMachine3DProps) {
  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas shadows camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[0, 8, 8]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffd700" />
        <pointLight position={[-5, 5, 5]} intensity={1} color="#ff00ff" />
        
        {/* Slot machine */}
        <group position={[0, 0, 0]}>
          <SlotFrame winLines={winLines} />
          
          {/* Reels */}
          <Reel symbols={reels[0]?.symbols || []} position={[-2.5, 0, 0]} spinning={spinning} reelIndex={0} />
          <Reel symbols={reels[1]?.symbols || []} position={[0, 0, 0]} spinning={spinning} reelIndex={1} />
          <Reel symbols={reels[2]?.symbols || []} position={[2.5, 0, 0]} spinning={spinning} reelIndex={2} />
        </group>
        
        <Environment preset="night" />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
