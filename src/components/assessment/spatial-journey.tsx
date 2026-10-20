import fryerPhoto from '@/assets/fryer-station.png'
import type { SpatialLearningResult } from '@/data/spatial-overview'
import dreAvatar from '@/assets/dre-jackson.png'
import { spatialMissing, spatialEvidenceMessage, spatialEvidenceRequirement } from '@/data/spatial-flow'
import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { Camera, CookingPot, Check, ChevronRight, ClipboardCheck, MessageCircle, ShieldCheck, UserRound, X } from 'lucide-react'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { spatialAssessmentOutcome, spatialReviewIndices, spatialReviewResult, type SpatialReviewFilter } from '@/data/spatial-review'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { flowCriteria, type FlowDraft } from '@/data/flow-draft'
import { SpatialActionButton, SpatialSurface } from './spatial-primitives'

export function SpatialAssignmentCard({ status, onOpen }: { status: string; onOpen: () => void }) {
  return <SpatialSurface className="overview-card"><CardHeader><CardTitle><h2>Assigned assessment</h2></CardTitle></CardHeader><CardContent><div className="flow-card-heading"><h3>Fryer Station</h3><Badge variant="outline" className="overview-status">{status}</Badge></div><p className="overview-category">Food Process &amp; Safety</p><div className="flow-person"><span className="overview-goal-icon"><UserRound aria-hidden="true"/></span><div><strong>Dre Michael</strong><small>Crew Floor Member</small></div></div><Separator className="my-4"/><div className="flow-card-detail"><span>{flowCriteria.length} tasks</span><span>Assessor · Rosa Thompson</span></div><SpatialActionButton className="overview-start spaced" onClick={onOpen}>View Assessment<ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent></SpatialSurface>
}
export function SpatialStationHeading({ titleRef }: { titleRef?: Ref<HTMLHeadingElement> }) {
  const [imageFailed, setImageFailed] = useState(false)
  return <header className="spatial-overview-station"><span className="spatial-station-image" aria-hidden="true">{imageFailed ? <CookingPot/> : <img src={fryerPhoto} alt="" width={60} height={60} decoding="async" onError={() => setImageFailed(true)}/>}</span><div><h1 ref={titleRef} tabIndex={-1}>Fryer Station</h1><p>Food Process &amp; Safety</p></div><span className="spatial-station-task-count">{flowCriteria.length} Tasks</span></header>
}
export function SpatialLearningScore({ result }: { result: SpatialLearningResult }) {
  const [open, setOpen] = useState(false)
  useMobileOverlay(open, () => { setOpen(false); return true })
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><SpatialActionButton variant="ghost" className="spatial-learning-row" aria-label="View e-learning activity score for Dre Michael"><span>E-learning Activity Score</span><strong>{result.score}</strong><ChevronRight aria-hidden="true"/></SpatialActionButton></SheetTrigger><SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-learning-sheet mx-auto"><SheetHeader><SheetTitle>E-learning activity</SheetTitle><SheetDescription>Dre Michael · {result.activity}</SheetDescription></SheetHeader><div className="spatial-learning-detail"><span>Activity score</span><strong>{result.score}</strong>{result.example && <p>Example learning result for this prototype.</p>}<SpatialActionButton variant="outline" onClick={() => setOpen(false)}>Back to overview</SpatialActionButton></div></SheetContent></Sheet>
}
export function SpatialPeopleCard({ status, onMember, compact = false, learning }: { status: string; onMember: () => void; compact?: boolean; learning?: SpatialLearningResult }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  return <SpatialSurface className={`overview-card ${compact ? 'spatial-review-member' : learning ? 'spatial-overview-people' : ''}`}><CardContent className="overview-member-content"><SpatialActionButton variant="ghost" className="overview-member" onClick={onMember} aria-label="View team member Dre Michael"><span className="overview-avatar" aria-hidden="true">{(compact || learning) && !photoFailed ? <img src={dreAvatar} alt="" width={40} height={40} onError={() => setPhotoFailed(true)}/> : <UserRound/>}</span><span className="overview-person-copy"><span>Dre Michael</span><small>Crew Floor Member</small></span><ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent>{!compact && <><Separator/><CardContent className="overview-metadata">{learning && <SpatialLearningScore result={learning}/>}<div><span>Assessment Status</span><Badge variant="outline" className="overview-status" data-status={status === 'Ready to start' ? 'ready' : 'progress'}>{status}</Badge></div><div><span>{learning ? 'Assessor' : 'Qualified assessor'}</span><strong>Rosa Thompson (me)</strong></div></CardContent></>}</SpatialSurface>
}
export function SpatialTaskStats({ draft }: { draft: FlowDraft }) {
  const stats = [{ count: flowCriteria.filter((_, i) => draft.answers[i] === 'met').length, label: 'Pass', Icon: Check }, { count: flowCriteria.filter((_, i) => draft.answers[i] === 'fail').length, label: 'Fail', Icon: X }]
  return <div className="review-stats">{stats.map(({ count, label, Icon }) => <div className="review-stat" data-result={label} key={label}><b>{count}</b><span className="spatial-review-stat-icon"><Icon aria-hidden="true"/></span><small>{label === 'Pass' ? 'Passed' : 'Failed'}</small></div>)}</div>
}
export function SpatialReviewSummary({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const [insights, setInsights] = useState(false)
  useMobileOverlay(insights, () => { setInsights(false); return true })
  const missing = spatialMissing(draft, photos)
  const stats = [{ count: flowCriteria.filter((_, i) => draft.answers[i] === 'met').length, label: 'Pass', Icon: Check }, { count: flowCriteria.filter((_, i) => draft.answers[i] === 'fail').length, label: 'Fail', Icon: X }]
  const failed = stats[1].count
  const critical = flowCriteria.filter(item => 'critical' in item)
  const criticalFailed = flowCriteria.filter((item, i) => 'critical' in item && draft.answers[i] === 'fail').length
  const outcome = spatialAssessmentOutcome(draft, photos)
  const result = outcome === 'Fail' ? 'Needs coaching' : outcome === 'Pending' ? 'Review in progress' : 'Pass'
  return <SpatialSurface className="overview-card spatial-review-summary"><CardHeader><CardTitle><h2>Dre’s result</h2></CardTitle><SpatialActionButton variant="ghost" onClick={() => setInsights(true)}>See Insights<ChevronRight aria-hidden="true"/></SpatialActionButton></CardHeader><CardContent><Badge variant="outline" className="spatial-review-outcome" data-result={outcome}>{outcome === 'Fail' ? <X aria-hidden="true"/> : <Check aria-hidden="true"/>}{result}</Badge><p className="spatial-review-result-detail">{criticalFailed ? `${criticalFailed} of ${critical.length} critical tasks not met.` : missing.length ? 'Record the remaining results and required evidence before continuing.' : `No critical tasks failed.${failed ? ' Review the failed tasks with Dre and agree on further practice.' : ' All tasks passed.'}`}</p><SpatialTaskStats draft={draft}/>{missing.length > 0 && <p role="status" className="spatial-review-note" data-attention="true"><ClipboardCheck aria-hidden="true"/><span>Check the highlighted items before continuing. Each result and required evidence must be recorded.</span></p>}</CardContent><Sheet open={insights} onOpenChange={setInsights}><SheetContent side="bottom" className="mobile-sheet flow-sheet mx-auto max-w-lg rounded-t-3xl"><SheetHeader><SheetTitle>Assessment insights</SheetTitle><SheetDescription>Dre Michael · Fryer Station</SheetDescription></SheetHeader><div className="px-5 pb-5 space-y-4"><p>{stats[0].count} of {flowCriteria.length} tasks passed.</p><p>{criticalFailed} of {critical.length} critical tasks failed.</p><p>Discuss failed tasks with Dre and agree on further practice before a future assessment.</p><SpatialActionButton variant="outline" onClick={() => setInsights(false)}>Close</SpatialActionButton></div></SheetContent></Sheet></SpatialSurface>
}
export function SpatialReviewNextSteps({ draft }: { draft: FlowDraft }) {
  const failed = Object.values(draft.answers).includes('fail')
  const steps = [failed ? 'Share feedback with Dre and agree on further practice.' : 'Share the results and feedback with Dre.', 'Continue to sign-off and collect the required acknowledgements.']
  return <SpatialSurface className="overview-card spatial-review-next"><CardHeader><CardTitle><h2>Next steps</h2></CardTitle></CardHeader><CardContent><ol>{steps.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span><p>{step}</p></li>)}</ol></CardContent></SpatialSurface>
}

