"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { isSafariBrowser, prefersReducedEffects } from "@/lib/webgl";
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <planeGeometry args={[50, 50, 1, 1]} />
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

function NearFloorGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: MAGENTA.clone().lerp(CYAN, 0.35) },
    }),
    []
  );

  useFrame((state) => {
    if (matRef.current && !reducedMotion) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 1.2]}>
      <planeGeometry args={[24, 16, 1, 1]} />
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

function VerticalDataColumns({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const columns = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: -3.2 + i * 0.48,
        h: 1.8 + (i % 4) * 0.55,
        speed: 0.4 + (i % 5) * 0.15,
        color: i % 3 === 0 ? CYAN : i % 3 === 1 ? MAGENTA : VIOLET,
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y =
        -1.6 + Math.sin(state.clock.elapsedTime * columns[i].speed + i) * 0.08;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.8]}>
      {columns.map((col, i) => (
        <mesh key={i} position={[col.x, -1.6 + col.h / 2, 0]}>
          <boxGeometry args={[0.02, col.h, 0.02]} />
          <meshBasicMaterial
            color={col.color}
            transparent
            opacity={0.35 + (i % 3) * 0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function HorizonArcs({ reducedMotion }: { reducedMotion: boolean }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (outerRef.current) outerRef.current.rotation.z = t * 0.04;
    if (innerRef.current) innerRef.current.rotation.z = -t * 0.06;
  });

  return (
    <group position={[0, -1.05, 0.3]} rotation={[Math.PI / 2.15, 0, 0]}>
      <mesh ref={outerRef}>
        <torusGeometry args={[2.8, 0.012, 8, 96, Math.PI * 0.85]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[2.2, 0.008, 8, 96, Math.PI * 0.75]} />
        <meshBasicMaterial
          color={MAGENTA}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SideEnergyPillars({ reducedMotion }: { reducedMotion: boolean }) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    if (leftRef.current) leftRef.current.scale.y = pulse;
    if (rightRef.current) rightRef.current.scale.y = pulse * 0.92;
  });

  return (
    <>
      <mesh ref={leftRef} position={[-2.4, -0.2, 0.5]}>
        <cylinderGeometry args={[0.03, 0.06, 3.2, 8]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={rightRef} position={[2.4, -0.2, 0.5]}>
        <cylinderGeometry args={[0.03, 0.06, 3.2, 8]} />
        <meshBasicMaterial
          color={MAGENTA}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function FloatingNodes({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        x: (Math.random() - 0.5) * 5.5,
        y: -2 + Math.random() * 2.2,
        z: (Math.random() - 0.5) * 2.5,
        s: 0.015 + Math.random() * 0.025,
        speed: 0.3 + Math.random() * 0.8,
        color: i % 3 === 0 ? CYAN : i % 3 === 1 ? VIOLET : TEAL,
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y =
        nodes[i].y + Math.sin(state.clock.elapsedTime * nodes[i].speed + i) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[node.s, 6, 6]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
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
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = -3 + Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
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
      if (arr[idx] < -3) arr[idx] = 3.5;
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
    <group ref={rigRef} position={[0, 0.35, 0]}>
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
      <DataRain count={reducedMotion ? 400 : 1200} reducedMotion={reducedMotion} />
    </group>
  );
}

export function GatewayScene() {
  const reducedMotion = useReducedMotion();
  const [skipPostFx, setSkipPostFx] = useState(true);

  useEffect(() => {
    setSkipPostFx(prefersReducedEffects() || isSafariBrowser());
  }, []);

  return (
    <>
      <color attach="background" args={["#030308"]} />
      <fog attach="fog" args={["#030308", 4, 22]} />
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
      <NearFloorGrid reducedMotion={reducedMotion} />
      <HorizonArcs reducedMotion={reducedMotion} />
      <VerticalDataColumns reducedMotion={reducedMotion} />
      <SideEnergyPillars reducedMotion={reducedMotion} />
      <FloatingNodes reducedMotion={reducedMotion} />
      <Sparkles
        count={reducedMotion ? 60 : 180}
        scale={[7, 5, 4]}
        size={2.2}
        speed={0.45}
        color="#00fff0"
        opacity={0.65}
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
