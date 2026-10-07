import type { MaintenancePlan, PlanStatus } from '../types'
import { daysUntil } from './dates'

/**
 * Estado del plan. Se CALCULA siempre, nunca se guarda.
 *   días < 0                         -> Vencido
 *   días <= 7 (incluye hoy)          -> Próximo
 *   días > 7 y ya se completó antes  -> Completado
 *   días > 7 y nunca completado      -> Pendiente
 */
export function getPlanStatus(plan: MaintenancePlan): PlanStatus {
  const days = daysUntil(plan.nextDate)
  if (days === null) return 'Pendiente'
  if (days < 0) return 'Vencido'
  if (days <= 7) return 'Próximo'
  return plan.lastCompletedAt ? 'Completado' : 'Pendiente'
}