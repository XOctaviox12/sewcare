import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  DateInput,
  ErrorState,
  NumberInput,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from '../components'
import { MACHINE_TYPES } from '../constants/machineTypes'
import { ROUTES } from '../constants/routes'
import { MACHINE_STATUSES } from '../constants/statuses'
import { useToast } from '../hooks/useToast'
import { machineService } from '../services'
import type { Machine, MachineStatus, MachineType } from '../types'
import {
  EMPTY_MACHINE_FORM,
  MACHINE_FIELD_ORDER,
  hasErrors,
  machineToFormValues,
  toISODate,
  today,
  toMachineData,
  validateMachine,
} from '../utils'
import type { Errors, MachineFormValues } from '../utils'
import styles from './MachineFormPage.module.css'

interface MachineFormProps {
  machine?: Machine
}

function MachineForm({ machine }: MachineFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [values, setValues] = useState<MachineFormValues>(() =>
    machine ? machineToFormValues(machine) : EMPTY_MACHINE_FORM,
  )
  const [errors, setErrors] = useState<Errors>({})

  const existing = machineService.list()
  const areaSuggestions = [...new Set(existing.map((m) => m.area).filter(Boolean))]
  const lineSuggestions = [
    ...new Set(existing.map((m) => m.productionLine).filter(Boolean)),
  ]

  const setField = <K extends keyof MachineFormValues>(
    key: K,
    value: MachineFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateMachine(values, machineService.list(), machine?.id)
    setErrors(found)

    if (hasErrors(found)) {
      const first = MACHINE_FIELD_ORDER.find((field) => found[field])
      if (first) document.getElementById(`machine-${first}`)?.focus()
      return
    }

    try {
      const data = toMachineData(values)
      if (machine) {
        machineService.update(machine.id, data)
        showToast('Máquina actualizada correctamente')
        navigate(ROUTES.machineDetail(machine.id))
      } else {
        const created = machineService.create(data)
        showToast('Máquina registrada correctamente')
        navigate(ROUTES.machineDetail(created.id))
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar la máquina.',
        'error',
      )
    }
  }

  const title = machine ? 'Editar máquina' : 'Registrar máquina'
  const errorMessages = Object.values(errors)

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Inicio', to: ROUTES.home() },
          { label: 'Máquinas', to: ROUTES.machines() },
          ...(machine
            ? [
                { label: machine.code, to: ROUTES.machineDetail(machine.id) },
                { label: 'Editar' },
              ]
            : [{ label: 'Nueva' }]),
        ]}
      />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {errorMessages.length > 0 && (
          <div className={styles.summary} role="alert">
            <strong>
              Revisa {errorMessages.length}{' '}
              {errorMessages.length === 1 ? 'campo' : 'campos'} antes de guardar:
            </strong>
            <ul>
              {errorMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          <TextInput
            id="machine-code"
            label="Código interno"
            required
            value={values.code}
            onChange={(event) => setField('code', event.target.value)}
            error={errors.code}
          />
          <TextInput
            id="machine-name"
            label="Nombre"
            required
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors.name}
          />
          <TextInput
            id="machine-brand"
            label="Marca"
            required
            value={values.brand}
            onChange={(event) => setField('brand', event.target.value)}
            error={errors.brand}
          />
          <TextInput
            id="machine-model"
            label="Modelo"
            required
            value={values.model}
            onChange={(event) => setField('model', event.target.value)}
            error={errors.model}
          />
          <TextInput
            id="machine-serialNumber"
            label="Número de serie"
            required
            value={values.serialNumber}
            onChange={(event) => setField('serialNumber', event.target.value)}
            error={errors.serialNumber}
          />
          <Select
            id="machine-type"
            label="Tipo de máquina"
            required
            options={MACHINE_TYPES}
            placeholder="Selecciona un tipo"
            value={values.type}
            onChange={(event) =>
              setField('type', event.target.value as MachineType | '')
            }
            error={errors.type}
          />
          <TextInput
            id="machine-area"
            label="Área"
            required
            list="machine-area-list"
            value={values.area}
            onChange={(event) => setField('area', event.target.value)}
            error={errors.area}
            hint="Escribe una nueva o elige una existente"
          />
          <TextInput
            id="machine-productionLine"
            label="Línea de producción"
            list="machine-line-list"
            value={values.productionLine}
            onChange={(event) => setField('productionLine', event.target.value)}
          />
          <DateInput
            id="machine-acquisitionDate"
            label="Fecha de adquisición"
            max={toISODate(today())}
            value={values.acquisitionDate}
            onChange={(value) => setField('acquisitionDate', value)}
            error={errors.acquisitionDate}
          />
          <Select
            id="machine-status"
            label="Estado"
            required
            options={MACHINE_STATUSES}
            value={values.status}
            onChange={(event) =>
              setField('status', event.target.value as MachineStatus | '')
            }
            error={errors.status}
          />
          <NumberInput
            id="machine-usageHours"
            label="Horas estimadas de uso"
            min={0}
            value={values.usageHours}
            onChange={(value) => setField('usageHours', value)}
            error={errors.usageHours}
          />
          <TextInput
            id="machine-responsible"
            label="Responsable"
            value={values.responsible}
            onChange={(event) => setField('responsible', event.target.value)}
          />
          <div className={styles.wide}>
            <TextArea
              id="machine-notes"
              label="Observaciones"
              value={values.notes}
              onChange={(event) => setField('notes', event.target.value)}
            />
          </div>
        </div>

        <datalist id="machine-area-list">
          {areaSuggestions.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
        <datalist id="machine-line-list">
          {lineSuggestions.map((line) => (
            <option key={line} value={line} />
          ))}
        </datalist>

        <div className={styles.actions}>
          <Button type="submit">{machine ? 'Guardar cambios' : 'Registrar máquina'}</Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(machine ? ROUTES.machineDetail(machine.id) : ROUTES.machines())
            }
          >
            Cancelar
          </Button>
        </div>
      </form>
    </>
  )
}

export function MachineFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const machine = id ? machineService.getById(id) : undefined

  if (id && !machine) {
    return (
      <ErrorState
        title="Máquina no encontrada"
        description="La máquina que intentas editar no existe o ya fue eliminada."
        action={<Button onClick={() => navigate(ROUTES.machines())}>Volver a máquinas</Button>}
      />
    )
  }

  return <MachineForm key={id ?? 'new'} machine={machine} />
}