import { motion, type HTMLMotionProps } from 'motion/react'
import { EASE_OUT, IN_VIEW } from './motion'

interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'> {
  delay?: number
  /** Rise distance in px. */
  y?: number
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ delay = 0, y = 28, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      {...props}
    />
  )
}
