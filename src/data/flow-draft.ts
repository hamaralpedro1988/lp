export const flowCriteria = [
  { section: 'Preparation', title: 'Prepares a safe, clean work area', desc: 'Observe station readiness and safe working conditions.' },
  { section: 'Preparation', title: 'Checks fryer readiness and oil conditions', desc: 'Observe the applicable safety checks before starting.', critical: true, weight: 2 },
  { section: 'Preparation', title: 'Selects the correct product and portion', desc: 'Check the food item and portion against the station standard.' },
  { section: 'Frying', title: 'Loads the basket without overfilling', desc: 'Observe preparation and basket loading.' },
  { section: 'Frying', title: 'Lowers the basket safely', desc: 'Watch how Dre handles and lowers the basket.', critical: true, weight: 2 },
  { section: 'Frying', title: 'Selects the approved cooking programme', desc: 'Observe correct programme selection for this product.' },
  { section: 'Frying', title: 'Monitors the cycle and follows alerts', desc: 'Observe Dre responding to the equipment instructions.' },
  { section: 'Frying', title: 'Lifts and drains the basket safely', desc: 'Observe removal and handling of the cooked product.', critical: true, weight: 2 },
  { section: 'Completion', title: 'Checks the finished product quality', desc: 'Observe product quality checks against the agreed standard.', evidence: true },
  { section: 'Completion', title: 'Transfers product to the correct area', desc: 'Observe the safe handoff to the designated service area.' },
  { section: 'Completion', title: 'Follows the approved holding guidance', desc: 'Observe product handling after cooking.' },
] as const
export const flowScreens = ['list', 'overview', 'assessment', 'review', 'signoff'] as const
export type FlowScreen = typeof flowScreens[number]
// Preserve legacy unobserved responses as pending; they are never converted into Fail.
export type FlowAnswer = 'met' | 'coaching' | 'fail' | 'notObserved'
export type FlowDraft = { signature?: { name: string; at: string; strokes: string[] }; completion?: { at: string; photos: Record<number, number> }; screen: FlowScreen; index: number; offline: boolean; answers: Record<number, FlowAnswer>; notes: Record<number, string>; feedback: string; paused: boolean; assessorConfirmed: boolean }
export const flowStorageKey = 'lp-rosa-flow-v2-v01'
export const emptyFlowDraft = (): FlowDraft => ({ screen: 'overview', index: 0, offline: false, answers: {}, notes: {}, feedback: '', paused: false, assessorConfirmed: false })
export function normalizeFlowDraft(value: unknown): FlowDraft {
  const draft = emptyFlowDraft()
  if (!value || typeof value !== 'object') return draft
  const v = value as Record<string, unknown>
  if (flowScreens.includes(v.screen as FlowScreen)) draft.screen = v.screen as FlowScreen
  if (Number.isInteger(v.index) && Number(v.index) >= 0 && Number(v.index) < flowCriteria.length) draft.index = Number(v.index)
  for (const key of ['offline', 'paused', 'assessorConfirmed'] as const) if (typeof v[key] === 'boolean') draft[key] = v[key]
  if (typeof v.feedback === 'string') draft.feedback = v.feedback
  for (let i = 0; i < flowCriteria.length; i++) {
    const answer = (v.answers as Record<number, unknown> | undefined)?.[i]
    const note = (v.notes as Record<number, unknown> | undefined)?.[i]
    if (answer === 'met' || answer === 'coaching' || answer === 'fail' || answer === 'notObserved') draft.answers[i] = answer
    if (typeof note === 'string') draft.notes[i] = note
  }
  return draft
}
export function flowEvidenceOk(draft: FlowDraft, index: number, photos: Record<number, number> = {}) {
  return !('evidence' in flowCriteria[index]) || !!draft.notes[index]?.trim() || (photos[index] ?? 0) > 0
}
export function flowMissing(draft: FlowDraft, photos: Record<number, number> = {}) {
  return flowCriteria.flatMap((_, i) => !draft.answers[i] || draft.answers[i] === 'notObserved' || !flowEvidenceOk(draft, i, photos) ? [i] : [])
}
