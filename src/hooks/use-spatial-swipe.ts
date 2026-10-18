import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { committedSwipe, swipeAxis, type SwipeDirection } from '@/lib/spatial-swipe'

const excluded = 'button,a,input,textarea,select,label,[role=radio],[role=radiogroup],[contenteditable]:not([contenteditable=false]),.spatial-evidence,.flow-gallery,[role=dialog],[role=alertdialog]'
type Options = { criterion: number; enabled: boolean; block: (direction: SwipeDirection) => string | null; navigate: (direction: SwipeDirection) => void; announce: (message: string) => void }
/** Touch/pen only: mouse text selection and keyboard controls keep their native behavior. */
export function useSpatialSwipe(ref: RefObject<HTMLDivElement | null>, options: Options) {
  const current = useRef(options)
  const cancel = useRef<() => void>(() => {})
  const enter = useRef<SwipeDirection | null>(null)
  const animation = useRef<Animation | null>(null)
  const busy = useRef(false)
  useLayoutEffect(() => { current.current = options })
  useLayoutEffect(() => {
    cancel.current()
    const node = ref.current
    const direction = enter.current
    enter.current = null
    if (!node || !direction || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const duration = parseFloat(getComputedStyle(node).getPropertyValue('--spatial-motion-swipe-in')) || 320
    busy.current = true
    node.dataset.swipe = 'transitioning'
    animation.current = node.animate([{ transform: `translateX(${direction === 'next' ? '' : '-'}${node.clientWidth * .34}px)`, opacity: .4 }, { transform: 'translateX(0)', opacity: 1 }], { duration, easing: 'cubic-bezier(.16,1,.3,1)' })
    const active = animation.current
    void active.finished.catch(() => {}).then(() => { if (animation.current === active) { busy.current = false; delete node.dataset.swipe } })
  }, [options.criterion, options.enabled, ref])
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let gesture: { id: number; x: number; y: number; time: number; axis: ReturnType<typeof swipeAxis>; dx: number } | null = null
    let operation = 0
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
    const modal = () => !!document.querySelector('[role=dialog][data-state=open],[role=alertdialog][data-state=open]')
    function reset() {
      operation++
      const id = gesture?.id
      gesture = null
      if (id !== undefined && node!.hasPointerCapture(id)) node!.releasePointerCapture(id)
      animation.current?.cancel(); animation.current = null; busy.current = false
      node!.style.removeProperty('transform'); node!.style.removeProperty('opacity'); delete node!.dataset.swipe
    }
    cancel.current = reset
    function snap() {
      const transform = node!.style.transform, opacity = node!.style.opacity
      reset()
      if (!transform || reduced()) return
      const duration = parseFloat(getComputedStyle(node!).getPropertyValue('--spatial-motion-swipe-snap')) || 210
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
        node!.style.transform = `translate3d(${offset}px,0,0) rotate(${offset / 110}deg)`
        node!.style.opacity = String(1 - Math.min(.18, Math.abs(offset) / node!.clientWidth * .14))
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
      const message = current.current.block(direction)
      if (message) { current.current.announce(message); snap(); return }
      busy.current = true; node!.dataset.swipe = 'transitioning'
      const id = ++operation
      if (!reduced()) {
        const duration = parseFloat(getComputedStyle(node!).getPropertyValue('--spatial-motion-swipe-out')) || 180
        animation.current = node!.animate([{ transform: node!.style.transform || 'translateX(0)', opacity: 1 }, { transform: `translateX(${direction === 'next' ? '-' : ''}${node!.clientWidth * .88}px)`, opacity: .15 }], { duration, easing: 'cubic-bezier(.4,0,1,1)' })
        await animation.current.finished.catch(() => {})
      }
      if (id !== operation || !current.current.enabled || modal()) { reset(); return }
      const latestBlock = current.current.block(direction)
      if (latestBlock) { current.current.announce(latestBlock); snap(); return }
      reset(); enter.current = direction; current.current.navigate(direction)
    }
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
      reset(); cancel.current = () => {}
      node.removeEventListener('pointerdown', start); node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', finish); node.removeEventListener('pointercancel', canceled)
      window.removeEventListener('pointerdown', otherPointer, true); window.removeEventListener('blur', canceled); document.removeEventListener('visibilitychange', visibility)
    }
  }, [ref])
}
