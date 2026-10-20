import { emptySpatialDraft } from './spatial-flow'
import { flowCriteria, type FlowDraft } from './flow-draft'

export const spatialPreviewPages = [
  { id: 'overview', label: 'Assessment Overview' },
  { id: 'live', label: 'Live Assessment · Task 1' },
  { id: 'finish', label: 'Finish Assessment' },
  { id: 'result', label: 'Assessment Result' },
  { id: 'submission', label: 'Assessment Submission' },
] as const
export type SpatialPreviewPage = typeof spatialPreviewPages[number]['id']
export function spatialPreviewDraft(page: SpatialPreviewPage): FlowDraft {
  const draft = emptySpatialDraft()
  if (page === 'overview') return { ...draft, screen: 'overview' }
  if (page === 'live') return { ...draft, screen: 'assessment', index: 0 }
  const observed: FlowDraft = { ...draft, screen: 'assessment', index: 10,
    answers: Object.fromEntries(flowCriteria.map((_, i) => [i, i === 4 || i === 6 ? 'fail' : 'met'])),
    notes: { 8: 'Example observation: product quality checked against the station standard.' } }
  if (page === 'finish') return observed
  // Isolated display fixture, never written to the participant assessment storage.
  return { ...observed, screen: page === 'result' ? 'review' : 'signoff',
    completion: { at: '2026-10-19T09:41:00Z', photos: { 8: 1 } } }
}
