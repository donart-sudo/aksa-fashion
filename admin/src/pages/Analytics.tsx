import { Users, Eye, Monitor, MousePointerClick, Globe } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import {
  revenueData, dailyVisitors, trafficSources, conversionFunnel,
  topPages, geoData, formatCurrency,
} from '../data/sampleData'

const funnelColors = ['#5c6ac4', '#7b83d4', '#9ba0de', '#bbbfe8', '#d4d6f0']

const metrics = [
  { label: 'Total Visitors', value: '3,054', change: 18.4, icon: Users },
  { label: 'Page Views', value: '8,127', change: 22.1, icon: Eye },
  { label: 'Bounce Rate', value: '32.4%', change: -4.2, icon: Monitor },
  { label: 'Conversion Rate', value: '1.7%', change: 0.3, icon: MousePointerClick },
]

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => <MetricCard key={m.label} label={m.label} value={m.value} change={m.change} icon={m.icon} />)}
      </div>

      {/* Visitors Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">Daily Visitors & Page Views</h3>
            <p className="text-[12px] text-text-tertiary mt-0.5">February 2026</p>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" />Visitors</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-border-dark" />Page views</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dailyVisitors}>
            <defs>
              <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5c6ac4" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#5c6ac4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9cccf" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#c9cccf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }} />
            <Area type="monotone" dataKey="pageViews" stroke="#c9cccf" strokeWidth={1.5} fill="url(#pvGrad)" />
            <Area type="monotone" dataKey="visitors" stroke="#5c6ac4" strokeWidth={2} fill="url(#vGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Traffic Sources</h3>
          <div className="space-y-3.5">
            {trafficSources.map(s => {
              const max = Math.max(...trafficSources.map(x => x.visitors))
              return (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-text-primary">{s.source}</span>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-text-secondary">{s.visitors.toLocaleString()}</span>
                      <span className="font-semibold text-green">{s.conversion}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(s.visitors / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionFunnel} layout="vertical" barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: '#616161' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }}
                formatter={(v: number, _n: string, p: { payload?: { pct: number } }) => [`${v.toLocaleString()} (${p.payload?.pct ?? 0}%)`, 'Users']}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {conversionFunnel.map((_, i) => <Cell key={i} fill={funnelColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 100).toLocaleString()}`} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }} formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#5c6ac4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {/* Top Pages */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[14px] font-semibold text-text-primary">Top Pages</h3>
            </div>
            {topPages.slice(0, 5).map(p => (
              <div key={p.page} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                <span className="text-[12px] text-text-primary font-mono truncate max-w-[200px]">{p.page}</span>
                <div className="flex items-center gap-4 text-[12px] shrink-0">
                  <span className="text-text-secondary">{p.views.toLocaleString()} views</span>
                  <span className="text-text-tertiary">{p.bounceRate}% bounce</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Countries */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Globe className="w-4 h-4 text-text-tertiary" />
              <h3 className="text-[14px] font-semibold text-text-primary">Top Countries</h3>
            </div>
            {geoData.slice(0, 5).map(g => (
              <div key={g.country} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                <span className="text-[13px] font-medium text-text-primary">{g.country}</span>
                <div className="flex items-center gap-4 text-[12px] shrink-0">
                  <span className="text-text-secondary">{g.visitors.toLocaleString()} visitors</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(g.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
