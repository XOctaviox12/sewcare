import { FREQUENCIES } from '../constants/frequencies'
import { MACHINE_TYPES } from '../constants/machineTypes'
import {
  MACHINE_STATUSES,
  PRIORITIES,
  PUNCTUALITY_OPTIONS,
  REPAIR_STATUSES,
} from '../constants/statuses'
import type {
  Machine,
  MaintenanceHistory,
  MaintenancePlan,
  Repair,
  Settings,
  SparePart,
} from '../types'
import { isValidISODate, toISODate, today } from './dates'

export const BACKUP_APP = 'SewCare'
export const BACKUP_SCHEMA_VERSION = 1
/** Tope de tamaño del archivo a importar. */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export interface BackupData {
  machines: Machine[]
  maintenancePlans: MaintenancePlan[]
  maintenanceHistory: MaintenanceHistory[]
  repairs: Repair[]
  spareParts: SparePart[]
  settings: Settings
}

export interface BackupFile {
  app: string
  schemaVersion: number
  exportedAt: string
  data: BackupData
}

export type BackupValidation =
  | { ok: true; backup: BackupFile }
  | { ok: false; errors: string[] }

/** "sewcare-respaldo-2026-10-07.json" */
export function backupFilename(): string {
  return `sewcare-respaldo-${toISODate(today())}.json`
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2)
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* ---------- Reglas de validación (sin "any") ---------- */

type Rule = (value: unknown) => boolean
type Schema = Record<string, Rule>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNum = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const text: Rule = (value) => typeof value === 'string'
const filled: Rule = (value) => typeof value === 'string' && value.trim().length > 0
const bool: Rule = (value) => typeof value === 'boolean'
const oneOf =
  (list: readonly string[]): Rule =>
  (value) =>
    typeof value === 'string' && list.includes(value)
const reqDate: Rule = (value) => typeof value === 'string' && isValidISODate(value)
const optDate: Rule = (value) => value === '' || reqDate(value)
const min0: Rule = (value) => isNum(value) && value >= 0
const gt0: Rule = (value) => isNum(value) && value > 0
const optGt0: Rule = (value) => value === undefined || gt0(value)
const optPositiveInt: Rule = (value) =>
  value === undefined || (isNum(value) && Number.isInteger(value) && value > 0)
const textList: Rule = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const BASE: Schema = { id: filled, createdAt: text, updatedAt: text }

const MACHINE_SCHEMA: Schema = {
  ...BASE,
  code: filled,
  name: filled,
  brand: text,
  model: text,
  serialNumber: filled,
  type: oneOf(MACHINE_TYPES),
  area: text,
  productionLine: text,
  acquisitionDate: optDate,
  status: oneOf(MACHINE_STATUSES),
  usageHours: min0,
  responsible: text,
  notes: text,
}

const PLAN_SCHEMA: Schema = {
  ...BASE,
  machineId: filled,
  activity: filled,
  description: text,
  startDate: reqDate,
  frequency: oneOf(FREQUENCIES),
  customIntervalDays: optPositiveInt,
  nextDate: reqDate,
  lastCompletedAt: optDate,
  responsible: text,
  priority: oneOf(PRIORITIES),
  estimatedMinutes: optGt0,
  notes: text,
}

const HISTORY_SCHEMA: Schema = {
  ...BASE,
  planId: filled,
  machineId: filled,
  activity: filled,
  scheduledDate: reqDate,
  completedDate: reqDate,
  responsible: text,
  punctuality: oneOf(PUNCTUALITY_OPTIONS),
  tasksDone: textList,
  notes: text,
}

const REPAIR_SCHEMA: Schema = {
  ...BASE,
  machineId: filled,
  reportDate: reqDate,
  repairDate: optDate,
  failure: text,
  diagnosis: text,
  workDone: text,
  technician: text,
  downtimeHours: min0,
  laborCost: min0,
  status: oneOf(REPAIR_STATUSES),
  notes: text,
}

const SPARE_PART_SCHEMA: Schema = {
  ...BASE,
  repairId: filled,
  name: filled,
  code: text,
  quantity: gt0,
  unitCost: min0,
  supplier: text,
}

const SETTINGS_SCHEMA: Schema = {
  ...BASE,
  highRepairCost: min0,
  demoLoaded: bool,
  schemaVersion: gt0,
}

const MAX_REPORTED_ERRORS = 8

