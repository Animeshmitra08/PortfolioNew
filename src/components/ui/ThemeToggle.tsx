import { toggleTheme, useTheme } from '../../hooks/useTheme'
import { cx } from '../../utils/cx'
import { FOCUS_RING } from './typography'

/**
 * Switches between the dark and light themes. The half-filled circle turns
 * over as the theme flips, so the filled half always shows the current tone.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cx(
        'relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-950 transition-colors duration-300 hover:bg-neutral-950 hover:text-white',
        FOCUS_RING,
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        className={cx(
          'size-5 transition-transform duration-500 motion-reduce:transition-none',
          theme === 'light' && 'rotate-180',
        )}
      >
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  )
}
