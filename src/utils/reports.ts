import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  Machine,
  MaintenanceHistory,
  MaintenancePlan,
  PlanStatus,
  Repair,
  SparePart,
} from '../types'
import { repairTotal } from './costs'
import { parseISODate } from './dates'
import { getPlanStatus } from './planStatus'

/* ---------- Filtros ---------- */

export interface ReportFilters {
  from: string
  to: string
  area: string
  line: string
  type: string
  status: string
  responsible: string
}

export const EMPTY_REPORT_FILTERS: ReportFilters = {
  from: '',
  to: '',
  area: '',
  line: '',
  type: '',
  status: '',
  responsible: '',
}

export interface ReportSource {
  machines: Machine[]
  plans: MaintenancePlan[]
  history: MaintenanceHistory[]
  repairs: Repair[]
  spareParts: SparePart[]
}

export interface FilteredReport {
  machines: Machine[]
  plans: MaintenancePlan[]
  history: MaintenanceHistory[]
  repairs: Repair[]
}

function inRange(date: string, from: string, to: string): boolean {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

/**
 * Área, línea, tipo y estado se toman de la máquina.
 * Responsable: el del plan, el del historial o el técnico de la reparación.
 * Rango de fechas: próxima fecha (planes), fecha realizada (historial)
 * y fecha de reporte (reparaciones).
 */
export function applyReportFilters(
  source: ReportSource,
  filters: ReportFilters,
): FilteredReport {
  const machines = source.machines.filter(
    (machine) =>
      (!filters.area || machine.area === filters.area) &&
      (!filters.line || machine.productionLine === filters.line) &&
      (!filters.type || machine.type === filters.type) &&
      (!filters.status || machine.status === filters.status),
  )
  const ids = new Set(machines.map((machine) => machine.id))
  const byResponsible = (value: string) =>
    !filters.responsible || value === filters.responsible

  return {
    machines,
    plans: source.plans.filter(
      (plan) =>
        ids.has(plan.machineId) &&
        byResponsible(plan.responsible) &&
        inRange(plan.nextDate, filters.from, filters.to),
    ),
    history: source.history.filter(
      (record) =>
        ids.has(record.machineId) &&
        byResponsible(record.responsible) &&
        inRange(record.completedDate, filters.from, filters.to),
    ),
    repairs: source.repairs.filter(
      (repair) =>
        ids.has(repair.machineId) &&
        byResponsible(repair.technician) &&
        inRange(repair.reportDate, filters.from, filters.to),
    ),
  }
}

/* ---------- Indicadores ---------- */

export interface TopResult {
  labels: string[]
  count: number
}

export interface ReportStats {
  totalMachines: number
  attendedMachines: number
  pendingMachines: number
  overduePlans: number
  /** null = "Sin datos" (divisor 0). */
  compliancePercent: number | null
  completedRepairs: number
  downtimeHours: number
  repairCost: number
  topFailureMachines: TopResult
  topPendingAreas: TopResult
}

const PENDING_STATUSES: PlanStatus[] = ['Pendiente', 'Próximo', 'Vencido']

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1)
}

/** Los que tengan el máximo (si hay empate, todos). */
function topLabels(counts: Map<string, number>): TopResult {
  let max = 0
  counts.forEach((count) => {
    if (count > max) max = count
  })
  if (max === 0) return { labels: [], count: 0 }
  const labels = [...counts.entries()]
    .filter(([, count]) => count === max)
    .map(([label]) => label)
    .sort((a, b) => a.localeCompare(b, 'es'))
  return { labels, count: max }
}

