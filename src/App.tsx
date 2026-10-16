import { lazy, Suspense, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { applyTheme, isTheme, loadTheme } from '@/lib/theme'

const Assessment = lazy(() => import('@/pages/assessment'))
const ThemeStudio = lazy(() => import('@/pages/theme-studio'))
const ComponentPlayground = lazy(() => import('@/pages/component-playground'))

function Preview() {
  useEffect(() => {
    applyTheme(loadTheme(), 'light')
    function receive(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== window.parent) return
      const data = event.data
      if (data?.type === 'lp-theme' && isTheme(data.theme) && (data.mode === 'light' || data.mode === 'dark')) applyTheme(data.theme, data.mode)
    }
    window.addEventListener('message', receive)
    if (window.parent !== window) window.parent.postMessage({ type: 'lp-preview-ready' }, location.origin)
    return () => window.removeEventListener('message', receive)
  }, [])
  return <ComponentPlayground/>
}
export default function App() {
  const params = new URLSearchParams(location.search)
  return <TooltipProvider><Suspense fallback={<p role="status" className="p-8 text-sm text-muted-foreground">A carregar…</p>}>{params.get('preview') === '1' ? <Preview/> : params.get('studio') === '1' ? <ThemeStudio/> : <Assessment/>}</Suspense></TooltipProvider>
}
