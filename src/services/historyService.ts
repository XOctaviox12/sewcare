import { STORAGE_KEYS } from '../constants/storageKeys'
import type { MaintenanceHistory } from '../types'
import { createCrudService } from './crudService'

export const historyService = createCrudService<MaintenanceHistory>(
  STORAGE_KEYS.history,
)