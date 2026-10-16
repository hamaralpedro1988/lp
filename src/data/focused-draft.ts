import { focusedCriteria, validAnswer, type FocusedAnswers } from './focused-criteria.ts'
export type FocusedDraft = { answers: FocusedAnswers; notes: Record<string,string>; active: string; numeric: Record<string,string>; multi: Record<string,string[]>; guides: Record<string,boolean> }
export const focusedDraftKey = 'lp-rosa-focused-v2-3'
export function emptyFocusedDraft(): FocusedDraft { return { answers:{}, notes:{}, active:'p1', numeric:{}, multi:{}, guides:{} } }
export function normalizeFocusedDraft(value: unknown): FocusedDraft {
  const next=emptyFocusedDraft()
  if (!value || typeof value !== 'object') return next
  const raw=value as Partial<FocusedDraft>
  if(focusedCriteria.some(c=>c.id===raw.active))next.active=raw.active!
  for(const c of focusedCriteria) {
    if(validAnswer(c,raw.answers?.[c.id]))next.answers[c.id]=raw.answers![c.id]
    if(typeof raw.notes?.[c.id] === 'string')next.notes[c.id]=raw.notes[c.id]
    if(c.type==='number' && typeof raw.numeric?.[c.id] === 'string')next.numeric[c.id]=raw.numeric[c.id]
    if(c.type==='multi' && Array.isArray(raw.multi?.[c.id]))next.multi[c.id]=[...new Set(raw.multi[c.id].filter(v=>c.values?.includes(v)))]
    if(typeof raw.guides?.[c.id] === 'boolean')next.guides[c.id]=raw.guides[c.id]
  }
  return next
}
export function migrateCompactDraft(value: unknown): FocusedDraft {
  const next=emptyFocusedDraft()
  if (!value || typeof value !== 'object')return next
  const old=value as {answers?:Record<string,unknown>;notes?:Record<string,unknown>}
  // Only these IDs still refer to the same observation with a compatible binary response.
  for(const id of ['p1','p2','c2']) {
    const c=focusedCriteria.find(c=>c.id===id)!
    if(validAnswer(c,old.answers?.[id]))next.answers[id]=old.answers![id]
    if(typeof old.notes?.[id] === 'string')next.notes[id]=old.notes[id]
  }
  return next
}
