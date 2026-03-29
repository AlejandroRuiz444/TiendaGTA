'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Product } from '@/types'
import { productMeshRegistry } from '@/lib/productMeshRegistry'

// Geometría por categoría — creadas una sola vez (no en render, per pitfalls)
const geometries: Record<string, THREE.BufferGeometry> = {
  ropa:        new THREE.BoxGeometry(0.5, 0.6, 0.3),
  calzado:     new THREE.BoxGeometry(0.6, 0.25, 0.3),
  accesorios:  new THREE.SphereGeometry(0.25, 16, 16),
  joyeria:     new THREE.TorusGeometry(0.2, 0.06, 12, 48),
  default:     new THREE.BoxGeometry(0.4, 0.4, 0.4),
}

// Color por categoría
const colors: Record<string, string> = {
  ropa:       '#e63946',
  calzado:    '#457b9d',
  accesorios: '#2a9d8f',
  joyeria:    '#e9c46a',
  default:    '#7209b7',
}

interface ProductMeshProps {
  product: Product
}

export function ProductMesh({ product }: ProductMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Fase aleatoria por producto para que no floten todos en sincronía
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const baseY  = product.position_3d.y

  const geometry = geometries[product.category] ?? geometries.default
  const color    = colors[product.category]    ?? colors.default

  // Registrar en el registry al montar, limpiar al desmontar
  useEffect(() => {
    if (meshRef.current) {
      productMeshRegistry.register(product.id, meshRef.current)
    }
    return () => productMeshRegistry.unregister(product.id)
  }, [product.id])

  // Animación de flotación — mutación directa, sin setState (per R3F pitfalls)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 1.5 + phase) * 0.08
    meshRef.current.rotation.y += 0.008
  })

  return (
    <mesh
      ref={meshRef}
      position={[product.position_3d.x, baseY, product.position_3d.z]}
      geometry={geometry}
      castShadow
      userData={{ isProduct: true, productId: product.id }}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  )
}
