import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { UserRound, MessageSquare, Clock3, ShieldCheck, Droplets, CookingPot, ClipboardCheck, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, Circle, List, Camera, X, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EvidencePanel, type EvidenceActions } from '@/components/assessment/evidence-panel'
import { VersionSwitcher } from '@/components/layout/version-switcher'
import { flowCriteria as criteria, flowScreens, flowStorageKey, emptyFlowDraft, normalizeFlowDraft, flowEvidenceOk, flowMissing, type FlowDraft, type FlowScreen, type FlowAnswer } from '@/data/flow-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'
import { applyTheme, creatorTheme, loadTheme } from '@/lib/theme'
import '@/styles/flow.css'

const screenNames: Record<FlowScreen, string> = { list: 'Assessments', overview: 'Overview', assessment: 'Live checklist', review: 'Review', signoff: 'Sign-off' }
const rationale: Record<FlowScreen, [string, string, string]> = {
  list: ['Assignment entry', 'The assessor sees the relevant assessment without searching a catalogue.', 'Only one assigned case is shown; other cases are not invented.'],
  overview: ['Quick context', 'Make Dre, station, preparation and critical/evidence rules visible before the observation.', 'No signature or forced admin step at the start.'],
  assessment: ['One criterion at a time', 'Optimise for thumb targets, low cognitive load and interruption resilience.', 'Photo and notes support observation. Video remains exploratory and opt-in.'],
  review: ['Completeness before submission', 'Show missing responses and evidence; never infer an outcome from an invented score.', 'Critical and weighted scoring remains a configuration dependency.'],
  signoff: ['Coaching and trust', 'Separate the observation from sign-off and final certification.', 'A shared-device confirmation is not automatically proof of identity.'],
}
const assessmentGoals = [
  { Icon: ShieldCheck, label: 'Prepare a clean, safe fryer station' },
  { Icon: Droplets, label: 'Check oil condition and fryer readiness' },
  { Icon: CookingPot, label: 'Cook and handle food safely' },
  { Icon: ClipboardCheck, label: 'Meet product quality and holding standards' },
] as const
const options = [
  { value: 'met', title: 'Pass', desc: 'Performed as expected', Icon: Check },
  { value: 'coaching', title: 'Needs coaching', desc: 'Further practice is needed', Icon: ArrowUpRight },
  { value: 'fail', title: 'Fail', desc: 'Did not meet the standard', Icon: X },
] as const


