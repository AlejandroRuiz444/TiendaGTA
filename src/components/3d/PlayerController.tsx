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
// (per R3F pitfalls: pre-allocate outside component)
const _front     = new THREE.Vector3()
const _side      = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _euler     = new THREE.Euler(0, 0, 0, 'YXZ')

export function PlayerController() {
  const { camera } = useThree()
  const isPointerLocked = usePlayerStore(s => s.isPointerLocked)

  // regress(): baja el DPR mientras el jugador se mueve para mantener 60fps
  // (per R3F scaling-performance: movement regression)
  const regress = useThree(state => state.performance.regress)

  // Mapa de teclas — useRef, NO useState, para no triggerear re-renders
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
  useFrame((_, delta) => {
    if (!isPointerLocked) return

    const k      = keys.current
    const moving = k.forward || k.backward || k.left || k.right
    if (!moving) return

    // Llamar regress() en cada frame de movimiento para reducir DPR durante el
    // desplazamiento (Canvas tiene performance.min: 0.5 configurado)
    regress()

    _euler.set(0, camera.rotation.y, 0, 'YXZ')

    _front.set(0, 0, (k.backward ? 1 : 0) - (k.forward  ? 1 : 0))
    _side .set((k.left ? 1 : 0) - (k.right ? 1 : 0), 0, 0)

    _direction
      .addVectors(_front, _side)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta)
      .applyEuler(_euler)

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x + _direction.x,
      BOUNDS.minX, BOUNDS.maxX,
    )
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z + _direction.z,
      BOUNDS.minZ, BOUNDS.maxZ,
    )
    camera.position.y = PLAYER_HEIGHT
  })

  return null
}
