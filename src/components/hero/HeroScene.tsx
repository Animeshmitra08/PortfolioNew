import { Suspense, useEffect, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PMREMGenerator } from 'three'
import { MetalCube } from './MetalCube'
import { NetMesh } from './NetMesh'
import type { PointerState } from './pointer'
import { CAMERA_FOV, CAMERA_Z, MAX_DELTA } from './sceneConfig'
import { createStudioScene } from './studioEnvironment'

/**
 * Studio reflections generated locally (no HDR download), which keeps the
 * metal strictly monochrome.
 */
function StudioEnvironment() {
  const get = useThree((state) => state.get)

  useEffect(() => {
    const { gl, scene } = get()
    const pmrem = new PMREMGenerator(gl)
    const studio = createStudioScene()
    const envMap = pmrem.fromScene(studio.scene, 0.02).texture
    scene.environment = envMap
    studio.dispose()
    pmrem.dispose()
    return () => {
      if (scene.environment === envMap) scene.environment = null
      envMap.dispose()
    }
  }, [get])

  return null
}

interface DriverProps {
  pointerRef: RefObject<PointerState>
  ghost: boolean
}

/**
 * Single place where raw pointer input becomes eased values, so the cube and
 * the mesh always read a consistent, frame-rate independent state.
 */
function PointerDriver({ pointerRef, ghost }: DriverProps) {
  const previous = useRef({ x: 0, y: 0 })

  // Runs before the scene's other frame callbacks.
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA)
    if (delta <= 0) return
    const p = pointerRef.current
    const last = previous.current

    p.ghost = ghost
    if (ghost) {
      // Touch devices: a slow autonomous drift keeps the mesh gently alive.
      const t = state.clock.elapsedTime
      p.targetX = Math.sin(t * 0.21) * 0.6
      p.targetY = Math.sin(t * 0.29 + 1.3) * 0.45
      p.inside = true
    }

    const wasAway = p.presence < 0.02
    p.presence = MathUtils.damp(p.presence, p.inside ? 1 : 0, p.inside ? 3 : 1.6, delta)

    if (wasAway && p.inside) {
      // Re-entering: start from the entry point while everything is faded out,
      // so nothing visibly slides across the hero.
      p.x = p.targetX
      p.y = p.targetY
      last.x = p.targetX
      last.y = p.targetY
    } else {
      p.x = MathUtils.damp(p.x, p.targetX, 7, delta)
      p.y = MathUtils.damp(p.y, p.targetY, 7, delta)
    }

    const speed = Math.hypot(p.targetX - last.x, p.targetY - last.y) / delta
    last.x = p.targetX
    last.y = p.targetY

    const targetEnergy = ghost ? 0.3 : p.inside ? Math.min(speed / 2.5, 1) : 0
    // Fast attack, slow release: movement registers instantly and settles calmly.
    const lambda = targetEnergy > p.energy ? 5 : 1.1
    p.energy = MathUtils.damp(p.energy, targetEnergy, lambda, delta)
  }, -1)

  return null
}

interface CameraRigProps {
  pointerRef: RefObject<PointerState>
  reducedMotion: boolean
}

/** Subtle perspective shift toward the cursor; always looks at the cube. */
function CameraRig({ pointerRef, reducedMotion }: CameraRigProps) {
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA)
    const p = pointerRef.current
    const amount = p.ghost || reducedMotion ? 0 : p.presence
    const camera = state.camera
    camera.position.x = MathUtils.damp(camera.position.x, p.x * 0.35 * amount, 2.5, delta)
    camera.position.y = MathUtils.damp(camera.position.y, p.y * 0.25 * amount, 2.5, delta)
    camera.lookAt(0, 0, 0)
  })

  return null
}

interface HeroSceneProps {
  pointerRef: RefObject<PointerState>
  /** Pauses rendering entirely, e.g. when the hero is scrolled out of view. */
  active: boolean
  /** Fine pointer available; otherwise the mesh uses an autonomous drift. */
  interactive: boolean
  reducedMotion: boolean
  /** Lower pixel-ratio ceiling for touch / small devices. */
  lowPower: boolean
  className?: string
}

export function HeroScene({
  pointerRef,
  active,
  interactive,
  reducedMotion,
  lowPower,
  className,
}: HeroSceneProps) {
  return (
    <Canvas
      className={className}
      // Fills the hero; pointer input is tracked on the hero element instead.
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
      frameloop={active ? 'always' : 'never'}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <PointerDriver pointerRef={pointerRef} ghost={!interactive && !reducedMotion} />
      <CameraRig pointerRef={pointerRef} reducedMotion={reducedMotion} />
      <StudioEnvironment />

      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, 3]} intensity={0.35} />

      <NetMesh pointerRef={pointerRef} reducedMotion={reducedMotion} />
      <Suspense fallback={null}>
        <MetalCube pointerRef={pointerRef} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
