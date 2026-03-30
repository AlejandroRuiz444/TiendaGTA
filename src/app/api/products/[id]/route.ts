import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/products/[id] — detalle de un producto
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/products/[id]]', err)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}
