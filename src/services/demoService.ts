import { buildDemoData } from '../data/demoData'
import { machineService } from './machineService'
import { planService } from './planService'
import { historyService } from './historyService'
import { repairService } from './repairService'
import { sparePartService } from './sparePartService'
import { settingsService } from './settingsService'

function writeDemoData(): void {
  const data = buildDemoData()
  machineService.replaceAll(data.machines)
  planService.replaceAll(data.plans)
  historyService.replaceAll(data.history)
  repairService.replaceAll(data.repairs)
  sparePartService.replaceAll(data.spareParts)
}

/**
 * Primer inicio: si no hay datos Y la demo nunca se cargó, la carga.
 * Después de "Eliminar todos los datos" NO se vuelve a cargar sola
 * (demoLoaded queda en true).
 */
export function seedDemoIfFirstRun(): void {
  const settings = settingsService.get()
  if (settings.demoLoaded) return

  const hasData =
    machineService.list().length > 0 ||
    planService.list().length > 0 ||
    historyService.list().length > 0 ||
    repairService.list().length > 0 ||
    sparePartService.list().length > 0

  if (!hasData) writeDemoData()
  settingsService.update({ demoLoaded: true })
}

/** Reemplaza todos los datos por la demo (se usará en Configuración). */
export function restoreDemoData(): void {
  writeDemoData()
  settingsService.update({ demoLoaded: true })
}