import { useEffect, useState } from 'react'
import {
  machineService,
  planService,
  repairService,
  settingsService,
  sparePartService,
} from '../services'
import { DATA_CHANGED_EVENT } from '../services/storage'
import type { AppAlert } from '../types'
import { buildAlerts } from '../utils'

interface UseAlertsResult {
  alerts: AppAlert[]
  criticalCount: number
}

/** Alertas calculadas al momento; se refrescan cuando cambian los datos. */
export function useAlerts(): UseAlertsResult {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const refresh = () => setVersion((version) => version + 1)
    window.addEventListener(DATA_CHANGED_EVENT, refresh)
    // Cambios hechos desde otra pestaña.
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const alerts = buildAlerts({
    machines: machineService.list(),
    plans: planService.list(),
    repairs: repairService.list(),
    spareParts: sparePartService.list(),
    highRepairCost: settingsService.get().highRepairCost,
  })

  return { alerts, criticalCount: alerts.filter((alert) => alert.critical).length }
}