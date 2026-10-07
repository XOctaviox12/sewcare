import {
  differenceInCalendarDays,
  format,
  isValid,
  parse,
  startOfDay,
} from 'date-fns'
import type { ISODate } from '../types'

const ISO_FORMAT = 'yyyy-MM-dd'
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** "Hoy" = inicio del día actual (sin hora). */
export function today(): Date {
  return startOfDay(new Date())
}

/** Date -> "AAAA-MM-DD" */
export function toISODate(date: Date): ISODate {
  return format(date, ISO_FORMAT)
}

/** "AAAA-MM-DD" -> Date (a medianoche, hora local). Devuelve null si no es válida. */
export function parseISODate(text: string): Date | null {
  if (!isValidISODate(text)) return null
  return parse(text, ISO_FORMAT, new Date())
}

/** Valida formato y que la fecha exista (rechaza "2026-02-30"). */
export function isValidISODate(text: string): boolean {
  if (!ISO_PATTERN.test(text)) return false
  const date = parse(text, ISO_FORMAT, new Date())
  return isValid(date) && format(date, ISO_FORMAT) === text
}

/** "2026-10-05" -> "05/10/2026". Devuelve "" si está vacía o no es válida. */
export function formatDate(text: string): string {
  const date = parseISODate(text)
  return date ? format(date, 'dd/MM/yyyy') : ''
}

/**
 * Días entre hoy y la fecha: positivo = faltan, 0 = hoy, negativo = ya pasó.
 * Devuelve null si la fecha no es válida.
 */
export function daysUntil(text: string): number | null {
  const date = parseISODate(text)
  return date ? differenceInCalendarDays(date, today()) : null
}

/** true si la fecha es posterior a hoy. */
export function isFutureDate(text: string): boolean {
  const days = daysUntil(text)
  return days !== null && days > 0
}