function checkCollection(
  label: string,
  value: unknown,
  schema: Schema,
  problems: string[],
): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    problems.push(`${label}: debe ser una lista`)
    return []
  }

  const ids = new Set<string>()
  const valid: Record<string, unknown>[] = []

  value.forEach((item: unknown, index) => {
    const where = `${label}, registro ${index + 1}`
    if (!isRecord(item)) {
      problems.push(`${where}: no es un objeto válido`)
      return
    }

    let ok = true
    Object.entries(schema).forEach(([field, rule]) => {
      if (!rule(item[field])) {
        problems.push(`${where}: el campo "${field}" no es válido`)
        ok = false
      }
    })

    if (typeof item.id === 'string') {
      if (ids.has(item.id)) {
        problems.push(`${where}: el id está repetido`)
        ok = false
      }
      ids.add(item.id)
    }

    if (ok) valid.push(item)
  })

  return valid
}

function idsOf(records: Record<string, unknown>[]): Set<string> {
  return new Set(records.map((record) => String(record.id)))
}

function checkReferences(
  label: string,
  records: Record<string, unknown>[],
  field: string,
  targets: Set<string>,
  targetLabel: string,
  problems: string[],
): void {
  records.forEach((record, index) => {
    if (!targets.has(String(record[field]))) {
      problems.push(`${label}, registro ${index + 1}: ${targetLabel} no existe en el archivo`)
    }
  })
}

function capProblems(problems: string[]): string[] {
  if (problems.length <= MAX_REPORTED_ERRORS) return problems
  const rest = problems.length - MAX_REPORTED_ERRORS
  return [
    ...problems.slice(0, MAX_REPORTED_ERRORS),
    `… y ${rest} ${rest === 1 ? 'problema más' : 'problemas más'}`,
  ]
}

/**
 * Valida el texto de un respaldo ANTES de tocar ningún dato:
 * JSON válido, app, versión, campos y tipos, ids únicos y referencias.
 */
export function parseBackup(content: string): BackupValidation {
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return { ok: false, errors: ['El archivo no es un JSON válido.'] }
  }

  if (!isRecord(parsed)) {
    return { ok: false, errors: ['El archivo no tiene el formato de un respaldo de SewCare.'] }
  }
  if (parsed.app !== BACKUP_APP) {
    return { ok: false, errors: ['El archivo no es un respaldo de SewCare.'] }
  }

  const version = parsed.schemaVersion
  if (!isNum(version) || !Number.isInteger(version) || version < 1) {
    return { ok: false, errors: ['El respaldo no indica una versión válida.'] }
  }
  if (version > BACKUP_SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        `El respaldo es de una versión más nueva (${version}). Esta app soporta hasta la versión ${BACKUP_SCHEMA_VERSION}.`,
      ],
    }
  }

  const data = parsed.data
  if (!isRecord(data)) {
    return { ok: false, errors: ['El respaldo no contiene la sección "data".'] }
  }

  const problems: string[] = []
  const machines = checkCollection('Máquinas', data.machines, MACHINE_SCHEMA, problems)
  const plans = checkCollection('Planes', data.maintenancePlans, PLAN_SCHEMA, problems)
  const history = checkCollection('Historial', data.maintenanceHistory, HISTORY_SCHEMA, problems)
  const repairs = checkCollection('Reparaciones', data.repairs, REPAIR_SCHEMA, problems)
  const parts = checkCollection('Refacciones', data.spareParts, SPARE_PART_SCHEMA, problems)

  let settings: Record<string, unknown> | null = null
  if (!isRecord(data.settings)) {
    problems.push('Configuración: debe ser un objeto')
  } else {
    const rules = Object.entries(SETTINGS_SCHEMA)
    const invalid = rules.filter(([field, rule]) => !rule((data.settings as Record<string, unknown>)[field]))
    invalid.forEach(([field]) => problems.push(`Configuración: el campo "${field}" no es válido`))
    if (invalid.length === 0) settings = data.settings
  }

  // Referencias: cada registro debe apuntar a algo que exista en el archivo.
  const machineIds = idsOf(machines)
  const planIds = idsOf(plans)
  const repairIds = idsOf(repairs)
  checkReferences('Planes', plans, 'machineId', machineIds, 'la máquina', problems)
  checkReferences('Historial', history, 'machineId', machineIds, 'la máquina', problems)
  checkReferences('Historial', history, 'planId', planIds, 'el plan', problems)
  checkReferences('Reparaciones', repairs, 'machineId', machineIds, 'la máquina', problems)
  checkReferences('Refacciones', parts, 'repairId', repairIds, 'la reparación', problems)

  if (problems.length > 0 || !settings) {
    return { ok: false, errors: capProblems(problems) }
  }

  // Todo validado: ahora sí se puede tratar como datos de SewCare.
  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      schemaVersion: version,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      data: {
        machines: machines as unknown as Machine[],
        maintenancePlans: plans as unknown as MaintenancePlan[],
        maintenanceHistory: history as unknown as MaintenanceHistory[],
        repairs: repairs as unknown as Repair[],
        spareParts: parts as unknown as SparePart[],
        settings: settings as unknown as Settings,
      },
    },
  }
}