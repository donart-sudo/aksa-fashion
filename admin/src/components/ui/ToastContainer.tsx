import { useContext } from 'react'
import { ToastContext } from '../../App'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-green-text text-white',
  error: 'bg-red text-white',
  info: 'bg-navy text-white',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map(t => {
        const Icon = icons[t.type]
        return (
          <div key={t.id} className={`toast-enter flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg min-w-[320px] ${styles[t.type]}`}>
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span className="text-[13px] font-medium flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
