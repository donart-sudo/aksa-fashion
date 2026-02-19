'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Tag, X, Eye, Users, DollarSign, UserPlus, Crown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '@/components/admin/Badge'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import { customers as demoCustomers, formatCurrency, formatDate, type Customer } from '@/data/adminSampleData'

const tagList = ['VIP', 'Bridal', 'Evening Wear', 'Ball Gown', 'Cape & Train', 'Returning', 'International', 'Cancelled']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] text-white text-[12px] px-3.5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#999]">{p.name}: <span className="text-white font-medium">{formatCurrency(Number(p.value))}</span></p>
      ))}
    </div>
  )
}

export default function AdminCustomersPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [detail, setDetail] = useState<Customer | null>(null)
  const [tagOpen, setTagOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    async function load() {
      // Try admin API for customers (requires auth)
      if (!demo) {
        try {
          const res = await adminMedusa.getCustomers({ limit: '50' })
          if (cancel) return
          setList(res.customers.map((c) => ({
            id: c.id, name: `${c.first_name} ${c.last_name}`, email: c.email, phone: c.phone || '',
            totalOrders: 0, totalSpent: 0, tags: [], joinedAt: c.created_at, lastOrderAt: c.created_at,
            spendingHistory: [],
          })))
        } catch {
          // Admin API failed — customers stays empty
        }
      }
      if (!cancel) setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [demo])

  const filtered = useMemo(() => list.filter(c => {
    const mq = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const mt = !tags.length || tags.some(t => c.tags.includes(t))
    return mq && mt
  }), [list, search, tags])

  const totalCustomers = list.length
  const vipCount = list.filter(c => c.tags.includes('VIP')).length
  const totalRevenue = list.reduce((s, c) => s + c.totalSpent, 0)
  const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  function toggleTag(t: string) { setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }

  if (loading) {
    return (
      <>
        <TopBar title="Customers" />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[72px]" /></div>)}</div>
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[400px]" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Customers" subtitle={`${totalCustomers} total customers`} />
      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total customers', value: totalCustomers.toString(), icon: Users, color: '#005bd3', bg: '#eaf4ff' },
            { label: 'Total revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#047b5d', bg: '#cdfed4' },
            { label: 'Avg spend', value: formatCurrency(avgSpend), icon: UserPlus, color: '#7c3aed', bg: '#f0ebff' },
            { label: 'VIP customers', value: vipCount.toString(), icon: Crown, color: '#b28400', bg: '#fff8db' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium text-[#8a8a8a] uppercase tracking-[0.04em]">{kpi.label}</p>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} strokeWidth={2} />
                </div>
              </div>
              <p className="text-[26px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
            <div className="relative">
              <button onClick={() => setTagOpen(!tagOpen)} className="btn btn-secondary">
                <Tag className="w-4 h-4" /> Filter by tag
                {tags.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold flex items-center justify-center">{tags.length}</span>
                )}
              </button>
              {tagOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] z-20 p-2">
                  {tagList.map(t => (
                    <label key={t} className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-[#f6f6f6] cursor-pointer transition-colors">
                      <input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} className="cursor-pointer accent-[#1a1a1a]" />
                      <span className="text-[13px] text-[#303030]">{t}</span>
                    </label>
                  ))}
                  {tags.length > 0 && (
                    <button onClick={() => setTags([])} className="w-full text-[12px] text-[#8a8a8a] hover:text-[#303030] text-center pt-1.5 mt-1 border-t border-[#f0f0f0] transition-colors">
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active filters */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap px-5 py-3 border-b border-[#f0f0f0]">
              {tags.map(t => (
                <button key={t} onClick={() => toggleTag(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f6f6f6] text-[#616161] text-[12px] font-medium hover:bg-[#ebebeb] transition-colors border border-[#e3e3e3]">
                  {t} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-3">Customer</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Orders</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Total spent</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Tags</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Joined</th>
                <th className="w-[48px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer" onClick={() => setDetail(c)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#f1f1f1] flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-bold text-[#616161]">{c.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{c.name}</p>
                        <p className="text-[11px] text-[#8a8a8a]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{c.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(c.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.tags.slice(0, 3).map(t => (
                        <Badge key={t} variant={t === 'VIP' ? 'attention' : t === 'Cancelled' ? 'critical' : 'default'}>{t}</Badge>
                      ))}
                      {c.tags.length > 3 && <span className="text-[11px] text-[#b5b5b5]">+{c.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#616161]">{formatDate(c.joinedAt)}</td>
                  <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDetail(c)} className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors">
                      <Eye className="w-[15px] h-[15px]" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No customers found</p>
                    <p className="text-[12px] text-[#b5b5b5] mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || ''} width="max-w-xl">
          {detail && (
            <div className="space-y-5">
              {/* Customer header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                  <span className="text-[18px] font-bold text-[#616161]">{detail.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1a1a1a]">{detail.name}</p>
                  <p className="text-[13px] text-[#616161]">{detail.email}</p>
                  {detail.phone && <p className="text-[12px] text-[#8a8a8a]">{detail.phone}</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[12px] bg-[#f9f9f9] p-4 text-center">
                  <p className="text-[20px] font-bold text-[#1a1a1a]">{detail.totalOrders}</p>
                  <p className="text-[11px] text-[#8a8a8a] mt-0.5">Orders</p>
                </div>
                <div className="rounded-[12px] bg-[#f9f9f9] p-4 text-center">
                  <p className="text-[20px] font-bold text-[#1a1a1a] tabular-nums">{formatCurrency(detail.totalSpent)}</p>
                  <p className="text-[11px] text-[#8a8a8a] mt-0.5">Total spent</p>
                </div>
                <div className="rounded-[12px] bg-[#f9f9f9] p-4 text-center">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">{formatDate(detail.lastOrderAt)}</p>
                  <p className="text-[11px] text-[#8a8a8a] mt-0.5">Last order</p>
                </div>
              </div>

              {/* Tags */}
              {detail.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detail.tags.map(t => (
                    <Badge key={t} variant={t === 'VIP' ? 'attention' : t === 'Cancelled' ? 'critical' : 'default'}>{t}</Badge>
                  ))}
                </div>
              )}

              {/* Spending chart */}
              {detail.spendingHistory.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">Spending history</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={detail.spendingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 100).toLocaleString()}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="amount" name="Spent" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}
