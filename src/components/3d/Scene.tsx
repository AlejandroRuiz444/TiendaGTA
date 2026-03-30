'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  PerformanceMonitor,
  AdaptiveDpr,
  AdaptiveEvents,
  Stats,
  PointerLockControls,
  Preload,
} from '@react-three/drei'
import * as THREE from 'three'
import { Lights } from './Lights'
import { StoreEnvironment } from './StoreEnvironment'
import { PlayerController } from './PlayerController'
import { RaycastController } from './RaycastController'
import { usePlayerStore } from '@/store/playerStore'
import { useProductStore } from '@/store/productStore'
import { mockProducts } from '@/lib/mockProducts'
import { Product } from '@/types'

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#533483" wireframe />
    </mesh>
  )
}

export function Scene() {
  const [dpr, setDpr]      = useState(1.5)
  const setPointerLocked   = usePlayerStore(s => s.setPointerLocked)
  const setProducts        = useProductStore(s => s.setProducts)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('API error')
        const { data } = await res.json()
        setProducts(data && data.length > 0 ? (data as Product[]) : mockProducts)
      } catch {
        console.warn('[Scene] Usando productos mock — ejecuta supabase-schema.sql')
        setProducts(mockProducts)
      }
    }
    loadProducts()
  }, [setProducts])

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 8] }}
      dpr={dpr}
      // performance.min: 0.5 — DPR bajará a la mitad durante movimiento/regress
      performance={{ min: 0.5 }}
      gl={{
        antialias: true,
        toneMapping: THREE.AgXToneMapping,
        toneMappingExposure: 1.0,
        // Potencia de 2 para mejor rendimiento en GPUs móviles
        powerPreference: 'high-performance',
      }}
      style={{ background: '#0a0a1a' }}
    >
      {/*
        PerformanceMonitor: mide FPS promedio y ajusta gradualmente el DPR.
        - onIncline: FPS estable alto → sube calidad
        - onDecline: FPS bajo → baja calidad
        - flipflops: 3 → si ping-ponguea 3 veces, aplica fallback a DPR 1
      */}
      <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr(Math.min(dpr + 0.5, 2))}
        onDecline={() => setDpr(Math.max(dpr - 0.5, 1))}
        onFallback={() => setDpr(1)}
      />

      {/*
        AdaptiveDpr: multiplica el DPR del Canvas por state.performance.current.
        Cuando PlayerController llama regress(), current baja a min (0.5),
        reduciendo la resolución a la mitad durante el movimiento.
      */}
      <AdaptiveDpr pixelated />

      {/*
        AdaptiveEvents: pausa el sistema de eventos (raycasting de R3F)
        mientras performance.current < 1 (durante regress).
        Nuestro propio RaycastController es manual y no se ve afectado.
      */}
      <AdaptiveEvents />

      <PointerLockControls
        onLock={() => setPointerLocked(true)}
        onUnlock={() => setPointerLocked(false)}
      />

      <PlayerController />
      <RaycastController />

      <Suspense fallback={<LoadingFallback />}>
        <Lights />
        <StoreEnvironment />
        <Preload all />
      </Suspense>

      {process.env.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  )
}
