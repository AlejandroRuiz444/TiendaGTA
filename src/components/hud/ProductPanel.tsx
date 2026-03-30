'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'

export function ProductPanel() {
  const selectedProduct  = useProductStore(s => s.selectedProduct)
  const selectProduct    = useProductStore(s => s.selectProduct)
  const addItem          = useCartStore(s => s.addItem)
  const addToast         = useToastStore(s => s.addToast)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded]       = useState(false)

  // Resetear cantidad al abrir un producto nuevo
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1)
      setAdded(false)
    }
  }, [selectedProduct?.id])

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && selectedProduct) selectProduct(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProduct, selectProduct])

  const handleAddToCart = () => {
    if (!selectedProduct) return
    addItem(selectedProduct, quantity)
    addToast(`${selectedProduct.name} añadido al carrito 🛒`, 'success')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <AnimatePresence>
      {selectedProduct && (
        <motion.div
          key={selectedProduct.id}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0,  opacity: 1 }}
          exit={{    x: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute top-1/2 right-6 -translate-y-1/2 z-20 w-72 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md p-5 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#ff6a00] font-bold uppercase tracking-widest mb-1">
                {selectedProduct.category}
              </p>
              <h3 className="text-xl font-black leading-tight">
                {selectedProduct.name}
              </h3>
            </div>
            <button
              onClick={() => selectProduct(null)}
              className="text-zinc-400 hover:text-white transition-colors text-xl leading-none mt-1"
            >
              ✕
            </button>
          </div>

          {/* Placeholder de imagen */}
          <div className="w-full h-32 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 border border-white/5">
            <span className="text-4xl">🎮</span>
          </div>

          {/* Descripción */}
          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            {selectedProduct.description}
          </p>

          {/* Precio y stock */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-black text-[#ff6a00]">
              ${selectedProduct.price.toFixed(2)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              selectedProduct.stock > 5
                ? 'bg-green-500/20 text-green-400'
                : selectedProduct.stock > 0
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}>
              {selectedProduct.stock > 0 ? `${selectedProduct.stock} en stock` : 'Agotado'}
            </span>
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-zinc-400 text-sm">Cantidad:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm transition-colors"
              >
                -
              </button>
              <span className="w-6 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Botón añadir */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={selectedProduct.stock === 0}
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : selectedProduct.stock === 0
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-[#ff6a00] hover:bg-[#ff8c38] text-white'
            }`}
          >
            {added ? '✓ Añadido al carrito' : 'Añadir al carrito'}
          </motion.button>

          <p className="text-zinc-600 text-xs text-center mt-3">ESC para cerrar</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
