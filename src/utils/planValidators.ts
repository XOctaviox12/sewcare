import { OTHER_ACTIVITY, SUGGESTED_ACTIVITIES } from '../constants/activities'
import type { BaseRecord, Frequency, MaintenancePlan, Priority } from '../types'
import { toISODate, today } from './dates'
import {
  greaterThanZero,
  isDate,
  positiveInteger,
  required,
} from './validators'
import type { Errors } from './validators'

export interface PlanFormValues {
  machineId: string
  /** Valor del desplegable: una actividad sugerida o OTHER_ACTIVITY. */
  activityChoice: string
  /** Texto libre cuando activityChoice es OTHER_ACTIVITY. */
  activityOther: string
  description: string
  startDate: string
  frequency: Frequency | ''
  customIntervalDays: number | ''
  nextDate: string
  responsible: string
  priority: Priority | ''
  estimatedMinutes: number | ''
  notes: string
}

/** Orden de los campos (para enfocar el primero con error). */
export const PLAN_FIELD_ORDER: string[] = [
  'machineId',
  'activity',
  'activityOther',
  'startDate',
  'frequency',
  'customIntervalDays',
  'nextDate',
  'priority',
  'estimatedMinutes',
]

export function emptyPlanForm(machineId = '', responsible = ''): PlanFormValues {
  const todayISO = toISODate(today())
  return {
    machineId,
    activityChoice: '',
    activityOther: '',
    description: '',
    startDate: todayISO,
    frequency: '',
    customIntervalDays: '',
    nextDate: todayISO,
    responsible,
    priority: 'Media',
    estimatedMinutes: '',
    notes: '',
  }
}

export function planToFormValues(plan: MaintenancePlan): PlanFormValues {
  const isSuggested = SUGGESTED_ACTIVITIES.some((item) => item.name === plan.activity)
  return {
    machineId: plan.machineId,
    activityChoice: isSuggested ? plan.activity : OTHER_ACTIVITY,
    activityOther: isSuggested ? '' : plan.activity,
    description: plan.description,
    startDate: plan.startDate,
    frequency: plan.frequency,
    customIntervalDays: plan.customIntervalDays ?? '',
    nextDate: plan.nextDate,
    responsible: plan.responsible,
    priority: plan.priority,
    estimatedMinutes: plan.estimatedMinutes ?? '',
    notes: plan.notes,
  }
}

/** Nombre final de la actividad (sugerida o escrita). */
export function resolveActivity(values: PlanFormValues): string {
  return values.activityChoice === OTHER_ACTIVITY
    ? values.activityOther.trim()
    : values.activityChoice
}

export function validatePlan(values: PlanFormValues): Errors {
  const errors: Errors = {}

  if (!values.machineId) errors.machineId = 'Selecciona una máquina'

  if (!values.activityChoice) {
    errors.activity = 'Selecciona una actividad'
  } else if (values.activityChoice === OTHER_ACTIVITY && !required(values.activityOther)) {
    errors.activityOther = 'Escribe el nombre de la actividad'
  }

  if (!required(values.startDate)) {
    errors.startDate = 'La fecha inicial es obligatoria'
  } else if (!isDate(values.startDate)) {
    errors.startDate = 'La fecha inicial no es válida'
  }

  if (!values.frequency) errors.frequency = 'Selecciona una frecuencia'

  if (values.frequency === 'Personalizada') {
    if (values.customIntervalDays === '' || !positiveInteger(values.customIntervalDays)) {
      errors.customIntervalDays = 'Escribe un número entero de días mayor que cero'
    }
  }

  if (!required(values.nextDate)) {
    errors.nextDate = 'La próxima fecha es obligatoria'
  } else if (!isDate(values.nextDate)) {
    errors.nextDate = 'La próxima fecha no es válida'
  } else if (isDate(values.startDate) && values.nextDate < values.startDate) {
    errors.nextDate = 'La próxima fecha no puede ser anterior a la fecha inicial'
  }

  if (!values.priority) errors.priority = 'Selecciona una prioridad'

  if (values.estimatedMinutes !== '' && !greaterThanZero(values.estimatedMinutes)) {
    errors.estimatedMinutes = 'El tiempo estimado debe ser mayor que cero'
  }

  return errors
}

/** Convierte el formulario (ya validado) en datos para guardar. */
export function toPlanData(
  values: PlanFormValues,
  lastCompletedAt: string,
): Omit<MaintenancePlan, keyof BaseRecord> {
  return {
    machineId: values.machineId,
    activity: resolveActivity(values),
    description: values.description.trim(),
    startDate: values.startDate,
    frequency: values.frequency as Frequency,
    customIntervalDays:
      values.frequency === 'Personalizada' && values.customIntervalDays !== ''
        ? values.customIntervalDays
        : undefined,
    nextDate: values.nextDate,
    lastCompletedAt,
    responsible: values.responsible.trim(),
    priority: values.priority as Priority,
    estimatedMinutes: values.estimatedMinutes === '' ? undefined : values.estimatedMinutes,
    notes: values.notes.trim(),
  }
}