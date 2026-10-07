import type { BackupData, BackupFile } from '../utils/backup'
import { BACKUP_APP, BACKUP_SCHEMA_VERSION } from '../utils/backup'
import { historyService } from './historyService'
import { machineService } from './machineService'
import { planService } from './planService'
import { repairService } from './repairService'
import { CURRENT_SCHEMA_VERSION, settingsService } from './settingsService'
import { sparePartService } from './sparePartService'

/** Respaldo con todos los datos actuales. */
export function createBackup(): BackupFile {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      machines: machineService.list(),
      maintenancePlans: planService.list(),
      maintenanceHistory: historyService.list(),
      repairs: repairService.list(),
      spareParts: sparePartService.list(),
      settings: settingsService.get(),
    },
  }
}

function writeAll(data: BackupData): void {
  machineService.replaceAll(data.machines)
  planService.replaceAll(data.maintenancePlans)
  historyService.replaceAll(data.maintenanceHistory)
  repairService.replaceAll(data.repairs)
  sparePartService.replaceAll(data.spareParts)
  // demoLoaded = true: tras importar, la demo no debe volver sola.
  settingsService.replace({
    ...data.settings,
    demoLoaded: true,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  })
}

/**
 * Reemplaza TODOS los datos por los del respaldo (ya validado).
 * Si falla a la mitad (por ejemplo, sin espacio), devuelve los datos anteriores.
 */
export function restoreBackup(data: BackupData): void {
  const snapshot = createBackup().data
  try {
    writeAll(data)
  } catch (error) {
    try {
      writeAll(snapshot)
    } catch {
      // Si la reversión también falla, se conserva el error original.
    }
    throw error
  }
}