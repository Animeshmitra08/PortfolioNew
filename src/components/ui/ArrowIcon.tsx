import { cx } from '../../utils/cx'

export type ArrowDirection = 'right' | 'left' | 'up' | 'up-right'

const PATHS: Record<ArrowDirection, string> = {
  right: 'M2.5 8h11M9 3.5 13.5 8 9 12.5',
  left: 'M13.5 8h-11M7 3.5 2.5 8 7 12.5',
  up: 'M8 13.5v-11M3.5 7 8 2.5 12.5 7',
  'up-right': 'M4.5 11.5l7-7M5.5 4.5h6v6',
}

// The visible arrow leaves in its own direction while a twin slides in behind
// it. Triggered by the nearest ancestor with the `group` class.
const SWAP: Record<ArrowDirection, { exit: string; enter: string }> = {
  right: {
    exit: 'group-hover:translate-x-[110%] group-focus-visible:translate-x-[110%]',
    enter: '-translate-x-[110%]',
  },
  left: {
    exit: 'group-hover:-translate-x-[110%] group-focus-visible:-translate-x-[110%]',
    enter: 'translate-x-[110%]',
  },
  up: {
    exit: 'group-hover:-translate-y-[110%] group-focus-visible:-translate-y-[110%]',
    enter: 'translate-y-[110%]',
  },
  'up-right': {
    exit: 'group-hover:translate-x-[110%] group-hover:-translate-y-[110%] group-focus-visible:translate-x-[110%] group-focus-visible:-translate-y-[110%]',
    enter: '-translate-x-[110%] translate-y-[110%]',
  },
}

const MOTION =
  'absolute inset-0 size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'

interface ArrowIconProps {
  direction?: ArrowDirection
  className?: string
}

export function ArrowIcon({ direction = 'right', className }: ArrowIconProps) {
  const arrow = (
    <path
      d={PATHS[direction]}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
  return (
    <span aria-hidden className={cx('relative inline-block size-[1em] shrink-0 overflow-hidden', className)}>
      <svg viewBox="0 0 16 16" className={cx(MOTION, SWAP[direction].exit)}>
        {arrow}
      </svg>
      <svg
        viewBox="0 0 16 16"
        className={cx(
          MOTION,
          SWAP[direction].enter,
          'group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0',
        )}
      >
        {arrow}
      </svg>
    </span>
  )
}
