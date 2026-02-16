import { ArrowUpRight, DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import MetricCard from '../components/ui/MetricCard'
import Badge from '../components/ui/Badge'
import {
  dashboardMetrics, revenueData, categorySales, orders,
  products, trafficSources, formatCurrency, formatDate,
} from '../data/sampleData'

const statusBadge: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  delivered: 'success', shipped: 'info', processing: 'warning',
  pending: 'default', cancelled: 'critical',
}

const metricIcons = [DollarSign, ShoppingCart, Users, TrendingUp]

// Weekly sales data for the bar chart
const weeklySales = [
  { day: 'Mon', sales: 4200 },
  { day: 'Tue', sales: 3800 },
  { day: 'Wed', sales: 5100 },
  { day: 'Thu', sales: 4600 },
  { day: 'Fri', sales: 6200 },
  { day: 'Sat', sales: 7400 },
  { day: 'Sun', sales: 3200 },
]

export default function Dashboard() {
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const topProducts = products.filter(p => p.status === 'active').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardMetrics.map((m, i) => (
          <MetricCard key={m.label} label={m.label} value={m.value} change={m.change} icon={metricIcons[i]} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Sales Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary">Weekly Sales</h3>
              <p className="text-[12px] text-text-tertiary mt-0.5">Revenue performance this week</p>
            </div>
            <span className="text-[12px] text-text-tertiary bg-surface px-2.5 py-1 rounded-md">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklySales} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }}
                formatter={(v: number) => [`€${v.toLocaleString()}`, 'Sales']}
                labelStyle={{ color: '#a4a4b8', marginBottom: 4 }}
                cursor={{ fill: 'rgba(92, 106, 196, 0.06)' }}
              />
              <Bar dataKey="sales" fill="#5c6ac4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-1">Sales by Category</h3>
          <p className="text-[12px] text-text-tertiary mb-4">Revenue distribution</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={categorySales} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {categorySales.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px' }}
                formatter={(v: number) => [`${v}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-3">
            {categorySales.map(c => (
              <div key={c.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.fill }} />
                  <span className="text-text-secondary">{c.name}</span>
                </div>
                <span className="font-semibold text-text-primary">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[14px] font-semibold text-text-primary">Recent Orders</h3>
            <Link to="/orders" className="text-[13px] text-accent font-medium flex items-center gap-0.5 hover:text-accent-dark transition-colors">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left text-[12px] font-medium text-text-tertiary px-5 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-medium text-accent">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-[13px] text-text-primary">{o.customer}</td>
                    <td className="px-5 py-3 text-[13px] text-text-secondary">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-text-primary">{formatCurrency(o.total)}</td>
                    <td className="px-5 py-3"><Badge variant={statusBadge[o.status]}>{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[14px] font-semibold text-text-primary">Top Products</h3>
            <Link to="/products" className="text-[13px] text-accent font-medium flex items-center gap-0.5 hover:text-accent-dark transition-colors">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
              <span className="text-[12px] font-semibold text-text-tertiary w-5 text-center">{i + 1}</span>
              {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-[11px] text-text-tertiary">{p.category}</p>
              </div>
              <span className="text-[13px] font-semibold text-text-primary">{formatCurrency(p.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-[14px] font-semibold text-text-primary mb-4">Traffic Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trafficSources.map(s => {
            const max = Math.max(...trafficSources.map(x => x.visitors))
            return (
              <div key={s.source} className="p-4 rounded-lg bg-surface/70 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-text-primary">{s.source}</span>
                  <span className="text-[12px] font-semibold text-green">{s.conversion}%</span>
                </div>
                <p className="text-[12px] text-text-secondary mb-2">{s.visitors.toLocaleString()} visitors</p>
                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(s.visitors / max) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
