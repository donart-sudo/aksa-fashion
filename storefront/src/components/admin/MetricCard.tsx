import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  change?: number
}

export default function MetricCard({ label, value, change }: Props) {
  return (
    <div className="card p-4">
      <p className="text-[13px] text-ink-light mb-2">{label}</p>
      <p className="text-[24px] font-semibold text-ink tracking-tight leading-none">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-ok" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-crit" />
          )}
          <span className={`text-[12px] font-medium ${change >= 0 ? 'text-ok' : 'text-crit'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[12px] text-ink-faint">vs last month</span>
        </div>
      )}
    </div>
  )
}
