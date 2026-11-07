import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { SECTIONS } from '../../data/navigation'
import { PROFILE, getContactChannels } from '../../data/profile'
import { cx } from '../../utils/cx'
import { EASE_OUT } from '../ui/motion'
import { TextLink } from '../ui/TextLink'
import { FOCUS_RING, LABEL } from '../ui/typography'

const CHANNELS = getContactChannels()

const PANEL: Variants = {
  closed: { opacity: 0, transition: { duration: 0.25, ease: EASE_OUT } },
  // Links arrive one after another, 60ms apart, in reading order.
  open: {
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_OUT, staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

/** Rises into place; under reduced motion it only fades. */
const itemVariants = (reducedMotion: boolean): Variants => ({
  closed: { opacity: 0, y: reducedMotion ? 0 : 16, transition: { duration: 0.2 } },
  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
})

/** One line of the menu icon: flat when closed, half of an X when open. */
const lineVariants = (direction: 1 | -1, reducedMotion: boolean): Variants => {
  const cross = { y: 3.25 * direction, rotate: 45 * direction }
  return {
    closed: reducedMotion ? cross : { y: 0, rotate: 0, transition: { duration: 0.3, ease: EASE_OUT } },
    open: { ...cross, transition: { duration: 0.5, ease: EASE_OUT } },
  }
}

const LINE = 'absolute left-0 block h-[1.5px] w-full rounded-full bg-current'

const GLYPH = 'relative block h-2 w-5'

/** Two lines; inside the open panel they turn into an X. */
function MenuGlyph({ reducedMotion, animated }: { reducedMotion?: boolean; animated?: boolean }) {
  if (!animated) {
    return (
      <span aria-hidden className={GLYPH}>
        <span className={cx(LINE, 'top-0')} />
        <span className={cx(LINE, 'bottom-0')} />
      </span>
    )
  }
  // Own animation, so the lines don't take slots in the panel's link stagger.
  return (
    <motion.span aria-hidden className={GLYPH} inherit={false} initial="closed" animate="open">
      <motion.span className={cx(LINE, 'top-0')} variants={lineVariants(1, !!reducedMotion)} />
      <motion.span className={cx(LINE, 'bottom-0')} variants={lineVariants(-1, !!reducedMotion)} />
    </motion.span>
  )
}

// Negative vertical margin keeps the 36px target from making the bar taller.
const ICON_BUTTON = cx(
  'relative -my-2 -mr-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-950',
  FOCUS_RING,
)

interface MobileMenuProps {
  /** Link of the section currently in view, marked as the current location. */
  activeHref: string | null
  reducedMotion: boolean
}

/**
 * Full-height menu for small screens, opened from the header bar. A native
 * modal dialog provides focus containment, Escape handling and an inert page.
 */
export function MobileMenu({ activeHref, reducedMotion }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // Section to scroll to once the panel has finished closing.
  const pendingHref = useRef<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog || dialog.open) return
    dialog.showModal()
    closeRef.current?.focus()
  }, [open])

  // Keep the page behind from scrolling while the menu is open.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [open])

  // Widening past the breakpoint hands over to the full header links.
  useEffect(() => {
    if (!open) return
    const media = window.matchMedia('(min-width: 48rem)')
    const handleChange = () => {
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [open])

  // Runs after the exit animation: close the dialog (focus returns to the
  // menu button), then go to the chosen section now the page can scroll.
  const finishClose = () => {
    dialogRef.current?.close()
    const href = pendingHref.current
    pendingHref.current = null
    if (!href) return
    // Same as following the link: scrolls, records history, fires hashchange.
    if (window.location.hash === href) document.querySelector(href)?.scrollIntoView()
    else window.location.assign(href)
  }

  const navigate = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    pendingHref.current = href
    setOpen(false)
  }

  const item = itemVariants(reducedMotion)

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cx(ICON_BUTTON, 'md:hidden')}
      >
        <MenuGlyph />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onCancel={(event) => {
          event.preventDefault()
          setOpen(false)
        }}
        // Browsers may still force-close (e.g. repeated Escape); resync.
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-neutral-950 backdrop:bg-transparent"
      >
        <AnimatePresence onExitComplete={finishClose}>
          {open && (
            <motion.div
              key="panel"
              className="flex min-h-full flex-col bg-white px-4 pt-4 pb-8"
              initial="closed"
              animate="open"
              exit="closed"
              variants={PANEL}
            >
              {/* Mirrors the header bar, so the close button lands where the menu button was. */}
              <div className="flex items-center justify-between px-6 py-3">
                <span className="flex items-center gap-3 text-base font-semibold tracking-[-0.01em]">
                  <span aria-hidden className="size-3 rotate-45 border-[1.5px] border-neutral-950" />
                  {PROFILE.name}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className={ICON_BUTTON}
                >
                  <MenuGlyph animated reducedMotion={reducedMotion} />
                </button>
              </div>

              <nav aria-label="Sections" className="mt-8 px-2">
                <ol className="border-t border-neutral-200">
                  {SECTIONS.map((link, index) => {
                    const current = link.href === activeHref
                    return (
                      <motion.li key={link.href} variants={item} className="border-b border-neutral-200">
                        <a
                          href={link.href}
                          onClick={navigate(link.href)}
                          aria-current={current ? 'location' : undefined}
                          className="group flex items-baseline gap-4 py-4 focus-visible:outline-none"
                        >
                          <span className="w-6 font-mono text-xs text-neutral-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={cx(
                              'text-3xl font-semibold tracking-[-0.035em] transition-colors duration-300 group-hover:text-neutral-950 group-focus-visible:underline group-focus-visible:decoration-2 group-focus-visible:underline-offset-8',
                              current ? 'text-neutral-950' : 'text-neutral-500',
                            )}
                          >
                            {link.label}
                          </span>
                        </a>
                      </motion.li>
                    )
                  })}
                </ol>
              </nav>

              <motion.div variants={item} className="mt-auto px-2 pt-12">
                <p className={cx('text-neutral-400', LABEL)}>Elsewhere</p>
                <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                  {CHANNELS.map((channel) => (
                    <li key={channel.label}>
                      <TextLink href={channel.href} external={channel.external}>
                        {channel.label}
                      </TextLink>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </>
  )
}
