import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { extend, ReactThreeFiber } from '@react-three/fiber';

// Extend Three.js line to be usable in JSX
extend({ Line_: THREE.Line });

// Add typing for the extended element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
    }
  }
}

export function GraphLine({ points }: { points: THREE.Vector3[] }) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!geometry) return null;

  return (
    <line_>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#00ff00" linewidth={3} />
    </line_>
  );
}
