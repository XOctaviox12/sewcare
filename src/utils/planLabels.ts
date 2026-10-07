/** Texto para los días restantes de un plan. */
export function daysLabel(days: number | null): string {
  if (days === null) return '—'
  if (days < 0) {
    const n = -days
    return `Venció hace ${n} ${n === 1 ? 'día' : 'días'}`
  }
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}