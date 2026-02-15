import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  change?: number
}

export default function MetricCard({ label, value, change }: Props) {
  return (
    <div className="card p-5">
      <p className="text-[12px] font-medium text-[#8a8a8a] mb-2">{label}</p>
      <p className="text-[24px] font-semibold text-[#303030] tracking-tight leading-none">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-[#047b5d]" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-[#e22c38]" />
          )}
          <span className={`text-[12px] font-medium ${change >= 0 ? 'text-[#047b5d]' : 'text-[#e22c38]'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[11px] text-[#8a8a8a]">vs last period</span>
        </div>
      )}
    </div>
  )
}
