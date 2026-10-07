import { ROUTES } from '../constants/routes'
import type {
  AlertKind,
  AppAlert,
  Machine,
  MaintenancePlan,
  Repair,
  SparePart,
} from '../types'
import { repairTotal } from './costs'
import { daysUntil } from './dates'
import { formatCurrency } from './format'
import { daysLabel } from './planLabels'
import { getPlanStatus } from './planStatus'

export interface AlertSources {
  machines: Machine[]
  plans: MaintenancePlan[]
  repairs: Repair[]
  spareParts: SparePart[]
  /** Una reparación con total mayor a este valor genera alerta crítica. */
  highRepairCost: number
}

/** Orden de los grupos: primero los críticos. */
export const ALERT_KIND_ORDER: AlertKind[] = [
  'MantenimientoVencido',
  'MaquinaFueraDeServicio',
  'ReparacionAltoCosto',
  'MantenimientoProximo',
]

export const ALERT_KIND_LABELS: Record<AlertKind, string> = {
  MantenimientoVencido: 'Mantenimientos vencidos',
  MaquinaFueraDeServicio: 'Máquinas fuera de servicio',
  ReparacionAltoCosto: 'Reparaciones de costo alto',
  MantenimientoProximo: 'Mantenimientos próximos',
}

/** Calcula todas las alertas a partir de los datos. Nunca se guardan. */
export function buildAlerts({
  machines,
  plans,
  repairs,
  spareParts,
  highRepairCost,
}: AlertSources): AppAlert[] {
  const machineById = new Map(machines.map((machine) => [machine.id, machine]))
  const machineLabel = (id: string): string => {
    const machine = machineById.get(id)
    return machine ? `${machine.code} · ${machine.name}` : 'Máquina eliminada'
  }

  const planItems = plans.map((plan) => ({
    plan,
    days: daysUntil(plan.nextDate) ?? 0,
    status: getPlanStatus(plan),
  }))

  const overdue: AppAlert[] = planItems
    .filter((item) => item.status === 'Vencido')
    .sort((a, b) => a.days - b.days)
    .map(({ plan, days }) => ({
      id: `vencido-${plan.id}`,
      kind: 'MantenimientoVencido',
      critical: true,
      title: plan.activity,
      message: `${machineLabel(plan.machineId)}: ${daysLabel(days)}`,
      link: ROUTES.planDetail(plan.id),
    }))

  const outOfService: AppAlert[] = machines
    .filter((machine) => machine.status === 'Fuera de servicio')
    .sort((a, b) => a.code.localeCompare(b.code, 'es'))
    .map((machine) => ({
      id: `fuera-${machine.id}`,
      kind: 'MaquinaFueraDeServicio',
      critical: true,
      title: `${machine.code} · ${machine.name}`,
      message: 'La máquina está fuera de servicio.',
      link: ROUTES.machineDetail(machine.id),
    }))

  const highCost: AppAlert[] = repairs
    .map((repair) => ({ repair, total: repairTotal(repair, spareParts) }))
    .filter((item) => item.total > highRepairCost)
    .sort((a, b) => b.total - a.total)
    .map(({ repair, total }) => ({
      id: `costo-${repair.id}`,
      kind: 'ReparacionAltoCosto',
      critical: true,
      title: repair.failure,
      message: `${machineLabel(repair.machineId)}: ${formatCurrency(total)} (límite ${formatCurrency(highRepairCost)})`,
      link: ROUTES.repairDetail(repair.id),
    }))

  const upcoming: AppAlert[] = planItems
    .filter((item) => item.status === 'Próximo')
    .sort((a, b) => a.days - b.days)
    .map(({ plan, days }) => ({
      id: `proximo-${plan.id}`,
      kind: 'MantenimientoProximo',
      critical: false,
      title: plan.activity,
      message: `${machineLabel(plan.machineId)}: ${daysLabel(days)}`,
      link: ROUTES.planDetail(plan.id),
    }))

  return [...overdue, ...outOfService, ...highCost, ...upcoming]
}