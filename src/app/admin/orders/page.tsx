import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return <OrdersClient initialOrders={orders ?? []} />
}
