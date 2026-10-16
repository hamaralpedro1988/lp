import type { ReactNode } from 'react'
import { Layers, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const links = [['foundations', 'Overview'], ['buttons', 'Actions'], ['inputs', 'Forms'], ['feedback', 'Feedback'], ['overlays', 'Overlays']]
export function PlaygroundLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-background focus:p-4">Skip to content</a>
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#" className="flex items-center gap-3 font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Layers size={18}/></span>Component studio</a>
        <Badge variant="outline" className="gap-1.5 py-1.5"><span className="size-1.5 rounded-full bg-foreground"/>Foundation v0.1</Badge>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl lg:grid-cols-[210px_1fr]">
      <aside className="min-w-0 border-b px-5 py-4 sm:px-8 lg:sticky lg:top-18 lg:h-[calc(100vh-4.5rem)] lg:border-r lg:border-b-0 lg:py-10">
        <p className="mb-4 hidden text-xs font-medium uppercase tracking-widest text-muted-foreground lg:block">Design system</p>
        <nav aria-label="Component sections" className="flex gap-1 overflow-x-auto lg:flex-col">{links.map(([id, text]) => <a className="flex min-h-11 shrink-0 items-center justify-between rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring" key={id} href={`#${id}`}>{text}<ArrowUpRight className="ml-4 hidden size-3.5 lg:block"/></a>)}</nav>
        <p className="mt-12 hidden text-xs leading-5 text-muted-foreground lg:block">A shared starting point.<br/>Built to evolve, together.</p>
      </aside>
      <main id="main" className="min-w-0 px-5 py-9 sm:px-8 sm:py-12 lg:px-12">{children}</main>
    </div>
    <footer className="border-t px-5 py-6 text-center text-xs text-muted-foreground">Component playground · Neutral theme · React + shadcn/ui</footer>
  </div>
}
