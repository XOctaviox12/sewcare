import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { Field } from './Field'
import styles from './Field.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: string[]
  /** Opción vacía inicial, ej. "Selecciona un tipo". */
  placeholder?: string
  error?: string
  hint?: string
}

export function Select({
  label,
  options,
  placeholder,
  error,
  hint,
  id: idProp,
  required,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}