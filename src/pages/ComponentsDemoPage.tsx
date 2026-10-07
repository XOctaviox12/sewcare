import { useState } from 'react'
import { Cog } from 'lucide-react'
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

  return (
    <>
      <PageHeader
        title="Prueba de componentes"
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Prueba' }]}
        actions={<Button onClick={() => setModalOpen(true)}>Abrir modal</Button>}
      />

      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
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
          <StatCard label="Total de máquinas" value={8} icon={<Cog size={22} />} />
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