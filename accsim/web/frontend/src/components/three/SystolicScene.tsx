'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

/* Triggers a single render when deps change — no continuous loop */
function Invalidator({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => { invalidate() }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

interface PEBoxProps {
  position: [number, number, number]
  active: boolean
  utilization?: number
  showUtil?: boolean
}

function PEBox({ position, active, utilization = 0, showUtil = false }: PEBoxProps) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.9, 0.3]} />
        <meshStandardMaterial
          color={active ? '#3B82F6' : '#27272A'}
          emissive={active ? '#1D4ED8' : '#000000'}
          emissiveIntensity={active ? 0.6 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      {showUtil && (
        <Text
          position={[0, 0, 0.3]}
          fontSize={0.2}
          color={utilization > 0.7 ? '#10B981' : '#F59E0B'}
          anchorX="center"
          anchorY="middle"
        >
          {(utilization * 100).toFixed(0)}%
        </Text>
      )}
    </group>
  )
}

interface DataParticleProps {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  speed: number
  delay: number
}

function DataParticle({ start, end, color, speed, delay }: DataParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const tRef = useRef(delay)

  useFrame((_state, delta) => {
    tRef.current += delta * speed
    const t = (tRef.current % 1 + 1) % 1
    if (meshRef.current) {
      meshRef.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      )
    }
  })

  return (
    <mesh ref={meshRef} position={start}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  )
}

function GridFrame({ n }: { n: number }) {
  const S = 1.1
  const gridSize = (n - 1) * S + 0.9
  const margin = 0.15
  const w = gridSize + margin * 2
  const h = gridSize + margin * 2
  const half = gridSize / 2 + margin

  // Border corners (closed rectangle)
  const borderPoints: [number, number, number][] = [
    [-half, half, -0.15],
    [half, half, -0.15],
    [half, -half, -0.15],
    [-half, -half, -0.15],
    [-half, half, -0.15],
  ]

  // Activation zone: left strip
  const actW = 0.6
  const actX = -half - actW / 2

  // Psum zone: top strip
  const psumH = 0.6
  const psumY = half + psumH / 2

  return (
    <group>
      {/* Background plane */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#18181B" opacity={0.4} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Border */}
      <Line points={borderPoints} color="#3F3F46" lineWidth={1.5} />

      {/* Activation entry zone (left cyan strip) */}
      <mesh position={[actX, 0, -0.18]}>
        <planeGeometry args={[actW, h]} />
        <meshBasicMaterial color="#06B6D4" opacity={0.06} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Psum entry zone (top amber strip) */}
      <mesh position={[0, psumY, -0.18]}>
        <planeGeometry args={[w, psumH]} />
        <meshBasicMaterial color="#F59E0B" opacity={0.06} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function GridLabels({ n }: { n: number }) {
  const S = 1.1
  const gridSize = (n - 1) * S + 0.9
  const half = gridSize / 2 + 0.15
  const fontSize = Math.max(0.28, 0.5 - n * 0.015)

  return (
    <group>
      {/* "Activation →" label — left side, rotated vertically */}
      <Text
        position={[-half - 0.55, 0, 0]}
        fontSize={fontSize}
        color="#06B6D4"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        {'Activation'}
      </Text>

      {/* "↓ Partial Sum" label — top center */}
      <Text
        position={[0, half + 0.55, 0]}
        fontSize={fontSize}
        color="#F59E0B"
        anchorX="center"
        anchorY="middle"
      >
        {'Partial Sum'}
      </Text>

      {/* "↓ Output" label — bottom center */}
      <Text
        position={[0, -half - 0.55, 0]}
        fontSize={fontSize}
        color="#F59E0B"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.4}
      >
        {'Output'}
      </Text>

      {/* Row indices (left side) */}
      {n <= 8 &&
        Array.from({ length: n }).map((_, row) => (
          <Text
            key={`row-${row}`}
            position={[-half - 0.15, (n / 2 - row - 0.5) * S, 0]}
            fontSize={fontSize * 0.7}
            color="#A1A1AA"
            anchorX="right"
            anchorY="middle"
          >
            {`${row}`}
          </Text>
        ))}

      {/* Column indices (top side) */}
      {n <= 8 &&
        Array.from({ length: n }).map((_, col) => (
          <Text
            key={`col-${col}`}
            position={[(col - n / 2 + 0.5) * S, half + 0.15, 0]}
            fontSize={fontSize * 0.7}
            color="#A1A1AA"
            anchorX="center"
            anchorY="bottom"
          >
            {`${col}`}
          </Text>
        ))}
    </group>
  )
}

interface PEGridProps {
  n: number
  activeFrame: number[][]
  showUtil: boolean
  utilization?: number[][]
  playing: boolean
}

function PEGrid({ n, activeFrame, showUtil, utilization = [], playing }: PEGridProps) {
  const particles: React.ReactNode[] = []

  if (playing) {
    // Activation particles: left → right (cyan)
    for (let row = 0; row < n; row++) {
      particles.push(
        <DataParticle
          key={`act-${row}`}
          start={[(-n / 2 - 0.5) * 1.1, (n / 2 - row - 0.5) * 1.1, 0.3]}
          end={[(n / 2 + 0.5) * 1.1, (n / 2 - row - 0.5) * 1.1, 0.3]}
          color="#06B6D4"
          speed={0.3 + row * 0.02}
          delay={row * 0.15}
        />
      )
    }
    // Psum particles: top → bottom (amber)
    for (let col = 0; col < n; col++) {
      particles.push(
        <DataParticle
          key={`psum-${col}`}
          start={[(col - n / 2 + 0.5) * 1.1, (n / 2 + 0.5) * 1.1, 0.3]}
          end={[(col - n / 2 + 0.5) * 1.1, (-n / 2 - 0.5) * 1.1, 0.3]}
          color="#F59E0B"
          speed={0.25 + col * 0.02}
          delay={col * 0.12}
        />
      )
    }
  }

  return (
    <group>
      <GridFrame n={n} />
      <GridLabels n={n} />
      {Array.from({ length: n }).map((_, row) =>
        Array.from({ length: n }).map((_, col) => {
          const active = activeFrame?.[row]?.[col] === 1
          const util = utilization?.[row]?.[col] ?? 0
          return (
            <PEBox
              key={`${row}-${col}`}
              position={[(col - n / 2 + 0.5) * 1.1, (n / 2 - row - 0.5) * 1.1, 0]}
              active={active}
              utilization={util}
              showUtil={showUtil}
            />
          )
        })
      )}
      {particles}
    </group>
  )
}

interface Props {
  n?: number
  frames?: number[][][]
  utilization?: number[][]
  showUtil?: boolean
  autoPlay?: boolean
}

function SceneControls({ controlsRef, n }: { controlsRef: React.MutableRefObject<any>; n: number }) {
  const { camera, gl, invalidate } = useThree()

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enablePan = false
    controls.enableDamping = false
    controls.minDistance = n * 0.8
    controls.maxDistance = n * 3

    const onChange = () => invalidate()
    controls.addEventListener('change', onChange)
    controlsRef.current = controls

    return () => {
      controls.removeEventListener('change', onChange)
      controls.dispose()
    }
  }, [camera, gl, invalidate, n, controlsRef])

  return null
}

