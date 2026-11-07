import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Eyebrow } from './Eyebrow'
import { Reveal } from './Reveal'
import { RevealText } from './RevealText'
import { BODY, CONTAINER, HEADING } from './typography'

interface SectionProps {
  id: string
  labelledBy: string
  className?: string
  children: ReactNode
}

/**
 * Section on the hero's gutters, separated by a full-width hairline, with its
 * content held to the shared centred column.
 */
export function Section({ id, labelledBy, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx('relative border-t border-neutral-200 px-6 py-20 text-left md:px-10 md:py-24', className)}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  )
}

interface SectionHeaderProps {
  /** Id for the heading, referenced by the section's `aria-labelledby`. */
  id: string
  label: string
  title: string
  intro?: string
  className?: string
}

/**
 * Eyebrow + headline on the left, supporting copy bottom-right: the same
 * composition as the hero's lower band.
 */
export function SectionHeader({ id, label, title, intro, className }: SectionHeaderProps) {
  return (
    <div className={cx('grid gap-8 md:grid-cols-12 md:items-end', className)}>
      <div className="md:col-span-8 lg:col-span-7">
        <Reveal y={12}>
          <Eyebrow>{label}</Eyebrow>
        </Reveal>
        <RevealText id={id} text={title} className={HEADING} />
      </div>
      {intro && (
        <Reveal
          delay={0.2}
          className="max-w-sm md:col-span-4 md:col-start-9 md:justify-self-end"
        >
          <p className={BODY}>{intro}</p>
        </Reveal>
      )}
    </div>
  )
}
