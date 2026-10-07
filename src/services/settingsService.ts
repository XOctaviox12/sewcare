import { STORAGE_KEYS } from '../constants/storageKeys'
import type { Settings } from '../types'
import { readObject, writeObject } from './storage'

export const CURRENT_SCHEMA_VERSION = 1
const SETTINGS_ID = 'settings'

function buildDefaults(): Settings {
  const now = new Date().toISOString()
  return {
    id: SETTINGS_ID,
    createdAt: now,
    updatedAt: now,
    highRepairCost: 5000,
    demoLoaded: false,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }
}

export const settingsService = {
  /** Devuelve la configuración guardada, completando con valores por defecto lo que falte. */
  get(): Settings {
    const stored = readObject<Partial<Settings>>(STORAGE_KEYS.settings)
    return { ...buildDefaults(), ...stored }
  },

  update(data: Partial<Pick<Settings, 'highRepairCost' | 'demoLoaded' | 'schemaVersion'>>): Settings {
    const updated: Settings = {
      ...settingsService.get(),
      ...data,
      updatedAt: new Date().toISOString(),
    }
    writeObject(STORAGE_KEYS.settings, updated)
    return updated
  },

  /** Reemplaza todo (se usa al importar un respaldo). */
  replace(settings: Settings): void {
    writeObject(STORAGE_KEYS.settings, settings)
  },
}