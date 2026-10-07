import type {
  Machine,
  MaintenanceHistory,
  MaintenancePlan,
  Repair,
  SparePart,
} from '../types'
import { repairTotal } from './costs'
import { daysUntil } from './dates'
import { getPlanStatus } from './planStatus'

export interface DashboardStats {
  totalMachines: number
  operativeMachines: number
  maintenanceMachines: number
  outOfServiceMachines: number
  scheduledPlans: number
  upcomingPlans: number
  overduePlans: number
  completedMaintenances: number
  repairsCount: number
  repairsCost: number
}

interface DashboardSources {
  machines: Machine[]
  plans: MaintenancePlan[]
  history: MaintenanceHistory[]
  repairs: Repair[]
  spareParts: SparePart[]
}

/** Los 10 indicadores del panel. Todos se calculan, nada es fijo. */
export function buildDashboardStats({
  machines,
  plans,
  history,
  repairs,
  spareParts,
}: DashboardSources): DashboardStats {
  const statuses = plans.map(getPlanStatus)
  return {
    totalMachines: machines.length,
    operativeMachines: machines.filter((m) => m.status === 'Operativa').length,
    maintenanceMachines: machines.filter((m) => m.status === 'En mantenimiento').length,
    outOfServiceMachines: machines.filter((m) => m.status === 'Fuera de servicio').length,
    scheduledPlans: plans.length,
    upcomingPlans: statuses.filter((status) => status === 'Próximo').length,
    overduePlans: statuses.filter((status) => status === 'Vencido').length,
    completedMaintenances: history.length,
    repairsCount: repairs.length,
    repairsCost: repairs.reduce((sum, repair) => sum + repairTotal(repair, spareParts), 0),
  }
}

export interface UpcomingPlan {
  plan: MaintenancePlan
  /** 0 = hoy. */
  days: number
}

/** Las actividades más cercanas: fecha de hoy o posterior. Los vencidos no entran. */
export function getUpcomingPlans(plans: MaintenancePlan[], limit = 5): UpcomingPlan[] {
  return plans
    .map((plan) => ({ plan, days: daysUntil(plan.nextDate) }))
    .filter((item): item is UpcomingPlan => item.days !== null && item.days >= 0)
    .sort((a, b) => a.plan.nextDate.localeCompare(b.plan.nextDate))
    .slice(0, limit)
}