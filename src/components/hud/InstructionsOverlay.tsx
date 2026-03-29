'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'

export function InstructionsOverlay() {
  const isPointerLocked = usePlayerStore(s => s.isPointerLocked)

  return (
    <AnimatePresence>
      {!isPointerLocked && (
        <motion.div
          key="instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer select-none"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 text-center px-8"
          >
            {/* Título */}
            <h2 className="text-4xl font-black text-white tracking-widest uppercase">
              TIENDA<span className="text-[#ff6a00]">GTA</span>
            </h2>

            {/* Instrucciones */}
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-300 max-w-xs">
              <Key label="W A S D" desc="Moverte" />
              <Key label="MOUSE"   desc="Mirar" />
              <Key label="CLICK"   desc="Interactuar" />
              <Key label="ESC"     desc="Pausar" />
            </div>

            {/* Botón de entrada */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 px-10 py-4 bg-[#ff6a00] text-white font-bold text-base rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] transition-shadow"
            >
              CLICK PARA ENTRAR
            </motion.button>

            <p className="text-zinc-500 text-xs">Presiona ESC en cualquier momento para salir</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Tecla individual ──────────────────────────────────────────────────────────
function Key({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="px-3 py-1 bg-zinc-800 border border-zinc-600 rounded text-white font-mono text-xs font-bold">
        {label}
      </span>
      <span className="text-zinc-400 text-xs">{desc}</span>
    </div>
  )
}
