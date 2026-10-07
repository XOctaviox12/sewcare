import { STORAGE_KEYS } from '../constants/storageKeys'
import { removeKey } from './storage'

export { machineService } from './machineService'
export { planService } from './planService'
export { historyService } from './historyService'
export { repairService } from './repairService'
export { sparePartService } from './sparePartService'
export { settingsService, CURRENT_SCHEMA_VERSION } from './settingsService'
export { StorageError } from './storage'
export type { StorageErrorCode } from './storage'
export type { CrudService, NewRecord } from './crudService'
export { seedDemoIfFirstRun, restoreDemoData } from './demoService'
export { countMachineDependents, deleteMachineCascade } from './cascade'
export type { MachineDependents } from './cascade'
export {
  completePlan,
  countPlanHistory,
  deletePlanWithHistory,
} from './maintenanceService'
export type { CompletePlanInput, CompletePlanResult } from './maintenanceService'

/**
 * Borra las 5 colecciones de datos. NO borra settings,
 * para conservar demoLoaded y que la demo no regrese sola.
 */
export function clearAllCollections(): void {
  removeKey(STORAGE_KEYS.machines)
  removeKey(STORAGE_KEYS.plans)
  removeKey(STORAGE_KEYS.history)
  removeKey(STORAGE_KEYS.repairs)
  removeKey(STORAGE_KEYS.spareParts)
}