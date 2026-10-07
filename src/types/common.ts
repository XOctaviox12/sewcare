/** Campos comunes de todo registro guardado en localStorage. */
export interface BaseRecord {
  id: string
  /** ISO con hora, ej. "2026-10-05T12:00:00.000Z" */
  createdAt: string
  /** ISO con hora */
  updatedAt: string
}

/** Fecha en formato "AAAA-MM-DD". Vacío ("") si no aplica. */
export type ISODate = string