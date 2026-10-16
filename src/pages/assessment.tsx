import { useEffect, useState } from 'react'
import { Check, CheckCircle2, ChevronDown, Circle, Flame, MoreHorizontal, Pause, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EvidencePanel } from '@/components/assessment/evidence-panel'
import { useAssessmentDraft } from '@/hooks/use-assessment-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'
import { applyTheme, loadTheme } from '@/lib/theme'

export default function Assessment() {
  const { result, setResult, note, setNote, paused, setPaused, seconds } = useAssessmentDraft()
  const [mediaCount, setMediaCount] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [options, setOptions] = useState(false)
  const [pauseSheet, setPauseSheet] = useState(false)
  useEffect(() => { applyTheme(loadTheme(), 'light') }, [])
  useMobileViewport()
  useMobileOverlay(options, () => { setOptions(false); return true })
  useMobileOverlay(pauseSheet, () => { setPauseSheet(false); return true })
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  const assessed = result ? 1 : 0
  const status = result === 'meets' ? 'Meet standard' : result === 'improve' ? 'Needs improvement' : 'Not assessed'
  return <div className="assessment-mobile min-h-dvh bg-muted/40 text-foreground">
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-background sm:border-x">
      <header className="shrink-0 border-b px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Flame className="size-5"/></span><div><p className="text-[10px] tracking-widest text-muted-foreground uppercase">Skills assessment</p><h1 className="text-base">Fryer Station</h1></div></div><Button variant="ghost" size="icon" aria-label="Assessment options" onClick={() => setOptions(true)}><MoreHorizontal className="size-5"/></Button></div>
        <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Checklist <span className="mx-1">·</span> 3 criteria</p><Button variant={paused ? 'secondary' : 'ghost'} className="min-w-28 gap-2 px-3 text-xs" aria-label={paused ? 'Resume timer' : 'Pause timer'} onClick={() => { if (paused) setPaused(false); else { setPaused(true); setPauseSheet(true) } }}><Timer className="size-3.5"/><span className="font-mono tabular-nums">{time}</span>{paused ? <Play className="size-3.5"/> : <Pause className="size-3.5"/>}</Button></div>
        {paused && <p role="status" className="mt-1 text-xs text-muted-foreground">Paused · Tap the timer to resume</p>}
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-5"><div className="flex items-center justify-between"><h2 className="text-2xl tracking-tight">Preparation</h2><span className="text-xs text-muted-foreground">{assessed} / 3 assessed</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Tap a criterion to assess it and add evidence.</p><Progress value={assessed / 3 * 100} aria-label="Assessed criteria" aria-valuenow={assessed} aria-valuemin={0} aria-valuemax={3} className="mt-4 h-1"/></div>
        <ol aria-label="Preparation checklist" className="overflow-hidden rounded-xl border">
          <li>
            <h3><button id="criterion-trigger" aria-expanded={expanded} aria-controls="criterion-details" onClick={() => setExpanded(value => !value)} className="flex min-h-24 w-full items-start gap-3 p-4 text-left active:bg-accent/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
              <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${result ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{result ? <Check className="size-3.5"/> : <span className="text-xs font-medium">1</span>}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm leading-6 font-medium">Checks fryer readiness and oil conditions</span><span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-muted-foreground">{result ? <CheckCircle2 className="size-3.5"/> : <Circle className="size-3"/>}<span>{status}</span>{note && <><span aria-hidden="true">·</span><span>Note added</span></>}{mediaCount > 0 && <><span aria-hidden="true">·</span><span>{mediaCount} {mediaCount === 1 ? 'file' : 'files'}</span></>}</span></span><ChevronDown className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}/>
            </button></h3>
            <div id="criterion-details" role="region" aria-labelledby="criterion-trigger" hidden={!expanded} className="border-t bg-muted/15 p-4">
              <p className="mb-4 text-sm leading-6 text-muted-foreground">Observe the applicable safety checks before starting.</p>
              <fieldset className="mb-5"><legend className="mb-3 text-xs font-medium text-muted-foreground">Your observation</legend><RadioGroup value={result} onValueChange={setResult} className="grid grid-cols-2 gap-2">{[['meets','Meet standard'],['improve','Needs improvement']].map(([value,label]) => <label key={value} htmlFor={`list-result-${value}`} className="flex min-h-14 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-3 active:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"><RadioGroupItem id={`list-result-${value}`} value={value} className="shrink-0"/><span className="text-xs leading-5 font-medium">{label}</span></label>)}</RadioGroup></fieldset>
              <EvidencePanel note={note} onNoteChange={setNote} onCountChange={setMediaCount}/>
            </div>
          </li>
          {[2,3].map(number => <li key={number} className="border-t"><div className="flex min-h-20 items-center gap-3 p-4"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">{number}</span><div className="flex-1"><h3 className="text-sm text-muted-foreground">Criterion {number}</h3><p className="mt-1 text-xs text-muted-foreground">Content to be defined</p></div><span className="text-[10px] text-muted-foreground">Unavailable</span></div></li>)}
        </ol>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">This prototype includes one criterion. The remaining two are shown for context.</p>
      </main>

    </div>
    <Sheet open={options} onOpenChange={setOptions}><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl"><SheetHeader><SheetTitle>Assessment options</SheetTitle><SheetDescription>Try the alternative layout or adjust your theme.</SheetDescription></SheetHeader><div className="space-y-2 px-5 pb-4"><Button variant="outline" asChild className="h-12 w-full justify-start"><a href="?view=step">View one criterion at a time</a></Button><Button variant="outline" asChild className="h-12 w-full justify-start"><a href="?studio=1">Open Theme Studio</a></Button></div></SheetContent></Sheet>
    <Sheet open={pauseSheet} onOpenChange={setPauseSheet}><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl"><SheetHeader><SheetTitle>Assessment paused</SheetTitle><SheetDescription>The timer stays paused when you close this panel.</SheetDescription></SheetHeader><div className="px-5 pb-5"><div className="py-6 text-center font-mono text-4xl tabular-nums">{time}</div><Button className="h-12 w-full" onClick={() => { setPauseSheet(false); setPaused(false) }}><Play/>Resume assessment</Button></div></SheetContent></Sheet>
  </div>
}
