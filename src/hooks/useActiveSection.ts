import { useEffect, useState } from 'react'

/**
 * Id of the section crossing a line 40% of the way down the viewport, or null
 * when none does (e.g. while the hero fills the screen). Sections never
 * overlap, so at most one crosses the line at a time.
 *
 * `ids` should be a stable array (e.g. a module constant).
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const crossing = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id)
          else crossing.delete(entry.target.id)
        }
        setActive(ids.find((id) => crossing.has(id)) ?? null)
      },
      // A zero-height band: the root box is just the line itself.
      { rootMargin: '-40% 0px -60% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids])

  return active
}