export function buildReportStats(
  report: FilteredReport,
  spareParts: SparePart[],
): ReportStats {
  const machineById = new Map(report.machines.map((machine) => [machine.id, machine]))
  const plans = report.plans.map((plan) => ({ plan, status: getPlanStatus(plan) }))

  const overduePlans = plans.filter((item) => item.status === 'Vencido').length

  // Equipos atendidos: mantenimiento completado o reparación finalizada.
  const attendedIds = new Set<string>()
  report.history.forEach((record) => attendedIds.add(record.machineId))
  report.repairs
    .filter((repair) => repair.status === 'Finalizada')
    .forEach((repair) => attendedIds.add(repair.machineId))

  // Equipos pendientes: plan Pendiente/Próximo/Vencido o reparación abierta.
  const pendingIds = new Set<string>()
  plans
    .filter((item) => PENDING_STATUSES.includes(item.status))
    .forEach((item) => pendingIds.add(item.plan.machineId))
  report.repairs
    .filter((repair) => repair.status === 'Reportada' || repair.status === 'En proceso')
    .forEach((repair) => pendingIds.add(repair.machineId))

  // Cumplimiento = a tiempo / (completados + vencidos)
  const onTime = report.history.filter((record) => record.punctuality === 'A tiempo').length
  const denominator = report.history.length + overduePlans
  const compliancePercent = denominator === 0 ? null : (onTime / denominator) * 100

  // Máquina con más fallas
  const failureCounts = new Map<string, number>()
  report.repairs.forEach((repair) => {
    const machine = machineById.get(repair.machineId)
    if (machine) increment(failureCounts, machine.code)
  })

  // Área con más mantenimientos pendientes
  const areaCounts = new Map<string, number>()
  plans
    .filter((item) => PENDING_STATUSES.includes(item.status))
    .forEach((item) => {
      const machine = machineById.get(item.plan.machineId)
      if (machine?.area) increment(areaCounts, machine.area)
    })

  return {
    totalMachines: report.machines.length,
    attendedMachines: report.machines.filter((m) => attendedIds.has(m.id)).length,
    pendingMachines: report.machines.filter((m) => pendingIds.has(m.id)).length,
    overduePlans,
    compliancePercent,
    completedRepairs: report.repairs.filter((r) => r.status === 'Finalizada').length,
    downtimeHours: report.repairs.reduce((sum, repair) => sum + repair.downtimeHours, 0),
    repairCost: report.repairs.reduce(
      (sum, repair) => sum + repairTotal(repair, spareParts),
      0,
    ),
    topFailureMachines: topLabels(failureCounts),
    topPendingAreas: topLabels(areaCounts),
  }
}

/* ---------- Datos de las 4 gráficas ---------- */

export interface ChartPoint {
  name: string
  value: number
}

const STATUS_ORDER: PlanStatus[] = ['Vencido', 'Próximo', 'Pendiente', 'Completado']

/** 1. Mantenimientos por estado (solo estados con al menos un plan). */
export function planStatusChart(plans: MaintenancePlan[]): ChartPoint[] {
  const counts = new Map<PlanStatus, number>()
  plans.forEach((plan) => {
    const status = getPlanStatus(plan)
    counts.set(status, (counts.get(status) ?? 0) + 1)
  })
  return STATUS_ORDER.map((status) => ({ name: status, value: counts.get(status) ?? 0 })).filter(
    (point) => point.value > 0,
  )
}

/** 2. Reparaciones por mes (según la fecha de reporte). */
export function repairsByMonthChart(repairs: Repair[]): ChartPoint[] {
  const months = new Map<string, ChartPoint>()
  repairs.forEach((repair) => {
    const date = parseISODate(repair.reportDate)
    if (!date) return
    const key = format(date, 'yyyy-MM')
    const current = months.get(key)
    if (current) {
      current.value += 1
    } else {
      months.set(key, { name: format(date, 'MMM yyyy', { locale: es }), value: 1 })
    }
  })
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, point]) => point)
}

/** 3. Costo de reparaciones por máquina (solo máquinas con costo). */
export function costByMachineChart(
  report: FilteredReport,
  spareParts: SparePart[],
): ChartPoint[] {
  const machineById = new Map(report.machines.map((machine) => [machine.id, machine]))
  const totals = new Map<string, number>()
  report.repairs.forEach((repair) => {
    const machine = machineById.get(repair.machineId)
    if (!machine) return
    totals.set(machine.code, (totals.get(machine.code) ?? 0) + repairTotal(repair, spareParts))
  })
  return [...totals.entries()]
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

/** 4. Mantenimientos programados por área. */
export function plansByAreaChart(report: FilteredReport): ChartPoint[] {
  const machineById = new Map(report.machines.map((machine) => [machine.id, machine]))
  const counts = new Map<string, number>()
  report.plans.forEach((plan) => {
    const area = machineById.get(plan.machineId)?.area
    if (area) increment(counts, area)
  })
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}