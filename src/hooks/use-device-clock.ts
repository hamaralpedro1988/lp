import { useEffect, useState } from 'react'

/** Local device time, refreshed on the minute and when returning to the presentation. */
export function useDeviceClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function refresh() {
      clearTimeout(timer)
      setNow(new Date())
      timer = setTimeout(refresh, 60_000 - Date.now() % 60_000)
    }
    function visible() { if (document.visibilityState === 'visible') refresh() }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visible)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [])
  return {
    time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now),
    date: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now),
  }
}
