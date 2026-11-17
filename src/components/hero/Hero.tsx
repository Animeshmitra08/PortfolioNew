import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { PROFILE } from '../../data/profile'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTheme } from '../../hooks/useTheme'
import { cx } from '../../utils/cx'
import { Eyebrow } from '../ui/Eyebrow'
import { TextLink } from '../ui/TextLink'
import { EASE_IN_OUT, EASE_SOFT } from '../ui/motion'
import { BODY, CONTAINER } from '../ui/typography'
import { GlassHeader } from './GlassHeader'
import { usePointerTracker } from './pointer'

// three.js is loaded in its own chunk so the hero copy paints immediately.
const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

/*
 * Entrance, played as the opening screen's panels part: the copy rises into
 * focus line by line while the header settles in. Delays are timed so the
 * first line arrives as the panels clear the bottom-left corner.
 */
const COPY_DELAY_S = 0.7

const copyGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: COPY_DELAY_S } },
}

const copyItem = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 28, filter: reducedMotion ? 'none' : 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      y: { duration: 1.2, ease: EASE_IN_OUT },
      opacity: { duration: 1, ease: EASE_SOFT },
      filter: { duration: 1, ease: EASE_SOFT },
    },
  },
})

// Opacity only: a transform or filter here would detach the fixed header from the viewport.
const headerFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, delay: 0.5, ease: EASE_SOFT } },
}

interface HeroProps {
  /**
   * False while the opening screen still covers the page. Turning it true
   * plays the entrance; leave it out to show the hero immediately.
   */
  revealed?: boolean
}

export function Hero({ revealed = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const item = copyItem(reducedMotion)
  // Only start hidden if we mount behind the opening screen.
  const [startHidden] = useState(!revealed)
  const entrance = {
    initial: startHidden ? 'hidden' : false,
    animate: revealed ? 'visible' : 'hidden',
  } as const
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const pointer = usePointerTracker(heroRef, canHover)
  const dark = useTheme() === 'dark'

  // Stop rendering the scene while the hero is scrolled out of view.
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const element = heroRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      // speckled-surface: graphite with flecks (dark) or speckled paper (light).
      // z-40: the hero is its own stacking context (isolate), so it must sit
      // above later sections for the fixed header inside it to stay on top.
      className="relative isolate z-40 flex h-svh min-h-144 w-full flex-col overflow-hidden text-left text-neutral-950 speckled-surface"
    >
      {/* A light crossing the hero diagonally: the flecks show only in its trail (see index.css). */}
      <div aria-hidden className="hero-light" data-paused={!inView}>
        <div className="hero-light__axis">
          <div className="hero-light__sweep" />
        </div>
      </div>

      <Suspense fallback={null}>
        <HeroScene
          className="-z-10"
          pointerRef={pointer}
          active={inView}
          interactive={canHover}
          reducedMotion={reducedMotion}
          lowPower={!canHover}
          dark={dark}
        />
      </Suspense>

      <motion.div variants={headerFade} {...entrance}>
        <GlassHeader interactive={canHover} reducedMotion={reducedMotion} />
      </motion.div>

      {/* Leaves the visual centre of the hero to the cube. */}
      <div className="flex-1" />

      <div className="px-6 pb-8 md:px-10 md:pb-10">
        <motion.div
          className={cx(CONTAINER, 'grid gap-6 md:grid-cols-12 md:items-end md:gap-8')}
          variants={copyGroup}
          {...entrance}
        >
          <div className="md:col-span-7">
            <motion.div variants={item}>
              <Eyebrow strong>
                {PROFILE.fullName}, {PROFILE.role.toLowerCase()}
              </Eyebrow>
            </motion.div>
            <motion.h1
              variants={item}
              className="m-0 max-w-2xl text-4xl font-display font-normal tracking-normal text-balance text-neutral-950 sm:text-5xl lg:text-7xl"
            >
              Mobile apps and
              <br />
              3D experiences.
            </motion.h1>
          </div>

          <div className="max-w-sm md:col-span-4 md:col-start-9 md:justify-self-end">
            <motion.p variants={item} className={BODY}>
              I build Android and iOS apps with React Native and Expo, interactive 3D with React
              Three Fiber, and the API integrations that connect them to real systems.
            </motion.p>
            <motion.div variants={item}>
              <TextLink href="#work" className="mt-6">
                See selected work
              </TextLink>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
