'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore } from '@/store/playerStore'

// ── Límites del mapa (tienda 20x24) ──────────────────────────────────────────
const BOUNDS = { minX: -9, maxX: 9, minZ: -11, maxZ: 10 }
const PLAYER_HEIGHT = 1.7
const MOVE_SPEED    = 5

// ── Vectores pre-alocados fuera del loop para evitar presión en el GC ─────────
// (siguiendo la guía de pitfalls de R3F)
const _front     = new THREE.Vector3()
const _side      = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _euler     = new THREE.Euler(0, 0, 0, 'YXZ')

export function PlayerController() {
  const { camera } = useThree()
  const isPointerLocked = usePlayerStore(s => s.isPointerLocked)

  // Mapa de teclas presionadas — useRef, NO useState, para no triggerear re-renders
  const keys = useRef({
    forward:  false,
    backward: false,
    left:     false,
    right:    false,
  })

  // ── Listeners de teclado ──────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.forward  = true; break
        case 'KeyS': case 'ArrowDown':  keys.current.backward = true; break
        case 'KeyA': case 'ArrowLeft':  keys.current.left     = true; break
        case 'KeyD': case 'ArrowRight': keys.current.right    = true; break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.forward  = false; break
        case 'KeyS': case 'ArrowDown':  keys.current.backward = false; break
        case 'KeyA': case 'ArrowLeft':  keys.current.left     = false; break
        case 'KeyD': case 'ArrowRight': keys.current.right    = false; break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [])

  // ── Loop de movimiento ────────────────────────────────────────────────────
  // Siguiendo R3F pitfalls: mutamos camera directamente, jamás setState aquí
  useFrame((_, delta) => {
    if (!isPointerLocked) return

    const k = keys.current
    const moving = k.forward || k.backward || k.left || k.right
    if (!moving) return

    // Proyectamos solo el eje Y de la cámara (yaw) para movimiento horizontal
    // Ignoramos pitch para no "volar" al mirar arriba/abajo
    _euler.set(0, camera.rotation.y, 0, 'YXZ')

    _front.set(0, 0, (k.backward ? 1 : 0) - (k.forward  ? 1 : 0))
    _side .set((k.left ? 1 : 0) - (k.right ? 1 : 0), 0, 0)

    _direction
      .addVectors(_front, _side)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta)
      .applyEuler(_euler)

    // Aplicar movimiento y clampear dentro de los límites de la tienda
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x + _direction.x,
      BOUNDS.minX, BOUNDS.maxX
    )
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z + _direction.z,
      BOUNDS.minZ, BOUNDS.maxZ
    )

    // Mantener altura fija (sin gravedad ni salto)
    camera.position.y = PLAYER_HEIGHT
  })

  return null
}
