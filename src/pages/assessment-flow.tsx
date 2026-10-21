import { spatialActiveIndex, spatialSelectChecklistTask, spatialNextPosition, spatialChecklistDescription } from '@/data/spatial-checklist'
import { clearEvidence } from '@/lib/evidence-storage'
import { SpatialProgress as OverviewProgress } from '@/components/assessment/spatial-primitives'
import { spatialLifecycle } from '@/data/spatial-lifecycle'
import { spatialAssessmentPolicy } from '@/data/spatial-overview'
import { updateSpatialObservation } from '@/data/spatial-flow'
import { useVisualTheme } from '@/hooks/use-visual-theme'
import { VisualThemeSwitcher } from '@/components/design-system/visual-theme-switcher'
import { SpatialAssessmentPreview } from '@/components/assessment/spatial-assessment-preview'
import { SpatialBeforeStart } from '@/components/assessment/spatial-before-start'
import { SpatialSubmission } from '@/components/assessment/spatial-submission'
import { spatialPreviewPages, spatialPreviewDraft, type SpatialPreviewPage } from '@/data/spatial-preview'
import { SpatialSlideComplete } from '@/components/assessment/spatial-slide-complete'
import { SpatialNotification } from '@/components/assessment/spatial-notification'
import { completeSpatialAssessment } from '@/data/spatial-flow'
import { spatialOverviewLearning } from '@/data/spatial-overview'
import { useSpatialBrand } from '@/hooks/use-spatial-brand'
import { SpatialBrandStyles, SpatialBrandSwitcher } from '@/components/design-system/brand-switcher'
import { OverlayContainerContext } from '@/lib/overlay-container'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { FileText, UserRound, MessageSquare, Clock3, LayoutGrid, CirclePlus, ShieldCheck, Droplets, CookingPot, ClipboardCheck, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, List, Camera, X, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EvidencePanel, type EvidenceActions } from '@/components/assessment/evidence-panel'
import { VersionSwitcher } from '@/components/layout/version-switcher'
import { flowCriteria as criteria, flowScreens, flowStorageKey, emptyFlowDraft, normalizeFlowDraft, flowEvidenceOk, flowMissing, type FlowDraft, type FlowScreen, type FlowAnswer } from '@/data/flow-draft'
import { useMobileOverlay, useMobileViewport } from '@/hooks/use-mobile-overlay'
import { spatialNavigationBlock, spatialEvidenceOk, spatialMissing, spatialTheme, spatialStorageKey, emptySpatialDraft, normalizeSpatialDraft } from '@/data/spatial-flow'
import { SpatialAssignmentCard, SpatialPeopleCard, SpatialStationHeading, SpatialTaskStats, SpatialReviewSummary, SpatialReviewNextSteps, SpatialReviewList } from '@/components/assessment/spatial-journey'
import { SpatialSystemChrome, SpatialFlowHeader, SpatialAssessmentHeader, SpatialLiveCard, SpatialActionButton, SpatialSurface, SpatialNavigation, SpatialSections } from '@/components/assessment/spatial-primitives'
import { applyTheme, creatorTheme, loadTheme } from '@/lib/theme'
import '@/styles/flow.css'
import '@/styles/spatial-theme.css'
import '@/styles/fluid-theme.css'

const screenNames: Record<FlowScreen, string> = { list: 'Assessments', overview: 'Overview', assessment: 'Live checklist', review: 'Review', signoff: 'Sign-off' }
const rationale: Record<FlowScreen, [string, string, string]> = {
  list: ['Assignment entry', 'The assessor sees the relevant assessment without searching a catalogue.', 'Only one assigned case is shown; other cases are not invented.'],
  overview: ['Quick context', 'Make Dre, station, preparation and critical/evidence rules visible before the observation.', 'No signature or forced admin step at the start.'],
  assessment: ['One task at a time', 'Optimise for thumb targets, low cognitive load and interruption resilience.', 'Photo and notes support observation. Video remains exploratory and opt-in.'],
  review: ['Completeness before submission', 'Show missing responses and evidence; never infer an outcome from an invented score.', 'Critical and weighted scoring remains a configuration dependency.'],
  signoff: ['Coaching and trust', 'Separate the observation from sign-off and final certification.', 'A shared-device confirmation is not automatically proof of identity.'],
}
function EvidenceRequiredTag() {
  return <Badge variant="outline" className="pill warn" aria-label="Evidence required: add a note or photo" title="Add a note or photo"><FileText aria-hidden="true"/> Required</Badge>
}
const assessmentGoals = [
  { Icon: ShieldCheck, label: 'Prepare a clean, safe fryer station' },
  { Icon: Droplets, label: 'Check oil condition and fryer readiness' },
  { Icon: CookingPot, label: 'Cook and handle food safely' },
  { Icon: ClipboardCheck, label: 'Meet product quality and holding standards' },
] as const
const wireframeOptions = [
  { value: 'met', title: 'Pass', desc: 'Did meet the standard', Icon: Check },
  { value: 'coaching', title: 'Needs coaching', desc: 'Met partially', Icon: ArrowUpRight },
  { value: 'fail', title: 'Fail', desc: 'Standard not met', Icon: X },
] as const
const options = [
  { value: 'met', title: 'Pass', desc: 'Performed as expected', Icon: Check },
  { value: 'coaching', title: 'Needs coaching', desc: 'Further practice is needed', Icon: ArrowUpRight },
  { value: 'fail', title: 'Fail', desc: 'Did not meet the standard', Icon: X },
] as const


