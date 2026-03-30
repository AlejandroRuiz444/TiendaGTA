'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

const icons = { success: '✓', error: '✕', info: 'ℹ' }
const colors = {
  success: 'border-green-500/50 bg-green-500/10 text-green-400',
  error:   'border-red-500/50   bg-red-500/10   text-red-400',
  info:    'border-blue-500/50  bg-blue-500/10  text-blue-400',
}

export function ToastNotification() {
  const toasts      = useToastStore(s => s.toasts)
  const removeToast = useToastStore(s => s.removeToast)

  return (
    <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1   }}
            exit={{    opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md cursor-pointer max-w-xs shadow-xl ${colors[toast.type]}`}
          >
            <span className="text-lg font-black">{icons[toast.type]}</span>
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
