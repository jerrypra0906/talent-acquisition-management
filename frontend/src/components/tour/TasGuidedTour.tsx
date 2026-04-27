'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Joyride, defaultLocale, EVENTS, type EventData, type Step, type TooltipRenderProps } from 'react-joyride'

import { getTourKeyForPathname, TOUR_STEPS } from '@/lib/tour/tourConfig'
import { useTourStore } from '@/stores/tourStore'

import { TasTourTooltip } from './TasTourTooltip'

export function TasGuidedTour() {
  const pathname = usePathname()
  const run = useTourStore((s) => s.run)
  const stop = useTourStore((s) => s.stop)
  const tourKey = getTourKeyForPathname(pathname)
  const steps: Step[] = useMemo(
    () => (tourKey ? TOUR_STEPS[tourKey] : []),
    [tourKey]
  )

  const shouldRun = Boolean(run && tourKey && steps.length > 0)
  const pathRef = useRef(pathname)

  useEffect(() => {
    if (run && pathRef.current !== pathname) {
      stop()
    }
    pathRef.current = pathname
  }, [pathname, run, stop])

  const onEvent = useCallback(
    (data: EventData) => {
      if (data.type === EVENTS.TOUR_END) {
        stop()
      }
    },
    [stop]
  )

  if (!tourKey || steps.length === 0) {
    return null
  }

  return (
    <Joyride
      run={shouldRun}
      steps={steps}
      continuous
      scrollToFirstStep
      onEvent={onEvent}
      tooltipComponent={(p: TooltipRenderProps) => (
        <TasTourTooltip key={`${p.index}-${tourKey}`} {...p} tourKey={tourKey} />
      )}
      locale={{
        ...defaultLocale,
        back: 'Back',
        last: 'Finish',
        next: 'Next',
        nextWithProgress: 'Next ({current} of {total})',
        skip: 'Skip',
      }}
      options={{
        primaryColor: '#4f46e5',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(17, 24, 39, 0.5)',
        arrowColor: '#ffffff',
        zIndex: 10050,
        scrollOffset: 96,
        showProgress: false,
        buttons: ['back', 'skip', 'close', 'primary'],
        width: 400,
      }}
    />
  )
}
