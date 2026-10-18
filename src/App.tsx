import { lazy, Suspense, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { applyTheme, isTheme, loadTheme } from '@/lib/theme'

const AssessmentStep = lazy(() => import('@/pages/assessment-step'))
const DesignSystem = lazy(() => import('@/pages/design-system'))
const AssessmentFlow = lazy(() => import('@/pages/assessment-flow'))
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
  return <TooltipProvider><Suspense fallback={<p role="status" className="app-loading p-8 text-sm text-muted-foreground" style={params.get('version') === '5' ? { background: '#f9f9fc', color: '#535365', minHeight: '100dvh', display: 'grid', placeItems: 'center' } : undefined}>{params.get('version') === '5' ? 'Preparing your assessment…' : 'A carregar…'}</p>}>{params.get('preview') === '1' ? <Preview/> : params.get('studio') === '1' ? <ThemeStudio/> : params.get('view') === 'design-system' ? <DesignSystem/> : params.get('view') === 'step' ? <AssessmentStep/> : params.get('version') === '5' && params.get('catalog') === '1' ? <DesignSystem/> : params.get('version') === '5' ? <AssessmentFlow key="v5" version={5}/> : params.get('version') === '4' ? <AssessmentFlow key="v4" version={4}/> : params.get('version') === '3' ? <AssessmentFlow key="v3" version={3}/> : params.get('version') === '2' ? <AssessmentFlow key="v2"/> : <Assessment/>}</Suspense></TooltipProvider>
}
