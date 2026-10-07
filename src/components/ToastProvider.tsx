import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext'
import type { ToastContextValue, ToastType } from './ToastContext'
import styles from './Toast.module.css'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

const ICONS = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, type }])
      // Los errores se quedan más tiempo.
      window.setTimeout(() => dismiss(id), type === 'error' ? 8000 : 4500)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type]
          return (
            <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={20} />
              </span>
              <p className={styles.message}>{toast.message}</p>
              <button
                type="button"
                className={styles.close}
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar mensaje"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}