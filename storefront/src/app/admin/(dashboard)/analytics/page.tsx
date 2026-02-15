'use client'

import { Users, Eye, Monitor, MousePointerClick, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import TopBar from '@/components/admin/TopBar'
import {
  revenueData, dailyVisitors, trafficSources, conversionFunnel,
  topPages, geoData, formatCurrency,
} from '@/data/adminSampleData'

const funnelColors = ['#1a1a1a', '#3a3a3a', '#5a5a5a', '#7a7a7a', '#a0a0a0']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] text-white text-[12px] px-3.5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#999]">{p.name}: <span className="text-white font-medium">
          {typeof p.value === 'number' && (p.name?.toLowerCase().includes('revenue') || p.name?.toLowerCase().includes('spent')) ? formatCurrency(p.value) : p.value.toLocaleString()}
        </span></p>
      ))}
    </div>
  )
}

const metrics = [
  { label: 'Total visitors', value: '3,054', change: 18.4, icon: Users, color: '#005bd3', bg: '#eaf4ff' },
  { label: 'Page views', value: '8,127', change: 22.1, icon: Eye, color: '#1a1a1a', bg: '#f1f1f1' },
  { label: 'Bounce rate', value: '32.4%', change: -4.2, icon: Monitor, color: '#b28400', bg: '#fff8db' },
  { label: 'Conversion rate', value: '1.7%', change: 0.3, icon: MousePointerClick, color: '#047b5d', bg: '#cdfed4' },
]

export default function AdminAnalyticsPage() {
  return (
    <>
      <TopBar title="Analytics" subtitle="Feb 1 — Feb 14, 2026" />
      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5">
          {metrics.map(m => (
            <div key={m.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium text-[#8a8a8a] uppercase tracking-[0.04em]">{m.label}</p>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: m.bg }}>
                  <m.icon size={16} style={{ color: m.color }} strokeWidth={2} />
                </div>
              </div>
              <p className="text-[26px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none mb-2">{m.value}</p>
              <div className="flex items-center gap-1">
                {m.change > 0 ? <ArrowUpRight size={14} className="text-[#047b5d]" /> : <ArrowDownRight size={14} className="text-[#e22c38]" />}
                <span className={`text-[12px] font-medium ${m.change > 0 ? 'text-[#047b5d]' : 'text-[#e22c38]'}`}>
                  {m.change > 0 ? '+' : ''}{m.change}%
                </span>
                <span className="text-[11px] text-[#b5b5b5]">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visitors chart */}
        <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Daily visitors & page views</h3>
              <p className="text-[12px] text-[#8a8a8a] mt-0.5">Feb 1 — Feb 14, 2026</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#8a8a8a]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />Visitors</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d1d1d1]" />Page views</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyVisitors}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d1d1d1" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#d1d1d1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#d1d1d1" strokeWidth={1.5} fill="url(#pvGrad)" />
              <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#1a1a1a" strokeWidth={2} fill="url(#vGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic + Funnel row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Traffic sources */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Traffic sources</h3>
            <p className="text-[12px] text-[#8a8a8a] mb-5">Where your visitors come from</p>
            <div className="space-y-4">
              {trafficSources.map(s => {
                const max = Math.max(...trafficSources.map(x => x.visitors))
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{s.source}</span>
                      <div className="flex items-center gap-4 text-[12px]">
                        <span className="text-[#616161]">{s.visitors.toLocaleString()}</span>
                        <span className="font-semibold text-[#047b5d] w-[40px] text-right">{s.conversion}%</span>
                      </div>
                    </div>
                    <div className="h-[6px] bg-[#f1f1f1] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#1a1a1a] transition-all duration-300" style={{ width: `${(s.visitors / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Funnel */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Conversion funnel</h3>
            <p className="text-[12px] text-[#8a8a8a] mb-5">From visitor to purchase</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conversionFunnel} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: '#616161' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Users" radius={[0, 4, 4, 0]}>
                  {conversionFunnel.map((_, i) => <Cell key={i} fill={funnelColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue + Tables row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Monthly revenue */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Monthly revenue</h3>
            <p className="text-[12px] text-[#8a8a8a] mb-5">Revenue trend over time</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 100).toLocaleString()}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-5">
            {/* Top pages */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Top pages</h3>
                <div className="flex items-center gap-6 text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em]">
                  <span>Views</span>
                  <span>Bounce</span>
                </div>
              </div>
              {topPages.slice(0, 5).map(p => (
                <div key={p.page} className="flex items-center justify-between px-5 py-3 border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <span className="text-[12px] text-[#1a1a1a] font-mono truncate max-w-[200px]">{p.page}</span>
                  <div className="flex items-center gap-6 text-[12px] shrink-0">
                    <span className="text-[#1a1a1a] font-medium w-[50px] text-right tabular-nums">{p.views.toLocaleString()}</span>
                    <span className="text-[#8a8a8a] w-[40px] text-right tabular-nums">{p.bounceRate}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Geo */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f0f0f0]">
                <Globe className="w-4 h-4 text-[#8a8a8a]" />
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Top countries</h3>
              </div>
              {geoData.slice(0, 5).map((g, i) => (
                <div key={g.country} className="flex items-center justify-between px-5 py-3 border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-semibold text-[#b5b5b5] w-4">{i + 1}</span>
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{g.country}</span>
                  </div>
                  <div className="flex items-center gap-5 text-[12px] shrink-0">
                    <span className="text-[#616161]">{g.visitors.toLocaleString()} visitors</span>
                    <span className="font-semibold text-[#1a1a1a] w-[70px] text-right tabular-nums">{formatCurrency(g.revenue)}</span>
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
