import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  change?: number
  icon?: React.ComponentType<{ className?: string }>
}

export default function MetricCard({ label, value, change, icon: Icon }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] text-text-secondary font-medium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
            <Icon className="w-4 h-4 text-text-tertiary" />
          </div>
        )}
      </div>
      <p className="text-[26px] font-semibold text-text-primary tracking-tight leading-none">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5">
          {change >= 0 ? (
            <div className="flex items-center gap-0.5 text-green">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[12px] font-semibold">+{change}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 text-red">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[12px] font-semibold">{change}%</span>
            </div>
          )}
          <span className="text-[12px] text-text-tertiary">vs last month</span>
        </div>
      )}
    </div>
  )
}
