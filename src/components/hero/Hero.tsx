import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { PROFILE } from '../../data/profile'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTheme } from '../../hooks/useTheme'
import { cx } from '../../utils/cx'
import { Eyebrow } from '../ui/Eyebrow'
import { TextLink } from '../ui/TextLink'
import { BODY, CONTAINER } from '../ui/typography'
import { GlassHeader } from './GlassHeader'
import { usePointerTracker } from './pointer'

// three.js is loaded in its own chunk so the hero copy paints immediately.
const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
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

      <GlassHeader interactive={canHover} reducedMotion={reducedMotion} />

      {/* Leaves the visual centre of the hero to the cube. */}
      <div className="flex-1" />

      <div className="px-6 pb-8 md:px-10 md:pb-10">
        <div className={cx(CONTAINER, 'grid gap-6 md:grid-cols-12 md:items-end md:gap-8')}>
          <div className="md:col-span-7">
            <Eyebrow strong>
              {PROFILE.fullName}, {PROFILE.role.toLowerCase()}
            </Eyebrow>
            <h1 className="m-0 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-balance text-neutral-950 sm:text-5xl lg:text-7xl">
              Mobile apps and
              <br />
              3D experiences.
            </h1>
          </div>

          <div className="max-w-sm md:col-span-4 md:col-start-9 md:justify-self-end">
            <p className={BODY}>
              I build Android and iOS apps with React Native and Expo, interactive 3D with React
              Three Fiber, and the API integrations that connect them to real systems.
            </p>
            <TextLink href="#work" className="mt-6">
              See selected work
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  )
}
