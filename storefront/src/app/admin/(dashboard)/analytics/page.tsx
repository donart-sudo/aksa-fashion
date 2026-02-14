'use client'

import { Users, Eye, Monitor, MousePointerClick, Globe } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import MetricCard from '@/components/admin/MetricCard'
import TopBar from '@/components/admin/TopBar'
import {
  revenueData, dailyVisitors, trafficSources, conversionFunnel,
  topPages, geoData, formatCurrency,
} from '@/data/adminSampleData'

const funnelColors = ['#303030', '#4a4a4a', '#6a6a6a', '#8a8a8a', '#b0b0b0']

const metrics = [
  { label: 'Total visitors', value: '3,054', change: 18.4, icon: Users },
  { label: 'Page views', value: '8,127', change: 22.1, icon: Eye },
  { label: 'Bounce rate', value: '32.4%', change: -4.2, icon: Monitor },
  { label: 'Conversion rate', value: '1.7%', change: 0.3, icon: MousePointerClick },
]

export default function AdminAnalyticsPage() {
  return (
    <>
      <TopBar title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => <MetricCard key={m.label} label={m.label} value={m.value} change={m.change} />)}
        </div>

        {/* Visitors chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold text-ink">Daily visitors & page views</h3>
            <div className="flex items-center gap-4 text-[12px] text-ink-faint">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink" />Visitors</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-edge-dark" />Page views</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyVisitors}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#303030" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#303030" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9cccf" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#c9cccf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }} />
              <Area type="monotone" dataKey="pageViews" stroke="#c9cccf" strokeWidth={1.5} fill="url(#pvGrad)" />
              <Area type="monotone" dataKey="visitors" stroke="#303030" strokeWidth={2} fill="url(#vGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Traffic sources */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-4">Traffic sources</h3>
            <div className="space-y-3">
              {trafficSources.map(s => {
                const max = Math.max(...trafficSources.map(x => x.visitors))
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-ink">{s.source}</span>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="text-ink-light">{s.visitors.toLocaleString()}</span>
                        <span className="font-medium text-ok">{s.conversion}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-page rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(s.visitors / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Funnel */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-4">Conversion funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conversionFunnel} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: '#616161' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }}
                  formatter={(v, _n, p) => [`${Number(v).toLocaleString()} (${(p.payload as { pct?: number })?.pct ?? 0}%)`, 'Users']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {conversionFunnel.map((_, i) => <Cell key={i} fill={funnelColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly revenue */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-4">Monthly revenue</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} tickFormatter={v => `\u20AC${(v / 100).toLocaleString()}`} />
                <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }} formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} />
                <Bar dataKey="revenue" fill="#303030" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {/* Top pages */}
            <div className="card">
              <div className="px-5 py-3 border-b border-edge"><h3 className="text-[14px] font-semibold text-ink">Top pages</h3></div>
              {topPages.slice(0, 5).map(p => (
                <div key={p.page} className="flex items-center justify-between px-5 py-2.5 border-b border-edge-light last:border-0">
                  <span className="text-[12px] text-ink font-mono truncate max-w-[180px]">{p.page}</span>
                  <div className="flex items-center gap-3 text-[12px] shrink-0">
                    <span className="text-ink-light">{p.views.toLocaleString()}</span>
                    <span className="text-ink-faint">{p.bounceRate}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Geo */}
            <div className="card">
              <div className="px-5 py-3 border-b border-edge flex items-center gap-2">
                <Globe className="w-4 h-4 text-ink-faint" />
                <h3 className="text-[14px] font-semibold text-ink">Top countries</h3>
              </div>
              {geoData.slice(0, 5).map(g => (
                <div key={g.country} className="flex items-center justify-between px-5 py-2.5 border-b border-edge-light last:border-0">
                  <span className="text-[13px] font-medium text-ink">{g.country}</span>
                  <div className="flex items-center gap-3 text-[12px] shrink-0">
                    <span className="text-ink-light">{g.visitors.toLocaleString()}</span>
                    <span className="font-medium text-ink">{formatCurrency(g.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
