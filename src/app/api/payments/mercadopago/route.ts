import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { CartItem } from '@/types'

// POST /api/payments/mercadopago — crear preferencia de pago
export async function POST(request: Request) {
  try {
    const { items, orderId, email } = await request.json() as {
      items:   CartItem[]
      orderId: string
      email:   string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items inválidos' }, { status: 400 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
    })

    const preference = new Preference(client)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const response = await preference.create({
      body: {
        items: items.map(item => ({
          id:          item.product.id,
          title:       item.product.name,
          quantity:    item.quantity,
          unit_price:  item.product.price,
          currency_id: 'COP',
        })),
        payer:         { email },
        external_reference: orderId,
        back_urls: {
          success: `${baseUrl}/checkout/success?orderId=${orderId}&method=mp`,
          failure: `${baseUrl}/checkout?error=mp_failed`,
          pending: `${baseUrl}/checkout/success?orderId=${orderId}&method=mp&status=pending`,
        },
        auto_return: 'approved',
        metadata:    { orderId },
      },
    })

    return NextResponse.json({
      preferenceId: response.id,
      initPoint:    response.init_point,
    })
  } catch (err) {
    console.error('[POST /api/payments/mercadopago]', err)
    return NextResponse.json({ error: 'Error al crear preferencia MercadoPago' }, { status: 500 })
  }
}
