import { useMemo, useState } from 'react'
import {
  CircleAlert,
  Clock,
  Cog,
  Factory,
  Hammer,
  Percent,
  Timer,
  TriangleAlert,
  Wallet,
  Wrench,
} from 'lucide-react'
import {
  Button,
  DateInput,
  EmptyState,
  PageHeader,
  Select,
  StatCard,
} from '../components'
import { ExportMenu } from '../components/ExportMenu'
import { BarChartBasic } from '../components/charts/BarChartBasic'
import { ChartCard } from '../components/charts/ChartCard'
import { MACHINE_TYPES } from '../constants/machineTypes'
import { ROUTES } from '../constants/routes'
import { MACHINE_STATUSES } from '../constants/statuses'
import { useToast } from '../hooks/useToast'
import {
  historyService,
  machineService,
  planService,
  repairService,
  sparePartService,
} from '../services'
import { theme } from '../styles/themeTokens'
import {
  EMPTY_REPORT_FILTERS,
  EXPORT_OPTIONS,
  applyReportFilters,
  buildExport,
  buildReportStats,
  costByMachineChart,
  downloadCsv,
  formatCurrency,
  formatNumber,
  formatPercent,
  planStatusChart,
  plansByAreaChart,
  repairsByMonthChart,
} from '../utils'
import type { ExportSet, ReportFilters, ReportSource } from '../utils'
import styles from './ReportsPage.module.css'

