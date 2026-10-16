import { useState } from 'react'
import { emptyFocusedDraft, focusedDraftKey, migrateCompactDraft, normalizeFocusedDraft, type FocusedDraft } from '@/data/focused-draft'
export function useFocusedDraft() {
  const [draft,setDraft]=useState(()=>{
    try {
      const value=localStorage.getItem(focusedDraftKey)
      return value ? normalizeFocusedDraft(JSON.parse(value)) : migrateCompactDraft(JSON.parse(localStorage.getItem('lp-rosa-compact-v1') ?? 'null'))
    } catch {return emptyFocusedDraft()}
  })
  const [saveError,setSaveError]=useState(false)
  function save(value:FocusedDraft=draft) {
    try{localStorage.setItem(focusedDraftKey,JSON.stringify(value));setSaveError(false);return true}catch{setSaveError(true);return false}
  }
  function update(next:FocusedDraft){setDraft(next);save(next)}
  return {draft,update,save,saveError}
}
