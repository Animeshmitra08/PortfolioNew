import { Fragment } from 'react'
import { motion, type Variants } from 'motion/react'
import { EASE_OUT, IN_VIEW } from './motion'

const TAGS = { h2: motion.h2, h3: motion.h3, p: motion.p } as const

const WORD: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.8, ease: EASE_OUT } },
}

interface RevealTextProps {
  /** Use `\n` for deliberate line breaks. */
  text: string
  as?: keyof typeof TAGS
  id?: string
  className?: string
  delay?: number
}

/**
 * Headline whose words rise out of a mask as it enters the view. Screen
 * readers get the plain sentence; the animated copy is hidden from them.
 * Under reduced motion the words are simply shown (MotionConfig skips the
 * transform).
 */
export function RevealText({ text, as = 'h2', id, className, delay = 0 }: RevealTextProps) {
  const Tag = TAGS[as]
  const lines = text.split('\n')

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={IN_VIEW}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      <span className="sr-only">{lines.join(' ')}</span>
      <span aria-hidden="true" className="block">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.split(' ').map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                {/* Padding + matching negative margin keeps ascenders and descenders unclipped. */}
                <span className="-mt-[0.06em] -mb-[0.16em] inline-block overflow-hidden pt-[0.06em] pb-[0.16em] align-top">
                  <motion.span className="inline-block" variants={WORD}>
                    {word}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  )
}
