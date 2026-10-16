import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Check, ChevronDown, ChevronRight, MoreHorizontal, Pause, Play, RotateCcw, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EvidencePanel, type EvidenceActions } from '@/components/assessment/evidence-panel'
import { FocusedResponse } from '@/components/assessment/focused-response'
import { focusedCriteria as criteria, sections, isComplete, answerSummary, validAnswer, type FocusedAnswer, type FocusedCriterion } from '@/data/focused-criteria'
import { emptyFocusedDraft, type FocusedDraft } from '@/data/focused-draft'
import { useFocusedDraft } from '@/hooks/use-focused-draft'
import { useAssessmentDraft } from '@/hooks/use-assessment-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'
import { applyTheme, loadTheme } from '@/lib/theme'
import { VersionSwitcher } from '@/components/layout/version-switcher'
import '@/styles/focused.css'

export default function Assessment() {
  const {draft,update,save,saveError}=useFocusedDraft()
  const {paused,setPaused,seconds,resetTimer}=useAssessmentDraft()
  const [section,setSection]=useState(criteria.find(c=>c.id===draft.active)!.section)
  const [photos,setPhotos]=useState<Record<string,number>>({})
  const [mediaVersion,setMediaVersion]=useState(0)
  const [questionOpen,setQuestionOpen]=useState(false)
  const [galleryTarget,setGalleryTarget]=useState<HTMLDivElement|null>(null)
  const [sheet,setSheet]=useState<'menu'|'review'|'pause'|null>(null)
  const [reset,setReset]=useState(false)
  const [pulse,setPulse]=useState<string|null>(null)
  const [message,setMessage]=useState('')
  const scroller=useRef<HTMLDivElement>(null)
  const controllers=useRef<Record<string,EvidenceActions|null>>({})
  const toastTimeout=useRef<ReturnType<typeof setTimeout>|null>(null)
  const pulseTimeout=useRef<ReturnType<typeof setTimeout>|null>(null)
  const pendingQuestion=useRef<string|null>(null)
  const pendingReview=useRef(false)
  const questionScroll=useRef<HTMLDivElement>(null)
  const questionTitle=useRef<HTMLHeadingElement>(null)
  const navigationFocus=useRef(false)
  const ready=criteria.filter(c=>isComplete(c,draft.answers,draft.notes,photos)).length
  const nextPending=(value:FocusedDraft=draft,media=photos)=>criteria.find(c=>!isComplete(c,value.answers,value.notes,media))
  useMobileViewport()
  useMobileOverlay(questionOpen,()=>{setQuestionOpen(false);return true})
  useMobileOverlay(sheet!==null,()=>{setSheet(null);return true})
  useMobileOverlay(reset,()=>{setReset(false);return true})
  useEffect(()=>{
    const theme=loadTheme()
    applyTheme({...theme,typography:{...theme.typography,body:'inter',heading:'inter',headingWeight:650},light:{...theme.light,background:'#f5f6f8',foreground:'#18202b',card:'#ffffff','card-foreground':'#18202b',primary:'#243044','primary-foreground':'#ffffff',border:'#e6e9ee','muted-foreground':'#687384',ring:'#3468c8'}},'light')
    return()=>{if(toastTimeout.current)clearTimeout(toastTimeout.current);if(pulseTimeout.current)clearTimeout(pulseTimeout.current)}
  },[])
  useLayoutEffect(()=>{
    if(questionOpen){questionScroll.current?.scrollTo({top:0});questionTitle.current?.focus({preventScroll:true});return}
    if(!navigationFocus.current)return
    navigationFocus.current=false
    const container=scroller.current,card=document.getElementById(`card-${draft.active}`)
    if(container&&card){const top=container.scrollTop+card.getBoundingClientRect().top-container.getBoundingClientRect().top-9;container.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  },[draft.active,questionOpen])
  function toast(value:string){setMessage(value);if(toastTimeout.current)clearTimeout(toastTimeout.current);toastTimeout.current=setTimeout(()=>setMessage(''),3000)}
  function focus(id:string,animate=true,open=true){const c=criteria.find(c=>c.id===id);if(!c)return;navigationFocus.current=true;update({...draft,active:id});setSection(c.section);setQuestionOpen(open);setPulse(animate?id:null);if(pulseTimeout.current)clearTimeout(pulseTimeout.current);pulseTimeout.current=setTimeout(()=>setPulse(null),850);if(!open && id===draft.active)document.getElementById(`card-${id}`)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  function record(c:FocusedCriterion,value:FocusedAnswer){if(paused)return;update({...draft,answers:{...draft.answers,[c.id]:value}})}
  function comment(c:FocusedCriterion,value:string){update({...draft,notes:{...draft.notes,[c.id]:value}})}
  function queueQuestion(id:string){pendingQuestion.current=id;setSheet(null)}
  function continueQuestion(){
    if(paused){setPaused(false);return}
    const c=criteria.find(c=>c.id===draft.active)!
    if(!isComplete(c,draft.answers,draft.notes,photos))return
    const next=nextPending()
    if(next)focus(next.id)
    else {pendingReview.current=true;setQuestionOpen(false)}
  }
  function openSheet(value:typeof sheet){setSheet(value)}
  const activeCriterion=criteria.find(c=>c.id===draft.active)!
  const typeLabel={binary:'Yes / No',rating:'Rating · 1–5',number:'Number',single:'Single choice',multi:'Multi-select'}
  return <div className="assessment-mobile focused-app"><div className="phone" aria-label="Rosa assessment prototype">
    <header className="phone-header"><div className="topline"><h1 className="screen-title">Fryer Station</h1><span className="time" title="Assessment session time, not task duration">{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</span><Button variant="ghost" size="icon" aria-label={paused?'Resume assessment':'Pause assessment'} onClick={()=>{if(paused){setPaused(false);toast('Assessment resumed')}else{setPaused(true);openSheet('pause')}}}>{paused?<Play/>:<Pause/>}</Button><Button variant="ghost" size="icon" aria-label="More options" onClick={()=>openSheet('menu')}><MoreHorizontal/></Button></div>
      <div className="header-mini"><Progress value={ready/criteria.length*100} aria-label="Assessment criteria complete" aria-valuemin={0} aria-valuemax={criteria.length} aria-valuenow={ready}/><span className="progress-label">{ready} of {criteria.length} assessed</span><VersionSwitcher current={1}/></div>
      <nav className="tabs" aria-label="Checklist sections">{sections.map(s=><button key={s} aria-current={s===section?'location':undefined} className="tab" disabled={paused} onClick={()=>{const items=criteria.filter(c=>c.section===s);focus((items.find(c=>!isComplete(c,draft.answers,draft.notes,photos))??items[0]).id,false,false)}}>{s}</button>)}</nav>
      {paused&&<p role="status" className="paused-banner">Paused · Resume to continue responding</p>}
    </header>
    <div ref={scroller} className="scroll">{sections.map(s=><section key={s} className="section" aria-label={s}><div className="section-head"><h2>{s}</h2><span>{criteria.filter(c=>c.section===s&&isComplete(c,draft.answers,draft.notes,photos)).length} / {criteria.filter(c=>c.section===s).length} assessed</span></div><div className="item-list">{criteria.filter(c=>c.section===s).map((c,index)=>{
      const active=draft.active===c.id,done=isComplete(c,draft.answers,draft.notes,photos),summary=answerSummary(c,draft.answers[c.id]),negative=c.type==='binary'&&draft.answers[c.id]==='not'
      return <article id={`card-${c.id}`} key={c.id} className={`criterion ${questionOpen&&active?'active':''}`}><div className="item-top"><h3 className="item-heading"><button id={`focus-${c.id}`} className="item-main" aria-haspopup="dialog" aria-controls={questionOpen&&active ? "criterion-question-sheet" : undefined} onClick={()=>focus(c.id,false)}><span className={`index ${done?negative?'attention':'success':active?'current':''} ${pulse===c.id?'pulse':''}`} aria-hidden="true">{done?(negative?<X/>:<Check/>):index+1}</span><span className="criterion-copy"><span className="criterion-title">{c.title}</span><span className="card-caps">{c.critical&&<span className="critical">Critical</span>}{c.weighted&&<span className="weighted">Weight {c.weighted}×</span>}<span className="type-label">{typeLabel[c.type]}</span></span></span></button></h3><div className="item-side">{summary&&<span className={`result ${negative?'negative':c.type!=='binary'?'neutral':''}`} title={summary}>{summary}</span>}<Button variant="ghost" size="icon" className="chevron" aria-label={`Open question: ${c.title}`} aria-haspopup="dialog" onClick={()=>focus(c.id,false)}><ChevronRight/></Button></div></div>

      </article>
    })}</div></section>)}</div>
    <footer className="bottom"><Button variant="outline" className="secondary-btn" onClick={()=>toast(save()?'Assessment saved in this browser':'Local save unavailable. Keep this page open.')}><Save/>Save</Button><Button variant="outline" className="secondary-btn" onClick={()=>openSheet('review')}>Review</Button><Button className="dark-btn" disabled={paused} onClick={()=>{const c=nextPending();if(c)focus(c.id);else openSheet('review')}}>{ready===criteria.length?'Review assessment':'Next pending'}<ArrowRight/></Button></footer>
    {saveError&&<p role="alert" className="save-warning">Local save unavailable — keep this page open.</p>}
    <Sheet open={sheet!==null} onOpenChange={open=>{if(!open)setSheet(null)}}><SheetContent side="bottom" className="mobile-sheet focused-sheet mx-auto max-w-lg rounded-t-2xl" onCloseAutoFocus={event=>{if(pendingQuestion.current){event.preventDefault();const id=pendingQuestion.current;pendingQuestion.current=null;focus(id)}}}><SheetHeader><SheetTitle>{sheet==='review'?'Assessment review':sheet==='pause'?'Assessment paused':'Assessment options'}</SheetTitle><SheetDescription>{sheet==='review'?`${ready} of ${criteria.length} criteria complete. ${ready===criteria.length?'All required entries are recorded.':'Incomplete criteria must be addressed before sign-off.'}`:sheet==='pause'?'Your responses, notes and active criterion are saved locally. Resume at the same point when ready.':'Manage your local assessment draft.'}</SheetDescription></SheetHeader>
      <div className="min-h-0 overflow-y-auto px-5 pb-5">{sheet==='review'?<>{sections.map(s=><section key={s}><h2 className="review-title">{s}</h2><div className="group-review">{criteria.filter(c=>c.section===s).map(c=><button key={c.id} className="review-row" onClick={()=>queueQuestion(c.id)}><span>{c.title}</span><span>{isComplete(c,draft.answers,draft.notes,photos)?answerSummary(c,draft.answers[c.id]):validAnswer(c,draft.answers[c.id])?'Evidence needed':'Pending'}</span></button>)}</div></section>)}<p className="confirmation">No weighted pass/fail formula is assumed. Sign-off and verified sync are not implemented in this prototype.</p><div className="sheet-actions"><Button variant="outline" onClick={()=>setSheet(null)}>Back to checklist</Button><Button disabled={ready!==criteria.length} onClick={()=>toast('Prototype only — sign-off is not implemented')}>{ready===criteria.length?'Ready for sign-off':'Complete checklist first'}</Button></div></>:sheet==='pause'?<><p className="confirmation">Session time is assessment time, not the employee’s task duration. Photos remain in this page session only.</p><div className="sheet-actions"><Button variant="outline" onClick={()=>setSheet(null)}>Keep paused</Button><Button onClick={()=>{setSheet(null);setPaused(false)}}>Resume assessment</Button></div></>:<><Button variant="ghost" className="menu-btn" onClick={()=>{const c=nextPending();if(c)queueQuestion(c.id);else toast('No pending criteria')}}><ArrowRight/>Jump to next pending criterion</Button><Button variant="ghost" className="menu-btn" onClick={()=>{setPaused(true);setSheet('pause')}}><Pause/>Pause & save</Button><Button variant="ghost" className="menu-btn" onClick={()=>setSheet('review')}><Check/>Review checklist</Button><Button variant="ghost" className="menu-btn" onClick={()=>setReset(true)}><RotateCcw/>Reset prototype demo</Button><a className="menu-btn" href="?studio=1">Open Theme Studio</a><p className="caption">All criteria, scales and evidence rules are illustrative.</p></>}
      {message&&<p role="status" className="sheet-status">{message}</p>}</div></SheetContent></Sheet>
    <Sheet open={questionOpen} onOpenChange={setQuestionOpen}><SheetContent id="criterion-question-sheet" side="bottom" className="mobile-sheet focused-sheet question-sheet mx-auto max-w-lg rounded-t-3xl" onOpenAutoFocus={event=>{event.preventDefault();questionTitle.current?.focus({preventScroll:true})}} onCloseAutoFocus={event=>{event.preventDefault();if(pendingReview.current){pendingReview.current=false;setSheet('review')}else document.getElementById(`focus-${draft.active}`)?.focus({preventScroll:true})}}>
      <SheetHeader className="question-header"><p className="question-context">{activeCriterion.section} · {criteria.findIndex(c=>c.id===activeCriterion.id)+1} of {criteria.length}</p><SheetTitle ref={questionTitle} tabIndex={-1} className="question-title">{activeCriterion.title}</SheetTitle><SheetDescription>{activeCriterion.question}</SheetDescription></SheetHeader>
      <div ref={questionScroll} className="question-body"><div className="focused-app question-content"><p className="prompt">{activeCriterion.type==='number'?'Recorded measurement':'Assessment response'}</p>
        <FocusedResponse key={activeCriterion.id} criterion={activeCriterion} answer={draft.answers[activeCriterion.id]} numeric={draft.numeric[activeCriterion.id]??String(draft.answers[activeCriterion.id]??'')} multi={draft.multi[activeCriterion.id]??(Array.isArray(draft.answers[activeCriterion.id])?draft.answers[activeCriterion.id] as string[]:[])} disabled={paused} onRecord={value=>record(activeCriterion,value)} onNumeric={value=>update({...draft,numeric:{...draft.numeric,[activeCriterion.id]:value}})} onMulti={values=>update({...draft,multi:{...draft.multi,[activeCriterion.id]:values}})}/>
        <button className="guidance" aria-expanded={!!draft.guides[activeCriterion.id]} aria-controls="question-guidance" onClick={()=>update({...draft,guides:{...draft.guides,[activeCriterion.id]:!draft.guides[activeCriterion.id]}})}><ChevronDown/>{draft.guides[activeCriterion.id]?'Hide':'View'} guidance</button><div id="question-guidance" hidden={!draft.guides[activeCriterion.id]} className="guidance-box">{activeCriterion.guide}</div>
        <section className="question-comment"><div className="question-comment-label"><label htmlFor={`comment-${activeCriterion.id}`}>Comment</label><span>{activeCriterion.evidence==='required'?'Comment or photo required':'Optional'}</span></div><Textarea id={`comment-${activeCriterion.id}`} value={draft.notes[activeCriterion.id]??''} onChange={event=>comment(activeCriterion,event.target.value)} disabled={paused} placeholder="What did you observe?" aria-describedby="question-comment-help"/><p id="question-comment-help">{saveError?'Local save unavailable. Keep this page open.':'Saved as you type on this device.'}</p></section>
        <div className="question-photo-bar"><div><span>Photo evidence</span><small>Photos stay in this session only</small></div><Button variant="outline" className="evidence-btn" onClick={()=>controllers.current[activeCriterion.id]?.openMedia()}><Camera/>{photos[activeCriterion.id]?'Add photo':'Photo'}</Button></div>
        <div ref={setGalleryTarget} className="question-gallery"/>
        {validAnswer(activeCriterion,draft.answers[activeCriterion.id])&&activeCriterion.evidence==='required'&&!isComplete(activeCriterion,draft.answers,draft.notes,photos)&&<p className="warning">Add a comment or photo before continuing.</p>}
      </div></div>
      <footer className="question-footer"><Button variant="outline" onClick={()=>setQuestionOpen(false)}>Back to list</Button><Button disabled={!paused&&!isComplete(activeCriterion,draft.answers,draft.notes,photos)} onClick={continueQuestion}>{paused?'Resume assessment':ready===criteria.length?'Review assessment':'Continue'}{!paused&&<ArrowRight/>}</Button></footer>
    </SheetContent></Sheet>
    <div hidden>{criteria.map(c=><EvidencePanel key={`${c.id}-${mediaVersion}`} note={draft.notes[c.id]??''} onNoteChange={value=>comment(c,value)} onCountChange={count=>setPhotos(previous=>({...previous,[c.id]:count}))} controllerRef={api=>{controllers.current[c.id]=api}} context={c.title} persistentNote photosOnly compact externalGallery galleryTarget={questionOpen&&draft.active===c.id?galleryTarget:null}/>)}</div>
    <AlertDialog open={reset} onOpenChange={setReset}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset prototype?</AlertDialogTitle><AlertDialogDescription>Clear this version’s answers, notes, numeric drafts and photos. Older version drafts are retained.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>{update(emptyFocusedDraft());setPhotos({});setMediaVersion(v=>v+1);setSection('Preparation');resetTimer();setPaused(false);toast('Prototype reset')}}>Reset demo</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    {message&&!sheet&&<div className="focused-toast" role="status">{message}</div>}
  </div></div>
}
