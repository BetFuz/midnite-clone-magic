import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';

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

const HorseModel = ({ horse, trackPosition }: { horse: Horse; trackPosition: number }) => {
  return (
    <group position={[trackPosition * 20 - 40, 0, horse.progress * 40 - 20]}>
      {/* Horse Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 1, 2]} />
        <meshStandardMaterial color={horse.color} />
      </mesh>
      
      {/* Horse Head */}
      <mesh position={[0, 1.5, 1.2]}>
        <boxGeometry args={[0.6, 0.6, 0.8]} />
        <meshStandardMaterial color={horse.color} />
      </mesh>
      
      {/* Jockey */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#ff3366" />
      </mesh>
      
      {/* Legs (animated) */}
      <mesh position={[-0.4, 0.3, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      <mesh position={[0.4, 0.3, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      <mesh position={[-0.4, 0.3, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      <mesh position={[0.4, 0.3, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      
      {/* Position Number */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const RaceTrack = () => {
  return (
    <>
      {/* Main track surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 80]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      
      {/* Track lanes */}
      {[0, 1, 2, 3, 4].map((lane) => (
        <mesh key={lane} position={[lane * 20 - 40, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 80]} />
          <meshStandardMaterial color="#a0826d" transparent opacity={0.3} />
        </mesh>
      ))}
      
      {/* Starting line */}
      <mesh position={[0, 0.1, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Finish line */}
      <mesh position={[0, 0.1, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Grass borders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[120, 100]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      
      {/* Fence posts */}
      {[-55, 55].map((x) => (
        <group key={x}>
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={i} position={[x, 1, i * 8 - 40]}>
              <boxGeometry args={[0.2, 2, 0.2]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))}
        </group>
      ))}
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

      {/* 3D Race View */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 25, 30]} />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={20}
          maxDistance={100}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 20, -10]} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        {/* Environment */}
        <RaceTrack />
        
        {/* Horses */}
        {sortedHorses.map((horse, index) => (
          <HorseModel key={horse.id} horse={horse} trackPosition={index} />
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
