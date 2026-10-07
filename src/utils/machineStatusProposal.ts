import type { Machine, MachineStatus, Repair, RepairStatus } from '../types'

interface ProposalInput {
  /** Estado con el que se guardó la reparación. */
  newStatus: RepairStatus
  /** Estado que tenía antes (undefined si es nueva). */
  previousStatus?: RepairStatus
  repairId: string
  machine: Machine
  /** Todas las reparaciones de esa máquina (ya con la guardada). */
  machineRepairs: Repair[]
}

/**
 * Estado que se PROPONE para la máquina (siempre con confirmación).
 * Devuelve null si no hay nada que proponer.
 */
export function proposeMachineStatus({
  newStatus,
  previousStatus,
  repairId,
  machine,
  machineRepairs,
}: ProposalInput): MachineStatus | null {
  if (newStatus === previousStatus) return null

  if (newStatus === 'En proceso') {
    return machine.status !== 'En mantenimiento' ? 'En mantenimiento' : null
  }

  if (newStatus === 'Finalizada') {
    const otherActive = machineRepairs.some(
      (repair) => repair.id !== repairId && repair.status === 'En proceso',
    )
    if (otherActive) return null
    return machine.status !== 'Operativa' ? 'Operativa' : null
  }

  return null
}