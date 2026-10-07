import type { Frequency } from '../types'

export interface FrequencyRule {
  value: Frequency
  /** Salto en días (si aplica). */
  days?: number
  /** Salto en meses (si aplica). Se suma con addMonths. */
  months?: number
}

export const FREQUENCY_RULES: FrequencyRule[] = [
  { value: 'Diaria', days: 1 },
  { value: 'Semanal', days: 7 },
  { value: 'Quincenal', days: 15 },
  { value: 'Mensual', months: 1 },
  { value: 'Bimestral', months: 2 },
  { value: 'Trimestral', months: 3 },
  { value: 'Semestral', months: 6 },
  { value: 'Anual', months: 12 },
  // Personalizada: usa plan.customIntervalDays
  { value: 'Personalizada' },
]

export const FREQUENCIES: Frequency[] = FREQUENCY_RULES.map((r) => r.value)