const STATUS_COLORS: Record<string, string> = {
  Vencido: theme.chart.danger,
  Próximo: theme.chart.warning,
  Pendiente: theme.chart.pending,
  Completado: theme.chart.success,
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function formatMoneyAxis(value: number): string {
  return `$${value.toLocaleString('es-MX')}`
}

export function ReportsPage() {
  const { showToast } = useToast()
  const [source] = useState<ReportSource>(() => ({
    machines: machineService.list(),
    plans: planService.list(),
    history: historyService.list(),
    repairs: repairService.list(),
    spareParts: sparePartService.list(),
  }))
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_REPORT_FILTERS)

  const setFilter = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const areas = useMemo(() => uniqueSorted(source.machines.map((m) => m.area)), [source.machines])
  const lines = useMemo(
    () => uniqueSorted(source.machines.map((m) => m.productionLine)),
    [source.machines],
  )
  const responsibles = useMemo(
    () =>
      uniqueSorted([
        ...source.plans.map((plan) => plan.responsible),
        ...source.history.map((record) => record.responsible),
        ...source.repairs.map((repair) => repair.technician),
      ]),
    [source.plans, source.history, source.repairs],
  )

  const filtered = useMemo(() => applyReportFilters(source, filters), [source, filters])
  const stats = useMemo(
    () => buildReportStats(filtered, source.spareParts),
    [filtered, source.spareParts],
  )
  const charts = useMemo(
    () => ({
      status: planStatusChart(filtered.plans),
      byMonth: repairsByMonthChart(filtered.repairs),
      costs: costByMachineChart(filtered, source.spareParts),
      byArea: plansByAreaChart(filtered),
    }),
    [filtered, source.spareParts],
  )

  const rangeError =
    filters.from && filters.to && filters.to < filters.from
      ? 'La fecha final no puede ser anterior a la inicial'
      : undefined

  const hasFilters = Object.values(filters).some(Boolean)

  const noData =
    source.machines.length === 0 &&
    source.plans.length === 0 &&
    source.history.length === 0 &&
    source.repairs.length === 0

  const handleExport = (set: ExportSet) => {
    const result = buildExport(set, filtered, source.spareParts)
    if (result.rows === 0) {
      showToast('No hay datos para exportar con los filtros actuales', 'info')
      return
    }
    try {
      downloadCsv(result.filename, result.content)
      showToast(`Se descargó ${result.filename} (${plural(result.rows, 'fila', 'filas')})`)
    } catch {
      showToast('No se pudo generar el archivo CSV', 'error')
    }
  }

  const topFailures = stats.topFailureMachines
  const topAreas = stats.topPendingAreas

  return (
    <>
      <PageHeader
        title="Reportes"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Reportes' }]}
        actions={<ExportMenu options={EXPORT_OPTIONS} onSelect={handleExport} />}
      />

      {noData ? (
        <EmptyState
          icon={<Cog size={40} />}
          title="Aún no hay datos para reportar"
          description="Registra máquinas, mantenimientos y reparaciones, y aquí verás los indicadores y gráficas."
        />
      ) : (
        <>
          <p className={styles.hint}>
            El rango de fechas se aplica a la próxima fecha de los planes, la fecha realizada del
            historial y la fecha de reporte de las reparaciones. El responsable es el del plan, el
            del historial o el técnico de la reparación. Área, línea, tipo y estado se toman de la
            máquina.
          </p>

          <div className={styles.toolbar}>
            <DateInput
              label="Desde"
              value={filters.from}
              onChange={(value) => setFilter('from', value)}
            />
            <DateInput
              label="Hasta"
              value={filters.to}
              onChange={(value) => setFilter('to', value)}
              error={rangeError}
            />
            <Select
              label="Área"
              options={areas}
              placeholder="Todas"
              value={filters.area}
              onChange={(event) => setFilter('area', event.target.value)}
            />
            <Select
              label="Línea de producción"
              options={lines}
              placeholder="Todas"
              value={filters.line}
              onChange={(event) => setFilter('line', event.target.value)}
            />
            <Select
              label="Tipo de máquina"
              options={MACHINE_TYPES}
              placeholder="Todos"
              value={filters.type}
              onChange={(event) => setFilter('type', event.target.value)}
            />
            <Select
              label="Estado de la máquina"
              options={MACHINE_STATUSES}
              placeholder="Todos"
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
            />
            <Select
              label="Responsable"
              options={responsibles}
              placeholder="Todos"
              value={filters.responsible}
              onChange={(event) => setFilter('responsible', event.target.value)}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Datos incluidos: {plural(filtered.machines.length, 'máquina', 'máquinas')},{' '}
              {plural(filtered.plans.length, 'plan', 'planes')},{' '}
              {plural(filtered.history.length, 'registro de historial', 'registros de historial')}{' '}
              y {plural(filtered.repairs.length, 'reparación', 'reparaciones')}
            </span>
            {hasFilters && (
              <Button variant="secondary" onClick={() => setFilters(EMPTY_REPORT_FILTERS)}>
                Limpiar filtros
              </Button>
            )}
          </div>

          <section className={styles.section} aria-labelledby="report-indicators">
            <h2 id="report-indicators">Indicadores</h2>
            <div className={styles.stats}>
              <StatCard
                label="Total de máquinas"
                value={stats.totalMachines}
                icon={<Cog size={22} />}
              />
              <StatCard
                label="Equipos atendidos"
                value={stats.attendedMachines}
                icon={<Wrench size={22} />}
              />
              <StatCard
                label="Equipos pendientes"
                value={stats.pendingMachines}
                icon={<Clock size={22} />}
              />
              <StatCard
                label="Mantenimientos vencidos"
                value={stats.overduePlans}
                icon={<TriangleAlert size={22} />}
              />
              <StatCard
                label="Porcentaje de cumplimiento"
                value={
                  stats.compliancePercent === null
                    ? 'Sin datos'
                    : formatPercent(stats.compliancePercent)
                }
                icon={<Percent size={22} />}
              />
              <StatCard
                label="Reparaciones realizadas"
                value={stats.completedRepairs}
                icon={<Hammer size={22} />}
              />
              <StatCard
                label="Horas totales de paro"
                value={`${formatNumber(stats.downtimeHours)} h`}
                icon={<Timer size={22} />}
              />
              <StatCard
                label="Costo total de reparaciones"
                value={formatCurrency(stats.repairCost)}
                icon={<Wallet size={22} />}
              />
              <StatCard
                label={
                  topFailures.labels.length === 0
                    ? 'Máquina con mayor número de fallas'
                    : `Máquina con más fallas (${plural(topFailures.count, 'reparación', 'reparaciones')})`
                }
                value={topFailures.labels.length === 0 ? 'Sin datos' : topFailures.labels.join(', ')}
                icon={<CircleAlert size={22} />}
              />
              <StatCard
                label={
                  topAreas.labels.length === 0
                    ? 'Área con más mantenimientos pendientes'
                    : `Área con más mantenimientos pendientes (${topAreas.count})`
                }
                value={topAreas.labels.length === 0 ? 'Sin datos' : topAreas.labels.join(', ')}
                icon={<Factory size={22} />}
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="report-charts">
            <h2 id="report-charts">Gráficas</h2>
            <div className={styles.charts}>
              <ChartCard title="Mantenimientos por estado" data={charts.status} valueLabel="Planes">
                <BarChartBasic data={charts.status} valueLabel="Planes" colors={STATUS_COLORS} />
              </ChartCard>

              <ChartCard
                title="Reparaciones por mes"
                data={charts.byMonth}
                valueLabel="Reparaciones"
              >
                <BarChartBasic
                  data={charts.byMonth}
                  valueLabel="Reparaciones"
                  color={theme.chart.secondary}
                />
              </ChartCard>

              <ChartCard
                title="Costos de reparación por máquina"
                data={charts.costs}
                valueLabel="Costo total"
                formatValue={formatCurrency}
              >
                <BarChartBasic
                  data={charts.costs}
                  valueLabel="Costo total"
                  color={theme.chart.primary}
                  formatValue={formatCurrency}
                  formatAxis={formatMoneyAxis}
                />
              </ChartCard>

              <ChartCard title="Mantenimientos por área" data={charts.byArea} valueLabel="Planes">
                <BarChartBasic
                  data={charts.byArea}
                  valueLabel="Planes"
                  color={theme.chart.pending}
                />
              </ChartCard>
            </div>
          </section>
        </>
      )}
    </>
  )
}