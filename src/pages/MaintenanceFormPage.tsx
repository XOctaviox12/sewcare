import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
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
import { OTHER_ACTIVITY, SUGGESTED_ACTIVITIES } from '../constants/activities'
import { FREQUENCIES } from '../constants/frequencies'
import { ROUTES } from '../constants/routes'
import { PRIORITIES } from '../constants/statuses'
import { useToast } from '../hooks/useToast'
import { machineService, planService } from '../services'
import type { Frequency, MaintenancePlan, Priority } from '../types'
import {
  PLAN_FIELD_ORDER,
  emptyPlanForm,
  hasErrors,
  planToFormValues,
  toPlanData,
  validatePlan,
} from '../utils'
import type { Errors, PlanFormValues } from '../utils'
import styles from './MaintenanceFormPage.module.css'

const ACTIVITY_OPTIONS = [...SUGGESTED_ACTIVITIES.map((item) => item.name), OTHER_ACTIVITY]

interface MaintenanceFormProps {
  plan?: MaintenancePlan
  initialMachineId: string
}

function MaintenanceForm({ plan, initialMachineId }: MaintenanceFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const machines = machineService.list()

  const [values, setValues] = useState<PlanFormValues>(() => {
    if (plan) return planToFormValues(plan)
    const preselected = machines.find((machine) => machine.id === initialMachineId)
    return emptyPlanForm(preselected?.id ?? '', preselected?.responsible ?? '')
  })
  const [errors, setErrors] = useState<Errors>({})
  const [frequencyTouched, setFrequencyTouched] = useState(false)

  const machineOptions: SelectOption[] = [...machines]
    .sort((a, b) => a.code.localeCompare(b.code, 'es'))
    .map((machine) => ({ value: machine.id, label: `${machine.code} · ${machine.name}` }))

  const setField = <K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  // Al crear: si la responsable está vacía, propone la de la máquina.
  const handleMachineChange = (machineId: string) => {
    setValues((current) => {
      const machine = machines.find((item) => item.id === machineId)
      const shouldFill = !plan && !current.responsible.trim() && machine
      return {
        ...current,
        machineId,
        responsible: shouldFill ? machine.responsible : current.responsible,
      }
    })
  }

  // Al crear: propone la frecuencia orientativa de la actividad (se puede cambiar).
  const handleActivityChange = (choice: string) => {
    setValues((current) => {
      const next = { ...current, activityChoice: choice }
      const suggestion = SUGGESTED_ACTIVITIES.find((item) => item.name === choice)
      if (!plan && !frequencyTouched && suggestion) {
        next.frequency = suggestion.suggestedFrequencies[0]
      }
      return next
    })
  }

  // Al crear: la próxima fecha sigue a la fecha inicial mientras sean iguales.
  const handleStartDateChange = (startDate: string) => {
    setValues((current) => {
      const follows = !plan && (current.nextDate === '' || current.nextDate === current.startDate)
      return { ...current, startDate, nextDate: follows ? startDate : current.nextDate }
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validatePlan(values)
    setErrors(found)

    if (hasErrors(found)) {
      const first = PLAN_FIELD_ORDER.find((field) => found[field])
      if (first) document.getElementById(`plan-${first}`)?.focus()
      return
    }

    try {
      if (plan) {
        planService.update(plan.id, toPlanData(values, plan.lastCompletedAt))
        showToast('Mantenimiento actualizado correctamente')
        navigate(ROUTES.planDetail(plan.id))
      } else {
        const created = planService.create(toPlanData(values, ''))
        showToast('Mantenimiento programado correctamente')
        navigate(ROUTES.planDetail(created.id))
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar el mantenimiento.',
        'error',
      )
    }
  }

  const errorMessages = Object.values(errors)

  return (
    <>
      <PageHeader
        title={plan ? 'Editar mantenimiento' : 'Programar mantenimiento'}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Mantenimiento', to: ROUTES.plans() },
          ...(plan
            ? [{ label: plan.activity, to: ROUTES.planDetail(plan.id) }, { label: 'Editar' }]
            : [{ label: 'Nuevo' }]),
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
            id="plan-machineId"
            label="Máquina"
            required
            options={machineOptions}
            placeholder="Selecciona una máquina"
            value={values.machineId}
            onChange={(event) => handleMachineChange(event.target.value)}
            error={errors.machineId}
          />
          <Select
            id="plan-activity"
            label="Actividad"
            required
            options={ACTIVITY_OPTIONS}
            placeholder="Selecciona una actividad"
            value={values.activityChoice}
            onChange={(event) => handleActivityChange(event.target.value)}
            error={errors.activity}
          />
          {values.activityChoice === OTHER_ACTIVITY && (
            <TextInput
              id="plan-activityOther"
              label="Nombre de la actividad"
              required
              value={values.activityOther}
              onChange={(event) => setField('activityOther', event.target.value)}
              error={errors.activityOther}
            />
          )}
          <DateInput
            id="plan-startDate"
            label="Fecha inicial"
            required
            value={values.startDate}
            onChange={handleStartDateChange}
            error={errors.startDate}
          />
          <Select
            id="plan-frequency"
            label="Frecuencia"
            required
            options={FREQUENCIES}
            placeholder="Selecciona una frecuencia"
            value={values.frequency}
            onChange={(event) => {
              setFrequencyTouched(true)
              setField('frequency', event.target.value as Frequency | '')
            }}
            error={errors.frequency}
          />
          {values.frequency === 'Personalizada' && (
            <NumberInput
              id="plan-customIntervalDays"
              label="Cada cuántos días"
              required
              min={1}
              step={1}
              value={values.customIntervalDays}
              onChange={(value) => setField('customIntervalDays', value)}
              error={errors.customIntervalDays}
            />
          )}
          <DateInput
            id="plan-nextDate"
            label="Próxima fecha"
            required
            value={values.nextDate}
            onChange={(value) => setField('nextDate', value)}
            error={errors.nextDate}
            hint={plan ? 'Cambiarla reprograma el mantenimiento' : undefined}
          />
          <TextInput
            id="plan-responsible"
            label="Responsable"
            value={values.responsible}
            onChange={(event) => setField('responsible', event.target.value)}
          />
          <Select
            id="plan-priority"
            label="Prioridad"
            required
            options={PRIORITIES}
            placeholder="Selecciona una prioridad"
            value={values.priority}
            onChange={(event) => setField('priority', event.target.value as Priority | '')}
            error={errors.priority}
          />
          <NumberInput
            id="plan-estimatedMinutes"
            label="Tiempo estimado (minutos)"
            min={1}
            value={values.estimatedMinutes}
            onChange={(value) => setField('estimatedMinutes', value)}
            error={errors.estimatedMinutes}
          />
          <div className={styles.wide}>
            <TextArea
              id="plan-description"
              label="Descripción"
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </div>
          <div className={styles.wide}>
            <TextArea
              id="plan-notes"
              label="Observaciones"
              value={values.notes}
              onChange={(event) => setField('notes', event.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit">{plan ? 'Guardar cambios' : 'Programar mantenimiento'}</Button>
          <Button
            variant="secondary"
            onClick={() => navigate(plan ? ROUTES.planDetail(plan.id) : ROUTES.plans())}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </>
  )
}

export function MaintenanceFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const plan = id ? planService.getById(id) : undefined
  const hasMachines = machineService.list().length > 0

  if (id && !plan) {
    return (
      <ErrorState
        title="Mantenimiento no encontrado"
        description="El plan que intentas editar no existe o ya fue eliminado."
        action={
          <Button onClick={() => navigate(ROUTES.plans())}>Volver a mantenimiento</Button>
        }
      />
    )
  }

  if (!plan && !hasMachines) {
    return (
      <EmptyState
        title="Primero registra una máquina"
        description="Un mantenimiento se programa para una máquina. Aún no hay ninguna registrada."
        action={<Button onClick={() => navigate(ROUTES.machineNew())}>Registrar máquina</Button>}
      />
    )
  }

  const initialMachineId = searchParams.get('maquina') ?? ''

  return (
    <MaintenanceForm
      key={id ?? `new-${initialMachineId}`}
      plan={plan}
      initialMachineId={initialMachineId}
    />
  )
}
