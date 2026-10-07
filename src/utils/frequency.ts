import { addDays, addMonths } from 'date-fns'
import { FREQUENCY_RULES } from '../constants/frequencies'
import type { Frequency, ISODate } from '../types'
import { parseISODate, toISODate } from './dates'

/**
 * Suma la frecuencia a una fecha "AAAA-MM-DD".
 * Los meses usan addMonths (maneja fin de mes: 31 ene + 1 mes = 28/29 feb).
 */
export function addFrequency(
  date: ISODate,
  frequency: Frequency,
  customIntervalDays?: number,
): ISODate {
  const base = parseISODate(date)
  if (!base) return date

  if (frequency === 'Personalizada') {
    const days = customIntervalDays && customIntervalDays > 0 ? customIntervalDays : 1
    return toISODate(addDays(base, days))
  }

  const rule = FREQUENCY_RULES.find((item) => item.value === frequency)
  if (rule?.months) return toISODate(addMonths(base, rule.months))
  if (rule?.days) return toISODate(addDays(base, rule.days))
  return date
}