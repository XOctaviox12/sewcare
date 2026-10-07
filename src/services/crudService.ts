import type { BaseRecord } from '../types'
import { readCollection, writeCollection } from './storage'

/** Datos que captura el usuario: todo menos los campos que asigna el servicio. */
export type NewRecord<T extends BaseRecord> = Omit<T, keyof BaseRecord>

export interface CrudService<T extends BaseRecord> {
  list: () => T[]
  getById: (id: string) => T | undefined
  create: (data: NewRecord<T>) => T
  update: (id: string, data: Partial<NewRecord<T>>) => T
  remove: (id: string) => void
  replaceAll: (items: T[]) => void
}

export function createCrudService<T extends BaseRecord>(key: string): CrudService<T> {
  const list = (): T[] => readCollection<T>(key)

  const getById = (id: string): T | undefined =>
    list().find((item) => item.id === id)

  const create = (data: NewRecord<T>): T => {
    const now = new Date().toISOString()
    // El servicio asigna id y fechas; el resto lo captura el usuario.
    const record = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T
    writeCollection(key, [...list(), record])
    return record
  }

  const update = (id: string, data: Partial<NewRecord<T>>): T => {
    const items = list()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error('No se encontró el registro que intentas actualizar.')
    }
    const updated: T = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    items[index] = updated
    writeCollection(key, items)
    return updated
  }

  const remove = (id: string): void => {
    writeCollection(
      key,
      list().filter((item) => item.id !== id),
    )
  }

  const replaceAll = (items: T[]): void => {
    writeCollection(key, items)
  }

  return { list, getById, create, update, remove, replaceAll }
}