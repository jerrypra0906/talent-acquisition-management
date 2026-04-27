import type { Step } from 'react-joyride'

/**
 * One entry per page guide. Maps to pathname via `getTourKeyForPathname`.
 * Keep targets in sync with `data-tour` attributes in the app shell.
 */
export const TOUR_ROUTE_KEYS = [
  'dashboard',
  'candidates',
  'candidatesKiv',
  'position',
] as const

export type TourRouteKey = (typeof TOUR_ROUTE_KEYS)[number]

const step = (
  target: string,
  title: string,
  content: string,
  placement: Step['placement'] = 'bottom'
): Step => ({
  target,
  title,
  content,
  placement,
  skipBeacon: true,
})

export const TOUR_STEPS: Record<TourRouteKey, Step[]> = {
  dashboard: [
    step(
      '[data-tour="dashboard-time-filter"]',
      'Time period',
      'Use week, month, or a custom range to set the period for the dashboard. Period-over-period change on each card uses this range.',
      'bottom'
    ),
    step(
      '[data-tour="dashboard-analytics"]',
      'Analytics cards and drill-down',
      'Each card shows a headline metric. Click a card to drill down: a detail modal opens with the underlying list (candidates, positions, or pipeline rows) so you can move from summary to specifics.',
      'top'
    ),
  ],

  candidates: [
    step(
      '[data-tour="candidates-add"]',
      'Create a candidate',
      'Use Add Candidate to register someone in the pool. Bulk Upload is available for batch imports. After creation, they appear in the table and move through the lifecycle in Status.',
      'bottom'
    ),
    step(
      '[data-tour="candidates-filters"]',
      'Search and status',
      'Search by name or other fields, and filter by status to see where people sit in the pipeline (e.g. screening, interview, hired).',
      'bottom'
    ),
    step(
      '[data-tour="candidates-lifecycle"]',
      'Candidate lifecycle',
      'The table shows who applied, for which role, and their current status — this is the day-to-day operating view of the talent pipeline.',
      'top'
    ),
    step(
      '[data-tour="nav-kiv"]',
      'KIV — Keep In View',
      'From Candidate → KIV in the sidebar you open a dedicated list of applications in Keep In View, separate from the main grid so you can track them without losing them in the pipeline.',
      'right'
    ),
  ],

  candidatesKiv: [
    step(
      '[data-tour="kiv-header"]',
      'KIV (Keep In View)',
      'This view lists applications where status is Keep In View so you can watch them with extra attention outside the main candidate list.',
      'bottom'
    ),
    step(
      '[data-tour="kiv-filters"]',
      'Filter KIV records',
      'Search and narrow by position or division to find the KIV you need quickly.',
      'bottom'
    ),
    step(
      '[data-tour="kiv-table"]',
      'Act on a row',
      'Open candidate to jump to the full record and continue managing their journey.',
      'top'
    ),
  ],

  position: [
    step(
      '[data-tour="fptk-list"]',
      'Positions and candidate suggestions',
      'Each row is a position. Click View to open the position: there you see applications, can review suggested or matched candidates, and run the process end to end. Use Create New Position for a new requisition.',
      'top'
    ),
    step(
      'body',
      'How you input a candidate for a position',
      'Add candidates in context of a position: open View (or Edit) on a row, then add or link applications in the position modal. That keeps hiring stages, status, and matching aligned to the role.',
      'center'
    ),
  ],
}

export function getTourKeyForPathname(pathname: string | null): TourRouteKey | null {
  if (pathname == null) return null
  const p = pathname.replace(/\/$/, '') || '/'
  if (p === '' || p === '/') return 'dashboard'
  if (p === '/candidates/kiv') return 'candidatesKiv'
  if (p === '/candidates') return 'candidates'
  if (p === '/fptk') return 'position'
  return null
}

export function isTourablePath(pathname: string | null): boolean {
  return getTourKeyForPathname(pathname) !== null
}
