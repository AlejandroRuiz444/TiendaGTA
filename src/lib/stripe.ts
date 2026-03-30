import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Cliente servidor — lazy para evitar error en build cuando la key no está
let _stripe: Stripe | null = null

export function getStripeServer(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada')
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Exportación nombrada para compatibilidad con imports existentes
export const stripe = {
  get paymentIntents() { return getStripeServer().paymentIntents },
  get webhooks()       { return getStripeServer().webhooks },
} as unknown as Stripe

// Cliente browser — singleton para evitar múltiples instancias
let stripePromise: ReturnType<typeof loadStripe> | null = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
  }
  return stripePromise
}
