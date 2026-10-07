import type { BaseRecord, ISODate } from './common'

export type MachineStatus = 'Operativa' | 'En mantenimiento' | 'Fuera de servicio'

export type MachineType =
  | 'Recta'
  | 'Overlock'
  | 'Collaretera'
  | 'Presilladora'
  | 'Ojaladora'
  | 'Botonadora'
  | 'Cerradora'
  | 'Cortadora'
  | 'Bordadora'
  | 'Otra'

export interface Machine extends BaseRecord {
  /** Código interno. No se repite. */
  code: string
  name: string
  brand: string
  model: string
  /** Número de serie. No se repite. */
  serialNumber: string
  type: MachineType
  area: string
  productionLine: string
  acquisitionDate: ISODate
  status: MachineStatus
  usageHours: number
  responsible: string
  notes: string
}