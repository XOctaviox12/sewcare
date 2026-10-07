import { useState } from 'react'
import { CircleCheck, CircleX, Cog } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DateInput,
  EmptyState,
  ErrorState,
  Modal,
  NumberInput,
  PageHeader,
  Select,
  StatCard,
  StatusBadge,
  TextArea,
  TextInput,
} from '../components'
import type { BadgeStatus } from '../components'
import { MACHINE_TYPES } from '../constants/machineTypes'
import { useToast } from '../hooks/useToast'
import {
  clearAllCollections,
  historyService,
  machineService,
  planService,
  repairService,
  restoreDemoData,
  settingsService,
  sparePartService,
} from '../services'

const ALL_STATUSES: BadgeStatus[] = [
  'Operativa',
  'En mantenimiento',
  'Fuera de servicio',
  'Pendiente',
  'Próximo',
  'Vencido',
  'Completado',
  'Reportada',
  'En proceso',
  'Finalizada',
  'A tiempo',
  'Con retraso',
]

/** Cantidades que debe tener la demo. */
const EXPECTED = {
  machines: 8,
  plans: 10,
  history: 5,
  repairs: 4,
  spareParts: 8,
} as const

interface DemoSnapshot {
  machines: number
  plans: number
  history: number
  repairs: number
  spareParts: number
  demoLoaded: boolean
}

function readSnapshot(): DemoSnapshot {
  return {
    machines: machineService.list().length,
    plans: planService.list().length,
    history: historyService.list().length,
    repairs: repairService.list().length,
    spareParts: sparePartService.list().length,
    demoLoaded: settingsService.get().demoLoaded,
  }
}

const COLLECTION_ROWS: { key: keyof typeof EXPECTED; label: string }[] = [
  { key: 'machines', label: 'Máquinas' },
  { key: 'plans', label: 'Planes de mantenimiento' },
  { key: 'history', label: 'Historial' },
  { key: 'repairs', label: 'Reparaciones' },
  { key: 'spareParts', label: 'Refacciones' },
]

export function ComponentsDemoPage() {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [hours, setHours] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(readSnapshot)

  const allCorrect = COLLECTION_ROWS.every(
    ({ key }) => snapshot[key] === EXPECTED[key],
  )

  const handleRestore = () => {
    restoreDemoData()
    setSnapshot(readSnapshot())
    showToast('Datos demo restaurados')
  }

  const handleClear = () => {
    clearAllCollections()
    setSnapshot(readSnapshot())
    showToast('Colecciones borradas. Recarga la página: la demo NO debe volver.', 'info')
  }

  return (
    <>
      <PageHeader
        title="Prueba de componentes"
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Prueba' }]}
        actions={<Button onClick={() => setModalOpen(true)}>Abrir modal</Button>}
      />

      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        {/* ---------- Datos demo en localStorage ---------- */}
        <section
          style={{
            display: 'grid',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-panel)',
          }}
        >
          <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Datos demo en localStorage</h2>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-2)' }}>Colección</th>
                <th style={{ padding: 'var(--space-2)' }}>Actual</th>
                <th style={{ padding: 'var(--space-2)' }}>Esperado</th>
                <th style={{ padding: 'var(--space-2)' }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {COLLECTION_ROWS.map(({ key, label }) => {
                const ok = snapshot[key] === EXPECTED[key]
                return (
                  <tr key={key} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-2)' }}>{label}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{snapshot[key]}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{EXPECTED[key]}</td>
                    <td style={{ padding: 'var(--space-2)' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          color: ok ? 'var(--color-success)' : 'var(--color-danger)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {ok ? (
                          <CircleCheck aria-hidden="true" size={16} />
                        ) : (
                          <CircleX aria-hidden="true" size={16} />
                        )}
                        {ok ? 'Correcto' : 'Distinto'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-2)' }}>settings.demoLoaded</td>
                <td style={{ padding: 'var(--space-2)' }} colSpan={3}>
                  {String(snapshot.demoLoaded)}
                </td>
              </tr>
            </tbody>
          </table>

          <p
            style={{
              fontWeight: 'var(--font-weight-medium)',
              color: allCorrect ? 'var(--color-success)' : 'var(--color-warning)',
            }}
          >
            {allCorrect
              ? 'La demo está completa: 8, 10, 5, 4 y 8.'
              : 'Las cantidades no coinciden con la demo (puede ser normal si borraste o editaste datos).'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => setSnapshot(readSnapshot())}>
              Volver a contar
            </Button>
            <Button variant="secondary" onClick={handleRestore}>
              Restaurar demo
            </Button>
            <Button variant="danger" onClick={handleClear}>
              Borrar las 5 colecciones
            </Button>
          </div>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Eliminar (confirmación)
          </Button>
          <Button disabled>Deshabilitado</Button>
          <Button icon={<Cog size={18} />} variant="secondary">
            Con icono
          </Button>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {ALL_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </section>

        <section
          style={{
            display: 'grid',
            gap: 'var(--space-3)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <StatCard label="Total de máquinas" value={snapshot.machines} icon={<Cog size={22} />} />
          <StatCard label="Costo acumulado" value="$12,500.00" />
        </section>

        <section
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <TextInput
            label="Nombre"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={showErrors && !name.trim() ? 'El nombre es obligatorio' : undefined}
            hint="Ejemplo: Recta Juki 01"
          />
          <Select
            label="Tipo"
            required
            options={MACHINE_TYPES}
            placeholder="Selecciona un tipo"
            value={type}
            onChange={(event) => setType(event.target.value)}
            error={showErrors && !type ? 'Selecciona un tipo' : undefined}
          />
          <DateInput label="Fecha de adquisición" value={date} onChange={setDate} />
          <NumberInput
            label="Horas de uso"
            value={hours}
            onChange={setHours}
            min={0}
          />
          <TextArea
            label="Observaciones"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Button onClick={() => setShowErrors(true)}>Validar formulario</Button>
          <Button variant="secondary" onClick={() => showToast('Máquina guardada correctamente')}>
            Toast éxito
          </Button>
          <Button variant="secondary" onClick={() => showToast('No se pudo guardar', 'error')}>
            Toast error
          </Button>
          <Button variant="secondary" onClick={() => showToast('Dato informativo', 'info')}>
            Toast info
          </Button>
        </section>

        <EmptyState
          title="Aún no hay máquinas"
          description="Registra la primera para comenzar."
          action={<Button>Registrar máquina</Button>}
        />

        <ErrorState
          description="No se pudieron cargar los datos."
          action={<Button variant="secondary">Reintentar</Button>}
        />
      </div>

      <Modal
        open={modalOpen}
        title="Modal de prueba"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false)
                showToast('Guardado desde el modal')
              }}
            >
              Guardar
            </Button>
          </>
        }
      >
        <TextInput label="Campo dentro del modal" />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Eliminar máquina"
        message="Se eliminará la máquina y todos sus registros. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          showToast('Máquina eliminada')
        }}
      />
    </>
  )
}