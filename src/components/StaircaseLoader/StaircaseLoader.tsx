import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { StaircasePath } from './StaircasePath'
import { MovingZero } from './MovingZero'
import type { LoadingState } from './useLoadingProgress'
import './StaircaseLoader.css'

interface StaircaseLoaderProps {
  loading: LoadingState
}

export function StaircaseLoader({ loading }: StaircaseLoaderProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // The step property is 0-10; map to 0-based staircase index (0–9)
  const stepIdx = Math.max(0, Math.min(loading.step - 1, 9))

  // Derive reveal / percent directly from loading state
  const isFinished = loading.step === 10 && loading.complete
  const revealAll = isFinished
  const showPercent = isFinished

  // Delay dismissal so the reveal animation has time to play (1.2 s).
  const [dismissed, setDismissed] = useState(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isFinished && !dismissed) {
      dismissTimerRef.current = setTimeout(() => setDismissed(true), 1200)
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [isFinished, dismissed])

  const visible = !dismissed

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="staircase-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <svg
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Loading application"
          >
            <StaircasePath
              activeStep={loading.step > 0 ? stepIdx : -1}
              revealAll={revealAll}
            />

            {loading.step > 0 && (
              <MovingZero
                targetStep={stepIdx}
                isComplete={loading.complete}
                showPercent={showPercent}
                reducedMotion={reducedMotion}
              />
            )}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

