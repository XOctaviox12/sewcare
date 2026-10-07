import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, SearchX, Cog } from 'lucide-react'
import {
  Button,
  EmptyState,
  PageHeader,
  Select,
  StatusBadge,
  TextInput,
} from '../components'
import tableStyles from '../components/Table.module.css'
import { MACHINE_STATUSES } from '../constants/statuses'
import { MACHINE_TYPES } from '../constants/machineTypes'
import { ROUTES } from '../constants/routes'
import { machineService } from '../services'
import type { Machine } from '../types'
import { includesText } from '../utils'
import styles from './MachinesPage.module.css'

const SORT_OPTIONS = [
  'Nombre A-Z',
  'Nombre Z-A',
  'Adquisición más reciente',
  'Adquisición más antigua',
] as const

type SortOption = (typeof SORT_OPTIONS)[number]

function compareDates(a: Machine, b: Machine, direction: 'asc' | 'desc'): number {
  // Las máquinas sin fecha van al final en ambos órdenes.
  if (!a.acquisitionDate && !b.acquisitionDate) return 0
  if (!a.acquisitionDate) return 1
  if (!b.acquisitionDate) return -1
  return direction === 'desc'
    ? b.acquisitionDate.localeCompare(a.acquisitionDate)
    : a.acquisitionDate.localeCompare(b.acquisitionDate)
}

function sortMachines(items: Machine[], sort: SortOption): Machine[] {
  const sorted = [...items]
  switch (sort) {
    case 'Nombre A-Z':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    case 'Nombre Z-A':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'es'))
    case 'Adquisición más reciente':
      return sorted.sort((a, b) => compareDates(a, b, 'desc'))
    case 'Adquisición más antigua':
      return sorted.sort((a, b) => compareDates(a, b, 'asc'))
  }
}

export function MachinesPage() {
  const navigate = useNavigate()
  const [machines] = useState<Machine[]>(() => machineService.list())
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortOption>('Nombre A-Z')

  const areas = useMemo(
    () =>
      [...new Set(machines.map((m) => m.area).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [machines],
  )

  const filtered = useMemo(() => {
    const result = machines.filter((machine) => {
      if (type && machine.type !== type) return false
      if (area && machine.area !== area) return false
      if (status && machine.status !== status) return false
      if (search.trim()) {
        const haystack = [
          machine.code,
          machine.name,
          machine.brand,
          machine.model,
          machine.serialNumber,
        ].join(' ')
        if (!includesText(haystack, search)) return false
      }
      return true
    })
    return sortMachines(result, sort)
  }, [machines, search, type, area, status, sort])

  const hasFilters = Boolean(search.trim() || type || area || status)

  const clearFilters = () => {
    setSearch('')
    setType('')
    setArea('')
    setStatus('')
  }

  return (
    <>
      <PageHeader
        title="Máquinas"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Máquinas' }]}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => navigate(ROUTES.machineNew())}>
            Registrar máquina
          </Button>
        }
      />

      {machines.length === 0 ? (
        <EmptyState
          icon={<Cog size={40} />}
          title="Aún no hay máquinas"
          description="Registra la primera para comenzar a programar su mantenimiento."
          action={
            <Button onClick={() => navigate(ROUTES.machineNew())}>Registrar máquina</Button>
          }
        />
      ) : (
        <>
          <div className={styles.toolbar}>
            <TextInput
              label="Buscar"
              type="search"
              placeholder="Código, nombre, marca, modelo o serie"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Tipo"
              options={MACHINE_TYPES}
              placeholder="Todos"
              value={type}
              onChange={(event) => setType(event.target.value)}
            />
            <Select
              label="Área"
              options={areas}
              placeholder="Todas"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
            <Select
              label="Estado"
              options={MACHINE_STATUSES}
              placeholder="Todos"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
            <Select
              label="Ordenar por"
              options={[...SORT_OPTIONS]}
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
            />
          </div>

          <div className={styles.summary} aria-live="polite">
            <span>
              Mostrando {filtered.length} de {machines.length} máquinas
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
              description="Ninguna máquina coincide con la búsqueda o los filtros."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <caption className="sr-only">Lista de máquinas</caption>
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Área</th>
                    <th scope="col">Línea</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((machine) => (
                    <tr key={machine.id}>
                      <td className={styles.code}>
                        <Link to={ROUTES.machineDetail(machine.id)}>{machine.code}</Link>
                      </td>
                      <td>{machine.name}</td>
                      <td>{machine.type}</td>
                      <td>{machine.area}</td>
                      <td>{machine.productionLine || '—'}</td>
                      <td>
                        <StatusBadge status={machine.status} />
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