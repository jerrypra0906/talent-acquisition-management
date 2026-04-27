'use client'

import { useState, type MouseEventHandler } from 'react'
import type { TooltipRenderProps } from 'react-joyride'

import { type TourRouteKey } from '@/lib/tour/tourConfig'
import { persistTourDismissal } from '@/stores/tourStore'
import { cn } from '@/lib/utils'

type TasTourTooltipProps = TooltipRenderProps & { tourKey: TourRouteKey }

export function TasTourTooltip({
  backProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tourKey,
  tooltipProps,
}: TasTourTooltipProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const onPrimary: MouseEventHandler<HTMLElement> = (e) => {
    if (isLastStep && dontShowAgain) {
      persistTourDismissal(tourKey)
    }
    primaryProps.onClick(e)
  }

  return (
    <div
      {...tooltipProps}
      className="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-xl ring-1 ring-black/5"
    >
      {step.title != null && step.title !== '' && (
        <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
      )}
      <div className="mt-2 text-sm leading-relaxed text-gray-600">{step.content}</div>

      {isLastStep && (
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          Don&apos;t show this again
        </label>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">
          {index + 1} / {size}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {index > 0 && (
            <button
              type="button"
              {...backProps}
              className={cn(
                'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50',
                (backProps as { className?: string }).className
              )}
            />
          )}
          <button
            type="button"
            {...skipProps}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800',
              (skipProps as { className?: string }).className
            )}
          />
          <button
            type="button"
            {...primaryProps}
            onClick={onPrimary}
            className={cn(
              'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
              (primaryProps as { className?: string }).className
            )}
          />
        </div>
      </div>
    </div>
  )
}
