'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Badge from '@/components/admin/Badge'
import { cn } from '@/lib/cn'
import type { Product } from '@/types'

const productSchema = z.object({
  name:        z.string().min(2, 'Mínimo 2 caracteres'),
  price:       z.string().transform(v => parseFloat(v)).pipe(z.number().positive('Debe ser mayor a 0')),
  description: z.string().optional(),
  category:    z.string().min(1, 'Selecciona una categoría'),
  stock:       z.string().transform(v => parseInt(v, 10)).pipe(z.number().int().nonnegative('No puede ser negativo')),
  image_url:   z.string().url('URL inválida').optional().or(z.literal('')),
})

type ProductFormInput  = z.input<typeof productSchema>
type ProductFormOutput = z.output<typeof productSchema>
type ProductForm = ProductFormInput

interface Props {
  initialProducts: Product[]
}

const CATEGORIES = ['electronics', 'weapons', 'vehicles', 'clothing', 'food']

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts]       = useState<Product[]>(initialProducts)
  const [search, setSearch]           = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<Product | null>(null)
  const [isPending, startTransition]  = useTransition()
  const [error, setError]             = useState<string | null>(null)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()),
  )

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '', price: '0', description: '', category: '', stock: '0', image_url: '' })
    setModalOpen(true)
    setError(null)
  }

  function openEdit(product: Product) {
    setEditing(product)
    reset({
      name:        product.name,
      price:       String(product.price),
      description: product.description ?? '',
      category:    product.category ?? '',
      stock:       String(product.stock ?? 0),
      image_url:   product.image_url ?? '',
    })
    setModalOpen(true)
    setError(null)
  }

  async function onSubmit(data: ProductFormOutput) {
    setError(null)
    const method = editing ? 'PUT' : 'POST'
    const url    = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Error al guardar')
      return
    }

    const updated: Product = await res.json()
    startTransition(() => {
      setProducts(prev =>
        editing
          ? prev.map(p => (p.id === updated.id ? updated : p))
          : [updated, ...prev],
      )
      setModalOpen(false)
    })
  }

  async function toggleActive(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !product.active }),
    })
    if (res.ok) {
      const updated: Product = await res.json()
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Productos</h1>
          <p className="text-zinc-400 text-sm mt-1">{products.length} productos en total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-bold rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o categoría…"
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6a00]/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">Producto</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-medium">Categoría</th>
                <th className="px-6 py-3 text-right text-zinc-400 font-medium">Precio</th>
                <th className="px-6 py-3 text-right text-zinc-400 font-medium">Stock</th>
                <th className="px-6 py-3 text-center text-zinc-400 font-medium">Estado</th>
                <th className="px-6 py-3 text-center text-zinc-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-3">
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-zinc-500 text-xs mt-0.5 truncate max-w-xs">{product.description}</div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant="info">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right font-bold">${product.price?.toLocaleString('es-AR')}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={cn(
                      'font-mono font-bold',
                      (product.stock ?? 0) < 5 ? 'text-red-400' : 'text-white',
                    )}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => toggleActive(product)} className="transition-opacity hover:opacity-70">
                      {product.active
                        ? <ToggleRight size={22} className="text-green-400 mx-auto" />
                        : <ToggleLeft  size={22} className="text-zinc-600 mx-auto" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d1f] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-black text-lg">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">Nombre *</label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50"
                  placeholder="Ej: AK-47 Dorada"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              {/* Precio + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-zinc-400">Precio *</label>
                  <input
                    {...register('price')}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50"
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-400">Stock *</label>
                  <input
                    {...register('stock')}
                    type="number"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50"
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-400 text-xs">{errors.stock.message}</p>}
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">Categoría *</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50 text-white"
                >
                  <option value="" className="bg-[#0d0d1f]">Seleccionar…</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#0d0d1f] capitalize">{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50 resize-none"
                  placeholder="Descripción del producto…"
                />
              </div>

              {/* URL imagen */}
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">URL de imagen</label>
                <input
                  {...register('image_url')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff6a00]/50"
                  placeholder="https://…"
                />
                {errors.image_url && <p className="text-red-400 text-xs">{errors.image_url.message}</p>}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-[#ff6a00] hover:bg-[#ff8c38] disabled:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                >
                  {isPending ? 'Guardando…' : editing ? 'Actualizar' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
