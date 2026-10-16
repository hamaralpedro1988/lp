import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Check, ChevronDown, FileText, MoreHorizontal, Pause, Play, RotateCcw, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import '@/styles/focused.css'

export default function Assessment() {
  const {draft,update,save,saveError}=useFocusedDraft()
  const {paused,setPaused,seconds,resetTimer}=useAssessmentDraft()
  const [section,setSection]=useState(criteria.find(c=>c.id===draft.active)!.section)
  const [photos,setPhotos]=useState<Record<string,number>>({})
  const [mediaVersion,setMediaVersion]=useState(0)
  const [sheet,setSheet]=useState<'menu'|'review'|'pause'|null>(null)
  const [reset,setReset]=useState(false)
  const [pulse,setPulse]=useState<string|null>(null)
  const [message,setMessage]=useState('')
  const scroller=useRef<HTMLDivElement>(null)
  const controllers=useRef<Record<string,EvidenceActions|null>>({})
  const auto=useRef<ReturnType<typeof setTimeout>|null>(null)
  const toastTimeout=useRef<ReturnType<typeof setTimeout>|null>(null)
  const pulseTimeout=useRef<ReturnType<typeof setTimeout>|null>(null)
  const pendingEvidence=useRef<string|null>(null)
  const navigationFocus=useRef(false)
  const ready=criteria.filter(c=>isComplete(c,draft.answers,draft.notes,photos)).length
  const nextPending=(value:FocusedDraft=draft,media=photos)=>criteria.find(c=>!isComplete(c,value.answers,value.notes,media))
  useMobileViewport()
  useMobileOverlay(sheet!==null,()=>{setSheet(null);return true})
  useMobileOverlay(reset,()=>{setReset(false);return true})
  useEffect(()=>{
    const theme=loadTheme()
    applyTheme({...theme,typography:{...theme.typography,body:'inter',heading:'inter',headingWeight:650},light:{...theme.light,background:'#f5f6f8',foreground:'#18202b',card:'#ffffff','card-foreground':'#18202b',primary:'#243044','primary-foreground':'#ffffff',border:'#e6e9ee','muted-foreground':'#687384',ring:'#3468c8'}},'light')
    return()=>{if(auto.current)clearTimeout(auto.current);if(toastTimeout.current)clearTimeout(toastTimeout.current);if(pulseTimeout.current)clearTimeout(pulseTimeout.current)}
  },[])
  useEffect(()=>{if(paused && auto.current)clearTimeout(auto.current)},[paused])
  useLayoutEffect(()=>{
    if(!navigationFocus.current)return
    navigationFocus.current=false
    const container=scroller.current,card=document.getElementById(`card-${draft.active}`)
    if(container&&card){const top=container.scrollTop+card.getBoundingClientRect().top-container.getBoundingClientRect().top-9;container.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.getElementById(`focus-${draft.active}`)?.focus({preventScroll:true})}
  },[draft.active])
  function toast(value:string){setMessage(value);if(toastTimeout.current)clearTimeout(toastTimeout.current);toastTimeout.current=setTimeout(()=>setMessage(''),3000)}
  function cancelAdvance(){if(auto.current)clearTimeout(auto.current);auto.current=null}
  function focus(id:string,animate=true){cancelAdvance();pendingEvidence.current=null;const c=criteria.find(c=>c.id===id);if(!c)return;navigationFocus.current=id!==draft.active;update({...draft,active:id});setSection(c.section);setPulse(animate?id:null);if(pulseTimeout.current)clearTimeout(pulseTimeout.current);pulseTimeout.current=setTimeout(()=>setPulse(null),850);if(id===draft.active)document.getElementById(`card-${id}`)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  function proceed(c:FocusedCriterion,value:FocusedDraft,media=photos){
    cancelAdvance()
    if(paused)return
    if(!isComplete(c,value.answers,value.notes,media)){if(validAnswer(c,value.answers[c.id])&&c.evidence==='required')toast('Add a note or photo to finish this criterion');return}
    const next=nextPending(value,media)
    if(next)auto.current=setTimeout(()=>{navigationFocus.current=next.id!==value.active;update({...value,active:next.id});setSection(next.section);setPulse(next.id);if(pulseTimeout.current)clearTimeout(pulseTimeout.current);pulseTimeout.current=setTimeout(()=>setPulse(null),850)},350)
    else toast('All criteria recorded — ready to review')
  }
  function record(c:FocusedCriterion,value:FocusedAnswer){if(paused)return;const next={...draft,answers:{...draft.answers,[c.id]:value}};update(next);proceed(c,next)}
  function evidenceChanged(c:FocusedCriterion,note?:string,count?:number){
    cancelAdvance()
    const value=note===undefined?draft:{...draft,notes:{...draft.notes,[c.id]:note}}
    const media=count===undefined?photos:{...photos,[c.id]:count}
    if(note!==undefined)update(value)
    if(count!==undefined)setPhotos(media)
    if(!paused && draft.active===c.id && c.evidence==='required' && isComplete(c,value.answers,value.notes,media)){if(count!==undefined)proceed(c,value,media);else pendingEvidence.current=c.id}
    else pendingEvidence.current=null
  }
  function evidenceClosed(c:FocusedCriterion){if(pendingEvidence.current===c.id){pendingEvidence.current=null;proceed(c,draft,photos)}}
  function openEvidence(c:FocusedCriterion,type:'note'|'photo'){cancelAdvance();if(type==='note')controllers.current[c.id]?.openNote();else controllers.current[c.id]?.openMedia()}
  function openSheet(value:typeof sheet){cancelAdvance();pendingEvidence.current=null;setSheet(value)}
  const typeLabel={binary:'Yes / No',rating:'Rating · 1–5',number:'Number',single:'Single choice',multi:'Multi-select'}
  return <div className="assessment-mobile focused-app"><div className="phone" aria-label="Rosa assessment prototype">
    <header className="phone-header"><div className="topline"><h1 className="screen-title">Fryer Station</h1><span className="time" title="Assessment session time, not task duration">{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</span><Button variant="ghost" size="icon" aria-label={paused?'Resume assessment':'Pause assessment'} onClick={()=>{cancelAdvance();if(paused){setPaused(false);toast('Assessment resumed')}else{setPaused(true);openSheet('pause')}}}>{paused?<Play/>:<Pause/>}</Button><Button variant="ghost" size="icon" aria-label="More options" onClick={()=>openSheet('menu')}><MoreHorizontal/></Button></div>
      <div className="header-mini"><Progress value={ready/criteria.length*100} aria-label="Assessment criteria complete" aria-valuemin={0} aria-valuemax={criteria.length} aria-valuenow={ready}/><span className="progress-label">{ready} of {criteria.length} assessed</span></div>
      <nav className="tabs" aria-label="Checklist sections">{sections.map(s=><button key={s} aria-current={s===section?'location':undefined} className="tab" disabled={paused} onClick={()=>{const items=criteria.filter(c=>c.section===s);focus((items.find(c=>!isComplete(c,draft.answers,draft.notes,photos))??items[0]).id)}}>{s}</button>)}</nav>
      {paused&&<p role="status" className="paused-banner">Paused · Resume to continue responding</p>}
    </header>
    <div ref={scroller} className="scroll">{sections.map(s=><section key={s} className="section" aria-label={s}><div className="section-head"><h2>{s}</h2><span>{criteria.filter(c=>c.section===s&&isComplete(c,draft.answers,draft.notes,photos)).length} / {criteria.filter(c=>c.section===s).length} assessed</span></div><div className="item-list">{criteria.filter(c=>c.section===s).map((c,index)=>{
      const active=draft.active===c.id,done=isComplete(c,draft.answers,draft.notes,photos),summary=answerSummary(c,draft.answers[c.id]),negative=c.type==='binary'&&draft.answers[c.id]==='not'
      return <article id={`card-${c.id}`} key={c.id} className={`criterion ${active?'active':''}`}><div className="item-top"><h3 className="item-heading"><button id={`focus-${c.id}`} className="item-main" aria-expanded={active} aria-controls={`detail-${c.id}`} disabled={paused} onClick={()=>focus(c.id,false)}><span className={`index ${done?negative?'attention':'success':active?'current':''} ${pulse===c.id?'pulse':''}`} aria-hidden="true">{done?(negative?<X/>:<Check/>):index+1}</span><span className="criterion-copy"><span className="criterion-title">{c.title}</span><span className="card-caps">{c.critical&&<span className="critical">Critical</span>}{c.weighted&&<span className="weighted">Weight {c.weighted}×</span>}<span className="type-label">{typeLabel[c.type]}</span></span></span></button></h3><div className="item-side">{summary&&<span className={`result ${negative?'negative':c.type!=='binary'?'neutral':''}`} title={summary}>{summary}</span>}<Button variant="ghost" size="icon" className="chevron" aria-label={`Focus ${c.title}`} disabled={paused} onClick={()=>focus(c.id,false)}><ChevronDown/></Button></div></div>
        <div id={`detail-${c.id}`} role="region" aria-labelledby={`focus-${c.id}`} hidden={!active} className="details"><p className="question">{c.question}</p><p className="prompt">{c.type==='number'?'Recorded measurement':'Assessment response'}</p>
          <FocusedResponse criterion={c} answer={draft.answers[c.id]} numeric={draft.numeric[c.id]??String(draft.answers[c.id]??'')} multi={draft.multi[c.id]??(Array.isArray(draft.answers[c.id])?draft.answers[c.id] as string[]:[])} disabled={paused} onRecord={value=>record(c,value)} onNumeric={value=>{cancelAdvance();update({...draft,numeric:{...draft.numeric,[c.id]:value}})}} onMulti={values=>{cancelAdvance();update({...draft,multi:{...draft.multi,[c.id]:values}})}}/>
          <button className="guidance" aria-expanded={!!draft.guides[c.id]} aria-controls={`guide-${c.id}`} onClick={()=>{cancelAdvance();update({...draft,guides:{...draft.guides,[c.id]:!draft.guides[c.id]}})}}><ChevronDown/>{draft.guides[c.id]?'Hide':'View'} guidance</button><div id={`guide-${c.id}`} hidden={!draft.guides[c.id]} className="guidance-box">{c.guide}</div>
          <div className="evidence-bar"><span className={`evidence-copy ${c.evidence==='required'?'req':''}`}>{c.evidence==='required'?'Evidence required':'Supporting evidence · optional'}</span><span className="evidence-actions"><Button variant="outline" className={`evidence-btn ${photos[c.id]?'has':''}`} onClick={()=>openEvidence(c,'photo')}><Camera/>{photos[c.id]?'Photo added':'Photo'}</Button><Button variant="outline" className={`evidence-btn ${draft.notes[c.id]?'has':''}`} onClick={()=>openEvidence(c,'note')}><FileText/>{draft.notes[c.id]?'Note added':'Note'}</Button></span></div>
          {validAnswer(c,draft.answers[c.id])&&c.evidence==='required'&&!isComplete(c,draft.answers,draft.notes,photos)&&<p className="warning">A note or photo is required before this criterion can count as complete.</p>}
          <EvidencePanel key={`${c.id}-${mediaVersion}`} note={draft.notes[c.id]??''} onNoteChange={value=>evidenceChanged(c,value)} onCountChange={count=>evidenceChanged(c,undefined,count)} controllerRef={api=>{controllers.current[c.id]=api}} context={c.title} persistentNote photosOnly compact onOverlayClosed={()=>evidenceClosed(c)}/>
        </div>
      </article>
    })}</div></section>)}</div>
    <footer className="bottom"><Button variant="outline" className="secondary-btn" onClick={()=>toast(save()?'Assessment saved in this browser':'Local save unavailable. Keep this page open.')}><Save/>Save</Button><Button variant="outline" className="secondary-btn" onClick={()=>openSheet('review')}>Review</Button><Button className="dark-btn" disabled={paused} onClick={()=>{const c=nextPending();if(c)focus(c.id);else openSheet('review')}}>{ready===criteria.length?'Review assessment':'Next pending'}<ArrowRight/></Button></footer>
    {saveError&&<p role="alert" className="save-warning">Local save unavailable — keep this page open.</p>}
    <Sheet open={sheet!==null} onOpenChange={open=>{if(!open)setSheet(null)}}><SheetContent side="bottom" className="mobile-sheet focused-sheet mx-auto max-w-lg rounded-t-2xl"><SheetHeader><SheetTitle>{sheet==='review'?'Assessment review':sheet==='pause'?'Assessment paused':'Assessment options'}</SheetTitle><SheetDescription>{sheet==='review'?`${ready} of ${criteria.length} criteria complete. ${ready===criteria.length?'All required entries are recorded.':'Incomplete criteria must be addressed before sign-off.'}`:sheet==='pause'?'Your responses, notes and active criterion are saved locally. Resume at the same point when ready.':'Manage your local assessment draft.'}</SheetDescription></SheetHeader>
      <div className="min-h-0 overflow-y-auto px-5 pb-5">{sheet==='review'?<>{sections.map(s=><section key={s}><h2 className="review-title">{s}</h2><div className="group-review">{criteria.filter(c=>c.section===s).map(c=><button key={c.id} className="review-row" onClick={()=>{setSheet(null);focus(c.id)}}><span>{c.title}</span><span>{isComplete(c,draft.answers,draft.notes,photos)?answerSummary(c,draft.answers[c.id]):validAnswer(c,draft.answers[c.id])?'Evidence needed':'Pending'}</span></button>)}</div></section>)}<p className="confirmation">No weighted pass/fail formula is assumed. Sign-off and verified sync are not implemented in this prototype.</p><div className="sheet-actions"><Button variant="outline" onClick={()=>setSheet(null)}>Back to checklist</Button><Button disabled={ready!==criteria.length} onClick={()=>toast('Prototype only — sign-off is not implemented')}>{ready===criteria.length?'Ready for sign-off':'Complete checklist first'}</Button></div></>:sheet==='pause'?<><p className="confirmation">Session time is assessment time, not the employee’s task duration. Photos remain in this page session only.</p><div className="sheet-actions"><Button variant="outline" onClick={()=>setSheet(null)}>Keep paused</Button><Button onClick={()=>{setSheet(null);setPaused(false);focus(draft.active)}}>Resume assessment</Button></div></>:<><Button variant="ghost" className="menu-btn" onClick={()=>{setSheet(null);const c=nextPending();if(c)focus(c.id);else toast('No pending criteria')}}><ArrowRight/>Jump to next pending criterion</Button><Button variant="ghost" className="menu-btn" onClick={()=>{setPaused(true);setSheet('pause')}}><Pause/>Pause & save</Button><Button variant="ghost" className="menu-btn" onClick={()=>setSheet('review')}><Check/>Review checklist</Button><Button variant="ghost" className="menu-btn" onClick={()=>setReset(true)}><RotateCcw/>Reset prototype demo</Button><a className="menu-btn" href="?studio=1">Open Theme Studio</a><p className="caption">All criteria, scales and evidence rules are illustrative.</p></>}
      {message&&<p role="status" className="sheet-status">{message}</p>}</div></SheetContent></Sheet>
    <AlertDialog open={reset} onOpenChange={setReset}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset prototype?</AlertDialogTitle><AlertDialogDescription>Clear this version’s answers, notes, numeric drafts and photos. Older version drafts are retained.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>{cancelAdvance();update(emptyFocusedDraft());setPhotos({});setMediaVersion(v=>v+1);setSection('Preparation');resetTimer();setPaused(false);toast('Prototype reset')}}>Reset demo</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    {message&&!sheet&&<div className="focused-toast" role="status">{message}</div>}
  </div></div>
}
