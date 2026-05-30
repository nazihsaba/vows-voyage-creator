import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Palette tuned to the Tresor template (warm dark gold on black):
// - champagne gold  #D4AF6C
// - antique bronze  #B4894A
const CHAMPAGNE = "#D4AF6C";
const BRONZE = "#A8783C";

const makeEnvTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 512);
  // Warm-to-dark gradient that matches the Tresor quote slide
  g.addColorStop(0, "#f3d9b1");
  g.addColorStop(0.45, "#c79a55");
  g.addColorStop(0.7, "#70550f");
  g.addColorStop(1, "#1a1208");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);
  const blob = (cx: number, cy: number, r: number, a: number) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, `rgba(255,240,210,${a})`);
    rg.addColorStop(1, "rgba(255,240,210,0)");
    x.fillStyle = rg;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  blob(220, 150, 160, 0.95);
  blob(770, 120, 130, 0.8);
  blob(520, 320, 110, 0.5);
  const tex = new THREE.Texture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
};

const Scene = () => {
  const { gl, scene } = useThree();
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const points = useRef<THREE.Points>(null);
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const diamondMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 });

  // Environment map for the metal reflections
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = makeEnvTexture();
    const env = pmrem.fromEquirectangular(tex).texture;
    scene.environment = env;
    return () => {
      pmrem.dispose();
      tex.dispose();
      env.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  // Pointer tracking on canvas
  useEffect(() => {
    const dom = gl.domElement;
    const handle = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      mouse.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    dom.addEventListener("pointermove", handle);
    return () => dom.removeEventListener("pointermove", handle);
  }, [gl]);

  // Sparkle particle positions
  const particles = useMemo(() => {
    const N = 70;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = Math.random();
      const v = Math.random();
      const th = u * Math.PI * 2;
      const ph = Math.acos(2 * v - 1);
      const rad = 2.4 + Math.random() * 0.9;
      pos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rad * Math.cos(ph);
      pos[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    tilt.current.y += (mouse.current.x * 0.5 - tilt.current.y) * 0.05;
    tilt.current.x += (-mouse.current.y * 0.3 - tilt.current.x) * 0.05;
    if (group.current) {
      group.current.rotation.y = t * 0.3 + tilt.current.y;
      group.current.rotation.x = -0.12 + Math.sin(t * 0.4) * 0.08 + tilt.current.x;
    }
    if (diamondMat.current) {
      diamondMat.current.emissiveIntensity =
        0.12 + 0.18 * Math.abs(Math.sin(t * 2.2));
    }
    if (points.current) points.current.rotation.y -= 0.0015;
    if (pointsMat.current) pointsMat.current.opacity = 0.5 + 0.3 * Math.sin(t * 1.5);
  });

  const R = 1;
  const tube = 0.135;
  const prongAngles = [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2 + Math.PI / 4);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 5]} intensity={1.6} color={"#fff3e0"} />
      <pointLight position={[-4, 2, 3]} intensity={1.4} color={"#ffe2c0"} distance={30} />
      <pointLight position={[3, -1.5, 4]} intensity={0.7} color={"#ffd9a8"} distance={30} />

      <group ref={group} scale={0.9}>
        {/* Ring 1 — champagne gold, with diamond on top */}
        <mesh ref={ring1} position={[-0.35, 0, 0]} rotation={[0.12, 0, 0]}>
          <torusGeometry args={[R, tube, 48, 120]} />
          <meshStandardMaterial
            color={CHAMPAGNE}
            metalness={1}
            roughness={0.16}
            envMapIntensity={1.3}
          />

          {/* Diamond */}
          <mesh position={[0, R + tube + 0.16, 0]} scale={[1, 1.35, 1]}>
            <octahedronGeometry args={[0.17, 0]} />
            <meshPhysicalMaterial
              ref={diamondMat}
              color={"#ffffff"}
              metalness={0}
              roughness={0}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2.6}
              emissive={"#ffe8b0"}
              emissiveIntensity={0.15}
              flatShading
            />
          </mesh>

          {/* Prongs */}
          {prongAngles.map((a, i) => (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.08, R + tube + 0.07, Math.sin(a) * 0.08]}
              rotation={[-Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25]}
            >
              <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
              <meshStandardMaterial
                color={CHAMPAGNE}
                metalness={1}
                roughness={0.16}
                envMapIntensity={1.3}
              />
            </mesh>
          ))}
        </mesh>

        {/* Ring 2 — antique bronze, perpendicular */}
        <mesh position={[0.35, 0, 0]} rotation={[0, Math.PI / 2, 0.12]}>
          <torusGeometry args={[R, tube * 0.92, 48, 120]} />
          <meshStandardMaterial
            color={BRONZE}
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.3}
          />
        </mesh>
      </group>

      {/* Sparkle particles */}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMat}
          color={"#ffe5b8"}
          size={0.045}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
};

export const TresorRings3D = () => (
  <Canvas
    camera={{ position: [0, 1.2, 7.2], fov: 38 }}
    dpr={[1, 2]}
    gl={{ alpha: true, antialias: true }}
    style={{ background: "transparent" }}
    onCreated={({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;
      gl.outputColorSpace = THREE.SRGBColorSpace;
    }}
  >
    <Scene />
  </Canvas>
);

export default TresorRings3D;
