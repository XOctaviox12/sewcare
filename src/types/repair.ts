import type { BaseRecord, ISODate } from './common'

export type RepairStatus = 'Reportada' | 'En proceso' | 'Finalizada'

export interface Repair extends BaseRecord {
  machineId: string
  reportDate: ISODate
  /** "" mientras no esté reparada. */
  repairDate: ISODate
  failure: string
  diagnosis: string
  workDone: string
  technician: string
  downtimeHours: number
  laborCost: number
  status: RepairStatus
  notes: string
}

export interface SparePart extends BaseRecord {
  repairId: string
  name: string
  code: string
  quantity: number
  unitCost: number
  supplier: string
}