"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { prefersReducedEffects } from "@/lib/webgl";
import {
  holoVertex,
  holoFragment,
  wireVertex,
  wireFragment,
  gridVertex,
  gridFragment,
  beamVertex,
  beamFragment,
} from "./shaders";

const CYAN = new THREE.Color("#00fff0");
const MAGENTA = new THREE.Color("#ff00aa");
const VIOLET = new THREE.Color("#A78BFA");
const TEAL = new THREE.Color("#2DD4BF");

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CyberGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: CYAN.clone().lerp(TEAL, 0.5) },
    }),
    []
  );

  useFrame((state) => {
    if (matRef.current && !reducedMotion) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function PortalCore({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const holoRef = useRef<THREE.ShaderMaterial>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const holoUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: CYAN },
      uColorB: { value: VIOLET },
      uColorC: { value: MAGENTA },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (holoRef.current) holoRef.current.uniforms.uTime.value = t;
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      if (innerRef.current) innerRef.current.rotation.z = -t * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Hex portal ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.04, 6, 6]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <torusGeometry args={[1.05, 0.025, 6, 6]} />
        <meshBasicMaterial
          color={MAGENTA}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Holographic torus knot core */}
      <mesh scale={0.85}>
        <torusKnotGeometry args={[0.55, 0.16, 180, 24, 2, 3]} />
        <shaderMaterial
          ref={holoRef}
          vertexShader={holoVertex}
          fragmentShader={holoFragment}
          uniforms={holoUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner spinning octahedron */}
      <mesh ref={innerRef} scale={0.35}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={CYAN}
          wireframe
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function WireCage({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: MAGENTA.clone().lerp(VIOLET, 0.3) },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.x = -t * 0.12;
      groupRef.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={1.5}>
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={wireVertex}
          fragmentShader={wireFragment}
          uniforms={uniforms}
          wireframe
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function LightBeams({ reducedMotion }: { reducedMotion: boolean }) {
  const beams = useMemo(
    () =>
      [
        { color: CYAN, rot: 0, x: 0 },
        { color: MAGENTA, rot: Math.PI / 3, x: 0.3 },
        { color: VIOLET, rot: -Math.PI / 4, x: -0.25 },
      ] as const,
    []
  );

  return (
    <group position={[0, 0, -0.5]}>
      {beams.map((b, i) => (
        <Beam key={i} {...b} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function Beam({
  color,
  rot,
  x,
  reducedMotion,
}: {
  color: THREE.Color;
  rot: number;
  x: number;
  reducedMotion: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: color } }),
    [color]
  );

  useFrame((state) => {
    if (matRef.current && !reducedMotion) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[0, rot, 0]} position={[x, 0, 0]}>
      <planeGeometry args={[0.08, 8]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={beamVertex}
        fragmentShader={beamFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function DataRain({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.5 + Math.random() * 2;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state) => {
    if (!ref.current || reducedMotion) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      arr[idx] -= speeds[i] * 0.02;
      if (arr[idx] < -3) arr[idx] = 3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00fff0"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OrbitRing({
  radius,
  tube,
  color,
  speed,
  tilt,
  reducedMotion,
}: {
  radius: number;
  tube: number;
  color: THREE.Color;
  speed: number;
  tilt: [number, number, number];
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.z += speed * 0.012;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tube, 8, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function SceneRig({ reducedMotion }: { reducedMotion: boolean }) {
  const rigRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    if (!rigRef.current || reducedMotion) return;
    rigRef.current.rotation.y += (target.current.x - rigRef.current.rotation.y) * 0.05;
    rigRef.current.rotation.x += (target.current.y - rigRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={rigRef} position={[0, 0.2, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.25}>
        <PortalCore reducedMotion={reducedMotion} />
        <WireCage reducedMotion={reducedMotion} />
      </Float>
      <OrbitRing
        radius={1.55}
        tube={0.015}
        color={CYAN}
        speed={1.2}
        tilt={[Math.PI / 2.5, 0.3, 0]}
        reducedMotion={reducedMotion}
      />
      <OrbitRing
        radius={1.85}
        tube={0.01}
        color={MAGENTA}
        speed={-1}
        tilt={[0.5, Math.PI / 4, 0.2]}
        reducedMotion={reducedMotion}
      />
      <OrbitRing
        radius={2.15}
        tube={0.008}
        color={VIOLET}
        speed={0.7}
        tilt={[-0.4, 0.6, Math.PI / 3]}
        reducedMotion={reducedMotion}
      />
      <LightBeams reducedMotion={reducedMotion} />
      <DataRain count={reducedMotion ? 300 : 800} reducedMotion={reducedMotion} />
    </group>
  );
}

export function GatewayScene() {
  const reducedMotion = useReducedMotion();
  const [skipPostFx, setSkipPostFx] = useState(true);

  useEffect(() => {
    setSkipPostFx(prefersReducedEffects());
  }, []);

  return (
    <>
      <color attach="background" args={["#030308"]} />
      <fog attach="fog" args={["#030308", 3, 16]} />
      <ambientLight intensity={0.08} />
      <pointLight position={[2, 3, 4]} intensity={4} color="#00fff0" />
      <pointLight position={[-3, -1, 3]} intensity={3} color="#ff00aa" />
      <pointLight position={[0, -2, 2]} intensity={2} color="#A78BFA" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        color="#2DD4BF"
      />

      <CyberGrid reducedMotion={reducedMotion} />
      <Sparkles
        count={reducedMotion ? 40 : 120}
        scale={6}
        size={2}
        speed={0.4}
        color="#00fff0"
        opacity={0.6}
      />
      <SceneRig reducedMotion={reducedMotion} />

      {!reducedMotion && !skipPostFx && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            intensity={1.8}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={0.85} />
        </EffectComposer>
      )}
    </>
  );
}
