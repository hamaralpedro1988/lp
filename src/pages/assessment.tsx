import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Flame, Focus, ListChecks, Pause, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { EvidencePanel } from '@/components/assessment/evidence-panel'
import { applyTheme, loadTheme } from '@/lib/theme'
import { useAssessmentDraft } from '@/hooks/use-assessment-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'

export default function Assessment() {
  const { result, setResult, note, setNote, paused, setPaused, seconds } = useAssessmentDraft()
  const [focused, setFocused] = useState(false)
  const [checklist, setChecklist] = useState(false)
  const [pauseSheet, setPauseSheet] = useState(false)
  const content = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const returnToCriterion = useRef(false)
  useEffect(() => { applyTheme(loadTheme(), 'light') }, [])
  useMobileViewport()
  useMobileOverlay(checklist, () => { setChecklist(false); return true })
  useMobileOverlay(pauseSheet, () => { setPauseSheet(false); return true })
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  return <div className="assessment-mobile min-h-dvh bg-muted/40 text-foreground">
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-background sm:border-x">
      <header className="shrink-0 border-b px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Flame className="size-5"/></span><div>{!focused && <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Skills assessment</p>}<h1 className="truncate text-base">Fryer Station</h1></div></div>
          <Button variant={focused ? 'secondary' : 'ghost'} size="icon" aria-label="Focus view" aria-pressed={focused} onClick={() => setFocused(value => !value)}><Focus className="size-5"/></Button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Preparation <span className="mx-1">/</span> <span className="font-medium text-foreground">1 of 3</span></p><Button variant={paused ? 'secondary' : 'ghost'} className="min-w-28 gap-2 px-3 text-xs" aria-label={paused ? 'Resume timer' : 'Pause timer'} onClick={() => { if (paused) setPaused(false); else { setPaused(true); setPauseSheet(true) } }}><Timer className="size-3.5"/><span className="font-mono tabular-nums">{time}</span>{paused ? <Play className="size-3.5"/> : <Pause className="size-3.5"/>}<span className="sr-only">{paused ? 'Paused' : 'Running'}</span></Button></div>
        <Progress value={100 / 3} aria-label="Current criterion: 1 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={1} className="mt-1 h-1.5"/>
        {paused && <p role="status" className="mt-2 text-xs text-muted-foreground">Timer paused. Tap the timer to resume.</p>}
        {focused && <p role="status" className="mt-2 text-xs leading-5 text-muted-foreground">Focus view on · Device calls and notifications are unchanged.</p>}
      </header>
      <main ref={content} className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-6">
        <section><p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">Preparation</p><h2 ref={heading} tabIndex={-1} className="text-[28px] leading-[1.25] tracking-tight outline-none">Checks fryer readiness and oil conditions</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Observe the applicable safety checks before starting.</p></section>
        <fieldset><legend className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">Your observation</legend><RadioGroup value={result} onValueChange={setResult} className="gap-3">{[['meets', 'Meet standard', 'The criterion has been demonstrated.'], ['improve', 'Needs improvement', 'Further practice or support is needed.']].map(([value,label,description]) => <label key={value} htmlFor={`result-${value}`} className="flex min-h-20 cursor-pointer touch-manipulation items-center gap-4 rounded-xl border p-4 transition-colors active:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"><RadioGroupItem id={`result-${value}`} value={value} className="size-5 shrink-0"/><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span>{result === value && <Check className="size-4 shrink-0" aria-hidden="true"/>}</label>)}</RadioGroup></fieldset>
        <EvidencePanel note={note} onNoteChange={setNote}/>
      </main>
      <footer className="shrink-0 border-t bg-background px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <nav aria-label="Assessment navigation" className="grid grid-cols-3 items-center gap-3"><Button variant="outline" disabled aria-label="Back: first criterion"><ArrowLeft/>Back</Button><Sheet open={checklist} onOpenChange={setChecklist}><SheetTrigger asChild><Button variant="ghost" aria-label="Open checklist"><ListChecks/><span>Checklist</span></Button></SheetTrigger><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl" onCloseAutoFocus={event => { if (returnToCriterion.current) { event.preventDefault(); returnToCriterion.current = false; heading.current?.focus({preventScroll:true}) } }}><SheetHeader><SheetTitle>Fryer Station checklist</SheetTitle><SheetDescription>Preparation · 1 of 3 criteria. Only the first criterion is defined in this prototype.</SheetDescription></SheetHeader><div className="min-h-0 space-y-3 overflow-y-auto px-5 pb-4"><button onClick={() => { returnToCriterion.current = true; setChecklist(false); content.current?.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); heading.current?.focus({preventScroll:true}) }} aria-current="step" className="flex min-h-16 w-full items-start gap-3 rounded-xl border border-primary bg-accent p-4 text-left"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span><span className="flex-1 text-sm font-medium">Checks fryer readiness and oil conditions<span className="mt-1 block text-xs font-normal text-muted-foreground">{result === 'meets' ? 'Meet standard' : result === 'improve' ? 'Needs improvement' : 'Not assessed yet'}</span></span>{result ? <CheckCircle2 className="size-4"/> : <ChevronRight className="size-4"/>}</button>{[2,3].map(number => <button key={number} disabled className="flex min-h-16 w-full items-center gap-3 rounded-xl border p-4 text-left text-muted-foreground opacity-60"><span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs">{number}</span><span className="text-sm">Criterion {number}<span className="mt-1 block text-xs">Not available in this prototype</span></span></button>)}<a href="?studio=1" className="flex min-h-11 items-center justify-center text-xs text-muted-foreground underline underline-offset-4">Open Theme Studio</a></div></SheetContent></Sheet><Button disabled aria-describedby="navigation-help">Next<ArrowRight/></Button></nav><p id="navigation-help" className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">Next criterion is not available in this prototype.</p>
      </footer>
    </div>
    <Sheet open={pauseSheet} onOpenChange={setPauseSheet}><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl"><SheetHeader><SheetTitle>Assessment paused</SheetTitle><SheetDescription>Your timer is stopped. Closing this panel keeps it paused until you choose Resume.</SheetDescription></SheetHeader><div className="px-5 pb-5"><div className="py-6 text-center font-mono text-4xl tabular-nums">{time}</div><Button className="h-12 w-full" onClick={() => { setPauseSheet(false); setPaused(false) }}><Play/>Resume assessment</Button><p className="mt-4 text-center text-xs leading-5 text-muted-foreground">The timer also pauses when the app goes into the background.</p></div></SheetContent></Sheet>
  </div>
}
