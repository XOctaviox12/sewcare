import type { Repair, SparePart } from '../types'
import type { PartData, RepairData } from '../utils'
import { repairService } from './repairService'
import { sparePartService } from './sparePartService'

/**
 * Guarda la reparación y reemplaza sus refacciones.
 * Si algo falla, revierte lo que alcanzó a guardar.
 */
export function saveRepair(
  repairId: string | undefined,
  data: RepairData,
  parts: PartData[],
): Repair {
  const previousParts = sparePartService.list()
  const previousRepair = repairId ? repairService.getById(repairId) : undefined

  if (repairId && !previousRepair) {
    throw new Error('No se encontró la reparación que intentas actualizar.')
  }

  let createdId: string | undefined

  try {
    const repair = previousRepair
      ? repairService.update(previousRepair.id, data)
      : repairService.create(data)
    if (!previousRepair) createdId = repair.id

    const now = new Date().toISOString()
    const records: SparePart[] = parts.map((part) => ({
      ...part,
      repairId: repair.id,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }))

    sparePartService.replaceAll([
      ...previousParts.filter((part) => part.repairId !== repair.id),
      ...records,
    ])
    return repair
  } catch (error) {
    try {
      sparePartService.replaceAll(previousParts)
      if (createdId) repairService.remove(createdId)
      else if (previousRepair) repairService.update(previousRepair.id, previousRepair)
    } catch {
      // Si la reversión también falla (sin espacio), se conserva el error original.
    }
    throw error
  }
}

/** Cuántas refacciones se borrarían junto con la reparación. */
export function countRepairParts(repairId: string): number {
  return sparePartService.list().filter((part) => part.repairId === repairId).length
}

/** Borra las refacciones de la reparación y luego la reparación. */
export function deleteRepairWithParts(repairId: string): void {
  sparePartService.replaceAll(
    sparePartService.list().filter((part) => part.repairId !== repairId),
  )
  repairService.remove(repairId)
}