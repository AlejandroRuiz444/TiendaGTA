'use client'

import dynamic from 'next/dynamic'
import { HUD } from '@/components/hud/HUD'

// Canvas de Three.js solo corre en el cliente — patrón del skill react-three-next
const Scene = dynamic(
  () => import('@/components/3d/Scene').then(m => m.Scene),
  { ssr: false }
)

export default function StorePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Canvas 3D */}
      <Scene />

      {/* HUD completo: instrucciones, crosshair, panel de producto, carrito, toasts, total */}
      <HUD />
    </main>
  )
}
