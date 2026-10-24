export const CAMERA_FOV = 35
export const CAMERA_Z = 10

/** Depth of the net mesh plane — well behind the cube so it never intersects it. */
export const NET_PLANE_Z = -2.5

/** Clamp for frame deltas so tab switches / paused frameloops never cause jumps. */
export const MAX_DELTA = 1 / 20

const SQRT3 = Math.sqrt(3)

/**
 * Returns the cube's on-screen diameter in world units (at z = 0) for a viewport
 * of the given world-space size. The cube stands on a vertex, so its silhouette
 * height is the body diagonal (edge × √3).
 */
export function getCubeDiameter(viewportWidth: number, viewportHeight: number) {
  // Portrait screens get a little less height so the copy below keeps its room.
  const heightShare = viewportWidth < viewportHeight ? 0.32 : 0.38
  return Math.min(viewportHeight * heightShare, viewportWidth * 0.52)
}

/** The GLB cube spans -1..1, so its scale equals its half-edge length. */
export function getCubeScale(viewportWidth: number, viewportHeight: number) {
  return getCubeDiameter(viewportWidth, viewportHeight) / (2 * SQRT3)
}
