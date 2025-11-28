import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Horse {
  id: string;
  name: string;
  position: number;
  progress: number;
  color: string;
}

interface HorseRaceVisualsProps {
  horses: Horse[];
  isRacing: boolean;
  raceState: 'pre-race' | 'racing' | 'finished';
}

const HorseModel = ({ horse, trackPosition, isRacing }: { horse: Horse; trackPosition: number; isRacing: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const [gallop, setGallop] = useState(0);
  const [stride, setStride] = useState(0);

  useFrame((state, delta) => {
    if (isRacing && groupRef.current && bodyRef.current) {
      // Fast galloping animation
      const speed = 15;
      setGallop((prev) => prev + delta * speed);
      setStride((prev) => prev + delta * speed * 0.5);
      
      // Realistic horse body bob
      const verticalBob = Math.sin(gallop * 2) * 0.15;
      bodyRef.current.position.y = verticalBob;
      
      // Forward lean during gallop
      bodyRef.current.rotation.x = Math.sin(gallop * 2) * 0.08;
      
      // Slight side-to-side motion
      bodyRef.current.rotation.z = Math.sin(stride) * 0.03;
    }
  });

  const legAnimation = (offset: number, front: boolean) => {
    const cycle = gallop + offset;
    const extension = Math.sin(cycle) * (front ? 0.6 : 0.5);
    return extension;
  };

  return (
    <group ref={groupRef} position={[(trackPosition - 2) * 4, 1.5, horse.progress * 50 - 25]}>
      <group ref={bodyRef}>
        {/* Horse Body - Elongated realistic torso */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 1.0, 2.2]} />
          <meshStandardMaterial 
            color={horse.color} 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        
        {/* Horse Chest */}
        <mesh position={[0, -0.2, 1.0]} castShadow>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color={horse.color} roughness={0.7} />
        </mesh>
        
        {/* Horse Hindquarters */}
        <mesh position={[0, 0.1, -1.0]} castShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={horse.color} roughness={0.7} />
        </mesh>
        
        {/* Horse Neck - curved upward */}
        <mesh position={[0, 0.8, 1.4]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.4, 1.2, 16]} />
          <meshStandardMaterial color={horse.color} roughness={0.7} />
        </mesh>
        
        {/* Horse Head */}
        <mesh position={[0, 1.6, 1.9]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.8]} />
          <meshStandardMaterial color={horse.color} roughness={0.7} />
        </mesh>
        
        {/* Horse Snout */}
        <mesh position={[0, 1.4, 2.4]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.4]} />
          <meshStandardMaterial color={horse.color} roughness={0.7} />
        </mesh>
        
        {/* Horse Ears */}
        <mesh position={[-0.15, 2.0, 1.8]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshStandardMaterial color={horse.color} />
        </mesh>
        <mesh position={[0.15, 2.0, 1.8]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshStandardMaterial color={horse.color} />
        </mesh>
        
        {/* Horse Mane - flowing */}
        {[0, 0.3, 0.6, 0.9].map((offset, i) => (
          <mesh key={i} position={[0, 0.9 - offset * 0.3, 1.2 - offset]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.1]} />
            <meshStandardMaterial color="#1a0000" roughness={0.9} />
          </mesh>
        ))}
        
        {/* Horse Tail */}
        <mesh position={[0, 0.3, -2.0]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 1.0]} />
          <meshStandardMaterial color="#1a0000" roughness={0.9} />
        </mesh>
        
        {/* Saddle */}
        <mesh position={[0, 0.6, -0.2]}>
          <cylinderGeometry args={[0.55, 0.5, 0.25, 16]} />
          <meshStandardMaterial color="#4a2511" roughness={0.5} metalness={0.2} />
        </mesh>
        
        {/* Jockey Body - crouched racing position */}
        <mesh position={[0, 1.0, -0.3]} rotation={[0.6, 0, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
          <meshStandardMaterial color="#ff3366" metalness={0.3} roughness={0.5} />
        </mesh>
        
        {/* Jockey Head */}
        <mesh position={[0, 1.4, 0.3]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* Jockey Helmet */}
        <mesh position={[0, 1.5, 0.3]}>
          <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.2} />
        </mesh>
        
        {/* Racing Silks Number */}
        <Text
          position={[0, 1.1, -0.7]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {horse.position}
        </Text>
        
        {/* Front Left Leg */}
        <group position={[-0.35, -0.7, 0.9]}>
          <mesh position={[0, legAnimation(0, true) - 0.2, 0]} rotation={[legAnimation(0, true) * 0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.09, 0.8]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          <mesh position={[0, legAnimation(0, true) - 0.7, legAnimation(0, true) * 0.2]}>
            <cylinderGeometry args={[0.09, 0.11, 0.25]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
        
        {/* Front Right Leg */}
        <group position={[0.35, -0.7, 0.9]}>
          <mesh position={[0, legAnimation(Math.PI, true) - 0.2, 0]} rotation={[legAnimation(Math.PI, true) * 0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.09, 0.8]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          <mesh position={[0, legAnimation(Math.PI, true) - 0.7, legAnimation(Math.PI, true) * 0.2]}>
            <cylinderGeometry args={[0.09, 0.11, 0.25]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
        
        {/* Back Left Leg */}
        <group position={[-0.35, -0.7, -0.9]}>
          <mesh position={[0, legAnimation(Math.PI / 1.8, false) - 0.2, 0]} rotation={[legAnimation(Math.PI / 1.8, false) * 0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.9]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          <mesh position={[0, legAnimation(Math.PI / 1.8, false) - 0.75, legAnimation(Math.PI / 1.8, false) * 0.15]}>
            <cylinderGeometry args={[0.1, 0.12, 0.25]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
        
        {/* Back Right Leg */}
        <group position={[0.35, -0.7, -0.9]}>
          <mesh position={[0, legAnimation(Math.PI * 1.55, false) - 0.2, 0]} rotation={[legAnimation(Math.PI * 1.55, false) * 0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.9]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          <mesh position={[0, legAnimation(Math.PI * 1.55, false) - 0.75, legAnimation(Math.PI * 1.55, false) * 0.15]}>
            <cylinderGeometry args={[0.1, 0.12, 0.25]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      </group>
      
      {/* Horse Name Label above */}
      <Text
        position={[0, 3.0, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="black"
      >
        {horse.name}
      </Text>
      
      {/* Dust trail when running */}
      {isRacing && (
        <>
          <mesh position={[0, -1.2, -0.5]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#8b7355" 
              transparent 
              opacity={0.4}
              roughness={1}
            />
          </mesh>
          <mesh position={[0, -1.3, -1.2]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial 
              color="#a0826d" 
              transparent 
              opacity={0.25}
              roughness={1}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

const RaceTrack = () => {
  return (
    <>
      {/* Main track surface with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 80]} />
        <meshStandardMaterial 
          color="#6b5344" 
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      
      {/* Track lanes with subtle dividers */}
      {[0, 1, 2, 3, 4].map((lane) => (
        <group key={lane}>
          <mesh position={[lane * 20 - 40, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[18, 80]} />
            <meshStandardMaterial 
              color="#8b7355" 
              transparent 
              opacity={0.15}
              roughness={0.9}
            />
          </mesh>
          {/* Lane markers */}
          {lane < 4 && (
            <mesh position={[lane * 20 - 30, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.3, 80]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* Starting gate structure */}
      <group position={[0, 0, -22]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[100, 0.3, 0.3]} />
          <meshStandardMaterial color="#cc0000" metalness={0.6} roughness={0.3} />
        </mesh>
        {[-45, -25, -5, 15, 35].map((x, i) => (
          <mesh key={i} position={[x, 1, 0]} castShadow>
            <boxGeometry args={[0.4, 4, 0.4]} />
            <meshStandardMaterial color="#cc0000" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Starting line - white */}
      <mesh position={[0, 0.04, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 1.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Finish line - checkered pattern */}
      <group position={[0, 0.04, 20]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[i * 5 - 47.5, 0, 0]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[5, 1.5]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </mesh>
        ))}
      </group>
      
      {/* Grass infield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[140, 100]} />
        <meshStandardMaterial color="#1a5c1a" roughness={0.9} />
      </mesh>
      
      {/* White rail fencing */}
      {[-52, 52].map((x) => (
        <group key={x}>
          {/* Horizontal rails */}
          <mesh position={[x, 0.8, 0]}>
            <boxGeometry args={[0.15, 0.15, 85]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
          <mesh position={[x, 1.5, 0]}>
            <boxGeometry args={[0.15, 0.15, 85]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
          {/* Vertical posts */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[x, 1.2, i * 7.5 - 42]} castShadow>
              <boxGeometry args={[0.25, 2.5, 0.25]} />
              <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Grandstand backdrop */}
      <group position={[65, 5, 0]}>
        <mesh>
          <boxGeometry args={[5, 10, 80]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Grandstand lights */}
        {[-30, 0, 30].map((z) => (
          <pointLight key={z} position={[-3, 8, z]} intensity={1} distance={30} color="#ffeb99" />
        ))}
      </group>
      
      {/* Trees around the track */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 70;
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            {/* Tree trunk */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.8, 4]} />
              <meshStandardMaterial color="#4a3219" roughness={0.9} />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 5, 0]} castShadow>
              <sphereGeometry args={[2.5, 8, 8]} />
              <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

export const HorseRaceVisuals = ({ horses, isRacing, raceState }: HorseRaceVisualsProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create galloping sound effect
    if (isRacing && !audioRef.current) {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 100;
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;
      
      if (isRacing) {
        oscillator.start();
      }
      
      return () => {
        oscillator.stop();
        context.close();
      };
    }
  }, [isRacing]);

  const sortedHorses = [...horses].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-sky-200 to-green-100 rounded-lg overflow-hidden relative">
      {/* Race Info Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-white font-bold text-lg">
            {raceState === 'pre-race' && '🏁 Ready to Race'}
            {raceState === 'racing' && '🏇 Racing...'}
            {raceState === 'finished' && '🏆 Race Complete!'}
          </div>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-white text-sm space-y-1">
            {sortedHorses.slice(0, 3).map((horse, idx) => (
              <div key={horse.id} className="flex items-center gap-2">
                <span className="font-bold">{idx + 1}.</span>
                <span>{horse.name}</span>
                <span className="text-xs opacity-75">({Math.round(horse.progress * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Race View - Behind horses camera angle */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 6, -15]} fov={75} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 20, -10]} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        {/* Environment */}
        <RaceTrack />
        
        {/* Horses */}
        {sortedHorses.map((horse, index) => (
          <HorseModel 
            key={horse.id} 
            horse={horse} 
            trackPosition={index}
            isRacing={isRacing}
          />
        ))}
        
        {/* Sun */}
        <mesh position={[50, 50, -50]}>
          <sphereGeometry args={[5]} />
          <meshBasicMaterial color="#ffeb3b" />
        </mesh>
      </Canvas>

      {/* Winner Announcement */}
      {raceState === 'finished' && sortedHorses[0] && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 px-12 py-8 rounded-2xl text-center animate-pulse">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-white text-3xl font-bold mb-2">Winner!</div>
            <div className="text-white text-4xl font-black">{sortedHorses[0].name}</div>
          </div>
        </div>
      )}
    </div>
  );
};
