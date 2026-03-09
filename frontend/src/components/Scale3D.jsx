import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, RoundedBox, Cylinder } from "@react-three/drei";

export default function Scale3D() {
  const leftPlate = useRef();
  const rightPlate = useRef();

  useFrame(() => {
    leftPlate.current.position.y = Math.sin(Date.now() * 0.002) * 0.15;
    rightPlate.current.position.y = Math.cos(Date.now() * 0.002) * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[5, 8, 5]} />

      {/* Pillar */}
      <Cylinder args={[0.25, 0.25, 4]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4DB7FF" metalness={0.4} roughness={0.3} />
      </Cylinder>

      {/* Top bar */}
      <RoundedBox args={[4, 0.25, 0.2]} radius={0.1} position={[0, 2, 0]}>
        <meshStandardMaterial color="#4DB7FF" metalness={0.4} roughness={0.3} />
      </RoundedBox>

      {/* Base */}
      <RoundedBox args={[3, 0.5, 1]} position={[0, -2.2, 0]} radius={0.4}>
        <meshStandardMaterial color="white" roughness={0.8} />
      </RoundedBox>

      {/* Left Plate */}
      <Sphere ref={leftPlate} args={[1, 32, 32]} position={[-2, 1, 0]}>
        <meshStandardMaterial color="#57C3FF" roughness={0.4} />
      </Sphere>

      {/* Right Plate */}
      <Sphere ref={rightPlate} args={[1, 32, 32]} position={[2, 1, 0]}>
        <meshStandardMaterial color="#57C3FF" roughness={0.4} />
      </Sphere>

      {/* Floating glowing spheres */}
      {[...Array(12)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.22, 16, 16]}
          position={[
            Math.random() * 6 - 3,
            Math.random() * 3 - 1,
            Math.random() * 2 - 1,
          ]}
        >
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.2} />
        </Sphere>
      ))}
    </>
  );
}
