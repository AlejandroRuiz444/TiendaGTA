import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatsCardProps {
  title:    string
  value:    string | number
  subtitle?: string
  icon:     LucideIcon
  color?:   'orange' | 'green' | 'blue' | 'purple'
}

const colorMap = {
  orange: 'bg-[#ff6a00]/10 text-[#ff6a00] border-[#ff6a00]/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'orange' }: StatsCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtitle && (
            <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl border', colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
