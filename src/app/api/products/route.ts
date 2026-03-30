import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/products — listar todos los productos activos
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/products]', err)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
