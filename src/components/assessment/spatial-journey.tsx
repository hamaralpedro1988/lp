import dreAvatar from '@/assets/dre-jackson.png'
import { spatialMissing, spatialEvidenceMessage, spatialEvidenceRequirement } from '@/data/spatial-flow'
import { useCallback, useId, useRef, useState, type ReactNode } from 'react'
import { Camera, Check, ChevronRight, ClipboardCheck, MessageSquare, ShieldCheck, UserRound, X } from 'lucide-react'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { spatialReviewIndices, spatialReviewResult, type SpatialReviewFilter } from '@/data/spatial-review'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { flowCriteria, type FlowDraft } from '@/data/flow-draft'
import { SpatialActionButton, SpatialSurface } from './spatial-primitives'

export function SpatialAssignmentCard({ status, onOpen }: { status: string; onOpen: () => void }) {
  return <SpatialSurface className="overview-card"><CardHeader><CardTitle><h2>Assigned assessment</h2></CardTitle></CardHeader><CardContent><div className="flow-card-heading"><h3>Fryer Station</h3><Badge variant="outline" className="overview-status">{status}</Badge></div><p className="overview-category">Food Process &amp; Safety</p><div className="flow-person"><span className="overview-goal-icon"><UserRound aria-hidden="true"/></span><div><strong>Dre Jackson</strong><small>Crew Floor Member</small></div></div><Separator className="my-4"/><div className="flow-card-detail"><span>{flowCriteria.length} criteria</span><span>Assessor · Rosa Thompson</span></div><SpatialActionButton className="overview-start spaced" onClick={onOpen}>View Assessment<ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent></SpatialSurface>
}
export function SpatialPeopleCard({ status, onMember, compact = false }: { status: string; onMember: () => void; compact?: boolean }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  return <SpatialSurface className={`overview-card ${compact ? 'spatial-review-member' : ''}`}><CardContent className="overview-member-content"><SpatialActionButton variant="ghost" className="overview-member" onClick={onMember} aria-label="View team member Dre Jackson"><span className="overview-avatar" aria-hidden="true">{compact && !photoFailed ? <img src={dreAvatar} alt="" width={40} height={40} onError={() => setPhotoFailed(true)}/> : <UserRound/>}</span><span className="overview-person-copy"><span>Dre Jackson</span><small>Crew Floor Member</small></span><ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent>{!compact && <><Separator/><CardContent className="overview-metadata"><div><span>Assessment status</span><Badge variant="outline" className="overview-status">{status}</Badge></div><div><span>Qualified assessor</span><strong>Rosa Thompson (you)</strong></div></CardContent></>}</SpatialSurface>
}
export function SpatialReviewSummary({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const missing = spatialMissing(draft, photos)
  const stats = [{ count: flowCriteria.filter((_, i) => draft.answers[i] === 'met').length, label: 'Pass', Icon: Check }, { count: flowCriteria.filter((_, i) => draft.answers[i] === 'fail').length, label: 'Fail', Icon: X }]
  const failed = stats[1].count
  const critical = flowCriteria.filter(item => 'critical' in item)
  const criticalFailed = flowCriteria.filter((item, i) => 'critical' in item && draft.answers[i] === 'fail').length
  const result = failed ? 'Needs coaching' : missing.length ? 'Review in progress' : 'All criteria met'
  return <SpatialSurface className="overview-card spatial-review-summary"><CardHeader><CardTitle><h2>Result</h2></CardTitle></CardHeader><CardContent><Badge variant="outline" className="spatial-review-outcome" data-result={failed ? 'Fail' : missing.length ? 'Pending' : 'Pass'}>{result}</Badge><p className="spatial-review-result-detail">{criticalFailed ? `${criticalFailed} of ${critical.length} critical criteria not met.` : failed ? `${failed} ${failed === 1 ? 'criterion needs' : 'criteria need'} further practice.` : missing.length ? 'Record the remaining results and required evidence before continuing.' : `All ${flowCriteria.length} criteria and required evidence recorded.`}</p><div className="review-stats">{stats.map(({ count, label, Icon }) => <div className="review-stat" data-result={label} key={label}><b>{count}</b><span className="spatial-review-stat-icon"><Icon aria-hidden="true"/></span><small>{label === 'Pass' ? 'Passed' : 'Failed'}</small></div>)}</div>{missing.length > 0 && <p role="status" className="spatial-review-note" data-attention="true"><ClipboardCheck aria-hidden="true"/><span>Check the highlighted items before continuing. Each result and required evidence must be recorded.</span></p>}</CardContent></SpatialSurface>
}
export function SpatialReviewNextSteps({ draft }: { draft: FlowDraft }) {
  const failed = Object.values(draft.answers).includes('fail')
  const steps = [failed ? 'Review the observations with Dre, including the criteria that need more practice.' : 'Review the observations with Dre.', 'Continue to feedback and sign-off.']
  return <SpatialSurface className="overview-card spatial-review-next"><CardHeader><CardTitle><h2>What next</h2></CardTitle></CardHeader><CardContent><ol>{steps.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span><p>{step}</p></li>)}</ol></CardContent></SpatialSurface>
}

