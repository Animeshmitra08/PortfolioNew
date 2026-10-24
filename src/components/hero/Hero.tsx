import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { GlassHeader } from './GlassHeader'
import { usePointerTracker } from './pointer'

// three.js is loaded in its own chunk so the hero copy paints immediately.
const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

const NAV_LINKS = ['Work', 'Studio', 'Approach', 'Contact']

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const pointer = usePointerTracker(heroRef, canHover)

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
      className="relative isolate flex h-svh min-h-[36rem] w-full flex-col overflow-hidden bg-white text-left text-neutral-950"
    >
      <Suspense fallback={null}>
        <HeroScene
          className="-z-10"
          pointerRef={pointer}
          active={inView}
          interactive={canHover}
          reducedMotion={reducedMotion}
          lowPower={!canHover}
        />
      </Suspense>

      <GlassHeader links={NAV_LINKS} interactive={canHover} reducedMotion={reducedMotion} />

      {/* Leaves the visual centre of the hero to the cube. */}
      <div className="flex-1" />

      <div className="grid gap-5 px-6 pb-7 md:grid-cols-12 md:items-end md:gap-8 md:px-10 md:pb-10">
        <div className="md:col-span-7">
          <p className="mb-4 flex items-center gap-3 text-[0.7rem] font-medium tracking-[0.22em] text-neutral-400 uppercase">
            <span aria-hidden className="h-px w-8 bg-neutral-300" />
            Spatial design studio
          </p>
          <h1 className="m-0 text-[clamp(2.4rem,7.2vw,6.75rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-neutral-950">
            Pure form,
            <br />
            in motion.
          </h1>
        </div>

        <div className="max-w-sm md:col-span-4 md:col-start-9 md:justify-self-end">
          <p className="text-sm leading-relaxed text-neutral-500 md:text-[0.95rem]">
            We shape digital products and spatial interfaces with restraint, so every line has a
            purpose and every motion is considered.
          </p>
          <a
            href="#contact"
            className="group mt-5 inline-flex items-center gap-3 border-b border-neutral-300 pb-1 text-sm font-medium text-neutral-950 transition-colors duration-300 hover:border-neutral-950 focus-visible:border-neutral-950 focus-visible:outline-none"
          >
            Start a project
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
