import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EvidenceAttachment } from '@/components/assessment/evidence-panel'
import { SpatialAssessmentHeader, SpatialChoices, SpatialEvidenceComposer, SpatialLiveCard, SpatialNavigation, SpatialProgress, SpatialSections, SpatialStatus } from '@/components/assessment/spatial-primitives'
import { SpatialApprovals, SpatialAssignmentCard, SpatialFeedbackCard, SpatialPeopleCard, SpatialReviewList, SpatialReviewSummary } from '@/components/assessment/spatial-journey'
import { flowEvidenceOk, flowMissing, type FlowAnswer } from '@/data/flow-draft'
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
  const [manager, setManager] = useState(false)
  const [notice, setNotice] = useState('Preview only · no assessment data is changed.')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sectionsRef = useRef<HTMLButtonElement>(null)
  const mediaTrigger = useRef<HTMLElement | null>(null)
  const photos = Object.fromEntries(Object.entries(photo).map(([key,value])=>[key,value?1:0]))
  const attached=!!photo[draft.index]
  const scenarioOptions=explorerScenarios.filter(value => {
    if(value==='Disabled')return pattern==='choices'
    if(value==='Save error'||value==='Offline')return ['header','card','system'].includes(pattern)
    return true
  })
  const assignmentStatus=flowMissing(draft,photos).length===0?'Ready for review':Object.keys(draft.answers).length?'In progress':'Ready to Start'
  const canContinue = !flowMissing(draft,photos).includes(draft.index)
  function onAnswer(value: FlowAnswer) { setDraft(previous => ({ ...previous, assessorConfirmed:false, answers:{ ...previous.answers, [previous.index]:value } })) }
  function onNote(value: string) { setDraft(previous => ({ ...previous, assessorConfirmed:false, notes:{ ...previous.notes,[previous.index]:value } })) }
  function camera() { mediaTrigger.current = document.activeElement as HTMLElement; setMedia(true) }
  function restoreMedia(event: Event) { event.preventDefault(); mediaTrigger.current?.focus() }
  const attachment = attached && <div className="flow-gallery spatial-attachments"><div className="grid grid-cols-2 gap-3"><EvidenceAttachment file={{ name:'Preview illustration.svg',url:sampleImage,video:false }} onPreview={() => { mediaTrigger.current=document.activeElement as HTMLElement; setPreview(true) }} onRemove={() => setPhoto(previous=>({...previous,[draft.index]:false}))}/></div></div>
  const footer = <SpatialNavigation index={draft.index} canContinue={canContinue} sectionsRef={sectionsRef} onBack={() => setDraft(previous => ({ ...previous,index:Math.max(0,previous.index-1) }))} onSections={() => setSections(true)} onNext={() => { setDraft(previous => ({ ...previous,index:Math.min(10,previous.index+1) })); setNotice(draft.index===10?'Review requested in this isolated preview.':'Moved to the next criterion in this preview only.') }}/>
  const live = <><SpatialAssessmentHeader draft={draft} photos={photos} saveError={scenario === 'Save error'} onBack={() => setNotice('Header Back returns to Overview in the real flow.')}/><div className="assessment-screen screen"><SpatialLiveCard draft={draft} photos={photos} direction="next" titleRef={titleRef} onAnswer={onAnswer} onNote={onNote} onCamera={camera} galleryRef={setGalleryTarget}/>{galleryTarget&&createPortal(attachment,galleryTarget)}</div><footer className="phonebottom">{footer}</footer></>
  return <>
    <div className="ds-story-controls"><label htmlFor="rosa-scenario">Story state</label><Select value={scenario} onValueChange={value => { const next=value as ExplorerScenario;setScenario(next);setDraft(createExplorerDraft(next));setPhoto({});setEditing(false) }}><SelectTrigger id="rosa-scenario"><SelectValue/></SelectTrigger><SelectContent>{scenarioOptions.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Badge variant="outline">In-memory fixture</Badge></div>
    <div className="ds-rosa-layout"><div className="ds-device flow-app flow-v5" data-pattern={pattern}>
      <div className={`ds-pattern-canvas ${pattern === 'card' || editing ? 'ds-live-canvas' : ''}`}>
        {pattern === 'assignment' && <SpatialAssignmentCard status={draft.assessorConfirmed ? 'Local review' : assignmentStatus} onOpen={() => setNotice('View Assessment opens Overview in Rosa V5. This story stays isolated.')}/>}
        {pattern === 'people' && <SpatialPeopleCard status={assignmentStatus} onMember={() => setNotice('Dre Jackson · Crew Floor Member · preview context only.')}/>}
        {pattern === 'header' && <SpatialAssessmentHeader draft={draft} photos={photos} saveError={scenario === 'Save error'} onBack={() => setNotice('Overview Back selected. Footer Back instead moves one criterion.')}/>}
        {(pattern === 'card' || editing) && live}
        {pattern === 'choices' && <SpatialChoices value={draft.answers[draft.index] ?? ''} disabled={scenario === 'Disabled'} onChange={onAnswer}/>}
        {pattern === 'evidence' && <><SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={attached ? 1:0} pending={scenario === 'Required evidence' && !flowEvidenceOk(draft,draft.index,photos)} required={scenario === 'Required evidence'} onNote={onNote} onCamera={camera}/>{attachment}</>}
        {pattern === 'footer' && <><SpatialStatus>{canContinue ? 'Response and configured evidence complete.' : 'Next is disabled until the response and required evidence are recorded.'}</SpatialStatus><SpatialChoices value={draft.answers[draft.index] ?? ''} onChange={onAnswer}/>{scenario === 'Required evidence' && <SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={0} pending={!flowEvidenceOk(draft,draft.index,photos)} required onNote={onNote} onCamera={camera}/>}<footer className="phonebottom">{footer}</footer></>}
        {pattern === 'sections' && <Sheet open={sections} onOpenChange={setSections}><SheetTrigger asChild><Button variant="outline">Open Sections</Button></SheetTrigger><SheetContent side="bottom" className="flow-sheet mobile-sheet mx-auto"><SheetHeader><SheetTitle>All criteria</SheetTitle><SheetDescription>Preview-only jump. Existing observations in Rosa remain unchanged.</SheetDescription></SheetHeader><div className="overflow-y-auto px-5 pb-5"><SpatialSections draft={draft} photos={photos} onJump={index => { setDraft(previous => ({ ...previous,index }));setSections(false);setNotice(`Preview jumped to criterion ${index+1}.`) }}/></div></SheetContent></Sheet>}
        {pattern === 'progress' && <><SpatialProgress draft={draft} photos={photos}/><SpatialStatus>{flowMissing(draft,photos).length} criteria incomplete. A recorded Fail counts toward completion; a Pass without required evidence does not.</SpatialStatus></>}
        {pattern === 'review' && !editing && <><SpatialReviewSummary draft={draft} photos={photos}/><SpatialReviewList draft={draft} photos={photos} onEdit={index => { setDraft(previous => ({ ...previous,index }));setEditing(true) }}/></>}
        {pattern === 'signoff' && <><SpatialFeedbackCard draft={draft} onFeedback={feedback => setDraft(previous => ({ ...previous,feedback,assessorConfirmed:false }))}/><label className="ds-control-row"><Checkbox checked={manager} onCheckedChange={value => setManager(value === true)}/>Manager required in this preview configuration</label><SpatialApprovals confirmed={draft.assessorConfirmed} managerRequired={manager}/><Button disabled={flowMissing(draft,photos).length > 0} onClick={() => {setDraft(previous => ({ ...previous,assessorConfirmed:true }));setNotice('Preview local review confirmed. No real signature or submission.') }}>Confirm preview review</Button><SpatialStatus>No identity verification, server submission or certification. Choose Complete to enable this preview confirmation.</SpatialStatus></>}
        {pattern === 'system' && <><SpatialStatus>Local draft · stored on this device in the real flow.</SpatialStatus><SpatialStatus tone="warning">Offline · draft saved on this device only.</SpatialStatus><SpatialStatus tone="error">Unable to save on this device. Keep this page open.</SpatialStatus><SpatialStatus tone="warning">Comment or photo required before continuing.</SpatialStatus><SpatialStatus tone="success">Required observations recorded. This is not an overall pass.</SpatialStatus><div className="spatial-empty-state">No attachments yet.</div><div role="status" aria-label="Preparing assessment example"><Skeleton className="h-5 w-40"/><p>Preparing assessment… · loading example</p></div><SpatialStatus>Pending sync is an architectural boundary, not an implemented server state. No “synced” claim is shown.</SpatialStatus></>}
        {editing && <Button variant="outline" onClick={() => setEditing(false)}>Back to review preview</Button>}
      </div>
    </div></div>
    <p className="ds-preview-status" role="status">{notice}</p>
    {pattern !== 'sections' && <Sheet open={sections} onOpenChange={setSections}><SheetContent side="bottom" className="flow-sheet mobile-sheet mx-auto" onCloseAutoFocus={event => { event.preventDefault();sectionsRef.current?.focus() }}><SheetHeader><SheetTitle>All criteria</SheetTitle><SheetDescription>Changes affect this preview fixture only.</SheetDescription></SheetHeader><div className="overflow-y-auto px-5 pb-5"><SpatialSections draft={draft} photos={photos} onJump={index => { setDraft(previous => ({ ...previous,index }));setSections(false) }}/></div></SheetContent></Sheet>}
    <Dialog open={media} onOpenChange={setMedia}><DialogContent onCloseAutoFocus={restoreMedia}><DialogHeader><DialogTitle>Preview camera interaction</DialogTitle><DialogDescription>No camera, device library or upload is opened. Add a labelled illustration to explore the shared attachment UI safely.</DialogDescription></DialogHeader><Button onClick={() => {setPhoto(previous=>({...previous,[draft.index]:true}));setMedia(false);setNotice('Preview illustration attached in memory only.') }}>Add sample attachment</Button></DialogContent></Dialog>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent onCloseAutoFocus={restoreMedia}><DialogHeader><DialogTitle>Preview illustration</DialogTitle><DialogDescription>Sample attachment only. Real capture and uploads are not invoked.</DialogDescription></DialogHeader><img src={sampleImage} alt="Preview illustration"/></DialogContent></Dialog>
  </>
}
