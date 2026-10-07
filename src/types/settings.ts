import type { BaseRecord } from './common'

export interface Settings extends BaseRecord {
  /** Una reparación con total mayor a este valor genera alerta crítica. */
  highRepairCost: number
  /** true cuando ya se cargó (o se borró) la demo; evita recargarla sola. */
  demoLoaded: boolean
  schemaVersion: number
}