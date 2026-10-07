import { STORAGE_KEYS } from '../constants/storageKeys'
import type { SparePart } from '../types'
import { createCrudService } from './crudService'

export const sparePartService = createCrudService<SparePart>(
  STORAGE_KEYS.spareParts,
)