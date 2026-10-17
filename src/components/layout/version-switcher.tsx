import { useState } from 'react'
import { Check, Layers, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'

export function VersionSwitcher({ current }: { current: 1 | 2 | 3 }) {
  const [open, setOpen] = useState(false)
  useMobileOverlay(open, () => { setOpen(false); return true })
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button variant="ghost" className="version-trigger" aria-label="Versões"><Layers className="size-4"/><span>Versões</span></Button></SheetTrigger>
    <SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-3xl">
      <SheetHeader><SheetTitle>Versões do protótipo</SheetTitle><SheetDescription>Compare as três experiências. Cada versão guarda o seu próprio rascunho. Fotos e vídeos ficam apenas na página aberta.</SheetDescription></SheetHeader>
      <div className="space-y-3 px-5 pb-5">{([{id:1,title:'V1 · Checklist com perguntas',description:'Lista compacta, perguntas num painel inferior e respostas variadas.'},{id:2,title:'V2 · Fluxo Rosa',description:'Overview, observação por critério, revisão e sign-off demonstrativo.'},{id:3,title:'V3 · Evidências flutuantes',description:'Nota e fotografia em botões flutuantes, com mais espaço para observar e responder.'}] as const).map(version=><a key={version.id} href={`?version=${version.id}`} aria-current={current===version.id?'page':undefined} className="flex min-h-24 items-center gap-3 rounded-xl border p-4 text-sm focus-visible:outline-2 focus-visible:outline-ring"><span className="min-w-0 flex-1"><strong className="block">{version.title}</strong><span className="mt-1 block text-muted-foreground">{version.description}</span></span>{current===version.id?<Check className="size-5 shrink-0"/>:<ArrowUpRight className="size-5 shrink-0"/>}</a>)}</div>
    </SheetContent>
  </Sheet>
}
