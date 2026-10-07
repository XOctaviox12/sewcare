import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck, Pencil, Trash2 } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  StatusBadge,
} from '../components'
import { CompletePlanModal } from '../components/CompletePlanModal'
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { useToast } from '../hooks/useToast'
import {
  countPlanHistory,
  deletePlanWithHistory,
  historyService,
  machineService,
  planService,
} from '../services'
import { daysLabel, daysUntil, formatDate, getPlanStatus } from '../utils'
import styles from './MaintenanceDetailPage.module.css'

export function MaintenanceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [completeOpen, setCompleteOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Se incrementa al completar para volver a leer los datos guardados.
  const [, setVersion] = useState(0)

  const plan = planService.getById(id)

  if (!plan) {
    return (
      <ErrorState
        title="Mantenimiento no encontrado"
        description="El plan no existe o ya fue eliminado."
        action={
          <Button onClick={() => navigate(ROUTES.plans())}>Volver a mantenimiento</Button>
        }
      />
    )
  }

  const machine = machineService.getById(plan.machineId)
  const status = getPlanStatus(plan)
  const days = daysUntil(plan.nextDate)
  const history = historyService
    .list()
    .filter((record) => record.planId === plan.id)
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))

  const historyCount = countPlanHistory(plan.id)
  const deleteMessage =
    `Se eliminará el plan "${plan.activity}"` +
    (historyCount > 0
      ? ` y también ${historyCount} ${
          historyCount === 1 ? 'registro de historial asociado' : 'registros de historial asociados'
        }`
      : '') +
    '. Esta acción no se puede deshacer.'

  const handleDelete = () => {
    try {
      deletePlanWithHistory(plan.id)
      setConfirmOpen(false)
      showToast('Mantenimiento eliminado')
      navigate(ROUTES.plans())
    } catch (error) {
      setConfirmOpen(false)
      showToast(
        error instanceof Error ? error.message : 'No se pudo eliminar el mantenimiento.',
        'error',
      )
    }
  }

  return (
    <>
      <PageHeader
        title={plan.activity}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Mantenimiento', to: ROUTES.plans() },
          { label: plan.activity },
        ]}
        actions={
          <div className={styles.actions}>
            <Button icon={<CircleCheck size={18} />} onClick={() => setCompleteOpen(true)}>
              Marcar como completado
            </Button>
            <Button
              variant="secondary"
              icon={<Pencil size={18} />}
              onClick={() => navigate(ROUTES.planEdit(plan.id))}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={18} />}
              onClick={() => setConfirmOpen(true)}
            >
              Eliminar
            </Button>
          </div>
        }
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
            <dt>Estado</dt>
            <dd>
              <StatusBadge status={status} />
            </dd>
          </div>
          <div>
            <dt>Próxima fecha</dt>
            <dd>{formatDate(plan.nextDate)}</dd>
          </div>
          <div>
            <dt>Días restantes</dt>
            <dd className={status === 'Vencido' ? styles.overdueText : undefined}>
              {daysLabel(days)}
            </dd>
          </div>
          <div>
            <dt>Frecuencia</dt>
            <dd>
              {plan.frequency === 'Personalizada' && plan.customIntervalDays
                ? `Cada ${plan.customIntervalDays} ${plan.customIntervalDays === 1 ? 'día' : 'días'}`
                : plan.frequency}
            </dd>
          </div>
          <div>
            <dt>Prioridad</dt>
            <dd>{plan.priority}</dd>
          </div>
          <div>
            <dt>Fecha inicial</dt>
            <dd>{formatDate(plan.startDate) || '—'}</dd>
          </div>
          <div>
            <dt>Último completado</dt>
            <dd>{formatDate(plan.lastCompletedAt) || 'Nunca'}</dd>
          </div>
          <div>
            <dt>Responsable</dt>
            <dd>{plan.responsible || '—'}</dd>
          </div>
          <div>
            <dt>Tiempo estimado</dt>
            <dd>{plan.estimatedMinutes ? `${plan.estimatedMinutes} min` : '—'}</dd>
          </div>
          <div>
            <dt>Descripción</dt>
            <dd>{plan.description || '—'}</dd>
          </div>
          <div>
            <dt>Observaciones</dt>
            <dd>{plan.notes || '—'}</dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h2>Historial de este plan</h2>
          {history.length === 0 ? (
            <p className={styles.empty}>Este plan aún no se ha completado.</p>
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Historial del plan de mantenimiento</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha programada</th>
                    <th scope="col">Fecha realizada</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.scheduledDate)}</td>
                      <td>
                        <Link to={ROUTES.historyDetail(record.id)}>
                          {formatDate(record.completedDate)}
                        </Link>
                      </td>
                      <td>{record.responsible || '—'}</td>
                      <td>
                        <StatusBadge status={record.punctuality} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CompletePlanModal
        plan={plan}
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onCompleted={() => {
          setCompleteOpen(false)
          setVersion((current) => current + 1)
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Eliminar mantenimiento"
        message={deleteMessage}
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}