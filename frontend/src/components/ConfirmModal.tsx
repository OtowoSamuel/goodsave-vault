interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const accentClasses = isDestructive
    ? 'bg-[color:var(--color-accent-destructive)]/10 border-[color:var(--color-accent-destructive)]/20 text-[color:var(--color-accent-destructive)]'
    : 'bg-[color:var(--color-accent-growth)]/10 border-[color:var(--color-accent-growth)]/20 text-[color:var(--color-accent-growth)]'

  const buttonClasses = isDestructive
    ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white'
    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-transparent'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] flex items-center justify-center">
      <div
        className="surface-hot rounded-[1.5rem] p-6 max-w-sm w-full mx-4 relative overflow-hidden"
        style={{ animation: 'fadeScaleIn 0.2s ease-out forwards' }}
      >
        {/* Subtle top glow */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isDestructive ? 'from-[color:var(--color-accent-destructive)]/0 via-[color:var(--color-accent-destructive)]/45 to-[color:var(--color-accent-destructive)]/0' : 'from-[color:var(--color-accent-growth)]/0 via-[color:var(--color-accent-growth)]/45 to-[color:var(--color-accent-growth)]/0'}`}></div>

        {/* Icon */}
        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${accentClasses}`}>
            <svg className={`w-5 h-5 ${isDestructive ? 'text-[color:var(--color-accent-destructive)]' : 'text-[color:var(--color-accent-growth)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-display tracking-tight text-white">{title}</h3>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10 font-body">{message}</p>

        <div className="flex gap-3 relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white font-medium rounded-xl transition-all duration-300 cursor-pointer text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 font-medium rounded-xl transition-all duration-300 cursor-pointer text-sm ${buttonClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
