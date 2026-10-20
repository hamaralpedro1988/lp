import { spatialActiveIndex, spatialChecklistItem } from '@/data/spatial-checklist'
import { SpatialTaskPreviewContent } from './spatial-assessment-preview'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { useDeviceClock } from '@/hooks/use-device-clock'
import dreAvatar from '@/assets/dre-jackson.png'
import { SpatialCriterionGuidance } from './spatial-guidance'
import { useSpatialSwipe } from '@/hooks/use-spatial-swipe'
import type { SwipeDirection } from '@/lib/spatial-swipe'
import { useId, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode, type Ref, type RefObject } from 'react'
import { Camera, Check, ChevronLeft, ChevronRight, LayoutGrid, X, Eye, PencilLine, CircleDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { flowCriteria, type FlowDraft, type FlowAnswer } from '@/data/flow-draft'
import { spatialCompleteIndices, spatialOptions, spatialEvidenceRequirement, spatialEvidenceSatisfied, spatialEvidenceMessage, spatialNavigationBlock, type SpatialEvidenceRequirement } from '@/data/spatial-flow'

/** All primitives consume semantic tokens; brand aliases live in spatial-theme.css. */
export function SpatialSurface({ className, elevation = 'raised', ...props }: ComponentProps<typeof Card> & { elevation?: 'raised' | 'quiet' }) {
  return <Card data-elevation={elevation} className={cn('spatial-surface', className)} {...props}/>
}
export function SpatialActionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn('spatial-action', className)} {...props}/>
}
export function SpatialStatus({ children, tone = 'neutral', className, ...props }: ComponentProps<'p'> & { tone?: 'neutral' | 'warning' | 'success' | 'error' }) {
  return <p className={cn('spatial-status', className)} data-tone={tone} role={tone === 'error' ? 'alert' : tone === 'neutral' ? undefined : 'status'} {...props}>{children}</p>
}
/** Decorative preview chrome is automatic only on desktop, never on a native phone. */
export function SpatialSystemChrome({ mode = 'auto' }: { mode?: 'auto' | 'preview' | 'native' }) {
  const { time } = useDeviceClock()
  return <div className="spatial-system-chrome" data-mode={mode} aria-hidden="true"><span>{time}</span><div>
    <svg viewBox="0 0 20 15" width="20" height="15" fill="currentColor"><path d="M1 12h3v3H1zM6 9h3v6H6zM11 5h3v10h-3zM16 1h3v14h-3z"/></svg>
    <svg viewBox="0 0 18 15" width="18" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5a11 11 0 0 1 14 0M5 8a7 7 0 0 1 8 0M8.2 11.5a2 2 0 0 1 1.6 0"/></svg>
    <svg viewBox="0 0 29 15" width="29" height="15"><rect x="1" y="1" width="24" height="13" rx="3.5" fill="none" stroke="currentColor" strokeOpacity=".65" strokeWidth="1.5"/><rect x="3.5" y="3.5" width="19" height="8" rx="1.8" fill="currentColor"/><rect x="26.5" y="5" width="2" height="5" rx="1" fill="currentColor" opacity=".65"/></svg>
  </div></div>
}
export function SpatialProgress({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const completed = spatialCompleteIndices(draft, photos)
  return <div className="spatial-top-progress"><div className="spatial-progress" role="progressbar" aria-label="Tasks complete" aria-valuemin={0} aria-valuemax={flowCriteria.length} aria-valuenow={completed.length} aria-valuetext={`${completed.length} of ${flowCriteria.length} tasks complete, including required evidence`}>
    <span aria-hidden="true" style={{ width: `${completed.length / flowCriteria.length * 100}%` }}/>
  </div></div>
}
/** Shared navigation chrome for every participant screen; progress is a contextual content. */
export function SpatialFlowHeader({ title, onBack, backLabel, end, subtitle, children, label = 'Assessment navigation' }: { title: string; onBack?: () => void; backLabel?: string; end?: ReactNode; subtitle?: string; children?: ReactNode; label?: string }) {
  return <header className="spatial-header" aria-label={label}>
    <div className="spatial-header-top">{onBack && <SpatialActionButton variant="outline" size="icon" className="spatial-header-back" onClick={onBack} aria-label={backLabel ?? 'Back'}><ChevronLeft aria-hidden="true"/></SpatialActionButton>}<div className="spatial-header-copy"><h1 className="assessment-name">{title}</h1>{subtitle && <p className="spatial-header-subtitle">{subtitle}</p>}</div>{end}</div>
    {children}
  </header>
}
export function SpatialAssessmentHeader({ draft, photos, saveError, onBack, onMember }: { draft: FlowDraft; photos: Record<number, number>; saveError: boolean; onBack: () => void; onMember: () => void }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  return <><SpatialProgress draft={draft} photos={photos}/><SpatialFlowHeader title="Fryer Station" subtitle="Food Process & Safety" onBack={onBack} backLabel="Back to overview" label="Assessment progress" end={<SpatialActionButton variant="outline" size="icon" className="spatial-person" onClick={onMember} aria-label="View team member Dre Michael" aria-haspopup="dialog">{photoFailed ? <span aria-hidden="true">DM</span> : <img src={dreAvatar} alt="" width={32} height={32} onError={() => setPhotoFailed(true)}/>}</SpatialActionButton>}>
    {saveError ? <SpatialStatus tone="error">Unable to save on this device. Keep this page open.</SpatialStatus> : draft.offline && <SpatialStatus tone="warning">Offline · draft saved on this device only.</SpatialStatus>}
  </SpatialFlowHeader></>
}
export function SpatialChoice({ value, title, description, selected, disabled = false }: { value: 'met' | 'fail'; title: string; description: string; selected: boolean; disabled?: boolean }) {
  const id = useId()
  return <label className="spatial-choice" data-disabled={disabled || undefined} data-outcome={value} data-selected={selected} htmlFor={id}>
    <span className="spatial-choice-symbol" aria-hidden="true">{value === 'met' ? <Check/> : <X/>}</span>
    <span className="spatial-choice-copy"><strong>{title}</strong><small id={`${id}-description`}>{description}</small></span>
    <RadioGroupItem id={id} disabled={disabled} value={value} aria-label={title} aria-describedby={`${id}-description`} className="spatial-radio"/>
  </label>
}
/** Explicit roving selection keeps Radix radio behavior consistent on touch browsers. */
export function SpatialChoices({ value, onChange, label = 'Observation result', disabled = false, labelledBy, describedBy }: { value: string; onChange: (value: 'met' | 'fail') => void; label?: string; disabled?: boolean; labelledBy?: string; describedBy?: string }) {
  return <RadioGroup disabled={disabled} className="spatial-choices" aria-required="true" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-label={labelledBy ? undefined : label} value={value} onValueChange={next => { if (next === 'met' || next === 'fail') onChange(next) }} onKeyDownCapture={event => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    const current = spatialOptions.findIndex(option => option.value === (event.target as HTMLButtonElement).value)
    if (current < 0) return
    event.preventDefault(); event.stopPropagation()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (current + 1) % 2
    onChange(spatialOptions[next].value);
    (event.currentTarget.querySelectorAll('[role="radio"]')[next] as HTMLButtonElement)?.focus()
  }}>{spatialOptions.map(option => <SpatialChoice disabled={disabled} key={option.value} {...option} selected={value === option.value}/>)}</RadioGroup>
}
export function SpatialEvidenceComposer({ note, count, requirement, onNote, onCamera, galleryRef }: { note: string; count: number; requirement: SpatialEvidenceRequirement; onNote: (value: string) => void; onCamera: () => void; galleryRef?: Ref<HTMLDivElement> }) {
  const id = useId()
  const pending = !spatialEvidenceSatisfied(requirement, note, count)
  const showHelp = requirement !== 'none' || count > 0
  return <section className="spatial-evidence" aria-label="Observation evidence">
    <div className="spatial-composer" data-required={pending || undefined} data-help={showHelp || undefined}>
      <Textarea id={`${id}-comment`} aria-label="Comment" aria-required={requirement === 'comment' || requirement === 'comment-and-photo'} aria-invalid={pending && (requirement === 'comment' || requirement === 'comment-and-photo') && !note.trim() || undefined} aria-describedby={`${id}-visibility${showHelp ? ` ${id}-help` : ''}`} placeholder="Add a comment..." value={note} onChange={event => onNote(event.target.value)} onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' })}/>
      <SpatialActionButton variant="outline" size="icon" className="spatial-camera" data-attached={count > 0 || undefined} onClick={onCamera} aria-label={count ? 'Add another photo' : 'Add photo'} aria-describedby={showHelp ? `${id}-help` : undefined}><Camera aria-hidden="true"/>{count > 0 && <span className="spatial-camera-dot" aria-hidden="true"/>}</SpatialActionButton>
      {showHelp && <span id={`${id}-help`} className="spatial-composer-help" role="status">{spatialEvidenceMessage(requirement, note, count)}</span>}
    </div>
    <p id={`${id}-visibility`} className="spatial-comment-visibility">Visible to Dre and other authorised users</p>
    <div className="flow-gallery spatial-attachments" ref={galleryRef}/>
  </section>
}
export function SpatialTaskHeading({ index, titleRef, titleId, completed }: { index: number; titleRef?: Ref<HTMLHeadingElement>; titleId?: string; completed?: number }) {
  const criterion = flowCriteria[index]
  return <><div className="spatial-criterion-context"><div className="spatial-badges"><Badge className="spatial-badge" variant="secondary">{criterion.section}</Badge>{'critical' in criterion && <Badge className="spatial-badge" data-tone="critical" variant="secondary">Critical</Badge>}</div><span className="spatial-position">Task {index + 1} of {flowCriteria.length}</span></div>
      <h2 id={titleId} className="spatial-question-title" aria-label={`Task ${index + 1} of ${flowCriteria.length}, ${criterion.section}. ${criterion.title}${completed === undefined ? '' : `. ${completed} of ${flowCriteria.length} tasks complete`}`} ref={titleRef} tabIndex={-1}>{criterion.title}</h2><p className="spatial-question-description">{criterion.desc}</p></>
}
export function SpatialLiveCard({ draft, photos, direction, titleRef, onAnswer, onNote, onCamera, galleryRef, onNavigate, navigationRef, swipeEnabled = true }: { draft: FlowDraft; photos: Record<number, number>; direction: 'next' | 'back'; titleRef: Ref<HTMLHeadingElement>; onAnswer: (value: FlowAnswer) => void; onNote: (value: string) => void; onCamera: () => void; galleryRef: Ref<HTMLDivElement>; onNavigate?: (direction: SwipeDirection) => void; swipeEnabled?: boolean; navigationRef?: RefObject<((direction: SwipeDirection) => void) | null> }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const evidenceKey = `${draft.index}:${draft.answers[draft.index]}:${draft.notes[draft.index]}:${photos[draft.index]}`
  const [notice, setNotice] = useState({ key: '', message: '' })
  const feedback = notice.key === evidenceKey ? notice.message : ''
  const requestNavigation = useSpatialSwipe(cardRef, { criterion: draft.index, enabled: swipeEnabled && !!onNavigate, block: direction => spatialNavigationBlock(draft, photos, direction), navigate: direction => onNavigate?.(direction), announce: message => setNotice({ key: evidenceKey, message }) })
  useLayoutEffect(() => {
    if (!navigationRef) return
    navigationRef.current = requestNavigation
    return () => { navigationRef.current = null }
  }, [navigationRef, requestNavigation])
  const requirement = spatialEvidenceRequirement(draft.index)
  const validationId = useId()
  const reason = spatialNavigationBlock(draft, photos, 'next')
  useLayoutEffect(() => { cardRef.current?.scrollTo({ top: 0 }) }, [draft.index])
  return <><SpatialSurface className="spatial-live-card" ref={cardRef} aria-label="Current task" aria-describedby="spatial-swipe-help">
    <span id="spatial-swipe-help" className="sr-only">Swipe left for next or right for previous. Back, All tasks and Next/Finish buttons are also available.</span>
    <div className="spatial-question-body" key={draft.index} data-direction={direction}>
      {draft.index !== spatialActiveIndex(draft) && <p className="spatial-reviewing-sequence">Reviewing task {draft.index + 1}. Current assessment: task {spatialActiveIndex(draft) + 1}.</p>}
      <SpatialTaskHeading index={draft.index} titleRef={titleRef} titleId="live-question-title" completed={spatialCompleteIndices(draft, photos).length}/>
      <SpatialChoices value={draft.answers[draft.index] ?? ''} onChange={onAnswer} labelledBy="live-question-title" describedBy={reason ? validationId : undefined}/><p id={validationId} className="spatial-validation" data-visual={false} role="status" aria-live="polite" aria-atomic="true">{reason ?? 'Response recorded. You can continue.'}</p>
    </div>
    <SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={photos[draft.index] ?? 0} requirement={requirement} onNote={onNote} onCamera={onCamera} galleryRef={galleryRef}/>
    <SpatialCriterionGuidance key={`guidance-${draft.index}`} index={draft.index}/>
  </SpatialSurface><div className="spatial-swipe-feedback" role="status" aria-live="polite" aria-atomic="true" data-visible={!!feedback}>{feedback}</div></>
}
export function SpatialNavigation({ index, reviewing = false, canContinue, sectionsRef, onBack, onSections, onNext }: { index: number; reviewing?: boolean; canContinue: boolean; sectionsRef: Ref<HTMLButtonElement>; onBack: () => void; onSections: () => void; onNext: () => void }) {
  return <nav className="spatial-navigation" aria-label="Task navigation">
    <SpatialActionButton variant="outline" disabled={index === 0} aria-label="Previous task" onClick={onBack}>Back</SpatialActionButton>
    <SpatialActionButton variant="outline" className="spatial-sections-trigger" ref={sectionsRef} aria-label="All tasks" title="All tasks" aria-haspopup="dialog" onClick={onSections}><LayoutGrid aria-hidden="true"/></SpatialActionButton>
    <SpatialActionButton disabled={!canContinue} onClick={onNext} aria-label={reviewing ? 'Return to current task' : index === flowCriteria.length - 1 ? 'Finish checklist' : undefined}>{reviewing ? 'Return to current task' : index === flowCriteria.length - 1 ? 'Finish' : <>Next<ChevronRight size={18} aria-hidden="true"/></>}</SpatialActionButton>
  </nav>
}
export function SpatialSections({ draft, photos, onJump, registerPreviewBack }: { draft: FlowDraft; photos: Record<number, number>; onJump: (index: number) => void; registerPreviewBack?: (back: (() => boolean) | null) => void }) {
  const completed = spatialCompleteIndices(draft, photos)
  const [preview, setPreview] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const previous = useRef<{ index: number; scroll: number } | null>(null)
  useMobileOverlay(preview !== null, () => { setPreview(null); return true })
  useLayoutEffect(() => {
    registerPreviewBack?.(preview === null ? null : () => { setPreview(null); return true })
    return () => registerPreviewBack?.(null)
  }, [preview, registerPreviewBack])
  useLayoutEffect(() => {
    const scroll = root.current?.parentElement
    if (preview !== null) { scroll?.scrollTo({ top: 0 }); heading.current?.focus({ preventScroll: true }) }
    else if (previous.current) {
      scroll?.scrollTo({ top: previous.current.scroll })
      root.current?.querySelector<HTMLButtonElement>(`[data-task-index="${previous.current.index}"]`)?.focus({ preventScroll: true })
    }
  }, [preview])
  return <div ref={root}>{preview !== null ? <section className="spatial-checklist-preview" aria-label="Task preview">
    <SpatialActionButton variant="outline" onClick={() => setPreview(null)}>Back to checklist</SpatialActionButton>
    <p className="spatial-comment-visibility">Preview only · Your current task and progress will not change.</p>
    <SpatialTaskPreviewContent index={preview} titleRef={heading}/>
  </section> : <nav className="spatial-section-list" aria-label="All assessment tasks">
    {(['Preparation', 'Frying', 'Completion'] as const).map(section => {
      const items = flowCriteria.map((criterion, index) => ({ ...criterion, index })).filter(item => item.section === section)
      return <section key={section}><h3>{section}<span>{items.filter(item => completed.includes(item.index)).length} of {items.length} complete</span></h3>
        {items.map(item => {
          const state = spatialChecklistItem(draft, photos, item.index)
          const current = item.index === spatialActiveIndex(draft)
          const status = current ? `Current task${state.complete ? ' · Complete' : ''}` : state.complete ? 'Complete' : state.kind === 'recorded' ? (draft.answers[item.index] === 'met' || draft.answers[item.index] === 'fail' ? 'Evidence needed · Review' : 'Response needed · Review') : 'Upcoming · Preview only'
          const action = state.previewOnly ? 'Preview task' : current ? 'Continue assessment' : 'Review or edit task'
          const Icon = state.previewOnly ? Eye : current ? ChevronRight : PencilLine
          return <SpatialActionButton key={item.index} variant="ghost" className="spatial-criterion-link" data-task-index={item.index} data-current={current || undefined} onClick={() => {
            if (state.previewOnly) { previous.current = { index: item.index, scroll: root.current?.parentElement?.scrollTop ?? 0 }; setPreview(item.index) }
            else onJump(item.index)
          }} aria-current={current ? 'step' : undefined}>
            <span className="spatial-criterion-number" data-complete={state.complete || undefined}>{state.complete ? <Check aria-hidden="true"/> : current ? <CircleDot aria-hidden="true"/> : item.index + 1}</span>
            <span><strong>{item.title}</strong><small>{status}{'critical' in item ? ' · Critical' : ''}</small><span className="sr-only">{action}</span></span><Icon aria-hidden="true"/>
          </SpatialActionButton>
        })}
      </section>
    })}
  </nav>}</div>
}
