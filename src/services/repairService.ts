import { STORAGE_KEYS } from '../constants/storageKeys'
import type { Repair } from '../types'
import { createCrudService } from './crudService'

export const repairService = createCrudService<Repair>(STORAGE_KEYS.repairs)