export type ReviewEvidenceTarget = (index: number, node: HTMLDivElement | null) => void
export function SpatialReviewFilters({ value, onChange, draft, photos }: { value: SpatialReviewFilter; onChange: (value: SpatialReviewFilter) => void; draft: FlowDraft; photos: Record<number, number> }) {
  const filters = [{ value: 'all', label: 'All' }, { value: 'passed', label: 'Passed' }, { value: 'failed', label: 'Failed' }, { value: 'critical', label: 'Critical' }] as const
  return <div className="spatial-review-filters" role="group" aria-label="Filter criteria">{filters.map(filter => <SpatialActionButton key={filter.value} variant="outline" aria-pressed={value === filter.value} onClick={() => onChange(filter.value)}>{filter.label}<span>{spatialReviewIndices(draft, photos, filter.value).length}</span></SpatialActionButton>)}</div>
}
export function SpatialReviewCriterionRow({ index, draft, photos, onOpen }: { index: number; draft: FlowDraft; photos: Record<number, number>; onOpen: (trigger: HTMLButtonElement) => void }) {
  const id = useId(), item = flowCriteria[index]
  const result = spatialReviewResult(draft, photos, index)
  const Icon = result === 'Pass' ? Check : result === 'Fail' ? X : ClipboardCheck
  const comment = !!draft.notes[index]?.trim(), count = photos[index] ?? 0
  return <SpatialActionButton variant="ghost" className="review-item" onClick={event => onOpen(event.currentTarget)} aria-label={`View: ${item.title}`} aria-describedby={id} aria-haspopup="dialog"><span id={id} className="spatial-review-row-outcome" data-result={result}><Icon aria-hidden="true"/><span className="sr-only">{result}</span></span><span className="spatial-review-item-copy"><strong>{item.title}</strong><span className="spatial-review-item-meta"><Badge variant="secondary" className="spatial-badge">{item.section}</Badge>{'critical' in item && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}{comment && <span><MessageSquare aria-hidden="true"/>Comment</span>}{count > 0 && <span><Camera aria-hidden="true"/>{count} {count === 1 ? 'photo' : 'photos'}</span>}</span>{result === 'Incomplete' && <small className="spatial-review-evidence-warning">{!draft.answers[index] || !['met','fail'].includes(draft.answers[index]) ? 'Response needed' : spatialEvidenceMessage(spatialEvidenceRequirement(index), draft.notes[index] ?? '', count)}</small>}</span><ChevronRight aria-hidden="true"/></SpatialActionButton>
}
export function SpatialReviewDetails({ index, draft, photos, onClose, onEdit, onEvidenceTarget, evidence, onRestoreFocus }: { index: number; draft: FlowDraft; photos: Record<number, number>; onClose: () => void; onEdit: () => void; onEvidenceTarget?: ReviewEvidenceTarget; evidence?: ReactNode; onRestoreFocus: (event: Event) => void }) {
  const criterion = flowCriteria[index], result = spatialReviewResult(draft, photos, index)
  const title = useRef<HTMLHeadingElement>(null)
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null)
  const gallery = useCallback((node: HTMLDivElement | null) => onEvidenceTarget?.(index, node), [index, onEvidenceTarget])
  const requirement = spatialEvidenceRequirement(index)
  const requirements = { none: 'No evidence required.', comment: 'Comment required.', photo: 'Photo required.', 'comment-and-photo': 'Comment and photo required.' }
  return <SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-review-details mx-auto" onCloseAutoFocus={onRestoreFocus} onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus({ preventScroll: true }) }}>
    <SpatialActionButton variant="ghost" className="spatial-review-sheet-handle" aria-label="Close criterion details" onClick={onClose} onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={event => { const from = swipe.current; swipe.current = null; if (from?.id !== event.pointerId) return; const dx = event.clientX - from.x, dy = event.clientY - from.y; if (dy > 48 && dy > Math.abs(dx) * 1.25) onClose() }} onPointerCancel={() => { swipe.current = null }}><span aria-hidden="true"/></SpatialActionButton>
    <SheetHeader><SheetTitle ref={title} tabIndex={-1} className="outline-none">Criterion details</SheetTitle><SheetDescription>{index + 1} of {flowCriteria.length} · {criterion.section}</SheetDescription></SheetHeader>
    <div className="spatial-review-detail-body"><section aria-label="Criterion"><div className="spatial-badges"><Badge variant="secondary" className="spatial-badge">{criterion.section}</Badge>{'critical' in criterion && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}</div><h3>{criterion.title}</h3><p>{criterion.desc}</p></section>
    <section aria-label="Recorded result"><h4>Recorded result</h4><Badge variant="outline" className="spatial-review-outcome" data-result={result}>{result}</Badge>{result === 'Incomplete' && <p>{draft.answers[index] === 'met' || draft.answers[index] === 'fail' ? `Recorded response: ${draft.answers[index] === 'met' ? 'Pass' : 'Fail'}. ${spatialEvidenceMessage(requirement, draft.notes[index] ?? '', photos[index] ?? 0)}.` : 'No Pass or Fail response recorded.'}</p>}</section>
    <section aria-label="Context"><h4>Context</h4><p>Section: {criterion.section}.</p>{'critical' in criterion && <p>This criterion is marked critical.</p>}<p>{requirements[requirement]}</p></section><Separator/>
    <section aria-label="Rosa’s observation"><h4>Rosa’s observation</h4><p className="spatial-review-original-note">{draft.notes[index]?.trim() ? draft.notes[index] : 'No observation added.'}</p></section>
    {(photos[index] ?? 0) > 0 && <section aria-label="Attached photos"><h4>Attached photos</h4><div ref={gallery} className="flow-gallery spatial-attachments">{evidence}</div><p className="spatial-review-photo-note">Photos are available in this page session.</p></section>}
    </div><div className="spatial-review-detail-actions"><SpatialActionButton variant="outline" onClick={onClose}>Close</SpatialActionButton><SpatialActionButton onClick={onEdit}>Edit observation<ChevronRight aria-hidden="true"/></SpatialActionButton></div>
  </SheetContent>
}
export function SpatialReviewList({ draft, photos, onEdit, onEvidenceTarget, evidence }: { draft: FlowDraft; photos: Record<number, number>; onEdit: (index: number) => void; onEvidenceTarget?: ReviewEvidenceTarget; evidence?: (index: number) => ReactNode }) {
  const [filter, setFilter] = useState<SpatialReviewFilter>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const indices = spatialReviewIndices(draft, photos, filter)
  useMobileOverlay(selected !== null, () => { setSelected(null); return true })
  return <><SpatialSurface elevation="quiet" className="overview-card overview-sections spatial-review-list"><CardHeader><CardTitle><h2>Criteria</h2></CardTitle><SpatialReviewFilters value={filter} onChange={setFilter} draft={draft} photos={photos}/></CardHeader><CardContent><span role="status" className="sr-only">{indices.length} {filter === 'all' ? '' : filter} criteria shown.</span>{indices.map(index => <SpatialReviewCriterionRow key={index} index={index} draft={draft} photos={photos} onOpen={button => { trigger.current = button; setSelected(index) }}/>) }{!indices.length && <div className="spatial-review-filter-empty"><ClipboardCheck aria-hidden="true"/><p>No {filter} criteria to review.</p></div>}</CardContent></SpatialSurface><Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}>{selected !== null && <SpatialReviewDetails index={selected} draft={draft} photos={photos} onClose={() => setSelected(null)} onEdit={() => { const index = selected; setSelected(null); onEdit(index) }} onEvidenceTarget={onEvidenceTarget} evidence={evidence?.(selected)} onRestoreFocus={event => { if (trigger.current?.isConnected) { event.preventDefault(); trigger.current.focus({ preventScroll: true }) } }}/>}</Sheet></>
}
export function SpatialFeedbackCard({ draft, onFeedback }: { draft: FlowDraft; onFeedback: (value: string) => void }) {
  const id = useId()
  const failed = Object.values(draft.answers).includes('fail')
  return <SpatialSurface className="overview-card"><CardHeader><CardTitle><h2>{failed ? 'Next steps for Dre' : 'What went well'}</h2></CardTitle></CardHeader><CardContent><Badge variant="outline" className={`pill ${failed ? 'warn' : 'good'}`}>{failed ? 'Feedback needed' : 'Observations complete'}</Badge><p className="overview-description spaced">{failed ? 'Discuss the steps that need more practice and agree on the next opportunity to demonstrate them.' : 'Share the strengths you observed and discuss the results together.'}</p><label className="fieldlabel" htmlFor={id}>Feedback for Dre</label><Textarea id={id} value={draft.feedback} onChange={event => onFeedback(event.target.value)} placeholder="What went well? What should Dre practise next?"/></CardContent></SpatialSurface>
}
export function SpatialApprovals({ confirmed, managerRequired = false }: { confirmed: boolean; managerRequired?: boolean }) {
  const people = [{ name: 'Rosa Thompson', role: 'Qualified assessor', description: 'Confirm your review after discussing the results with Dre.', status: confirmed ? 'Local review' : 'Pending', Icon: ClipboardCheck }, { name: 'Dre Jackson', role: 'Team member', description: 'Dre’s acknowledgement has not been collected.', status: 'Not collected', Icon: UserRound }, ...(managerRequired ? [{ name: 'Manager', role: 'Countersign', description: 'Manager approval is required for this assessment.', status: 'Pending', Icon: ShieldCheck }] : [])]
  return <SpatialSurface elevation="quiet" className="overview-card overview-sections"><CardHeader><CardTitle><h2>Review and acknowledgement</h2></CardTitle></CardHeader><CardContent>{people.map(({ name, role, description, status, Icon }) => <div className="approval-row" key={name}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><div><strong>{name}</strong><small>{role}</small><p>{description}</p></div><Badge variant="outline" className={status === 'Local review' ? 'pill good' : ''}>{status}</Badge></div>)}</CardContent></SpatialSurface>
}
