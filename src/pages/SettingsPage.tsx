import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Download, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { Button, ConfirmDialog, NumberInput, PageHeader } from '../components'
import { ROUTES } from '../constants/routes'
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
import { createBackup, restoreBackup } from '../services/backupService'
import { formatCurrency, formatDate, notNegative } from '../utils'
import {
  MAX_BACKUP_BYTES,
  backupFilename,
  downloadTextFile,
  parseBackup,
  serializeBackup,
} from '../utils/backup'
import type { BackupFile } from '../utils/backup'
import styles from './SettingsPage.module.css'

interface Counts {
  machines: number
  plans: number
  history: number
  repairs: number
  spareParts: number
}

function readCounts(): Counts {
  return {
    machines: machineService.list().length,
    plans: planService.list().length,
    history: historyService.list().length,
    repairs: repairService.list().length,
    spareParts: sparePartService.list().length,
  }
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function describeCounts(counts: Counts): string {
  return [
    plural(counts.machines, 'máquina', 'máquinas'),
    plural(counts.plans, 'plan de mantenimiento', 'planes de mantenimiento'),
    plural(counts.history, 'registro de historial', 'registros de historial'),
    plural(counts.repairs, 'reparación', 'reparaciones'),
    plural(counts.spareParts, 'refacción', 'refacciones'),
  ].join(', ')
}

function countsOfBackup(backup: BackupFile): Counts {
  return {
    machines: backup.data.machines.length,
    plans: backup.data.maintenancePlans.length,
    history: backup.data.maintenanceHistory.length,
    repairs: backup.data.repairs.length,
    spareParts: backup.data.spareParts.length,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

interface PendingImport {
  backup: BackupFile
  fileName: string
}

export function SettingsPage() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Se incrementa después de cada acción para volver a contar los datos.
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((current) => current + 1)

  const [highCost, setHighCost] = useState<number | ''>(
    () => settingsService.get().highRepairCost,
  )
  const [costError, setCostError] = useState<string | undefined>()
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)
  const [importErrors, setImportErrors] = useState<string[]>([])

  const counts = readCounts()

  /* ---------- Costo alto ---------- */
  const handleSaveCost = (event: FormEvent) => {
    event.preventDefault()
    if (highCost === '' || !notNegative(highCost)) {
      setCostError('El costo debe ser un número mayor o igual a cero')
      document.getElementById('settings-highCost')?.focus()
      return
    }
    setCostError(undefined)
    try {
      settingsService.update({ highRepairCost: highCost })
      showToast(`Costo alto actualizado a ${formatCurrency(highCost)}`)
    } catch (error) {
      showToast(errorMessage(error, 'No se pudo guardar la configuración.'), 'error')
    }
  }

  /* ---------- Demo y borrado ---------- */
  const handleRestoreDemo = () => {
    try {
      restoreDemoData()
      showToast('Datos de demostración restaurados')
    } catch (error) {
      showToast(errorMessage(error, 'No se pudo restaurar la demostración.'), 'error')
    }
    setRestoreOpen(false)
    refresh()
  }

  const handleDeleteAll = () => {
    try {
      clearAllCollections()
      // La demo no debe volver sola después de borrar todo.
      settingsService.update({ demoLoaded: true })
      showToast('Se eliminaron todos los datos')
    } catch (error) {
      showToast(errorMessage(error, 'No se pudieron eliminar los datos.'), 'error')
    }
    setDeleteOpen(false)
    refresh()
  }

  /* ---------- Respaldo ---------- */
  const handleExport = () => {
    try {
      downloadTextFile(backupFilename(), serializeBackup(createBackup()), 'application/json')
      showToast('Respaldo descargado')
    } catch (error) {
      showToast(errorMessage(error, 'No se pudo generar el respaldo.'), 'error')
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Permite volver a elegir el mismo archivo después.
    event.target.value = ''
    if (!file) return

    setImportErrors([])
    setPendingImport(null)

    if (file.size > MAX_BACKUP_BYTES) {
      setImportErrors(['El archivo es demasiado grande para ser un respaldo de SewCare.'])
      return
    }

    file
      .text()
      .then((content) => {
        const result = parseBackup(content)
        if (result.ok) {
          setPendingImport({ backup: result.backup, fileName: file.name })
        } else {
          setImportErrors(result.errors)
        }
      })
      .catch(() => setImportErrors(['No se pudo leer el archivo.']))
  }

  const handleConfirmImport = () => {
    if (!pendingImport) return
    try {
      restoreBackup(pendingImport.backup.data)
      showToast('Respaldo importado correctamente')
    } catch (error) {
      showToast(errorMessage(error, 'No se pudo importar el respaldo.'), 'error')
    }
    setPendingImport(null)
    setHighCost(settingsService.get().highRepairCost)
    refresh()
  }

  const importDate = pendingImport ? formatDate(pendingImport.backup.exportedAt.slice(0, 10)) : ''
  const importMessage = pendingImport
    ? `Se reemplazarán TODOS los datos actuales por los del archivo "${pendingImport.fileName}"` +
      `${importDate ? ` (respaldo del ${importDate})` : ''}: ` +
      `${describeCounts(countsOfBackup(pendingImport.backup))}. Esta acción no se puede deshacer.`
    : ''

  return (
    <>
      <PageHeader
        title="Configuración"
        breadcrumbs={[{ label: 'Inicio', to: ROUTES.home() }, { label: 'Configuración' }]}
      />

      <div className={styles.stack}>
        <section className={styles.card} aria-labelledby="settings-data">
          <h2 id="settings-data">Datos guardados</h2>
          <ul className={styles.counts}>
            <li>{plural(counts.machines, 'máquina', 'máquinas')}</li>
            <li>{plural(counts.plans, 'plan', 'planes')}</li>
            <li>{plural(counts.history, 'registro de historial', 'registros de historial')}</li>
            <li>{plural(counts.repairs, 'reparación', 'reparaciones')}</li>
            <li>{plural(counts.spareParts, 'refacción', 'refacciones')}</li>
          </ul>
          <p className={styles.note}>
            Los datos se guardan solo en este navegador. Si borras los datos del navegador, se
            pierden. Descarga respaldos con frecuencia.
          </p>
        </section>

        <section className={styles.card} aria-labelledby="settings-cost">
          <h2 id="settings-cost">Alerta por costo de reparación</h2>
          <p className={styles.muted}>
            Una reparación cuyo total supere este valor genera una alerta crítica.
          </p>
          <form className={styles.row} onSubmit={handleSaveCost} noValidate>
            <div className={styles.field}>
              <NumberInput
                id="settings-highCost"
                label="Costo considerado alto (MXN)"
                min={0}
                step={100}
                value={highCost}
                onChange={setHighCost}
                error={costError}
              />
            </div>
            <Button type="submit" icon={<Save size={18} />}>
              Guardar
            </Button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="settings-backup">
          <h2 id="settings-backup">Respaldo</h2>
          <p className={styles.muted}>
            Descarga todos tus datos en un archivo JSON o restaura uno anterior. Al importar, se
            valida el archivo antes de cambiar nada.
          </p>
          <div className={styles.row}>
            <Button variant="secondary" icon={<Download size={18} />} onClick={handleExport}>
              Descargar respaldo
            </Button>
            <Button
              variant="secondary"
              icon={<Upload size={18} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Importar respaldo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={handleFileChange}
            />
          </div>

          {importErrors.length > 0 && (
            <div className={styles.errors} role="alert">
              <strong>No se importó nada. El archivo tiene problemas:</strong>
              <ul>
                {importErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.danger}`} aria-labelledby="settings-danger">
          <h2 id="settings-danger">Zona de cuidado</h2>
          <p className={styles.muted}>
            Estas acciones reemplazan o borran todos tus datos. Descarga un respaldo antes si lo
            necesitas.
          </p>
          <div className={styles.row}>
            <Button
              variant="secondary"
              icon={<RotateCcw size={18} />}
              onClick={() => setRestoreOpen(true)}
            >
              Restaurar datos de demostración
            </Button>
            <Button variant="danger" icon={<Trash2 size={18} />} onClick={() => setDeleteOpen(true)}>
              Eliminar todos los datos
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={restoreOpen}
        danger
        title="Restaurar datos de demostración"
        message={`Se reemplazarán TODOS los datos actuales (${describeCounts(counts)}) por los datos de demostración. Esta acción no se puede deshacer.`}
        confirmLabel="Restaurar demo"
        onCancel={() => setRestoreOpen(false)}
        onConfirm={handleRestoreDemo}
      />

      <ConfirmDialog
        open={deleteOpen}
        danger
        title="Eliminar todos los datos"
        message={`Se eliminarán ${describeCounts(counts)}. La demostración no volverá a cargarse sola. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar todo"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAll}
      />

      <ConfirmDialog
        open={pendingImport !== null}
        danger
        title="Importar respaldo"
        message={importMessage}
        confirmLabel="Importar"
        onCancel={() => setPendingImport(null)}
        onConfirm={handleConfirmImport}
      />
    </>
  )
}