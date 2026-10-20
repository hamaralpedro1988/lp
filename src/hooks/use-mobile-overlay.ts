import { useEffect, useLayoutEffect, useRef } from 'react'

// Serialize programmatic history rewinds before registering another overlay.
// Otherwise a rapid close/reopen can consume the new entry and dismiss its parent.
let pendingRewind: Promise<void> | null = null
function rewindOverlay(id: string) {
  if (pendingRewind || history.state?.assessmentOverlay !== id) return
  pendingRewind = new Promise<void>(resolve => {
    window.addEventListener('popstate', () => { pendingRewind = null; resolve() }, { once: true })
    history.back()
  })
}

// A mobile browser Back dismisses the current sheet before leaving the assessment.
export function useMobileOverlay(open: boolean, requestClose: () => boolean) {
  const close = useRef(requestClose)
  useLayoutEffect(() => { close.current = requestClose }, [requestClose])
  useEffect(() => {
    if (!open) return
    const id = crypto.randomUUID()
    let active = true, installed = false
    function back() {
      if (pendingRewind || history.state?.assessmentOverlay === id) return
      if (!close.current()) history.pushState({ ...history.state, assessmentOverlay: id }, '')
    }
    function install() {
      if (!active) return
      if (pendingRewind) { void pendingRewind.then(install); return }
      history.pushState({ ...history.state, assessmentOverlay: id }, '')
      window.addEventListener('popstate', back)
      installed = true
    }
    install()
    return () => {
      active = false
      window.removeEventListener('popstate', back)
      if (installed) rewindOverlay(id)
    }
  }, [open])
}

export function useMobileViewport() {
  useEffect(() => {
    const viewport = window.visualViewport
    function update() {
      document.documentElement.style.setProperty('--visual-height', `${viewport?.height ?? innerHeight}px`)
      document.documentElement.style.setProperty('--keyboard-inset', `${Math.max(0, innerHeight - (viewport?.height ?? innerHeight) - (viewport?.offsetTop ?? 0))}px`)
    }
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      document.documentElement.style.removeProperty('--visual-height')
      document.documentElement.style.removeProperty('--keyboard-inset')
    }
  }, [])
}
