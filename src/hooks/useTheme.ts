import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

/**
 * The theme lives in `data-theme` on <html>. The inline script in index.html
 * sets it before first paint (dark unless the visitor chose light), so keep
 * the storage key and default here in sync with that script.
 */
const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'dark'
const CHANGE_EVENT = 'themechange'

/** Browser chrome colour (address bar on mobile), matching the page background. */
const THEME_COLOR: Record<Theme, string> = { dark: '#000000', light: '#ffffff' }

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (e.g. private mode): the choice lasts for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function toggleTheme() {
  setTheme(readTheme() === 'dark' ? 'light' : 'dark')
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/** The active theme. Most styling follows it through CSS alone; use this for canvas, WebGL and glass. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME)
}
