import { Link, useNavigate, useParams } from 'react-router-dom'
import { differenceInCalendarDays } from 'date-fns'
import { Button, ErrorState, PageHeader, StatusBadge } from '../components'
import { ROUTES } from '../constants/routes'
import { historyService, machineService, planService } from '../services'
import { formatDate, parseISODate } from '../utils'
import styles from './HistoryDetailPage.module.css'

/** "3 días de retraso" / "1 día de retraso" / null si no hubo retraso. */
function delayLabel(scheduled: string, completed: string): string | null {
  const scheduledDate = parseISODate(scheduled)
  const completedDate = parseISODate(completed)
  if (!scheduledDate || !completedDate) return null
  const days = differenceInCalendarDays(completedDate, scheduledDate)
  if (days <= 0) return null
  return `${days} ${days === 1 ? 'día' : 'días'} de retraso`
}

export function HistoryDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const record = historyService.getById(id)

  if (!record) {
    return (
      <ErrorState
        title="Registro no encontrado"
        description="El registro de historial no existe o fue eliminado junto con su máquina o su plan."
        action={<Button onClick={() => navigate(ROUTES.history())}>Volver al historial</Button>}
      />
    )
  }

  const machine = machineService.getById(record.machineId)
  const plan = planService.getById(record.planId)
  const delay = delayLabel(record.scheduledDate, record.completedDate)

  return (
    <>
      <PageHeader
        title={record.activity}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Historial', to: ROUTES.history() },
          { label: formatDate(record.completedDate) || 'Detalle' },
        ]}
      />

      <div className={styles.stack}>
        <dl className={styles.details}>
          <div>
            <dt>Máquina</dt>
            <dd>
              {machine ? (
                <Link to={ROUTES.machineDetail(machine.id)}>
                  {machine.code} · {machine.name}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Plan de mantenimiento</dt>
            <dd>
              {plan ? <Link to={ROUTES.planDetail(plan.id)}>{plan.activity}</Link> : '—'}
            </dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <StatusBadge status={record.punctuality} />
            </dd>
          </div>
          <div>
            <dt>Fecha programada</dt>
            <dd>{formatDate(record.scheduledDate) || '—'}</dd>
          </div>
          <div>
            <dt>Fecha realizada</dt>
            <dd>{formatDate(record.completedDate) || '—'}</dd>
          </div>
          {delay && (
            <div>
              <dt>Retraso</dt>
              <dd className={styles.late}>{delay}</dd>
            </div>
          )}
          <div>
            <dt>Responsable</dt>
            <dd>{record.responsible || '—'}</dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h2>Actividades realizadas</h2>
          {record.tasksDone.length === 0 ? (
            <p className={styles.empty}>No se registraron actividades.</p>
          ) : (
            <ul className={styles.tasks}>
              {record.tasksDone.map((task, index) => (
                <li key={`${task}-${index}`}>{task}</li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <h2>Observaciones</h2>
          {record.notes ? (
            <p className={styles.notes}>{record.notes}</p>
          ) : (
            <p className={styles.empty}>Sin observaciones.</p>
          )}
        </section>

        <div>
          <Button variant="secondary" onClick={() => navigate(ROUTES.history())}>
            Volver al historial
          </Button>
        </div>
      </div>
    </>
  )
}