import type { BaseRecord, ISODate } from './common'

export type Frequency =
  | 'Diaria'
  | 'Semanal'
  | 'Quincenal'
  | 'Mensual'
  | 'Bimestral'
  | 'Trimestral'
  | 'Semestral'
  | 'Anual'
  | 'Personalizada'

export type Priority = 'Baja' | 'Media' | 'Alta'

/** Se CALCULA siempre, nunca se guarda. */
export type PlanStatus = 'Pendiente' | 'Próximo' | 'Vencido' | 'Completado'

export type Punctuality = 'A tiempo' | 'Con retraso'

export interface MaintenancePlan extends BaseRecord {
  machineId: string
  activity: string
  description: string
  startDate: ISODate
  frequency: Frequency
  /** Solo si frequency === 'Personalizada'. Entero mayor que cero. */
  customIntervalDays?: number
  nextDate: ISODate
  /** "" si nunca se ha completado. */
  lastCompletedAt: ISODate
  responsible: string
  priority: Priority
  /** Minutos. Si se captura, mayor que cero. */
  estimatedMinutes?: number
  notes: string
}

export interface MaintenanceHistory extends BaseRecord {
  planId: string
  machineId: string
  activity: string
  /** La nextDate que tenía el plan antes de completarlo. */
  scheduledDate: ISODate
  completedDate: ISODate
  responsible: string
  punctuality: Punctuality
  tasksDone: string[]
  notes: string
}