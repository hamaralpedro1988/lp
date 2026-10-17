import { useId, useLayoutEffect, useRef, type ComponentProps, type ReactNode, type Ref } from 'react'
import { ArrowRight, Camera, Check, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { flowCriteria, type FlowDraft, type FlowAnswer } from '@/data/flow-draft'
import { spatialCompleteIndices, spatialOptions, spatialEvidenceRequirement, spatialEvidenceSatisfied, spatialEvidenceMessage, spatialEvidenceOk, type SpatialEvidenceRequirement } from '@/data/spatial-flow'

/** All primitives consume semantic tokens; brand aliases live in spatial-theme.css. */
export function SpatialSurface({ className, elevation = 'raised', ...props }: ComponentProps<typeof Card> & { elevation?: 'raised' | 'quiet' }) {
  return <Card data-elevation={elevation} className={cn('spatial-surface', className)} {...props}/>
}
export function SpatialActionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn('spatial-action', className)} {...props}/>
}
export function SpatialStatus({ children, tone = 'neutral', className, ...props }: ComponentProps<'p'> & { tone?: 'neutral' | 'warning' | 'success' | 'error' }) {
  return <p className={cn('spatial-status', className)} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'} {...props}>{children}</p>
}
export function SpatialProgress({ draft, photos }: { draft: FlowDraft; photos: Record<number, number> }) {
  const completed = spatialCompleteIndices(draft, photos)
  return <div className="spatial-segments" role="progressbar" aria-label="Criteria complete" aria-valuemin={0} aria-valuemax={flowCriteria.length} aria-valuenow={completed.length} aria-valuetext={`${completed.length} of ${flowCriteria.length} criteria complete, including required evidence`}>
    {flowCriteria.map((criterion, index) => <span key={criterion.title} aria-hidden="true" data-state={completed.includes(index) ? 'complete' : 'pending'}/>)}
  </div>
}
/** Shared navigation chrome for every participant screen; progress is a contextual subrow. */
export function SpatialFlowHeader({ title, onBack, backLabel, end, children, label = 'Assessment navigation' }: { title: string; onBack?: () => void; backLabel?: string; end?: ReactNode; children?: ReactNode; label?: string }) {
  return <header className="spatial-header" aria-label={label}>
    <div className="spatial-header-top">{onBack && <SpatialActionButton variant="outline" size="icon" className="spatial-header-back" onClick={onBack} aria-label={backLabel ?? 'Back'}><ChevronLeft aria-hidden="true"/></SpatialActionButton>}<h1 className="assessment-name">{title}</h1>{end}</div>
    {children}
  </header>
}
export function SpatialAssessmentHeader({ draft, photos, saveError, onBack }: { draft: FlowDraft; photos: Record<number, number>; saveError: boolean; onBack: () => void }) {
  return <SpatialFlowHeader title="Fryer Station" onBack={onBack} backLabel="Back to overview" label="Assessment progress" end={<span className="spatial-person"><span aria-hidden="true">DR</span>Dre</span>}>
    <SpatialProgress draft={draft} photos={photos}/>
    {saveError ? <SpatialStatus tone="error">Unable to save on this device. Keep this page open.</SpatialStatus> : draft.offline && <SpatialStatus tone="warning">Offline · draft saved on this device only.</SpatialStatus>}
  </SpatialFlowHeader>
}
export function SpatialChoice({ value, title, description, selected, disabled = false }: { value: 'met' | 'fail'; title: string; description: string; selected: boolean; disabled?: boolean }) {
  const id = useId()
  return <label className="spatial-choice" data-disabled={disabled || undefined} data-outcome={value} data-selected={selected} htmlFor={id}>
    <RadioGroupItem id={id} disabled={disabled} value={value} aria-label={title} className="spatial-radio"/>
    <span className="spatial-choice-copy"><strong>{title}</strong><small>{description}</small></span>
    <Check className="spatial-choice-confirm" aria-hidden="true"/>
  </label>
}
/** Explicit roving selection keeps Radix radio behavior consistent on touch browsers. */
export function SpatialChoices({ value, onChange, label = 'Observation result', disabled = false }: { value: string; onChange: (value: 'met' | 'fail') => void; label?: string; disabled?: boolean }) {
  return <RadioGroup disabled={disabled} className="spatial-choices" aria-label={label} value={value} onValueChange={next => { if (next === 'met' || next === 'fail') onChange(next) }} onKeyDownCapture={event => {
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
  return <section className="spatial-evidence" aria-label="Observation evidence">
    <div className="spatial-composer" data-required={pending || undefined}>
      <Textarea id={`${id}-comment`} aria-label="Comment" aria-describedby={`${id}-help`} placeholder="Add a comment…" value={note} onChange={event => onNote(event.target.value)} onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' })}/>
      <div className="spatial-composer-bottom"><span id={`${id}-help`} className="spatial-composer-help" role="status">{spatialEvidenceMessage(requirement, note, count)}</span>
        <SpatialActionButton variant="outline" size="icon" className="spatial-camera" data-attached={count > 0 || undefined} onClick={onCamera} aria-label={count ? 'Add another photo' : 'Add photo'} aria-describedby={`${id}-help`}><Camera aria-hidden="true"/>{count > 0 && <span className="spatial-camera-dot" aria-hidden="true"/>}</SpatialActionButton>
      </div>
    </div>
    <div className="flow-gallery spatial-attachments" ref={galleryRef}/>
  </section>
}
export function SpatialLiveCard({ draft, photos, direction, titleRef, onAnswer, onNote, onCamera, galleryRef }: { draft: FlowDraft; photos: Record<number, number>; direction: 'next' | 'back'; titleRef: Ref<HTMLHeadingElement>; onAnswer: (value: FlowAnswer) => void; onNote: (value: string) => void; onCamera: () => void; galleryRef: Ref<HTMLDivElement> }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const criterion = flowCriteria[draft.index]
  const requirement = spatialEvidenceRequirement(draft.index)
  useLayoutEffect(() => { cardRef.current?.scrollTo({ top: 0 }) }, [draft.index])
  return <SpatialSurface className="spatial-live-card" ref={cardRef} aria-label="Current criterion">
    <div className="spatial-question-body" key={draft.index} data-direction={direction}>
      <div className="spatial-criterion-context"><div className="spatial-badges"><Badge className="spatial-badge" variant="secondary">{criterion.section}</Badge>{'critical' in criterion && <Badge className="spatial-badge" data-tone="critical" variant="secondary">◆ Critical</Badge>}</div><span className="spatial-position">{String(draft.index + 1).padStart(2, '0')} / {String(flowCriteria.length).padStart(2, '0')}</span></div>
      <h2 id="live-question-title" className="spatial-question-title" ref={titleRef} tabIndex={-1}>{criterion.title}</h2><p className="spatial-question-description">{criterion.desc}</p>
      <SpatialChoices value={draft.answers[draft.index] ?? ''} onChange={onAnswer}/>
    </div>
    <SpatialEvidenceComposer note={draft.notes[draft.index] ?? ''} count={photos[draft.index] ?? 0} requirement={requirement} onNote={onNote} onCamera={onCamera} galleryRef={galleryRef}/>
  </SpatialSurface>
}
export function SpatialNavigation({ index, canContinue, sectionsRef, onBack, onSections, onNext }: { index: number; canContinue: boolean; sectionsRef: Ref<HTMLButtonElement>; onBack: () => void; onSections: () => void; onNext: () => void }) {
  return <nav className="spatial-navigation" aria-label="Criterion navigation">
    <SpatialActionButton variant="outline" disabled={index === 0} aria-label="Previous criterion" onClick={onBack}><ChevronLeft aria-hidden="true"/>Back</SpatialActionButton>
    <SpatialActionButton variant="outline" className="spatial-sections-trigger" ref={sectionsRef} aria-label="Sections" title="Sections" aria-haspopup="dialog" onClick={onSections}><LayoutGrid aria-hidden="true"/></SpatialActionButton>
    <SpatialActionButton disabled={!canContinue} onClick={onNext}>{index === flowCriteria.length - 1 ? 'Review' : 'Next'}<ArrowRight aria-hidden="true"/></SpatialActionButton>
  </nav>
}
export function SpatialSections({ draft, photos, onJump }: { draft: FlowDraft; photos: Record<number, number>; onJump: (index: number) => void }) {
  const completed = spatialCompleteIndices(draft, photos)
  return <nav className="spatial-section-list" aria-label="All assessment criteria">
    {(['Preparation', 'Frying', 'Completion'] as const).map(section => {
      const items = flowCriteria.map((criterion, index) => ({ ...criterion, index })).filter(item => item.section === section)
      return <section key={section}><h3>{section}<span>{items.filter(item => completed.includes(item.index)).length} / {items.length} complete</span></h3>
        {items.map(item => {
          const done = completed.includes(item.index)
          const status = done ? 'Complete' : !draft.answers[item.index] || draft.answers[item.index] === 'notObserved' ? 'Not recorded' : !spatialEvidenceOk(draft, item.index, photos) ? 'Evidence needed' : 'Not recorded'
          return <SpatialActionButton key={item.index} variant="ghost" className="spatial-criterion-link" data-current={draft.index === item.index || undefined} onClick={() => onJump(item.index)} aria-current={draft.index === item.index ? 'step' : undefined}>
            <span className="spatial-criterion-number" data-complete={done || undefined}>{done ? <Check aria-hidden="true"/> : item.index + 1}</span>
            <span><strong>{item.title}</strong><small>{draft.index === item.index ? 'Current · ' : ''}{status}{'critical' in item ? ' · Critical' : ''}</small></span><ChevronRight aria-hidden="true"/>
          </SpatialActionButton>
        })}
      </section>
    })}
  </nav>
}
