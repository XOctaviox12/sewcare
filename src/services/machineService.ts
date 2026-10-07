import { STORAGE_KEYS } from '../constants/storageKeys'
import type { Machine } from '../types'
import { createCrudService } from './crudService'

export const machineService = createCrudService<Machine>(STORAGE_KEYS.machines)