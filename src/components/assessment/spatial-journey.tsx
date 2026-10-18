import { spatialEvidenceOk, spatialMissing, spatialEvidenceMessage, spatialEvidenceRequirement } from '@/data/spatial-flow'
import { useId } from 'react'
import { Camera, Check, ChevronRight, ClipboardCheck, MessageSquare, ShieldCheck, UserRound, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { flowCriteria, type FlowDraft } from '@/data/flow-draft'
import { SpatialActionButton, SpatialSurface } from './spatial-primitives'

export function SpatialAssignmentCard({ status, onOpen }: { status: string; onOpen: () => void }) {
  return <SpatialSurface className="overview-card"><CardHeader><CardTitle><h2>Assigned assessment</h2></CardTitle></CardHeader><CardContent><div className="flow-card-heading"><h3>Fryer Station</h3><Badge variant="outline" className="overview-status">{status}</Badge></div><p className="overview-category">Food Process &amp; Safety</p><div className="flow-person"><span className="overview-goal-icon"><UserRound aria-hidden="true"/></span><div><strong>Dre Jackson</strong><small>Crew Floor Member</small></div></div><Separator className="my-4"/><div className="flow-card-detail"><span>{flowCriteria.length} criteria</span><span>Assessor · Rosa Thompson</span></div><SpatialActionButton className="overview-start spaced" onClick={onOpen}>View Assessment<ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent></SpatialSurface>
}
export function SpatialPeopleCard({ status, onMember }: { status: string; onMember: () => void }) {
  return <SpatialSurface className="overview-card"><CardContent className="overview-member-content"><SpatialActionButton variant="ghost" className="overview-member" onClick={onMember} aria-label="View team member Dre Jackson"><span className="overview-avatar" aria-hidden="true"><UserRound/></span><span className="overview-person-copy"><span>Dre Jackson</span><small>Crew Floor Member</small></span><ChevronRight aria-hidden="true"/></SpatialActionButton></CardContent><Separator/><CardContent className="overview-metadata"><div><span>Assessment status</span><Badge variant="outline" className="overview-status">{status}</Badge></div><div><span>Qualified assessor</span><strong>Rosa Thompson (you)</strong></div></CardContent></SpatialSurface>
}
export function SpatialReviewSummary({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const missing = spatialMissing(draft, photos)
  const stats = [{ count: flowCriteria.filter((_, i) => draft.answers[i] === 'met').length, label: 'Pass', Icon: Check }, { count: flowCriteria.filter((_, i) => draft.answers[i] === 'fail').length, label: 'Fail', Icon: X }]
  return <SpatialSurface className="overview-card spatial-review-summary"><CardHeader><CardTitle><h2>Assessment results</h2></CardTitle><p className="spatial-review-caption">{flowCriteria.length} criteria · 3 sections</p></CardHeader><CardContent><div className="review-stats">{stats.map(({ count, label, Icon }) => <div className="review-stat" data-result={label} key={label}><Icon aria-hidden="true"/><b>{count}</b><small>{label}</small></div>)}</div><p role="status" className="spatial-review-note" data-attention={!!missing.length}><ClipboardCheck aria-hidden="true"/><span>{missing.length ? 'Check the highlighted items before continuing. Each result and required evidence must be recorded.' : 'Review the observations with Dre before continuing to feedback and sign-off.'}</span></p></CardContent></SpatialSurface>
}
export function SpatialReviewList({ draft, photos, onEdit }: { draft: FlowDraft; photos: Record<number, number>; onEdit: (index: number) => void }) {
  const id = useId()
  return <SpatialSurface elevation="quiet" className="overview-card overview-sections spatial-review-list"><CardHeader><CardTitle><h2>Observations</h2></CardTitle><p className="spatial-review-caption">Select a criterion to review or edit.</p></CardHeader><CardContent>{(['Preparation', 'Frying', 'Completion'] as const).map((section, sectionIndex) => <section className="review-section" key={section} aria-labelledby={`${id}-${sectionIndex}`}><h3 id={`${id}-${sectionIndex}`}>{section}<span>{flowCriteria.filter(item => item.section === section).length} criteria</span></h3>{flowCriteria.map((item, i) => {
    if (item.section !== section) return null
    const answer = draft.answers[i]
    const result = answer === 'met' ? 'Pass' : answer === 'fail' ? 'Fail' : 'Response needed'
    const evidenceMissing = !spatialEvidenceOk(draft, i, photos)
    const comment = !!draft.notes[i]?.trim()
    const count = photos[i] ?? 0
    return <SpatialActionButton key={item.title} variant="ghost" className="review-item" onClick={() => onEdit(i)} aria-label={`Edit: ${item.title}`}><span className="spatial-review-item-copy"><strong>{item.title}</strong><span className="spatial-review-item-meta"><span className="spatial-review-result" data-result={result}>{result}</span>{'critical' in item && <span className="spatial-review-critical">Critical</span>}{comment && <span><MessageSquare aria-hidden="true"/>Comment</span>}{count > 0 && <span><Camera aria-hidden="true"/>{count} {count === 1 ? 'photo' : 'photos'}</span>}</span>{evidenceMissing && <small className="spatial-review-evidence-warning">{spatialEvidenceMessage(spatialEvidenceRequirement(i), draft.notes[i] ?? '', count)}</small>}</span><ChevronRight aria-hidden="true"/></SpatialActionButton>
  })}</section>)}</CardContent></SpatialSurface>
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
