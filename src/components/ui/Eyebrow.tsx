import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { LABEL } from './typography'

interface EyebrowProps {
  children: ReactNode
  /** A stronger grey for textured backgrounds, such as the speckled hero. */
  strong?: boolean
  className?: string
}

/** The hero's eyebrow: a short rule followed by a tracked uppercase label. */
export function Eyebrow({ children, strong = false, className }: EyebrowProps) {
  return (
    <p
      className={cx(
        'mb-4 flex items-center gap-3 text-balance',
        strong ? 'text-neutral-600' : 'text-neutral-400',
        LABEL,
        className,
      )}
    >
      <span aria-hidden className={cx('h-px w-8', strong ? 'bg-neutral-500' : 'bg-neutral-300')} />
      {children}
    </p>
  )
}
