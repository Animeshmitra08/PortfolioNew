import { useEffect, useRef, type RefObject } from 'react'

/**
 * Mutable pointer state shared between the DOM listeners and the R3F scene.
 * Lives in a ref so pointer movement never triggers React renders.
 * Coordinates are normalised to the hero container: -1..1, +y up.
 */
export interface PointerState {
  /** Raw pointer position, written by DOM events. */
  targetX: number
  targetY: number
  /** Smoothed pointer position, written once per frame by the driver. */
  x: number
  y: number
  /** Whether a fine pointer is currently over the hero. */
  inside: boolean
  /** 0..1 — eased version of `inside`, used to fade interactions in and out. */
  presence: number
  /** 0..1 — eased pointer speed; rises quickly on movement, settles slowly. */
  energy: number
  /** True when the position is an autonomous drift (touch devices), not a real cursor. */
  ghost: boolean
}

export function createPointerState(): PointerState {
  return {
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    inside: false,
    presence: 0,
    energy: 0,
    ghost: false,
  }
}

/**
 * Tracks a fine (mouse / pen) pointer relative to `targetRef`. Touch input is
 * ignored so scrolling on mobile never drags the scene around.
 */
export function usePointerTracker(
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): RefObject<PointerState> {
  const pointer = useRef<PointerState>(createPointerState())

  useEffect(() => {
    const element = targetRef.current
    const state = pointer.current
    if (!element || !enabled) {
      state.inside = false
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      state.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      state.targetY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      state.inside = true
    }
    const handleLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      state.inside = false
    }
    const handleBlur = () => {
      state.inside = false
    }

    element.addEventListener('pointerenter', handleMove)
    element.addEventListener('pointermove', handleMove, { passive: true })
    element.addEventListener('pointerleave', handleLeave)
    window.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('pointerenter', handleMove)
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('blur', handleBlur)
      state.inside = false
    }
  }, [targetRef, enabled])

  return pointer
}
