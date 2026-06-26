import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ToastContainer } from '../components/Toast'
import type { ToastData, ToastType } from '../components/Toast'

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
