import { flowCriteria, type FlowDraft } from './flow-draft.ts'
import { spatialEvidenceOk } from './spatial-flow.ts'

export type SpatialReviewFilter = 'all' | 'passed' | 'failed' | 'critical'
export function spatialReviewResult(draft: FlowDraft, photos: Record<number, number>, index: number): 'Pass' | 'Fail' | 'Incomplete' {
  if (!spatialEvidenceOk(draft, index, photos)) return 'Incomplete'
  return draft.answers[index] === 'met' ? 'Pass' : draft.answers[index] === 'fail' ? 'Fail' : 'Incomplete'
}
export function spatialReviewIndices(draft: FlowDraft, photos: Record<number, number>, filter: SpatialReviewFilter) {
  return flowCriteria.flatMap((criterion, index) => {
    const result = spatialReviewResult(draft, photos, index)
    return filter === 'all' || (filter === 'critical' ? 'critical' in criterion : result === (filter === 'passed' ? 'Pass' : 'Fail')) ? [index] : []
  })
}
