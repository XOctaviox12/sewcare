const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const numberFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
})

/** 1234.5 -> "$1,234.50" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

/** 1234.5 -> "1,234.5" */
export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

/** 87.456 -> "87.5 %" */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value)} %`
}