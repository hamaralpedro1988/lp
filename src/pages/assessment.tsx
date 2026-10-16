import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, Camera, Check, ChevronRight, FileText, Info, MoreHorizontal, Pause, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EvidencePanel, type EvidenceActions } from '@/components/assessment/evidence-panel'
import { criteria, sections, needsEvidence, type Criterion, type Answer } from '@/data/rosa-criteria'
import { useCompactDraft } from '@/hooks/use-compact-draft'
import { useAssessmentDraft } from '@/hooks/use-assessment-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'
import { applyTheme, loadTheme } from '@/lib/theme'
import '@/styles/rosa.css'

export default function Assessment() {
  const draft = useCompactDraft()
  const { paused, setPaused, seconds, setResult, setNote, resetTimer } = useAssessmentDraft()
  const [view, setView] = useState('list')
  const [activeSection, setActiveSection] = useState<string>('Preparation')
  const [revealed, setRevealed] = useState<string | null>(null)
  const [options, setOptions] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [media, setMedia] = useState<Record<string,number>>({})
  const [mediaVersion, setMediaVersion] = useState(0)
  const [message, setMessage] = useState('')
  const main = useRef<HTMLElement>(null)
  const listScroll = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const controllers = useRef<Record<string,EvidenceActions | null>>({})
  const origin = useRef<{id:string;x:number;y:number} | null>(null)
  const suppressClick = useRef(false)
  const pendingReview = useRef(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selected = criteria.find(c => c.id === view)
  const count = criteria.filter(c => draft.answers[c.id]).length
  const missing = criteria.filter(c => !draft.answers[c.id] || needsEvidence(c,draft.answers,draft.notes,media))
  const time = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`
  useMobileViewport()
  useMobileOverlay(view !== 'list', () => { setView('list'); return true })
  useMobileOverlay(options, () => { setOptions(false); return true })
  useMobileOverlay(resetOpen, () => { setResetOpen(false); return true })
  useEffect(() => {
    const theme = loadTheme()
    applyTheme({...theme,typography:{...theme.typography,body:'inter',heading:'inter',headingWeight:700},light:{...theme.light,background:'#f6f7f8',foreground:'#181a1e',card:'#ffffff','card-foreground':'#181a1e',primary:'#191c21','primary-foreground':'#ffffff',border:'#e8eaed','muted-foreground':'#717680',success:'#eaf6ef','success-foreground':'#127549',destructive:'#b8403b',warning:'#fff9ed','warning-foreground':'#786339'}},'light')
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])
  useLayoutEffect(() => {
    if (main.current) main.current.scrollTop = view === 'list' ? listScroll.current : 0
    if (view !== 'list') heading.current?.focus({preventScroll:true})
  }, [view])
  function toast(value: string) {
    setMessage(value)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setMessage(''),3000)
  }
  function open(value: string) {
    if (view === 'list') listScroll.current = main.current?.scrollTop ?? 0
    setRevealed(null); setView(value)
  }
  function answer(c: Criterion, value: Answer) {
    const next = draft.answers[c.id] === value ? '' : value
    draft.answer(c.id,value); setRevealed(null)
    if (c.id === 'p1') setResult(next === 'met' ? 'meets' : next === 'not' ? 'improve' : '')
  }
  function note(c: Criterion, value: string) { draft.note(c.id,value); if (c.id === 'p1') setNote(value) }
  function evidence(c: Criterion, type: 'note' | 'photo') {
    setRevealed(null)
    if (type === 'note') controllers.current[c.id]?.openNote()
    else controllers.current[c.id]?.openMedia()
  }
  function choices(c: Criterion, detail = false) {
    return <div className={detail ? 'rosa-detail-choices' : 'rosa-choices'} role="group" aria-label={`Assessment: ${c.title}`}>
      {(['met','not'] as const).map(value => <Button key={value} variant="outline" aria-label={`${c.title}: ${value === 'met' ? 'Meets standard' : 'Does not meet standard'}`} aria-pressed={draft.answers[c.id] === value} className={`rosa-choice ${detail ? 'rosa-choice-detail' : ''} ${draft.answers[c.id] === value ? value === 'met' ? 'is-met' : 'is-not' : ''}`} onClick={() => answer(c,value)}>{value === 'met' ? <Check/> : <X/>}{detail && <span>{value === 'met' ? 'Meets' : 'Not met'}</span>}</Button>)}
    </div>
  }
  function row(c: Criterion, index: number) {
    const value = draft.answers[c.id]
    const meta = [c.critical ? 'Critical' : null,draft.notes[c.id] ? 'Note' : null,media[c.id] ? `${media[c.id]} ${media[c.id]===1 ? 'Photo' : 'Photos'}` : null,needsEvidence(c,draft.answers,draft.notes,media) ? 'Evidence needed' : null].filter(Boolean).join(' · ')
    return <li key={c.id} className={`rosa-task ${revealed === c.id ? 'is-revealed' : ''}`}>
      <div className="rosa-swipe-actions" inert={revealed !== c.id} aria-hidden={revealed !== c.id}><button aria-label={`Add note: ${c.title}`} onClick={() => evidence(c,'note')}><FileText/><span>Note</span></button><button aria-label={`Add photo: ${c.title}`} onClick={() => evidence(c,'photo')}><Camera/><span>Photo</span></button></div>
      <div className="rosa-task-surface" onPointerDown={event => { origin.current={id:c.id,x:event.clientX,y:event.clientY}; suppressClick.current=false }} onPointerCancel={() => {origin.current=null}} onPointerUp={event => {
        const start=origin.current; origin.current=null
        if (!start || start.id !== c.id) return
        const dx=event.clientX-start.x,dy=event.clientY-start.y
        if (Math.abs(dx)>36 && Math.abs(dx)>Math.abs(dy)*1.15) { suppressClick.current=true; setRevealed(dx<0 ? c.id : null) }
      }} onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current=false } }}>
        <span className={`rosa-number ${value === 'met' ? 'is-met' : value === 'not' ? 'is-not' : ''}`} aria-hidden="true">{value === 'met' ? <Check/> : value === 'not' ? <X/> : index+1}</span>
        <button className="rosa-task-label" aria-label={`View details for ${c.title}`} onClick={() => { if(revealed) setRevealed(null); else open(c.id) }}><span className="rosa-task-title">{c.title}</span>{meta && <span className={`rosa-meta ${c.critical ? 'is-critical' : ''}`}>{meta}</span>}</button>
        {choices(c)}
      </div>
    </li>
  }
  return <div className="assessment-mobile rosa-app"><div className="rosa-phone">
    <header className="rosa-header">
      {view === 'list' ? <><div className="rosa-heading"><h1>Fryer Station</h1><div className="rosa-progress"><Progress value={count/criteria.length*100} aria-label="Assessed criteria" aria-valuenow={count} aria-valuemin={0} aria-valuemax={criteria.length}/><span>{count} / {criteria.length}</span></div></div><div className="rosa-header-actions"><span className="rosa-timer" aria-label="Elapsed time">{time}</span><Button variant="outline" size="icon" aria-label={paused ? 'Resume assessment' : 'Pause assessment'} onClick={() => {setPaused(!paused);toast(paused ? 'Assessment resumed' : 'Assessment paused')}}>{paused ? <Play/> : <Pause/>}</Button><Button variant="ghost" size="icon" aria-label="More options" onClick={() => setOptions(true)}><MoreHorizontal/></Button></div></> : <><Button variant="ghost" size="icon" aria-label="Back to checklist" onClick={() => setView('list')}><ArrowLeft/></Button><h2 ref={heading} tabIndex={-1}>{view === 'review' ? 'Assessment review' : 'Criterion details'}</h2></>}
    </header>
    {view === 'list' && <nav className="rosa-pills" aria-label="Checklist sections">{sections.map(section => <button key={section} aria-current={activeSection===section ? 'location' : undefined} className={activeSection===section ? 'active' : ''} onClick={() => {setActiveSection(section);setRevealed(null);document.getElementById(`rosa-${section}`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'})}}>{section}</button>)}</nav>}
    <main ref={main} className="rosa-main" onScroll={() => {
      if (view !== 'list' || !main.current) return
      const el=main.current
      if(el.scrollTop+el.clientHeight>=el.scrollHeight-2) {setActiveSection('Completion'); return}
      const top=el.getBoundingClientRect().top
      const active=sections.filter(s=>(document.getElementById(`rosa-${s}`)?.getBoundingClientRect().top ?? Infinity)<=top+45).at(-1)
      if(active) setActiveSection(active)
    }}>
      <div hidden={view !== 'list'} className="rosa-list">{sections.map(section => {const items=criteria.filter(c=>c.section===section);return <section key={section} id={`rosa-${section}`} className="rosa-section"><div className="rosa-section-heading"><h2>{section}</h2><span>{items.filter(c=>draft.answers[c.id]).length} / {items.length}</span></div><ol>{items.map(row)}</ol></section>})}<p className="rosa-tip"><Info/>Swipe left to add evidence · Tap a title for details</p></div>
      {selected && <div className="rosa-detail"><div className="rosa-detail-index">{selected.section} · Item {criteria.filter(c=>c.section===selected.section).findIndex(c=>c.id===selected.id)+1}{selected.critical && <span><AlertCircle/>Critical</span>}</div><h1>{selected.title}</h1><section className="rosa-info"><h2>Assessment question</h2><p>{selected.question}</p></section><section className="rosa-info"><h2>What to observe</h2><p>{selected.guidance}</p></section><section className="rosa-info"><h2>Criteria configuration <span>(illustrative)</span></h2><p>Weight {selected.weight} · {selected.critical ? 'Critical item' : 'Standard item'}{selected.evidence==='noteIfNot' ? ' · Note or photo required if not met' : ''}</p></section><section className="rosa-info"><h2>Assessment</h2>{choices(selected,true)}{needsEvidence(selected,draft.answers,draft.notes,media) && <p className="rosa-evidence-warning"><AlertCircle/>This prototype criterion needs a note or photo when not met.</p>}</section></div>}
      <div className="rosa-evidence-host">{criteria.map(c=><div key={`${c.id}-${mediaVersion}`} hidden={view!==c.id}><EvidencePanel note={draft.notes[c.id] ?? ''} onNoteChange={value=>note(c,value)} onCountChange={count=>setMedia(previous=>({...previous,[c.id]:count}))} controllerRef={api=>{controllers.current[c.id]=api}} context={c.title} persistentNote photosOnly/></div>)}</div>
      {view === 'review' && <div className="rosa-review"><h1>Review & completeness</h1><p className="rosa-review-intro">Verify observations and evidence before proceeding. Scoring and sign-off rules remain illustrative.</p><dl>{[['Assessed criteria',`${count} / ${criteria.length}`],['Meets standard',criteria.filter(c=>draft.answers[c.id]==='met').length],['Does not meet standard',criteria.filter(c=>draft.answers[c.id]==='not').length],['Critical criteria not met',criteria.filter(c=>c.critical&&draft.answers[c.id]==='not').length]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><section className="rosa-review-banner"><h2>{missing.length ? `${missing.length} item(s) need attention` : 'All prototype entries are complete'}</h2>{missing.length ? <ul>{missing.map(c=><li key={c.id}><button onClick={()=>open(c.id)}>{c.title}{needsEvidence(c,draft.answers,draft.notes,media) ? ' (evidence required)' : ''}<ChevronRight/></button></li>)}</ul> : <p>Submission and certification require validated rules and sign-off. Nothing has been submitted.</p>}</section><p className="rosa-local-note">Notes and responses are saved locally. Photos and videos remain in this page session.</p></div>}
    </main>
    <footer className="rosa-bottom">{view==='list' ? <><div><b>{count} of {criteria.length} assessed</b><small>{draft.saveError ? 'Local save unavailable · keep this page open' : 'Local draft · photos this session'}</small></div><Button onClick={()=>open('review')}>Review<ArrowRight/></Button></> : <Button className="w-full" onClick={()=>setView('list')}>Back to checklist</Button>}</footer>
    <Sheet open={options} onOpenChange={setOptions}><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl" onCloseAutoFocus={event=>{if(pendingReview.current){event.preventDefault();pendingReview.current=false;open('review')}}}><SheetHeader><SheetTitle>More options</SheetTitle><SheetDescription>Manage this local prototype draft.</SheetDescription></SheetHeader><div className="space-y-2 px-5 pb-5"><Button variant="outline" className="h-12 w-full justify-start" onClick={()=>toast(draft.save() ? 'Progress saved on this device' : 'Progress could not be saved locally')}>Save progress</Button><Button variant="outline" className="h-12 w-full justify-start" onClick={()=>{pendingReview.current=true;setOptions(false)}}>Review assessment</Button><Button variant="outline" className="h-12 w-full justify-start" onClick={()=>setResetOpen(true)}>Reset prototype</Button><a href="?studio=1" className="flex min-h-11 items-center text-xs text-muted-foreground underline">Open Theme Studio</a></div></SheetContent></Sheet>
    <AlertDialog open={resetOpen} onOpenChange={setResetOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset this prototype?</AlertDialogTitle><AlertDialogDescription>All 10 responses, notes and current photos will be cleared from this draft.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>{draft.reset();setResult('');setNote('');setMedia({});setMediaVersion(value=>value+1);resetTimer();setPaused(false);setRevealed(null);toast('Prototype responses and evidence reset')}}>Reset draft</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    {message && <div role="status" className="rosa-toast">{message}</div>}
  </div></div>
}
