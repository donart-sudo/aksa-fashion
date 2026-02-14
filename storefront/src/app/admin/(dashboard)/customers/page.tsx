'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Tag, X, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '@/components/admin/Badge'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-medusa'
import { customers as demoCustomers, formatCurrency, formatDate, type Customer } from '@/data/adminSampleData'

const tagList = ['VIP', 'Bridal', 'Evening Wear', 'Ball Gown', 'Cape & Train', 'Returning', 'International', 'Cancelled']

export default function AdminCustomersPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Customer[]>(demoCustomers)
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [detail, setDetail] = useState<Customer | null>(null)
  const [tagOpen, setTagOpen] = useState(false)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let cancel = false
    adminMedusa.getCustomers({ limit: '50' }).then(res => {
      if (cancel) return
      setList(res.customers.map(c => ({
        id: c.id, name: `${c.first_name} ${c.last_name}`, email: c.email, phone: c.phone || '',
        totalOrders: 0, totalSpent: 0, tags: [], joinedAt: c.created_at, lastOrderAt: c.created_at,
        spendingHistory: [],
      })))
    }).catch(() => {}).finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [demo])

  const filtered = useMemo(() => list.filter(c => {
    const mq = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const mt = !tags.length || tags.some(t => c.tags.includes(t))
    return mq && mt
  }), [list, search, tags])

  function toggleTag(t: string) { setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }

  if (loading) return <><TopBar title="Customers" /><div className="p-6"><div className="card p-5"><div className="skeleton h-[400px]" /></div></div></>

  return (
    <>
      <TopBar title="Customers" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input type="text" placeholder="Search customers" value={search} onChange={e => setSearch(e.target.value)} className="input w-full pl-8" />
          </div>
          <div className="relative">
            <button onClick={() => setTagOpen(!tagOpen)} className="btn btn-secondary">
              <Tag className="w-4 h-4" /> Filter by tag
              {tags.length > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-text text-[11px] font-bold flex items-center justify-center">{tags.length}</span>}
            </button>
            {tagOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 card shadow-lg z-20 p-2">
                {tagList.map(t => (
                  <label key={t} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-card-hover cursor-pointer">
                    <input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} />
                    <span className="text-[13px] text-ink">{t}</span>
                  </label>
                ))}
                {tags.length > 0 && <button onClick={() => setTags([])} className="w-full text-[12px] text-ink-faint hover:text-ink text-center pt-1.5 mt-1 border-t border-edge">Clear all</button>}
              </div>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-page text-ink-light text-[12px] font-medium hover:bg-edge transition-colors">
                {t} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge bg-card-hover">
                {['Customer','Orders','Total spent','Tags','Joined',''].map(h => (
                  <th key={h} className={`text-${h ? 'left' : 'right'} text-[12px] font-medium text-ink-faint px-5 py-2.5`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-edge-light last:border-0 hover:bg-card-hover transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-page flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-semibold text-ink-light">{c.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div><p className="text-[13px] font-medium text-ink">{c.name}</p><p className="text-[11px] text-ink-faint">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-[13px] font-medium text-ink">{c.totalOrders}</td>
                  <td className="px-5 py-2.5 text-[13px] font-medium text-ink">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.tags.map(t => <Badge key={t} variant={t === 'VIP' ? 'attention' : t === 'Cancelled' ? 'critical' : 'default'}>{t}</Badge>)}
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-[13px] text-ink-light">{formatDate(c.joinedAt)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => setDetail(c)} className="btn-plain w-8 h-8 !p-0 rounded-lg"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-ink-faint">No customers found</td></tr>}
            </tbody>
          </table>
        </div>

        <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || ''} width="max-w-xl">
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-page flex items-center justify-center">
                  <span className="text-[16px] font-semibold text-ink-light">{detail.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{detail.name}</p>
                  <p className="text-[13px] text-ink-light">{detail.email}</p>
                  {detail.phone && <p className="text-[12px] text-ink-faint">{detail.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card-hover rounded-lg p-3 text-center"><p className="text-[18px] font-bold text-ink">{detail.totalOrders}</p><p className="text-[11px] text-ink-faint">Orders</p></div>
                <div className="bg-card-hover rounded-lg p-3 text-center"><p className="text-[18px] font-bold text-ink">{formatCurrency(detail.totalSpent)}</p><p className="text-[11px] text-ink-faint">Total spent</p></div>
                <div className="bg-card-hover rounded-lg p-3 text-center"><p className="text-[13px] font-bold text-ink">{formatDate(detail.lastOrderAt)}</p><p className="text-[11px] text-ink-faint">Last order</p></div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {detail.tags.map(t => <Badge key={t} variant={t === 'VIP' ? 'attention' : 'default'}>{t}</Badge>)}
              </div>
              {detail.spendingHistory.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium text-ink-faint mb-2">Spending history</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={detail.spendingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8c9196' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#8c9196' }} axisLine={false} tickLine={false} tickFormatter={v => `\u20AC${(v / 100).toLocaleString()}`} />
                      <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }} formatter={(v) => [formatCurrency(Number(v)), 'Spent']} />
                      <Bar dataKey="amount" fill="#303030" radius={[4, 4, 0, 0]} />
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
