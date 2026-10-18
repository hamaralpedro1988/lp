import { useRef, useState, type PointerEvent } from 'react'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { flowCriteria } from '@/data/flow-draft'
import { spatialGuidance } from '@/data/spatial-guidance'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'

/** Optional context: isolated from observation state and the card's horizontal swipe. */
export function SpatialCriterionGuidance({ index }: { index: number }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const start = useRef<{ id: number; x: number; y: number } | null>(null)
  const moved = useRef(false)
  const suppressClick = useRef(false)
  const criterion = flowCriteria[index], guidance = spatialGuidance[index]
  useMobileOverlay(open, () => { setOpen(false); return true })
  function begin(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || start.current) { start.current = null; suppressClick.current = true; return }
    suppressClick.current = false; moved.current = false
    start.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (start.current?.id !== event.pointerId) return
    if (Math.max(Math.abs(event.clientX - start.current.x), Math.abs(event.clientY - start.current.y)) > 9) moved.current = true
  }
  function end(event: PointerEvent<HTMLButtonElement>) {
    const from = start.current
    start.current = null
    if (!from || from.id !== event.pointerId) return
    const dx = event.clientX - from.x, dy = event.clientY - from.y
    suppressClick.current = moved.current || Math.max(Math.abs(dx), Math.abs(dy)) > 9
    if (dy < -32 && Math.abs(dy) > Math.abs(dx) * 1.25) setOpen(true)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  function cancel() { start.current = null; suppressClick.current = true }
  return <>
    <Button ref={trigger} type="button" variant="ghost" className="spatial-guidance-trigger" aria-label="Open step guidance" aria-haspopup="dialog" aria-expanded={open} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={cancel} onLostPointerCapture={() => { start.current = null }} onClick={event => { if (event.detail === 0 || !suppressClick.current) setOpen(true); suppressClick.current = false }}><span aria-hidden="true"/></Button>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="spatial-guidance-sheet mobile-sheet flow-sheet mx-auto" onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus({ preventScroll: true }) }} onCloseAutoFocus={event => { if (trigger.current?.isConnected) { event.preventDefault(); trigger.current.focus({ preventScroll: true }) } }}>
      <SheetHeader><div className="spatial-guidance-heading"><BookOpen aria-hidden="true"/><div><SheetTitle className="outline-none" ref={title} tabIndex={-1}>Step guidance</SheetTitle><SheetDescription>{criterion.section} · {index + 1} of {flowCriteria.length}</SheetDescription></div></div></SheetHeader>
      <div className="spatial-guidance-body"><h3>{guidance.heading}</h3><p>{guidance.summary}</p><h4>What to look for</h4><ul>{guidance.points.map(point => <li key={point}><span aria-hidden="true"/>{point}</li>)}</ul><p className="spatial-guidance-note">Follow your site’s approved safety procedure.</p><Button variant="outline" className="spatial-action" onClick={() => setOpen(false)}>Back to assessment</Button></div>
    </SheetContent></Sheet>
  </>
}
