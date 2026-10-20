import { spatialSelectChecklistTask, spatialChecklistDescription, spatialNextPosition, spatialActiveIndex } from '@/data/spatial-checklist'
import { spatialLifecycle } from '@/data/spatial-lifecycle'
import { SpatialSlideComplete } from '@/components/assessment/spatial-slide-complete'
import { SpatialAssessmentPreview } from '@/components/assessment/spatial-assessment-preview'
import { SpatialBeforeStart } from '@/components/assessment/spatial-before-start'
import { SpatialSubmission } from '@/components/assessment/spatial-submission'
import { spatialOverviewLearning } from '@/data/spatial-overview'
import { SpatialCriterionGuidance } from '@/components/assessment/spatial-guidance'
import { spatialMissing, spatialNavigationBlock, updateSpatialObservation } from '@/data/spatial-flow'
import { createPortal } from 'react-dom'
import { useCallback, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EvidenceAttachment } from '@/components/assessment/evidence-panel'
import { SpatialSystemChrome, SpatialAssessmentHeader, SpatialChoices, SpatialEvidenceComposer, SpatialLiveCard, SpatialNavigation, SpatialProgress, SpatialSections, SpatialStatus } from '@/components/assessment/spatial-primitives'
import { SpatialAssignmentCard, SpatialPeopleCard, SpatialStationHeading, SpatialReviewList, SpatialReviewSummary, SpatialReviewNextSteps } from '@/components/assessment/spatial-journey'
import { type FlowAnswer } from '@/data/flow-draft'
import { createExplorerDraft, explorerScenarios, type ExplorerScenario } from '@/data/design-system/fixtures'

const sampleImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#f0edfa"/><text x="120" y="84" text-anchor="middle" fill="#6555a9" font-size="16" font-family="sans-serif">Preview illustration</text></svg>')
export function RosaPreview({ pattern }: { pattern: string }) {
  const [scenario, setScenario] = useState<ExplorerScenario>('Unanswered')
  const [draft, setDraft] = useState(() => createExplorerDraft())
  const [photo, setPhoto] = useState<Record<number,boolean>>({})
  const [galleryTarget,setGalleryTarget] = useState<HTMLDivElement | null>(null)
  const [sections, setSections] = useState(false)
  const [media, setMedia] = useState(false)
  const [preview, setPreview] = useState(false)
  const [editing, setEditing] = useState(false)
  const [member, setMember] = useState(false)
  const [notice, setNotice] = useState('Preview only · no assessment data is changed.')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const criterionNavigation = useRef<((direction: 'next' | 'back') => void) | null>(null)
  const sectionsRef = useRef<HTMLButtonElement>(null)
  const sectionsPreviewBack = useRef<(() => boolean) | null>(null)
  const registerSectionsPreview = useCallback((back: (() => boolean) | null) => { sectionsPreviewBack.current = back }, [])
  const mediaTrigger = useRef<HTMLElement | null>(null)
  const photos = Object.fromEntries(Object.entries(photo).map(([key,value])=>[key,value?1:0]))
  const attached=!!photo[draft.index]
  const scenarioOptions=explorerScenarios.filter(value => {
    if(value==='Disabled')return pattern==='choices'
    if(value==='Save error'||value==='Offline')return ['header','card','system'].includes(pattern)
    return true
  })
  const lifecycle = spatialLifecycle(draft, photos)
  const assignmentStatus = lifecycle.status
  const canContinue = !spatialMissing(draft,photos).includes(draft.index)
  function onAnswer(value: FlowAnswer) { setDraft(previous => ({ ...previous, assessorConfirmed:false, answers:{ ...previous.answers, [previous.index]:value } })) }
  function onNote(value: string) { setDraft(previous => ({ ...previous, assessorConfirmed:false, notes:{ ...previous.notes,[previous.index]:value } })) }
  function camera() { mediaTrigger.current = document.activeElement as HTMLElement; setMedia(true) }
  function restoreMedia(event: Event) { event.preventDefault(); mediaTrigger.current?.focus() }
  function navigateCriterion(direction: 'next' | 'back') {
    const blocked = spatialNavigationBlock(draft, photos, direction)
    if (blocked) { setNotice(blocked); return }
    if (direction === 'next' && draft.index === 10 && draft.index === spatialActiveIndex(draft)) { setNotice('Review opens next in the real flow.'); return }
    setDraft(previous => ({ ...previous, ...(direction === 'next' ? spatialNextPosition(previous) : { index: previous.index - 1, activeIndex: spatialActiveIndex(previous) }) }))
  }
  const attachment = attached && <div className="flow-gallery spatial-attachments"><div className="grid grid-cols-2 gap-3"><EvidenceAttachment file={{ name:'Preview illustration.svg',url:sampleImage,video:false }} onPreview={() => { mediaTrigger.current=document.activeElement as HTMLElement; setPreview(true) }} onRemove={() => setPhoto(previous=>({...previous,[draft.index]:false}))}/></div></div>
  const footer = <SpatialNavigation index={draft.index} reviewing={draft.index !== spatialActiveIndex(draft)} canContinue={canContinue} sectionsRef={sectionsRef} onBack={() => (criterionNavigation.current ?? navigateCriterion)('back')} onSections={() => setSections(true)} onNext={() => (criterionNavigation.current ?? navigateCriterion)('next')}/>
  const live = <><SpatialSystemChrome mode="preview"/><SpatialAssessmentHeader draft={draft} photos={photos} saveError={scenario === 'Save error'} onMember={() => setMember(true)} onBack={() => setNotice('Header Back returns to Overview in the real flow.')}/><div className="assessment-screen screen"><SpatialLiveCard draft={draft} photos={photos} direction="next" titleRef={titleRef} onAnswer={onAnswer} onNote={onNote} onCamera={camera} galleryRef={setGalleryTarget} onNavigate={navigateCriterion} navigationRef={criterionNavigation} swipeEnabled={!sections && !media && !preview && !member}/>{galleryTarget&&createPortal(attachment,galleryTarget)}</div><footer className="phonebottom">{footer}</footer></>
  return <>
    <div className="ds-story-controls"><label htmlFor="rosa-scenario">Story state</label><Select value={scenario} onValueChange={value => { const next=value as ExplorerScenario;setScenario(next);setDraft(createExplorerDraft(pattern === 'completion' && next === 'Save error' ? 'Complete' : next));setPhoto(next === 'Complete' || (pattern === 'completion' && next === 'Save error') ? {8:true} : {});setEditing(false) }}><SelectTrigger id="rosa-scenario"><SelectValue/></SelectTrigger><SelectContent>{scenarioOptions.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Badge variant="outline">In-memory fixture</Badge></div>
    <div className="ds-rosa-layout"><div className="ds-device flow-app flow-v5" data-pattern={pattern}>
      <div className={`ds-pattern-canvas ${pattern === 'card' || editing ? 'ds-live-canvas' : ''}`}>
        {pattern === 'assignment' && <SpatialAssignmentCard draft={draft} photos={photos} action={lifecycle.action} status={assignmentStatus} onOpen={() => setNotice('View Assessment opens Overview in Rosa V5. This story stays isolated.')}/>}
        {pattern === 'completion' && <><p>Pre-accessibility finish interaction: slide to finish, or use the existing two-step keyboard activation.</p><SpatialSlideComplete key={scenario} disabled={spatialMissing(draft, photos).length > 0} onComplete={() => { setNotice('Completion confirmed in memory only. No assessment data was changed.') }}/><p>{spatialMissing(draft, photos).length === 0 ? 'Ready to finish.' : 'Choose the Complete story state to preview finishing.'}</p></>}
        {pattern === 'assessment-preview' && <SpatialAssessmentPreview/>}
        {pattern === 'before-start' && <SpatialBeforeStart/>}
        {pattern === 'people' && <><SpatialStationHeading/><SpatialPeopleCard status={assignmentStatus} learning={spatialOverviewLearning} onMember={() => setMember(true)}/></>}
        {pattern === 'header' && <><SpatialSystemChrome mode="preview"/><SpatialAssessmentHeader draft={draft} photos={photos} saveError={scenario === 'Save error'} onMember={() => setMember(true)} onBack={() => setNotice('Overview Back selected. Footer Back instead moves one task.')}/></>}
        {(pattern === 'card' || editing) && live}
        {pattern === 'guidance' && <SpatialCriterionGuidance key={draft.index} index={draft.index}/>}
        {pattern === 'choices' && <SpatialChoices value={draft.answers[draft.index] ?? ''} disabled={scenario === 'Disabled'} onChange={onAnswer}/>}
        {pattern === 'evidence' && <><SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={attached ? 1:0} requirement={scenario === 'Required evidence' ? 'comment-and-photo' : 'none'} onNote={onNote} onCamera={camera}/>{attachment}</>}
        {pattern === 'footer' && <><SpatialStatus>{canContinue ? 'Response and configured evidence complete.' : 'Next is disabled until the response and required evidence are recorded.'}</SpatialStatus><SpatialChoices value={draft.answers[draft.index] ?? ''} onChange={onAnswer}/>{scenario === 'Required evidence' && <SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={photos[draft.index] ?? 0} requirement="comment-and-photo" onNote={onNote} onCamera={camera}/>}<footer className="phonebottom">{footer}</footer></>}
        {pattern === 'sections' && <Sheet open={sections} onOpenChange={open => { if (!open && sectionsPreviewBack.current?.()) return; setSections(open) }}><SheetTrigger asChild><Button variant="outline">All tasks</Button></SheetTrigger><SheetContent onEscapeKeyDown={event => { if (sectionsPreviewBack.current?.()) event.preventDefault() }} side="bottom" className="flow-sheet mobile-sheet mx-auto"><SheetHeader><SheetTitle>All tasks</SheetTitle><SheetDescription>{spatialChecklistDescription}</SheetDescription></SheetHeader><div className="overflow-y-auto px-5 pb-5"><SpatialSections draft={draft} photos={photos} registerPreviewBack={registerSectionsPreview} onJump={index => { const next = spatialSelectChecklistTask(draft, photos, index);if (next) {setDraft(next);setSections(false);setNotice(`Reviewing task ${index+1}.`)} }}/></div></SheetContent></Sheet>}
        {pattern === 'progress' && <><SpatialSystemChrome mode="preview"/><SpatialProgress draft={draft} photos={photos}/><SpatialStatus>{spatialMissing(draft,photos).length} tasks incomplete. A recorded Fail counts toward completion; a Pass without required evidence does not.</SpatialStatus></>}
        {pattern === 'review' && !editing && <><SpatialPeopleCard compact status="" onMember={() => setMember(true)}/><SpatialReviewSummary draft={draft} photos={photos}/><SpatialReviewNextSteps draft={draft}/><SpatialReviewList draft={draft} photos={photos} onSaveObservation={(index, value) => { const next = updateSpatialObservation(draft, index, value); if (!next) return false; setDraft(next); return true }} evidence={index => photo[index] ? <EvidenceAttachment file={{name:'Preview illustration.svg',url:sampleImage,video:false}} onPreview={event => {mediaTrigger.current=event.currentTarget;setPreview(true)}}/> : null} onEdit={index => { setDraft(previous => ({ ...previous,index }));setEditing(true) }}/></>}
        {pattern === 'signoff' && <><SpatialSubmission draft={draft} onFeedback={feedback => setDraft(previous => ({ ...previous, feedback }))} onSignature={signature => setDraft(previous => ({ ...previous, signature }))}/><Button disabled={!draft.signature || spatialMissing(draft,photos).length > 0} onClick={() => setNotice('Submission saved in this preview only. Nothing was sent to a manager.')}>Submit assessment</Button><SpatialStatus>Local signature and feedback demonstration. No server submission or certification.</SpatialStatus></>}
        {pattern === 'system' && <><SpatialStatus>Local draft · stored on this device in the real flow.</SpatialStatus><SpatialStatus tone="warning">Offline · draft saved on this device only.</SpatialStatus><SpatialStatus tone="error">Unable to save on this device. Keep this page open.</SpatialStatus><SpatialStatus tone="warning">Comment and photo required before continuing.</SpatialStatus><SpatialStatus tone="success">Required observations recorded. This is not an overall pass.</SpatialStatus><div className="spatial-empty-state">No attachments yet.</div><div role="status" aria-label="Preparing assessment example"><Skeleton className="h-5 w-40"/><p>Preparing assessment… · loading example</p></div><SpatialStatus>Pending sync is an architectural boundary, not an implemented server state. No “synced” claim is shown.</SpatialStatus></>}
        {editing && <Button variant="outline" onClick={() => setEditing(false)}>Back to review preview</Button>}
      </div>
    </div></div>
    <p className="ds-preview-status" role="status">{notice}</p>
    {pattern !== 'sections' && <Sheet open={sections} onOpenChange={open => { if (!open && sectionsPreviewBack.current?.()) return; setSections(open) }}><SheetContent onEscapeKeyDown={event => { if (sectionsPreviewBack.current?.()) event.preventDefault() }} side="bottom" className="flow-sheet mobile-sheet mx-auto" onCloseAutoFocus={event => { event.preventDefault();sectionsRef.current?.focus() }}><SheetHeader><SheetTitle>All tasks</SheetTitle><SheetDescription>{spatialChecklistDescription}</SheetDescription></SheetHeader><div className="overflow-y-auto px-5 pb-5"><SpatialSections draft={draft} photos={photos} registerPreviewBack={registerSectionsPreview} onJump={index => { const next = spatialSelectChecklistTask(draft, photos, index);if(next){setDraft(next);setSections(false)} }}/></div></SheetContent></Sheet>}
    <Sheet open={member} onOpenChange={setMember}><SheetContent onEscapeKeyDown={event => { if (sectionsPreviewBack.current?.()) event.preventDefault() }} side="bottom" className="flow-sheet mobile-sheet mx-auto"><SheetHeader><SheetTitle>Team member</SheetTitle><SheetDescription>Dre Jackson · Crew Floor Member</SheetDescription></SheetHeader><div className="px-5 pb-5"><p>Assigned assessment: Fryer Station</p><Button variant="outline" onClick={() => setMember(false)}>Back to assessment</Button></div></SheetContent></Sheet>
    <Dialog open={media} onOpenChange={setMedia}><DialogContent onCloseAutoFocus={restoreMedia}><DialogHeader><DialogTitle>Preview camera interaction</DialogTitle><DialogDescription>No camera, device library or upload is opened. Add a labelled illustration to explore the shared attachment UI safely.</DialogDescription></DialogHeader><Button onClick={() => {setPhoto(previous=>({...previous,[draft.index]:true}));setMedia(false);setNotice('Preview illustration attached in memory only.') }}>Add sample attachment</Button></DialogContent></Dialog>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent onCloseAutoFocus={restoreMedia}><DialogHeader><DialogTitle>Preview illustration</DialogTitle><DialogDescription>Sample attachment only. Real capture and uploads are not invoked.</DialogDescription></DialogHeader><img src={sampleImage} alt="Preview illustration"/></DialogContent></Dialog>
  </>
}
