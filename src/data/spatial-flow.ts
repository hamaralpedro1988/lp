import { creatorTheme, type Theme } from '../lib/theme.ts'
import { emptyFlowDraft, normalizeFlowDraft, flowCriteria, flowEvidenceOk, flowScreens, type FlowDraft } from './flow-draft.ts'

export const spatialStorageKey = 'lp-rosa-flow-v5-v01'
export const emptySpatialDraft = (): FlowDraft => ({ ...emptyFlowDraft(), screen: 'list' })
export function normalizeSpatialDraft(value: unknown): FlowDraft {
  if (!value || typeof value !== 'object') return emptySpatialDraft()
  const result = normalizeFlowDraft(value)
  if (!flowScreens.includes((value as FlowDraft).screen)) result.screen = 'list'
  return result
}
export function spatialCompleteIndices(draft: FlowDraft, photos: Record<number, number> = {}) {
  return flowCriteria.flatMap((_, index) => draft.answers[index] && draft.answers[index] !== 'notObserved' && flowEvidenceOk(draft, index, photos) ? [index] : [])
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
    primary: '#7363bd', 'primary-foreground': '#ffffff',
    secondary: '#eeeaf7', 'secondary-foreground': '#514467',
    muted: '#f0edf8', 'muted-foreground': '#6b667f',
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
