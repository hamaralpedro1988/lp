import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Draft = { result: string; note: string; elapsed: number; paused: boolean }
export const draftKey = 'lp-assessment-draft-v1'
function readDraft(): Draft | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
    return value && ['','meets','improve'].includes(value.result) && typeof value.note === 'string' && Number.isFinite(value.elapsed) && value.elapsed >= 0 ? value : null
  } catch { return null }
}
export function useAssessmentDraft() {
  const [initial] = useState(readDraft)
  const [result, setResult] = useState(initial?.result ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [paused, setPaused] = useState(!!initial)
  const [seconds, setSeconds] = useState(Math.floor((initial?.elapsed ?? 0) / 1000))
  const elapsed = useRef(initial?.elapsed ?? 0)
  const started = useRef<number | null>(null)
  const current = useRef({ result, note, paused })
  useLayoutEffect(() => { current.current = { result, note, paused } }, [result, note, paused])
  useEffect(() => {
    if (paused) return
    started.current = Date.now()
    const interval = window.setInterval(() => setSeconds(Math.floor((elapsed.current + Date.now() - started.current!) / 1000)), 250)
    return () => {
      if (started.current !== null) elapsed.current += Date.now() - started.current
      started.current = null
      window.clearInterval(interval)
    }
  }, [paused])
  useEffect(() => {
    function save(background = false) {
      const ms = elapsed.current + (started.current === null ? 0 : Date.now() - started.current)
      try { sessionStorage.setItem(draftKey, JSON.stringify({ ...current.current, elapsed: ms, paused: background || current.current.paused })) } catch { /* Draft still works in memory if storage is unavailable. */ }
    }
    function hidden() { if (document.hidden) { save(true); setPaused(true) } }
    function leaving() { save(true) }
    document.addEventListener('visibilitychange', hidden)
    window.addEventListener('pagehide', leaving)
    return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', leaving) }
  }, [])
  useEffect(() => {
    try { sessionStorage.setItem(draftKey, JSON.stringify({ result, note, paused, elapsed: elapsed.current + (started.current === null ? 0 : Date.now() - started.current) })) } catch { /* Keep operating in memory. */ }
  }, [result, note, paused, seconds])
  function resetTimer() {
    elapsed.current = 0
    started.current = paused ? null : Date.now()
    setSeconds(0)
  }
  return { resetTimer, result, setResult, note, setNote, paused, setPaused, seconds }
}
