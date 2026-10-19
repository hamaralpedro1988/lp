import { useId, useRef, useState } from 'react'
import { Check, PencilLine } from 'lucide-react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import type { FlowDraft } from '@/data/flow-draft'
import { SpatialActionButton, SpatialSurface } from './spatial-primitives'

export function SpatialSubmission({ draft, onFeedback, onSignature }: { draft: FlowDraft; onFeedback: (value: string) => void; onSignature: (signature: NonNullable<FlowDraft['signature']>) => void }) {
  const [open, setOpen] = useState(false)
  const [strokes, setStrokes] = useState<string[]>([])
  const [name, setName] = useState('')
  const drawing = useRef<{ id: number; points: string } | null>(null)
  const feedback = useId(), typedName = useId()
  useMobileOverlay(open, () => { setOpen(false); return true })
  return <>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><div className="spatial-submission-heading"><CardTitle><h2>Dre’s acknowledgement</h2></CardTitle><span>Required</span></div></CardHeader><CardContent><p>After discussing the results, hand the phone to Dre to confirm he received the feedback.</p><SpatialActionButton variant="outline" className="spatial-collect-signature" onClick={() => { setStrokes([]); setName(''); setOpen(true) }}>{draft.signature ? <Check aria-hidden="true"/> : <PencilLine aria-hidden="true"/>}{draft.signature ? 'View signature' : 'Collect signature'}</SpatialActionButton><p className="spatial-signature-status" role="status">{draft.signature ? 'Dre’s signature collected' : 'Waiting for Dre’s signature'}</p></CardContent></SpatialSurface>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><div className="spatial-submission-heading"><CardTitle><h2>Share feedback</h2></CardTitle><span>Optional</span></div></CardHeader><CardContent><p>Visible to Dre and anyone with access to this assessment.</p><label className="sr-only" htmlFor={feedback}>Feedback for Dre</label><Textarea id={feedback} value={draft.feedback} onChange={event => onFeedback(event.target.value)} placeholder="Add feedback" className="spatial-submission-feedback"/></CardContent></SpatialSurface>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><CardTitle><h2>Next step</h2></CardTitle></CardHeader><CardContent><p>Assessment will be sent to the designated manager for review.</p><div className="spatial-submission-manager"><span aria-hidden="true">AM</span><div><strong>Alex</strong><small>Manager</small></div></div></CardContent></SpatialSurface>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-signature-sheet mx-auto max-w-lg rounded-t-3xl"><SheetHeader><SheetTitle>{draft.signature ? 'Dre’s signature' : 'Collect signature'}</SheetTitle><SheetDescription>By signing, Dre confirms he received the assessment feedback. This does not mean he agrees with the result.</SheetDescription></SheetHeader><div className="px-5 pb-5 space-y-4 overflow-y-auto">
      {draft.signature ? <><svg viewBox="0 0 320 140" className="spatial-signature-pad" role="img" aria-label="Recorded signature">{draft.signature.strokes.map((points, index) => <polyline key={index} points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>)}</svg><p>Signed by {draft.signature.name}</p><SpatialActionButton variant="outline" onClick={() => setOpen(false)}>Close</SpatialActionButton></> : <>
      <svg viewBox="0 0 320 140" className="spatial-signature-pad" role="img" aria-label="Draw your signature, or type your name below" onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        const r = event.currentTarget.getBoundingClientRect(), point = `${Math.round((event.clientX-r.left)*320/r.width)},${Math.round((event.clientY-r.top)*140/r.height)}`
        drawing.current = {id:event.pointerId,points:point};setStrokes(previous => [...previous, point]);event.currentTarget.setPointerCapture(event.pointerId)
      }} onPointerMove={event => {
        const current = drawing.current
        if (!current || current.id !== event.pointerId) return
        const r=event.currentTarget.getBoundingClientRect()
        current.points += ` ${Math.round((event.clientX-r.left)*320/r.width)},${Math.round((event.clientY-r.top)*140/r.height)}`
        setStrokes(previous => [...previous.slice(0,-1),current.points])
      }} onPointerUp={() => {drawing.current=null}} onPointerCancel={() => {drawing.current=null}}>
      {strokes.map((points,index) => <polyline key={index} points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>
      <SpatialActionButton variant="ghost" onClick={() => setStrokes([])}>Clear signature</SpatialActionButton>
      <label htmlFor={typedName}>Or type your full name to sign</label><Input id={typedName} value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Dre Michael"/>
      <SpatialActionButton className="w-full" disabled={!name.trim() && !strokes.some(points => points.includes(' '))} onClick={() => {onSignature({name:name.trim() || 'Dre Michael',at:new Date().toISOString(),strokes});setOpen(false)}}>Confirm signature</SpatialActionButton>
      </>}
    </div></SheetContent></Sheet>
  </>
}
