import { Plus, Trash2 } from 'lucide-react'
import type { Errors, PartFormValues } from '../utils'
import { emptyPart, formatCurrency, formPartSubtotal } from '../utils'
import { Button } from './Button'
import { NumberInput } from './NumberInput'
import { TextInput } from './TextInput'
import styles from './SparePartsEditor.module.css'

interface SparePartsEditorProps {
  parts: PartFormValues[]
  /** Errores del formulario (llaves part-<i>-name | quantity | unitCost). */
  errors: Errors
  onChange: (parts: PartFormValues[]) => void
}

export function SparePartsEditor({ parts, errors, onChange }: SparePartsEditorProps) {
  const updatePart = (key: string, changes: Partial<PartFormValues>) => {
    onChange(parts.map((part) => (part.key === key ? { ...part, ...changes } : part)))
  }

  const removePart = (key: string) => {
    onChange(parts.filter((part) => part.key !== key))
  }

  return (
    <section className={styles.editor} aria-labelledby="parts-title">
      <h2 id="parts-title" className={styles.title}>
        Refacciones
      </h2>

      {parts.length === 0 && (
        <p className={styles.empty}>
          Esta reparación no tiene refacciones. Agrega las que se hayan usado.
        </p>
      )}

      {parts.map((part, index) => (
        <fieldset key={part.key} className={styles.row}>
          <legend>Refacción {index + 1}</legend>

          <div className={styles.fields}>
            <TextInput
              id={`repair-part-${index}-name`}
              label="Nombre"
              required
              value={part.name}
              onChange={(event) => updatePart(part.key, { name: event.target.value })}
              error={errors[`part-${index}-name`]}
            />
            <TextInput
              id={`repair-part-${index}-code`}
              label="Código"
              value={part.code}
              onChange={(event) => updatePart(part.key, { code: event.target.value })}
            />
            <NumberInput
              id={`repair-part-${index}-quantity`}
              label="Cantidad"
              required
              min={1}
              step={1}
              value={part.quantity}
              onChange={(value) => updatePart(part.key, { quantity: value })}
              error={errors[`part-${index}-quantity`]}
            />
            <NumberInput
              id={`repair-part-${index}-unitCost`}
              label="Costo unitario (MXN)"
              required
              min={0}
              step={0.01}
              value={part.unitCost}
              onChange={(value) => updatePart(part.key, { unitCost: value })}
              error={errors[`part-${index}-unitCost`]}
            />
            <TextInput
              id={`repair-part-${index}-supplier`}
              label="Proveedor"
              value={part.supplier}
              onChange={(event) => updatePart(part.key, { supplier: event.target.value })}
            />
          </div>

          <div className={styles.footer}>
            <p className={styles.subtotal}>
              Subtotal: {formatCurrency(formPartSubtotal(part))}
            </p>
            <button
              type="button"
              className={styles.remove}
              onClick={() => removePart(part.key)}
              aria-label={`Quitar refacción ${index + 1}`}
            >
              <Trash2 aria-hidden="true" size={18} />
              Quitar
            </button>
          </div>
        </fieldset>
      ))}

      <Button
        variant="secondary"
        className={styles.add}
        icon={<Plus size={18} />}
        onClick={() => onChange([...parts, emptyPart()])}
      >
        Agregar refacción
      </Button>
    </section>
  )
}