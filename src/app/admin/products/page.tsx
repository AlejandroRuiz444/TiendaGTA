import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <ProductsClient initialProducts={products ?? []} />
}
