import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
  ConfirmDialog,
  DateInput,
  EmptyState,
  ErrorState,
  NumberInput,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from '../components'
import type { SelectOption } from '../components/Select'
import { SparePartsEditor } from '../components/SparePartsEditor'
import { ROUTES } from '../constants/routes'
import { REPAIR_STATUSES } from '../constants/statuses'
import { useToast } from '../hooks/useToast'
import { machineService, repairService, saveRepair, sparePartService } from '../services'
import type { MachineStatus, Repair, RepairStatus } from '../types'
import {
  emptyRepairForm,
  firstRepairErrorKey,
  formatCurrency,
  formPartsTotal,
  formRepairTotal,
  hasErrors,
  proposeMachineStatus,
  repairToFormValues,
  toPartsData,
  toRepairData,
  validateRepair,
} from '../utils'
import type { Errors, RepairFormValues } from '../utils'
import styles from './RepairFormPage.module.css'

interface PendingStatusChange {
  repairId: string
  machineId: string
  machineName: string
  currentStatus: MachineStatus
  proposedStatus: MachineStatus
  repairStatus: RepairStatus
}

interface RepairFormProps {
  repair?: Repair
  initialMachineId: string
}

function RepairForm({ repair, initialMachineId }: RepairFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const machines = machineService.list()

  const [values, setValues] = useState<RepairFormValues>(() => {
    if (repair) return repairToFormValues(repair, sparePartService.list())
    const preselected = machines.find((machine) => machine.id === initialMachineId)
    return emptyRepairForm(preselected?.id ?? '')
  })
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState<PendingStatusChange | null>(null)

  const machineOptions: SelectOption[] = [...machines]
    .sort((a, b) => a.code.localeCompare(b.code, 'es'))
    .map((machine) => ({ value: machine.id, label: `${machine.code} · ${machine.name}` }))

  const setField = <K extends keyof RepairFormValues>(key: K, value: RepairFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const goToDetail = (repairId: string) => navigate(ROUTES.repairDetail(repairId))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateRepair(values)
    setErrors(found)

    if (hasErrors(found)) {
      const first = firstRepairErrorKey(found)
      if (first) document.getElementById(`repair-${first}`)?.focus()
      return
    }

    try {
      const saved = saveRepair(repair?.id, toRepairData(values), toPartsData(values))
      showToast(
        repair ? 'Reparación actualizada correctamente' : 'Reparación registrada correctamente',
      )

      const machine = machineService.getById(saved.machineId)
      const proposed = machine
        ? proposeMachineStatus({
            newStatus: saved.status,
            previousStatus: repair?.status,
            repairId: saved.id,
            machine,
            machineRepairs: repairService
              .list()
              .filter((item) => item.machineId === machine.id),
          })
        : null

      if (machine && proposed) {
        setPending({
          repairId: saved.id,
          machineId: machine.id,
          machineName: machine.name,
          currentStatus: machine.status,
          proposedStatus: proposed,
          repairStatus: saved.status,
        })
      } else {
        goToDetail(saved.id)
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar la reparación.',
        'error',
      )
    }
  }

  const confirmStatusChange = () => {
    if (!pending) return
    try {
      machineService.update(pending.machineId, { status: pending.proposedStatus })
      showToast(`Estado de la máquina actualizado a "${pending.proposedStatus}"`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo actualizar la máquina.',
        'error',
      )
    }
    const repairId = pending.repairId
    setPending(null)
    goToDetail(repairId)
  }

  const skipStatusChange = () => {
    if (!pending) return
    const repairId = pending.repairId
    setPending(null)
    goToDetail(repairId)
  }

  const errorMessages = Object.values(errors)
  const partsTotal = formPartsTotal(values.parts)
  const labor = typeof values.laborCost === 'number' ? values.laborCost : 0

  return (
    <>
      <PageHeader
        title={repair ? 'Editar reparación' : 'Reportar reparación'}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Reparaciones', to: ROUTES.repairs() },
          ...(repair
            ? [{ label: 'Detalle', to: ROUTES.repairDetail(repair.id) }, { label: 'Editar' }]
            : [{ label: 'Nueva' }]),
        ]}
      />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {errorMessages.length > 0 && (
          <div className={styles.summary} role="alert">
            <strong>
              Revisa {errorMessages.length} {errorMessages.length === 1 ? 'campo' : 'campos'}{' '}
              antes de guardar:
            </strong>
            <ul>
              {errorMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          <Select
            id="repair-machineId"
            label="Máquina"
            required
            options={machineOptions}
            placeholder="Selecciona una máquina"
            value={values.machineId}
            onChange={(event) => setField('machineId', event.target.value)}
            error={errors.machineId}
          />
          <DateInput
            id="repair-reportDate"
            label="Fecha de reporte"
            required
            value={values.reportDate}
            onChange={(value) => setField('reportDate', value)}
            error={errors.reportDate}
          />
          <Select
            id="repair-status"
            label="Estado"
            required
            options={REPAIR_STATUSES}
            value={values.status}
            onChange={(event) => setField('status', event.target.value as RepairStatus | '')}
            error={errors.status}
          />
          <DateInput
            id="repair-repairDate"
            label="Fecha de reparación"
            value={values.repairDate}
            onChange={(value) => setField('repairDate', value)}
            error={errors.repairDate}
            hint="Obligatoria si el estado es Finalizada"
          />
          <div className={styles.wide}>
            <TextArea
              id="repair-failure"
              label="Falla detectada"
              required
              value={values.failure}
              onChange={(event) => setField('failure', event.target.value)}
              error={errors.failure}
            />
          </div>
          <div className={styles.wide}>
            <TextArea
              id="repair-diagnosis"
              label="Diagnóstico"
              value={values.diagnosis}
              onChange={(event) => setField('diagnosis', event.target.value)}
            />
          </div>
          <div className={styles.wide}>
            <TextArea
              id="repair-workDone"
              label="Reparación realizada"
              value={values.workDone}
              onChange={(event) => setField('workDone', event.target.value)}
              error={errors.workDone}
              hint="Obligatoria si el estado es Finalizada"
            />
          </div>
          <TextInput
            id="repair-technician"
            label="Técnico responsable"
            value={values.technician}
            onChange={(event) => setField('technician', event.target.value)}
          />
          <NumberInput
            id="repair-downtimeHours"
            label="Tiempo de paro (horas)"
            min={0}
            step={0.5}
            value={values.downtimeHours}
            onChange={(value) => setField('downtimeHours', value)}
            error={errors.downtimeHours}
          />
          <NumberInput
            id="repair-laborCost"
            label="Mano de obra (MXN)"
            min={0}
            step={0.01}
            value={values.laborCost}
            onChange={(value) => setField('laborCost', value)}
            error={errors.laborCost}
          />
          <div className={styles.wide}>
            <TextArea
              id="repair-notes"
              label="Observaciones"
              value={values.notes}
              onChange={(event) => setField('notes', event.target.value)}
            />
          </div>
        </div>

        <SparePartsEditor
          parts={values.parts}
          errors={errors}
          onChange={(parts) => setField('parts', parts)}
        />

        <dl className={styles.totals} aria-live="polite">
          <div>
            <dt>Total de refacciones</dt>
            <dd>{formatCurrency(partsTotal)}</dd>
          </div>
          <div>
            <dt>Mano de obra</dt>
            <dd>{formatCurrency(labor)}</dd>
          </div>
          <div className={styles.grandTotal}>
            <dt>Total de la reparación</dt>
            <dd>{formatCurrency(formRepairTotal(values))}</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          <Button type="submit">{repair ? 'Guardar cambios' : 'Registrar reparación'}</Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(repair ? ROUTES.repairDetail(repair.id) : ROUTES.repairs())
            }
          >
            Cancelar
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title="Actualizar estado de la máquina"
        message={
          pending
            ? `La reparación quedó "${pending.repairStatus}". ¿Quieres cambiar el estado de la máquina "${pending.machineName}" de "${pending.currentStatus}" a "${pending.proposedStatus}"?`
            : ''
        }
        confirmLabel="Sí, cambiar estado"
        cancelLabel="No, dejarla como está"
        onConfirm={confirmStatusChange}
        onCancel={skipStatusChange}
      />
    </>
  )
}

export function RepairFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const repair = id ? repairService.getById(id) : undefined
  const hasMachines = machineService.list().length > 0

  if (id && !repair) {
    return (
      <ErrorState
        title="Reparación no encontrada"
        description="La reparación que intentas editar no existe o ya fue eliminada."
        action={<Button onClick={() => navigate(ROUTES.repairs())}>Volver a reparaciones</Button>}
      />
    )
  }

  if (!repair && !hasMachines) {
    return (
      <EmptyState
        title="Primero registra una máquina"
        description="Una reparación se reporta para una máquina. Aún no hay ninguna registrada."
        action={<Button onClick={() => navigate(ROUTES.machineNew())}>Registrar máquina</Button>}
      />
    )
  }

  const initialMachineId = searchParams.get('maquina') ?? ''

  return (
    <RepairForm
      key={id ?? `new-${initialMachineId}`}
      repair={repair}
      initialMachineId={initialMachineId}
    />
  )
}