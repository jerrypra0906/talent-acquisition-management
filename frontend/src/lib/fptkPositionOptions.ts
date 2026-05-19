import { FPTKAPI } from '@/lib/api'

export type PositionOption = {
  id: string
  title: string
  department?: string
  division?: string
  currentStatus?: string
  fptkNumber?: string
}

const EXCLUDED_PICKER_STATUSES = new Set(['ON BOARDING', 'FILLED', 'CANCELLED', 'EXPIRED'])

/** Statuses eligible for the candidate position picker (aligned with edit modal rules). */
export function isSelectableFptkStatus(status?: string | null): boolean {
  const normalized = (status || '').toUpperCase().trim()
  if (!normalized) return true
  if (normalized === 'ON BOARDING') return false
  return !EXCLUDED_PICKER_STATUSES.has(normalized)
}

export function mapRowToPositionOption(row: {
  id: string
  title?: string
  position?: string
  positionTitle?: string
  department?: string
  division?: string
  currentStatus?: string
  fptkNumber?: string
}): PositionOption {
  const rawTitle = row.title || row.position || row.positionTitle || row.department
  const title =
    rawTitle && String(rawTitle).trim().length > 0
      ? String(rawTitle).trim()
      : `Position ${String(row.id || '').slice(0, 8)}`

  return {
    id: row.id,
    title,
    department: row.department || '',
    division: row.division || '',
    currentStatus: row.currentStatus || '',
    fptkNumber: row.fptkNumber,
  }
}

/** Deduplicate by title (picker stores title strings on the candidate). */
export function dedupePositionOptionsByTitle(options: PositionOption[]): PositionOption[] {
  const seen = new Set<string>()
  const result: PositionOption[] = []
  for (const opt of options) {
    if (!opt.title || seen.has(opt.title)) continue
    seen.add(opt.title)
    result.push(opt)
  }
  return result.sort((a, b) => a.title.localeCompare(b.title))
}

export type LoadPositionOptionsResult = {
  options: PositionOption[]
  totalFetched: number
  selectableCount: number
  excludedByStatusCount: number
}

/**
 * Fetch all position-option pages from the lightweight API and apply picker status rules.
 */
export async function loadSelectablePositionOptions(
  filters?: { search?: string },
  options?: { limit?: number; maxPages?: number }
): Promise<LoadPositionOptionsResult> {
  const limit = options?.limit ?? 100
  const maxPages = options?.maxPages ?? 20
  let page = 1
  let hasMore = true
  const allRows: PositionOption[] = []

  while (hasMore && page <= maxPages) {
    const response = await FPTKAPI.getPositionOptions(filters, { page, limit })
    const data = Array.isArray(response?.data) ? response.data : []
    allRows.push(...data.map(mapRowToPositionOption))

    const totalPages = response?.pagination?.totalPages
    if (totalPages) {
      hasMore = page < totalPages
    } else {
      hasMore = data.length === limit
    }
    page += 1
  }

  const totalFetched = allRows.length
  const selectable = allRows.filter((row) => isSelectableFptkStatus(row.currentStatus))
  const optionsList = dedupePositionOptionsByTitle(selectable)

  return {
    options: optionsList,
    totalFetched,
    selectableCount: optionsList.length,
    excludedByStatusCount: totalFetched - selectable.length,
  }
}
