'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, CreditCard,
  MapPin, User, Mail, Copy, Check, Loader2, AlertTriangle,
  Calendar, FileText, Send, StickyNote, Plus, Pencil,
} from 'lucide-react'
import TopBar from '@/components/admin/TopBar'
import Modal from '@/components/admin/Modal'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaOrder } from '@/lib/admin-supabase'

/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatCurrency(cents: number, currency = 'eur'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency.toUpperCase(),
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const c = map[status] || { label: status, color: '#616161', bg: '#f1f1f1' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-semibold" style={{ background: c.bg, color: c.color }}>
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  )
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#616161', bg: '#f1f1f1' },
  processing: { label: 'Processing', color: '#b28400', bg: '#fff8db' },
  shipped: { label: 'Shipped', color: '#005bd3', bg: '#eaf4ff' },
  delivered: { label: 'Delivered', color: '#047b5d', bg: '#ecfdf5' },
  completed: { label: 'Completed', color: '#047b5d', bg: '#ecfdf5' },
  canceled: { label: 'Cancelled', color: '#e22c38', bg: '#fee8eb' },
  cancelled: { label: 'Cancelled', color: '#e22c38', bg: '#fee8eb' },
  requires_action: { label: 'Action needed', color: '#b28400', bg: '#fff8db' },
}

const fulfillMap: Record<string, { label: string; color: string; bg: string }> = {
  not_fulfilled: { label: 'Unfulfilled', color: '#b28400', bg: '#fff8db' },
  unfulfilled: { label: 'Unfulfilled', color: '#b28400', bg: '#fff8db' },
  partially_fulfilled: { label: 'Partially fulfilled', color: '#005bd3', bg: '#eaf4ff' },
  fulfilled: { label: 'Fulfilled', color: '#047b5d', bg: '#ecfdf5' },
  partially_shipped: { label: 'Partially shipped', color: '#005bd3', bg: '#eaf4ff' },
  shipped: { label: 'Shipped', color: '#005bd3', bg: '#eaf4ff' },
  delivered: { label: 'Delivered', color: '#047b5d', bg: '#ecfdf5' },
  partially_delivered: { label: 'Partially delivered', color: '#005bd3', bg: '#eaf4ff' },
  returned: { label: 'Returned', color: '#e22c38', bg: '#fee8eb' },
  canceled: { label: 'Cancelled', color: '#e22c38', bg: '#fee8eb' },
}

const payMap: Record<string, { label: string; color: string; bg: string }> = {
  not_paid: { label: 'Awaiting payment', color: '#b28400', bg: '#fff8db' },
  awaiting: { label: 'Awaiting payment', color: '#b28400', bg: '#fff8db' },
  captured: { label: 'Paid', color: '#047b5d', bg: '#ecfdf5' },
  authorized: { label: 'Authorized', color: '#005bd3', bg: '#eaf4ff' },
  partially_refunded: { label: 'Partially refunded', color: '#b28400', bg: '#fff8db' },
  refunded: { label: 'Refunded', color: '#e22c38', bg: '#fee8eb' },
  canceled: { label: 'Cancelled', color: '#e22c38', bg: '#fee8eb' },
  requires_action: { label: 'Requires action', color: '#b28400', bg: '#fff8db' },
}

/* ── Note type ────────────────────────────────────────────────────────── */

interface OrderNote {
  id: string
  text: string
  author: string
  date: string
}

