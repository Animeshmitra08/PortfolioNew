/**
 * Type styles derived from the hero so new sections share its voice:
 * tight negative tracking on headings, small tracked uppercase labels and
 * relaxed grey body copy.
 */

/** Headline treatment without a size, for headings that need their own scale. */
export const HEADING_BASE = 'm-0 leading-[0.95] font-semibold tracking-[-0.045em] text-neutral-950'

/** Section headline: a step down from the hero's display headline. */
export const HEADING = `${HEADING_BASE} text-[clamp(2.25rem,5.6vw,5.25rem)]`

/** Same tracked uppercase label as the hero eyebrow. */
export const LABEL = 'text-[0.7rem] font-medium tracking-[0.22em] uppercase'

/** Hero supporting-copy style. */
export const BODY = 'text-sm leading-relaxed text-neutral-500 md:text-[0.95rem]'

/** Visible focus treatment for custom controls. */
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950'
