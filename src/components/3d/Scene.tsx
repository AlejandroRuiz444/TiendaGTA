'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Stats, PointerLockControls, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { Lights } from './Lights'
import { StoreEnvironment } from './StoreEnvironment'
import { PlayerController } from './PlayerController'
import { RaycastController } from './RaycastController'
import { usePlayerStore } from '@/store/playerStore'
import { useProductStore } from '@/store/productStore'
import { mockProducts } from '@/lib/mockProducts'

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#533483" wireframe />
    </mesh>
  )
}

export function Scene() {
  const [dpr, setDpr] = useState<[number, number]>([1, 2])
  const setPointerLocked = usePlayerStore(s => s.setPointerLocked)
  const setProducts      = useProductStore(s => s.setProducts)

  useEffect(() => {
    setProducts(mockProducts)
  }, [setProducts])

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 8] }}
      dpr={dpr}
      gl={{
        antialias: true,
        // AgXToneMapping — aprendido del skill react-three-next
        // Más moderno que ACESFilmic: mejor manejo de altas luces y colores saturados
        toneMapping: THREE.AgXToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ background: '#0a0a1a' }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr([1, 2])}
        onDecline={() => setDpr([1, 1])}
      />

      <PointerLockControls
        onLock={() => setPointerLocked(true)}
        onUnlock={() => setPointerLocked(false)}
      />

      <PlayerController />
      <RaycastController />

      <Suspense fallback={<LoadingFallback />}>
        <Lights />
        <StoreEnvironment />
        {/* Preload all — del skill react-three-next: precarga todos los assets */}
        <Preload all />
      </Suspense>

      {process.env.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  )
}
