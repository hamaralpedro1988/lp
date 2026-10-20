import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { committedSwipe, spatialMotionMilliseconds, swipeAxis, type SwipeDirection } from '@/lib/spatial-swipe'

const excluded = 'button,a,input,textarea,select,label,[role=radio],[role=radiogroup],[contenteditable]:not([contenteditable=false]),.spatial-evidence,.flow-gallery,[role=dialog],[role=alertdialog]'
type Options = { criterion: number; enabled: boolean; block: (direction: SwipeDirection) => string | null; navigate: (direction: SwipeDirection) => void; announce: (message: string) => void }
/** Touch/pen only: mouse text selection and keyboard controls keep their native behavior. */
export function useSpatialSwipe(ref: RefObject<HTMLDivElement | null>, options: Options) {
  const current = useRef(options)
  const cancel = useRef<() => void>(() => {})
  const enter = useRef<{ direction: SwipeDirection; snapshot: HTMLElement; offset: number } | null>(null)
  const departing = useRef<HTMLElement | null>(null)
  const departureAnimation = useRef<Animation | null>(null)
  const animation = useRef<Animation | null>(null)
  const busy = useRef(false)
  const request = useRef<(direction: SwipeDirection) => void>(() => {})
  useLayoutEffect(() => { current.current = options })
  useLayoutEffect(() => {
    const transition = enter.current
    enter.current = null
    cancel.current()
    const node = ref.current
    if (!node || !transition) return
    const { direction, snapshot, offset } = transition
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { snapshot.remove(); return }
    departing.current = snapshot
    const duration = spatialMotionMilliseconds(getComputedStyle(node).getPropertyValue('--spatial-motion-swipe-in'), 300)
    const exitScale = parseFloat(getComputedStyle(node).getPropertyValue('--spatial-motion-card-exit-scale')) || .98
    const distance = node.offsetWidth + 24
    const sign = direction === 'next' ? 1 : -1
    const timing = { duration, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both' as const }
    busy.current = true
    node.dataset.swipe = 'transitioning'
    departureAnimation.current = snapshot.animate([
      { transform: `translateX(${offset}px) scale(1)`, opacity: 1 },
      { transform: `translateX(${-sign * distance}px) scale(${exitScale})`, opacity: 1 },
    ], timing)
    animation.current = node.animate([
      { transform: `translateX(${sign * distance + offset}px)`, opacity: 1 },
      { transform: 'translateX(0)', opacity: 1 },
    ], timing)
    const active = animation.current
    void active.finished.catch(() => {}).then(() => {
      if (animation.current === active) cancel.current()
    })
  }, [options.criterion, options.enabled, ref])
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let gesture: { id: number; x: number; y: number; time: number; axis: ReturnType<typeof swipeAxis>; dx: number } | null = null
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
    const modal = () => !!document.querySelector('[role=dialog][data-state=open],[role=alertdialog][data-state=open]')
    function reset() {
      const id = gesture?.id
      gesture = null
      if (id !== undefined && node!.hasPointerCapture(id)) node!.releasePointerCapture(id)
      animation.current?.cancel(); animation.current = null
      departureAnimation.current?.cancel(); departureAnimation.current = null
      departing.current?.remove(); departing.current = null
      enter.current?.snapshot.remove(); enter.current = null
      busy.current = false
      node!.style.removeProperty('transform'); node!.style.removeProperty('opacity'); delete node!.dataset.swipe
    }
    cancel.current = reset
    function snap() {
      const transform = node!.style.transform, opacity = node!.style.opacity
      reset()
      if (!transform || reduced()) return
      const duration = spatialMotionMilliseconds(getComputedStyle(node!).getPropertyValue('--spatial-motion-swipe-snap'), 210)
      animation.current = node!.animate([{ transform, opacity }, { transform: 'translateX(0)', opacity: 1 }], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' })
    }
    function start(event: PointerEvent) {
      if (gesture) { snap(); return }
      if (!current.current.enabled || busy.current || modal() || !event.isPrimary || !['touch', 'pen'].includes(event.pointerType)) return
      if (event.clientX < 24 || event.clientX > innerWidth - 24 || (event.target as Element).closest(excluded)) return
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), axis: null, dx: 0 }
    }
    function move(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return
      if (!current.current.enabled || modal()) { snap(); return }
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y
      gesture.axis ??= swipeAxis(dx, dy)
      if (gesture.axis === 'vertical') { reset(); return }
      if (gesture.axis !== 'horizontal') return
      if (event.cancelable) event.preventDefault()
      if (!node!.hasPointerCapture(event.pointerId)) node!.setPointerCapture(event.pointerId)
      const direction = dx < 0 ? 'next' : 'back'
      const blocked = current.current.block(direction)
      let offset = Math.max(-node!.clientWidth * .8, Math.min(node!.clientWidth * .8, dx))
      if (blocked) offset *= .25
      gesture.dx = dx
      node!.dataset.swipe = 'dragging'
      if (!reduced()) {
        node!.style.transform = `translate3d(${offset}px,0,0)`
        node!.style.opacity = '1'
      }
    }
    async function finish(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return
      const g = gesture
      if (g.axis !== 'horizontal') { reset(); return }
      const direction = committedSwipe(event.clientX - g.x, event.clientY - g.y, performance.now() - g.time, node!.clientWidth)
      gesture = null
      if (node!.hasPointerCapture(event.pointerId)) node!.releasePointerCapture(event.pointerId)
      if (!direction) { snap(); return }
      await travel(direction)
    }
    function travel(direction: SwipeDirection) {
      if (busy.current || !current.current.enabled || modal()) return
      const message = current.current.block(direction)
      if (message) { current.current.announce(message); snap(); return }
      busy.current = true; node!.dataset.swipe = 'transitioning'
      if (!reduced()) {
        // Inert visual snapshot keeps the departing card visible while React mounts
        // the next criterion. It never owns state, focus, evidence or event handlers.
        const snapshot = node!.cloneNode(true) as HTMLElement
        snapshot.removeAttribute('id')
        snapshot.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'))
        snapshot.setAttribute('aria-hidden', 'true')
        snapshot.inert = true
        snapshot.dataset.cardDeparture = 'true'
        snapshot.removeAttribute('data-swipe')
        const offset = new DOMMatrixReadOnly(getComputedStyle(node!).transform).m41
        Object.assign(snapshot.style, {
          position: 'absolute', left: `${node!.offsetLeft}px`, top: `${node!.offsetTop}px`,
          width: `${node!.offsetWidth}px`, height: `${node!.offsetHeight}px`,
          margin: '0', transform: `translateX(${offset}px)`, pointerEvents: 'none',
        })
        snapshot.querySelectorAll('textarea').forEach((field, index) => {
          field.value = node!.querySelectorAll('textarea')[index].value
        })
        node!.parentElement!.append(snapshot)
        snapshot.scrollTop = node!.scrollTop
        enter.current = { direction, snapshot, offset }
      }
      current.current.navigate(direction)
      // The final criterion leaves this screen instead of starting another card.
      // Unmount cleanup removes its snapshot as well.
      if (reduced()) reset()
    }
    request.current = direction => { void travel(direction) }
    function otherPointer(event: PointerEvent) { if (gesture && event.pointerId !== gesture.id) snap() }
    function canceled() { snap() }
    function visibility() { if (document.hidden) reset() }
    node.addEventListener('pointerdown', start)
    node.addEventListener('pointermove', move, { passive: false })
    node.addEventListener('pointerup', finish)
    node.addEventListener('pointercancel', canceled)
    window.addEventListener('pointerdown', otherPointer, true)
    window.addEventListener('blur', canceled)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      reset(); cancel.current = () => {}; request.current = () => {}
      node.removeEventListener('pointerdown', start); node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', finish); node.removeEventListener('pointercancel', canceled)
      window.removeEventListener('pointerdown', otherPointer, true); window.removeEventListener('blur', canceled); document.removeEventListener('visibilitychange', visibility)
    }
  }, [ref])
  return useCallback((direction: SwipeDirection) => request.current(direction), [])
}
