import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Deliberate confirmation: drag the handle to the end, or confirm in two keyboard/AT activations. */
export function SpatialSlideComplete({ disabled, onComplete }: { disabled: boolean; onComplete: () => void }) {
  const hint = useId()
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; start: number; distance: number; value: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(0)
  const [armed, setArmed] = useState(false)
  const [complete, setComplete] = useState(false)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function reset() { drag.current = null; setProgress(0); setArmed(false) }
  function finish() {
    if (disabled || complete || timer.current) return
    setProgress(1); setComplete(true)
    timer.current = setTimeout(onComplete, 350)
  }
  return <div className="spatial-slide-confirm">
    <div ref={track} className="spatial-slide-track" data-disabled={disabled || undefined} data-complete={complete || undefined}>
      <span className="spatial-slide-fill" style={{ width: `calc(56px + (100% - 56px) * ${progress})` }} aria-hidden="true"/>
      <span className="spatial-slide-label" aria-hidden="true">{complete ? 'Assessment completed' : armed ? 'Press again to complete' : 'Slide to complete'}</span>
      <Button variant="outline" className="spatial-slide-handle" disabled={disabled || complete} aria-label={armed ? 'Confirm complete assessment' : 'Complete assessment'} aria-describedby={hint}
        style={{ left: `calc(4px + (100% - 64px) * ${progress})` }}
        onPointerDown={event => {
          if (disabled || complete || !event.isPrimary || event.button !== 0) return
          const distance = (track.current?.clientWidth ?? 64) - 64
          if (distance <= 0) return
          setArmed(false)
          drag.current = { id: event.pointerId, start: event.clientX, distance, value: 0 }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          const current = drag.current
          if (!current || current.id !== event.pointerId) return
          current.value = Math.max(0, Math.min(1, (event.clientX - current.start) / current.distance))
          setProgress(current.value)
        }}
        onPointerUp={event => {
          const current = drag.current
          if (!current || current.id !== event.pointerId) return
          drag.current = null
          if (current.value >= .98) finish()
          else reset()
        }}
        onPointerCancel={reset}
        onLostPointerCapture={() => { if (drag.current) reset() }}
        onClick={event => {
          // Pointer clicks never complete; AT and keyboard clicks use explicit two-step confirmation.
          if (event.detail !== 0 || disabled || complete) return
          if (armed) finish()
          else setArmed(true)
        }}
        onBlur={() => { if (!complete) reset() }}
        onKeyDown={event => { if (event.key === 'Escape') reset() }}
      >{complete ? <Check aria-hidden="true"/> : <ChevronRight aria-hidden="true"/>}</Button>
    </div>
    <p id={hint} className="sr-only">Drag the handle fully to the right and release to complete. With a keyboard or screen reader, activate once to prepare, then activate again to confirm. Closing this sheet cancels.</p>
    <span role="status" className="sr-only">{complete ? 'Assessment completed' : armed ? 'Ready to confirm. Activate again to complete assessment.' : ''}</span>
  </div>
}
