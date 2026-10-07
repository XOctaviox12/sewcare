/**
 * Minúsculas, sin acentos y sin espacios sobrantes.
 * "  MÁQUINA   Recta " -> "maquina recta"
 * Se usa en búsquedas y para detectar duplicados.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** true si `haystack` contiene `needle`, ignorando mayúsculas y acentos. */
export function includesText(haystack: string, needle: string): boolean {
  return normalizeText(haystack).includes(normalizeText(needle))
}