export default function AssessmentFlow({ version = 2 }: { version?: 2 | 3 | 4 | 5 }) {
  const floatingEvidence = version >= 3
  const wireframe = version >= 4
  const spatial = version === 5
  const brandDemo = spatial && new URLSearchParams(location.search).get('brandDemo') === '1'
  const requestedPreview = new URLSearchParams(location.search).get('flowPreview')
  const previewPage = brandDemo && spatialPreviewPages.some(page => page.id === requestedPreview) ? requestedPreview as SpatialPreviewPage : null
  const { brand, setBrand } = useSpatialBrand(spatial)
  const { visualTheme, setVisualTheme } = useVisualTheme(spatial)
  const Surface = spatial ? SpatialSurface : Card
  const ActionButton = spatial ? SpatialActionButton : Button
  const storageKey = spatial && previewPage ? spatialStorageKey + '-preview' : spatial ? spatialStorageKey : version === 4 ? 'lp-rosa-flow-v4-v01' : floatingEvidence ? 'lp-rosa-flow-v3-v01' : flowStorageKey
  const [draft, setDraft] = useState<FlowDraft>(() => { if (previewPage) return spatialPreviewDraft(previewPage); try { const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null'); return spatial ? normalizeSpatialDraft(saved) : normalizeFlowDraft(saved) } catch { return spatial ? emptySpatialDraft() : emptyFlowDraft() } })
  const [connectionOffline, setConnectionOffline] = useState(!navigator.onLine)
  const offline = draft.offline || (spatial && connectionOffline)
  useEffect(() => {
    if (!spatial) return
    const changed = () => setConnectionOffline(!navigator.onLine)
    window.addEventListener('online', changed); window.addEventListener('offline', changed)
    return () => { window.removeEventListener('online', changed); window.removeEventListener('offline', changed) }
  }, [spatial])
  const [retiredChoices, setRetiredChoices] = useState<number[]>(() => { if (!spatial) return []; try { const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null'); return Object.entries(saved?.answers ?? {}).filter(([, value]) => value === 'coaching').map(([key]) => Number(key)) } catch { return [] } })
  const [direction, setDirection] = useState<'next' | 'back'>('next')
  const [saveError, setSaveError] = useState(false)
  const [evidenceError, setEvidenceError] = useState('')
  const [photos, setPhotos] = useState<Record<number, number>>({})
  const [mediaVersion, setMediaVersion] = useState(0)
  const [reviewEvidenceTarget, setReviewEvidenceTarget] = useState<{ index: number; node: HTMLDivElement } | null>(null)
  const reviewEvidence = useCallback((index: number, node: HTMLDivElement | null) => setReviewEvidenceTarget(node ? { index, node } : null), [])
  const [galleryTarget, setGalleryTarget] = useState<HTMLDivElement | null>(null)
  const [sheet, setSheet] = useState<'sections' | 'finished' | 'reset' | 'member' | 'preview' | 'complete' | null>(previewPage === 'finish' ? 'complete' : null)
  const [previewSection, setPreviewSection] = useState<typeof criteria[number]['section']>('Preparation')
  const controllers = useRef<Record<number, EvidenceActions | null>>({})
  const screenRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const sectionsFocus = useRef<'question' | 'trigger' | null>(null)
  const sectionsPreviewBack = useRef<(() => boolean) | null>(null)
  const registerSectionsPreview = useCallback((back: (() => boolean) | null) => { sectionsPreviewBack.current = back }, [])
  const criterionNavigation = useRef<((direction: 'next' | 'back') => void) | null>(null)
  const sectionsButton = useRef<HTMLButtonElement>(null)
  const sheetTrigger = useRef<HTMLElement | null>(null)
  const draftRef = useRef(draft)
  const missing = spatial ? spatialMissing(draft, photos) : flowMissing(draft, photos)
  // A restored draft cannot retain eligibility based on media from a previous page session.
  const screen = draft.screen === 'signoff' && missing.length ? 'review' : draft.screen
  const c = criteria[draft.index]
  const responseOptions = spatial ? wireframeOptions.filter(option => option.value !== 'coaching') : wireframe ? wireframeOptions : options
  const evidenceRequired = 'evidence' in c
  const evidencePending = evidenceRequired && !(spatial ? spatialEvidenceOk(draft, draft.index, photos) : flowEvidenceOk(draft, draft.index, photos))
  const canContinue = spatial ? !spatialNavigationBlock(draft, photos, 'next') : false
  function navigateCriterion(direction: 'next' | 'back') {
    if (spatialNavigationBlock(draftRef.current, photos, direction)) return
    if (direction === 'back') update({ index: draftRef.current.index - 1, activeIndex: spatialActiveIndex(draftRef.current) })
    else if (draftRef.current.index !== spatialActiveIndex(draftRef.current)) update(spatialNextPosition(draftRef.current))
    else if (draftRef.current.index === criteria.length - 1) setSheet('complete')
    else update(spatialNextPosition(draftRef.current))
  }
  const recorded = Object.values(draft.answers).filter(value => value !== 'notObserved').length
  const met = Object.values(draft.answers).filter(answer => answer === 'met').length
  const coaching = Object.values(draft.answers).filter(answer => answer === 'coaching').length
  const failed = Object.values(draft.answers).filter(answer => answer === 'fail').length
  const followUp = coaching > 0 || failed > 0
  useLayoutEffect(() => {
    if (sheet && floatingEvidence) sheetTrigger.current = document.activeElement as HTMLElement
  }, [sheet, floatingEvidence])
  useMobileViewport()
  useMobileOverlay(sheet !== null, () => { setSheet(null); return true })
  useEffect(() => {
    const typography = loadTheme().typography
    const theme = spatial ? spatialTheme : { ...creatorTheme, light: floatingEvidence ? { ...creatorTheme.light, background: '#f7f8f8', card: '#ffffff' } : creatorTheme.light, typography: { ...typography, size: 16, body: 'inter' as const, heading: 'inter' as const, headingWeight: 740 } }
    document.documentElement.dataset.assessmentVersion = String(version)
    applyTheme(theme, 'light')
    return () => { delete document.documentElement.dataset.assessmentVersion }
  }, [version, floatingEvidence, spatial])

  useLayoutEffect(() => {
    screenRef.current?.scrollTo({ top: 0 })
    if (mounted.current) titleRef.current?.focus({ preventScroll: true })
    mounted.current = true
  }, [screen, draft.index])
  function replace(next: FlowDraft) {
    draftRef.current = next
    setDraft(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaveError(false) } catch { setSaveError(true) }
  }
  function update(patch: Partial<FlowDraft>, observation = false) {
    if (spatial && draftRef.current.assessorConfirmed && (observation || patch.answers || patch.notes || patch.feedback !== undefined || patch.signature || patch.assessorConfirmed === false)) return
    if (spatial && draftRef.current.completion) {
      if (observation || patch.answers || patch.notes || patch.index !== undefined) return
      if (patch.screen === 'assessment') patch = { ...patch, screen: 'review' }
    }
    if (spatial) {
      if (patch.index !== undefined && patch.index !== draftRef.current.index) setDirection(patch.index < draftRef.current.index ? 'back' : 'next')
      else if (patch.screen && patch.screen !== draftRef.current.screen) setDirection(flowScreens.indexOf(patch.screen) < flowScreens.indexOf(draftRef.current.screen) ? 'back' : 'next')
    }
    replace({ ...draftRef.current, ...patch, ...(observation ? { assessorConfirmed: false } : {}) })
  }
  function go(next: FlowScreen) { update({ screen: next === 'signoff' && missing.length ? 'review' : next }); setSheet(null) }
  function start() { if (spatial) { const state = spatialLifecycle(draftRef.current, photos, spatialAssessmentPolicy.managerApprovalRequired); update({ screen: state.nextScreen, paused: false, started: true }); return } const next = floatingEvidence ? (missing[0] ?? -1) : criteria.findIndex((_, i) => !draft.answers[i]); update({ screen: 'assessment', index: next < 0 ? draft.index : next, paused: false }) }
  function edit(index: number) { update({ index, ...(spatial ? { activeIndex: spatialActiveIndex(draftRef.current) } : {}), screen: 'assessment', paused: false }) }
  function jumpToCriterion(index: number) {
    const selected = spatialSelectChecklistTask(draftRef.current, photos, index)
    if (!selected) return
    sectionsFocus.current = 'question'
    update({ index: selected.index, activeIndex: selected.activeIndex, screen: 'assessment', paused: false })
    setSheet(null)
  }
  function jumpToSection(section: typeof c.section) {
    sectionsFocus.current = 'question'
    edit(criteria.findIndex(item => item.section === section))
    screenRef.current?.scrollTo({ top: 0 })
    setSheet(null)
  }
  function answerKey(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const current = responseOptions.findIndex(option => option.value === (event.target as HTMLButtonElement).value)
    if (current < 0) return
    event.preventDefault()
    event.stopPropagation()
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? responseOptions.length - 1 : (current + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + responseOptions.length) % responseOptions.length
    answer(responseOptions[index].value)
    document.getElementById(`flow-answer-${responseOptions[index].value}`)?.focus()
  }
  function answer(value: FlowAnswer) { if (spatial) setRetiredChoices(previous => previous.filter(index => index !== draft.index)); update({ answers: { ...draft.answers, [draft.index]: value } }, true) }
  function saveReviewNote(index: number, value: string): boolean {
    const next = updateSpatialObservation(draftRef.current, index, value)
    if (!next) return false
    // Commit to React only after persistence succeeds; keep unsaved text on failure.
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { setSaveError(true); return false }
    draftRef.current = next; setDraft(next); setSaveError(false)
    return true
  }
  function note(index: number, value: string) { update({ notes: { ...draftRef.current.notes, [index]: value } }, true) }
  function openPreview(page: SpatialPreviewPage) {
    const url = new URL(location.href)
    url.searchParams.set('flowPreview', page)
    location.assign(url.toString())
  }
  async function resetPrototype() {
    try { await Promise.all([clearEvidence(spatialStorageKey), clearEvidence(spatialStorageKey + '-preview')]) } catch { setSaveError(true); return }
    if (previewPage) {
      try { localStorage.removeItem(spatialStorageKey + '-preview'); localStorage.removeItem(spatialStorageKey) } catch { /* regular save path reports persistence errors */ }
      const url = new URL(location.href); url.searchParams.delete('flowPreview'); location.assign(url.toString()); return
    }
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    replace(emptySpatialDraft())
    setPhotos({}); setEvidenceError('')
    setMediaVersion(value => value + 1)
    setRetiredChoices([])
    setReviewEvidenceTarget(null)
    setGalleryTarget(null)
    setSheet(null)
  }
  function reset() { if (spatial && draftRef.current.completion) return; replace({ ...(spatial ? emptySpatialDraft() : emptyFlowDraft()), index: 0 }); setPhotos({}); setMediaVersion(value => value + 1); setSheet(null) }
  function sample() { update({ answers: Object.fromEntries(criteria.map((_, i) => [i, i === 5 ? (spatial ? 'fail' : 'coaching') : 'met'])), notes: { ...draft.notes, 8: 'Product appeared consistent with the agreed standard. Review portion size at next practice session.' }, index: 4, screen: 'assessment', paused: false }, true); setSheet(null) }
  function title(heading: string, description?: string) { return <header className="flow-page-intro"><h1 ref={titleRef} tabIndex={-1} className="page-title">{heading}</h1>{description && <p className="page-sub">{description}</p>}</header> }
  function back() {
    if (screen === 'assessment') { update({ screen: 'overview', paused: spatial || recorded > 0 }); return }
    if (spatial && screen === 'review') { go('overview'); return }
    go(screen === 'signoff' ? 'review' : screen === 'review' ? 'assessment' : 'list')
  }
  const lifecycle = spatialLifecycle(draft, photos, spatialAssessmentPolicy.managerApprovalRequired)
  const assessmentStatus = spatial ? lifecycle.status : draft.paused ? 'Saved draft' : recorded ? 'In progress' : 'Ready to Start'
  const pageLabels: Record<FlowScreen, string> = { list: 'Assessments', overview: spatial ? 'Assessment Overview' : 'Assessment overview', assessment: 'Assessment', review: spatial ? 'Assessment Result' : 'Assessment review', signoff: spatial ? 'Assessment submission' : 'Feedback & sign-off' }

  const [overlayContainer, setOverlayContainer] = useState<HTMLDivElement | null>(null)
  const navigation = <nav className="flow-nav" aria-label="Screen flow">{flowScreens.map((id, i) => <button key={id} className={screen === id ? 'active' : ''} aria-current={screen === id ? 'step' : undefined} onClick={() => go(id)}><span className="number">0{i + 1}</span>{screenNames[id]}{id === 'signoff' && missing.length > 0 && <span className="sr-only"> (requires complete checklist)</span>}</button>)}</nav>
  const tools = <div className="stack"><ActionButton variant="outline" className="action outline" onClick={sample}>Load sample observations <ArrowUpRight size={15}/></ActionButton><ActionButton variant="outline" className="action outline" onClick={() => setSheet('reset')}>Reset prototype</ActionButton></div>
  return <OverlayContainerContext.Provider value={spatial ? overlayContainer : undefined}>{spatial && <SpatialBrandStyles/>}<div className={`flow-app ${floatingEvidence && !spatial ? 'flow-v3' : ''} ${wireframe && !spatial ? 'flow-v4' : ''} ${spatial ? `flow-v5 participant-flow ${brandDemo ? 'has-brand-preview' : ''}` : ''}`}><div className="workspace">
    {!spatial && <aside className="side"><div className="wordmark"><span className="brandmark"><ArrowUpRight size={17}/></span> Learning Pool <span>/ S2S</span></div><div className="eyebrow">EXERCISE 01 · ON THE FLOOR</div><h2 className="intro">{spatial ? <>Spatial<br/><em>Flow.</em></> : <>Designing for<br/>the moment.</>}</h2><p className="desc">Rosa’s practical assessment of Dre, during a busy shift. A mobile-first flow for observation, evidence and feedback.</p><h2 className="railhead">Presentation controls</h2><VersionSwitcher current={version}/><h2 className="railhead">Screen flow</h2>{navigation}<div className="aside-card"><strong>Prototype boundaries</strong>Checklist rules are illustrative. No backend, identity verification or server sync is simulated as real.</div>{spatial && <a className="action outline spaced" href="?view=design-system">Spatial Design System</a>}<h2 className="railhead">Testing shortcuts</h2>{tools}<a className="action outline spaced" href="?studio=1">Open Theme Studio</a></aside>}
    <main className="stage">{!spatial && <div className="stage-label"><span>Rosa / Mobile-first assessment</span><button className={`toggle ${draft.offline ? 'offline' : ''}`} onClick={() => update({ offline: !draft.offline })}>{draft.offline ? <WifiOff size={14}/> : <Wifi size={14}/>} {draft.offline ? 'Offline demo' : 'Online demo'}</button></div>}
      <div className={spatial ? 'participant-surface' : 'device-shell-legacy'}>
      <div className="phone">
      {spatial && <SpatialSystemChrome mode={new URLSearchParams(location.search).get('native') === '1' ? 'native' : new URLSearchParams(location.search).get('systemChrome') === 'preview' ? 'preview' : 'auto'}/>}
      {spatial && screen === 'list' && lifecycle.started && <SpatialFlowHeader title="Assessments"/>}
      {screen !== 'assessment' && screen !== 'list' && spatial && <SpatialFlowHeader title={pageLabels[screen]} onBack={back} backLabel={screen === 'overview' ? (spatial && !lifecycle.started ? 'Back to notification' : 'Back to assessments') : screen === 'review' ? (spatial ? 'Back to overview' : 'Back to checklist') : 'Back to review'}/> }
      {screen !== 'assessment' && !spatial && <header className="overview-topbar">{screen !== 'list' ? <ActionButton variant="ghost" size="icon" className={spatial ? 'spatial-header-back' : undefined} onClick={back} aria-label={screen === 'overview' ? (spatial && !lifecycle.started ? 'Back to notification' : 'Back to assessments') : screen === 'review' ? (spatial ? 'Back to overview' : 'Back to checklist') : 'Back to review'}><ChevronLeft aria-hidden="true"/></ActionButton> : <span/>}<p>{pageLabels[screen]}</p><div className="mobile-version-switcher"><VersionSwitcher current={version}/></div></header>}
      {screen === 'assessment' && !spatial && <header className="assessment-header" aria-label="Assessment progress">
        <ActionButton variant="ghost" size="icon" className="assessment-back" onClick={back} aria-label="Back to overview"><ChevronLeft aria-hidden="true"/></ActionButton><div className="assessment-header-copy"><div className="assessment-header-top"><h1 ref={floatingEvidence ? undefined : titleRef} tabIndex={-1} className="assessment-name">Fryer Station</h1><span className={`autosave-status ${draft.offline || saveError ? 'attention' : ''}`} role="status" aria-label={saveError ? 'Local save unavailable' : draft.offline ? 'Offline demo · local draft' : 'Saved on this device'}>{saveError ? 'Save unavailable' : draft.offline ? 'Offline · local draft' : 'Saved Automatically'}</span></div>
        <div className="assessment-header-progress"><span>{recorded} / {criteria.length} recorded</span><Progress className="flow-progress" value={recorded / criteria.length * 100} aria-label="Tasks recorded" aria-valuetext={`${recorded} of ${criteria.length} tasks recorded`}/><span>{Math.round(recorded / criteria.length * 100)}%</span></div>
      </div></header>}
      {screen === 'assessment' && spatial && <SpatialAssessmentHeader draft={{ ...draft, offline }} photos={photos} saveError={saveError} onBack={back} onMember={() => setSheet('member')}/>}
      <section className={`screen ${spatial && screen === 'list' && !lifecycle.started ? 'spatial-notification-screen' : ''} ${screen === 'assessment' ? 'assessment-screen' : screen === 'overview' ? 'overview-screen' : ''}`} ref={screenRef} data-screen={screen} aria-label={screenNames[screen]}>
      {spatial && evidenceError && <p role="alert" className="notice warn">{evidenceError}</p>}
      {spatial && retiredChoices.length > 0 && (screen !== 'assessment' || retiredChoices.includes(draft.index)) && <p role="status" className="notice warn">Review your earlier observations and select Pass or Fail for each item.</p>}
      {screen === 'list' && spatial && (lifecycle.started ? <div className="flow-page-content"><SpatialAssignmentCard draft={draft} photos={photos} status={assessmentStatus} action={lifecycle.action} onOpen={start}/></div> : <SpatialNotification onOpen={() => go('overview')}/>) }
      {screen === 'list' && !spatial && <div className="flow-page-content">
        {title('Your assessments', 'Observe, support and review your team’s practical skills.')}
        {<>
        <Surface data-elevation="quiet" className="overview-card">
          <CardHeader><CardTitle><h2>Ready to assess</h2></CardTitle></CardHeader>
          <CardContent>
            <div className="flow-card-heading"><h3>Fryer Station</h3><Badge variant="outline" className="overview-status">{assessmentStatus}</Badge></div>
            <p className="overview-category">Food Process &amp; Safety · Category 2</p>
            <div className="flow-person"><span className="overview-goal-icon"><UserRound aria-hidden="true"/></span><div><strong>Dre Jackson</strong><small>Crew Floor Member</small></div></div>
            <Separator className="my-4"/>
            <div className="flow-card-detail"><span>{criteria.length} tasks</span><span>Assessor · Rosa Thompson</span></div>
            <ActionButton className="overview-start spaced" onClick={() => go('overview')}>View Assessment <ChevronRight aria-hidden="true"/></ActionButton>
          </CardContent>
        </Surface>
        </>}
        {draft.paused && <p className="notice">Your observations are saved on this device. Resume when you’re ready.</p>}
        <Surface data-elevation="quiet" className="overview-card"><CardContent className="flow-tip"><span className="overview-goal-icon"><Clock3 aria-hidden="true"/></span><div><h2>At your own pace</h2><p className="overview-description">Record observations as you go. You can leave the checklist and return to your saved draft.</p></div></CardContent></Surface>
      </div>}
      {screen === 'overview' && <div className="overview-content">
        <>{spatial ? <SpatialStationHeading titleRef={titleRef}/> : <header className="overview-intro">

          <div className="overview-heading"><h1 ref={titleRef} tabIndex={-1}>Fryer Station</h1><span>{criteria.length} tasks</span></div>
          <p className="overview-category">Food Process &amp; Safety{!spatial && <> <span aria-hidden="true">•</span> Category 2</>}</p>
        </header>}</>
        {spatial ? <><SpatialPeopleCard status={assessmentStatus} learning={spatialOverviewLearning} onMember={() => setSheet('member')}/>{lifecycle.started && <OverviewProgress draft={draft} photos={photos}/>}</> : <>
        <Surface data-elevation="quiet" className="overview-card">
          <CardContent className="overview-member-content">
            <ActionButton variant="ghost" className="overview-member" onClick={() => setSheet('member')} aria-label="View team member Dre Jackson">
              <span className="overview-avatar" aria-hidden="true">{floatingEvidence && <UserRound/>}</span>
              <span className="overview-person-copy"><span>Dre Jackson</span><small>Crew Floor Member</small></span>
              <ChevronRight aria-hidden="true"/>
            </ActionButton>
          </CardContent>
          <Separator/>
          <CardContent className="overview-metadata">
            <div><span>Assessment Status</span><Badge variant="outline" className="overview-status">{assessmentStatus}</Badge></div>
            <div><span>Qualified Assessor</span><strong>Rosa Thompson (me)</strong></div>
          </CardContent>
        </Surface>
        </>}
        <Surface data-elevation="quiet" className="overview-card">
          <CardHeader><CardTitle><h2>{spatial ? 'The assessment' : 'Assessment description'}</h2></CardTitle></CardHeader>
          <CardContent>{spatial ? <div className="spatial-overview-description"><p className="overview-description">Observe Dre completing the fryer task from preparation to handoff.</p><p className="overview-description">Check safe working practices, the cooking process and the finished product against the station standard.</p></div> : <p className="overview-description">Observe Dre completing the fryer task from preparation to handoff. Check safe working practices, the cooking process and the finished product against the station standard.</p>}</CardContent>
        </Surface>
        <Surface data-elevation="quiet" className="overview-card">
          <CardHeader><CardTitle><h2>Goals</h2></CardTitle></CardHeader>
          <CardContent>
            <ul className="overview-goals">{assessmentGoals.map(({ Icon, label }) => <li key={label}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><span>{label}</span></li>)}</ul>
          </CardContent>
        </Surface>
        <Surface data-elevation="quiet" className="overview-card overview-sections">
          <CardHeader><CardTitle><h2>{spatial ? 'What you will observe by step' : 'What you will observe'}</h2></CardTitle></CardHeader>
          <CardContent>
            {(['Preparation', 'Frying', 'Completion'] as const).map((section, i) => <div key={section}>
              {i > 0 && <Separator/>}
              <ActionButton variant="ghost" className="overview-section" onClick={() => { setPreviewSection(section); setSheet('preview') }} aria-label={`Preview ${section}: ${criteria.filter(item => item.section === section).length} tasks`}>
                <span className="overview-section-number" aria-hidden="true">{i + 1}</span>
                <span className="overview-section-copy"><span>{section}</span><small>{criteria.filter(item => item.section === section).length} tasks</small></span>
                <ChevronRight aria-hidden="true"/>
              </ActionButton>
            </div>)}
            {spatial && <div className="spatial-preview-entry-wrap"><SpatialAssessmentPreview/></div>}
          </CardContent>
        </Surface>
        {spatial && <SpatialBeforeStart/>}
      </div>}
      {screen === 'assessment' && spatial && <SpatialLiveCard draft={draft} photos={photos} direction={direction} titleRef={titleRef} onAnswer={answer} onNote={value => note(draft.index, value)} onCamera={() => controllers.current[draft.index]?.openMedia()} galleryRef={setGalleryTarget} onNavigate={navigateCriterion} navigationRef={criterionNavigation} swipeEnabled={sheet === null}/> }
      {screen === 'assessment' && !spatial && <div key={spatial ? draft.index : 'live'} className={`flow-page-content ${spatial ? 'spatial-live-card' : ''}`} data-direction={direction}><section className="live-question" aria-labelledby="live-question-title"><div className="row criterion-context"><div className="criterion-tags"><span className="pill">{c.section}</span>{'critical' in c && <span className="pill danger">◆ Critical</span>}</div><span className="subtext criterion-position">Task {draft.index + 1} / {criteria.length}</span></div><div className="chips">{'evidence' in c && <EvidenceRequiredTag/>}</div><h2 id="live-question-title" ref={floatingEvidence ? titleRef : undefined} tabIndex={floatingEvidence ? -1 : undefined} className="criterion-title">{wireframe && !spatial && draft.index === 1 ? 'Check fryer readiness and oil conditions' : c.title}</h2><p className="criterion-desc">{wireframe && !spatial && draft.index === 1 ? 'Is the fryer ready for safe operation and have the oil checks been completed?' : c.desc}</p></section><section className="live-responses" aria-label="Observation result"><RadioGroup className="choices" onKeyDownCapture={floatingEvidence ? answerKey : undefined} aria-label="Observation result" value={draft.answers[draft.index] ?? ''} onValueChange={value => { if (value === 'met' || value === 'coaching' || value === 'fail') answer(value) }}>{responseOptions.map(({ value, title: label, desc, Icon }) => <div key={value} onClick={() => answer(value)} className={`choice ${value} ${draft.answers[draft.index] === value ? 'selected' : ''}`}><span className="choice-icon"><Icon size={17}/></span><span className="choice-copy"><b>{label}</b><small>{desc}</small></span><RadioGroupItem id={`flow-answer-${value}`} value={value} aria-label={label} className="response-radio"/></div>)}</RadioGroup></section>
        {!floatingEvidence && <Surface className="overview-card evidencebox" aria-label="Observation evidence"><CardContent><div className="evidencehead"><h2>Observation evidence</h2>{'evidence' in c ? <EvidenceRequiredTag/> : <span className="pill">Optional</span>}</div><Textarea id="flow-comment" aria-label="Comment" value={draft.notes[draft.index] ?? ''} onChange={event => note(draft.index, event.target.value)} placeholder="Describe the observed action…" aria-describedby="flow-comment-help"/><p id="flow-comment-help" className="subtext">{saveError ? 'Unable to save. Keep this page open.' : 'Saved as you type on this device.'}</p><ActionButton variant="outline" className="action outline spaced" onClick={() => controllers.current[draft.index]?.openMedia()}><Camera size={16}/> Add photo / video</ActionButton><div className="flow-gallery" ref={setGalleryTarget}/></CardContent></Surface>}
        {wireframe && <div className="inline-evidence-actions" role="group" aria-label="Add observation evidence">
          {evidenceRequired && <span id="floating-evidence-requirement" className="sr-only" role="status">{evidencePending ? 'Add a comment or photo. Either one meets the evidence requirement.' : 'Evidence requirement met.'}</span>}
          <ActionButton variant="outline" className="inline-evidence-action" data-evidence-pending={evidencePending || undefined} aria-describedby={evidenceRequired ? 'floating-evidence-requirement' : undefined} onClick={() => controllers.current[draft.index]?.openMedia()} aria-label="Add photo"><Camera aria-hidden="true"/> Photo{(photos[draft.index] ?? 0) > 0 && <Badge variant="secondary">{photos[draft.index]}</Badge>}</ActionButton>
          <ActionButton variant="outline" className="inline-evidence-action" data-evidence-pending={evidencePending || undefined} aria-describedby={evidenceRequired ? 'floating-evidence-requirement' : undefined} onClick={() => controllers.current[draft.index]?.openNote()} aria-label={draft.notes[draft.index]?.trim() ? 'Edit comment' : 'Add comment'}><CirclePlus aria-hidden="true"/> Comment{draft.notes[draft.index]?.trim() && <Check aria-hidden="true"/>}</ActionButton>
        </div>}
        {floatingEvidence && <div className="floating-evidence-summary" aria-label="Saved evidence">
          {draft.notes[draft.index]?.trim() && <ActionButton variant="ghost" className="saved-note" onClick={() => controllers.current[draft.index]?.openNote()} aria-label="Edit observation note"><FileText aria-hidden="true"/><span>{draft.notes[draft.index]}</span></ActionButton>}
          <div className="flow-gallery" ref={setGalleryTarget}/>
        </div>}
      </div>}
      {screen === 'review' && spatial && <div className="flow-page-content"><SpatialStationHeading titleRef={titleRef}/><SpatialReviewSummary draft={draft} photos={photos}/><SpatialReviewList draft={draft} photos={photos} onSaveObservation={saveReviewNote} onEdit={edit} onEvidenceTarget={reviewEvidence}/><SpatialReviewNextSteps draft={draft}/></div>}
      {screen === 'review' && !spatial && <div className="flow-page-content">
        {title('Review observations', 'Fryer Station · Dre Jackson')}
        <Surface data-elevation="quiet" className="overview-card"><CardHeader><CardTitle><h2>Assessment summary</h2></CardTitle></CardHeader><CardContent><div className="review-stats">{[{ count: met, label: 'Pass', Icon: Check }, { count: failed, label: 'Fail', Icon: X }, ...(!spatial ? [{ count: coaching, label: 'Needs coaching', Icon: MessageSquare }] : []), { count: missing.length, label: 'Incomplete', Icon: ClipboardCheck }].map(({ count, label, Icon }) => <div className="review-stat" data-result={label} key={label}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><b>{count}</b><small>{label}</small></div>)}</div></CardContent></Surface>
        <p role="status" className={`notice ${missing.length ? 'warn' : ''}`}>{missing.length ? `${missing.length} ${spatial && missing.length === 1 ? 'task needs' : 'tasks need'} attention. Record each result and add required evidence before sign-off.` : (spatial ? 'All observations and required evidence are complete. Review the results with Dre; this is not an overall pass.' : 'All required observations and evidence are recorded. Review the results with Dre.')}</p>
        <Surface data-elevation="quiet" className="overview-card overview-sections"><CardHeader><CardTitle><h2>Checklist summary</h2></CardTitle></CardHeader><CardContent>
          {(['Preparation', 'Frying', 'Completion'] as const).map((section, sectionIndex) => <section className="review-section" key={section} aria-labelledby={`review-section-${sectionIndex}`}><h3 id={`review-section-${sectionIndex}`}><span className="overview-section-number">{sectionIndex + 1}</span>{section}</h3>{criteria.map((item, i) => item.section === section && <ActionButton key={item.title} variant="ghost" className="review-item" onClick={() => edit(i)} aria-label={`Edit: ${item.title}`}><span className={`dot ${draft.answers[i] ?? ''}`} aria-hidden="true"/><span><strong>{item.title}{'critical' in item && <span className="critical-mark" title="Critical"> ◆</span>}</strong><small>{!draft.answers[i] ? 'Not recorded' : !flowEvidenceOk(draft, i, photos) ? 'Evidence required' : draft.answers[i] === 'notObserved' ? 'Response needed' : options.find(option => option.value === draft.answers[i])?.title}{spatial && (draft.notes[i]?.trim() || photos[i]) ? ` · ${draft.notes[i]?.trim() ? 'Comment recorded' : 'Photo · session only'}` : ''}</small></span><ChevronRight aria-hidden="true"/></ActionButton>)}</section>)}
        </CardContent></Surface>
      </div>}
      {screen === 'signoff' && spatial && <div className="flow-page-content spatial-submission">{title('Signature & feedback')}<SpatialSubmission draft={draft} onFeedback={feedback => update({ feedback, assessorConfirmed: false })} onSignature={signature => update({ signature, assessorConfirmed: false })}/></div>}
      {screen === 'signoff' && !spatial && <div className="flow-page-content">
        {title(floatingEvidence ? 'Share feedback' : 'Feedback & sign-off', 'Fryer Station · Dre Jackson')}
        <Surface data-elevation="quiet" className="overview-card"><CardHeader><CardTitle><h2>{followUp ? 'Next steps for Dre' : 'What went well'}</h2></CardTitle></CardHeader><CardContent>
          <Badge variant="outline" className={`pill ${followUp ? 'warn' : 'good'}`}>{failed ? 'Feedback needed' : coaching ? 'Further coaching indicated' : 'Observations complete'}</Badge>
          <p className="overview-description spaced">{followUp ? 'Discuss the steps that need more practice and agree on the next opportunity to demonstrate them.' : 'Share the strengths you observed and discuss the results together.'}</p>
          <label className="fieldlabel" htmlFor="flow-feedback">Coaching / feedback note</label><Textarea id="flow-feedback" value={draft.feedback} onChange={event => update({ feedback: event.target.value }, true)} placeholder="What went well? What should Dre practise next?"/>
        </CardContent></Surface>
        <Surface data-elevation="quiet" className="overview-card overview-sections"><CardHeader><CardTitle><h2>{spatial ? 'Workflow approvals' : 'Required approvals'}</h2></CardTitle></CardHeader><CardContent>{[
          { name: 'Rosa Thompson', role: 'Qualified assessor', description: 'Identity and role require verification.', confirmed: draft.assessorConfirmed, Icon: ClipboardCheck },
          { name: 'Dre Jackson', role: 'Team member', description: 'Confirmation depends on configured requirements.', confirmed: false, Icon: UserRound },
          { name: 'Manager', role: 'Countersign', description: 'Required only when specified by assessment rules.', confirmed: false, Icon: ShieldCheck },
        ].filter(item => !spatial || item.name !== 'Manager').map(({ name, role, description, confirmed, Icon }) => <div className="approval-row" key={name}><span className="overview-goal-icon"><Icon aria-hidden="true"/></span><div><strong>{name}</strong><small>{role}</small><p>{description}</p></div><Badge variant="outline" className={confirmed ? 'pill good' : ''}>{confirmed ? (spatial ? 'Local review' : 'Recorded · demo') : spatial && name === 'Dre Jackson' ? 'Not collected' : 'Pending'}</Badge></div>)}</CardContent></Surface>
        <p className={`notice signoff-notice ${offline ? 'warn' : ''}`}>{offline ? 'You’re offline. Your review stays on this device and has not been submitted.' : (spatial ? 'Your review is saved on this device only. It has not been submitted for approval and does not issue a certification.' : 'Demo sign-off only. Certification requires verified approvals and a server audit record.')}</p>
      </div>}
      {spatial && saveError && screen !== 'assessment' && <p role="alert" className="notice warn">Unable to save on this device. Keep this page open. Nothing has been submitted.</p>}
      {spatial && offline && screen !== 'assessment' && <p role="status" className="notice warn">Offline · saved on this device only. No server sync.</p>}
      {saveError && screen !== 'assessment' && <p role="alert" className="notice warn">Local save unavailable. Keep this page open to retain your work.</p>}
      </section>
      {floatingEvidence && !wireframe && screen === 'assessment' && <div className="evidence-fab-dock" role="group" aria-label="Add observation evidence">
        {evidenceRequired && <span id="floating-evidence-requirement" className="sr-only" role="status">{evidencePending ? 'Add a note or photo. Either one meets the evidence requirement.' : 'Evidence requirement met. You can edit the note or add more photos.'}</span>}
        <Tooltip><TooltipTrigger asChild><ActionButton variant={evidencePending ? 'default' : 'outline'} size="icon" className="evidence-fab" data-evidence-pending={evidencePending || undefined} aria-describedby={evidenceRequired ? 'floating-evidence-requirement' : undefined} onClick={() => controllers.current[draft.index]?.openNote()} aria-label={draft.notes[draft.index]?.trim() ? 'Edit note' : 'Add note'} title={draft.notes[draft.index]?.trim() ? 'Edit note' : 'Add note'}><FileText aria-hidden="true"/>{draft.notes[draft.index]?.trim() && <span className="fab-indicator"><Check aria-hidden="true"/></span>}</ActionButton></TooltipTrigger><TooltipContent side="top" sideOffset={8}>{draft.notes[draft.index]?.trim() ? 'Edit note' : 'Add note'}</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><ActionButton variant={evidencePending ? 'default' : 'outline'} size="icon" className="evidence-fab" data-evidence-pending={evidencePending || undefined} aria-describedby={evidenceRequired ? 'floating-evidence-requirement' : undefined} onClick={() => controllers.current[draft.index]?.openMedia()} aria-label="Add photo" title="Add photo"><Camera aria-hidden="true"/>{(photos[draft.index] ?? 0) > 0 && <span className="fab-indicator">{photos[draft.index]}</span>}</ActionButton></TooltipTrigger><TooltipContent side="top" sideOffset={8}>Add photo</TooltipContent></Tooltip>
      </div>}
      <footer hidden={spatial && screen === 'list'} className={`phonebottom ${screen === 'overview' ? 'overview-footer' : ''}`}>
        {screen === 'list' && <p className="subtext center">Your assigned assessments are shown above</p>}
        {screen === 'overview' && <ActionButton className="overview-start" size="lg" onClick={start}>{spatial ? lifecycle.action : draft.paused || recorded ? 'Resume Assessment' : 'Start Assessment'}{spatial && <ChevronRight size={18} aria-hidden="true"/>}</ActionButton>}
        {screen === 'assessment' && spatial && <SpatialNavigation index={draft.index} reviewing={draft.index !== spatialActiveIndex(draft)} canContinue={canContinue} sectionsRef={sectionsButton} onBack={() => criterionNavigation.current?.('back')} onSections={() => { sectionsFocus.current = 'trigger'; setSheet('sections') }} onNext={() => criterionNavigation.current?.('next')}/>}
        {screen === 'assessment' && !spatial && <nav className="criterion-navigation" aria-label="Task navigation">
          <ActionButton variant="outline" className="action outline" disabled={draft.index === 0} aria-label={spatial ? 'Previous task' : undefined} onClick={() => update({ index: draft.index - 1 })}><ArrowLeft size={16}/>{!spatial && ' Back'}</ActionButton>
          <ActionButton variant="outline" ref={sectionsButton} className="action outline" aria-label="Sections" title="Sections" aria-haspopup="dialog" onClick={() => { sectionsFocus.current = 'trigger'; setSheet('sections') }}>{wireframe && !spatial ? <LayoutGrid aria-hidden="true"/> : <><List size={16}/> Sections</>}</ActionButton>
          <ActionButton variant="default" className="action" disabled={!draft.answers[draft.index] || draft.answers[draft.index] === 'notObserved'} onClick={() => draft.index === criteria.length - 1 ? go('review') : update({ index: draft.index + 1 })}>{floatingEvidence && draft.index === criteria.length - 1 ? 'Review' : 'Next'} <ArrowRight size={16}/></ActionButton>
        </nav>}
        {screen === 'review' && <><ActionButton variant="default" className="action" disabled={missing.length > 0} onClick={() => spatial && !draft.completion ? setSheet('complete') : go('signoff')}>{spatial ? <>Sign Off<ChevronRight size={18} aria-hidden="true"/></> : <>Continue to feedback & sign-off <ArrowRight size={16}/></>}</ActionButton>{missing.length > 0 && <p className="subtext center spaced">Complete {missing.length} item(s) before sign-off</p>}</>}
        {screen === 'signoff' && spatial && <ActionButton className="action" disabled={missing.length > 0 || !draft.signature} onClick={() => { if (missing.length || !draftRef.current.signature) return; update({ assessorConfirmed: true }); setSheet('finished') }}>{draft.assessorConfirmed ? 'View submission status' : 'Submit assessment'}</ActionButton>}
        {screen === 'signoff' && !spatial && <><ActionButton variant="default" className="action" disabled={missing.length > 0} onClick={() => { if (missing.length) return; update({ assessorConfirmed: true }); setSheet('finished') }}>{draft.assessorConfirmed ? 'View pending status' : 'Confirm assessor review'} <ArrowRight size={16}/></ActionButton><ActionButton variant="ghost" className="action textbtn" onClick={() => go('review')}><ArrowLeft size={15}/> Back to review</ActionButton></>}
      </footer>{spatial && <div ref={setOverlayContainer} className="device-overlay-root"/>}</div></div>{!spatial && <p className="floating">Working UX prototype · V{spatial ? '5.6' : version} / Assessment flow</p>}
    </main>{brandDemo && <aside className="spatial-brand-demo" aria-label="External preview controls"><p>Preview controls</p><VisualThemeSwitcher value={visualTheme} onChange={setVisualTheme}/><SpatialBrandSwitcher brand={brand} onChange={setBrand}/><a className="spatial-preview-library" href={`?view=design-system&brand=${brand.id}&visualTheme=${visualTheme}`}>Component Library <ArrowUpRight size={16} aria-hidden="true"/></a><nav className="spatial-preview-pages" aria-label="Prototype page shortcuts">{spatialPreviewPages.map(page => <Button key={page.id} variant="outline" onClick={() => openPreview(page.id)} aria-current={previewPage === page.id ? 'page' : undefined}>{page.label}</Button>)}</nav>{previewPage && <small className="spatial-preview-note">Example data · separate preview session.{previewPage === 'finish' ? ' Required evidence is simulated for this shortcut.' : ''}</small>}<Button variant="outline" className="mt-3 w-full" onClick={resetPrototype}>Reset prototype</Button></aside>}{!spatial && <aside className="right"><div className="eyebrow">DESIGN RATIONALE</div><h2>{rationale[screen][0]}</h2><div className="annotation"><b>Design intent</b><p>{floatingEvidence && screen === 'assessment' ? 'Keep responses prominent and evidence in the natural reading flow. Optional details scroll within the card.' : rationale[screen][1]}</p></div><div className="annotation"><b>Trade-off / validation</b><p>{spatial && screen === 'assessment' ? 'Notes persist on this device; photos remain in this page session. Neither is represented as a successful server upload.' : rationale[screen][2]}</p></div><div className="hint"><b>What we can evaluate</b><p>Tap targets, scanning, tasks clarity, mandatory evidence, save/resume and feedback.</p><b>What remains open</b><p>{floatingEvidence ? 'Scoring thresholds, exact critical items, sign-off identity checks and offline sync architecture.' : 'Scoring thresholds, exact critical items, video permission, sign-off identity checks and offline sync architecture.'}</p></div></aside>}
  </div>
  <div hidden>{criteria.map((item, i) => <EvidencePanel onPersistenceError={spatial ? setEvidenceError : undefined} evidenceStorageKey={spatial ? `${storageKey}:${previewPage ?? 'participant'}:${i}` : undefined} key={`${i}-${mediaVersion}`} note={draft.notes[i] ?? ''} onNoteChange={value => note(i, value)} onPhotoCountChange={(count, restored) => { setPhotos(previous => ({ ...previous, [i]: count })); if (!restored) update({ assessorConfirmed: false }) }} controllerRef={api => { controllers.current[i] = api }} context={item.title} photosOnly={floatingEvidence} persistentNote compact externalGallery galleryReadOnly={spatial && screen === 'review'} galleryTarget={screen === 'assessment' && draft.index === i ? galleryTarget : screen === 'review' && reviewEvidenceTarget?.index === i ? reviewEvidenceTarget.node : null}/>)}</div>
  <Sheet open={sheet !== null} onOpenChange={open => { if (!open && !sectionsPreviewBack.current?.()) setSheet(null) }}><SheetContent onEscapeKeyDown={event => { if (sheet === 'sections' && sectionsPreviewBack.current?.()) event.preventDefault() }} side="bottom" className={`mobile-sheet flow-sheet mx-auto max-w-lg rounded-t-3xl ${sheet === 'complete' ? 'spatial-finish-sheet' : ''}`} onCloseAutoFocus={event => { if (sectionsFocus.current) { event.preventDefault(); const target = sectionsFocus.current === 'question' || !sectionsButton.current?.isConnected ? titleRef.current : sectionsButton.current; sectionsFocus.current = null; target?.focus({ preventScroll: true }) } else if (floatingEvidence && sheetTrigger.current?.isConnected) { event.preventDefault(); sheetTrigger.current.focus({ preventScroll: true }) } }}>{sheet === 'complete' && <span className="spatial-finish-handle" aria-hidden="true"/>}<SheetHeader><SheetTitle>{sheet === 'complete' ? 'Finish assessment?' : sheet === 'sections' ? (spatial ? 'All tasks' : 'Jump to section') : sheet === 'reset' ? `Reset V${version} prototype?` : sheet === 'member' ? 'Team member' : sheet === 'preview' ? previewSection : spatial ? (lifecycle.status === 'Pending Review' ? 'Pending Review' : 'Submission saved on this device') : 'Assessor review recorded · demo'}</SheetTitle><SheetDescription>{sheet === 'complete' ? 'Once completed, you won’t be able to change Pass or Fail responses or repeat this assessment. You can correct comments before submission.' : sheet === 'sections' ? (spatial ? spatialChecklistDescription : 'Jump to the first question in any section. Your responses and comments are saved automatically.') : sheet === 'reset' ? `Clear V${version} responses, comments, feedback and attachments. Other versions will be retained.` : sheet === 'member' ? (spatial ? 'Dre Michael · Crew Floor Member' : 'Dre Jackson · Crew Floor Member') : sheet === 'preview' ? 'Review what you will observe before starting the assessment.' : spatial ? 'Saved on this device only. Nothing has been sent to Alex. No approval or certification has been issued.' : 'This is a visual prototype. No real approval or certification has been issued.'}</SheetDescription></SheetHeader><div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-5">

    {sheet === 'complete' && <>{missing.length > 0 && previewPage !== 'finish' && <p role="status">Complete {missing.length} remaining task(s), including required evidence, before finishing.</p>}<SpatialSurface className="spatial-finish-summary"><CardHeader><CardTitle><h2>Tasks summary</h2></CardTitle></CardHeader><CardContent><SpatialTaskStats draft={draft}/></CardContent></SpatialSurface><SpatialSlideComplete disabled={missing.length > 0 && previewPage !== 'finish'} onComplete={() => { const completed = completeSpatialAssessment(draftRef.current, previewPage === 'finish' ? { ...photos, 8: Math.max(1, photos[8] ?? 0) } : photos); if (completed) { replace(completed); setSheet(null) } }}/><ActionButton variant="outline" className="spatial-finish-back" onClick={() => setSheet(null)}>Back to assessment</ActionButton></>}
    {sheet === 'member' && <div className="space-y-3"><p>{spatial ? 'Crew Floor Member' : 'Dre is a new starter and completed e-learning yesterday.'}</p><p className="text-muted-foreground">Assigned assessment: Fryer Station</p><ActionButton className="w-full" onClick={() => setSheet(null)}>{screen === 'assessment' ? 'Back to assessment' : screen === 'review' ? 'Back to review' : 'Back to overview'}</ActionButton></div>}
    {sheet === 'preview' && <div className="space-y-4"><ol className="list-decimal space-y-3 pl-5">{criteria.filter(item => item.section === previewSection).map(item => <li key={item.title}><div className="spatial-step-task-heading"><strong>{item.title}</strong>{spatial && 'critical' in item && <Badge variant="secondary" className="spatial-badge" data-tone="critical">Critical</Badge>}</div><p className="text-sm text-muted-foreground">{item.desc}</p></li>)}</ol><ActionButton variant="outline" className="w-full" onClick={() => setSheet(null)}>Back to overview</ActionButton></div>}
    {sheet === 'sections' && <>{spatial ? <SpatialSections draft={draft} photos={photos} onJump={jumpToCriterion} registerPreviewBack={registerSectionsPreview}/> : <nav className="section-picker" aria-label="Assessment sections">{(['Preparation', 'Frying', 'Completion'] as const).map((section, index) => {
      const items = criteria.map((item, i) => ({ ...item, index: i })).filter(item => item.section === section)
      const count = items.filter(item => draft.answers[item.index] && draft.answers[item.index] !== 'notObserved').length
      return <button key={section} className={`section-option ${c.section === section ? 'current' : ''}`} aria-current={c.section === section ? 'location' : undefined} onClick={() => jumpToSection(section)}><span className="section-number">{index + 1}</span><span className="section-copy"><strong>{section}</strong><small>{count} of {items.length} recorded{c.section === section ? ' · Current section' : ''}</small></span><ArrowRight size={17}/></button>
    })}</nav>}{!spatial && <ActionButton variant="secondary" className="action secondary" onClick={() => go('review')}>Review all <ArrowRight size={16}/></ActionButton>}</>}
    {sheet === 'finished' && <><p className="notice warn">{offline ? 'Saved on device only · no sync' : spatial ? 'Review saved on this device · not submitted' : 'Pending other configured signatures / approval'}<br/><b>Not certified yet</b></p><p className="page-sub">Discuss the results with Dre and agree on any further practice or reassessment.</p><ActionButton variant="default" className="action" onClick={() => go('list')}>Done for now</ActionButton></>}
    {sheet === 'reset' && <><ActionButton variant="default" className="action" onClick={reset}>Reset V{version}</ActionButton><ActionButton variant="outline" className="action outline" onClick={() => setSheet(null)}>Cancel</ActionButton></>}
  </div></SheetContent></Sheet>
  </div></OverlayContainerContext.Provider>
}