/* ── Page Component ───────────────────────────────────────────────────── */

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { demo } = useAdminAuth()
  const orderId = params.id as string

  const [order, setOrder] = useState<MedusaOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fulfillment state
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [fulfilling, setFulfilling] = useState(false)
  const [delivering, setDelivering] = useState(false)

  // Edit tracking state
  const [editTrackingOpen, setEditTrackingOpen] = useState(false)
  const [editTrackingNumber, setEditTrackingNumber] = useState('')
  const [editTrackingUrl, setEditTrackingUrl] = useState('')
  const [savingTracking, setSavingTracking] = useState(false)

  // Payment state
  const [markingPaid, setMarkingPaid] = useState(false)

  // Complete state
  const [completing, setCompleting] = useState(false)

  // Cancel state
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId, demo])

  async function loadOrder() {
    if (demo) {
      setError('Order detail not available in demo mode')
      setLoading(false)
      return
    }
    try {
      const res = await adminMedusa.getOrder(orderId)
      setOrder(res.order)
      // Load notes from metadata
      const savedNotes = (res.order.metadata as Record<string, unknown>)?.notes
      if (Array.isArray(savedNotes)) {
        setNotes(savedNotes as OrderNote[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  function copyId() {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Fulfillment actions ─────────────────────────────────────────────── */

  async function handleFulfillAndShip() {
    if (!order) return
    setFulfilling(true)
    try {
      // Step 1: Create fulfillment (sets status to 'fulfilled')
      const items = order.items.map(i => ({ id: i.id, quantity: i.quantity }))
      await adminMedusa.createFulfillment(orderId, { items })

      // Step 2: Create shipment (sets status to 'shipped') with optional tracking
      const shipmentData: Record<string, unknown> = { items }
      if (trackingNumber.trim()) {
        shipmentData.labels = [{
          tracking_number: trackingNumber.trim(),
          tracking_url: trackingUrl.trim() || undefined,
        }]
      }
      await adminMedusa.createShipment(orderId, orderId, shipmentData)

      setFulfillModalOpen(false)
      setTrackingNumber('')
      setTrackingUrl('')
      await loadOrder()
    } catch (err) {
      alert('Failed to fulfill: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setFulfilling(false)
    }
  }

  async function handleMarkDelivered() {
    if (!order) return
    setDelivering(true)
    try {
      await adminMedusa.markDelivered(orderId, orderId)
      await loadOrder()
    } catch (err) {
      alert('Failed to mark delivered: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setDelivering(false)
    }
  }

  function openEditTracking() {
    const existing = order?.fulfillments?.flatMap(f => f.labels || []) || []
    setEditTrackingNumber(existing[0]?.tracking_number || '')
    setEditTrackingUrl(existing[0]?.tracking_url || '')
    setEditTrackingOpen(true)
  }

  async function handleSaveTracking() {
    if (!order) return
    setSavingTracking(true)
    try {
      await adminMedusa.updateTracking(orderId, editTrackingNumber.trim(), editTrackingUrl.trim())
      setEditTrackingOpen(false)
      await loadOrder()
    } catch (err) {
      alert('Failed to update tracking: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSavingTracking(false)
    }
  }

  async function handleMarkPaid() {
    if (!order) return
    setMarkingPaid(true)
    try {
      await adminMedusa.updateOrder(orderId, { payment_status: 'captured' })
      await loadOrder()
    } catch (err) {
      alert('Failed to mark as paid: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setMarkingPaid(false)
    }
  }

  async function handleComplete() {
    if (!order) return
    setCompleting(true)
    try {
      await adminMedusa.completeOrder(orderId)
      await loadOrder()
    } catch (err) {
      alert('Failed to complete: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setCompleting(false)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      await adminMedusa.cancelOrder(orderId)
      router.push('/admin/orders')
    } catch (err) {
      alert('Failed to cancel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setCancelling(false)
    }
  }

  /* ── Notes ──────────────────────────────────────────────────────────── */

  async function addNote() {
    if (!newNote.trim()) return
    setSavingNote(true)
    const note: OrderNote = {
      id: Date.now().toString(),
      text: newNote.trim(),
      author: 'Admin',
      date: new Date().toISOString(),
    }
    const updatedNotes = [...notes, note]
    try {
      await adminMedusa.updateOrder(orderId, {
        metadata: { notes: updatedNotes },
      })
      setNotes(updatedNotes)
      setNewNote('')
    } catch (err) {
      alert('Failed to save note: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSavingNote(false)
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <>
        <TopBar title="Order" />
        <div className="p-8 flex justify-center pt-24">
          <Loader2 className="w-6 h-6 animate-spin text-[#8a8a8a]" />
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <TopBar title="Order" />
        <div className="p-8">
          <div className="bg-white rounded-[14px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] text-center">
            <AlertTriangle className="w-10 h-10 text-[#b28400] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Could not load order</p>
            <p className="text-[13px] text-[#616161] mb-4">{error || 'Order not found'}</p>
            <button onClick={() => router.push('/admin/orders')} className="btn btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Back to orders
            </button>
          </div>
        </div>
      </>
    )
  }

  const currency = order.currency_code || 'eur'
  const isCancelled = order.status === 'canceled' || order.status === 'cancelled'
  const isCompleted = order.status === 'completed'
  const isUnfulfilled = !order.fulfillment_status || order.fulfillment_status === 'not_fulfilled' || order.fulfillment_status === 'unfulfilled'
  const isShipped = order.fulfillment_status === 'shipped' || order.fulfillment_status === 'partially_shipped' || order.fulfillment_status === 'fulfilled'
  const isDelivered = order.fulfillment_status === 'delivered' || isCompleted
  const isPaid = order.payment_status === 'captured'
  const canComplete = isShipped && isPaid && !isDelivered && !isCancelled && !isCompleted
  const hasTracking = order.fulfillments?.some(f => f.labels?.length)
  const trackingInfo = order.fulfillments?.flatMap(f => f.labels || []) || []

  return (
    <>
      <TopBar
        title={`Order #${order.display_id}`}
        subtitle={formatDateTime(order.created_at)}
        actions={
          isCancelled || isCompleted ? undefined : canComplete ? (
            <div className="flex items-center gap-2">
              <button onClick={handleComplete} disabled={completing} className="btn btn-primary">
                {completing ? <><Loader2 className="w-4 h-4 animate-spin" />Completing...</> : <><CheckCircle className="w-4 h-4" />Complete order</>}
              </button>
              <button onClick={() => setCancelOpen(true)} className="btn btn-secondary" style={{ color: '#e22c38', borderColor: '#fca5a5' }}>
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setCancelOpen(true)} className="btn btn-secondary" style={{ color: '#e22c38', borderColor: '#fca5a5' }}>
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )
        }
      />

      <div className="p-8">
        {/* Back link */}
        <button
          onClick={() => router.push('/admin/orders')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#616161] hover:text-[#1a1a1a] mb-5 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
        </button>

        {/* Status badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <StatusBadge status={order.status} map={statusMap} />
          <StatusBadge status={order.fulfillment_status || 'unfulfilled'} map={fulfillMap} />
          <StatusBadge status={order.payment_status || 'not_paid'} map={payMap} />
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main — 2 cols */}
          <div className="col-span-2 space-y-6">

            {/* ── Fulfillment actions ──────────────────────────────────── */}
            {!isCancelled && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                  <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Fulfillment</h3>
                  <StatusBadge status={order.fulfillment_status || 'unfulfilled'} map={fulfillMap} />
                </div>
                <div className="px-5 py-4">
                  {isDelivered ? (
                    <div className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: '#ecfdf5' }}>
                      <CheckCircle size={18} style={{ color: '#047b5d' }} />
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: '#047b5d' }}>Delivered</p>
                        <p className="text-[12px]" style={{ color: '#047b5d' }}>All items have been delivered to the customer</p>
                      </div>
                    </div>
                  ) : isShipped ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: '#eaf4ff' }}>
                        <Truck size={18} style={{ color: '#005bd3' }} />
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold" style={{ color: '#005bd3' }}>Shipped</p>
                          {trackingInfo.length > 0 ? (
                            trackingInfo.map((label, i) => (
                              <p key={i} className="text-[12px]" style={{ color: '#005bd3' }}>
                                Tracking: {label.tracking_url ? (
                                  <a href={label.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">{label.tracking_number}</a>
                                ) : (
                                  <span className="font-mono">{label.tracking_number}</span>
                                )}
                              </p>
                            ))
                          ) : (
                            <p className="text-[12px]" style={{ color: '#005bd3' }}>No tracking number provided</p>
                          )}
                        </div>
                        <button
                          onClick={openEditTracking}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[12px] font-medium border border-[#bfdbfe] bg-white text-[#005bd3] hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                        >
                          <Pencil size={12} />
                          {hasTracking ? 'Edit' : 'Add tracking'}
                        </button>
                      </div>
                      <button
                        onClick={handleMarkDelivered}
                        disabled={delivering}
                        className="btn btn-primary w-full justify-center"
                      >
                        {delivering ? <><Loader2 className="w-4 h-4 animate-spin" />Marking...</> : <><CheckCircle className="w-4 h-4" />Mark as delivered</>}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: '#fff8db' }}>
                        <Clock size={18} style={{ color: '#b28400' }} />
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: '#b28400' }}>Awaiting fulfillment</p>
                          <p className="text-[12px]" style={{ color: '#b28400' }}>{order.items.length} item{order.items.length > 1 ? 's' : ''} to fulfill</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFulfillModalOpen(true)}
                        className="btn btn-primary w-full justify-center"
                      >
                        <Truck className="w-4 h-4" /> Fulfill & ship order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Line items ──────────────────────────────────────────── */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Items</h3>
                <span className="text-[12px] text-[#8a8a8a]">{order.items?.length || 0} items</span>
              </div>
              <div>
                {(order.items || []).map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-4 px-5 py-4 border-b border-[#f6f6f6] last:border-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-[10px] object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-[10px] bg-[#f1f1f1] flex items-center justify-center shrink-0">
                        <Package size={18} className="text-[#b5b5b5]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[12px] text-[#005bd3] mt-0.5">{item.subtitle}</p>
                      )}
                      <p className="text-[12px] text-[#8a8a8a] mt-0.5">{formatCurrency(item.unit_price, currency)} x {item.quantity}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums shrink-0">
                      {formatCurrency(item.unit_price * item.quantity, currency)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Summary */}
              <div className="px-5 py-4 bg-[#fafafa] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#616161]">Subtotal</span>
                  <span className="text-[13px] font-medium text-[#1a1a1a] tabular-nums">{formatCurrency(order.subtotal, currency)}</span>
                </div>
                {order.tax_total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#616161]">Tax</span>
                    <span className="text-[13px] font-medium text-[#1a1a1a] tabular-nums">{formatCurrency(order.tax_total, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#e3e3e3]">
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">Total</span>
                  <span className="text-[18px] font-bold text-[#1a1a1a] tabular-nums">{formatCurrency(order.total, currency)}</span>
                </div>
              </div>
            </div>

            {/* ── Notes ───────────────────────────────────────────────── */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f0f0f0]">
                <StickyNote size={15} className="text-[#8a8a8a]" />
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Internal notes</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                {notes.length > 0 && (
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div key={note.id} className="rounded-[10px] p-3" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                        <p className="text-[13px] text-[#1a1a1a]">{note.text}</p>
                        <p className="text-[11px] text-[#8a8a8a] mt-1.5">{note.author} — {formatDateTime(note.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newNote.trim()) addNote() }}
                    placeholder="Add a note... (e.g. Wedding date, special requests)"
                    className="flex-1 h-[36px] px-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white"
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || savingNote}
                    className="btn btn-secondary shrink-0"
                    style={{ opacity: !newNote.trim() ? 0.5 : 1 }}
                  >
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Customer</h3>
              </div>
              <div className="px-5 py-4">
                {order.customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#f1f1f1' }}>
                        <span className="text-[13px] font-bold text-[#616161]">
                          {(order.customer.first_name?.[0] || '').toUpperCase()}{(order.customer.last_name?.[0] || '').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{order.customer.first_name} {order.customer.last_name}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-[#f0f0f0]">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#8a8a8a] shrink-0" />
                        <span className="text-[12px] text-[#616161] truncate">{order.customer.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#f1f1f1' }}>
                      <User size={16} className="text-[#b5b5b5]" />
                    </div>
                    <p className="text-[13px] text-[#8a8a8a]">Guest checkout</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Shipping address</h3>
              </div>
              <div className="px-5 py-4">
                {order.shipping_address ? (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#8a8a8a] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] text-[#1a1a1a]">{order.shipping_address.address_1}</p>
                      {order.shipping_address.city && (
                        <p className="text-[12px] text-[#616161]">{order.shipping_address.city}{order.shipping_address.country_code && `, ${order.shipping_address.country_code.toUpperCase()}`}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8a8a8a]">No shipping address</p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Payment</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#8a8a8a]">Status</span>
                  <StatusBadge status={order.payment_status || 'not_paid'} map={payMap} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#8a8a8a]">Currency</span>
                  <span className="text-[13px] font-medium text-[#1a1a1a]">{currency.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#8a8a8a]">Total</span>
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{formatCurrency(order.total, currency)}</span>
                </div>
                {(order.payment_status === 'awaiting' || order.payment_status === 'not_paid' || !order.payment_status) && !isCancelled && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={markingPaid}
                    className="btn btn-primary w-full justify-center mt-1"
                  >
                    {markingPaid ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><CreditCard className="w-4 h-4" />Mark as paid</>}
                  </button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Details</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Order ID</p>
                  <button onClick={copyId}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[#f6f6f6] text-[12px] font-mono text-[#616161] hover:bg-[#ebebeb] transition-colors border-none cursor-pointer">
                    {orderId.length > 24 ? orderId.slice(0, 24) + '...' : orderId}
                    {copied ? <Check size={12} className="text-[#047b5d]" /> : <Copy size={12} />}
                  </button>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Created</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#8a8a8a]" />
                    <span className="text-[12px] text-[#616161]">{formatDateTime(order.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fulfill & Ship Modal ──────────────────────────────────────── */}
      <Modal open={fulfillModalOpen} onClose={() => setFulfillModalOpen(false)} title="Fulfill & ship order" width="max-w-md">
        <div className="space-y-4">
          <div className="rounded-[10px] p-3" style={{ background: '#eaf4ff', border: '1px solid #bfdbfe' }}>
            <p className="text-[13px] font-medium" style={{ color: '#005bd3' }}>
              This will fulfill all {order.items.length} item{order.items.length > 1 ? 's' : ''} and mark the order as shipped.
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Tracking number (optional)</label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Tracking URL (optional)</label>
            <input
              value={trackingUrl}
              onChange={e => setTrackingUrl(e.target.value)}
              placeholder="e.g. https://track.dhl.com/..."
              className="input w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setFulfillModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleFulfillAndShip} disabled={fulfilling} className="btn btn-primary">
              {fulfilling ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><Send className="w-4 h-4" />Fulfill & ship</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Tracking Modal ─────────────────────────────────────── */}
      <Modal open={editTrackingOpen} onClose={() => setEditTrackingOpen(false)} title={hasTracking ? 'Edit tracking info' : 'Add tracking info'} width="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Tracking number</label>
            <input
              value={editTrackingNumber}
              onChange={e => setEditTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Tracking URL (optional)</label>
            <input
              value={editTrackingUrl}
              onChange={e => setEditTrackingUrl(e.target.value)}
              placeholder="e.g. https://track.dhl.com/..."
              className="input w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setEditTrackingOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveTracking} disabled={savingTracking} className="btn btn-primary">
              {savingTracking ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />Save tracking</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Cancel Modal ──────────────────────────────────────────────── */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel order" width="max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#fee8eb' }}>
            <XCircle className="w-5 h-5" style={{ color: '#e22c38' }} />
          </div>
          <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Cancel this order?</p>
          <p className="text-[13px] text-[#616161] mb-5">
            Order #{order.display_id} will be marked as cancelled. This cannot be undone.
          </p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setCancelOpen(false)} className="btn btn-secondary">Keep order</button>
            <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger">
              {cancelling ? <><Loader2 className="w-4 h-4 animate-spin" />Cancelling...</> : 'Cancel order'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
