import { useState, useMemo } from 'react'
import { Search, Tag, X, Eye, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { customers as initialCustomers, formatCurrency, formatDate, type Customer } from '../data/sampleData'

const tagColors: Record<string, 'attention' | 'success' | 'info' | 'warning' | 'critical' | 'default'> = {
  VIP: 'attention', New: 'success', Wholesale: 'info', Bridal: 'default',
  'Evening Wear': 'default', 'Ball Gown': 'default', 'Cape & Train': 'default',
  Returning: 'warning', International: 'info', Cancelled: 'critical',
}

const tagList = ['VIP', 'Bridal', 'Evening Wear', 'Ball Gown', 'Cape & Train', 'Returning', 'International', 'Cancelled']

const avatarColors = [
  'bg-accent', 'bg-green', 'bg-orange', 'bg-blue', 'bg-yellow',
  'bg-red', 'bg-navy', 'bg-accent-dark', 'bg-green-text',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function Customers() {
  const [list] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [detail, setDetail] = useState<Customer | null>(null)
  const [tagOpen, setTagOpen] = useState(false)

  const filtered = useMemo(() => list.filter(c => {
    const mq = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const mt = !tags.length || tags.some(t => c.tags.includes(t))
    return mq && mt
  }), [list, search, tags])

  function toggleTag(t: string) { setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-text-primary placeholder:text-text-tertiary hover:border-border-dark transition-colors"
          />
        </div>
        <div className="relative">
          <button onClick={() => setTagOpen(!tagOpen)} className="h-[36px] px-4 rounded-lg border border-border bg-card text-[13px] font-medium text-text-primary flex items-center gap-1.5 hover:bg-surface transition-colors">
            <Tag className="w-4 h-4" /> Filter by tag
            {tags.length > 0 && <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">{tags.length}</span>}
          </button>
          {tagOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-card rounded-lg shadow-lg border border-border z-20 p-2">
              {tagList.map(t => (
                <label key={t} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-surface cursor-pointer transition-colors">
                  <input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} />
                  <span className="text-[13px] text-text-primary">{t}</span>
                </label>
              ))}
              {tags.length > 0 && (
                <button onClick={() => setTags([])} className="w-full text-[12px] text-text-tertiary hover:text-text-primary text-center pt-2 mt-1 border-t border-border transition-colors">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active tag filters */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map(t => (
            <button key={t} onClick={() => toggleTag(t)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-text-secondary text-[12px] font-medium hover:bg-border/50 transition-colors">
              {t} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {['Customer', 'Orders', 'Total Spent', 'Tags', 'Joined', ''].map(h => (
                  <th key={h} className={`${h ? 'text-left' : 'text-right'} text-[12px] font-medium text-text-tertiary px-5 py-2.5 whitespace-nowrap`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(c.name)} flex items-center justify-center shrink-0`}>
                        <span className="text-[11px] font-bold text-white">{c.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-text-primary">{c.name}</p>
                        <p className="text-[11px] text-text-tertiary">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-medium text-text-primary">{c.totalOrders}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-text-primary">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.tags.map(t => <Badge key={t} variant={tagColors[t] || 'default'}>{t}</Badge>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-text-secondary">{formatDate(c.joinedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setDetail(c)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors">
                      <Eye className="w-4 h-4 text-text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <Users className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                  <p className="text-[13px] text-text-tertiary">No customers found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || ''} width="max-w-xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${getAvatarColor(detail.name)} flex items-center justify-center`}>
                <span className="text-[18px] font-bold text-white">{detail.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <p className="text-[16px] font-semibold text-text-primary">{detail.name}</p>
                <p className="text-[13px] text-text-secondary">{detail.email}</p>
                {detail.phone && <p className="text-[12px] text-text-tertiary">{detail.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-lg p-4 text-center border border-border/50">
                <p className="text-[20px] font-bold text-text-primary">{detail.totalOrders}</p>
                <p className="text-[11px] text-text-tertiary font-medium">Orders</p>
              </div>
              <div className="bg-surface rounded-lg p-4 text-center border border-border/50">
                <p className="text-[18px] font-bold text-text-primary">{formatCurrency(detail.totalSpent)}</p>
                <p className="text-[11px] text-text-tertiary font-medium">Total Spent</p>
              </div>
              <div className="bg-surface rounded-lg p-4 text-center border border-border/50">
                <p className="text-[13px] font-bold text-text-primary">{formatDate(detail.lastOrderAt)}</p>
                <p className="text-[11px] text-text-tertiary font-medium">Last Order</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {detail.tags.map(t => <Badge key={t} variant={tagColors[t] || 'default'}>{t}</Badge>)}
            </div>
            {detail.spendingHistory.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-text-tertiary mb-3">Spending History</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={detail.spendingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#8c8c8c' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 100).toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }}
                      formatter={(v: number) => [formatCurrency(v), 'Spent']}
                    />
                    <Bar dataKey="amount" fill="#5c6ac4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
