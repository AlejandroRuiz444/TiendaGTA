import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'payment' && data?.id) {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
      })

      const payment     = new Payment(client)
      const paymentData = await payment.get({ id: data.id })

      const orderId = paymentData.external_reference
      const status  = paymentData.status // approved | rejected | pending

      if (orderId && status === 'approved') {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await admin
          .from('orders')
          .update({ status: 'paid', payment_id: String(paymentData.id) })
          .eq('id', orderId)

        if (error) {
          console.error('[Webhook MP] Error actualizando orden:', error)
        } else {
          console.log(`[Webhook MP] Orden ${orderId} marcada como pagada ✓`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook MercadoPago]', err)
    return NextResponse.json({ error: 'Error en webhook' }, { status: 500 })
  }
}
