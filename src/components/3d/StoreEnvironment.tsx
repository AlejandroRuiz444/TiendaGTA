'use client'

import { useRef } from 'react'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { ProductMesh } from './ProductMesh'
import { mockProducts } from '@/lib/mockProducts'

const STORE_WIDTH  = 20
const STORE_DEPTH  = 24
const STORE_HEIGHT = 5

export function StoreEnvironment() {
  const floorRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      {/* ── ENVIRONMENT MAP ── */}
      <Environment preset="city" />

      {/* ── PISO ── */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[STORE_WIDTH, STORE_DEPTH]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.3}
          metalness={0.5}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* ── TECHO ── */}
      <mesh position={[0, STORE_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[STORE_WIDTH, STORE_DEPTH]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ── PAREDES ── */}
      {/* Pared trasera */}
      <mesh position={[0, STORE_HEIGHT / 2, -STORE_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[STORE_WIDTH, STORE_HEIGHT]} />
        <meshStandardMaterial color="#16213e" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Pared frontal (con abertura — solo la renderizamos para colisión visual) */}
      <mesh position={[0, STORE_HEIGHT / 2, STORE_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[STORE_WIDTH, STORE_HEIGHT]} />
        <meshStandardMaterial color="#16213e" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Pared izquierda */}
      <mesh position={[-STORE_WIDTH / 2, STORE_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[STORE_DEPTH, STORE_HEIGHT]} />
        <meshStandardMaterial color="#0f3460" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Pared derecha */}
      <mesh position={[STORE_WIDTH / 2, STORE_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[STORE_DEPTH, STORE_HEIGHT]} />
        <meshStandardMaterial color="#0f3460" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* ── ESTANTES / VITRINAS ── */}
      <ShelfUnit position={[-5, 0, -8]} />
      <ShelfUnit position={[5,  0, -8]} />
      <ShelfUnit position={[-5, 0,  0]} />
      <ShelfUnit position={[5,  0,  0]} />

      {/* ── MOSTRADOR CENTRAL ── */}
      <mesh position={[0, 0.5, -6]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 1.5]} />
        <meshStandardMaterial color="#533483" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* ── LÍNEAS DE NEÓN EN EL PISO ── */}
      <NeonLine start={[-STORE_WIDTH / 2 + 0.5, 0.01, -STORE_DEPTH / 2 + 0.5]} end={[STORE_WIDTH / 2 - 0.5, 0.01, -STORE_DEPTH / 2 + 0.5]} color="#4facfe" />
      <NeonLine start={[-STORE_WIDTH / 2 + 0.5, 0.01,  STORE_DEPTH / 2 - 0.5]} end={[STORE_WIDTH / 2 - 0.5, 0.01,  STORE_DEPTH / 2 - 0.5]} color="#ff6a00" />

      {/* ── PRODUCTOS INTERACTIVOS ── */}
      {mockProducts.map(product => (
        <ProductMesh key={product.id} product={product} />
      ))}
    </group>
  )
}

// ── Vitrina/Estante reutilizable ──────────────────────────────────────────────
function ShelfUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.2, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Nivel 1 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Nivel 2 */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Columnas laterales */}
      <mesh position={[-1.2, 1.1, 0]} castShadow>
        <boxGeometry args={[0.1, 2.2, 1]} />
        <meshStandardMaterial color="#533483" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[1.2, 1.1, 0]} castShadow>
        <boxGeometry args={[0.1, 2.2, 1]} />
        <meshStandardMaterial color="#533483" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ── Línea de neón decorativa ──────────────────────────────────────────────────
function NeonLine({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end:   [number, number, number]
  color: string
}) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
  const lineObj  = new THREE.Line(geometry, material)

  return <primitive object={lineObj} />
}
