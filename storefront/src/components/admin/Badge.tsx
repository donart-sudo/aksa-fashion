type Variant = 'default' | 'success' | 'warning' | 'critical' | 'info' | 'attention'

const styles: Record<Variant, string> = {
  default: 'bg-page text-ink-light',
  success: 'bg-ok-surface text-ok-text',
  warning: 'bg-warn-surface text-warn-text',
  critical: 'bg-crit-surface text-crit-text',
  info: 'bg-note-surface text-note-text',
  attention: 'bg-accent-surface text-accent',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold leading-none ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
