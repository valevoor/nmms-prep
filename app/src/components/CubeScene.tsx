import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FACES, SCHEMES, smallCubes } from '../lib/cubePaint'
import type { ColourCount, CubeFace, Kind, SmallCube } from '../lib/cubePaint'

/**
 * The painted cube in real 3D (three.js), loaded lazily by pages/CubeExplorer.tsx so the library stays
 * out of the main bundle. It draws only when something changes (a drag, a zoom, new props), not every
 * frame, to spare cheap phones.
 */

export interface SceneHandle {
  look(face: CubeFace): void
  zoom(factor: number): void
  reset(): void
}

interface Props {
  n: number
  colours: ColourCount
  show: Kind | 'all'
  xray: boolean
  picked: SmallCube | null
  onPick: (c: SmallCube | null) => void
  label: string
  noWebgl: string
  ref?: Ref<SceneHandle>
}

/** From the centre of the big cube towards each face; a touch off the pole for top and bottom. */
const LOOK: Record<CubeFace, [number, number, number]> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, 1, 0.001],
  bottom: [0, -1, 0.001],
}
const START_DIR = new Vector3(1.1, 1, 1.9).normalize()
const startDistance = (n: number) => n * 2.9
const GHOST = { shown: 0.07, xray: 0.12 }

interface World {
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  controls: OrbitControls
  scene: Scene
  group: Group
  render: () => void
}

/** Old or locked-down phones may have no WebGL; the page then keeps its counts and formulas. */
function hasWebgl() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const same = (a: SmallCube | null, b: SmallCube) => !!a && a.x === b.x && a.y === b.y && a.z === b.z

export default function CubeScene({ n, colours, show, xray, picked, onPick, label, noWebgl, ref }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const world = useRef<World | null>(null)
  const pick = useRef(onPick)
  const [webgl] = useState(hasWebgl)
  useEffect(() => {
    pick.current = onPick
  })

  // One renderer for the page's life; the cubes are rebuilt below when the props change.
  useEffect(() => {
    const el = host.current
    if (!webgl || !el) return
    const renderer = new WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    el.appendChild(renderer.domElement)
    const scene = new Scene()
    const camera = new PerspectiveCamera(40, 1, 0.02, 200)
    scene.add(new AmbientLight(0xffffff, 1.9))
    const sun = new DirectionalLight(0xffffff, 1.7)
    sun.position.set(-3, 6, 5)
    scene.add(sun)
    const group = new Group()
    scene.add(group)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minDistance = 0.1
    const render = () => renderer.render(scene, camera)
    controls.addEventListener('change', render)
    world.current = { renderer, camera, controls, scene, group, render }

    const resize = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    })
    resize.observe(el)

    // A tap picks a small cube; a drag only turns the view.
    let down: [number, number] | null = null
    const onDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY]
    }
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return
      down = null
      const r = renderer.domElement.getBoundingClientRect()
      const ray = new Raycaster()
      ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hits = ray.intersectObjects(group.children.filter((o) => o instanceof Mesh))
      const hit = hits.find((h) => h.object.userData.solid) ?? hits[0]
      pick.current(hit ? (hit.object.userData.cube as SmallCube) : null)
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    return () => {
      resize.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      disposeGroup(group)
      renderer.dispose()
      renderer.domElement.remove()
      world.current = null
    }
  }, [webgl])

  // A new size starts from the usual view, far enough back to see the whole cube.
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.controls.maxDistance = n * 7
    w.camera.position.copy(START_DIR).multiplyScalar(startDistance(n))
    w.controls.update()
  }, [n])

  useEffect(() => {
    const w = world.current
    if (!w) return
    disposeGroup(w.group)
    const paint = Object.fromEntries(['red', 'blue', 'yellow', 'green', 'purple', 'brown', 'plain'].map((p) => [p, css(`--paint-${p}`)]))
    const box = new BoxGeometry(0.95, 0.95, 0.95)
    const edges = new EdgesGeometry(box)
    const mats = new Map<string, MeshLambertMaterial>()
    const mat = (colour: string, opacity: number) => {
      const key = colour + opacity
      if (!mats.has(key)) mats.set(key, new MeshLambertMaterial({ color: colour, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }))
      return mats.get(key)!
    }
    const line = css('--paint-line')
    const solidLine = new LineBasicMaterial({ color: line, transparent: true, opacity: 0.5 })
    const ghostLine = new LineBasicMaterial({ color: line, transparent: true, opacity: 0.1 })
    const mid = (n - 1) / 2
    for (const c of smallCubes(n)) {
      // Highlighting a kind ghosts every other cube; X-ray alone ghosts the painted shell.
      const solid = show === 'all' ? !(xray && c.kind !== 'inside') : c.kind === show
      const opacity = solid ? 1 : show === 'all' ? GHOST.xray : GHOST.shown
      const m = new Mesh(
        box,
        FACES.map((f) => mat(c.painted.includes(f) ? paint[SCHEMES[colours][f]] : paint.plain, opacity)),
      )
      m.position.set(c.x - mid, c.y - mid, c.z - mid)
      m.userData = { cube: c, solid }
      m.renderOrder = solid ? 0 : 1
      m.add(new LineSegments(edges, solid ? solidLine : ghostLine))
      w.group.add(m)
      if (same(picked, c)) {
        const ring = new LineSegments(new EdgesGeometry(new BoxGeometry(1.03, 1.03, 1.03)), new LineBasicMaterial({ color: css('--accent'), depthTest: false }))
        ring.position.copy(m.position)
        ring.renderOrder = 2
        w.group.add(ring)
      }
    }
    w.render()
  }, [n, colours, show, xray, picked])

  useImperativeHandle(ref, () => ({
    look(face) {
      const w = world.current
      if (!w) return
      const dist = w.camera.position.length()
      const from = w.camera.position.clone().normalize()
      const turn = new Quaternion().setFromUnitVectors(from, new Vector3(...LOOK[face]).normalize())
      const now = new Quaternion()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const t0 = performance.now()
      requestAnimationFrame(function tick(t) {
        const k = reduce ? 1 : Math.min(1, (t - t0) / 600)
        now.identity().slerp(turn, 1 - (1 - k) ** 3)
        w.camera.position.copy(from).applyQuaternion(now).multiplyScalar(dist)
        w.controls.update()
        if (k < 1) requestAnimationFrame(tick)
      })
    },
    zoom(factor) {
      const w = world.current
      if (!w) return
      const p = w.camera.position
      p.setLength(Math.max(w.controls.minDistance, Math.min(w.controls.maxDistance, p.length() / factor)))
      w.controls.update()
    },
    reset() {
      const w = world.current
      if (!w) return
      w.camera.position.copy(START_DIR).multiplyScalar(startDistance(n))
      w.controls.update()
    },
  }))

  return (
    <div ref={host} className="cube-scene" role="img" aria-label={label}>
      {!webgl && <p className="cube-scene-msg muted">{noWebgl}</p>}
    </div>
  )
}

/** Frees the GPU copies of the last build's shapes and colours before the next one. */
function disposeGroup(group: Group) {
  const done = new Set<{ dispose(): void }>()
  group.traverse((o) => {
    if (o instanceof Mesh || o instanceof LineSegments) {
      done.add(o.geometry)
      for (const m of [o.material].flat()) done.add(m)
    }
  })
  done.forEach((d) => d.dispose())
  group.clear()
}
