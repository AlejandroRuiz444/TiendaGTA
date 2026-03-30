'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useProductStore } from '@/store/productStore'
import { usePlayerStore } from '@/store/playerStore'

export function Crosshair() {
  const hoveredProduct   = useProductStore(s => s.hoveredProduct)
  const isPointerLocked  = usePlayerStore(s => s.isPointerLocked)
  const isHovering       = !!hoveredProduct

  if (!isPointerLocked) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
      {/* Cruz */}
      <div className="relative w-5 h-5">
        <motion.div
          animate={{ backgroundColor: isHovering ? '#ff6a00' : '#ffffff', scaleX: isHovering ? 1.4 : 1 }}
          transition={{ duration: 0.15 }}
          className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 opacity-80"
        />
        <motion.div
          animate={{ backgroundColor: isHovering ? '#ff6a00' : '#ffffff', scaleY: isHovering ? 1.4 : 1 }}
          transition={{ duration: 0.15 }}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-80"
        />
      </div>

      {/* Etiqueta de producto apuntado */}
      <AnimatePresence>
        {hoveredProduct && (
          <motion.div
            key={hoveredProduct.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-1 mt-1"
          >
            <span className="text-white text-sm font-bold drop-shadow-lg">
              {hoveredProduct.name}
            </span>
            <span className="text-[#ff6a00] text-xs font-bold">
              ${hoveredProduct.price.toFixed(2)}
            </span>
            <span className="text-zinc-400 text-xs">
              Click para ver detalles
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
