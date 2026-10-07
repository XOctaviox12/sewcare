import type { Repair, SparePart } from '../types'

export function partSubtotal(part: SparePart): number {
  return part.quantity * part.unitCost
}

export function partsTotal(parts: SparePart[]): number {
  return parts.reduce((sum, part) => sum + partSubtotal(part), 0)
}

/** Total de una reparación = refacciones + mano de obra. Recibe TODAS las refacciones. */
export function repairTotal(repair: Repair, allParts: SparePart[]): number {
  const own = allParts.filter((part) => part.repairId === repair.id)
  return partsTotal(own) + repair.laborCost
}

/** Costo acumulado de todas las reparaciones de una máquina. */
export function machineRepairCost(
  machineId: string,
  repairs: Repair[],
  allParts: SparePart[],
): number {
  return repairs
    .filter((repair) => repair.machineId === machineId)
    .reduce((sum, repair) => sum + repairTotal(repair, allParts), 0)
}