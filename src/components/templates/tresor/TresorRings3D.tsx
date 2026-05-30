import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const GOLD = "#c79a55";
const GOLD_BRIGHT = "#f3d9b1";

const Ring = ({
  rotationAxis,
  speed,
  offset,
  tilt,
}: {
  rotationAxis: "x" | "y" | "z";
  speed: number;
  offset: number;
  tilt: [number, number, number];
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation[rotationAxis] = t * speed;
    // gentle bobbing
    ref.current.position.x = Math.sin(t * 0.5 + offset) * 0.35;
    ref.current.position.y = Math.cos(t * 0.4 + offset) * 0.08;
  });

  return (
    <mesh ref={ref} rotation={tilt} castShadow>
      <torusGeometry args={[1, 0.08, 32, 128]} />
      <meshStandardMaterial
        color={GOLD}
        metalness={1}
        roughness={0.18}
        emissive={GOLD}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
};

const Sparkles = () => {
  const points = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 60; i++) {
      arr.push(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3
      );
    }
    return new Float32Array(arr);
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={GOLD_BRIGHT}
        size={0.025}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

export const TresorRings3D = () => (
  <Canvas
    camera={{ position: [0, 0, 4], fov: 45 }}
    dpr={[1, 2]}
    gl={{ alpha: true, antialias: true }}
    style={{ background: "transparent" }}
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={1.4} color={GOLD_BRIGHT} />
    <directionalLight position={[-3, -2, 4]} intensity={0.6} color="#ffffff" />
    <pointLight position={[0, 0, 3]} intensity={0.8} color={GOLD} />

    <Ring rotationAxis="y" speed={0.45} offset={0} tilt={[Math.PI / 2.2, 0, 0.15]} />
    <Ring rotationAxis="x" speed={-0.35} offset={Math.PI} tilt={[0, Math.PI / 2.4, -0.2]} />

    <Sparkles />
  </Canvas>
);

export default TresorRings3D;
