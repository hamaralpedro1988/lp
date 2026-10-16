import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Circle, List, Camera, X, Wifi, WifiOff } from 'lucide-react'
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
const options = [
  { value: 'met', title: 'Pass', desc: 'Performed as expected', Icon: Check },
  { value: 'coaching', title: 'Needs coaching', desc: 'Further practice is needed', Icon: ArrowUpRight },
  { value: 'fail', title: 'Fail', desc: 'Did not meet the standard', Icon: X },
] as const
function Person() { return <div className="person"><div className="avatar">DR</div><div><b>Dre</b><small>New starter · e-learning completed yesterday</small></div></div> }

export default function AssessmentFlow() {
  const [draft, setDraft] = useState<FlowDraft>(() => { try { return normalizeFlowDraft(JSON.parse(localStorage.getItem(flowStorageKey) ?? 'null')) } catch { return emptyFlowDraft() } })
  const [saveError, setSaveError] = useState(false)
  const [photos, setPhotos] = useState<Record<number, number>>({})
  const [mediaVersion, setMediaVersion] = useState(0)
  const [galleryTarget, setGalleryTarget] = useState<HTMLDivElement | null>(null)
  const [sheet, setSheet] = useState<'sections' | 'finished' | 'reset' | null>(null)
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
    const theme = { ...creatorTheme, typography: { ...loadTheme().typography, body: 'inter' as const, heading: 'inter' as const, headingWeight: 740 } }
    const preference = matchMedia('(prefers-color-scheme: dark)')
    const requested = new URLSearchParams(location.search).get('mode')
    function syncMode() {
      const mode = requested === 'light' || requested === 'dark' ? requested : preference.matches ? 'dark' : 'light'
      applyTheme(theme, mode)
    }
    syncMode()
    preference.addEventListener('change', syncMode)
    return () => preference.removeEventListener('change', syncMode)
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
  function title(eyebrow: string, heading: string, description?: string) { return <><div className="page-eyebrow">{eyebrow}</div><h1 ref={titleRef} tabIndex={-1} className="page-title">{heading}</h1>{description && <p className="page-sub">{description}</p>}</> }
  const navigation = <nav className="flow-nav" aria-label="Screen flow">{flowScreens.map((id, i) => <button key={id} className={screen === id ? 'active' : ''} aria-current={screen === id ? 'step' : undefined} onClick={() => go(id)}><span className="number">0{i + 1}</span>{screenNames[id]}{id === 'signoff' && missing.length > 0 && <span className="sr-only"> (requires complete checklist)</span>}</button>)}</nav>
  const tools = <div className="stack"><button className="action outline" onClick={sample}>Load sample observations <ArrowUpRight size={15}/></button><button className="action outline" onClick={() => setSheet('reset')}>Reset prototype</button></div>
  return <div className="flow-app"><div className="workspace">
    <aside className="side"><div className="wordmark"><span className="brandmark"><ArrowUpRight size={17}/></span> Learning Pool <span>/ S2S</span></div><div className="eyebrow">EXERCISE 01 · ON THE FLOOR</div><h2 className="intro">Designing for<br/>the moment.</h2><p className="desc">Rosa’s practical assessment of Dre, during a busy shift. An interactive structure-first prototype before theming.</p><h2 className="railhead">Presentation controls</h2><VersionSwitcher current={2}/><h2 className="railhead">Screen flow</h2>{navigation}<div className="aside-card"><strong>Prototype boundaries</strong>Checklist rules are illustrative. No backend, identity verification or server sync is simulated as real.</div><h2 className="railhead">Testing shortcuts</h2>{tools}<a className="action outline spaced" href="?studio=1">Open Theme Studio</a></aside>
    <main className="stage"><div className="stage-label"><span>Rosa / Mobile-first assessment</span><button className={`toggle ${draft.offline ? 'offline' : ''}`} onClick={() => update({ offline: !draft.offline })}>{draft.offline ? <WifiOff size={14}/> : <Wifi size={14}/>} {draft.offline ? 'Offline demo' : 'Online demo'}</button></div>
      <div className="phone">
      {screen === 'assessment' && <header className="assessment-header" aria-label="Assessment progress">
        <div className="assessment-header-top"><h1 ref={titleRef} tabIndex={-1} className="assessment-name">Fryer station</h1><span className={`autosave-status ${draft.offline || saveError ? 'attention' : ''}`} role="status" aria-label={saveError ? 'Local save unavailable' : draft.offline ? 'Offline demo · local draft' : 'Saved on this device'}>{!saveError && !draft.offline && <Check size={13} aria-hidden="true"/>}{saveError ? 'Save unavailable' : draft.offline ? 'Offline · local draft' : 'Saved'}</span></div>
        <div className="assessment-header-progress"><span>{recorded} / {criteria.length} recorded</span><Progress className="flow-progress" value={recorded / criteria.length * 100} aria-label="Criteria recorded" aria-valuetext={`${recorded} of ${criteria.length} criteria recorded`}/><span>{Math.round(recorded / criteria.length * 100)}%</span></div>
      </header>}
      <section className={`screen ${screen === 'assessment' ? 'assessment-screen' : ''}`} ref={screenRef} aria-label={screenNames[screen]}>
      {screen === 'list' && <>{title('SHIFT ASSESSMENTS', 'Good afternoon, Rosa.', 'Your assigned on-the-floor assessments.')}<h2 className="section-label">Ready to assess <span className="pill">1 assigned</span></h2><div className="panel"><div className="row"><span className="pill warn">● Ready</span><span className="subtext">Fryer station</span></div><div className="person-wrap"><Person/></div><div className="hairline"/><div className="row"><span className="subtext">Practical skills assessment</span><b className="subtext">11 criteria</b></div><button className="action spaced" onClick={() => go('overview')}>View assessment <ArrowRight size={16}/></button></div>{draft.paused && <div className="notice warn">Your last observation session was saved. You can resume when ready.</div>}<h2 className="section-label">During this shift</h2><div className="panel soft"><b>Work on the floor, not at a desk</b><p className="page-sub spaced">Assess while observing, and save your progress whenever you’re interrupted.</p></div></>}
      {screen === 'overview' && <>{title('ASSESSMENT OVERVIEW', 'Fryer station', 'Show to Standard · Practical assessment')}<div className="panel"><Person/><div className="hairline"/><div className="row"><span className="subtext">Qualified assessor</span><b>Rosa</b></div><div className="row spaced"><span className="subtext">Status</span><span className={`pill ${draft.paused ? 'warn' : ''}`}>{draft.paused ? 'Saved draft' : recorded ? 'In progress' : 'Ready to start'}</span></div></div><h2 className="section-label">What you’ll observe</h2><div className="panel segments">{['Preparation', 'Frying', 'Completion'].map((section, i) => <div className="segment" key={section}><span className="tiny-icon">{i + 1}</span><div><b>{section}</b><small>{criteria.filter(item => item.section === section).length} criteria</small></div></div>)}</div><div className="notice">Critical items, example weights and evidence rules are illustrated here. Actual scoring and requirements need customer validation.</div><h2 className="section-label">Before you begin</h2><p className="page-sub">Agree with Dre that you’re ready to start. Observe him carrying out the task, then record each criterion as you go.</p></>}
      {screen === 'assessment' && <><div className="row criterion-context"><div className="criterion-tags"><span className="pill">{c.section}</span>{'critical' in c && <span className="pill danger">◆ Critical</span>}</div><span className="subtext criterion-position">Criterion {draft.index + 1} / {criteria.length}</span></div><div className="chips">{'evidence' in c && <span className="pill warn">Evidence required</span>}</div><h2 className="criterion-title">{c.title}</h2><p className="criterion-desc">{c.desc}</p><h3 className="section-label">What did you observe?</h3><div className="choices" role="group" aria-label="Observation result">{options.map(({ value, title: label, desc, Icon }) => <button key={value} className={`choice ${value} ${draft.answers[draft.index] === value ? 'selected' : ''}`} aria-pressed={draft.answers[draft.index] === value} onClick={() => answer(value)}><span className="choice-icon"><Icon size={17}/></span><span className="choice-copy"><b>{label}</b><small>{desc}</small></span>{draft.answers[draft.index] === value ? <Check size={17}/> : <Circle size={17}/>}</button>)}</div>
        <section className="evidencebox" aria-label="Observation evidence"><div className="evidencehead"><b>Observation evidence</b><span className={`pill ${'evidence' in c ? 'warn' : ''}`}>{'evidence' in c ? 'Note or photo required' : 'Optional'}</span></div><label className="fieldlabel" htmlFor="flow-comment">Comment</label><Textarea id="flow-comment" value={draft.notes[draft.index] ?? ''} onChange={event => note(draft.index, event.target.value)} placeholder="Describe the observed action…" aria-describedby="flow-comment-help"/><p id="flow-comment-help" className="subtext">{saveError ? 'Unable to save. Keep this page open.' : 'Saved as you type on this device.'}</p><button className="action outline spaced" onClick={() => controllers.current[draft.index]?.openMedia()}><Camera size={16}/> Add photo / video*</button><div className="flow-gallery" ref={setGalleryTarget}/></section><p className="subtext spaced">* Video is a design hypothesis. Photos/videos stay on this page; they clear on reload or when switching versions.</p>{!flowEvidenceOk(draft, draft.index, photos) && <div className="notice warn">This criterion needs a note or photo before sign-off. A video alone does not meet this rule.</div>}</>}
      {screen === 'review' && <>{title('REVIEW OBSERVATIONS', 'Review before sign-off', 'Fryer station · Dre · Assessed by Rosa')}<div className="review-stats">{[[met, 'Pass'], [failed, 'Fail'], [coaching, 'Needs coaching'], [missing.length, 'Incomplete']].map(([count, label]) => <div className="review-stat" key={label}><b>{count}</b><small>{label}</small></div>)}</div><div className={`notice ${missing.length ? 'warn' : ''}`}>{missing.length ? `${missing.length} criteria need attention. Record a result for each criterion and add required evidence before sign-off.` : 'All required observations and evidence are recorded. Review the outcome with Dre.'}</div><h2 className="section-label">Checklist summary</h2><div className="panel summary">{criteria.map((item, i) => <div className="listline" key={item.title}><span className={`dot ${draft.answers[i] ?? ''}`} aria-hidden="true"/><span>{item.title}{'critical' in item && <span className="critical-mark" title="Critical"> ◆</span>}<small>{!draft.answers[i] ? 'Not recorded' : !flowEvidenceOk(draft, i, photos) ? 'Evidence required' : draft.answers[i] === 'notObserved' ? 'Response needed (previously not observed)' : options.find(option => option.value === draft.answers[i])?.title}</small></span><button aria-label={`Edit: ${item.title}`} onClick={() => edit(i)}>Edit</button></div>)}</div><p className="subtext spaced">Critical criteria and weighting are configured upstream. This prototype does not invent a pass threshold.</p></>}
      {screen === 'signoff' && <>{title('FEEDBACK & SIGN-OFF', 'Close the loop with Dre', 'Share the observed result and agree on next steps before any certification decision.')}<div className="panel"><span className={`pill ${followUp ? 'warn' : 'good'}`}>{failed ? 'Feedback needed' : coaching ? 'Further coaching indicated' : 'Observations complete'}</span><h2 className="feedback-title">{followUp ? 'What Dre can work on' : 'What went well'}</h2><p className="page-sub">{followUp ? 'Explain which steps need more practice, and agree on the next opportunity to demonstrate them.' : 'Discuss observed strengths. Certification still depends on required sign-offs and sync.'}</p><label className="fieldlabel" htmlFor="flow-feedback">Coaching / feedback note</label><Textarea id="flow-feedback" value={draft.feedback} onChange={event => update({ feedback: event.target.value }, true)} placeholder="What went well? What should Dre practise next?"/></div><h2 className="section-label">Required approvals</h2><div className="panel segments">{[['Assessor · Rosa', 'Identity and role must be verified in production', draft.assessorConfirmed ? 'Recorded · demo' : 'Pending'], ['Employee · Dre', 'Confirmation may be required; identity check needed', 'Pending'], ['Manager', 'Countersign, if required by configured rules', 'Pending']].map(([name, desc, status]) => <div className="segment" key={name}><span className="tiny-icon"><Check size={14}/></span><div className="approval-copy"><b>{name}</b><small>{desc}</small></div><span className={`pill ${status === 'Recorded · demo' ? 'good' : ''}`}>{status}</span></div>)}</div><div className={`notice ${draft.offline ? 'warn' : ''}`}>{draft.offline ? 'Offline demo: saved locally only. No sync or certification occurs.' : 'Demo sign-off only. Production requires verified authorization and a server audit record.'}</div></>}
      {saveError && <p role="alert" className="notice warn">Local save unavailable. Keep this page open to retain your work.</p>}
      </section>
      <footer className="phonebottom">
        {screen === 'list' && <p className="subtext center">Your assigned assessments are shown above</p>}
        {screen === 'overview' && <button className="action" onClick={start}>{draft.paused ? 'Resume observation' : 'Start live assessment'} <ArrowRight size={16}/></button>}
        {screen === 'assessment' && <nav className="criterion-navigation" aria-label="Criterion navigation">
          <button className="action outline" disabled={draft.index === 0} onClick={() => update({ index: draft.index - 1 })}><ArrowLeft size={16}/> Back</button>
          <button ref={sectionsButton} className="action outline" aria-haspopup="dialog" onClick={() => { sectionsFocus.current = 'trigger'; setSheet('sections') }}><List size={16}/> Sections</button>
          <button className="action" onClick={() => draft.index === criteria.length - 1 ? go('review') : update({ index: draft.index + 1 })}>Next <ArrowRight size={16}/></button>
        </nav>}
        {screen === 'review' && <><button className="action" disabled={missing.length > 0} onClick={() => go('signoff')}>Continue to feedback & sign-off <ArrowRight size={16}/></button>{missing.length > 0 && <p className="subtext center spaced">Complete {missing.length} item(s) before sign-off</p>}</>}
        {screen === 'signoff' && <><button className="action" disabled={missing.length > 0} onClick={() => { if (missing.length) return; update({ assessorConfirmed: true }); setSheet('finished') }}>{draft.assessorConfirmed ? 'View pending status' : 'Confirm assessor review'} <ArrowRight size={16}/></button><button className="action textbtn" onClick={() => go('review')}><ArrowLeft size={15}/> Back to review</button></>}
      </footer></div><p className="floating">Working UX prototype · V2 / Flow v0.1 · no final theme</p>
    </main><aside className="right"><div className="eyebrow">DESIGN RATIONALE</div><h2>{rationale[screen][0]}</h2><div className="annotation"><b>Design intent</b><p>{rationale[screen][1]}</p></div><div className="annotation"><b>Trade-off / validation</b><p>{rationale[screen][2]}</p></div><div className="hint"><b>What we can evaluate</b><p>Tap targets, scanning, criteria clarity, mandatory evidence, save/resume and feedback.</p><b>What remains open</b><p>Scoring thresholds, exact critical items, video permission, sign-off identity checks and offline sync architecture.</p></div></aside>
  </div>
  <div hidden>{criteria.map((item, i) => <EvidencePanel key={`${i}-${mediaVersion}`} note={draft.notes[i] ?? ''} onNoteChange={value => note(i, value)} onPhotoCountChange={count => { setPhotos(previous => ({ ...previous, [i]: count })); update({ assessorConfirmed: false }) }} controllerRef={api => { controllers.current[i] = api }} context={item.title} persistentNote compact externalGallery galleryTarget={screen === 'assessment' && draft.index === i ? galleryTarget : null}/>)}</div>
  <Sheet open={sheet !== null} onOpenChange={open => { if (!open) setSheet(null) }}><SheetContent side="bottom" className="mobile-sheet flow-sheet mx-auto max-w-lg rounded-t-3xl" onCloseAutoFocus={event => { if (sectionsFocus.current) { event.preventDefault(); const target = sectionsFocus.current === 'question' || !sectionsButton.current?.isConnected ? titleRef.current : sectionsButton.current; sectionsFocus.current = null; target?.focus({ preventScroll: true }) } }}><SheetHeader><SheetTitle>{sheet === 'sections' ? 'Jump to section' : sheet === 'reset' ? 'Reset V2 prototype?' : 'Assessor review recorded · demo'}</SheetTitle><SheetDescription>{sheet === 'sections' ? 'Jump to the first question in any section. Your responses and comments are saved automatically.' : sheet === 'reset' ? 'Clear V2 responses, comments, feedback and attachments. Your V1 draft will be retained.' : 'This is a visual prototype. No real approval or certification has been issued.'}</SheetDescription></SheetHeader><div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-5">

    {sheet === 'sections' && <><nav className="section-picker" aria-label="Assessment sections">{(['Preparation', 'Frying', 'Completion'] as const).map((section, index) => {
      const items = criteria.map((item, i) => ({ ...item, index: i })).filter(item => item.section === section)
      const count = items.filter(item => draft.answers[item.index]).length
      return <button key={section} className={`section-option ${c.section === section ? 'current' : ''}`} aria-current={c.section === section ? 'location' : undefined} onClick={() => jumpToSection(section)}><span className="section-number">{index + 1}</span><span className="section-copy"><strong>{section}</strong><small>{count} of {items.length} recorded{c.section === section ? ' · Current section' : ''}</small></span><ArrowRight size={17}/></button>
    })}</nav><button className="action secondary" onClick={() => go('review')}>Review all <ArrowRight size={16}/></button></>}
    {sheet === 'finished' && <><p className="notice warn">{draft.offline ? 'Saved on device only · no sync' : 'Pending other configured signatures / approval'}<br/><b>Not certified yet</b></p><p className="page-sub">Dre should receive clear feedback and a reassessment path if required.</p><button className="action" onClick={() => go('list')}>Done for now</button></>}
    {sheet === 'reset' && <><button className="action" onClick={reset}>Reset V2</button><button className="action outline" onClick={() => setSheet(null)}>Cancel</button></>}
  </div></SheetContent></Sheet>
  </div>
}
