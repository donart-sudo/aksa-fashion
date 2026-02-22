import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Aksa Fashion <orders@aksa-fashion.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aksa-fashion.vercel.app'

interface OrderItem {
  title: string
  subtitle?: string | null
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string | null
}

interface ShippingAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
}

interface OrderEmailData {
  orderNumber: string
  displayId: number
  email: string
  items: OrderItem[]
  subtotal: number
  shippingTotal: number
  total: number
  shippingAddress: ShippingAddress
  shippingMethod: string
}

function formatPrice(amount: number): string {
  return `€${(amount / 100).toFixed(2)}`
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8E5E0;">
        <div style="font-weight: 500; color: #2D2D2D;">${escapeHtml(item.title)}</div>
        ${item.subtitle ? `<div style="font-size: 13px; color: #888; margin-top: 2px;">${escapeHtml(item.subtitle)}</div>` : ''}
        <div style="font-size: 13px; color: #888; margin-top: 2px;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8E5E0; text-align: right; font-weight: 500; color: #2D2D2D; vertical-align: top;">
        ${formatPrice(item.total)}
      </td>
    </tr>
  `).join('')

  const addr = data.shippingAddress

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #2D2D2D; margin: 0; font-weight: 400;">Aksa Fashion</h1>
    </div>

    <!-- Main card -->
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #E8E5E0;">

      <!-- Success icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #f0fdf4; border: 2px solid #bbf7d0; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">✓</span>
        </div>
      </div>

      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #2D2D2D; text-align: center; margin: 0 0 4px 0; font-weight: 400;">Thank you for your order!</h2>
      <p style="text-align: center; color: #888; font-size: 14px; margin: 0 0 28px 0;">Order confirmed</p>

      <!-- Order info -->
      <div style="background: #FAF8F5; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; table-layout: fixed;">
          <tr>
            <td style="color: #888; padding: 6px 0; width: 50%;">Order Number</td>
            <td style="text-align: right; font-weight: 600; color: #2D2D2D; font-family: monospace; font-size: 15px; padding: 6px 0;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 6px 0; width: 50%;">Shipping</td>
            <td style="text-align: right; color: #2D2D2D; padding: 6px 0;">${data.shippingMethod}</td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
        ${itemRows}
      </table>

      <!-- Totals -->
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; margin-top: 16px;">
        <tr>
          <td style="padding: 6px 0; color: #888;">Subtotal</td>
          <td style="padding: 6px 0; text-align: right; color: #2D2D2D;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888;">Shipping</td>
          <td style="padding: 6px 0; text-align: right; color: #2D2D2D;">${data.shippingTotal === 0 ? 'Complimentary' : formatPrice(data.shippingTotal)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0 0; font-weight: 600; color: #2D2D2D; font-size: 16px; border-top: 2px solid #E8E5E0;">Total</td>
          <td style="padding: 10px 0 0; text-align: right; font-weight: 600; color: #2D2D2D; font-size: 16px; border-top: 2px solid #E8E5E0;">${formatPrice(data.total)}</td>
        </tr>
      </table>

      <!-- Shipping address -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E5E0;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 8px 0;">Shipping To</p>
        <p style="font-size: 14px; color: #2D2D2D; margin: 0; line-height: 1.6;">
          ${addr.first_name} ${addr.last_name}<br>
          ${addr.address_1}${addr.address_2 ? `, ${addr.address_2}` : ''}<br>
          ${addr.city} ${addr.postal_code}, ${addr.country_code.toUpperCase()}
        </p>
      </div>

      <!-- Track order button -->
      <div style="text-align: center; margin-top: 28px;">
        <a href="${SITE_URL}/en/order-tracking" style="display: inline-block; padding: 14px 32px; background-color: #2D2D2D; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 500;">
          Track Your Order
        </a>
      </div>

      <!-- Payment note -->
      <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
        <p style="font-size: 14px; color: #2D2D2D; margin: 0 0 4px 0; font-weight: 500;">💬 Payment Arrangement</p>
        <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Our team will contact you within 24 hours via WhatsApp to arrange payment. We accept bank transfer, Western Union, and cash on pickup.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #888;">
      <p style="margin: 0 0 4px 0;">Handcrafted with love in Prishtina, Kosovo</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Aksa Fashion. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not set, skipping confirmation email')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Order Confirmed — ${data.orderNumber} | Aksa Fashion`,
      html: buildOrderConfirmationHtml(data),
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Email] Order confirmation sent to ${data.email} for ${data.orderNumber}`)
    return { success: true }
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return { success: false, error: String(err) }
  }
}
