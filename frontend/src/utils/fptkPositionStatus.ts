/**
 * Open vs closed classification for FPTK rows — keep in sync with
 * `CURRENT_STATUS_OPTIONS` on the Position page (`/fptk`).
 *
 * Closed = terminal / exited pipeline: Close, Cancel, Internal Movement.
 * Open = all other currentStatus values (Open, Pending FKTK, Re-Open, Hold, empty, etc.).
 */

export function normalizeUiCurrentStatus(value?: string | null): string {
  return (value || '').trim().toLowerCase()
}

/** Same semantics as Position page chips: Close, Cancel, Internal Movement */
export function isFptkClosedByCurrentStatus(currentStatus?: string | null): boolean {
  const s = normalizeUiCurrentStatus(currentStatus)
  return s === 'close' || s === 'cancel' || s === 'internal movement'
}

export function isFptkOpenByCurrentStatus(currentStatus?: string | null): boolean {
  return !isFptkClosedByCurrentStatus(currentStatus)
}

export function displayFptkCurrentStatus(currentStatus?: string | null): string {
  const raw = (currentStatus || '').trim()
  return raw || 'Pending FKTK'
}
