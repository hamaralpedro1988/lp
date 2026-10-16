import { useEffect, useLayoutEffect, useRef } from 'react'

// A mobile browser Back dismisses the current sheet before leaving the assessment.
export function useMobileOverlay(open: boolean, requestClose: () => boolean) {
  const close = useRef(requestClose)
  useLayoutEffect(() => { close.current = requestClose }, [requestClose])
  useEffect(() => {
    if (!open) return
    const id = crypto.randomUUID()
    history.pushState({ ...history.state, assessmentOverlay: id }, '')
    function back() {
      if (history.state?.assessmentOverlay === id) return
      if (!close.current()) history.pushState({ ...history.state, assessmentOverlay: id }, '')
    }
    window.addEventListener('popstate', back)
    return () => {
      window.removeEventListener('popstate', back)
      if (history.state?.assessmentOverlay === id) history.back()
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
