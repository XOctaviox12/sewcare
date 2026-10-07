export type StorageErrorCode = 'QUOTA_EXCEEDED' | 'UNAVAILABLE'

/** Error propio con mensaje claro en español. */
export class StorageError extends Error {
  code: StorageErrorCode

  constructor(code: StorageErrorCode, message: string) {
    super(message)
    this.name = 'StorageError'
    this.code = code
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  )
}

function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    if (isQuotaError(error)) {
      throw new StorageError(
        'QUOTA_EXCEEDED',
        'No hay espacio suficiente en el navegador para guardar. Descarga un respaldo desde Configuración y libera espacio.',
      )
    }
    throw new StorageError(
      'UNAVAILABLE',
      'No se pudo guardar en el navegador. Revisa que el almacenamiento esté habilitado (por ejemplo, fuera de modo privado).',
    )
  }
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    throw new StorageError(
      'UNAVAILABLE',
      'No se pudo leer el almacenamiento del navegador.',
    )
  }
}

/** Guarda una copia del dato dañado para no perderlo del todo. */
function backupCorrupt(key: string, raw: string): void {
  try {
    localStorage.setItem(`${key}:corrupt`, raw)
  } catch {
    // Si no hay espacio ni para la copia, se ignora.
  }
}

/** Lee una colección (arreglo). Si no existe o está dañada, devuelve []. */
export function readCollection<T>(key: string): T[] {
  const raw = readRaw(key)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as T[]
    backupCorrupt(key, raw)
    return []
  } catch {
    backupCorrupt(key, raw)
    return []
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  writeRaw(key, JSON.stringify(items))
}

/** Lee un objeto único (por ejemplo, settings). Devuelve null si no existe o está dañado. */
export function readObject<T>(key: string): T | null {
  const raw = readRaw(key)
  if (raw === null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as T
    }
    backupCorrupt(key, raw)
    return null
  } catch {
    backupCorrupt(key, raw)
    return null
  }
}

export function writeObject<T>(key: string, value: T): void {
  writeRaw(key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    throw new StorageError(
      'UNAVAILABLE',
      'No se pudo borrar el almacenamiento del navegador.',
    )
  }
}