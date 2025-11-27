import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DiceRoller3DProps {
  dice: Array<{
    value: number;
    rolling: boolean;
    rotation: { x: number; y: number; z: number };
  }>;
}

function Die({ value, rolling, rotation, position }: any) {
  const dieRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (dieRef.current && rolling) {
      dieRef.current.rotation.x += rotation.x * delta;
      dieRef.current.rotation.y += rotation.y * delta;
      dieRef.current.rotation.z += rotation.z * delta;
      
      // Bounce effect
      const bounce = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.5;
      dieRef.current.position.y = position[1] + bounce;
    }
  });

  // Dice pip positions for each face
  const pipPositions: Record<number, Array<[number, number, number]>> = {
    1: [[0, 0, 0.51]],
    2: [[-0.25, 0.25, 0.51], [0.25, -0.25, 0.51]],
    3: [[-0.25, 0.25, 0.51], [0, 0, 0.51], [0.25, -0.25, 0.51]],
    4: [[-0.25, 0.25, 0.51], [0.25, 0.25, 0.51], [-0.25, -0.25, 0.51], [0.25, -0.25, 0.51]],
    5: [[-0.25, 0.25, 0.51], [0.25, 0.25, 0.51], [0, 0, 0.51], [-0.25, -0.25, 0.51], [0.25, -0.25, 0.51]],
    6: [[-0.25, 0.25, 0.51], [0.25, 0.25, 0.51], [-0.25, 0, 0.51], [0.25, 0, 0.51], [-0.25, -0.25, 0.51], [0.25, -0.25, 0.51]],
  };

  return (
    <group position={position}>
      <mesh ref={dieRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.3}
        />
        
        {/* Pips on top face */}
        {pipPositions[value]?.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        ))}
      </mesh>
      
      {/* Glow effect when rolling */}
      {rolling && (
        <pointLight
          position={[0, 0, 0]}
          intensity={2}
          distance={2}
          color="#00ff00"
        />
      )}
    </group>
  );
}

function CrapsTable() {
  return (
    <group>
      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <MeshReflectorMaterial
          mirror={1}
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a5d0a"
          metalness={0.5}
        />
      </mesh>
      
      {/* Table markings */}
      <Text
        position={[0, 0.01, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffd700"
        anchorX="center"
      >
        PASS LINE
      </Text>
      
      <Text
        position={[0, 0.01, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffd700"
        anchorX="center"
      >
        DON'T PASS
      </Text>
    </group>
  );
}

export function DiceRoller3D({ dice }: DiceRoller3DProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas shadows camera={{ position: [0, 8, 8], fov: 50 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[0, 15, 0]}
          angle={0.6}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffd700" />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ff4444" />
        
        <CrapsTable />
        
        {/* Render dice */}
        {dice.map((die, idx) => (
          <Die
            key={idx}
            value={die.value}
            rolling={die.rolling}
            rotation={die.rotation}
            position={[idx * 1.5 - (dice.length - 1) * 0.75, 1, 0]}
          />
        ))}
        
        <Environment preset="city" />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
