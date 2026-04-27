'use client'

import { create } from 'zustand'

import { getTourKeyForPathname, type TourRouteKey } from '@/lib/tour/tourConfig'

const TOUR_LSK = 'tas_guided_tour_dismissed'

type TourState = {
  run: boolean
  unavailable: boolean
  startCurrentPage: () => void
  stop: () => void
}

export const useTourStore = create<TourState>((set) => ({
  run: false,
  unavailable: false,

  startCurrentPage: () => {
    if (typeof window === 'undefined') return
    const key = getTourKeyForPathname(window.location.pathname)
    if (!key) {
      set({ unavailable: true })
      window.setTimeout(() => set({ unavailable: false }), 4500)
      return
    }
    set({ run: true, unavailable: false })
  },

  stop: () => set({ run: false }),
}))

export const readTourDismissal = (key: TourRouteKey): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(TOUR_LSK)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return !!parsed[key]
  } catch {
    return false
  }
}

export const persistTourDismissal = (key: TourRouteKey) => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(TOUR_LSK)
    const prev = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    window.localStorage.setItem(TOUR_LSK, JSON.stringify({ ...prev, [key]: true }))
  } catch {
    // ignore
  }
}
