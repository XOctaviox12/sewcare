export type AlertKind =
  | 'MantenimientoVencido'
  | 'MantenimientoProximo'
  | 'MaquinaFueraDeServicio'
  | 'ReparacionAltoCosto'

/** Se CALCULA siempre, nunca se guarda. */
export interface AppAlert {
  id: string
  kind: AlertKind
  critical: boolean
  title: string
  message: string
  /** Ruta al registro que origina la alerta. */
  link: string
}