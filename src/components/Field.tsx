import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import styles from './Field.module.css'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

/** Etiqueta visible + campo + mensaje de error o ayuda. */
export function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <CircleAlert aria-hidden="true" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}