import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import styles from './ExportMenu.module.css'

interface ExportOption<T extends string> {
  value: T
  label: string
}

interface ExportMenuProps<T extends string> {
  label?: string
  options: ExportOption<T>[]
  onSelect: (value: T) => void
}

export function ExportMenu<T extends string>({
  label = 'Exportar CSV',
  options,
  onSelect,
}: ExportMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  // Se cierra con clic fuera o con Escape (y devuelve el foco al botón).
  useEffect(() => {
    if (!open) return
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <Download aria-hidden="true" size={18} />
        {label}
        <ChevronDown aria-hidden="true" size={16} />
      </button>

      {open && (
        <ul id={menuId} className={styles.menu} aria-label="Conjuntos de datos a exportar">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={styles.item}
                onClick={() => {
                  setOpen(false)
                  buttonRef.current?.focus()
                  onSelect(option.value)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}