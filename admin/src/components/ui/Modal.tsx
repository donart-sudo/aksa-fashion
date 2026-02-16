import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', handler)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handler)
      }
    }
    document.body.style.overflow = ''
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div className="fixed inset-0 bg-black/50 modal-backdrop" />
      <div className={`modal-content relative w-full ${width} max-h-[80vh] flex flex-col bg-card rounded-xl shadow-xl border border-border`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
