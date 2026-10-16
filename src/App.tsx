import { useEffect } from 'react'
import ComponentPlayground from '@/pages/component-playground'
import ThemeStudio from '@/pages/theme-studio'
import { TooltipProvider } from '@/components/ui/tooltip'
import { applyTheme, isTheme, loadTheme } from '@/lib/theme'

function Preview() {
  useEffect(() => {
    applyTheme(loadTheme(), 'light')
    function receive(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== window.parent) return
      const data = event.data
      if (data?.type === 'lp-theme' && isTheme(data.theme) && (data.mode === 'light' || data.mode === 'dark')) applyTheme(data.theme, data.mode)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])
  return <ComponentPlayground/>
}
export default function App() {
  return <TooltipProvider>{new URLSearchParams(location.search).get('preview') === '1' ? <Preview/> : <ThemeStudio/>}</TooltipProvider>
}
