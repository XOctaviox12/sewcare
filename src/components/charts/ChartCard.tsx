import { useId } from 'react'
import type { ReactNode } from 'react'
import type { ChartPoint } from '../../utils'
import styles from './ChartCard.module.css'

interface ChartCardProps {
  title: string
  data: ChartPoint[]
  /** Nombre de lo que se cuenta, ej. "Planes". */
  valueLabel: string
  formatValue?: (value: number) => string
  children: ReactNode
}

/** Tarjeta con título, estado vacío y una tabla oculta para lectores de pantalla. */
export function ChartCard({
  title,
  data,
  valueLabel,
  formatValue = String,
  children,
}: ChartCardProps) {
  const titleId = useId()
  const summary = `${title}: ${data
    .map((point) => `${point.name} ${formatValue(point.value)}`)
    .join(', ')}`

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>

      {data.length === 0 ? (
        <p className={styles.empty}>Sin datos para mostrar con estos filtros.</p>
      ) : (
        <>
          <div className={styles.chart} role="img" aria-label={summary}>
            {children}
          </div>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.name}>
                  <td>{point.name}</td>
                  <td>{formatValue(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}