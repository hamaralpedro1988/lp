import { creatorTheme, type Theme } from '../lib/theme.ts'
import { emptyFlowDraft, normalizeFlowDraft, flowCriteria, flowScreens, type FlowDraft } from './flow-draft.ts'

// V5 owns its state; never reads or rewrites V2–V4 storage.
export const spatialStorageKey = 'lp-rosa-flow-v5-v01'
export const emptySpatialDraft = (): FlowDraft => ({ ...emptyFlowDraft(), screen: 'list' })
export function normalizeSpatialDraft(value: unknown): FlowDraft {
  if (!value || typeof value !== 'object') return emptySpatialDraft()
  const result = normalizeFlowDraft(value)
  if (!flowScreens.includes((value as FlowDraft).screen)) result.screen = 'list'
  // Superseded three-choice V5 drafts require explicit re-observation.
  // The source object and all old-version storage remain unchanged.
  for (const [key, answer] of Object.entries(result.answers)) {
    if (answer === 'coaching') { delete result.answers[Number(key)]; result.assessorConfirmed = false }
  }
  const receipt = (value as FlowDraft).completion
  if (receipt && typeof receipt.at === 'string' && Number.isFinite(Date.parse(receipt.at))) {
    const counts = Object.fromEntries(flowCriteria.map((_, i) => [i, Number.isInteger(receipt.photos?.[i]) && receipt.photos[i] > 0 ? receipt.photos[i] : 0]))
    if (spatialMissing(result, counts).length === 0) {
      result.completion = { at: receipt.at, photos: counts }
      if (result.screen !== 'signoff' && result.screen !== 'list') result.screen = 'review'
    }
  }
  const signature = (value as FlowDraft).signature
  if (result.completion && signature && typeof signature.name === 'string' && signature.name.trim() && typeof signature.at === 'string' && Number.isFinite(Date.parse(signature.at)) && Array.isArray(signature.strokes) && signature.strokes.length <= 200 && signature.strokes.every(points => typeof points === 'string' && points.length <= 50000 && /^[0-9, .-]+$/.test(points))) result.signature = { name: signature.name.slice(0, 200), at: signature.at, strokes: signature.strokes }
  return result
}
export type SpatialEvidenceRequirement = 'none' | 'comment' | 'photo' | 'comment-and-photo'
export function spatialEvidenceRequirement(index: number): SpatialEvidenceRequirement {
  return 'evidence' in flowCriteria[index] ? 'comment-and-photo' : 'none'
}
export function spatialEvidenceSatisfied(requirement: SpatialEvidenceRequirement, note: string, photos: number) {
  return (!(requirement === 'comment' || requirement === 'comment-and-photo') || !!note.trim()) &&
    (!(requirement === 'photo' || requirement === 'comment-and-photo') || photos > 0)
}
export function spatialEvidenceMessage(requirement: SpatialEvidenceRequirement, note: string, photos: number) {
  const commentMissing = (requirement === 'comment' || requirement === 'comment-and-photo') && !note.trim()
  const photoMissing = (requirement === 'photo' || requirement === 'comment-and-photo') && photos <= 0
  return commentMissing && photoMissing ? 'Comment and photo required' : commentMissing ? 'Comment required' : photoMissing ? 'Photo required' : requirement !== 'none' ? 'Evidence recorded' : photos > 0 ? 'Photo · session only' : 'Optional evidence'
}
export function spatialEvidenceOk(draft: FlowDraft, index: number, photos: Record<number, number> = {}) {
  return spatialEvidenceSatisfied(spatialEvidenceRequirement(index), draft.notes[index] ?? '', draft.completion?.photos[index] ?? photos[index] ?? 0)
}
export function spatialMissing(draft: FlowDraft, photos: Record<number, number> = {}) {
  return flowCriteria.flatMap((_, index) => (draft.answers[index] !== 'met' && draft.answers[index] !== 'fail') || !spatialEvidenceOk(draft, index, photos) ? [index] : [])
}
/** One guard shared by button and gesture navigation. */
export function spatialNavigationBlock(draft: FlowDraft, photos: Record<number, number>, direction: 'next' | 'back'): string | null {
  if (draft.completion) return 'This assessment is complete and cannot be changed.'
  if (direction === 'back') return draft.index === 0 ? 'You are at the first task.' : null
  if (draft.answers[draft.index] !== 'met' && draft.answers[draft.index] !== 'fail') return 'Choose Pass or Fail before continuing.'
  if (!spatialEvidenceOk(draft, draft.index, photos)) return spatialEvidenceMessage(spatialEvidenceRequirement(draft.index), draft.notes[draft.index] ?? '', photos[draft.index] ?? 0) + ' before continuing.'
  return null
}
export function spatialCompleteIndices(draft: FlowDraft, photos: Record<number, number> = {}) {
  return flowCriteria.flatMap((_, index) => (draft.answers[index] === 'met' || draft.answers[index] === 'fail') && spatialEvidenceOk(draft, index, photos) ? [index] : [])
}

// Opaque reading surfaces; translucent materials are reserved for navigation layers.
export const spatialTheme: Theme = {
  ...creatorTheme,
  radius: 16,
  typography: { body: 'inter', heading: 'inter', size: 16, lineHeight: 1.55, headingWeight: 600 },
  light: {
    ...creatorTheme.light,
    background: '#f3f0fb', foreground: '#242339',
    card: '#ffffff', 'card-foreground': '#242339',
    popover: '#fcfbff', 'popover-foreground': '#242339',
    primary: '#28253c', 'primary-foreground': '#ffffff',
    secondary: '#eeeaf7', 'secondary-foreground': '#514467',
    muted: '#f0edf8', 'muted-foreground': '#6b657d',
    accent: '#eee8fc', 'accent-foreground': '#59468f',
    destructive: '#a44d60', border: '#e8e5f0', input: '#d9d3e9', ring: '#7363bd',
    success: '#edf7f1', 'success-foreground': '#32614f',
    warning: '#fff4e6', 'warning-foreground': '#805124',
    info: '#efebfa', 'info-foreground': '#59468f',
    sidebar: '#f8f6fd', 'sidebar-foreground': '#242339',
    'sidebar-primary': '#7363bd', 'sidebar-primary-foreground': '#ffffff',
    'sidebar-accent': '#eee8fc', 'sidebar-accent-foreground': '#59468f',
    'sidebar-border': '#e8e5f0', 'sidebar-ring': '#7363bd',
  },
}

export const spatialOptions = [
  { value: 'met', title: 'Pass', description: 'Met the standard' },
  { value: 'fail', title: 'Fail', description: 'Did not meet the standard' },
] as const

/** Capture eligibility only after validating the real, current-session evidence. */
export function completeSpatialAssessment(draft: FlowDraft, photos: Record<number, number>): FlowDraft | null {
  if (draft.completion || spatialMissing(draft, photos).length) return null
  return { ...draft, screen: 'review', paused: false, completion: { at: new Date().toISOString(), photos: { ...photos } } }
}
