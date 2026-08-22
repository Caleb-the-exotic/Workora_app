import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { bell, hash, lerp, range, smoothstep } from "@/lib/film";

/* ------------------------------------------------------------------ */
/* Brand palette (3D scene only — DOM uses design tokens)              */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#150406",
  deep: "#1E070A",
  burgundy: "#2C0E13",
  white: "#F2F3F5",
  gray: "#9A8A8D",
  red: "#E0202B",
  blue: "#C77A5A",
};

const col = {
  panel: new THREE.Color("#3A171D"),
  panelSoft: new THREE.Color("#2C0E13"),
  white: new THREE.Color(C.white),
  gray: new THREE.Color("#6B5457"),
  red: new THREE.Color(C.red),
  blue: new THREE.Color(C.blue),
  green: new THREE.Color("#3E9E6B"),
  amber: new THREE.Color("#C89A3C"),
};

type Frame = { p: number; reduced: boolean; mobile: boolean };

/* ------------------------------------------------------------------ */
/* Instanced card system — one system morphing through all six acts     */
/* ------------------------------------------------------------------ */

const COLS_DIR = 8;
const COLS_ATT = 14;
const COLS_CAL = 7;

function CardSystem({ frame, count }: { frame: Frame; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = frame.p;

    const wDir = range(p, 0.1, 0.28);
    const wAtt = range(p, 0.31, 0.46);
    const wCal = range(p, 0.5, 0.64);
    const wPay = range(p, 0.65, 0.78);
    const wAna = range(p, 0.8, 0.9);

    for (let i = 0; i < count; i++) {
      const r1 = hash(i);
      const r2 = hash(i + 91);
      const r3 = hash(i + 517);

      /* Act 1 — free cloud of workforce data */
      const radius = 4 + r1 * 5;
      const theta = r2 * Math.PI * 2;
      const phi = Math.acos(2 * r3 - 1);
      target.set(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius * 0.55,
        Math.sin(phi) * Math.sin(theta) * radius * 0.7 - 2,
      );
      let sx = 0.16 + r1 * 0.1;
      let sy = sx * 0.7;
      tmp.copy(col.gray).lerp(col.white, r2 * 0.4);

      /* Act 2 — employee directory */
      const dCol = i % COLS_DIR;
      const dRow = Math.floor(i / COLS_DIR);
      const dRows = Math.ceil(count / COLS_DIR);
      scratch.set(
        (dCol - (COLS_DIR - 1) / 2) * 1.5,
        ((dRows - 1) / 2 - dRow) * 1.05,
        -0.4 + Math.sin(dCol) * 0.25,
      );
      target.lerp(scratch, wDir);
      sx = lerp(sx, 1.24, wDir);
      sy = lerp(sy, 0.78, wDir);
      tmp.lerp(i % 5 === 0 ? col.red : col.panel, wDir * 0.92);

      /* Act 3 — attendance grid */
      const aCol = i % COLS_ATT;
      const aRow = Math.floor(i / COLS_ATT);
      const aRows = Math.ceil(count / COLS_ATT);
      scratch.set(
        (aCol - (COLS_ATT - 1) / 2) * 0.78,
        ((aRows - 1) / 2 - aRow) * 0.78,
        -0.2,
      );
      target.lerp(scratch, wAtt);
      sx = lerp(sx, 0.6, wAtt);
      sy = lerp(sy, 0.6, wAtt);
      const status = i % 7;
      const attColor =
        status === 0 ? col.red : status === 1 ? col.amber : status === 2 ? col.gray : col.green;
      tmp.lerp(attColor, wAtt * (0.25 + 0.4 * smoothstep((aCol + 1) / COLS_ATT + (p - 0.36) * 3)));
      tmp.multiplyScalar(lerp(1, 0.72, wAtt));

      /* Act 4 — leave calendar */
      const cCol = i % COLS_CAL;
      const cRow = Math.floor(i / COLS_CAL);
      const cRows = Math.ceil(count / COLS_CAL);
      scratch.set(
        (cCol - (COLS_CAL - 1) / 2) * 1.05,
        ((cRows - 1) / 2 - cRow) * 1.0,
        -0.6 + cRow * 0.06,
      );
      target.lerp(scratch, wCal);
      sx = lerp(sx, 0.82, wCal);
      sy = lerp(sy, 0.72, wCal);
      const leave = i % 9;
      tmp.lerp(
        leave === 0 ? col.red : leave === 1 ? col.amber : leave === 2 ? col.green : col.panelSoft,
        wCal * 0.9,
      );

      /* Act 5 — payroll ledger: tight ledger rows behind the salary card */
      const pRow = i % 10;
      const pSide = i < count / 2 ? -1 : 1;
      scratch.set(
        pSide * (3.4 + ((i * 7) % 3) * 0.12),
        2.1 - pRow * 0.46,
        -1.4 - Math.floor(i / 10) * 0.35,
      );
      target.lerp(scratch, wPay);
      sx = lerp(sx, 1.5, wPay);
      sy = lerp(sy, 0.2, wPay);
      tmp.lerp(i % 6 === 0 ? col.red : col.panelSoft, wPay * 0.85);

      /* Act 6 — analytics: cards grow into chart bars */
      const bCol = i % 12;
      const layer = Math.floor(i / 12);
      const barH = 0.5 + ((hash(bCol * 3 + layer) * 0.8 + 0.5) * (bCol % 5 === 0 ? 2.4 : 1.7));
      scratch.set((bCol - 5.5) * 0.72, -2.0 + barH / 2, -1.2 - layer * 0.9);
      target.lerp(scratch, wAna);
      sx = lerp(sx, 0.4, wAna);
      sy = lerp(sy, barH, wAna);
      tmp.lerp(
        bCol % 4 === 0 ? col.white : bCol % 3 === 0 ? col.panel : col.red,
        wAna * (layer === 0 ? 0.92 : 0.2),
      );
      if (layer > 0) tmp.multiplyScalar(lerp(1, 0.35, wAna));

      dummy.position.copy(target);
      const tilt = frame.reduced ? 0 : (1 - wDir) * (r3 - 0.5) * 1.2;
      dummy.rotation.set(tilt * 0.4, tilt, tilt * 0.15);
      dummy.scale.set(sx, sy, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, tmp);
    }

    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    const mat = m.material as THREE.MeshBasicMaterial;
    const panelFocus = Math.max(
      bell(p, 0.15, 0.36, 0.3),
      bell(p, 0.33, 0.54, 0.3),
      bell(p, 0.51, 0.71, 0.3),
      bell(p, 0.67, 0.87, 0.3),
    );
    // Square cards start fully invisible and fade in with the first hint of scroll.
    const reveal = range(p, 0, 0.05);
    mat.opacity = lerp(0, 0.8, reveal) * lerp(1, 0.55, panelFocus);

  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Particle field — workforce data motes                                */
/* ------------------------------------------------------------------ */

function Particles({ frame, count }: { frame: Frame; count: number }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (hash(i) - 0.5) * 26;
      arr[i * 3 + 1] = (hash(i + 13) - 0.5) * 14;
      arr[i * 3 + 2] = (hash(i + 29) - 0.5) * 18 - 4;
    }
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(base), [base]);

  useFrame(() => {
    const pts = points.current;
    if (!pts) return;
    const p = frame.p;
    const order = range(p, 0.02, 0.3);
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const gx = ((i % 40) - 19.5) * 0.62;
      const gy = (Math.floor(i / 40) % 20) * 0.62 - 6;
      const gz = -6 - (hash(i + 77) * 4);
      attr.setXYZ(
        i,
        lerp(base[i * 3] ?? 0, gx, order * 0.85),
        lerp(base[i * 3 + 1] ?? 0, gy, order * 0.85),
        lerp(base[i * 3 + 2] ?? 0, gz, order * 0.6),
      );
    }
    attr.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = lerp(0.85, 0.18, range(p, 0.12, 0.4)) + bell(p, 0.8, 1.0, 0.4) * 0.25;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={C.gray}
        transparent
        opacity={0.8}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Fine floor grid + data lines                                         */
/* ------------------------------------------------------------------ */

function GridFloor({ frame }: { frame: Frame }) {
  const ref = useRef<THREE.GridHelper>(null);
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, new THREE.Color(C.red), new THREE.Color("#4A2229"));
    const mat = g.material as THREE.Material;
    mat.transparent = true;
    mat.opacity = 0.12;
    return g;
  }, []);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const p = frame.p;
    g.position.set(0, -4.2 - p * 0.8, -4 + p * 6);
    const mat = g.material as THREE.Material;
    mat.opacity = 0.05 + range(p, 0.08, 0.35) * 0.1 + bell(p, 0.8, 1, 0.4) * 0.06;
  });

  return <primitive ref={ref} object={grid} />;
}

