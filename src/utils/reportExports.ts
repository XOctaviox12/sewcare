import type {
  Machine,
  MaintenanceHistory,
  MaintenancePlan,
  Repair,
  SparePart,
} from '../types'
import { partsTotal, repairTotal } from './costs'
import { csvFilename, toCsv } from './csv'
import type { CsvColumn } from './csv'
import { getPlanStatus } from './planStatus'
import type { FilteredReport } from './reports'

export type ExportSet = 'maquinas' | 'mantenimientos' | 'historial' | 'reparaciones'

export const EXPORT_OPTIONS: { value: ExportSet; label: string }[] = [
  { value: 'maquinas', label: 'Máquinas' },
  { value: 'mantenimientos', label: 'Mantenimientos' },
  { value: 'historial', label: 'Historial' },
  { value: 'reparaciones', label: 'Reparaciones' },
]

export interface ExportResult {
  filename: string
  content: string
  rows: number
}

/** Genera el CSV del conjunto elegido con los datos YA filtrados. */
export function buildExport(
  set: ExportSet,
  report: FilteredReport,
  spareParts: SparePart[],
): ExportResult {
  const machineById = new Map(report.machines.map((machine) => [machine.id, machine]))
  const code = (machineId: string) => machineById.get(machineId)?.code ?? ''
  const name = (machineId: string) => machineById.get(machineId)?.name ?? ''

  if (set === 'maquinas') {
    const columns: CsvColumn<Machine>[] = [
      { header: 'Código', value: (m) => m.code },
      { header: 'Nombre', value: (m) => m.name },
      { header: 'Marca', value: (m) => m.brand },
      { header: 'Modelo', value: (m) => m.model },
      { header: 'Número de serie', value: (m) => m.serialNumber },
      { header: 'Tipo', value: (m) => m.type },
      { header: 'Área', value: (m) => m.area },
      { header: 'Línea de producción', value: (m) => m.productionLine },
      { header: 'Fecha de adquisición', value: (m) => m.acquisitionDate },
      { header: 'Estado', value: (m) => m.status },
      { header: 'Horas de uso', value: (m) => m.usageHours },
      { header: 'Responsable', value: (m) => m.responsible },
      { header: 'Observaciones', value: (m) => m.notes },
    ]
    return {
      filename: csvFilename('maquinas'),
      content: toCsv(report.machines, columns),
      rows: report.machines.length,
    }
  }

  if (set === 'mantenimientos') {
    const columns: CsvColumn<MaintenancePlan>[] = [
      { header: 'Código de máquina', value: (p) => code(p.machineId) },
      { header: 'Máquina', value: (p) => name(p.machineId) },
      { header: 'Actividad', value: (p) => p.activity },
      { header: 'Descripción', value: (p) => p.description },
      { header: 'Fecha inicial', value: (p) => p.startDate },
      { header: 'Frecuencia', value: (p) => p.frequency },
      { header: 'Cada (días)', value: (p) => p.customIntervalDays ?? '' },
      { header: 'Próxima fecha', value: (p) => p.nextDate },
      { header: 'Último completado', value: (p) => p.lastCompletedAt },
      { header: 'Estado', value: (p) => getPlanStatus(p) },
      { header: 'Prioridad', value: (p) => p.priority },
      { header: 'Responsable', value: (p) => p.responsible },
      { header: 'Tiempo estimado (min)', value: (p) => p.estimatedMinutes ?? '' },
      { header: 'Observaciones', value: (p) => p.notes },
    ]
    return {
      filename: csvFilename('mantenimientos'),
      content: toCsv(report.plans, columns),
      rows: report.plans.length,
    }
  }

  if (set === 'historial') {
    const columns: CsvColumn<MaintenanceHistory>[] = [
      { header: 'Código de máquina', value: (h) => code(h.machineId) },
      { header: 'Máquina', value: (h) => name(h.machineId) },
      { header: 'Actividad', value: (h) => h.activity },
      { header: 'Fecha programada', value: (h) => h.scheduledDate },
      { header: 'Fecha realizada', value: (h) => h.completedDate },
      { header: 'Responsable', value: (h) => h.responsible },
      { header: 'Estado', value: (h) => h.punctuality },
      { header: 'Actividades realizadas', value: (h) => h.tasksDone.join('; ') },
      { header: 'Observaciones', value: (h) => h.notes },
    ]
    return {
      filename: csvFilename('historial'),
      content: toCsv(report.history, columns),
      rows: report.history.length,
    }
  }

  const partsOf = (repair: Repair) =>
    spareParts.filter((part) => part.repairId === repair.id)
  const columns: CsvColumn<Repair>[] = [
    { header: 'Código de máquina', value: (r) => code(r.machineId) },
    { header: 'Máquina', value: (r) => name(r.machineId) },
    { header: 'Fecha de reporte', value: (r) => r.reportDate },
    { header: 'Fecha de reparación', value: (r) => r.repairDate },
    { header: 'Falla detectada', value: (r) => r.failure },
    { header: 'Diagnóstico', value: (r) => r.diagnosis },
    { header: 'Reparación realizada', value: (r) => r.workDone },
    { header: 'Técnico', value: (r) => r.technician },
    { header: 'Horas de paro', value: (r) => r.downtimeHours },
    {
      header: 'Refacciones',
      value: (r) => partsOf(r).map((part) => `${part.name} x${part.quantity}`).join('; '),
    },
    { header: 'Total de refacciones', value: (r) => partsTotal(partsOf(r)) },
    { header: 'Mano de obra', value: (r) => r.laborCost },
    { header: 'Total de la reparación', value: (r) => repairTotal(r, spareParts) },
    { header: 'Estado', value: (r) => r.status },
    { header: 'Observaciones', value: (r) => r.notes },
  ]
  return {
    filename: csvFilename('reparaciones'),
    content: toCsv(report.repairs, columns),
    rows: report.repairs.length,
  }
}