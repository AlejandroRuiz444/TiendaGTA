'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  orderId: string
}

export default function PaymentForm({ orderId }: PaymentFormProps) {
  const stripe   = useStripe()
  const elements = useElements()
  const router   = useRouter()

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Error al procesar')
      setLoading(false)
      return
    }

    const baseUrl = window.location.origin
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/checkout/success?orderId=${orderId}&method=stripe`,
      },
    })

    // Si llegamos aquí, hubo un error (en éxito redirige automáticamente)
    if (confirmError) {
      setError(confirmError.message ?? 'Error al confirmar el pago')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
        >
          ❌ {error}
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full py-4 bg-[#ff6a00] hover:bg-[#ff8c38] disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-black rounded-xl transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.4)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Procesando pago...
          </span>
        ) : (
          '💳 Confirmar pago'
        )}
      </motion.button>
    </form>
  )
}
