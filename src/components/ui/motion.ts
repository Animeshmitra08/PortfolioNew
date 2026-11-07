import type { Variants } from 'motion/react'

/** Calm ease-out shared by every reveal: quick start, long soft landing. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Reveal once, shortly after an element's top edge enters the viewport. */
export const IN_VIEW = { once: true, margin: '0px 0px -12% 0px' } as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

/** Parent variants that cascade `fadeUp` (or any child variants) in sequence. */
export function stagger(gap = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: gap, delayChildren: delay } },
  }
}
