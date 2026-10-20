import type { FlowDraft, FlowScreen } from './flow-draft.ts'
import { spatialCompleteIndices, spatialMissing } from './spatial-flow.ts'

/** Checklist completion is distinct from sign-off and manager approval. */
export function spatialLifecycle(draft: FlowDraft, photos: Record<number, number> = {}, managerRequired = true) {
  const completed = spatialCompleteIndices(draft, photos).length
  const missing = spatialMissing(draft, photos).length
  const started = !!draft.started || draft.index > 0 || draft.screen === 'assessment' || Object.values(photos).some(count => count > 0) || draft.paused || !!draft.completion || Object.keys(draft.answers).length > 0 || Object.values(draft.notes).some(note => note.trim())
  const submitted = draft.assessorConfirmed && !!draft.signature && !!draft.completion && missing === 0
  const status = submitted ? managerRequired ? 'Pending Review' : 'Completed' : started ? 'In Progress' : 'Ready to start'
  const action = submitted ? 'View assessment result' : draft.completion || started && missing === 0 ? 'Continue to review' : started ? 'Resume assessment' : 'Start assessment'
  const nextScreen: FlowScreen = submitted || draft.completion || started && missing === 0 ? 'review' : 'assessment'
  return { status, action, nextScreen, completed, started }
}
