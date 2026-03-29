'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { usePlayerStore } from '@/store/playerStore'

export function CartWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const isPointerLocked = usePlayerStore(s => s.isPointerLocked)
  const items           = useCartStore(s => s.items)
  const removeItem      = useCartStore(s => s.removeItem)
  const updateQuantity  = useCartStore(s => s.updateQuantity)
  const total           = useCartStore(s => s.total)
  const itemCount       = useCartStore(s => s.itemCount)

  // Cerrar panel cuando se entra al modo 3D
  if (isPointerLocked && isOpen) setIsOpen(false)

  return (
    <>
      {/* ── Botón del carrito ─────────────────────────────────────────── */}
      <motion.button
        whileHover={!isPointerLocked ? { scale: 1.1 } : {}}
        whileTap={!isPointerLocked  ? { scale: 0.95 } : {}}
        onClick={() => !isPointerLocked && setIsOpen(o => !o)}
        className={`absolute top-4 right-4 z-30 w-12 h-12 rounded-full bg-black/70 border backdrop-blur-md flex items-center justify-center transition-colors ${
          isPointerLocked
            ? 'border-white/10 cursor-default'
            : 'border-white/20 hover:border-[#ff6a00] cursor-pointer'
        }`}
        aria-label="Carrito de compras"
      >
        <span className="text-xl">🛒</span>

        {/* Badge con cantidad */}
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6a00] rounded-full text-white text-xs font-black flex items-center justify-center"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Panel lateral del carrito ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && !isPointerLocked && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-80 z-30 bg-[#0d0d1a]/95 border-l border-white/10 backdrop-blur-xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-black text-lg">
                  🛒 Carrito
                  <span className="ml-2 text-sm text-zinc-400 font-normal">
                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-500"
                    >
                      <span className="text-4xl">🛒</span>
                      <p className="text-sm">Tu carrito está vacío</p>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-[#ff6a00] text-xs hover:underline"
                      >
                        Seguir explorando
                      </button>
                    </motion.div>
                  ) : (
                    items.map(item => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                      >
                        {/* Icono */}
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🎮</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[#ff6a00] text-sm font-bold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>

                          {/* Controles cantidad */}
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Eliminar */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors text-sm flex-shrink-0 self-start"
                        >
                          🗑
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer con total y checkout */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-white">
                    <span className="text-zinc-400">Total</span>
                    <span className="font-black text-xl text-[#ff6a00]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full py-3 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-bold text-sm text-center rounded-xl transition-colors"
                  >
                    Ir al Checkout →
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2 text-zinc-400 hover:text-white text-xs text-center transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
