import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const Rings = () => {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.4;
      group.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
    if (ring1.current) ring1.current.position.x = -0.62 + Math.sin(t * 0.8) * 0.08;
    if (ring2.current) ring2.current.position.x = 0.62 - Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh
        ref={ring1}
        position={[-0.6, 0, 0]}
        rotation={[Math.PI / 2 + 0.3, 0, 0.2]}
        castShadow
      >
        <torusGeometry args={[1, 0.18, 64, 128]} />
        <meshStandardMaterial
          color={"#D4AF37"}
          metalness={1}
          roughness={0.15}
          envMapIntensity={1}
        />
      </mesh>
      <mesh
        ref={ring2}
        position={[0.6, 0, 0]}
        rotation={[Math.PI / 2 + 0.3, 0, -0.2]}
        castShadow
      >
        <torusGeometry args={[1, 0.16, 64, 128]} />
        <meshStandardMaterial
          color={"#C5A028"}
          metalness={1}
          roughness={0.12}
          envMapIntensity={1}
        />
      </mesh>
    </group>
  );
};

export const TresorRings3D = () => (
  <Canvas
    camera={{ position: [0, 2.5, 6], fov: 45 }}
    dpr={[1, 2]}
    gl={{ alpha: true, antialias: true }}
    style={{ background: "transparent" }}
    shadows
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 8, 5]} intensity={1.8} color={"#fff5e0"} castShadow />
    <pointLight position={[-3, 3, 3]} intensity={1.2} color={"#ffd700"} distance={20} />
    <pointLight position={[3, -1, 4]} intensity={0.8} color={"#ffffff"} distance={20} />
    <Environment preset="studio" />
    <Rings />
  </Canvas>
);

export default TresorRings3D;
