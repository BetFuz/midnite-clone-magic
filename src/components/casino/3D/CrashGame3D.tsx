import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Trail, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GraphLine } from './GraphLine';

interface CrashGame3DProps {
  multiplier: number;
  crashed: boolean;
  isRunning: boolean;
}

function Rocket({ multiplier, crashed, isRunning }: CrashGame3DProps) {
  const rocketRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (rocketRef.current && isRunning && !crashed) {
      const height = Math.log(multiplier) * 3;
      rocketRef.current.position.y = height;
      
      // Rocket tilt and rotation
      rocketRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      rocketRef.current.rotation.x = -0.3;
      
      // Wobble effect
      rocketRef.current.position.x = Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
    
    if (crashed && rocketRef.current) {
      // Explosion effect
      rocketRef.current.rotation.x += 0.1;
      rocketRef.current.rotation.y += 0.15;
      rocketRef.current.rotation.z += 0.12;
    }
  });

  return (
    <group ref={rocketRef} position={[0, 0, 0]}>
      <Trail
        width={1}
        length={8}
        color={crashed ? '#ff0000' : '#00ff00'}
        attenuation={(t) => t * t}
      >
        {/* Rocket body */}
        <mesh castShadow>
          <coneGeometry args={[0.3, 1.5, 8]} />
          <meshStandardMaterial
            color={crashed ? '#ff0000' : '#silver'}
            metalness={0.9}
            roughness={0.1}
            emissive={crashed ? '#ff0000' : '#4444ff'}
            emissiveIntensity={crashed ? 2 : 0.5}
          />
        </mesh>
      </Trail>
      
      {/* Rocket fins */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 0.3,
            -0.5,
            Math.sin((i / 4) * Math.PI * 2) * 0.3
          ]}
          rotation={[0, (i / 4) * Math.PI * 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.5, 0.3]} />
          <meshStandardMaterial
            color="#ff4444"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Engine fire */}
      {!crashed && isRunning && (
        <pointLight
          position={[0, -1, 0]}
          intensity={2}
          distance={3}
          color="#ff6600"
          castShadow
        />
      )}
      
      {/* Explosion particles */}
      {crashed && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              ]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color="#ff0000"
                emissive="#ff0000"
                emissiveIntensity={5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Graph({ multiplier }: { multiplier: number }) {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  
  useFrame(() => {
    if (multiplier > 1) {
      const x = Math.log(multiplier) * 2;
      const y = Math.log(multiplier) * 3;
      
      setPoints(prev => {
        const newPoints = [...prev, new THREE.Vector3(x, y, 0)];
        return newPoints.length > 100 ? newPoints.slice(1) : newPoints;
      });
    }
  });

  return <GraphLine points={points} />;
}

export function CrashGame3D({ multiplier, crashed, isRunning }: CrashGame3DProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        
        {/* Space environment */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[0, 20, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />
        
        {/* Grid floor */}
        <gridHelper args={[50, 50, '#00ff00', '#003300']} position={[0, 0, 0]} />
        
        <Rocket multiplier={multiplier} crashed={crashed} isRunning={isRunning} />
        <Graph multiplier={multiplier} />
        
        {/* Multiplier display */}
        <Text
          position={[0, multiplier > 1 ? Math.log(multiplier) * 3 + 2 : 2, 0]}
          fontSize={1}
          color={crashed ? '#ff0000' : '#00ff00'}
          anchorX="center"
          anchorY="middle"
        >
          {multiplier.toFixed(2)}x
        </Text>
        
        <Environment preset="night" />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
      
      {crashed && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-6xl font-bold text-red-500 animate-pulse">
            CRASHED!
          </div>
        </div>
      )}
    </div>
  );
}
