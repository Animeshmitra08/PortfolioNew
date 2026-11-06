import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  window.addEventListener('resize', onChange)
  return () => {
    window.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
  }
}

/**
 * Whether the page has scrolled past `fraction` of the viewport height.
 * Only re-renders when the answer flips, not on every scroll event.
 */
export function useScrolledPast(fraction: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > window.innerHeight * fraction,
    () => false,
  )
}
