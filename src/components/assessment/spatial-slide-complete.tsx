import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

/** Optional drag and visible no-drag action share the same explicit confirmation. */
export function SpatialSlideComplete({ disabled, onComplete }: { disabled: boolean; onComplete: () => boolean | void }) {
  const hint = useId()
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; start: number; distance: number; value: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(0)
  const [travel, setTravel] = useState(0)
  const [complete, setComplete] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const committed = useRef(false)
  const [error, setError] = useState('')
  const returnFocus = useRef<HTMLElement | null>(null)
  function requestConfirmation() { setError(''); returnFocus.current = document.activeElement as HTMLElement; setConfirming(true) }
  useMobileOverlay(confirming, () => { setConfirming(false); reset(); return true })
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function reset() { if (timer.current) clearTimeout(timer.current); timer.current = null; drag.current = null; setProgress(0); setComplete(false) }
  function finish() {
    if (disabled || complete || timer.current) return
    setTravel(Math.max(0, (track.current?.clientWidth ?? 64) - 64))
    setProgress(1); setComplete(true)
    timer.current = setTimeout(() => { timer.current = null; requestConfirmation() }, 350)
  }
  return <div className="spatial-slide-confirm">
    <div ref={track} className="spatial-slide-track" data-disabled={disabled || undefined} data-complete={complete || undefined}>
      <span className="spatial-slide-fill" style={{ width: `${progress * 100}%` }} aria-hidden="true"/>
      <span className="spatial-slide-label" aria-hidden="true">{complete ? 'Ready to confirm' : 'Slide to finish'}</span>
      <span className="spatial-slide-label spatial-slide-label-inverse" style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }} aria-hidden="true">{complete ? 'Ready to confirm' : 'Slide to finish'}</span>
      <Button variant="outline" className="spatial-slide-handle" disabled={disabled || complete} aria-label="Slide to finish assessment" aria-describedby={hint}
        style={{ left: 4, transform: `translateX(${travel * progress}px)` }}
        onPointerDown={event => {
          if (disabled || complete || !event.isPrimary || event.button !== 0) return
          const distance = Math.max(0, (track.current?.getBoundingClientRect().width ?? 64) - 64)
          if (distance <= 0) return
          setTravel(distance)
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
          if (Math.max(0, Math.min(1, (event.clientX - current.start) / current.distance)) >= .96) finish()
          else reset()
        }}
        onPointerCancel={reset}
        onLostPointerCapture={() => { if (drag.current) reset() }}
        onClick={event => {
          // Pointer clicks never complete; keyboard/AT activation opens the same confirmation.
          if (event.detail !== 0 || disabled || complete) return
          requestConfirmation()
        }}
        onBlur={() => { if (!complete && !drag.current) reset() }}
        onKeyDown={event => { if (event.key === 'Escape') reset() }}
      >{complete ? <Check aria-hidden="true"/> : <ChevronRight aria-hidden="true"/>}</Button>
    </div>
    <Button className="spatial-no-drag w-full" disabled={disabled || committed.current} onClick={() => requestConfirmation()} aria-haspopup="dialog">Complete assessment</Button>
    <p className="spatial-completion-alternative">No dragging needed. You will confirm before completing.</p>
    <AlertDialog open={confirming} onOpenChange={value => { setConfirming(value); if (!value && !committed.current) { setComplete(false); reset() } }}>
      <AlertDialogContent className="spatial-completion-confirmation" onCloseAutoFocus={event => { if (!committed.current && returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus() } }}><AlertDialogHeader><AlertDialogTitle>Complete assessment?</AlertDialogTitle><AlertDialogDescription>Your responses will become read-only. Feedback and acknowledgement come next. This does not submit the assessment or grant certification.</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert">{error}</p>}<AlertDialogFooter><AlertDialogCancel>Keep assessing</AlertDialogCancel><AlertDialogAction disabled={disabled || committed.current} onClick={event => { if (disabled || committed.current) { event.preventDefault(); return } committed.current = true; if (onComplete() === false) { event.preventDefault(); committed.current = false; setError('Unable to complete. Check remaining tasks and device storage, then try again. Your responses remain in this session.') } }}>Confirm completion</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
    <p id={hint} className="sr-only">Drag the handle fully to the right and release to review completion. Or use the Complete assessment button below. Activating either action opens a separate confirmation. Closing this sheet cancels.</p>
    <span role="status" className="sr-only">{complete ? 'Ready to confirm' : ''}</span>
  </div>
}
