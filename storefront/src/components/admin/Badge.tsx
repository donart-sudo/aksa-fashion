type Variant = 'default' | 'success' | 'warning' | 'critical' | 'info' | 'attention'

const styles: Record<Variant, { bg: string; text: string; dot: string }> = {
  default:   { bg: '#f1f1f1', text: '#616161', dot: '#8a8a8a' },
  success:   { bg: '#cdfed4', text: '#014b40', dot: '#047b5d' },
  warning:   { bg: '#fff8db', text: '#5e4200', dot: '#b28400' },
  critical:  { bg: '#fee8eb', text: '#8e0b21', dot: '#e22c38' },
  info:      { bg: '#eaf4ff', text: '#003a5a', dot: '#0094d5' },
  attention: { bg: '#fff1e3', text: '#5e4200', dot: '#b28400' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  dot?: boolean
}

export default function Badge({ children, variant = 'default', dot = false }: BadgeProps) {
  const s = styles[variant]
  return (
    <span
      className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {children}
    </span>
  )
}
