import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current `location.hash` (e.g. `#work`), kept in sync with navigation. */
export function useLocationHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
}
