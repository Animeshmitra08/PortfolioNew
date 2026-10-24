import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  BoxGeometry,
  Group,
  MathUtils,
  Mesh,
  type EulerOrder,
  type Object3D,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import cubeUrl from '../../assets/models/cube.glb?url'
import type { PointerState } from './pointer'
import { MAX_DELTA, getCubeDiameter, getCubeScale } from './sceneConfig'

/**
 * The GLB's active scene holds three nodes: a zero-scaled bevel cube, the
 * visible cube ("Cube emiter") and a 2× enclosing box that was a Blender
 * particle-emitter volume. Only the visible cube is rendered here — the
 * enclosing box would otherwise hide it entirely.
 */
const CUBE_NODE = 'Cube emiter'

function findCubeGeometry(root: Object3D): BufferGeometry {
  // GLTFLoader sanitises node names (spaces become underscores).
  const node =
    root.getObjectByName(CUBE_NODE) ?? root.getObjectByName(CUBE_NODE.replace(/\s/g, '_'))
  if (node instanceof Mesh) return node.geometry as BufferGeometry
  return new BoxGeometry(2, 2, 2)
}

// Rotates the cube so it balances on a vertex with its body diagonal vertical:
// 45° around Y, then atan(√2) around Z (hence the ZYX order).
const VERTEX_UP_ROTATION: [number, number, number, EulerOrder] = [
  0,
  Math.PI / 4,
  Math.atan(Math.SQRT2),
  'ZYX',
]

// Leans the top vertex toward the camera so three faces stay in view.
const BASE_TILT = 0.36

interface MetalCubeProps {
  pointerRef: RefObject<PointerState>
  reducedMotion: boolean
}

export function MetalCube({ pointerRef, reducedMotion }: MetalCubeProps) {
  const gltf = useLoader(GLTFLoader, cubeUrl)
  const geometry = useMemo(() => findCubeGeometry(gltf.scene), [gltf])

  const viewport = useThree((state) => state.viewport)
  const baseScale = getCubeScale(viewport.width, viewport.height)
  // Cube radius in normalised (-1..1) vertical units, for cursor proximity.
  const proximityRadius = getCubeDiameter(viewport.width, viewport.height) / viewport.height

  const floatRef = useRef<Group>(null)
  const tiltRef = useRef<Group>(null)
  const spinRef = useRef<Group>(null)

  useFrame((state, rawDelta) => {
    const float = floatRef.current
    const tilt = tiltRef.current
    const spin = spinRef.current
    if (!float || !tilt || !spin) return

    const delta = Math.min(rawDelta, MAX_DELTA)
    const time = state.clock.elapsedTime
    const p = pointerRef.current
    // Real cursors drive the cube; the touch-device drift only drives the mesh.
    const follow = p.ghost ? 0 : p.presence
    const motion = reducedMotion ? 0.35 : 1

    // Idle spin around the vertical axis plus a slow breathing wobble.
    if (!reducedMotion) {
      spin.rotation.y += delta * 0.28
      spin.rotation.x = Math.sin(time * 0.35) * 0.08
    }

    // Rotate toward the cursor and roll slightly in the direction of travel.
    tilt.rotation.y = MathUtils.damp(tilt.rotation.y, p.x * 0.6 * follow * motion, 3.5, delta)
    tilt.rotation.x = MathUtils.damp(
      tilt.rotation.x,
      BASE_TILT - p.y * 0.45 * follow * motion,
      3.5,
      delta,
    )
    tilt.rotation.z = MathUtils.damp(tilt.rotation.z, -p.x * 0.12 * follow * motion, 3, delta)
    tilt.position.x = MathUtils.damp(tilt.position.x, p.x * 0.1 * follow * motion, 3, delta)
    tilt.position.y = MathUtils.damp(tilt.position.y, p.y * 0.07 * follow * motion, 3, delta)

    // Gentle float.
    float.position.y = reducedMotion ? 0 : Math.sin(time * 0.9) * baseScale * 0.06

    // Subtle swell as the cursor approaches the object.
    const aspect = viewport.width / viewport.height
    const distance = Math.hypot(p.x * aspect, p.y)
    const proximity =
      (1 - MathUtils.smoothstep(distance, proximityRadius * 0.6, proximityRadius * 1.8)) * follow
    const targetScale = baseScale * (1 + 0.07 * proximity)
    const scale = reducedMotion
      ? targetScale
      : MathUtils.damp(float.scale.x, targetScale, 4, delta)
    float.scale.setScalar(scale)
  })

  return (
    // Starts at zero scale so the cube eases in once the model has loaded.
    <group ref={floatRef} scale={0.001}>
      <group ref={tiltRef} rotation-x={BASE_TILT}>
        <group ref={spinRef}>
          <mesh geometry={geometry} rotation={VERTEX_UP_ROTATION}>
            {/* Bright metal base so the studio reflections read crisply. */}
            <meshPhysicalMaterial
              color="#c4c6cb"
              metalness={1}
              roughness={0.17}
              clearcoat={0.35}
              clearcoatRoughness={0.05}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
