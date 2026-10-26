import { useMemo } from 'react'
import { motion } from 'motion/react'
import { buildSteps } from './staircaseGeometry'

interface StaircasePathProps {
  /** 0-based index of the currently active step (-1 = none). */
  activeStep: number
  /** True during the completion reveal. */
  revealAll: boolean
}

export function StaircasePath({ activeStep, revealAll }: StaircasePathProps) {
  const steps = useMemo(() => buildSteps(10), [])

  return (
    <g>
      {steps.map((step, i) => {
        // Determine visibility: only the active step and its immediate
        // neighbours get any opacity; everything else stays dark.
        const distance = Math.abs(i - activeStep)
        let stepOpacity: number
        if (revealAll) {
          stepOpacity = 0.85
        } else if (distance === 0) {
          stepOpacity = 0.7
        } else if (distance === 1) {
          stepOpacity = 0.25
        } else {
          stepOpacity = 0
        }

        return (
          <g key={i}>
            {/* Step surface */}
            <motion.rect
              x={step.x}
              y={step.y}
              width={step.w}
              height={step.h}
              rx={3}
              fill="none"
              stroke={revealAll ? '#00e5ff' : '#3a3f47'}
              strokeWidth={1.5}
              animate={{ opacity: stepOpacity }}
              transition={{ duration: 0.4 }}
            />

            {/* Step number */}
            <motion.text
              x={step.x + step.w / 2}
              y={step.y - 8}
              textAnchor="middle"
              fill="#3a3f47"
              fontSize={11}
              fontFamily="ui-monospace, Consolas, monospace"
              animate={{ opacity: stepOpacity * 0.7 }}
              transition={{ duration: 0.4 }}
            >
              {step.num}
            </motion.text>
          </g>
        )
      })}
    </g>
  )
}

