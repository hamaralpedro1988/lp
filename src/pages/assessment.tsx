import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, ClipboardList, Flame, Focus, ListChecks, Pause, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EvidencePanel } from '@/components/assessment/evidence-panel'
import { applyTheme, loadTheme } from '@/lib/theme'

export default function Assessment() {
  const [result, setResult] = useState('')
  const [note, setNote] = useState('')
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [focused, setFocused] = useState(false)
  const [checklist, setChecklist] = useState(false)
  const [notice, setNotice] = useState('')
  const elapsed = useRef(0)
  useEffect(() => { applyTheme(loadTheme(), 'light') }, [])
  useEffect(() => {
    if (paused) return
    const start = Date.now()
    const interval = window.setInterval(() => setSeconds(Math.floor((elapsed.current + Date.now() - start) / 1000)), 250)
    return () => { elapsed.current += Date.now() - start; window.clearInterval(interval) }
  }, [paused])
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  return <div className="min-h-dvh bg-muted/40 text-foreground">
    <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-8">
      {!focused && <nav aria-label="Prototype navigation" className="mb-6 flex items-center justify-between gap-3 text-xs text-muted-foreground"><a href="?studio=1" className="inline-flex min-h-11 items-center gap-2 hover:text-foreground"><ArrowLeft className="size-3.5"/>Theme Studio</a><span className="tracking-widest uppercase">Assessment prototype</span></nav>}
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_520px_1fr]">
        <aside className={`hidden pt-12 lg:block ${focused ? 'invisible' : ''}`}><div className="mb-4 flex size-11 items-center justify-center rounded-xl border bg-background"><ClipboardList className="size-5"/></div><p className="text-xs tracking-widest text-muted-foreground uppercase">Workplace observation</p><h2 className="mt-3 text-2xl tracking-tight">Observe.<br/>Assess.<br/>Capture.</h2><p className="mt-4 max-w-40 text-sm leading-6 text-muted-foreground">One criterion at a time, with space for the evidence that matters.</p></aside>
        <div className="min-w-0 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <header className="border-b px-5 pt-5 pb-5 sm:px-8 sm:pt-7">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Flame className="size-5"/></span><div><p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Skills assessment</p><h1 className="text-base">Fryer Station</h1></div></div><Button variant={focused ? 'secondary' : 'outline'} size="icon" aria-label={focused ? 'Turn off focus mode' : 'Turn on focus mode'} aria-pressed={focused} onClick={() => setFocused(value => !value)}><Focus className="size-4"/></Button></div>
            <div className="mt-6 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Preparation <span className="mx-1">/</span> <span className="font-medium text-foreground">1 of 3</span></span><button type="button" onClick={() => setPaused(value => !value)} aria-label={`${paused ? 'Resume' : 'Pause'} timer`} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"><Timer className="size-3.5"/><span className="font-mono text-foreground tabular-nums">{time}</span>{paused ? <Play className="size-3.5"/> : <Pause className="size-3.5"/>}</button></div>
            <Progress value={100 / 3} aria-label="Current criterion: 1 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={1} className="mt-1 h-1.5"/>
            {focused && <p role="status" className="mt-4 text-xs leading-5 text-muted-foreground">Focus view is on. Calls and device notifications are not blocked.</p>}
          </header>
          <main className="space-y-7 px-5 py-7 sm:px-8 sm:py-9">
            <section><Badge variant="secondary" className="mb-4 gap-1.5 font-normal"><span className="size-1.5 rounded-full bg-current"/>Preparation</Badge><h2 className="max-w-sm text-[28px] leading-[1.25] tracking-tight sm:text-[32px]">Checks fryer readiness and oil conditions</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Observe the applicable safety checks before starting.</p></section>
            <fieldset><legend className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">Your observation</legend><RadioGroup value={result} onValueChange={value => { setResult(value); setNotice('') }} className="gap-3">{[['meets', 'Meet standard', 'The criterion has been demonstrated.'], ['improve', 'Needs improvement', 'Further practice or support is needed.']].map(([value,label,description]) => <label key={value} htmlFor={`result-${value}`} className="flex min-h-20 cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"><RadioGroupItem id={`result-${value}`} value={value} className="size-5 shrink-0"/><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span>{result === value && <Check className="size-4 shrink-0" aria-hidden="true"/>}</label>)}</RadioGroup></fieldset>
            <EvidencePanel note={note} onNoteChange={setNote}/>
            {notice && <p role="status" className="rounded-lg bg-muted p-3 text-sm leading-6">{notice}</p>}
          </main>
          <footer className="border-t bg-muted/20 px-5 py-5 sm:px-8"><div className="flex items-center justify-between gap-3"><Button variant="outline" disabled className="gap-2"><ArrowLeft/>Back</Button><Sheet open={checklist} onOpenChange={setChecklist}><SheetTrigger asChild><Button variant="ghost" aria-label="Open checklist" className="gap-2"><ListChecks/><span className="hidden min-[380px]:inline">Checklist</span></Button></SheetTrigger><SheetContent className="w-full sm:max-w-md"><SheetHeader><SheetTitle>Fryer Station checklist</SheetTitle><SheetDescription>Preparation · 1 of 3 criteria. Only the first criterion is defined in this prototype.</SheetDescription></SheetHeader><div className="space-y-3 px-4"><button onClick={() => setChecklist(false)} className="flex w-full items-start gap-3 rounded-xl border border-primary bg-accent p-4 text-left"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span><span className="flex-1 text-sm font-medium">Checks fryer readiness and oil conditions<span className="mt-1 block text-xs font-normal text-muted-foreground">{result === 'meets' ? 'Meet standard' : result === 'improve' ? 'Needs improvement' : 'Not assessed yet'}</span></span>{result ? <CheckCircle2 className="size-4"/> : <ChevronRight className="size-4"/>}</button>{[2,3].map(number => <div key={number} aria-disabled="true" className="flex items-center gap-3 rounded-xl border p-4 text-muted-foreground"><span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs">{number}</span><div className="text-sm">Criterion {number}<p className="mt-1 text-xs">Content not defined yet</p></div></div>)}</div></SheetContent></Sheet><Button className="gap-2" onClick={() => setNotice('This is the first screen prototype. The next criterion has not been defined yet.')}>Next<ArrowRight/></Button></div><p className="mt-4 text-center text-[11px] text-muted-foreground">Prototype · Changes are kept for this session only</p></footer>
        </div>
        <div aria-hidden="true"/>
      </div>
    </div>
    <Dialog open={paused} onOpenChange={setPaused}><DialogContent><DialogHeader><DialogTitle>Assessment paused</DialogTitle><DialogDescription>Take the time you need. Your result and evidence remain here, and the timer is stopped.</DialogDescription></DialogHeader><div className="py-5 text-center font-mono text-4xl tabular-nums">{time}</div><Button onClick={() => setPaused(false)}><Play/>Resume assessment</Button></DialogContent></Dialog>
  </div>
}