export type ReviewEvidenceTarget = (index: number, node: HTMLDivElement | null) => void
export function SpatialReviewFilters({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const filters = [{ value: 'all', label: 'All' }, { value: 'failed', label: 'Failed' }, { value: 'passed', label: 'Passed' }, { value: 'critical', label: 'Critical' }] as const
  return <div className="spatial-review-filters"><TabsList aria-label="Filter tasks">{filters.map(filter => <TabsTrigger key={filter.value} value={filter.value}>{filter.label}<span className="spatial-review-tab-count">{spatialReviewIndices(draft, photos, filter.value).length}</span></TabsTrigger>)}</TabsList></div>
}
export function SpatialReviewCriterionRow({ index, draft, photos, onOpen }: { index: number; draft: FlowDraft; photos: Record<number, number>; onOpen: (trigger: HTMLButtonElement) => void }) {
  const id = useId(), item = flowCriteria[index]
  const result = spatialReviewResult(draft, photos, index)
  const Icon = result === 'Pass' ? Check : result === 'Fail' ? X : ClipboardCheck
  const comment = !!draft.notes[index]?.trim(), count = draft.completion?.photos[index] ?? photos[index] ?? 0
  return <SpatialActionButton variant="ghost" className="review-item" onClick={event => onOpen(event.currentTarget)} aria-label={`View: ${item.title}`} aria-describedby={`${id}${comment ? ` ${id}-comment` : ''}${count > 0 ? ` ${id}-photo` : ''}`} aria-haspopup="dialog"><span id={id} className="spatial-review-row-outcome" data-result={result}><Icon aria-hidden="true"/><span className="sr-only">{result}</span></span><span className="spatial-review-item-copy"><strong>{item.title}</strong><span className="spatial-review-item-meta"><Badge variant="secondary" className="spatial-badge">{item.section}</Badge>{'critical' in item && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}{count > 0 && <Badge id={`${id}-photo`} variant="secondary" className="spatial-review-evidence-tag"><Camera aria-hidden="true"/><span className="sr-only">{count} {count === 1 ? 'photo attached' : 'photos attached'}</span></Badge>}{comment && <Badge id={`${id}-comment`} variant="secondary" className="spatial-review-evidence-tag"><MessageCircle aria-hidden="true"/><span className="sr-only">Comment recorded</span></Badge>}</span>{result === 'Incomplete' && <small className="spatial-review-evidence-warning">{!draft.answers[index] || !['met','fail'].includes(draft.answers[index]) ? 'Response needed' : spatialEvidenceMessage(spatialEvidenceRequirement(index), draft.notes[index] ?? '', count)}</small>}</span><ChevronRight aria-hidden="true"/></SpatialActionButton>
}
export function SpatialReviewDetails({ index, draft, photos, onClose, onEdit, onEvidenceTarget, evidence, onRestoreFocus, onSaveObservation, registerClose }: { index: number; draft: FlowDraft; photos: Record<number, number>; onClose: () => void; onEdit: () => void; onEvidenceTarget?: ReviewEvidenceTarget; evidence?: ReactNode; onRestoreFocus: (event: Event) => void; onSaveObservation?: SaveObservation; registerClose: (request: (() => boolean) | null) => void }) {
  const criterion = flowCriteria[index], validation = spatialReviewResult(draft, photos, index)
  const result = draft.answers[index] === 'met' ? 'Pass' : draft.answers[index] === 'fail' ? 'Fail' : validation
  const title = useRef<HTMLHeadingElement>(null)
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null)
  const gallery = useCallback((node: HTMLDivElement | null) => onEvidenceTarget?.(index, node), [index, onEvidenceTarget])
  const requirement = spatialEvidenceRequirement(index)
  const observationId = useId()
  const [text, setText] = useState(draft.notes[index] ?? '')
  const [status, setStatus] = useState('')
  const [discard, setDiscard] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const saved = draft.notes[index] ?? ''
  const editable = !draft.assessorConfirmed && !!onSaveObservation
  const dirty = editable && text !== saved
  const required = requirement === 'comment' || requirement === 'comment-and-photo'
  function request(action: () => void): boolean {
    if (!dirty) { action(); return true }
    returnFocus.current = document.activeElement as HTMLElement
    pendingAction.current = action; setDiscard(true); return false
  }
  useLayoutEffect(() => {
    registerClose(() => request(onClose))
    return () => registerClose(null)
  })
  useMobileOverlay(discard, () => { setDiscard(false); return true })
  return <><SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-review-details mx-auto" onCloseAutoFocus={onRestoreFocus} onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus({ preventScroll: true }) }}>
    <SpatialActionButton variant="ghost" className="spatial-review-sheet-handle" aria-label="Close task details" onClick={() => request(onClose)} onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={event => { const from = swipe.current; swipe.current = null; if (from?.id !== event.pointerId) return; const dx = event.clientX - from.x, dy = event.clientY - from.y; if (dy > 48 && dy > Math.abs(dx) * 1.25) request(onClose) }} onPointerCancel={() => { swipe.current = null }}><span aria-hidden="true"/></SpatialActionButton>
    <SheetHeader><SheetTitle ref={title} tabIndex={-1} className="outline-none">Task details</SheetTitle><SheetDescription>{index + 1} of {flowCriteria.length} · {criterion.section}</SheetDescription></SheetHeader>
    <div className="spatial-review-detail-body"><section aria-label="Task"><div className="spatial-badges"><Badge variant="secondary" className="spatial-badge">{criterion.section}</Badge>{'critical' in criterion && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}</div><h3>{criterion.title}</h3><p>{criterion.desc}</p></section>
    <section aria-label="Recorded result"><h4>Recorded result</h4><Badge variant="outline" className="spatial-review-outcome" data-result={result}>{result}</Badge>{validation === 'Incomplete' && <p role="status">{draft.answers[index] === 'met' || draft.answers[index] === 'fail' ? `Recorded response: ${draft.answers[index] === 'met' ? 'Pass' : 'Fail'}. ${spatialEvidenceMessage(requirement, draft.notes[index] ?? '', photos[index] ?? 0)}.` : 'No Pass or Fail response recorded.'}</p>}</section>
    <Separator/>
    <section aria-labelledby={`${observationId}-label`} className="spatial-review-observation"><h4 id={`${observationId}-label`}>Rosa’s observation<span className="sr-only">: {criterion.title}</span></h4>{editable ? <>
      <Textarea ref={textarea} value={text} onChange={event => { setText(event.target.value); setStatus('') }} placeholder="Add a comment..." aria-labelledby={`${observationId}-label`} aria-describedby={`${observationId}-visibility${required ? ` ${observationId}-required` : ''}`} aria-required={required} aria-invalid={required && !text.trim() || undefined} onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' })}/>
      <p id={`${observationId}-visibility`} className="spatial-comment-visibility">Visible to Dre and other authorised users</p>
      {required && <p id={`${observationId}-required`} className="spatial-review-required">{!text.trim() ? 'Comment required before submission. You can save this draft and add it later.' : 'Comment required'}</p>}
      {dirty && <div className="spatial-observation-actions"><SpatialActionButton variant="outline" onClick={() => { setText(saved); setStatus('Changes cancelled.'); textarea.current?.focus({ preventScroll: true }) }}>Cancel</SpatialActionButton><SpatialActionButton onClick={() => {
        if (onSaveObservation?.(index, text)) { setStatus('Comment saved on this device.'); textarea.current?.focus({ preventScroll: true }) }
        else setStatus('Unable to save changes. Keep this sheet open and try again.')
      }}>Save changes</SpatialActionButton></div>}
      <span role="status" aria-live="polite" className={status.startsWith('Unable') ? 'spatial-review-required' : 'sr-only'}>{status || (dirty ? 'Unsaved comment changes.' : '')}</span>
    </> : <><p className="spatial-review-original-note">{saved.trim() ? saved : 'No observation added.'}</p><p className="spatial-comment-visibility">Visible to Dre and other authorised users</p></>}</section>
    {(photos[index] ?? 0) > 0 && <section aria-label="Attached photos"><h4>Attached photos</h4><div ref={gallery} className="flow-gallery spatial-attachments">{evidence}</div><p className="spatial-review-photo-note">Photos are available in this page session.</p></section>}{draft.completion && (draft.completion.photos[index] ?? 0) > 0 && !(photos[index] > 0) && <p className="spatial-review-photo-note">Photo evidence was recorded at completion. The original photo is unavailable in this page session.</p>}
    </div><div className="spatial-review-detail-actions"><SpatialActionButton variant="outline" onClick={() => request(onClose)}>Close</SpatialActionButton>{!draft.completion && !draft.assessorConfirmed && <SpatialActionButton onClick={() => request(onEdit)}>Edit observation<ChevronRight aria-hidden="true"/></SpatialActionButton>}</div>
  </SheetContent><AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true }) }}><AlertDialogHeader><AlertDialogTitle>Discard comment changes?</AlertDialogTitle><AlertDialogDescription>Your unsaved comment will be lost. The saved observation will stay unchanged.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => { setDiscard(false); pendingAction.current?.() }}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
}
export type SaveObservation = (index: number, value: string) => boolean
export function SpatialReviewList({ draft, photos, onEdit, onEvidenceTarget, evidence, onSaveObservation }: { draft: FlowDraft; photos: Record<number, number>; onEdit: (index: number) => void; onEvidenceTarget?: ReviewEvidenceTarget; evidence?: (index: number) => ReactNode; onSaveObservation?: SaveObservation }) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<SpatialReviewFilter>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const closeRequest = useRef<(() => boolean) | null>(null)
  const registerClose = useCallback((request: (() => boolean) | null) => { closeRequest.current = request }, [])
  const indices = spatialReviewIndices(draft, photos, filter)
  useMobileOverlay(selected !== null, () => closeRequest.current?.() ?? true)
  return <><SpatialSurface ref={list} elevation="quiet" className="overview-card overview-sections spatial-review-list"><Tabs value={filter} onValueChange={value => { setFilter(value as SpatialReviewFilter); setExpanded(false) }} className="spatial-review-tabs"><CardHeader><CardTitle><h2>Tasks</h2></CardTitle><SpatialReviewFilters draft={draft} photos={photos}/></CardHeader><TabsContent value={filter}><CardContent><span role="status" className="sr-only">{indices.length} {filter === 'all' ? '' : filter} tasks shown.</span>{(draft.completion && !expanded ? indices.slice(0, 4) : indices).map(index => <SpatialReviewCriterionRow key={index} index={index} draft={draft} photos={photos} onOpen={button => { trigger.current = button; setSelected(index) }}/>) }{draft.completion && indices.length > 4 && <div className="spatial-review-view-all"><SpatialActionButton variant="outline" onClick={() => setExpanded(value => !value)}>{expanded ? 'Show Less' : 'View All'}</SpatialActionButton></div>}{!indices.length && <div className="spatial-review-filter-empty"><ClipboardCheck aria-hidden="true"/><p>No {filter} tasks to review.</p></div>}</CardContent></TabsContent></Tabs></SpatialSurface><Sheet open={selected !== null} onOpenChange={open => { if (!open) closeRequest.current?.() }}>{selected !== null && <SpatialReviewDetails key={selected} index={selected} registerClose={registerClose} onSaveObservation={onSaveObservation} draft={draft} photos={photos} onClose={() => setSelected(null)} onEdit={() => { const index = selected; setSelected(null); onEdit(index) }} onEvidenceTarget={onEvidenceTarget} evidence={evidence?.(selected)} onRestoreFocus={event => { const target = trigger.current?.isConnected ? trigger.current : list.current?.querySelector<HTMLElement>('[role=tab][data-state=active]'); if (target) { event.preventDefault(); target.focus({ preventScroll: true }) } }}/>}</Sheet></>
}
export function SpatialFeedbackCard({ draft, onFeedback }: { draft: FlowDraft; onFeedback: (value: string) => void }) {
  const id = useId()
  const failed = Object.values(draft.answers).includes('fail')
  return <SpatialSurface className="overview-card"><CardHeader><CardTitle><h2>{failed ? 'Next steps for Dre' : 'What went well'}</h2></CardTitle></CardHeader><CardContent><Badge variant="outline" className={`pill ${failed ? 'warn' : 'good'}`}>{failed ? 'Feedback needed' : 'Observations complete'}</Badge><p className="overview-description spaced">{failed ? 'Discuss the steps that need more practice and agree on the next opportunity to demonstrate them.' : 'Share the strengths you observed and discuss the results together.'}</p><label className="fieldlabel" htmlFor={id}>Feedback for Dre</label><Textarea id={id} value={draft.feedback} onChange={event => onFeedback(event.target.value)} placeholder="What went well? What should Dre practise next?"/></CardContent></SpatialSurface>
}
export function SpatialApprovals({ confirmed, managerRequired = false }: { confirmed: boolean; managerRequired?: boolean }) {
  const people = [{ name: 'Rosa Thompson', role: 'Qualified assessor', description: 'Confirm your review after discussing the results with Dre.', status: confirmed ? 'Local review' : 'Pending', Icon: ClipboardCheck }, { name: 'Dre Michael', role: 'Team member', description: 'Dre’s acknowledgement has not been collected.', status: 'Not collected', Icon: UserRound }, ...(managerRequired ? [{ name: 'Manager', role: 'Countersign', description: 'Manager approval is required for this assessment.', status: 'Pending', Icon: ShieldCheck }] : [])]
  return <SpatialSurface elevation="quiet" className="overview-card overview-sections"><CardHeader><CardTitle><h2>Review and acknowledgement</h2></CardTitle></CardHeader><CardContent>{people.map(({ name, role, description, status, Icon }) => <div className="approval-row" key={name}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><div><strong>{name}</strong><small>{role}</small><p>{description}</p></div><Badge variant="outline" className={status === 'Local review' ? 'pill good' : ''}>{status}</Badge></div>)}</CardContent></SpatialSurface>
}
