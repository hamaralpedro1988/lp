import { useState } from 'react'
import { criteria, type Answer, type Responses } from '@/data/rosa-criteria'
import { draftKey } from '@/hooks/use-assessment-draft'

export const compactDraftKey = 'lp-rosa-compact-v1'
type Draft = { answers: Responses; notes: Record<string,string> }
function read(): Draft {
  try {
    const raw = JSON.parse(localStorage.getItem(compactDraftKey) ?? 'null')
    if (raw && typeof raw.answers === 'object' && typeof raw.notes === 'object') {
      return { answers: Object.fromEntries(criteria.filter(c => ['met','not'].includes(raw.answers?.[c.id])).map(c => [c.id,raw.answers[c.id]])), notes: Object.fromEntries(criteria.filter(c => typeof raw.notes?.[c.id] === 'string').map(c => [c.id,raw.notes[c.id]])) }
    }
    const previous = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
    return { answers: previous?.result === 'meets' ? {p1:'met'} : previous?.result === 'improve' ? {p1:'not'} : {}, notes: typeof previous?.note === 'string' ? {p1:previous.note} : {} }
  } catch { return { answers: {}, notes: {} } }
}
export function useCompactDraft() {
  const [draft, setDraft] = useState(read)
  const [saveError, setSaveError] = useState(false)
  function persist(next: Draft) {
    try { localStorage.setItem(compactDraftKey,JSON.stringify(next)); setSaveError(false); return true } catch { setSaveError(true); return false }
  }
  function update(next: Draft) { setDraft(next); persist(next) }
  function answer(id: string, value: Answer) { update({...draft,answers:{...draft.answers,[id]:draft.answers[id]===value ? undefined : value}}) }
  function note(id: string, value: string) { update({...draft,notes:{...draft.notes,[id]:value}}) }
  return { ...draft, answer, note, save: () => persist(draft), reset: () => update({answers:{},notes:{}}), saveError }
}
