import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, SearchX } from 'lucide-react'
import {
  Button,
  DateInput,
  EmptyState,
  PageHeader,
  Select,
  StatusBadge,
} from '../components'
import type { SelectOption } from '../components/Select'
import tableStyles from '../components/Table.module.css'
import { ROUTES } from '../constants/routes'
import { PUNCTUALITY_OPTIONS } from '../constants/statuses'
import { historyService, machineService } from '../services'
import { formatDate } from '../utils'
import styles from './HistoryPage.module.css'

export function HistoryPage() {
  const [records] = useState(() => historyService.list())
  const [machines] = useState(() => machineService.list())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [machineId, setMachineId] = useState('')
  const [area, setArea] = useState('')
  const [responsible, setResponsible] = useState('')
  const [punctuality, setPunctuality] = useState('')

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

  const responsibles = useMemo(
    () =>
      [...new Set(records.map((record) => record.responsible.trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, 'es'),
      ),
    [records],
  )

  const rows = useMemo(
    () =>
      records
        .map((record) => ({ record, machine: machineById.get(record.machineId) }))
        .filter(({ record, machine }) => {
          // El rango de fechas se aplica a la fecha realizada.
          if (from && record.completedDate < from) return false
          if (to && record.completedDate > to) return false
          if (machineId && record.machineId !== machineId) return false
          if (area && machine?.area !== area) return false
          if (responsible && record.responsible !== responsible) return false
          if (punctuality && record.punctuality !== punctuality) return false
          return true
        })
        // Más reciente primero (si empatan, el último capturado primero).
        .sort(
          (a, b) =>
            b.record.completedDate.localeCompare(a.record.completedDate) ||
            b.record.createdAt.localeCompare(a.record.createdAt),
        ),
    [records, machineById, from, to, machineId, area, responsible, punctuality],
  )

  const rangeError =
    from && to && to < from
      ? 'La fecha final no puede ser anterior a la inicial'
      : undefined

  const hasFilters = Boolean(from || to || machineId || area || responsible || punctuality)

  const clearFilters = () => {
    setFrom('')
    setTo('')
    setMachineId('')
    setArea('')
    setResponsible('')
    setPunctuality('')
  }

  return (
    <>
      <PageHeader
        title="Historial"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Historial' }]}
      />

      {records.length === 0 ? (
        <EmptyState
          icon={<History size={40} />}
          title="Aún no hay mantenimientos completados"
          description="Cuando marques un mantenimiento como completado, aparecerá aquí."
          action={
            <Link to={ROUTES.plans()}>Ir a mantenimiento</Link>
          }
        />
      ) : (
        <>
          <div className={styles.toolbar}>
            <DateInput label="Realizado desde" value={from} onChange={setFrom} />
            <DateInput
              label="Realizado hasta"
              value={to}
              onChange={setTo}
              error={rangeError}
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
            <Select
              label="Responsable"
              options={responsibles}
              placeholder="Todos"
              value={responsible}
              onChange={(event) => setResponsible(event.target.value)}
            />
            <Select
              label="Estado"
              options={PUNCTUALITY_OPTIONS}
              placeholder="Todos"
              value={punctuality}
              onChange={(event) => setPunctuality(event.target.value)}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Mostrando {rows.length} de {records.length} registros
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
              description="Ningún registro coincide con los filtros."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Historial de mantenimientos completados</caption>
                <thead>
                  <tr>
                    <th scope="col">Máquina</th>
                    <th scope="col">Actividad</th>
                    <th scope="col">Fecha programada</th>
                    <th scope="col">Fecha realizada</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ record, machine }) => (
                    <tr key={record.id}>
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
                        <Link to={ROUTES.historyDetail(record.id)}>{record.activity}</Link>
                      </td>
                      <td>{formatDate(record.scheduledDate)}</td>
                      <td>{formatDate(record.completedDate)}</td>
                      <td>{record.responsible || '—'}</td>
                      <td>
                        <StatusBadge status={record.punctuality} />
                      </td>
                      <td>
                        <span className={styles.notes} title={record.notes || undefined}>
                          {record.notes || '—'}
                        </span>
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