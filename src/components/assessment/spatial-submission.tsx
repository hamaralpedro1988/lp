import { useId, useRef, useState } from 'react'
import { createSpatialAcknowledgement } from '@/data/spatial-acknowledgement'
import { spatialAssessmentOutcome } from '@/data/spatial-review'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Check, PencilLine } from 'lucide-react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { flowCriteria } from '@/data/flow-draft'
import type { FlowDraft } from '@/data/flow-draft'
import { SpatialActionButton, SpatialSurface } from './spatial-primitives'

export function SpatialSubmission({ draft, onFeedback, onSignature }: { draft: FlowDraft; onFeedback: (value: string) => void; onSignature: (signature: NonNullable<FlowDraft['signature']>) => void }) {
  const [open, setOpen] = useState(false)
  const [strokes, setStrokes] = useState<string[]>([])
  const [name, setName] = useState('')
  const [method, setMethod] = useState<'drawn' | 'typed'>('typed')
  const [consent, setConsent] = useState(false)
  const outcome = spatialAssessmentOutcome(draft, draft.completion?.photos ?? {})
  const failedTasks = flowCriteria.filter((_, index) => draft.answers[index] === 'fail')
  const signature = createSpatialAcknowledgement(name, method, strokes, consent)
  const drawing = useRef<{ id: number; points: string } | null>(null)
  const feedback = useId(), typedName = useId(), consentId = useId(), helpId = useId()
  useMobileOverlay(open, () => { setOpen(false); return true })
  return <>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><div className="spatial-submission-heading"><CardTitle><h2>Dre’s acknowledgement</h2></CardTitle><span>Required</span></div></CardHeader><CardContent><p>After discussing the results, hand the phone to Dre to confirm he received the feedback.</p><SpatialActionButton variant="outline" className="spatial-collect-signature" onClick={() => { setStrokes([]); setName(''); setConsent(false); setMethod('typed'); setOpen(true) }}>{draft.signature ? <Check aria-hidden="true"/> : <PencilLine aria-hidden="true"/>}{draft.signature ? 'View acknowledgement' : 'Collect acknowledgement'}</SpatialActionButton><p className="spatial-signature-status" role="status">{draft.signature ? 'Dre’s acknowledgement recorded' : 'Waiting for Dre’s acknowledgement'}</p></CardContent></SpatialSurface>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><div className="spatial-submission-heading"><CardTitle><h2>Share feedback</h2></CardTitle><span>Optional</span></div></CardHeader><CardContent><p>Visible to Dre and anyone with access to this assessment.</p><label className="sr-only" htmlFor={feedback}>Feedback for Dre</label><Textarea id={feedback} value={draft.feedback} onChange={event => onFeedback(event.target.value)} placeholder="Add feedback" className="spatial-submission-feedback"/></CardContent></SpatialSurface>
    <SpatialSurface className="overview-card spatial-submission-card"><CardHeader><CardTitle><h2>Next step</h2></CardTitle></CardHeader><CardContent><p>The next step is manager review. This prototype saves locally; nothing is sent to the manager.</p><div className="spatial-submission-manager"><span aria-hidden="true">AM</span><div><strong>Alex</strong><small>Manager</small></div></div></CardContent></SpatialSurface>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-signature-sheet mx-auto max-w-lg rounded-t-3xl"><SheetHeader><SheetTitle>{draft.signature ? 'Dre’s acknowledgement' : 'Collect acknowledgement'}</SheetTitle><SheetDescription>This confirms the feedback was discussed, not that you agree with the result. Identity is not verified by this prototype.</SheetDescription></SheetHeader><div className="spatial-acknowledgement-body px-5 pb-5 space-y-4 overflow-y-auto">
      {draft.signature ? <>{draft.signature.strokes.length > 0 && <svg viewBox="0 0 320 140" className="spatial-signature-pad" role="img" aria-label="Recorded drawing">{draft.signature.strokes.map((points, index) => <polyline key={index} points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>}<p>Recorded name: {draft.signature.name}</p><p>Method: {draft.signature.method ?? 'unknown (legacy record)'}. Identity not verified.</p><p>{draft.signature.consent ? 'Feedback acknowledgement confirmed.' : 'Consent was not recorded in this legacy prototype record.'}</p><SpatialActionButton variant="outline" onClick={() => setOpen(false)}>Close</SpatialActionButton></> : <>
      <section aria-label="Result and next steps" className="spatial-acknowledgement-summary"><h3>Your assessment feedback</h3><p>{outcome === 'Pass' ? 'You passed this assessment.' : outcome === 'Fail' ? 'Some tasks need coaching. Review these observations with Rosa.' : 'The result is not complete. Review the recorded observations with Rosa.'} The next step is manager review. This prototype keeps the record on this device; no certification is granted here.</p><p>Read the result and feedback with Rosa before continuing.</p>{failedTasks.length > 0 && <><h4>Tasks to discuss</h4><ul>{failedTasks.map(task => <li key={task.title}>{task.title}</li>)}</ul><p>Ask Rosa about practice or coaching for these tasks.</p></>}{draft.feedback && <p className="whitespace-pre-wrap">{draft.feedback}</p>}</section>
      <Tabs value={method} onValueChange={value => setMethod(value as 'drawn' | 'typed')}><TabsList aria-label="Acknowledgement method"><TabsTrigger value="typed">Type name</TabsTrigger><TabsTrigger value="drawn">Draw signature</TabsTrigger></TabsList>
      <TabsContent value="typed"><p>Typed acknowledgement is a prototype alternative. Business validation is required before treating it as a signature.</p></TabsContent>
      <TabsContent value="drawn"><svg viewBox="0 0 320 140" className="spatial-signature-pad" role="img" aria-label="Draw your signature, or type your name below" onPointerDown={event => {
        event.stopPropagation()
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
      <SpatialActionButton variant="ghost" onClick={() => setStrokes([])}>Clear signature</SpatialActionButton></TabsContent>
      <label htmlFor={typedName}>Your full name (required)</label><Input id={typedName} value={name} onChange={event => setName(event.target.value)} autoComplete="off" maxLength={200} aria-required="true" aria-describedby={helpId} placeholder="Enter your full name"/>
      <label className="spatial-consent" htmlFor={consentId}><Checkbox id={consentId} checked={consent} onCheckedChange={value => setConsent(value === true)} aria-required="true" aria-describedby={helpId}/><span>I confirm this is my name and I received the feedback.</span></label>
      <p id={helpId} className="spatial-acknowledgement-help" role="status" aria-live="polite">{!name.trim() ? 'Enter your full name to continue.' : method === 'drawn' && !strokes.some(points => points.includes(' ')) ? 'Draw your signature, or choose Type name.' : !consent ? 'Confirm you received the feedback to continue.' : 'Ready to record your acknowledgement. Identity is not verified.'}</p>
      <SpatialActionButton className="w-full" disabled={!signature} onClick={() => { const record = createSpatialAcknowledgement(name, method, strokes, consent); if (!record) return; onSignature(record);setOpen(false) }}>Confirm acknowledgement</SpatialActionButton></Tabs>
      </>}
    </div></SheetContent></Sheet>
  </>
}
