'use client'

import { useEffect, useRef } from 'react'

/** Stack of Escape handlers so nested modals close inner-first */
const stack: Array<() => void> = []
let listenerAttached = false

function attachGlobalListener() {
  if (typeof document === 'undefined' || listenerAttached) return
  listenerAttached = true
  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const top = stack[stack.length - 1]
      if (!top) return
      e.preventDefault()
      e.stopPropagation()
      top()
    },
    true
  )
}

/**
 * While `isActive` is true, pressing Escape invokes `onClose`.
 * Multiple active modals stack: the last mounted closes first (nested modals).
 */
export function useModalEscape(isActive: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isActive) return

    const handler = () => {
      onCloseRef.current()
    }

    stack.push(handler)
    attachGlobalListener()

    return () => {
      const i = stack.lastIndexOf(handler)
      if (i >= 0) stack.splice(i, 1)
    }
  }, [isActive])
}
