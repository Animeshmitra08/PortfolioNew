import type { AnchorHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import { ArrowIcon, type ArrowDirection } from './ArrowIcon'

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Opens in a new tab and uses the diagonal arrow. */
  external?: boolean
  arrow?: ArrowDirection
}

/** The hero's "Start a project" link style: underlined label with a sliding arrow. */
export function TextLink({ external = false, arrow, className, children, ...rest }: TextLinkProps) {
  return (
    <a
      {...rest}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cx(
        'group inline-flex items-center gap-3 border-b border-neutral-300 pb-1 text-sm font-medium text-neutral-950 transition-colors duration-300 hover:border-neutral-950 focus-visible:border-neutral-950 focus-visible:outline-none',
        className,
      )}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
      <ArrowIcon direction={arrow ?? (external ? 'up-right' : 'right')} className="text-[0.8rem]" />
    </a>
  )
}
