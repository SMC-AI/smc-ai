"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, Group } from "three";
import { OrbitControls, Text } from "@react-three/drei";
import { useTheme } from "next-themes";

/* ────────────────────────────────────────────
   Planet: a small sphere + text label that
   orbits the origin at a given radius & speed
   ──────────────────────────────────────────── */
function OrbitingPlanet({
    label,
    subLabel,
    radius,
    speed,
    color,
    ringColor,
    startAngle = 0,
}: {
    label: string;
    subLabel?: string;
    radius: number;
    speed: number;
    color: string;
    ringColor: string;
    startAngle?: number;
}) {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime * speed + startAngle;
            groupRef.current.position.x = Math.cos(t) * radius;
            groupRef.current.position.z = Math.sin(t) * radius;
            // always face camera
            groupRef.current.rotation.y = -t;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Planet body */}
            <mesh>
                <sphereGeometry args={[0.32, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
            </mesh>

            {/* Thin equatorial ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.44, 0.025, 8, 60]} />
                <meshStandardMaterial color={ringColor} roughness={0.1} metalness={0.9} transparent opacity={0.7} />
            </mesh>

            {/* Main label (e.g. "🦀 OC" or "xAI") */}
            <Text
                position={[0, 0, 0.33]}
                fontSize={0.16}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight={900}
                letterSpacing={0.04}
            >
                {label}
            </Text>

            {subLabel && (
                <Text
                    position={[0, -0.13, 0.33]}
                    fontSize={0.09}
                    color={ringColor}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >
                    {subLabel}
                </Text>
            )}
        </group>
    );
}

/* ────────────────────────────────────────────
   Orbital ring visual (just a dashed plane ring)
   ──────────────────────────────────────────── */
function OrbitalRing({ radius, color }: { radius: number; color: string }) {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.012, 4, 90]} />
            <meshStandardMaterial color={color} transparent opacity={0.18} />
        </mesh>
    );
}

/* ────────────────────────────────────────────
   Inner Neural Core (wireframe icosahedron + octahedron)
   No solid sphere — planets replace it
   ──────────────────────────────────────────── */
function NeuralCore() {
    const outerRef = useRef<Mesh>(null);
    const midRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (outerRef.current) {
            outerRef.current.rotation.x += delta * 0.13;
            outerRef.current.rotation.y += delta * 0.18;
        }
        if (midRef.current) {
            midRef.current.rotation.x -= delta * 0.21;
            midRef.current.rotation.y -= delta * 0.27;
        }
    });

    return (
        <group>
            {/* Outer icosahedron wireframe */}
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[2.5, 1]} />
                <meshStandardMaterial color="#00f0ff" wireframe transparent opacity={0.45} />
            </mesh>

            {/* Mid octahedron wireframe */}
            <mesh ref={midRef}>
                <octahedronGeometry args={[1.45, 0]} />
                <meshStandardMaterial color="#8b5cf6" wireframe transparent opacity={0.65} />
            </mesh>

            {/* Central glowing core — tiny bright dot */}
            <mesh>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
            </mesh>

            {/* Orbital path rings */}
            <OrbitalRing radius={1.1} color="#00f0ff" />
            <OrbitalRing radius={1.6} color="#a78bfa" />

            {/* Inner orbit: OpenClaw planet */}
            <OrbitingPlanet
                label="OC"
                subLabel="OPENCLAW"
                radius={1.1}
                speed={0.6}
                color="#0f172a"
                ringColor="#00f0ff"
                startAngle={0}
            />

            {/* Outer orbit: xAI planet */}
            <OrbitingPlanet
                label="xAI"
                subLabel="SENTIMENT"
                radius={1.6}
                speed={0.38}
                color="#1a0a2e"
                ringColor="#a78bfa"
                startAngle={Math.PI * 0.75}
            />
        </group>
    );
}

/* ────────────────────────────────────────────
   Main exported component
   ──────────────────────────────────────────── */
export default function Hero3DModel() {
    const { theme } = useTheme();
    const ambientIntensity = theme === "light" ? 1.4 : 0.85;
    const pointIntensity = theme === "light" ? 2.5 : 2;

    return (
        <div style={{ width: "100%", height: "500px", cursor: "grab" }}>
            <Canvas camera={{ position: [0, 1.5, 7], fov: 45 }}>
                <ambientLight intensity={ambientIntensity} />
                <pointLight position={[10, 10, 10]} intensity={pointIntensity} color="#00f0ff" />
                <pointLight position={[-10, -10, -10]} intensity={1.2} color="#8b5cf6" />
                <pointLight position={[0, 8, -8]} intensity={0.8} color="#a78bfa" />
                <NeuralCore />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
        </div>
    );
}
