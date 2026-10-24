import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import type { PointerState } from './pointer'
import { CAMERA_FOV, CAMERA_Z, MAX_DELTA, NET_PLANE_Z, getCubeDiameter } from './sceneConfig'

/** Target on-screen distance between neighbouring nodes, in CSS pixels. */
const NODE_SPACING_PX = 54
/** Extra coverage so camera parallax never reveals the mesh edges. */
const COVERAGE = 1.25

// Shared displacement / reveal logic for both the nodes and the lines.
const vertexCommon = /* glsl */ `
  uniform vec2 uPointer;
  uniform float uRadius;
  uniform float uReveal;
  uniform float uStrength;
  uniform float uRipple;
  uniform float uTime;
  uniform float uClearRadius;
  uniform float uIdle;

  attribute float aSeed;
  varying float vAlpha;

  float displaceAndReveal(inout vec3 p) {
    vec2 offset = p.xy - uPointer;
    float dist = length(offset);
    vec2 dir = dist > 0.0001 ? offset / dist : vec2(0.0);

    // 1 at the cursor, easing to 0 at the edge of the interaction radius.
    float influence = 1.0 - smoothstep(0.0, uRadius, dist);
    influence *= influence;

    float wave = sin(dist * 4.5 - uTime * 2.6 + aSeed * 0.6);
    float push = uStrength * influence;
    float ripple = uRipple * influence * wave;

    p.xy += dir * (push + ripple);
    p.z += push * 0.5 + ripple;

    // Visibility uses a wider, softer falloff than the displacement so the
    // revealed patch reads clearly around the cursor.
    float visibility = 1.0 - smoothstep(0.0, uRadius * 1.35, dist);

    // Keep a calm halo around the cube so the mesh never competes with it.
    float clear = mix(0.35, 1.0, smoothstep(uClearRadius * 0.7, uClearRadius * 1.4, length(p.xy)));
    float shimmer = 0.85 + 0.15 * sin(uTime * 0.7 + aSeed * 6.2831);

    vAlpha = min(1.0, (uIdle + uReveal * visibility) * clear * shimmer);
    return influence;
  }
`

const pointsVertex = /* glsl */ `
  ${vertexCommon}
  uniform float uSize;
  uniform float uPixelRatio;

  void main() {
    vec3 p = position;
    float influence = displaceAndReveal(p);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 + influence * uReveal * 0.9);
  }
`

const linesVertex = /* glsl */ `
  ${vertexCommon}

  void main() {
    vec3 p = position;
    displaceAndReveal(p);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const pointsFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * vAlpha * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`

const linesFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float alpha = vAlpha * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`

/** Small deterministic PRNG so the lattice jitter is stable across resizes. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds a jittered, triangulated lattice: each node connects to its right and
 * lower neighbours plus one diagonal per cell, giving an even, non-crossing net.
 */
function buildNet(width: number, height: number, spacing: number) {
  const cols = Math.max(2, Math.ceil(width / spacing) + 1)
  const rows = Math.max(2, Math.ceil(height / spacing) + 1)
  const random = mulberry32(7)
  const jitter = spacing * 0.32

  const nodes = new Float32Array(cols * rows * 3)
  const seeds = new Float32Array(cols * rows)
  const originX = -((cols - 1) * spacing) / 2
  const originY = -((rows - 1) * spacing) / 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      nodes[i * 3] = originX + col * spacing + (random() - 0.5) * 2 * jitter
      nodes[i * 3 + 1] = originY + row * spacing + (random() - 0.5) * 2 * jitter
      nodes[i * 3 + 2] = (random() - 0.5) * 0.3
      seeds[i] = random()
    }
  }

  const segments: number[] = []
  const link = (a: number, b: number) => segments.push(a, b)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      const hasRight = col < cols - 1
      const hasUp = row < rows - 1
      if (hasRight) link(i, i + 1)
      if (hasUp) link(i, i + cols)
      if (hasRight && hasUp) {
        if ((row + col) % 2 === 0) link(i, i + cols + 1)
        else link(i + 1, i + cols)
      }
    }
  }

  const linePositions = new Float32Array(segments.length * 3)
  const lineSeeds = new Float32Array(segments.length)
  segments.forEach((node, v) => {
    linePositions[v * 3] = nodes[node * 3]
    linePositions[v * 3 + 1] = nodes[node * 3 + 1]
    linePositions[v * 3 + 2] = nodes[node * 3 + 2]
    lineSeeds[v] = seeds[node]
  })

  const points = new BufferGeometry()
  points.setAttribute('position', new Float32BufferAttribute(nodes, 3))
  points.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))

  const lines = new BufferGeometry()
  lines.setAttribute('position', new Float32BufferAttribute(linePositions, 3))
  lines.setAttribute('aSeed', new Float32BufferAttribute(lineSeeds, 1))

  return { points, lines }
}

function createUniforms(color: string, opacity: number, idle: number) {
  return {
    uPointer: { value: new Vector2(0, 0) },
    uRadius: { value: 1.5 },
    uReveal: { value: 0 },
    uStrength: { value: 0 },
    uRipple: { value: 0 },
    uTime: { value: 0 },
    uClearRadius: { value: 1 },
    uIdle: { value: idle },
    uColor: { value: new Color(color) },
    uOpacity: { value: opacity },
    uSize: { value: 3 },
    uPixelRatio: { value: 1 },
  }
}

// Scratch objects for projecting the pointer onto the mesh plane.
const raycaster = new Raycaster()
const ndc = new Vector2()
const hit = new Vector3()
const meshPlane = new Plane(new Vector3(0, 0, 1), -NET_PLANE_Z)

interface NetMeshProps {
  pointerRef: RefObject<PointerState>
  reducedMotion: boolean
}

export function NetMesh({ pointerRef, reducedMotion }: NetMeshProps) {
  const size = useThree((state) => state.size)
  const viewport = useThree((state) => state.viewport)

  // World-space size of the view frustum at the mesh plane.
  const planeDistance = CAMERA_Z - NET_PLANE_Z
  const planeHeight = 2 * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2)) * planeDistance
  const planeWidth = planeHeight * (size.width / Math.max(size.height, 1))
  const pixelsPerUnit = Math.max(size.height, 1) / planeHeight
  const spacing = NODE_SPACING_PX / pixelsPerUnit
  // Quantise so tiny resizes don't rebuild the geometry.
  const gridWidth = Math.ceil((planeWidth * COVERAGE) / spacing) * spacing
  const gridHeight = Math.ceil((planeHeight * COVERAGE) / spacing) * spacing
  const gridSpacing = Math.round(spacing * 100) / 100

  const net = useMemo(
    () => buildNet(gridWidth, gridHeight, gridSpacing),
    [gridWidth, gridHeight, gridSpacing],
  )
  useEffect(
    () => () => {
      net.points.dispose()
      net.lines.dispose()
    },
    [net],
  )

  // color, peak opacity, idle opacity (a faint resting net, fully revealed near the cursor)
  const pointUniforms = useMemo(() => createUniforms('#4a4a50', 0.95, 0.14), [])
  const lineUniforms = useMemo(() => createUniforms('#7c7c83', 0.8, 0.09), [])

  // Cube silhouette radius projected onto the mesh plane.
  const clearRadius =
    (getCubeDiameter(viewport.width, viewport.height) / 2) * (planeDistance / CAMERA_Z)

  const groupRef = useRef<Group>(null)
  const pointsMaterialRef = useRef<ShaderMaterial>(null)
  const linesMaterialRef = useRef<ShaderMaterial>(null)

  useFrame((state, rawDelta) => {
    const pointsMaterial = pointsMaterialRef.current
    const linesMaterial = linesMaterialRef.current
    const group = groupRef.current
    if (!pointsMaterial || !linesMaterial || !group) return

    const delta = Math.min(rawDelta, MAX_DELTA)
    const p = pointerRef.current

    // Project the smoothed pointer onto the mesh plane.
    ndc.set(p.x, p.y)
    raycaster.setFromCamera(ndc, state.camera)
    const projected = raycaster.ray.intersectPlane(meshPlane, hit)

    const energy = p.energy
    const presence = p.presence
    const motion = reducedMotion ? 0 : 1

    // Faint reveal while resting inside the hero, full reveal while moving.
    const reveal = presence
    // The interaction region widens with stronger movement.
    const radius = (0.7 + 1.2 * energy) * Math.max(0.75, Math.min(1.2, planeHeight / 8))
    const strength = (0.12 + 0.28 * energy) * presence * motion
    const ripple = (0.03 + 0.07 * energy) * presence * motion

    // Shaders work in the group's local space, which `swell` scales slightly.
    const localScale = group.scale.x
    for (const material of [pointsMaterial, linesMaterial]) {
      const u = material.uniforms
      if (projected) u.uPointer.value.set(hit.x / localScale, hit.y / localScale)
      u.uReveal.value = reveal
      u.uRadius.value = radius
      u.uStrength.value = strength
      u.uRipple.value = ripple
      u.uClearRadius.value = clearRadius
      if (!reducedMotion) u.uTime.value += delta
    }
    pointsMaterial.uniforms.uPixelRatio.value = state.gl.getPixelRatio()

    // Very slight swell of the whole net during energetic movement.
    const swell = 1 + 0.025 * energy * presence * motion
    group.scale.setScalar(MathUtils.damp(group.scale.x, swell, 3, delta))
  })

  return (
    <group ref={groupRef} position={[0, 0, NET_PLANE_Z]}>
      <lineSegments geometry={net.lines} frustumCulled={false} renderOrder={-2}>
        <shaderMaterial
          ref={linesMaterialRef}
          uniforms={lineUniforms}
          vertexShader={linesVertex}
          fragmentShader={linesFragment}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <points geometry={net.points} frustumCulled={false} renderOrder={-1}>
        <shaderMaterial
          ref={pointsMaterialRef}
          uniforms={pointUniforms}
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
