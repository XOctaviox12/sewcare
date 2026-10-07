import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Pencil, Trash2, TriangleAlert, Wallet } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  StatCard,
  StatusBadge,
} from '../components'
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { useToast } from '../hooks/useToast'
import {
  countMachineDependents,
  deleteMachineCascade,
  historyService,
  machineService,
  planService,
  repairService,
  sparePartService,
} from '../services'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getPlanStatus,
  machineRepairCost,
  repairTotal,
} from '../utils'
import styles from './MachineDetailPage.module.css'

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function MachineDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const machine = machineService.getById(id)

  if (!machine) {
    return (
      <ErrorState
        title="Máquina no encontrada"
        description="La máquina no existe o ya fue eliminada."
        action={<Button onClick={() => navigate(ROUTES.machines())}>Volver a máquinas</Button>}
      />
    )
  }

  const plans = planService
    .list()
    .filter((plan) => plan.machineId === machine.id)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
  const history = historyService
    .list()
    .filter((record) => record.machineId === machine.id)
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))
  const repairs = repairService
    .list()
    .filter((repair) => repair.machineId === machine.id)
    .sort((a, b) => b.reportDate.localeCompare(a.reportDate))
  const allParts = sparePartService.list()
  const totalCost = machineRepairCost(machine.id, repairs, allParts)

  const dependents = countMachineDependents(machine.id)
  const deleteMessage =
    `Se eliminará la máquina "${machine.name}" y también ` +
    `${plural(dependents.plans, 'plan de mantenimiento', 'planes de mantenimiento')}, ` +
    `${plural(dependents.history, 'registro de historial', 'registros de historial')}, ` +
    `${plural(dependents.repairs, 'reparación', 'reparaciones')} y ` +
    `${plural(dependents.spareParts, 'refacción', 'refacciones')}. ` +
    'Esta acción no se puede deshacer.'

  const handleDelete = () => {
    try {
      deleteMachineCascade(machine.id)
      setConfirmOpen(false)
      showToast('Máquina eliminada junto con sus registros')
      navigate(ROUTES.machines())
    } catch (error) {
      setConfirmOpen(false)
      showToast(
        error instanceof Error ? error.message : 'No se pudo eliminar la máquina.',
        'error',
      )
    }
  }

  return (
    <>
      <PageHeader
        title={machine.name}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Máquinas', to: ROUTES.machines() },
          { label: machine.code },
        ]}
        actions={
          <div className={styles.actions}>
            <Button
              variant="secondary"
              icon={<Pencil size={18} />}
              onClick={() => navigate(ROUTES.machineEdit(machine.id))}
            >
              Editar
            </Button>
            <Button
              variant="secondary"
              icon={<CalendarPlus size={18} />}
              onClick={() => navigate(`${ROUTES.planNew()}?maquina=${machine.id}`)}
            >
              Programar mantenimiento
            </Button>
            <Button
              variant="secondary"
              icon={<TriangleAlert size={18} />}
              onClick={() => navigate(`${ROUTES.repairNew()}?maquina=${machine.id}`)}
            >
              Reportar falla
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
            <dt>Código interno</dt>
            <dd>{machine.code}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <StatusBadge status={machine.status} />
            </dd>
          </div>
          <div>
            <dt>Marca</dt>
            <dd>{machine.brand}</dd>
          </div>
          <div>
            <dt>Modelo</dt>
            <dd>{machine.model}</dd>
          </div>
          <div>
            <dt>Número de serie</dt>
            <dd>{machine.serialNumber}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{machine.type}</dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd>{machine.area}</dd>
          </div>
          <div>
            <dt>Línea de producción</dt>
            <dd>{machine.productionLine || '—'}</dd>
          </div>
          <div>
            <dt>Fecha de adquisición</dt>
            <dd>{formatDate(machine.acquisitionDate) || '—'}</dd>
          </div>
          <div>
            <dt>Horas estimadas de uso</dt>
            <dd>{formatNumber(machine.usageHours)}</dd>
          </div>
          <div>
            <dt>Responsable</dt>
            <dd>{machine.responsible || '—'}</dd>
          </div>
          <div>
            <dt>Observaciones</dt>
            <dd>{machine.notes || '—'}</dd>
          </div>
        </dl>

        <div className={styles.stats}>
          <StatCard
            label="Costo acumulado de reparaciones"
            value={formatCurrency(totalCost)}
            icon={<Wallet size={22} />}
          />
        </div>

        <section className={styles.section}>
          <h2>Planes de mantenimiento</h2>
          {plans.length === 0 ? (
            <p className={styles.empty}>Esta máquina aún no tiene planes de mantenimiento.</p>
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Planes de mantenimiento de la máquina</caption>
                <thead>
                  <tr>
                    <th scope="col">Actividad</th>
                    <th scope="col">Próxima fecha</th>
                    <th scope="col">Frecuencia</th>
                    <th scope="col">Prioridad</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <Link to={ROUTES.planDetail(plan.id)}>{plan.activity}</Link>
                      </td>
                      <td>{formatDate(plan.nextDate)}</td>
                      <td>{plan.frequency}</td>
                      <td>{plan.priority}</td>
                      <td>
                        <StatusBadge status={getPlanStatus(plan)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2>Historial de mantenimiento</h2>
          {history.length === 0 ? (
            <p className={styles.empty}>Esta máquina aún no tiene mantenimientos completados.</p>
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Historial de mantenimiento de la máquina</caption>
                <thead>
                  <tr>
                    <th scope="col">Actividad</th>
                    <th scope="col">Fecha realizada</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <Link to={ROUTES.historyDetail(record.id)}>{record.activity}</Link>
                      </td>
                      <td>{formatDate(record.completedDate)}</td>
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

        <section className={styles.section}>
          <h2>Reparaciones</h2>
          {repairs.length === 0 ? (
            <p className={styles.empty}>Esta máquina aún no tiene reparaciones registradas.</p>
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Reparaciones de la máquina</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha de reporte</th>
                    <th scope="col">Falla</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Costo total</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair) => (
                    <tr key={repair.id}>
                      <td>
                        <Link to={ROUTES.repairDetail(repair.id)}>
                          {formatDate(repair.reportDate)}
                        </Link>
                      </td>
                      <td>{repair.failure}</td>
                      <td>
                        <StatusBadge status={repair.status} />
                      </td>
                      <td>{formatCurrency(repairTotal(repair, allParts))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Eliminar máquina"
        message={deleteMessage}
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}