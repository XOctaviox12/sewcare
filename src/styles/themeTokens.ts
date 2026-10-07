/**
 * Espejo de theme.css para usar en TypeScript (gráficas de Recharts).
 * Si cambias un color en theme.css, cámbialo también aquí.
 */
export const theme = {
  colors: {
    primary: '#c2185b',
    secondary: '#5e35b1',
    bg: '#ffffff',
    panel: '#f6f5f8',
    border: '#d9d6df',
    text: '#1f1b24',
    textMuted: '#5f5a66',
    success: '#1b6b36',
    warning: '#7a4f00',
    danger: '#b3261e',
    pending: '#5e35b1',
  },
  /** Colores de relleno para gráficas (más vivos que los de texto). */
  chart: {
    success: '#2e9d57',
    warning: '#e0a100',
    danger: '#d6382f',
    pending: '#8e6bd1',
    primary: '#c2185b',
    secondary: '#5e35b1',
  },
  fontFamily:
    "'Nunito', 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const

export type Theme = typeof theme