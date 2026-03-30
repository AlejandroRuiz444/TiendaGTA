'use client'

import { Crosshair }          from './Crosshair'
import { ProductPanel }        from './ProductPanel'
import { CartWidget }          from './CartWidget'
import { ToastNotification }   from './ToastNotification'
import { InstructionsOverlay } from './InstructionsOverlay'
import { useCartStore }        from '@/store/cartStore'
import { usePlayerStore }      from '@/store/playerStore'

export function HUD() {
  const isPointerLocked = usePlayerStore(s => s.isPointerLocked)
  const total           = useCartStore(s => s.total)
  const itemCount       = useCartStore(s => s.itemCount)

  return (
    <>
      {/* Pantalla de instrucciones (aparece cuando no está en modo 3D) */}
      <InstructionsOverlay />

      {/* Crosshair central + label de producto apuntado */}
      <Crosshair />

      {/* Panel de detalle de producto (derecha) */}
      <ProductPanel />

      {/* Carrito: ícono siempre visible, panel cuando no está en modo 3D */}
      <CartWidget />

      {/* Toasts (esquina superior derecha, sobre el carrito) */}
      <ToastNotification />

      {/* Total flotante (visible en modo 3D cuando hay items) */}
      {isPointerLocked && itemCount > 0 && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-md">
            <span className="text-zinc-400 text-xs">Carrito:</span>
            <span className="text-[#ff6a00] text-sm font-black">${total.toFixed(2)}</span>
            <span className="text-zinc-500 text-xs">· {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      )}
    </>
  )
}
