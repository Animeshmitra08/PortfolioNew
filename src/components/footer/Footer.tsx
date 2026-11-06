import { useReducedMotion } from 'motion/react'
import { PROFILE, getContactChannels } from '../../data/profile'
import { cx } from '../../utils/cx'
import { ArrowIcon } from '../ui/ArrowIcon'
import { FOCUS_RING, LABEL } from '../ui/typography'

const YEAR = new Date().getFullYear()
const CHANNELS = getContactChannels()

// Labels follow the header navigation ("Studio" is the About section).
const SITEMAP = [
  { label: 'Studio', href: '#studio' },
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Experience', href: '#experience' },
  { label: 'Approach', href: '#approach' },
  { label: 'Contact', href: '#contact' },
]

const LINK =
  'group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-300 hover:text-neutral-950 focus-visible:text-neutral-950 focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none'

export function Footer() {
  const reducedMotion = useReducedMotion()

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
    // Clear the section hash so the header pill returns to its resting state.
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
    // Hand keyboard focus back to the top of the page.
    document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true })
  }

  return (
    <footer className="border-t border-neutral-200 px-6 pt-16 pb-8 text-left md:px-10 md:pt-24">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          {/* Same mark as the header logo. */}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              backToTop()
            }}
            className="inline-flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-950 focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none"
          >
            <span aria-hidden className="size-3 rotate-45 border-[1.5px] border-neutral-950" />
            {PROFILE.name}
          </a>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-500">{PROFILE.tagline}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
          <p className={cx('text-neutral-400', LABEL)}>Sitemap</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-1">
            {SITEMAP.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className={cx('text-neutral-400', LABEL)}>Elsewhere</p>
          <ul className="mt-5 grid gap-2.5">
            {CHANNELS.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={LINK}
                >
                  {channel.label}
                  {channel.external && <span className="sr-only"> (opens in a new tab)</span>}
                  <ArrowIcon direction="up-right" className="text-[0.65rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-col-reverse gap-5 border-t border-neutral-200 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between md:mt-24">
        <p>
          © {YEAR} {PROFILE.fullName}. All rights reserved.
        </p>
        <button
          type="button"
          onClick={backToTop}
          className={cx(
            'group inline-flex cursor-pointer items-center gap-2 self-start rounded-full text-xs text-neutral-500 transition-colors duration-300 hover:text-neutral-950 sm:self-auto',
            FOCUS_RING,
          )}
        >
          Back to top
          <span className="flex size-8 items-center justify-center rounded-full border border-neutral-200 transition-colors duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
            <ArrowIcon direction="up" className="text-[0.7rem]" />
          </span>
        </button>
      </div>
    </footer>
  )
}
