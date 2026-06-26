import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastData {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: number) => void
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in
    const showTimer = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 400)
    }, 4000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-400 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      } ${
        isSuccess
          ? 'bg-slate-950/90 border-emerald-500/20'
          : 'bg-slate-950/90 border-white/10'
      }`}
      style={{ minWidth: '280px', maxWidth: '380px' }}
    >
      {isSuccess ? (
        <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 400) }}
        className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: number) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
