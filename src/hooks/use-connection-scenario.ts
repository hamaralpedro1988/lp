import { useCallback, useEffect, useState } from 'react'

/** Presenter-only URL state; never changes network APIs or assessment records. */
export function useConnectionScenario(enabled: boolean) {
  const [state, setState] = useState(() => ({ offline: enabled && new URLSearchParams(location.search).get('connectionScenario') === 'offline', recovered: false }))
  function writeURL(offline: boolean) {
    const url = new URL(location.href)
    if (offline) url.searchParams.set('connectionScenario', 'offline')
    else url.searchParams.delete('connectionScenario')
    history.replaceState(history.state, '', url)
  }
  const change = useCallback((offline: boolean) => {
    if (!enabled) return
    setState(previous => ({ offline, recovered: previous.offline && !offline }))
    writeURL(offline)
  }, [enabled])
  const reset = useCallback(() => {
    if (!enabled) return
    setState({ offline: false, recovered: false }); writeURL(false)
  }, [enabled])
  useEffect(() => {
    if (!state.recovered) return
    const timer = setTimeout(() => setState(previous => ({ ...previous, recovered: false })), 6000)
    return () => clearTimeout(timer)
  }, [state.recovered])
  return { simulatedOffline: enabled && state.offline, connectionRecovered: enabled && state.recovered, changeConnection: change, resetConnection: reset }
}
