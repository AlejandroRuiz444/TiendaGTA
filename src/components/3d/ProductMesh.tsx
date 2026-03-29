'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Product } from '@/types'
import { productMeshRegistry } from '@/lib/productMeshRegistry'

// ── Geometrías por categoría — una instancia por tipo, compartida ─────────────
// (per R3F scaling-performance: re-use geometries and materials)
const GEOMETRIES: Record<string, THREE.BufferGeometry> = {
  ropa:       new THREE.BoxGeometry(0.5, 0.6, 0.3),
  calzado:    new THREE.BoxGeometry(0.6, 0.25, 0.3),
  accesorios: new THREE.SphereGeometry(0.25, 16, 16),
  joyeria:    new THREE.TorusGeometry(0.2, 0.06, 12, 48),
  // GTA categories
  electronics: new THREE.BoxGeometry(0.4, 0.3, 0.2),
  weapons:     new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8),
  vehicles:    new THREE.BoxGeometry(0.6, 0.3, 0.4),
  clothing:    new THREE.BoxGeometry(0.4, 0.5, 0.15),
  food:        new THREE.SphereGeometry(0.2, 12, 12),
  default:     new THREE.BoxGeometry(0.4, 0.4, 0.4),
}

// ── Materiales compartidos por categoría — evita N instancias iguales ─────────
const MATERIALS: Record<string, THREE.MeshStandardMaterial> = {
  ropa:        new THREE.MeshStandardMaterial({ color: '#e63946', emissive: '#e63946', emissiveIntensity: 0, roughness: 0.3, metalness: 0.6 }),
  calzado:     new THREE.MeshStandardMaterial({ color: '#457b9d', emissive: '#457b9d', emissiveIntensity: 0, roughness: 0.3, metalness: 0.6 }),
  accesorios:  new THREE.MeshStandardMaterial({ color: '#2a9d8f', emissive: '#2a9d8f', emissiveIntensity: 0, roughness: 0.3, metalness: 0.6 }),
  joyeria:     new THREE.MeshStandardMaterial({ color: '#e9c46a', emissive: '#e9c46a', emissiveIntensity: 0, roughness: 0.3, metalness: 0.6 }),
  electronics: new THREE.MeshStandardMaterial({ color: '#4cc9f0', emissive: '#4cc9f0', emissiveIntensity: 0, roughness: 0.3, metalness: 0.7 }),
  weapons:     new THREE.MeshStandardMaterial({ color: '#ff4d4d', emissive: '#ff4d4d', emissiveIntensity: 0, roughness: 0.2, metalness: 0.8 }),
  vehicles:    new THREE.MeshStandardMaterial({ color: '#f4a261', emissive: '#f4a261', emissiveIntensity: 0, roughness: 0.4, metalness: 0.5 }),
  clothing:    new THREE.MeshStandardMaterial({ color: '#e63946', emissive: '#e63946', emissiveIntensity: 0, roughness: 0.5, metalness: 0.3 }),
  food:        new THREE.MeshStandardMaterial({ color: '#2dc653', emissive: '#2dc653', emissiveIntensity: 0, roughness: 0.7, metalness: 0.1 }),
  default:     new THREE.MeshStandardMaterial({ color: '#7209b7', emissive: '#7209b7', emissiveIntensity: 0, roughness: 0.3, metalness: 0.6 }),
}

interface ProductMeshProps {
  product: Product
}

export function ProductMesh({ product }: ProductMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Fase aleatoria por producto para que no floten todos en sincronía
  // useMemo garantiza que no cambia entre renders
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const baseY = product.position_3d?.y ?? 1.5

  const geometry = GEOMETRIES[product.category ?? 'default'] ?? GEOMETRIES.default
  // Clonar el material para este producto: necesitamos emissiveIntensity independiente
  // (el raycaster mutará SOLO el de este mesh, no el compartido)
  const material = useMemo(() => {
    const base = MATERIALS[product.category ?? 'default'] ?? MATERIALS.default
    return base.clone()
  }, [product.category])

  // Registrar en el registry al montar — O(1) lookup por id
  useEffect(() => {
    if (meshRef.current) {
      productMeshRegistry.register(product.id, meshRef.current)
    }
    return () => {
      productMeshRegistry.unregister(product.id)
      // Liberar el material clonado al desmontar (el shared no se toca)
      material.dispose()
    }
  }, [product.id, material])

  // Animación de flotación — mutación directa sin setState (per R3F pitfalls)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 1.5 + phase) * 0.08
    meshRef.current.rotation.y += 0.008
  })

  return (
    <mesh
      ref={meshRef}
      position={[product.position_3d?.x ?? 0, baseY, product.position_3d?.z ?? 0]}
      geometry={geometry}
      material={material}
      castShadow
      frustumCulled
      userData={{ isProduct: true, productId: product.id }}
    />
  )
}
