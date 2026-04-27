const normalizeTokens = (value: string): string[] =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)

const normalizeField = (value: unknown): string => String(value || '').toLowerCase()

export function matchesTokenizedSearch(searchTerm: string, fields: unknown[]): boolean {
  const tokens = normalizeTokens(searchTerm || '')
  if (tokens.length === 0) {
    return true
  }

  const normalizedFields = fields.map(normalizeField)
  return tokens.every((token) => normalizedFields.some((field) => field.includes(token)))
}
