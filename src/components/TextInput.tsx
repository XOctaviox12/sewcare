import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Field } from './Field'
import styles from './Field.module.css'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextInput({ label, error, hint, id: idProp, required, ...rest }: TextInputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        type="text"
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />
    </Field>
  )
}