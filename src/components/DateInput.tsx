import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Field } from './Field'
import styles from './Field.module.css'

interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: string
  /** Fecha "AAAA-MM-DD" o "" si está vacía. */
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

export function DateInput({
  label,
  value,
  onChange,
  error,
  hint,
  id: idProp,
  required,
  ...rest
}: DateInputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        type="date"
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />
    </Field>
  )
}