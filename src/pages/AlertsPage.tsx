import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { CalendarClock, CircleCheck, CircleX, TriangleAlert, Wallet } from 'lucide-react'
import { EmptyState, PageHeader } from '../components'
import { ROUTES } from '../constants/routes'
import { useAlerts } from '../hooks/useAlerts'
import type { AlertKind } from '../types'
import { ALERT_KIND_LABELS, ALERT_KIND_ORDER } from '../utils'
import styles from './AlertsPage.module.css'

const KIND_ICONS: Record<AlertKind, LucideIcon> = {
  MantenimientoVencido: TriangleAlert,
  MaquinaFueraDeServicio: CircleX,
  ReparacionAltoCosto: Wallet,
  MantenimientoProximo: CalendarClock,
}

export function AlertsPage() {
  const { alerts, criticalCount } = useAlerts()

  const groups = ALERT_KIND_ORDER.map((kind) => ({
    kind,
    items: alerts.filter((alert) => alert.kind === kind),
  })).filter((group) => group.items.length > 0)

  return (
    <>
      <PageHeader
        title="Alertas"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Alertas' }]}
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={<CircleCheck size={40} />}
          title="Todo al día"
          description="No hay mantenimientos vencidos ni próximos, ni máquinas fuera de servicio, ni reparaciones de costo alto."
        />
      ) : (
        <div className={styles.stack}>
          <p className={styles.summary} aria-live="polite">
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'} ·{' '}
            {criticalCount} {criticalCount === 1 ? 'crítica' : 'críticas'}
          </p>

          {groups.map(({ kind, items }) => {
            const Icon = KIND_ICONS[kind]
            const headingId = `alerts-${kind}`
            return (
              <section key={kind} className={styles.group} aria-labelledby={headingId}>
                <h2 id={headingId} className={styles.groupTitle}>
                  <Icon aria-hidden="true" size={20} />
                  {ALERT_KIND_LABELS[kind]} ({items.length})
                </h2>
                <ul className={styles.list}>
                  {items.map((alert) => (
                    <li
                      key={alert.id}
                      className={`${styles.item} ${alert.critical ? styles.critical : ''}`}
                    >
                      <div>
                        <p className={styles.itemTitle}>
                          <Link to={alert.link}>{alert.title}</Link>
                        </p>
                        <p className={styles.itemMessage}>{alert.message}</p>
                      </div>
                      {alert.critical ? (
                        <span className={styles.tagCritical}>
                          <TriangleAlert aria-hidden="true" size={16} />
                          Crítica
                        </span>
                      ) : (
                        <span className={styles.tag}>Aviso</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}