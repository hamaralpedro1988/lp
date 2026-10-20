import type { FlowDraft } from './flow-draft.ts'
import { flowCriteria } from './flow-draft.ts'
import { spatialCompleteIndices } from './spatial-flow.ts'

/** Prototype UX assumption only; no scoring/backend policy is introduced. */
export const spatialChecklistPolicy = { sequential: true }
export const spatialChecklistDescription = 'Review completed tasks, continue your current assessment, or preview upcoming criteria.'
export function spatialActiveIndex(draft: FlowDraft) { return draft.activeIndex ?? draft.index }
export function spatialChecklistItem(draft: FlowDraft, photos: Record<number, number>, index: number) {
  const active = spatialActiveIndex(draft)
  const complete = spatialCompleteIndices(draft, photos).includes(index)
  // A formerly completed observation may need evidence again after an edit.
  const recorded = index < active
  const kind = index === active ? 'current' : complete ? 'complete' : recorded ? 'recorded' : 'upcoming'
  return { kind, complete, previewOnly: !!draft.completion || spatialChecklistPolicy.sequential && kind === 'upcoming' }
}
/** Viewing/editing an earlier observation never moves the active sequence. */
export function spatialSelectChecklistTask(draft: FlowDraft, photos: Record<number, number>, index: number): FlowDraft | null {
  if (!Number.isInteger(index) || !flowCriteria[index] || spatialChecklistItem(draft, photos, index).previewOnly) return null
  return { ...draft, activeIndex: spatialActiveIndex(draft), index }
}
/** Advance one step only. Reviewing an earlier task returns to the active one. */
export function spatialNextPosition(draft: FlowDraft) {
  const active = spatialActiveIndex(draft)
  return draft.index !== active ? { index: active, activeIndex: active } : { index: Math.min(flowCriteria.length - 1, draft.index + 1), activeIndex: Math.min(flowCriteria.length - 1, draft.index + 1) }
}
