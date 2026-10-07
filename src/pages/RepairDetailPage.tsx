import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
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
  countRepairParts,
  deleteRepairWithParts,
  machineService,
  repairService,
  sparePartService,
} from '../services'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  partSubtotal,
  partsTotal,
} from '../utils'
import styles from './RepairDetailPage.module.css'

export function RepairDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const repair = repairService.getById(id)

  if (!repair) {
    return (
      <ErrorState
        title="Reparación no encontrada"
        description="La reparación no existe o ya fue eliminada."
        action={<Button onClick={() => navigate(ROUTES.repairs())}>Volver a reparaciones</Button>}
      />
    )
  }

  const machine = machineService.getById(repair.machineId)
  const parts = sparePartService.list().filter((part) => part.repairId === repair.id)
  const partsCost = partsTotal(parts)
  const total = partsCost + repair.laborCost

  const partsCount = countRepairParts(repair.id)
  const deleteMessage =
    'Se eliminará esta reparación' +
    (partsCount > 0
      ? ` y también ${partsCount} ${partsCount === 1 ? 'refacción asociada' : 'refacciones asociadas'}`
      : '') +
    '. Esta acción no se puede deshacer.'

  const handleDelete = () => {
    try {
      deleteRepairWithParts(repair.id)
      setConfirmOpen(false)
      showToast('Reparación eliminada')
      navigate(ROUTES.repairs())
    } catch (error) {
      setConfirmOpen(false)
      showToast(
        error instanceof Error ? error.message : 'No se pudo eliminar la reparación.',
        'error',
      )
    }
  }

  return (
    <>
      <PageHeader
        title={`Reparación del ${formatDate(repair.reportDate)}`}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Reparaciones', to: ROUTES.repairs() },
          { label: formatDate(repair.reportDate) || 'Detalle' },
        ]}
        actions={
          <div className={styles.actions}>
            <Button
              variant="secondary"
              icon={<Pencil size={18} />}
              onClick={() => navigate(ROUTES.repairEdit(repair.id))}
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
              <StatusBadge status={repair.status} />
            </dd>
          </div>
          <div>
            <dt>Fecha de reporte</dt>
            <dd>{formatDate(repair.reportDate) || '—'}</dd>
          </div>
          <div>
            <dt>Fecha de reparación</dt>
            <dd>{formatDate(repair.repairDate) || '—'}</dd>
          </div>
          <div>
            <dt>Técnico responsable</dt>
            <dd>{repair.technician || '—'}</dd>
          </div>
          <div>
            <dt>Tiempo de paro</dt>
            <dd>{formatNumber(repair.downtimeHours)} h</dd>
          </div>
          <div>
            <dt>Falla detectada</dt>
            <dd>{repair.failure}</dd>
          </div>
          <div>
            <dt>Diagnóstico</dt>
            <dd>{repair.diagnosis || '—'}</dd>
          </div>
          <div>
            <dt>Reparación realizada</dt>
            <dd>{repair.workDone || '—'}</dd>
          </div>
          <div>
            <dt>Observaciones</dt>
            <dd>{repair.notes || '—'}</dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h2>Refacciones</h2>
          {parts.length === 0 ? (
            <p className={styles.empty}>Esta reparación no usó refacciones.</p>
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Refacciones de la reparación</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Código</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Costo unitario</th>
                    <th scope="col">Subtotal</th>
                    <th scope="col">Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part) => (
                    <tr key={part.id}>
                      <td>{part.name}</td>
                      <td>{part.code || '—'}</td>
                      <td>{formatNumber(part.quantity)}</td>
                      <td className={styles.number}>{formatCurrency(part.unitCost)}</td>
                      <td className={styles.number}>{formatCurrency(partSubtotal(part))}</td>
                      <td>{part.supplier || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className={styles.stats}>
          <StatCard label="Total de refacciones" value={formatCurrency(partsCost)} />
          <StatCard label="Mano de obra" value={formatCurrency(repair.laborCost)} />
          <StatCard label="Total de la reparación" value={formatCurrency(total)} />
        </div>

        <div>
          <Button variant="secondary" onClick={() => navigate(ROUTES.repairs())}>
            Volver a reparaciones
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Eliminar reparación"
        message={deleteMessage}
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}