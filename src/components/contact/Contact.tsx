import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { CONTACT_SECTION } from '../../data/contact'
import { PROFILE, getContactChannels } from '../../data/profile'
import { cx } from '../../utils/cx'
import { Eyebrow } from '../ui/Eyebrow'
import { Icon } from '../ui/Icon'
import { IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { Reveal } from '../ui/Reveal'
import { RevealText } from '../ui/RevealText'
import { Section } from '../ui/Section'
import { BODY, FOCUS_RING, HEADING_BASE, LABEL } from '../ui/typography'
import { ContactForm } from './ContactForm'

const CHANNELS = getContactChannels()

/** "Contact" in the header navigation (and the hero CTA) point here. */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6 lg:col-span-5">
          <Reveal y={12}>
            <Eyebrow>{CONTACT_SECTION.label}</Eyebrow>
          </Reveal>
          <RevealText
            id="contact-title"
            text={CONTACT_SECTION.title}
            className={cx(HEADING_BASE, 'text-[clamp(2.1rem,4.6vw,4.25rem)]')}
          />
          <Reveal delay={0.2}>
            <p className={cx(BODY, 'mt-8 max-w-md')}>{CONTACT_SECTION.intro}</p>
          </Reveal>

          <motion.ul
            aria-label="Contact details"
            className="mt-12 border-t border-neutral-200"
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
            variants={stagger(0.08, 0.2)}
          >
            {CHANNELS.map((channel) => (
              <motion.li key={channel.label} variants={fadeUp} className="border-b border-neutral-200">
                <a
                  href={channel.href}
                  {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center justify-between gap-6 py-5 focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className={cx('block text-neutral-400', LABEL)}>{channel.label}</span>
                    <span className="mt-1.5 block truncate text-base font-medium text-neutral-950 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-focus-visible:underline group-focus-visible:underline-offset-4 motion-reduce:transition-none md:text-lg">
                      {channel.display}
                    </span>
                    {channel.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-950 transition-colors duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white group-focus-visible:border-neutral-950 group-focus-visible:bg-neutral-950 group-focus-visible:text-white">
                    {channel.label === 'Email' ? (
                      <Icon name="mail" className="size-4" />
                    ) : channel.label === 'GitHub' ? (
                      <Icon name="github" className="size-4" />
                    ) : (
                      <Icon name="linkedin" className="size-3.5" />
                    )}
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
          <Reveal delay={0.3} className="mt-5">
            <CopyEmailButton />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  )
}

/** Handy when no mail app is configured: copies the address in one click. */
function CopyEmailButton() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard unavailable (e.g. insecure context): the mailto link remains.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        'inline-flex cursor-pointer items-center gap-2 rounded-full text-xs text-neutral-500 transition-colors duration-300 hover:text-neutral-950',
        FOCUS_RING,
      )}
    >
      <Icon name={copied ? 'check' : 'copy'} className="size-3.5" />
      <span aria-live="polite">{copied ? 'Email address copied' : 'Copy email address'}</span>
    </button>
  )
}
