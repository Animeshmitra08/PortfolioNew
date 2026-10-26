import { useCallback, useEffect, useRef, useState } from 'react'

export interface LoadingState {
  /** 0-10 step index (10 = fully loaded). */
  step: number
  /** True once the app is ready to display. */
  complete: boolean
  /** True if loading failed or timed out. */
  error: boolean
}

/**
 * Tracks the application's real loading state.
 *
 * Since the heavy payload is the lazy-loaded Three.js scene (loaded via
 * `React.lazy` + `<Suspense>`), this hook exposes a `markReady` callback
 * that the app calls once the suspense boundary resolves.
 *
 * The step counter runs an indeterminate cycle (steps 1→8) while loading,
 * then snaps through 9→10 on completion.
 *
 * A safety timeout prevents the user from being stuck on the loader
 * indefinitely (default 10 s).
 */
export function useLoadingProgress(timeoutMs = 10000): LoadingState & {
  markReady: () => void
  markError: () => void
} {
  const [state, setState] = useState<LoadingState>({
    step: 0,
    complete: false,
    error: false,
  })

  const readyRef = useRef(false)

  const markReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    // Animate through the final steps
    setState((s) => (s.complete ? s : { step: 9, complete: false, error: false }))
    // Then complete at step 10
    setTimeout(() => {
      setState({ step: 10, complete: true, error: false })
    }, 600)
  }, [])

  const markError = useCallback(() => {
    readyRef.current = true
    setState({ step: 10, complete: true, error: true })
  }, [])

  // Indeterminate step cycling while loading
  useEffect(() => {
    if (readyRef.current) return

    let current = 0
    const interval = setInterval(() => {
      if (readyRef.current) return
      current = current >= 8 ? 1 : current + 1
      setState({ step: current, complete: false, error: false })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!readyRef.current) {
        markReady()
      }
    }, timeoutMs)
    return () => clearTimeout(timer)
  }, [timeoutMs, markReady])

  return { ...state, markReady, markError }
}

