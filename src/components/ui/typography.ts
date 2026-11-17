/**
 * Type styles shared by every section, so the portfolio speaks in one voice:
 *   - Display (Exile): large headlines only. Single weight (400), so headings
 *     set `font-normal` and keep default tracking.
 *   - Sans (Geist): relaxed grey body copy.
 *   - Mono (Geist Mono): small tracked uppercase labels and indices.
 * Every size is a step on Tailwind's type scale.
 */

/** Headline treatment without a size, for headings that need their own scale. */
export const HEADING_BASE =
  'm-0 font-display font-normal tracking-normal text-balance text-neutral-950'

/** Section headline: a step down from the hero's display headline. */
export const HEADING = `${HEADING_BASE} text-4xl md:text-5xl lg:text-6xl xl:text-7xl`

/** Tracked uppercase label, set in mono like a spec sheet. */
export const LABEL = 'font-mono text-xs font-medium tracking-[0.18em] uppercase'

/** Hero supporting-copy style. */
export const BODY = 'text-sm leading-relaxed text-pretty text-neutral-500 md:text-base'

/** Visible focus treatment for custom controls. */
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950'

/** Centred content column shared by the header, hero copy, sections and footer. */
export const CONTAINER = 'mx-auto w-full max-w-7xl'
