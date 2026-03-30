'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useProductStore } from '@/store/productStore'
import { productMeshRegistry } from '@/lib/productMeshRegistry'

const MAX_DISTANCE = 5

// Pre-alocados fuera del componente — nunca recreados (per R3F pitfalls)
const _raycaster = new THREE.Raycaster()
const _center    = new THREE.Vector2(0, 0)
_raycaster.far   = MAX_DISTANCE

export function RaycastController() {
  const { camera } = useThree()
  const lastHitRef = useRef<THREE.Mesh | null>(null)

  // Click durante pointer lock — mousedown sigue disparándose
  useEffect(() => {
    const handleClick = () => {
      // Leer del store sin suscripción reactiva (per pitfalls: fetch state directly)
      const hovered = useProductStore.getState().hoveredProduct
      if (hovered) {
        useProductStore.getState().selectProduct(hovered)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  useFrame(() => {
    _raycaster.setFromCamera(_center, camera)

    const meshes  = productMeshRegistry.getMeshes()
    const hits    = _raycaster.intersectObjects(meshes, false)
    const newHit  = (hits[0]?.object as THREE.Mesh) ?? null

    // Solo actuar cuando cambia el objeto apuntado — no cada frame
    if (newHit === lastHitRef.current) return

    // Quitar highlight del mesh anterior
    if (lastHitRef.current) {
      const mat = lastHitRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0
    }

    // Aplicar highlight al nuevo mesh
    if (newHit) {
      const mat = newHit.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5
    }

    // Actualizar store con el producto apuntado
    const productId = newHit?.userData.productId ?? null
    const product   = productId
      ? useProductStore.getState().products.find(p => p.id === productId) ?? null
      : null

    useProductStore.getState().setHoveredProduct(product)
    lastHitRef.current = newHit
  })

  return null
}
