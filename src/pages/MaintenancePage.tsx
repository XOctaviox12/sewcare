import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Plus, SearchX } from 'lucide-react'
import {
  Button,
  EmptyState,
  PageHeader,
  Select,
  StatusBadge,
  TextInput,
} from '../components'
import type { SelectOption } from '../components/Select'
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { PLAN_STATUSES, PRIORITIES } from '../constants/statuses'
import { machineService, planService } from '../services'
import {
  daysLabel,
  daysUntil,
  formatDate,
  getPlanStatus,
  includesText,
} from '../utils'
import styles from './MaintenancePage.module.css'

export function MaintenancePage() {
  const navigate = useNavigate()
  const [plans] = useState(() => planService.list())
  const [machines] = useState(() => machineService.list())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [machineId, setMachineId] = useState('')
  const [area, setArea] = useState('')

  const machineById = useMemo(
    () => new Map(machines.map((machine) => [machine.id, machine])),
    [machines],
  )

  const machineOptions: SelectOption[] = useMemo(
    () =>
      [...machines]
        .sort((a, b) => a.code.localeCompare(b.code, 'es'))
        .map((machine) => ({
          value: machine.id,
          label: `${machine.code} · ${machine.name}`,
        })),
    [machines],
  )

  const areas = useMemo(
    () =>
      [...new Set(machines.map((machine) => machine.area).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [machines],
  )

  const rows = useMemo(
    () =>
      plans
        .map((plan) => ({
          plan,
          machine: machineById.get(plan.machineId),
          status: getPlanStatus(plan),
          days: daysUntil(plan.nextDate),
        }))
        .filter(({ plan, machine, status: planStatus }) => {
          if (status && planStatus !== status) return false
          if (priority && plan.priority !== priority) return false
          if (machineId && plan.machineId !== machineId) return false
          if (area && machine?.area !== area) return false
          if (search.trim()) {
            const haystack = [machine?.code ?? '', machine?.name ?? '', plan.activity].join(' ')
            if (!includesText(haystack, search)) return false
          }
          return true
        })
        .sort((a, b) => a.plan.nextDate.localeCompare(b.plan.nextDate)),
    [plans, machineById, search, status, priority, machineId, area],
  )

  const hasFilters = Boolean(search.trim() || status || priority || machineId || area)

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setMachineId('')
    setArea('')
  }

  return (
    <>
      <PageHeader
        title="Mantenimiento"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Mantenimiento' }]}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => navigate(ROUTES.planNew())}>
            Programar mantenimiento
          </Button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={40} />}
          title="Aún no hay mantenimientos programados"
          description="Programa el primero para recibir avisos de próximos y vencidos."
          action={
            <Button onClick={() => navigate(ROUTES.planNew())}>Programar mantenimiento</Button>
          }
        />
      ) : (
        <>
          <div className={styles.toolbar}>
            <TextInput
              label="Buscar"
              type="search"
              placeholder="Máquina o actividad"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Estado"
              options={PLAN_STATUSES}
              placeholder="Todos"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
            <Select
              label="Prioridad"
              options={PRIORITIES}
              placeholder="Todas"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            />
            <Select
              label="Máquina"
              options={machineOptions}
              placeholder="Todas"
              value={machineId}
              onChange={(event) => setMachineId(event.target.value)}
            />
            <Select
              label="Área"
              options={areas}
              placeholder="Todas"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Mostrando {rows.length} de {plans.length} planes
            </span>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={<SearchX size={40} />}
              title="Sin resultados"
              description="Ningún plan coincide con la búsqueda o los filtros."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Planes de mantenimiento preventivo</caption>
                <thead>
                  <tr>
                    <th scope="col">Máquina</th>
                    <th scope="col">Actividad</th>
                    <th scope="col">Próxima fecha</th>
                    <th scope="col">Días restantes</th>
                    <th scope="col">Frecuencia</th>
                    <th scope="col">Prioridad</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ plan, machine, status: planStatus, days }) => (
                    <tr
                      key={plan.id}
                      className={planStatus === 'Vencido' ? styles.overdue : undefined}
                    >
                      <td>
                        {machine ? (
                          <Link to={ROUTES.machineDetail(machine.id)}>
                            {machine.code} · {machine.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <Link to={ROUTES.planDetail(plan.id)}>{plan.activity}</Link>
                      </td>
                      <td>{formatDate(plan.nextDate)}</td>
                      <td className={planStatus === 'Vencido' ? styles.overdueText : undefined}>
                        {daysLabel(days)}
                      </td>
                      <td>{plan.frequency}</td>
                      <td>{plan.priority}</td>
                      <td>
                        <StatusBadge status={planStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}