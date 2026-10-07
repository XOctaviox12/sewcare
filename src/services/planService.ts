import { STORAGE_KEYS } from '../constants/storageKeys'
import type { MaintenancePlan } from '../types'
import { createCrudService } from './crudService'

export const planService = createCrudService<MaintenancePlan>(STORAGE_KEYS.plans)