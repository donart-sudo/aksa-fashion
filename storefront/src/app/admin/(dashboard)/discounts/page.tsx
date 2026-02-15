'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Tag, Percent, DollarSign, Loader2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaPromotion } from '@/lib/admin-medusa'

type DiscountType = 'percentage' | 'fixed'

export default function DiscountsPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<MedusaPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MedusaPromotion | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /* Form */
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('percentage')
  const [value, setValue] = useState('')
  const [isAutomatic, setIsAutomatic] = useState(false)
  const [currencyCode, setCurrencyCode] = useState('eur')

  useEffect(() => {
    loadData()
  }, [demo])

  async function loadData() {
    if (!demo) {
      try {
        const res = await adminMedusa.getPromotions({ limit: '100' })
        setList(res.promotions)
      } catch { /* empty */ }
    }
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setCode('')
    setDiscountType('percentage')
    setValue('')
    setIsAutomatic(false)
    setCurrencyCode('eur')
    setModalOpen(true)
  }

  function openEdit(p: MedusaPromotion) {
    setEditing(p)
    setCode(p.code)
    setDiscountType(p.application_method?.type || 'percentage')
    setValue(p.application_method?.value?.toString() || '')
    setIsAutomatic(p.is_automatic)
    setCurrencyCode(p.application_method?.currency_code || 'eur')
    setModalOpen(true)
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = 'AKSA'
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
    setCode(result)
  }

  async function save() {
    if (!code.trim() || !value.trim()) return
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        type: 'standard',
        is_automatic: isAutomatic,
        application_method: {
          type: discountType,
          value: parseFloat(value),
          target_type: 'order',
          allocation: 'across',
          ...(discountType === 'fixed' ? { currency_code: currencyCode } : {}),
        },
      }

      if (!demo) {
        if (editing) {
          await adminMedusa.updatePromotion(editing.id, data)
        } else {
          await adminMedusa.createPromotion(data)
        }
      }
      await loadData()
      setModalOpen(false)
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  async function del(id: string) {
    if (!demo) {
      try { await adminMedusa.deletePromotion(id) } catch {}
    }
    setList(prev => prev.filter(p => p.id !== id))
    setDelId(null)
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatValue(p: MedusaPromotion) {
    if (!p.application_method) return '—'
    if (p.application_method.type === 'percentage') {
      return `${p.application_method.value}%`
    }
    const currency = p.application_method.currency_code?.toUpperCase() || 'EUR'
    return `${p.application_method.value} ${currency}`
  }

  const filtered = list.filter(p =>
    !search || p.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <TopBar title="Discounts" />
        <div className="p-8">
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="skeleton h-[300px]" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Discounts" subtitle={`${list.length} promotions`} actions={
        <button onClick={openAdd} className="btn btn-primary"><Plus className="w-4 h-4" />Create discount</button>
      } />
      <div className="p-8">
        {/* Info banner */}
        <div className="rounded-[12px] px-5 py-4 mb-6 flex items-start gap-3" style={{ background: '#fef9ec', border: '1px solid #fde68a' }}>
          <Tag className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#b28400' }} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#78350f' }}>What are Discounts?</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#92400e' }}>
              Discounts let you offer customers a reduced price using promo codes (e.g. "SUMMER20" for 20% off) or automatic promotions applied at checkout. Great for driving sales, rewarding loyal customers, and seasonal campaigns.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search discount codes..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-3">Code</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Value</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Method</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Created</th>
                <th className="w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: p.application_method?.type === 'percentage' ? '#f0ebff' : '#eaf4ff' }}>
                        {p.application_method?.type === 'percentage'
                          ? <Percent size={16} style={{ color: '#7c3aed' }} />
                          : <DollarSign size={16} style={{ color: '#005bd3' }} />
                        }
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold font-mono text-[#1a1a1a]">{p.code}</span>
                        <button
                          onClick={() => copyCode(p.code, p.id)}
                          className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center transition-colors"
                          style={{ color: copiedId === p.id ? '#047b5d' : '#b5b5b5', background: copiedId === p.id ? '#ecfdf5' : 'transparent' }}
                          title="Copy code"
                        >
                          {copiedId === p.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] px-2 py-0.5 rounded-[5px] font-medium" style={{
                      background: p.application_method?.type === 'percentage' ? '#f0ebff' : '#eaf4ff',
                      color: p.application_method?.type === 'percentage' ? '#7c3aed' : '#005bd3',
                    }}>
                      {p.application_method?.type === 'percentage' ? 'Percentage' : 'Fixed amount'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[14px] font-semibold text-[#1a1a1a]">{formatValue(p)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] px-2 py-0.5 rounded-[5px] font-medium" style={{
                      background: p.is_automatic ? '#ecfdf5' : '#f1f1f1',
                      color: p.is_automatic ? '#047b5d' : '#616161',
                    }}>
                      {p.is_automatic ? 'Automatic' : 'Code'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#616161]">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)}
                        className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors">
                        <Pencil className="w-[14px] h-[14px]" />
                      </button>
                      <button onClick={() => setDelId(p.id)}
                        className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#e22c38] hover:bg-[#fef1f1] transition-colors">
                        <Trash2 className="w-[14px] h-[14px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Tag className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No discounts yet</p>
                    <button onClick={openAdd} className="text-[13px] text-[#005bd3] font-medium mt-1 hover:underline">Create your first discount</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit discount' : 'Create discount'} width="max-w-md">
          <div className="space-y-4">
            {/* Discount code */}
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Discount code</label>
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="input flex-1 font-mono" placeholder="e.g. SUMMER20" autoFocus />
                <button onClick={generateCode} className="btn btn-secondary text-[12px] whitespace-nowrap">Generate</button>
              </div>
              <p className="text-[11px] text-[#8a8a8a] mt-1">Customers will enter this code at checkout</p>
            </div>

            {/* Discount type */}
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Discount type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] border text-[13px] font-medium transition-all"
                  style={{
                    borderColor: discountType === 'percentage' ? '#005bd3' : '#e3e3e3',
                    background: discountType === 'percentage' ? '#eaf4ff' : '#ffffff',
                    color: discountType === 'percentage' ? '#005bd3' : '#616161',
                  }}
                >
                  <Percent className="w-4 h-4" />
                  Percentage
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] border text-[13px] font-medium transition-all"
                  style={{
                    borderColor: discountType === 'fixed' ? '#005bd3' : '#e3e3e3',
                    background: discountType === 'fixed' ? '#eaf4ff' : '#ffffff',
                    color: discountType === 'fixed' ? '#005bd3' : '#616161',
                  }}
                >
                  <DollarSign className="w-4 h-4" />
                  Fixed amount
                </button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">
                {discountType === 'percentage' ? 'Percentage off' : 'Amount off'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="input w-full pl-8"
                  placeholder={discountType === 'percentage' ? '20' : '10.00'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step={discountType === 'percentage' ? '1' : '0.01'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8a8a8a]">
                  {discountType === 'percentage' ? '%' : '\u20AC'}
                </span>
              </div>
              {discountType === 'percentage' && value && parseFloat(value) > 0 && (
                <p className="text-[11px] mt-1" style={{ color: '#047b5d' }}>
                  Customers save {value}% on their order
                </p>
              )}
            </div>

            {/* Currency (only for fixed) */}
            {discountType === 'fixed' && (
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Currency</label>
                <select value={currencyCode} onChange={e => setCurrencyCode(e.target.value)} className="input w-full">
                  <option value="eur">EUR - Euro</option>
                  <option value="usd">USD - US Dollar</option>
                  <option value="gbp">GBP - British Pound</option>
                  <option value="all">ALL - Albanian Lek</option>
                  <option value="try">TRY - Turkish Lira</option>
                </select>
              </div>
            )}

            {/* Automatic toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[13px] font-medium text-[#303030]">Automatic discount</p>
                <p className="text-[11px] text-[#8a8a8a] mt-0.5">Applied automatically at checkout without a code</p>
              </div>
              <button
                onClick={() => setIsAutomatic(!isAutomatic)}
                className="bg-transparent border-none cursor-pointer p-0"
              >
                {isAutomatic
                  ? <ToggleRight className="w-9 h-9" style={{ color: '#005bd3' }} />
                  : <ToggleLeft className="w-9 h-9" style={{ color: '#b5b5b5' }} />
                }
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || !code.trim() || !value.trim()} className="btn btn-primary">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving&hellip;</> : editing ? 'Save changes' : 'Create discount'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete discount" width="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fee8eb] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e22c38]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Delete this discount?</p>
            <p className="text-[13px] text-[#616161] mb-5">This discount code will no longer work at checkout.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDelId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => delId && del(delId)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
