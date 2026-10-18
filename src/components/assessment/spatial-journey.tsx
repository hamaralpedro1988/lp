import dreAvatar from '@/assets/dre-jackson.png'
import { spatialEvidenceOk, spatialMissing, spatialEvidenceMessage, spatialEvidenceRequirement } from '@/data/spatial-flow'
import { useId, useState } from 'react'
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

export function SpatialReviewList({ draft, photos, onEdit }: { draft: FlowDraft; photos: Record<number, number>; onEdit: (index: number) => void }) {
  const id = useId()
  return <SpatialSurface elevation="quiet" className="overview-card overview-sections spatial-review-list"><CardHeader><CardTitle><h2>Criteria</h2></CardTitle></CardHeader><CardContent>{flowCriteria.map((item, i) => {
    const answer = draft.answers[i]
    const result = answer === 'met' ? 'Pass' : answer === 'fail' ? 'Fail' : 'Response needed'
    const Icon = answer === 'met' ? Check : answer === 'fail' ? X : ClipboardCheck
    const evidenceMissing = !spatialEvidenceOk(draft, i, photos)
    const comment = !!draft.notes[i]?.trim()
    const count = photos[i] ?? 0
    return <SpatialActionButton key={item.title} variant="ghost" className="review-item" onClick={() => onEdit(i)} aria-label={`Edit: ${item.title}`} aria-describedby={`${id}-${i}`}><span id={`${id}-${i}`} className="spatial-review-row-outcome" data-result={result}><Icon aria-hidden="true"/><span className="sr-only">{result}</span></span><span className="spatial-review-item-copy"><strong>{item.title}</strong><span className="spatial-review-item-meta"><Badge variant="secondary" className="spatial-badge">{item.section}</Badge>{'critical' in item && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}{comment && <span><MessageSquare aria-hidden="true"/>Comment</span>}{count > 0 && <span><Camera aria-hidden="true"/>{count} {count === 1 ? 'photo' : 'photos'}</span>}</span>{evidenceMissing && <small className="spatial-review-evidence-warning">{spatialEvidenceMessage(spatialEvidenceRequirement(i), draft.notes[i] ?? '', count)}</small>}</span><ChevronRight aria-hidden="true"/></SpatialActionButton>
  })}</CardContent></SpatialSurface>
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
