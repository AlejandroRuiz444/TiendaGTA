'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const items          = useCartStore(s => s.items)
  const removeItem     = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const clearCart      = useCartStore(s => s.clearCart)
  const total          = useCartStore(s => s.total)
  const itemCount      = useCartStore(s => s.itemCount)

  const shipping = total > 150 ? 0 : 12.99
  const grandTotal = total + shipping

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/store" className="text-xl font-black">
            TIENDA<span className="text-[#ff6a00]">GTA</span>
          </Link>
          <h1 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Carrito de compras
          </h1>
          <Link href="/store" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Seguir comprando
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          /* Carrito vacío */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-6 text-center"
          >
            <span className="text-7xl">🛒</span>
            <h2 className="text-2xl font-black text-white">Tu carrito está vacío</h2>
            <p className="text-zinc-400 max-w-sm">
              Entra a la tienda 3D y explora nuestros productos exclusivos.
            </p>
            <Link
              href="/store"
              className="px-8 py-3 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-bold rounded-full transition-colors"
            >
              Ir a la tienda
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Lista de items ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                </h2>
                <button
                  onClick={clearCart}
                  className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    {/* Imagen / placeholder */}
                    <div className="w-20 h-20 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center border border-white/5">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🎮</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#ff6a00] uppercase font-bold tracking-wider mb-1">
                        {item.product.category}
                      </p>
                      <h3 className="font-bold text-white truncate">{item.product.name}</h3>
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                        {item.product.description}
                      </p>

                      {/* Controles cantidad */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-zinc-400 hover:text-white w-5 font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="text-white font-bold w-5 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-zinc-400 hover:text-white w-5 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-zinc-600 hover:text-red-400 text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#ff6a00] font-black text-lg">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">
                        ${item.product.price.toFixed(2)} c/u
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Resumen del pedido ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-black text-lg">Resumen del pedido</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Envío</span>
                    <span className={shipping === 0 ? 'text-green-400 font-bold' : 'text-white'}>
                      {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-zinc-600 text-xs">
                      Envío gratis en pedidos mayores a $150
                    </p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-[#ff6a00] font-black text-2xl">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-4 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-black text-center rounded-xl transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.4)]"
                >
                  Proceder al pago →
                </Link>

                <Link
                  href="/store"
                  className="block w-full py-3 text-zinc-400 hover:text-white text-center text-sm transition-colors"
                >
                  ← Seguir comprando
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
