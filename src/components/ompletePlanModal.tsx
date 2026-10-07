import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { completePlan } from '../services'
import type { CompletePlanResult } from '../services'
import type { MaintenancePlan } from '../types'
import { formatDate, isNotFutureDate, required, toISODate, today } from '../utils'
import { Button } from './Button'
import { DateInput } from './DateInput'
import { Modal } from './Modal'
import { TextArea } from './TextArea'
import { TextInput } from './TextInput'
import styles from './CompletePlanModal.module.css'

interface TaskItem {
  id: string
  text: string
  done: boolean
}

interface CompleteFormProps {
  plan: MaintenancePlan
  onCompleted: (result: CompletePlanResult) => void
}

const FORM_ID = 'complete-plan-form'

function CompleteForm({ plan, onCompleted }: CompleteFormProps) {
  const { showToast } = useToast()
  const [completedDate, setCompletedDate] = useState(() => toISODate(today()))
  const [responsible, setResponsible] = useState(plan.responsible)
  const [tasks, setTasks] = useState<TaskItem[]>(() => [
    { id: crypto.randomUUID(), text: plan.activity, done: true },
  ])
  const [notes, setNotes] = useState('')
  const [dateError, setDateError] = useState<string | undefined>()

  const updateTask = (id: string, changes: Partial<TaskItem>) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...changes } : task)),
    )
  }

  const addTask = () => {
    setTasks((current) => [...current, { id: crypto.randomUUID(), text: '', done: true }])
  }

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!required(completedDate)) {
      setDateError('La fecha de realización es obligatoria')
      document.getElementById('complete-date')?.focus()
      return
    }
    if (!isNotFutureDate(completedDate)) {
      setDateError('La fecha de realización debe ser válida y no futura')
      document.getElementById('complete-date')?.focus()
      return
    }
    setDateError(undefined)

    try {
      const result = completePlan(plan.id, {
        completedDate,
        responsible,
        tasksDone: tasks
          .filter((task) => task.done && task.text.trim())
          .map((task) => task.text.trim()),
        notes,
      })
      showToast(`Mantenimiento completado. Próxima fecha: ${formatDate(result.nextDate)}`)
      onCompleted(result)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo completar el mantenimiento.',
        'error',
      )
    }
  }

  return (
    <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit} noValidate>
      <DateInput
        id="complete-date"
        label="Fecha de realización"
        required
        max={toISODate(today())}
        value={completedDate}
        onChange={setCompletedDate}
        error={dateError}
      />
      <TextInput
        id="complete-responsible"
        label="Responsable"
        value={responsible}
        onChange={(event) => setResponsible(event.target.value)}
      />

      <fieldset className={styles.tasks}>
        <legend>Actividades realizadas</legend>
        {tasks.map((task, index) => (
          <div key={task.id} className={styles.taskRow}>
            <input
              type="checkbox"
              className={styles.check}
              checked={task.done}
              onChange={(event) => updateTask(task.id, { done: event.target.checked })}
              aria-label={`Realizada: actividad ${index + 1}`}
            />
            <input
              type="text"
              className={styles.taskText}
              value={task.text}
              onChange={(event) => updateTask(task.id, { text: event.target.value })}
              aria-label={`Descripción de la actividad ${index + 1}`}
              placeholder="Describe la actividad"
            />
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeTask(task.id)}
              aria-label={`Quitar actividad ${index + 1}`}
            >
              <Trash2 aria-hidden="true" size={18} />
            </button>
          </div>
        ))}
        <Button
          variant="secondary"
          className={styles.add}
          icon={<Plus size={16} />}
          onClick={addTask}
        >
          Agregar actividad
        </Button>
      </fieldset>

      <TextArea
        id="complete-notes"
        label="Observaciones"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
    </form>
  )
}

interface CompletePlanModalProps {
  plan: MaintenancePlan
  open: boolean
  onClose: () => void
  onCompleted: (result: CompletePlanResult) => void
}

export function CompletePlanModal({
  plan,
  open,
  onClose,
  onCompleted,
}: CompletePlanModalProps) {
  return (
    <Modal
      open={open}
      title="Marcar como completado"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Completar mantenimiento
          </Button>
        </>
      }
    >
      <CompleteForm plan={plan} onCompleted={onCompleted} />
    </Modal>
  )
}