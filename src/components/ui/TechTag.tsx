import { cx } from '../../utils/cx'

interface TechTagProps {
  label: string
  /** Selected state, for tags that filter content. */
  active?: boolean
  /** Makes the tag a toggle button. */
  onToggle?: (label: string) => void
}

const BASE =
  'group/tag inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs leading-none font-medium whitespace-nowrap transition-colors duration-300'

/** Hairline technology pill; becomes a toggle when `onToggle` is provided. */
export function TechTag({ label, active = false, onToggle }: TechTagProps) {
  const tone = active
    ? 'border-neutral-950 bg-neutral-950 text-white'
    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950'
  const dot = (
    <span
      aria-hidden
      className={cx(
        'size-1 rounded-full bg-current transition-opacity duration-300',
        active ? 'opacity-100' : 'opacity-40 group-hover/tag:opacity-100',
      )}
    />
  )

  if (!onToggle) {
    return (
      <span className={cx(BASE, tone)}>
        {dot}
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(label)}
      className={cx(
        BASE,
        tone,
        'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
      )}
    >
      {dot}
      {label}
    </button>
  )
}
