import type { BaseRecord, Machine, MachineStatus, MachineType } from '../types'
import { normalizeText } from './text'
import { isNotFutureDate, notNegative, required } from './validators'
import type { Errors } from './validators'

/** Valores del formulario (los selects y el número pueden estar vacíos). */
export interface MachineFormValues {
  code: string
  name: string
  brand: string
  model: string
  serialNumber: string
  type: MachineType | ''
  area: string
  productionLine: string
  acquisitionDate: string
  status: MachineStatus | ''
  usageHours: number | ''
  responsible: string
  notes: string
}

export const EMPTY_MACHINE_FORM: MachineFormValues = {
  code: '',
  name: '',
  brand: '',
  model: '',
  serialNumber: '',
  type: '',
  area: '',
  productionLine: '',
  acquisitionDate: '',
  status: 'Operativa',
  usageHours: '',
  responsible: '',
  notes: '',
}

/** Orden de los campos (para enfocar el primero con error). */
export const MACHINE_FIELD_ORDER: (keyof MachineFormValues)[] = [
  'code',
  'name',
  'brand',
  'model',
  'serialNumber',
  'type',
  'area',
  'productionLine',
  'acquisitionDate',
  'status',
  'usageHours',
  'responsible',
  'notes',
]

export function machineToFormValues(machine: Machine): MachineFormValues {
  return {
    code: machine.code,
    name: machine.name,
    brand: machine.brand,
    model: machine.model,
    serialNumber: machine.serialNumber,
    type: machine.type,
    area: machine.area,
    productionLine: machine.productionLine,
    acquisitionDate: machine.acquisitionDate,
    status: machine.status,
    usageHours: machine.usageHours,
    responsible: machine.responsible,
    notes: machine.notes,
  }
}

function sameText(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b)
}

/**
 * Valida el formulario. `editingId` es la máquina que se está editando
 * (se ignora al buscar duplicados).
 */
export function validateMachine(
  values: MachineFormValues,
  machines: Machine[],
  editingId?: string,
): Errors {
  const errors: Errors = {}
  const others = machines.filter((machine) => machine.id !== editingId)

  if (!required(values.code)) {
    errors.code = 'El código interno es obligatorio'
  } else if (others.some((m) => sameText(m.code, values.code))) {
    errors.code = 'El código interno ya está registrado en otra máquina'
  }

  if (!required(values.name)) errors.name = 'El nombre es obligatorio'
  if (!required(values.brand)) errors.brand = 'La marca es obligatoria'
  if (!required(values.model)) errors.model = 'El modelo es obligatorio'

  if (!required(values.serialNumber)) {
    errors.serialNumber = 'El número de serie es obligatorio'
  } else if (others.some((m) => sameText(m.serialNumber, values.serialNumber))) {
    errors.serialNumber = 'El número de serie ya está registrado en otra máquina'
  }

  if (!values.type) errors.type = 'Selecciona un tipo de máquina'
  if (!required(values.area)) errors.area = 'El área es obligatoria'
  if (!values.status) errors.status = 'Selecciona un estado'

  if (values.acquisitionDate && !isNotFutureDate(values.acquisitionDate)) {
    errors.acquisitionDate = 'La fecha de adquisición debe ser válida y no futura'
  }

  if (values.usageHours !== '' && !notNegative(values.usageHours)) {
    errors.usageHours = 'Las horas de uso deben ser un número mayor o igual a cero'
  }

  return errors
}

/** Convierte el formulario (ya validado) en datos para guardar. */
export function toMachineData(
  values: MachineFormValues,
): Omit<Machine, keyof BaseRecord> {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    serialNumber: values.serialNumber.trim(),
    type: values.type as MachineType,
    area: values.area.trim(),
    productionLine: values.productionLine.trim(),
    acquisitionDate: values.acquisitionDate,
    status: values.status as MachineStatus,
    usageHours: values.usageHours === '' ? 0 : values.usageHours,
    responsible: values.responsible.trim(),
    notes: values.notes.trim(),
  }
}