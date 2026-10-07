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
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { REPAIR_STATUSES } from '../constants/statuses'
import { machineService, repairService, sparePartService } from '../services'
import type { Machine, Repair, SparePart } from '../types'
import { formatCurrency, formatDate, formatNumber, includesText, repairTotal } from '../utils'
import styles from './RepairsPage.module.css'

export function RepairsPage() {
  const navigate = useNavigate()
  const [repairs] = useState<Repair[]>(() => repairService.list())
  const [machines] = useState<Machine[]>(() => machineService.list())
  const [parts] = useState<SparePart[]>(() => sparePartService.list())

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [machineId, setMachineId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const machineById = useMemo(
    () => new Map(machines.map((machine) => [machine.id, machine])),
    [machines],
  )

  const machineOptions = useMemo(
    () =>
      [...machines]
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map((machine) => ({
          value: machine.id,
          label: `${machine.code} - ${machine.name}`,
        })),
    [machines],
  )

  const rangeError =
    dateFrom && dateTo && dateFrom > dateTo
      ? 'La fecha "desde" no puede ser posterior a la fecha "hasta"'
      : undefined

  const filtered = useMemo(() => {
    const result = repairs.filter((repair) => {
      if (status && repair.status !== status) return false
      if (machineId && repair.machineId !== machineId) return false
      if (!rangeError) {
        if (dateFrom && repair.reportDate < dateFrom) return false
        if (dateTo && repair.reportDate > dateTo) return false
      }
      if (search.trim()) {
        const machine = machineById.get(repair.machineId)
        const haystack = [
          machine?.code ?? '',
          machine?.name ?? '',
          repair.failure,
          repair.diagnosis,
          repair.technician,
        ].join(' ')
        if (!includesText(haystack, search)) return false
      }
      return true
    })
    // Más reciente primero.
    return result.sort((a, b) => b.reportDate.localeCompare(a.reportDate))
  }, [repairs, machineById, search, status, machineId, dateFrom, dateTo, rangeError])

  const hasFilters = Boolean(search.trim() || status || machineId || dateFrom || dateTo)

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setMachineId('')
    setDateFrom('')
    setDateTo('')
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
          title="Aún no hay reparaciones"
          description="Cuando una máquina falle, repórtalo aquí para llevar el control de refacciones y costos."
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
              placeholder="Máquina, falla, diagnóstico o técnico"
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
            <DateInput
              id="repairs-date-from"
              label="Reportada desde"
              value={dateFrom}
              onChange={setDateFrom}
            />
            <DateInput
              id="repairs-date-to"
              label="Reportada hasta"
              value={dateTo}
              onChange={setDateTo}
              error={rangeError}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Mostrando {filtered.length} de {repairs.length} reparaciones
            </span>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
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
                  {filtered.map((repair) => {
                    const machine = machineById.get(repair.machineId)
                    return (
                      <tr key={repair.id}>
                        <td>
                          {machine ? (
                            <Link to={ROUTES.machineDetail(machine.id)}>
                              {machine.code} - {machine.name}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{formatDate(repair.reportDate)}</td>
                        <td>
                          <Link to={ROUTES.repairDetail(repair.id)}>{repair.failure}</Link>
                        </td>
                        <td>
                          <StatusBadge status={repair.status} />
                        </td>
                        <td className={styles.number}>{formatNumber(repair.downtimeHours)}</td>
                        <td className={styles.number}>
                          {formatCurrency(repairTotal(repair, parts))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}