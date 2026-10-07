import type {
  MachineStatus,
  PlanStatus,
  Priority,
  Punctuality,
  RepairStatus,
} from '../types'

export const MACHINE_STATUSES: MachineStatus[] = [
  'Operativa',
  'En mantenimiento',
  'Fuera de servicio',
]

export const PLAN_STATUSES: PlanStatus[] = [
  'Pendiente',
  'Próximo',
  'Vencido',
  'Completado',
]

export const REPAIR_STATUSES: RepairStatus[] = [
  'Reportada',
  'En proceso',
  'Finalizada',
]

export const PUNCTUALITY_OPTIONS: Punctuality[] = ['A tiempo', 'Con retraso']

export const PRIORITIES: Priority[] = ['Baja', 'Media', 'Alta']