export function SystolicScene({ n = 8, frames = [], utilization = [], showUtil = false, autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(autoPlay)
  const [currentFrame, setCurrentFrame] = useState(0)
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (!playing || frames.length === 0) return
    const interval = setInterval(() => {
      setCurrentFrame((f) => (f + 1) % frames.length)
    }, 100)
    return () => clearInterval(interval)
  }, [playing, frames.length])

  const activeFrame = frames.length > 0 ? frames[currentFrame] : Array.from({ length: n }, () => Array(n).fill(0))

  return (
    <div className="relative w-full rounded-xl border border-border bg-surface2/60" style={{ height: '480px' }}>
      <Canvas
        frameloop={playing ? 'always' : 'demand'}
        camera={{ position: [0, 0, n * 1.8], fov: 50 }}
        shadows
        style={{ background: 'transparent' }}
      >
        <Invalidator deps={[n, currentFrame, showUtil, playing]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#3B82F6" />
        <PEGrid n={n} activeFrame={activeFrame} showUtil={showUtil} utilization={utilization} playing={playing} />
        <SceneControls controlsRef={controlsRef} n={n} />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-5 py-2 rounded-full bg-surface1 border border-border text-sm text-text-primary hover:border-accent-blue hover:text-accent-blue transition-all"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => { setCurrentFrame(0); setPlaying(false); controlsRef.current?.reset() }}
          className="px-5 py-2 rounded-full bg-surface1 border border-border text-sm text-text-muted hover:border-border hover:text-text-primary transition-all"
        >
          ↩ Reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-surface1/80 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
          <span className="text-text-muted">Active PE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#06B6D4]" />
          <span className="text-text-muted">Activation →</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="text-text-muted">Partial Sum ↓</span>
        </div>
      </div>
    </div>
  )
}
