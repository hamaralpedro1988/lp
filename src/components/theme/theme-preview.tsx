import { useCallback, useEffect, useRef, useState } from 'react'
import type { Mode, Theme } from '@/lib/theme'

export function ThemePreview({ theme, mode, viewport }: { theme: Theme; mode: Mode; viewport: 'mobile' | 'desktop' }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(390)
  const width = viewport === 'mobile' ? 390 : 1200
  const scale = Math.min(1, available / width)
  const sync = useCallback(() => frame.current?.contentWindow?.postMessage({ type: 'lp-theme', theme, mode }, location.origin), [theme, mode])
  useEffect(sync, [sync])
  useEffect(() => {
    function ready(event: MessageEvent) {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'lp-preview-ready') sync()
    }
    window.addEventListener('message', ready)
    return () => window.removeEventListener('message', ready)
  }, [sync])
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={container} className="w-full min-w-0 overflow-hidden">
    <div className="mx-auto overflow-hidden rounded-xl border bg-background shadow-sm" style={{ width: width * scale, height: 820 * scale }}>
      <iframe ref={frame} onLoad={sync} title="Pré-visualização interativa do tema" src="?preview=1" className="block border-0" style={{ width, height: 820, transform: `scale(${scale})`, transformOrigin: 'top left' }}/>
    </div>
    <p className="mt-4 text-center text-xs text-muted-foreground">{width} × 820 px · {Math.round(scale * 100)}% · Interage e faz scroll dentro da pré-visualização.</p>
  </div>
}
