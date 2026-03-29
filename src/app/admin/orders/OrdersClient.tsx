'use client'

import { useState } from 'react'
import { Search, ChevronDown, Eye, X } from 'lucide-react'
import Badge, { orderStatusBadge } from '@/components/admin/Badge'
import { cn } from '@/lib/cn'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id:            string
  user_id:       string | null
  items:         Array<{ name: string; price: number; quantity: number }> | null
  total:         number | null
  status:        OrderStatus
  payment_id:    string | null
  shipping_data: Record<string, string> | null
  created_at:    string
}

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Pendiente',
  paid:      'Pagado',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

interface Props {
  initialOrders: Order[]
}

export default function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders]         = useState<Order[]>(initialOrders)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState<string>('all')
  const [detailOrder, setDetail]    = useState<Order | null>(null)
  const [updating, setUpdating]     = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(search) ||
      o.shipping_data?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      o.payment_id?.includes(search)
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdating(id)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated: Order = await res.json()
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
      if (detailOrder?.id === id) setDetail(updated)
    }
    setUpdating(null)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">Órdenes</h1>
        <p className="text-zinc-400 text-sm mt-1">{orders.length} órdenes en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID, nombre o pago…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6a00]/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff6a00]/50"
        >
          <option value="all" className="bg-[#0d0d1f]">Todos los estados</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s} className="bg-[#0d0d1f]">{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">ID</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">Cliente</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">Estado</th>
                <th className="px-6 py-3 text-right text-zinc-400 font-medium">Total</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">Fecha</th>
                <th className="px-6 py-3 text-center text-zinc-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-3 font-mono text-zinc-400 text-xs">{order.id.slice(0, 8)}…</td>
                  <td className="px-6 py-3 text-white">
                    {order.shipping_data?.nombre ?? <span className="text-zinc-500">Guest</span>}
                  </td>
                  <td className="px-6 py-3">
                    {/* Dropdown de estado */}
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        className={cn(
                          'appearance-none pl-2 pr-6 py-1 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none transition-all',
                          order.status === 'paid' || order.status === 'delivered'
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : order.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : order.status === 'shipped'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30',
                        )}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} className="bg-[#0d0d1f] text-white">{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-bold">${order.total?.toLocaleString('es-AR')}</td>
                  <td className="px-6 py-3 text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => setDetail(order)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d1f] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-black">Detalle de orden</h2>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ID + Estado */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400">{detailOrder.id}</span>
                <Badge variant={orderStatusBadge(detailOrder.status)}>
                  {STATUS_LABELS[detailOrder.status]}
                </Badge>
              </div>

              {/* Productos */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Productos</p>
                <div className="space-y-2">
                  {(detailOrder.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                      <span className="text-white">{item.name} <span className="text-zinc-500">×{item.quantity}</span></span>
                      <span className="font-bold">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-black mt-3 pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#ff6a00]">${detailOrder.total?.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Envío */}
              {detailOrder.shipping_data && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Datos de envío</p>
                  <div className="bg-white/5 rounded-xl p-4 space-y-1 text-sm">
                    {Object.entries(detailOrder.shipping_data).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-zinc-400 capitalize">{k}</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pago */}
              {detailOrder.payment_id && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">ID de pago</p>
                  <p className="font-mono text-xs text-zinc-300 break-all">{detailOrder.payment_id}</p>
                </div>
              )}

              {/* Cambiar estado */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      disabled={detailOrder.status === s || updating === detailOrder.id}
                      onClick={() => updateStatus(detailOrder.id, s)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        detailOrder.status === s
                          ? 'bg-[#ff6a00]/15 text-[#ff6a00] border-[#ff6a00]/30'
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white',
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
