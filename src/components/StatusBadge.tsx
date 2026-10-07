import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  CircleCheck,
  CircleX,
  Clock,
  Flag,
  Loader,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import type {
  MachineStatus,
  PlanStatus,
  Punctuality,
  RepairStatus,
} from '../types'
import styles from './StatusBadge.module.css'

export type BadgeStatus = MachineStatus | PlanStatus | RepairStatus | Punctuality

type Tone = 'success' | 'warning' | 'danger' | 'pending'

const BADGES: Record<BadgeStatus, { tone: Tone; icon: LucideIcon }> = {
  // Máquina
  Operativa: { tone: 'success', icon: CircleCheck },
  'En mantenimiento': { tone: 'warning', icon: Wrench },
  'Fuera de servicio': { tone: 'danger', icon: CircleX },
  // Plan
  Pendiente: { tone: 'pending', icon: Clock },
  Próximo: { tone: 'warning', icon: CalendarClock },
  Vencido: { tone: 'danger', icon: TriangleAlert },
  Completado: { tone: 'success', icon: CircleCheck },
  // Reparación
  Reportada: { tone: 'pending', icon: Flag },
  'En proceso': { tone: 'warning', icon: Loader },
  Finalizada: { tone: 'success', icon: CircleCheck },
  // Puntualidad
  'A tiempo': { tone: 'success', icon: CircleCheck },
  'Con retraso': { tone: 'danger', icon: TriangleAlert },
}

interface StatusBadgeProps {
  status: BadgeStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { tone, icon: Icon } = BADGES[status]
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <Icon aria-hidden="true" size={16} />
      {status}
    </span>
  )
}