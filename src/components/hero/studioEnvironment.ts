import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  type Material,
} from 'three'

interface Panel {
  size: [number, number]
  position: [number, number, number]
  /** HDR intensity — values above 1 read as light sources once reflected. */
  intensity: number
}

/**
 * A minimal photo-studio: a dark room lit by a few white softboxes and strips.
 * Reflected in the metal, this gives deep graphite faces with crisp, strictly
 * monochrome highlight bands that sweep across the cube as it turns.
 */
const PANELS: Panel[] = [
  { size: [7, 5], position: [0, 6, 1], intensity: 2.6 }, // overhead softbox
  { size: [1.1, 7], position: [6, 0.5, 1.5], intensity: 4.5 }, // key strip, right
  { size: [0.7, 7], position: [-6, 0.5, -1], intensity: 2.2 }, // rim strip, left
  { size: [5, 1.4], position: [0, 1.5, 6], intensity: 1.4 }, // frontal fill
  { size: [3, 3], position: [-3, -1, -6], intensity: 0.9 }, // soft back bounce
]

/**
 * @param roomLevel Brightness of the room walls. Near black gives graphite
 *   faces (for a white page); a mid grey gives steel that holds its silhouette
 *   against a black page.
 */
export function createStudioScene(roomLevel = 0.035) {
  const scene = new Scene()
  const geometries = [new BoxGeometry(16, 16, 16), new PlaneGeometry(1, 1)]
  const materials: Material[] = []

  const roomMaterial = new MeshBasicMaterial({ color: new Color(roomLevel, roomLevel, roomLevel * 1.08), side: BackSide })
  materials.push(roomMaterial)
  scene.add(new Mesh(geometries[0], roomMaterial))

  for (const panel of PANELS) {
    const material = new MeshBasicMaterial({
      color: new Color(1, 1, 1).multiplyScalar(panel.intensity),
      side: DoubleSide,
    })
    materials.push(material)
    const mesh = new Mesh(geometries[1], material)
    mesh.scale.set(panel.size[0], panel.size[1], 1)
    mesh.position.set(...panel.position)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }

  const dispose = () => {
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
  }

  return { scene, dispose }
}