/* ------------------------------------------------------------------ */
/* Readable floating UI panels                                          */
/* ------------------------------------------------------------------ */

function Scene({ frame, mobile }: { frame: Frame; mobile: boolean }) {
  const { camera } = useThree();

  useFrame(() => {
    const p = frame.p;
    const amp = frame.reduced ? 0.15 : mobile ? 0.45 : 1;
    const x = (Math.sin(p * Math.PI * 2.2) * 1.9 + range(p, 0.6, 0.9) * -0.8) * amp;
    const y = (0.4 + Math.sin(p * Math.PI * 1.4) * 0.7 - range(p, 0.8, 1) * 0.5) * amp;
    const z = lerp(11.5, 7.4, smoothstep(p)) + bell(p, 0.28, 0.62, 0.5) * 1.4 + (mobile ? 3.4 : 0);
    camera.position.set(x, y, z);
    camera.lookAt(x * 0.22, y * 0.25 - 0.1 + range(p, 0.85, 1) * 0.2, -1.2);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 9, 30]} />
      <ambientLight intensity={1.1} />
      <pointLight position={[4, 4, 6]} intensity={40} color={C.red} distance={30} />
      <pointLight position={[-6, -2, 4]} intensity={22} color={C.red} distance={28} />

      <Particles frame={frame} count={mobile ? 420 : 900} />
      <GridFloor frame={frame} />
      <CardSystem frame={frame} count={mobile ? 48 : 84} />





    </>
  );
}

export default function FilmScene({
  progress,
  reduced,
  mobile,
}: {
  progress: React.RefObject<number>;
  reduced: boolean;
  mobile: boolean;
}) {
  const frame = useRef<Frame>({ p: 0, reduced, mobile }).current;

  function Sync() {
    useFrame(() => {
      const t = progress.current ?? 0;
      // Smoothly converges to the deterministic scroll value in both directions.
      frame.p = reduced ? t : frame.p + (t - frame.p) * 0.12;
      frame.reduced = reduced;
      frame.mobile = mobile;
    });
    return null;
  }

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      camera={{ fov: mobile ? 62 : 48, position: [0, 0, 11.5], near: 0.1, far: 100 }}
    >
      <Sync />
      <Scene frame={frame} mobile={mobile} />
      <EffectComposer>
        <Bloom intensity={0.42} luminanceThreshold={0.45} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
        <Noise opacity={0.035} />
      </EffectComposer>
    </Canvas>
  );
}
