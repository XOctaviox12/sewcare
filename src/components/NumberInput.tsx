import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Field } from './Field'
import styles from './Field.module.css'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: string
  /** Número, o "" si el campo está vacío. */
  value: number | ''
  onChange: (value: number | '') => void
  error?: string
  hint?: string
}

export function NumberInput({
  label,
  value,
  onChange,
  error,
  hint,
  id: idProp,
  required,
  ...rest
}: NumberInputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        value={value}
        onChange={(event) =>
          onChange(event.target.value === '' ? '' : Number(event.target.value))
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />
    </Field>
  )
}