export default function AssessmentFlow() {
  const [draft, setDraft] = useState<FlowDraft>(() => { try { return normalizeFlowDraft(JSON.parse(localStorage.getItem(flowStorageKey) ?? 'null')) } catch { return emptyFlowDraft() } })
  const [saveError, setSaveError] = useState(false)
  const [photos, setPhotos] = useState<Record<number, number>>({})
  const [mediaVersion, setMediaVersion] = useState(0)
  const [galleryTarget, setGalleryTarget] = useState<HTMLDivElement | null>(null)
  const [sheet, setSheet] = useState<'sections' | 'finished' | 'reset' | 'member' | 'preview' | null>(null)
  const [previewSection, setPreviewSection] = useState<typeof criteria[number]['section']>('Preparation')
  const controllers = useRef<Record<number, EvidenceActions | null>>({})
  const screenRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const sectionsFocus = useRef<'question' | 'trigger' | null>(null)
  const sectionsButton = useRef<HTMLButtonElement>(null)
  const draftRef = useRef(draft)
  const missing = flowMissing(draft, photos)
  // A restored draft cannot retain eligibility based on media from a previous page session.
  const screen = draft.screen === 'signoff' && missing.length ? 'review' : draft.screen
  const c = criteria[draft.index]
  const recorded = Object.keys(draft.answers).length
  const met = Object.values(draft.answers).filter(answer => answer === 'met').length
  const coaching = Object.values(draft.answers).filter(answer => answer === 'coaching').length
  const failed = Object.values(draft.answers).filter(answer => answer === 'fail').length
  const followUp = coaching > 0 || failed > 0
  useMobileViewport()
  useMobileOverlay(sheet !== null, () => { setSheet(null); return true })
  useEffect(() => {
    const typography = loadTheme().typography
    const theme = { ...creatorTheme, typography: { ...typography, size: 16, body: 'inter' as const, heading: 'inter' as const, headingWeight: 740 } }
    document.documentElement.dataset.assessmentVersion = '2'
    applyTheme(theme, 'light')
    return () => { delete document.documentElement.dataset.assessmentVersion }
  }, [])

  useLayoutEffect(() => {
    screenRef.current?.scrollTo({ top: 0 })
    if (mounted.current) titleRef.current?.focus({ preventScroll: true })
    mounted.current = true
  }, [screen, draft.index])
  function replace(next: FlowDraft) {
    draftRef.current = next
    setDraft(next)
    try { localStorage.setItem(flowStorageKey, JSON.stringify(next)); setSaveError(false) } catch { setSaveError(true) }
  }
  function update(patch: Partial<FlowDraft>, observation = false) {
    replace({ ...draftRef.current, ...patch, ...(observation ? { assessorConfirmed: false } : {}) })
  }
  function go(next: FlowScreen) { update({ screen: next === 'signoff' && missing.length ? 'review' : next }); setSheet(null) }
  function start() { const next = criteria.findIndex((_, i) => !draft.answers[i]); update({ screen: 'assessment', index: next < 0 ? draft.index : next, paused: false }) }
  function edit(index: number) { update({ index, screen: 'assessment', paused: false }) }
  function jumpToSection(section: typeof c.section) {
    sectionsFocus.current = 'question'
    edit(criteria.findIndex(item => item.section === section))
    screenRef.current?.scrollTo({ top: 0 })
    setSheet(null)
  }
  function answer(value: FlowAnswer) { update({ answers: { ...draft.answers, [draft.index]: value } }, true) }
  function note(index: number, value: string) { update({ notes: { ...draftRef.current.notes, [index]: value } }, true) }
  function reset() { replace({ ...emptyFlowDraft(), index: 0 }); setPhotos({}); setMediaVersion(value => value + 1); setSheet(null) }
  function sample() { update({ answers: Object.fromEntries(criteria.map((_, i) => [i, i === 5 ? 'coaching' : 'met'])), notes: { ...draft.notes, 8: 'Product appeared consistent with the agreed standard. Review portion size at next practice session.' }, index: 4, screen: 'assessment', paused: false }, true); setSheet(null) }
  function title(heading: string, description?: string) { return <header className="flow-page-intro"><h1 ref={titleRef} tabIndex={-1} className="page-title">{heading}</h1>{description && <p className="page-sub">{description}</p>}</header> }
  function back() {
    if (screen === 'assessment') { update({ screen: 'overview', paused: recorded > 0 }); return }
    go(screen === 'signoff' ? 'review' : screen === 'review' ? 'assessment' : 'list')
  }
  const pageLabels: Record<FlowScreen, string> = { list: 'Assessments', overview: 'Assessment overview', assessment: 'Assessment', review: 'Assessment review', signoff: 'Feedback & sign-off' }

  const navigation = <nav className="flow-nav" aria-label="Screen flow">{flowScreens.map((id, i) => <button key={id} className={screen === id ? 'active' : ''} aria-current={screen === id ? 'step' : undefined} onClick={() => go(id)}><span className="number">0{i + 1}</span>{screenNames[id]}{id === 'signoff' && missing.length > 0 && <span className="sr-only"> (requires complete checklist)</span>}</button>)}</nav>
  const tools = <div className="stack"><Button variant="outline" className="action outline" onClick={sample}>Load sample observations <ArrowUpRight size={15}/></Button><Button variant="outline" className="action outline" onClick={() => setSheet('reset')}>Reset prototype</Button></div>
  return <div className="flow-app"><div className="workspace">
    <aside className="side"><div className="wordmark"><span className="brandmark"><ArrowUpRight size={17}/></span> Learning Pool <span>/ S2S</span></div><div className="eyebrow">EXERCISE 01 · ON THE FLOOR</div><h2 className="intro">Designing for<br/>the moment.</h2><p className="desc">Rosa’s practical assessment of Dre, during a busy shift. An interactive structure-first prototype before theming.</p><h2 className="railhead">Presentation controls</h2><VersionSwitcher current={2}/><h2 className="railhead">Screen flow</h2>{navigation}<div className="aside-card"><strong>Prototype boundaries</strong>Checklist rules are illustrative. No backend, identity verification or server sync is simulated as real.</div><h2 className="railhead">Testing shortcuts</h2>{tools}<a className="action outline spaced" href="?studio=1">Open Theme Studio</a></aside>
    <main className="stage"><div className="stage-label"><span>Rosa / Mobile-first assessment</span><button className={`toggle ${draft.offline ? 'offline' : ''}`} onClick={() => update({ offline: !draft.offline })}>{draft.offline ? <WifiOff size={14}/> : <Wifi size={14}/>} {draft.offline ? 'Offline demo' : 'Online demo'}</button></div>
      <div className="phone">
      {screen !== 'assessment' && <header className="overview-topbar">{screen !== 'list' ? <Button variant="ghost" size="icon" onClick={back} aria-label={screen === 'overview' ? 'Back to assessments' : screen === 'review' ? 'Back to checklist' : 'Back to review'}><ChevronLeft aria-hidden="true"/></Button> : <span/>}<p>{pageLabels[screen]}</p></header>}
      {screen === 'assessment' && <header className="assessment-header" aria-label="Assessment progress">
        <Button variant="ghost" size="icon" className="assessment-back" onClick={back} aria-label="Back to overview"><ChevronLeft aria-hidden="true"/></Button><div className="assessment-header-copy"><div className="assessment-header-top"><h1 ref={titleRef} tabIndex={-1} className="assessment-name">Fryer Station</h1><span className={`autosave-status ${draft.offline || saveError ? 'attention' : ''}`} role="status" aria-label={saveError ? 'Local save unavailable' : draft.offline ? 'Offline demo · local draft' : 'Saved on this device'}>{saveError ? 'Save unavailable' : draft.offline ? 'Offline · local draft' : 'Saved Automatically'}</span></div>
        <div className="assessment-header-progress"><span>{recorded} / {criteria.length} recorded</span><Progress className="flow-progress" value={recorded / criteria.length * 100} aria-label="Criteria recorded" aria-valuetext={`${recorded} of ${criteria.length} criteria recorded`}/><span>{Math.round(recorded / criteria.length * 100)}%</span></div>
      </div></header>}
      <section className={`screen ${screen === 'assessment' ? 'assessment-screen' : screen === 'overview' ? 'overview-screen' : ''}`} ref={screenRef} aria-label={screenNames[screen]}>
      {screen === 'list' && <div className="flow-page-content">
        {title('Your assessments', 'Observe, support and review your team’s practical skills.')}
        <Card className="overview-card">
          <CardHeader><CardTitle><h2>Ready to assess</h2></CardTitle></CardHeader>
          <CardContent>
            <div className="flow-card-heading"><h3>Fryer Station</h3><Badge variant="outline" className="overview-status">{draft.paused ? 'Saved draft' : recorded ? 'In progress' : 'Ready to Start'}</Badge></div>
            <p className="overview-category">Food Process &amp; Safety · Category 2</p>
            <div className="flow-person"><span className="overview-goal-icon"><UserRound aria-hidden="true"/></span><div><strong>Dre Jackson</strong><small>Crew Floor Member</small></div></div>
            <Separator className="my-4"/>
            <div className="flow-card-detail"><span>{criteria.length} criteria</span><span>Assessor · Rosa Thompson</span></div>
            <Button className="overview-start spaced" onClick={() => go('overview')}>View Assessment <ChevronRight aria-hidden="true"/></Button>
          </CardContent>
        </Card>
        {draft.paused && <p className="notice">Your observations are saved on this device. Resume when you’re ready.</p>}
        <Card className="overview-card"><CardContent className="flow-tip"><span className="overview-goal-icon"><Clock3 aria-hidden="true"/></span><div><h2>At your own pace</h2><p className="overview-description">Record observations as you go. You can leave the checklist and return to your saved draft.</p></div></CardContent></Card>
      </div>}
      {screen === 'overview' && <div className="overview-content">
        <header className="overview-intro">

          <div className="overview-heading"><h1 ref={titleRef} tabIndex={-1}>Fryer Station</h1><span>{criteria.length} criteria</span></div>
          <p className="overview-category">Food Process &amp; Safety <span aria-hidden="true">•</span> Category 2</p>
        </header>
        <Card className="overview-card">
          <CardContent className="overview-member-content">
            <Button variant="ghost" className="overview-member" onClick={() => setSheet('member')} aria-label="View team member Dre Jackson">
              <span className="overview-avatar" aria-hidden="true"/>
              <span className="overview-person-copy"><span>Dre Jackson</span><small>Crew Floor Member</small></span>
              <ChevronRight aria-hidden="true"/>
            </Button>
          </CardContent>
          <Separator/>
          <CardContent className="overview-metadata">
            <div><span>Assessment Status</span><Badge variant="outline" className="overview-status">{draft.paused ? 'Saved draft' : recorded ? 'In progress' : 'Ready to Start'}</Badge></div>
            <div><span>Qualified Assessor</span><strong>Rosa Thompson (me)</strong></div>
          </CardContent>
        </Card>
        <Card className="overview-card">
          <CardHeader><CardTitle><h2>Assessment description</h2></CardTitle></CardHeader>
          <CardContent><p className="overview-description">Observe Dre completing the fryer task from preparation to handoff. Check safe working practices, the cooking process and the finished product against the station standard.</p></CardContent>
        </Card>
        <Card className="overview-card">
          <CardHeader><CardTitle><h2>Goals</h2></CardTitle></CardHeader>
          <CardContent>
            <ul className="overview-goals">{assessmentGoals.map(({ Icon, label }) => <li key={label}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><span>{label}</span></li>)}</ul>
          </CardContent>
        </Card>
        <Card className="overview-card overview-sections">
          <CardHeader><CardTitle><h2>What you will observe</h2></CardTitle></CardHeader>
          <CardContent>
            {(['Preparation', 'Frying', 'Completion'] as const).map((section, i) => <div key={section}>
              {i > 0 && <Separator/>}
              <Button variant="ghost" className="overview-section" onClick={() => { setPreviewSection(section); setSheet('preview') }} aria-label={`Preview ${section}: ${criteria.filter(item => item.section === section).length} criteria`}>
                <span className="overview-section-number" aria-hidden="true">{i + 1}</span>
                <span className="overview-section-copy"><span>{section}</span><small>{criteria.filter(item => item.section === section).length} criteria</small></span>
                <ChevronRight aria-hidden="true"/>
              </Button>
            </div>)}
          </CardContent>
        </Card>
      </div>}
      {screen === 'assessment' && <div className="flow-page-content"><section className="live-question" aria-labelledby="live-question-title"><div className="row criterion-context"><div className="criterion-tags"><span className="pill">{c.section}</span>{'critical' in c && <span className="pill danger">◆ Critical</span>}</div><span className="subtext criterion-position">Criterion {draft.index + 1} / {criteria.length}</span></div><div className="chips">{'evidence' in c && <span className="pill warn">Evidence required</span>}</div><h2 id="live-question-title" className="criterion-title">{c.title}</h2><p className="criterion-desc">{c.desc}</p></section><section className="live-responses" aria-label="Observation result"><div className="choices" role="group" aria-label="Observation result">{options.map(({ value, title: label, desc, Icon }) => <Button variant="outline" key={value} className={`choice ${value} ${draft.answers[draft.index] === value ? 'selected' : ''}`} aria-pressed={draft.answers[draft.index] === value} onClick={() => answer(value)}><span className="choice-icon"><Icon size={17}/></span><span className="choice-copy"><b>{label}</b><small>{desc}</small></span>{draft.answers[draft.index] === value ? <Check size={17}/> : <Circle size={17}/>}</Button>)}</div></section>
        <Card className="overview-card evidencebox" aria-label="Observation evidence"><CardContent><div className="evidencehead"><h2>Observation evidence</h2><span className={`pill ${'evidence' in c ? 'warn' : ''}`}>{'evidence' in c ? 'Note or photo required' : 'Optional'}</span></div><Textarea id="flow-comment" aria-label="Comment" value={draft.notes[draft.index] ?? ''} onChange={event => note(draft.index, event.target.value)} placeholder="Describe the observed action…" aria-describedby="flow-comment-help"/><p id="flow-comment-help" className="subtext">{saveError ? 'Unable to save. Keep this page open.' : 'Saved as you type on this device.'}</p><Button variant="outline" className="action outline spaced" onClick={() => controllers.current[draft.index]?.openMedia()}><Camera size={16}/> Add photo / video*</Button><div className="flow-gallery" ref={setGalleryTarget}/></CardContent></Card><p className="subtext spaced">* Video is a design hypothesis. Photos/videos stay on this page; they clear on reload or when switching versions.</p>{!flowEvidenceOk(draft, draft.index, photos) && <div className="notice warn">This criterion needs a note or photo before sign-off. A video alone does not meet this rule.</div>}</div>}
      {screen === 'review' && <div className="flow-page-content">
        {title('Review observations', 'Fryer Station · Dre Jackson')}
        <Card className="overview-card"><CardHeader><CardTitle><h2>Assessment summary</h2></CardTitle></CardHeader><CardContent><div className="review-stats">{[{ count: met, label: 'Pass', Icon: Check }, { count: failed, label: 'Fail', Icon: X }, { count: coaching, label: 'Needs coaching', Icon: MessageSquare }, { count: missing.length, label: 'Incomplete', Icon: ClipboardCheck }].map(({ count, label, Icon }) => <div className="review-stat" key={label}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><b>{count}</b><small>{label}</small></div>)}</div></CardContent></Card>
        <p role="status" className={`notice ${missing.length ? 'warn' : ''}`}>{missing.length ? `${missing.length} criteria need attention. Record each result and add required evidence before sign-off.` : 'All required observations and evidence are recorded. Review the results with Dre.'}</p>
        <Card className="overview-card overview-sections"><CardHeader><CardTitle><h2>Checklist summary</h2></CardTitle></CardHeader><CardContent>
          {(['Preparation', 'Frying', 'Completion'] as const).map((section, sectionIndex) => <section className="review-section" key={section} aria-labelledby={`review-section-${sectionIndex}`}><h3 id={`review-section-${sectionIndex}`}><span className="overview-section-number">{sectionIndex + 1}</span>{section}</h3>{criteria.map((item, i) => item.section === section && <Button key={item.title} variant="ghost" className="review-item" onClick={() => edit(i)} aria-label={`Edit: ${item.title}`}><span className={`dot ${draft.answers[i] ?? ''}`} aria-hidden="true"/><span><strong>{item.title}{'critical' in item && <span className="critical-mark" title="Critical"> ◆</span>}</strong><small>{!draft.answers[i] ? 'Not recorded' : !flowEvidenceOk(draft, i, photos) ? 'Evidence required' : draft.answers[i] === 'notObserved' ? 'Response needed' : options.find(option => option.value === draft.answers[i])?.title}</small></span><ChevronRight aria-hidden="true"/></Button>)}</section>)}
        </CardContent></Card>
      </div>}
      {screen === 'signoff' && <div className="flow-page-content">
        {title('Feedback & sign-off', 'Fryer Station · Dre Jackson')}
        <Card className="overview-card"><CardHeader><CardTitle><h2>{followUp ? 'Next steps for Dre' : 'What went well'}</h2></CardTitle></CardHeader><CardContent>
          <Badge variant="outline" className={`pill ${followUp ? 'warn' : 'good'}`}>{failed ? 'Feedback needed' : coaching ? 'Further coaching indicated' : 'Observations complete'}</Badge>
          <p className="overview-description spaced">{followUp ? 'Discuss the steps that need more practice and agree on the next opportunity to demonstrate them.' : 'Share the strengths you observed and discuss the results together.'}</p>
          <label className="fieldlabel" htmlFor="flow-feedback">Coaching / feedback note</label><Textarea id="flow-feedback" value={draft.feedback} onChange={event => update({ feedback: event.target.value }, true)} placeholder="What went well? What should Dre practise next?"/>
        </CardContent></Card>
        <Card className="overview-card overview-sections"><CardHeader><CardTitle><h2>Required approvals</h2></CardTitle></CardHeader><CardContent>{[
          { name: 'Rosa Thompson', role: 'Qualified assessor', description: 'Identity and role require verification.', confirmed: draft.assessorConfirmed, Icon: ClipboardCheck },
          { name: 'Dre Jackson', role: 'Team member', description: 'Confirmation depends on configured requirements.', confirmed: false, Icon: UserRound },
          { name: 'Manager', role: 'Countersign', description: 'Required only when specified by assessment rules.', confirmed: false, Icon: ShieldCheck },
        ].map(({ name, role, description, confirmed, Icon }) => <div className="approval-row" key={name}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><div><strong>{name}</strong><small>{role}</small><p>{description}</p></div><Badge variant="outline" className={confirmed ? 'pill good' : ''}>{confirmed ? 'Recorded · demo' : 'Pending'}</Badge></div>)}</CardContent></Card>
        <p className={`notice ${draft.offline ? 'warn' : ''}`}>{draft.offline ? 'Offline demo: saved on this device. No sync or certification occurs.' : 'Demo sign-off only. Certification requires verified approvals and a server audit record.'}</p>
      </div>}
      {saveError && <p role="alert" className="notice warn">Local save unavailable. Keep this page open to retain your work.</p>}
      </section>
      <footer className={`phonebottom ${screen === 'overview' ? 'overview-footer' : ''}`}>
        {screen === 'list' && <p className="subtext center">Your assigned assessments are shown above</p>}
        {screen === 'overview' && <Button className="overview-start" size="lg" onClick={start}>{draft.paused || recorded ? 'Resume Assessment' : 'Start Assessment'}</Button>}
        {screen === 'assessment' && <nav className="criterion-navigation" aria-label="Criterion navigation">
          <Button variant="outline" className="action outline" disabled={draft.index === 0} onClick={() => update({ index: draft.index - 1 })}><ArrowLeft size={16}/> Back</Button>
          <Button variant="outline" ref={sectionsButton} className="action outline" aria-haspopup="dialog" onClick={() => { sectionsFocus.current = 'trigger'; setSheet('sections') }}><List size={16}/> Sections</Button>
          <Button variant="default" className="action" onClick={() => draft.index === criteria.length - 1 ? go('review') : update({ index: draft.index + 1 })}>Next <ArrowRight size={16}/></Button>
        </nav>}
        {screen === 'review' && <><Button variant="default" className="action" disabled={missing.length > 0} onClick={() => go('signoff')}>Continue to feedback & sign-off <ArrowRight size={16}/></Button>{missing.length > 0 && <p className="subtext center spaced">Complete {missing.length} item(s) before sign-off</p>}</>}
        {screen === 'signoff' && <><Button variant="default" className="action" disabled={missing.length > 0} onClick={() => { if (missing.length) return; update({ assessorConfirmed: true }); setSheet('finished') }}>{draft.assessorConfirmed ? 'View pending status' : 'Confirm assessor review'} <ArrowRight size={16}/></Button><Button variant="ghost" className="action textbtn" onClick={() => go('review')}><ArrowLeft size={15}/> Back to review</Button></>}
      </footer></div><p className="floating">Working UX prototype · V2 / Assessment flow</p>
    </main><aside className="right"><div className="eyebrow">DESIGN RATIONALE</div><h2>{rationale[screen][0]}</h2><div className="annotation"><b>Design intent</b><p>{rationale[screen][1]}</p></div><div className="annotation"><b>Trade-off / validation</b><p>{rationale[screen][2]}</p></div><div className="hint"><b>What we can evaluate</b><p>Tap targets, scanning, criteria clarity, mandatory evidence, save/resume and feedback.</p><b>What remains open</b><p>Scoring thresholds, exact critical items, video permission, sign-off identity checks and offline sync architecture.</p></div></aside>
  </div>
  <div hidden>{criteria.map((item, i) => <EvidencePanel key={`${i}-${mediaVersion}`} note={draft.notes[i] ?? ''} onNoteChange={value => note(i, value)} onPhotoCountChange={count => { setPhotos(previous => ({ ...previous, [i]: count })); update({ assessorConfirmed: false }) }} controllerRef={api => { controllers.current[i] = api }} context={item.title} persistentNote compact externalGallery galleryTarget={screen === 'assessment' && draft.index === i ? galleryTarget : null}/>)}</div>
  <Sheet open={sheet !== null} onOpenChange={open => { if (!open) setSheet(null) }}><SheetContent side="bottom" className="mobile-sheet flow-sheet mx-auto max-w-lg rounded-t-3xl" onCloseAutoFocus={event => { if (sectionsFocus.current) { event.preventDefault(); const target = sectionsFocus.current === 'question' || !sectionsButton.current?.isConnected ? titleRef.current : sectionsButton.current; sectionsFocus.current = null; target?.focus({ preventScroll: true }) } }}><SheetHeader><SheetTitle>{sheet === 'sections' ? 'Jump to section' : sheet === 'reset' ? 'Reset V2 prototype?' : sheet === 'member' ? 'Team Member' : sheet === 'preview' ? previewSection : 'Assessor review recorded · demo'}</SheetTitle><SheetDescription>{sheet === 'sections' ? 'Jump to the first question in any section. Your responses and comments are saved automatically.' : sheet === 'reset' ? 'Clear V2 responses, comments, feedback and attachments. Your V1 draft will be retained.' : sheet === 'member' ? 'Dre Jackson · Crew Floor Member' : sheet === 'preview' ? 'Review what you will observe before starting the assessment.' : 'This is a visual prototype. No real approval or certification has been issued.'}</SheetDescription></SheetHeader><div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-5">

    {sheet === 'member' && <div className="space-y-3"><p>Dre is a new starter and completed e-learning yesterday.</p><p className="text-muted-foreground">Assigned assessment: Fryer Station</p><Button className="w-full" onClick={() => setSheet(null)}>Back to overview</Button></div>}
    {sheet === 'preview' && <div className="space-y-4"><ol className="list-decimal space-y-3 pl-5">{criteria.filter(item => item.section === previewSection).map(item => <li key={item.title}><strong>{item.title}</strong><p className="text-sm text-muted-foreground">{item.desc}</p></li>)}</ol><Button variant="outline" className="w-full" onClick={() => setSheet(null)}>Back to overview</Button></div>}
    {sheet === 'sections' && <><nav className="section-picker" aria-label="Assessment sections">{(['Preparation', 'Frying', 'Completion'] as const).map((section, index) => {
      const items = criteria.map((item, i) => ({ ...item, index: i })).filter(item => item.section === section)
      const count = items.filter(item => draft.answers[item.index]).length
      return <button key={section} className={`section-option ${c.section === section ? 'current' : ''}`} aria-current={c.section === section ? 'location' : undefined} onClick={() => jumpToSection(section)}><span className="section-number">{index + 1}</span><span className="section-copy"><strong>{section}</strong><small>{count} of {items.length} recorded{c.section === section ? ' · Current section' : ''}</small></span><ArrowRight size={17}/></button>
    })}</nav><Button variant="secondary" className="action secondary" onClick={() => go('review')}>Review all <ArrowRight size={16}/></Button></>}
    {sheet === 'finished' && <><p className="notice warn">{draft.offline ? 'Saved on device only · no sync' : 'Pending other configured signatures / approval'}<br/><b>Not certified yet</b></p><p className="page-sub">Dre should receive clear feedback and a reassessment path if required.</p><Button variant="default" className="action" onClick={() => go('list')}>Done for now</Button></>}
    {sheet === 'reset' && <><Button variant="default" className="action" onClick={reset}>Reset V2</Button><Button variant="outline" className="action outline" onClick={() => setSheet(null)}>Cancel</Button></>}
  </div></SheetContent></Sheet>
  </div>
}
