'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BakeShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { ProductMesh } from './ProductMesh'
import { useProductStore } from '@/store/productStore'

const STORE_WIDTH  = 20
const STORE_DEPTH  = 24
const STORE_HEIGHT = 5

// ── Geometrías estáticas — creadas una vez al cargar el módulo ────────────────
// (per R3F scaling-performance: reuse geometries and materials)
const GEO = {
  floor:    new THREE.PlaneGeometry(STORE_WIDTH, STORE_DEPTH),
  ceiling:  new THREE.PlaneGeometry(STORE_WIDTH, STORE_DEPTH),
  wallWide: new THREE.PlaneGeometry(STORE_WIDTH, STORE_HEIGHT),
  wallTall: new THREE.PlaneGeometry(STORE_DEPTH, STORE_HEIGHT),
  // Shelf
  shelfPlank:  new THREE.BoxGeometry(2.5, 0.1, 1),
  shelfBase:   new THREE.BoxGeometry(2.5, 0.2, 1),
  shelfCol:    new THREE.BoxGeometry(0.1, 2.2, 1),
  // Counter
  counter:    new THREE.BoxGeometry(4, 1, 1.5),
}

// ── Materiales estáticos — compartidos entre todas las instancias ─────────────
const MAT = {
  floor:    new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.3, metalness: 0.5, envMapIntensity: 0.8 }),
  ceiling:  new THREE.MeshStandardMaterial({ color: '#0d0d1a', roughness: 0.9, metalness: 0.1 }),
  wallBack: new THREE.MeshStandardMaterial({ color: '#16213e', roughness: 0.7, metalness: 0.2 }),
  wallSide: new THREE.MeshStandardMaterial({ color: '#0f3460', roughness: 0.6, metalness: 0.3 }),
  shelfBody:  new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.5, metalness: 0.7 }),
  shelfAccent: new THREE.MeshStandardMaterial({ color: '#533483', roughness: 0.4, metalness: 0.8 }),
  counter:  new THREE.MeshStandardMaterial({ color: '#533483', roughness: 0.4, metalness: 0.6 }),
}

// ── Posiciones de los 4 estantes ─────────────────────────────────────────────
const SHELF_POSITIONS: [number, number, number][] = [
  [-5, 0, -8],
  [ 5, 0, -8],
  [-5, 0,  0],
  [ 5, 0,  0],
]

export function StoreEnvironment() {
  const products = useProductStore(s => s.products)

  return (
    <group>
      {/* Hornear sombras estáticas — las paredes/suelo nunca se mueven */}
      <BakeShadows />

      {/* Environment map */}
      <Environment preset="city" />

      {/* ── PISO ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={GEO.floor}
        material={MAT.floor}
        receiveShadow
      />

      {/* ── TECHO ── */}
      <mesh
        position={[0, STORE_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={GEO.ceiling}
        material={MAT.ceiling}
      />

      {/* ── PAREDES ── */}
      <mesh position={[0, STORE_HEIGHT / 2, -STORE_DEPTH / 2]}
            geometry={GEO.wallWide} material={MAT.wallBack} receiveShadow />
      <mesh position={[0, STORE_HEIGHT / 2,  STORE_DEPTH / 2]} rotation={[0, Math.PI, 0]}
            geometry={GEO.wallWide} material={MAT.wallBack} receiveShadow />
      <mesh position={[-STORE_WIDTH / 2, STORE_HEIGHT / 2, 0]} rotation={[0,  Math.PI / 2, 0]}
            geometry={GEO.wallTall} material={MAT.wallSide} receiveShadow />
      <mesh position={[ STORE_WIDTH / 2, STORE_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}
            geometry={GEO.wallTall} material={MAT.wallSide} receiveShadow />

      {/* ── ESTANTES ── */}
      {SHELF_POSITIONS.map((pos, i) => (
        <ShelfUnit key={i} position={pos} />
      ))}

      {/* ── MOSTRADOR CENTRAL ── */}
      <mesh position={[0, 0.5, -6]} geometry={GEO.counter} material={MAT.counter} castShadow receiveShadow />

      {/* ── LÍNEAS DE NEÓN ── */}
      <NeonLine
        start={[-STORE_WIDTH / 2 + 0.5, 0.01, -STORE_DEPTH / 2 + 0.5]}
        end={  [ STORE_WIDTH / 2 - 0.5, 0.01, -STORE_DEPTH / 2 + 0.5]}
        color="#4facfe"
      />
      <NeonLine
        start={[-STORE_WIDTH / 2 + 0.5, 0.01,  STORE_DEPTH / 2 - 0.5]}
        end={  [ STORE_WIDTH / 2 - 0.5, 0.01,  STORE_DEPTH / 2 - 0.5]}
        color="#ff6a00"
      />

      {/* ── PRODUCTOS ── (desde el store, con fallback a array vacío) */}
      {products.map(product => (
        <ProductMesh key={product.id} product={product} />
      ))}
    </group>
  )
}

// ── ShelfUnit: reutiliza las geometrías/materiales del módulo ─────────────────
function ShelfUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1,  0]} geometry={GEO.shelfBase}  material={MAT.shelfBody}   castShadow receiveShadow />
      <mesh position={[0, 1.2,  0]} geometry={GEO.shelfPlank} material={MAT.shelfBody}   castShadow receiveShadow />
      <mesh position={[0, 2.2,  0]} geometry={GEO.shelfPlank} material={MAT.shelfBody}   castShadow receiveShadow />
      <mesh position={[-1.2, 1.1, 0]} geometry={GEO.shelfCol} material={MAT.shelfAccent} castShadow />
      <mesh position={[ 1.2, 1.1, 0]} geometry={GEO.shelfCol} material={MAT.shelfAccent} castShadow />
    </group>
  )
}

// ── NeonLine: useMemo para no recrear geometría/material por render ───────────
function NeonLine({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end:   [number, number, number]
  color: string
}) {
  const lineObj = useMemo(() => {
    const points   = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
    return new THREE.Line(geometry, material)
  // start/end son literales constantes — no cambian jamás
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <primitive object={lineObj} />
}
