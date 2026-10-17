import { emptySpatialDraft } from '../spatial-flow.ts'
import { flowCriteria, type FlowDraft } from '../flow-draft.ts'
export const explorerScenarios = ['Unanswered','Selected','Required evidence','Complete','Offline','Save error','Disabled'] as const
export type ExplorerScenario = typeof explorerScenarios[number]
/** New in-memory fixture every time. No browser storage, media or submission APIs. */
export function createExplorerDraft(scenario: ExplorerScenario = 'Unanswered'): FlowDraft {
  const draft = { ...emptySpatialDraft(), screen:'assessment' as const, index:1, answers:{ 0:'met' as const } }
  if (scenario === 'Selected') return { ...draft, answers:{ ...draft.answers, 1:'met' } }
  if (scenario === 'Required evidence') return { ...draft, index:8, answers:{ ...draft.answers, 8:'fail' } }
  if (scenario === 'Complete') return { ...draft, answers:Object.fromEntries(flowCriteria.map((_,index) => [index,index === 4 ? 'fail' : 'met'])), notes:{ 8:'Preview-only product quality observation.' } }
  return { ...draft, offline:scenario === 'Offline' }
}
