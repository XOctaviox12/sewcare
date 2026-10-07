import type { BaseRecord, Repair, RepairStatus, SparePart } from '../types'
import { isDate, greaterThanZero, notNegative, required } from './validators'
import type { Errors } from './validators'
import { toISODate, today } from './dates'

export type RepairData = Omit<Repair, keyof BaseRecord>
export type PartData = Omit<SparePart, keyof BaseRecord | 'repairId'>

export interface PartFormValues {
  /** Llave de React (no se guarda). */
  key: string
  name: string
  code: string
  quantity: number | ''
  unitCost: number | ''
  supplier: string
}

export interface RepairFormValues {
  machineId: string
  reportDate: string
  repairDate: string
  failure: string
  diagnosis: string
  workDone: string
  technician: string
  downtimeHours: number | ''
  laborCost: number | ''
  status: RepairStatus | ''
  notes: string
  parts: PartFormValues[]
}

export function emptyPart(): PartFormValues {
  return {
    key: crypto.randomUUID(),
    name: '',
    code: '',
    quantity: 1,
    unitCost: '',
    supplier: '',
  }
}

export function emptyRepairForm(machineId = ''): RepairFormValues {
  return {
    machineId,
    reportDate: toISODate(today()),
    repairDate: '',
    failure: '',
    diagnosis: '',
    workDone: '',
    technician: '',
    downtimeHours: '',
    laborCost: '',
    status: 'Reportada',
    notes: '',
    parts: [],
  }
}

export function repairToFormValues(
  repair: Repair,
  allParts: SparePart[],
): RepairFormValues {
  return {
    machineId: repair.machineId,
    reportDate: repair.reportDate,
    repairDate: repair.repairDate,
    failure: repair.failure,
    diagnosis: repair.diagnosis,
    workDone: repair.workDone,
    technician: repair.technician,
    downtimeHours: repair.downtimeHours,
    laborCost: repair.laborCost,
    status: repair.status,
    notes: repair.notes,
    parts: allParts
      .filter((part) => part.repairId === repair.id)
      .map((part) => ({
        key: part.id,
        name: part.name,
        code: part.code,
        quantity: part.quantity,
        unitCost: part.unitCost,
        supplier: part.supplier,
      })),
  }
}

/* ---------- Costos en vivo (solo para mostrar mientras se captura) ---------- */

export function formPartSubtotal(part: PartFormValues): number {
  return typeof part.quantity === 'number' && typeof part.unitCost === 'number'
    ? part.quantity * part.unitCost
    : 0
}

export function formPartsTotal(parts: PartFormValues[]): number {
  return parts.reduce((sum, part) => sum + formPartSubtotal(part), 0)
}

export function formRepairTotal(values: RepairFormValues): number {
  const labor = typeof values.laborCost === 'number' ? values.laborCost : 0
  return formPartsTotal(values.parts) + labor
}

/* ---------- Validación ---------- */

/**
 * Llaves de error:
 *  - campos fijos: machineId, reportDate, repairDate, failure, workDone,
 *    downtimeHours, laborCost, status
 *  - refacciones: part-<índice>-name | quantity | unitCost
 * El id del elemento en pantalla es "repair-<llave>".
 */
export function validateRepair(values: RepairFormValues): Errors {
  const errors: Errors = {}

  if (!values.machineId) errors.machineId = 'Selecciona una máquina'

  if (!required(values.reportDate)) {
    errors.reportDate = 'La fecha de reporte es obligatoria'
  } else if (!isDate(values.reportDate)) {
    errors.reportDate = 'La fecha de reporte no es válida'
  }

  if (!required(values.failure)) errors.failure = 'Describe la falla detectada'
  if (!values.status) errors.status = 'Selecciona un estado'

  if (values.status === 'Finalizada') {
    if (!required(values.repairDate)) {
      errors.repairDate = 'La fecha de reparación es obligatoria si está Finalizada'
    }
    if (!required(values.workDone)) {
      errors.workDone = 'Describe la reparación realizada si está Finalizada'
    }
  }

  if (required(values.repairDate)) {
    if (!isDate(values.repairDate)) {
      errors.repairDate = 'La fecha de reparación no es válida'
    } else if (isDate(values.reportDate) && values.repairDate < values.reportDate) {
      errors.repairDate = 'La fecha de reparación no puede ser anterior a la de reporte'
    }
  }

  if (values.downtimeHours !== '' && !notNegative(values.downtimeHours)) {
    errors.downtimeHours = 'Las horas de paro deben ser un número mayor o igual a cero'
  }
  if (values.laborCost !== '' && !notNegative(values.laborCost)) {
    errors.laborCost = 'La mano de obra debe ser un número mayor o igual a cero'
  }

  values.parts.forEach((part, index) => {
    if (!required(part.name)) {
      errors[`part-${index}-name`] = `Refacción ${index + 1}: el nombre es obligatorio`
    }
    if (part.quantity === '' || !greaterThanZero(part.quantity)) {
      errors[`part-${index}-quantity`] = `Refacción ${index + 1}: la cantidad debe ser mayor que cero`
    }
    if (part.unitCost === '' || !notNegative(part.unitCost)) {
      errors[`part-${index}-unitCost`] =
        `Refacción ${index + 1}: el costo unitario debe ser mayor o igual a cero`
    }
  })

  return errors
}

const FIXED_ORDER = [
  'machineId',
  'reportDate',
  'repairDate',
  'failure',
  'workDone',
  'downtimeHours',
  'laborCost',
  'status',
]

/** Primera llave con error, en el orden en que se ven los campos. */
export function firstRepairErrorKey(errors: Errors): string | undefined {
  const fixed = FIXED_ORDER.find((key) => errors[key])
  if (fixed) return fixed
  return Object.keys(errors).find((key) => key.startsWith('part-'))
}

/* ---------- Conversión a datos para guardar ---------- */

export function toRepairData(values: RepairFormValues): RepairData {
  return {
    machineId: values.machineId,
    reportDate: values.reportDate,
    repairDate: values.repairDate,
    failure: values.failure.trim(),
    diagnosis: values.diagnosis.trim(),
    workDone: values.workDone.trim(),
    technician: values.technician.trim(),
    downtimeHours: values.downtimeHours === '' ? 0 : values.downtimeHours,
    laborCost: values.laborCost === '' ? 0 : values.laborCost,
    status: values.status as RepairStatus,
    notes: values.notes.trim(),
  }
}

export function toPartsData(values: RepairFormValues): PartData[] {
  return values.parts.map((part) => ({
    name: part.name.trim(),
    code: part.code.trim(),
    quantity: part.quantity === '' ? 0 : part.quantity,
    unitCost: part.unitCost === '' ? 0 : part.unitCost,
    supplier: part.supplier.trim(),
  }))
}