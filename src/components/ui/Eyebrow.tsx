import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { LABEL } from './typography'

/** The hero's eyebrow: a short rule followed by a tracked uppercase label. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('mb-4 flex items-center gap-3 text-neutral-400', LABEL, className)}>
      <span aria-hidden className="h-px w-8 bg-neutral-300" />
      {children}
    </p>
  )
}
