import { useLayoutEffect, useState } from 'react'
export type VisualTheme = 'spatial' | 'fluid'
export const resolveVisualTheme = (value: string | null): VisualTheme => value === 'fluid' ? 'fluid' : 'spatial'
/** URL preference only: never reads or writes assessment drafts. Root scope includes Radix portals. */
export function useVisualTheme(enabled = true) {
  const [visualTheme, setValue] = useState(() => resolveVisualTheme(new URLSearchParams(location.search).get('visualTheme')))
  useLayoutEffect(() => {
    if (!enabled) return
    const root = document.documentElement, previous = root.dataset.visualTheme
    root.dataset.visualTheme = visualTheme
    return () => { if (previous) root.dataset.visualTheme = previous; else delete root.dataset.visualTheme }
  }, [visualTheme, enabled])
  useLayoutEffect(() => {
    const changed = () => setValue(resolveVisualTheme(new URLSearchParams(location.search).get('visualTheme')))
    window.addEventListener('popstate', changed)
    return () => window.removeEventListener('popstate', changed)
  }, [])
  function setVisualTheme(value: VisualTheme) {
    setValue(value)
    const url = new URL(location.href)
    if (value === 'spatial') url.searchParams.delete('visualTheme'); else url.searchParams.set('visualTheme', value)
    history.replaceState(history.state, '', url)
  }
  return { visualTheme, setVisualTheme }
}
