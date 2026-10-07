import type { MaintenanceHistory, Punctuality } from '../types'
import { addFrequency } from '../utils'
import { historyService } from './historyService'
import { planService } from './planService'

export interface CompletePlanInput {
  /** "AAAA-MM-DD" */
  completedDate: string
  responsible: string
  tasksDone: string[]
  notes: string
}

export interface CompletePlanResult {
  record: MaintenanceHistory
  nextDate: string
}

/**
 * Completa un mantenimiento:
 *  1. Crea el registro de historial (programada = la nextDate anterior).
 *  2. Guarda lastCompletedAt y calcula la nueva nextDate desde la
 *     fecha de realización.
 * Si falla el paso 2, revierte el paso 1.
 */
export function completePlan(
  planId: string,
  input: CompletePlanInput,
): CompletePlanResult {
  const plan = planService.getById(planId)
  if (!plan) {
    throw new Error('No se encontró el plan de mantenimiento.')
  }

  const punctuality: Punctuality =
    input.completedDate <= plan.nextDate ? 'A tiempo' : 'Con retraso'

  const nextDate = addFrequency(
    input.completedDate,
    plan.frequency,
    plan.customIntervalDays,
  )

  const record = historyService.create({
    planId: plan.id,
    machineId: plan.machineId,
    activity: plan.activity,
    scheduledDate: plan.nextDate,
    completedDate: input.completedDate,
    responsible: input.responsible.trim(),
    punctuality,
    tasksDone: input.tasksDone,
    notes: input.notes.trim(),
  })

  try {
    planService.update(plan.id, {
      lastCompletedAt: input.completedDate,
      nextDate,
    })
  } catch (error) {
    historyService.remove(record.id)
    throw error
  }

  return { record, nextDate }
}

/** Cuántos registros de historial se borrarían junto con el plan. */
export function countPlanHistory(planId: string): number {
  return historyService.list().filter((record) => record.planId === planId).length
}

/** Borra el historial del plan y luego el plan. */
export function deletePlanWithHistory(planId: string): void {
  historyService.replaceAll(
    historyService.list().filter((record) => record.planId !== planId),
  )
  planService.remove(planId)
}