import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { getStepCentres } from './staircaseGeometry'

const centres = getStepCentres()

// Neon glow CSS text-shadow layers (cool white + cyan)
const GLOW_BASE = [
  '0 0 4px rgba(255,255,255,0.95)',
  '0 0 8px rgba(0,229,255,0.8)',
  '0 0 20px rgba(0,229,255,0.5)',
  '0 0 40px rgba(0,229,255,0.25)',
].join(', ')

const GLOW_INTENSE = [
  '0 0 4px rgba(255,255,255,1)',
  '0 0 10px rgba(0,229,255,1)',
  '0 0 30px rgba(0,229,255,0.8)',
  '0 0 60px rgba(0,229,255,0.5)',
  '0 0 90px rgba(0,229,255,0.3)',
].join(', ')

interface MovingZeroProps {
  /** 0-based step index the digit should sit on. */
  targetStep: number
  /** True during completion reveal (step 10 = index 9). */
  isComplete: boolean
  /** Whether to show 100% */
  showPercent: boolean
  /** Respect prefers-reduced-motion. */
  reducedMotion: boolean
}

export function MovingZero({
  targetStep,
  isComplete,
  showPercent,
  reducedMotion,
}: MovingZeroProps) {
  const clampedIdx = Math.max(0, Math.min(targetStep, 9))
  const target = centres[clampedIdx]

  // Track landing to flash glow — use a ref to detect step changes
  // without calling setState synchronously in an effect body.
  const [landed, setLanded] = useState(false)
  const prevStepRef = useRef(clampedIdx)

  useEffect(() => {
    if (prevStepRef.current !== clampedIdx) {
      prevStepRef.current = clampedIdx
      // Schedule the flash on the next microtask to avoid synchronous setState
      const landTimer = setTimeout(() => setLanded(true), 0)
      const clearTimer = setTimeout(() => setLanded(false), 350)
      return () => {
        clearTimeout(landTimer)
        clearTimeout(clearTimer)
      }
    }
  }, [clampedIdx])

  const glowActive = landed || isComplete

  if (reducedMotion) {
    return (
      <g>
        <text
          x={target.cx}
          y={target.cy + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e0f7fa"
          fontSize={36}
          fontWeight={700}
          fontFamily="ui-monospace, Consolas, monospace"
          style={{ textShadow: GLOW_BASE } as CSSProperties}
        >
          0
        </text>
        {showPercent && (
          <text
            x={target.cx}
            y={target.cy + 38}
            textAnchor="middle"
            fill="#00e5ff"
            fontSize={14}
            fontFamily="ui-monospace, Consolas, monospace"
          >
            100%
          </text>
        )}
      </g>
    )
  }

  return (
    <g>
      <motion.g
        animate={{
          x: target.cx,
          // Lift up before landing: overshoot the target Y by going up first
          y: target.cy,
        }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 18,
          mass: 0.8,
          restDelta: 0.5,
        }}
      >
        {/* The "bounce" is achieved by animating through keyframes on y */}
        <motion.g
          key={clampedIdx}
          animate={{
            y: [-20, 0, -5, 0],
          }}
          transition={{
            duration: 0.6,
            times: [0, 0.4, 0.7, 1],
            ease: 'easeOut',
          }}
        >
          <motion.text
            x={0}
            y={2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#e0f7fa"
            fontSize={36}
            fontWeight={700}
            fontFamily="ui-monospace, Consolas, monospace"
            style={{
              textShadow: glowActive ? GLOW_INTENSE : GLOW_BASE,
              transition: 'text-shadow 0.3s ease',
              transformOrigin: 'center center',
            }}
            animate={{
              rotate: clampedIdx * 18,
            }}
            transition={{
              rotate: { type: 'spring', stiffness: 120, damping: 14 },
            }}
          >
            0
          </motion.text>
        </motion.g>

        {/* 100% label */}
        {showPercent && (
          <motion.text
            x={0}
            y={38}
            textAnchor="middle"
            fill="#00e5ff"
            fontSize={14}
            fontFamily="ui-monospace, Consolas, monospace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            100%
          </motion.text>
        )}
      </motion.g>
    </g>
  )
}
