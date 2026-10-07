import { toISODate, today } from './dates'

export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number
}

function escapeCell(value: string | number): string {
  let text = typeof value === 'number' ? String(value) : value
  // Evita que Excel interprete un texto como fórmula.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** Separador coma, comillas dobles escapadas, saltos de línea CRLF. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(',')
  const lines = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(','),
  )
  return [header, ...lines].join('\r\n')
}

/** UTF-8 con BOM para que Excel respete los acentos. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** "reparaciones" -> "sewcare-reparaciones-2026-10-07.csv" */
export function csvFilename(name: string): string {
  return `sewcare-${name}-${toISODate(today())}.csv`
}