import { isFutureDate, isValidISODate } from './dates'

/** Mapa campo -> mensaje de error. Vacío = sin errores. */
export type Errors = Record<string, string>

export function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0
}

/** Texto no vacío (ignora espacios). */
export function required(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Fecha "AAAA-MM-DD" que exista en el calendario. */
export function isDate(value: string): boolean {
  return isValidISODate(value)
}

/** Fecha válida y no futura. */
export function isNotFutureDate(value: string): boolean {
  return isValidISODate(value) && !isFutureDate(value)
}

/** Número finito mayor o igual a cero. */
export function notNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

/** Número finito mayor que cero. */
export function greaterThanZero(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/** Entero mayor que cero (por ejemplo, intervalo personalizado en días). */
export function positiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}