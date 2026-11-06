/**
 * Case studies live at `#work/<slug>`: shareable, work with Back/Forward, and
 * need no router. `useLocationHash` picks the change up.
 */
const PREFIX = '#work/'

/** Id of the case-study heading, which labels the dialog. */
export const CASE_STUDY_TITLE_ID = 'case-study-title'

export const projectHref = (slug: string) => `${PREFIX}${encodeURIComponent(slug)}`

export function slugFromHash(hash: string): string | null {
  return hash.startsWith(PREFIX) ? decodeURIComponent(hash.slice(PREFIX.length)) : null
}

/** Swap the hash without adding a history entry (and notify listeners). */
export function replaceHash(hash: string) {
  const url = hash ? hash : `${window.location.pathname}${window.location.search}`
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
