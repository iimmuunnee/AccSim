'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

interface PEBoxProps {
  position: [number, number, number]
  active: boolean
  utilization?: number
  showUtil?: boolean
  row: number
  col: number
}

function PEBox({ position, active, utilization = 0, showUtil = false, row, col }: PEBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetColor = active ? new THREE.Color('#3B82F6') : new THREE.Color('#27272A')
  const targetEmissive = active ? new THREE.Color('#1D4ED8') : new THREE.Color('#000000')

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.color.lerp(targetColor, 0.1)
      mat.emissive.lerp(targetEmissive, 0.1)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
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

  useFrame((_, delta) => {
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
              row={row}
              col={col}
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

export function SystolicScene({ n = 8, frames = [], utilization = [], showUtil = false, autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(autoPlay)
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    if (!playing || frames.length === 0) return
    const interval = setInterval(() => {
      setCurrentFrame((f) => (f + 1) % frames.length)
    }, 100)
    return () => clearInterval(interval)
  }, [playing, frames.length])

  const activeFrame = frames.length > 0 ? frames[currentFrame] : Array.from({ length: n }, () => Array(n).fill(0))

  return (
    <div className="relative w-full" style={{ height: '480px' }}>
      <Canvas
        camera={{ position: [0, 0, n * 1.6], fov: 50 }}
        shadows
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#3B82F6" />
        <PEGrid n={n} activeFrame={activeFrame} showUtil={showUtil} utilization={utilization} playing={playing} />
        <OrbitControls enablePan={false} minDistance={n * 0.8} maxDistance={n * 3} />
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
          onClick={() => { setCurrentFrame(0); setPlaying(false) }}
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
