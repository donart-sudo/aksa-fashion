type Variant = 'default' | 'success' | 'warning' | 'critical' | 'info' | 'attention'

const styles: Record<Variant, string> = {
  default: 'bg-surface text-text-secondary',
  success: 'bg-green-bg text-green-text',
  warning: 'bg-yellow-bg text-yellow-text',
  critical: 'bg-red-bg text-red-text',
  info: 'bg-blue-bg text-blue',
  attention: 'bg-accent/10 text-accent',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-semibold leading-none capitalize ${styles[variant]}`}>
      {children}
    </span>
  )
}
