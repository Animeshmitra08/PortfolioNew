import { useCallback, useEffect, useRef, type RefObject } from 'react'

const LIGHT_ANGLE_VAR = '--ogui-glass-light-angle'
const LIGHT_X_VAR = '--glass-light-x'
const LIGHT_Y_VAR = '--glass-light-y'

/** Easing rate for the light position (per second); higher is snappier. */
const FOLLOW_RATE = 9

/**
 * Aims an OpenGlass surface's specular light at the cursor.
 *
 * The highlight is a conic sweep around the element's centre, so on a wide,
 * short bar the raw cursor angle would pin it to the middle or the ends.
 * Instead the light targets the point on the element's edge nearest the
 * cursor, which slides the highlight along the bar as the mouse moves. That
 * point is eased (not the angle), so the light never spins the long way round.
 *
 * Writes CSS variables straight onto the element — no React renders:
 * - `--ogui-glass-light-angle`: OpenGlass's light direction (0deg = top, clockwise)
 * - `--glass-light-x` / `--glass-light-y`: the lit point, for an optional sheen
 *
 * Returns a stable `refresh()` for elements that move on their own (e.g. an
 * animated indicator): call it as the element moves so the light keeps aiming
 * at a cursor that is standing still.
 */
export function useGlassLightFollow(
  targetRef: RefObject<HTMLElement | null>,
  { enabled, instant }: { enabled: boolean; instant: boolean },
): () => void {
  const refreshRef = useRef<() => void>(() => {})

  useEffect(() => {
    const element = targetRef.current
    if (!element || !enabled) return

    let width = element.offsetWidth
    let height = element.offsetHeight
    // Start with light from the upper left, close to OpenGlass's 340deg default.
    const current = { x: width * 0.3, y: 0 }
    const target = { ...current }
    let frame: number | null = null
    let lastTime = 0

    const write = () => {
      const dx = current.x - width / 2
      const dy = current.y - height / 2
      const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
      element.style.setProperty(LIGHT_ANGLE_VAR, `${angle.toFixed(2)}deg`)
      element.style.setProperty(LIGHT_X_VAR, `${current.x.toFixed(1)}px`)
      element.style.setProperty(LIGHT_Y_VAR, `${current.y.toFixed(1)}px`)
    }

    const step = (time: number) => {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60
      lastTime = time
      const ease = 1 - Math.exp(-FOLLOW_RATE * delta)
      current.x += (target.x - current.x) * ease
      current.y += (target.y - current.y) * ease

      if (Math.abs(target.x - current.x) < 0.25 && Math.abs(target.y - current.y) < 0.25) {
        current.x = target.x
        current.y = target.y
        write()
        frame = null
        lastTime = 0
        return
      }
      write()
      frame = requestAnimationFrame(step)
    }

    // Last known cursor position, in viewport coordinates.
    let pointer: { x: number; y: number } | null = null

    const aim = () => {
      if (!pointer) return
      const rect = element.getBoundingClientRect()
      width = rect.width
      height = rect.height
      // Nearest point on the element's box (the cursor itself when inside it).
      target.x = Math.min(Math.max(pointer.x - rect.left, 0), width)
      target.y = Math.min(Math.max(pointer.y - rect.top, 0), height)

      if (instant) {
        current.x = target.x
        current.y = target.y
        write()
      } else if (frame === null) {
        frame = requestAnimationFrame(step)
      }
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer = { x: event.clientX, y: event.clientY }
      aim()
    }

    write()
    window.addEventListener('pointermove', handleMove, { passive: true })
    refreshRef.current = aim

    return () => {
      refreshRef.current = () => {}
      window.removeEventListener('pointermove', handleMove)
      if (frame !== null) cancelAnimationFrame(frame)
      element.style.removeProperty(LIGHT_ANGLE_VAR)
      element.style.removeProperty(LIGHT_X_VAR)
      element.style.removeProperty(LIGHT_Y_VAR)
    }
  }, [targetRef, enabled, instant])

  return useCallback(() => refreshRef.current(), [])
}
