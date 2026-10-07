import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hammer, Plus, SearchX } from 'lucide-react'
import {
  Button,
  DateInput,
  EmptyState,
  PageHeader,
  Select,
  StatusBadge,
  TextInput,
} from '../components'
import type { SelectOption } from '../components/Select'
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { REPAIR_STATUSES } from '../constants/statuses'
import { machineService, repairService, sparePartService } from '../services'
import { formatCurrency, formatDate, formatNumber, includesText, repairTotal } from '../utils'
import styles from './RepairsPage.module.css'

export function RepairsPage() {
  const navigate = useNavigate()
  const [repairs] = useState(() => repairService.list())
  const [machines] = useState(() => machineService.list())
  const [parts] = useState(() => sparePartService.list())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [machineId, setMachineId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

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

  const rows = useMemo(
    () =>
      repairs
        .map((repair) => ({
          repair,
          machine: machineById.get(repair.machineId),
          total: repairTotal(repair, parts),
        }))
        .filter(({ repair, machine }) => {
          if (status && repair.status !== status) return false
          if (machineId && repair.machineId !== machineId) return false
          // El rango se aplica a la fecha de reporte.
          if (from && repair.reportDate < from) return false
          if (to && repair.reportDate > to) return false
          if (search.trim()) {
            const haystack = [machine?.code ?? '', machine?.name ?? '', repair.failure].join(' ')
            if (!includesText(haystack, search)) return false
          }
          return true
        })
        .sort(
          (a, b) =>
            b.repair.reportDate.localeCompare(a.repair.reportDate) ||
            b.repair.createdAt.localeCompare(a.repair.createdAt),
        ),
    [repairs, machineById, parts, search, status, machineId, from, to],
  )

  const rangeError =
    from && to && to < from ? 'La fecha final no puede ser anterior a la inicial' : undefined

  const hasFilters = Boolean(search.trim() || status || machineId || from || to)

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setMachineId('')
    setFrom('')
    setTo('')
  }

  return (
    <>
      <PageHeader
        title="Reparaciones"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Reparaciones' }]}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => navigate(ROUTES.repairNew())}>
            Reportar reparación
          </Button>
        }
      />

      {repairs.length === 0 ? (
        <EmptyState
          icon={<Hammer size={40} />}
          title="Aún no hay reparaciones registradas"
          description="Cuando una máquina falle, repórtala aquí para llevar su costo y su tiempo de paro."
          action={
            <Button onClick={() => navigate(ROUTES.repairNew())}>Reportar reparación</Button>
          }
        />
      ) : (
        <>
          <div className={styles.toolbar}>
            <TextInput
              label="Buscar"
              type="search"
              placeholder="Máquina o falla"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Estado"
              options={REPAIR_STATUSES}
              placeholder="Todos"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
            <Select
              label="Máquina"
              options={machineOptions}
              placeholder="Todas"
              value={machineId}
              onChange={(event) => setMachineId(event.target.value)}
            />
            <DateInput label="Reportada desde" value={from} onChange={setFrom} />
            <DateInput
              label="Reportada hasta"
              value={to}
              onChange={setTo}
              error={rangeError}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Mostrando {rows.length} de {repairs.length} reparaciones
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
              description="Ninguna reparación coincide con la búsqueda o los filtros."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Lista de reparaciones</caption>
                <thead>
                  <tr>
                    <th scope="col">Máquina</th>
                    <th scope="col">Fecha de reporte</th>
                    <th scope="col">Falla</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Horas de paro</th>
                    <th scope="col">Costo total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ repair, machine, total }) => (
                    <tr key={repair.id}>
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
                        <Link to={ROUTES.repairDetail(repair.id)}>
                          {formatDate(repair.reportDate)}
                        </Link>
                      </td>
                      <td>
                        <span className={styles.failure} title={repair.failure}>
                          {repair.failure}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={repair.status} />
                      </td>
                      <td className={styles.number}>{formatNumber(repair.downtimeHours)} h</td>
                      <td className={styles.number}>{formatCurrency(total)}</td>
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