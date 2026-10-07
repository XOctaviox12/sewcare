import { historyService } from './historyService'
import { machineService } from './machineService'
import { planService } from './planService'
import { repairService } from './repairService'
import { sparePartService } from './sparePartService'

export interface MachineDependents {
  plans: number
  history: number
  repairs: number
  spareParts: number
}

function repairIdsOf(machineId: string): Set<string> {
  return new Set(
    repairService
      .list()
      .filter((repair) => repair.machineId === machineId)
      .map((repair) => repair.id),
  )
}

/** Cuántos registros se borrarían junto con la máquina. */
export function countMachineDependents(machineId: string): MachineDependents {
  const repairIds = repairIdsOf(machineId)
  return {
    plans: planService.list().filter((p) => p.machineId === machineId).length,
    history: historyService.list().filter((h) => h.machineId === machineId).length,
    repairs: repairIds.size,
    spareParts: sparePartService.list().filter((s) => repairIds.has(s.repairId)).length,
  }
}

/** Borra refacciones -> reparaciones -> historial -> planes -> máquina. */
export function deleteMachineCascade(machineId: string): void {
  const repairIds = repairIdsOf(machineId)

  sparePartService.replaceAll(
    sparePartService.list().filter((s) => !repairIds.has(s.repairId)),
  )
  repairService.replaceAll(
    repairService.list().filter((r) => r.machineId !== machineId),
  )
  historyService.replaceAll(
    historyService.list().filter((h) => h.machineId !== machineId),
  )
  planService.replaceAll(
    planService.list().filter((p) => p.machineId !== machineId),
  )
  machineService.remove(machineId)
}