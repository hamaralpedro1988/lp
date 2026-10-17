import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { flowCriteria, flowEvidenceOk, type FlowDraft } from '@/data/flow-draft'
import { spatialCompleteIndices } from '@/data/spatial-flow'

export function SpatialProgress({ draft, photos, saveError }: { draft: FlowDraft; photos: Record<number, number>; saveError: boolean }) {
  const completed = spatialCompleteIndices(draft, photos)
  return <>
    <div className="spatial-segments" role="progressbar" aria-label="Criteria complete" aria-valuemin={0} aria-valuemax={flowCriteria.length} aria-valuenow={completed.length} aria-valuetext={`${completed.length} of ${flowCriteria.length} criteria complete, including required evidence`}>
      {flowCriteria.map((criterion, index) => <span key={criterion.title} aria-hidden="true" data-state={completed.includes(index) ? 'complete' : index === draft.index ? 'current' : 'pending'}/>)}
    </div>
    <div className="spatial-progress-copy"><strong>{completed.length} of {flowCriteria.length} complete</strong><span role="status">{saveError ? 'Local save unavailable' : draft.offline ? 'Offline · local draft' : 'Saved on this device'}</span></div>
  </>
}

export function SpatialSections({ draft, photos, onJump }: { draft: FlowDraft; photos: Record<number, number>; onJump: (index: number) => void }) {
  const completed = spatialCompleteIndices(draft, photos)
  return <nav className="spatial-section-list" aria-label="All assessment criteria">
    {(['Preparation', 'Frying', 'Completion'] as const).map(section => {
      const items = flowCriteria.map((criterion, index) => ({ ...criterion, index })).filter(item => item.section === section)
      return <section key={section}><h3>{section}<span>{items.filter(item => completed.includes(item.index)).length} / {items.length} complete</span></h3>
        {items.map(item => {
          const done = completed.includes(item.index)
          const status = done ? 'Complete' : !draft.answers[item.index] || draft.answers[item.index] === 'notObserved' ? 'Not recorded' : !flowEvidenceOk(draft, item.index, photos) ? 'Evidence needed' : 'Not recorded'
          return <Button key={item.index} variant="ghost" className="spatial-criterion-link" data-current={draft.index === item.index || undefined} onClick={() => onJump(item.index)} aria-current={draft.index === item.index ? 'step' : undefined}>
            <span className="spatial-criterion-number" data-complete={done || undefined}>{done ? <Check aria-hidden="true"/> : item.index + 1}</span>
            <span><strong>{item.title}</strong><small>{draft.index === item.index ? 'Current · ' : ''}{status}{'critical' in item ? ' · Critical' : ''}</small></span><ChevronRight aria-hidden="true"/>
          </Button>
        })}
      </section>
    })}
  </nav>
}
