import type { Frequency } from '../types'

export interface SuggestedActivity {
  name: string
  /** Frecuencias orientativas. La primera es la que se propone. */
  suggestedFrequencies: Frequency[]
}

export const SUGGESTED_ACTIVITIES: SuggestedActivity[] = [
  { name: 'Limpieza general', suggestedFrequencies: ['Diaria', 'Semanal'] },
  { name: 'Lubricación', suggestedFrequencies: ['Semanal'] },
  { name: 'Cambio de aceite', suggestedFrequencies: ['Trimestral', 'Semestral'] },
  { name: 'Revisión de aguja', suggestedFrequencies: ['Diaria'] },
  { name: 'Revisión de tensión de hilo', suggestedFrequencies: ['Semanal'] },
  { name: 'Revisión del sistema de alimentación', suggestedFrequencies: ['Mensual'] },
  { name: 'Limpieza de dientes de arrastre', suggestedFrequencies: ['Semanal'] },
  { name: 'Revisión de banda', suggestedFrequencies: ['Mensual'] },
  { name: 'Ajuste de mecanismos', suggestedFrequencies: ['Trimestral'] },
  { name: 'Inspección eléctrica', suggestedFrequencies: ['Semestral'] },
  { name: 'Calibración', suggestedFrequencies: ['Trimestral', 'Semestral'] },
  { name: 'Revisión de pedal', suggestedFrequencies: ['Mensual'] },
  { name: 'Revisión de motor', suggestedFrequencies: ['Mensual', 'Trimestral'] },
]

/** Opción del desplegable para escribir una actividad distinta. */
export const OTHER_ACTIVITY = 'Otra (escribir)'