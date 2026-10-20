import { useLayoutEffect, useRef, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, Eye, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { flowCriteria } from '@/data/flow-draft'
import { spatialEvidenceRequirement } from '@/data/spatial-flow'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'
import { SpatialActionButton, SpatialTaskHeading } from './spatial-primitives'
import { SpatialCriterionGuidance } from './spatial-guidance'

/** Read-only task browsing. Deliberately receives no draft or mutation callbacks. */
export function SpatialAssessmentPreview() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const requirement = spatialEvidenceRequirement(index)
  const photoRequired = requirement === 'photo' || requirement === 'comment-and-photo'
  const commentRequired = requirement === 'comment' || requirement === 'comment-and-photo'
  useMobileOverlay(open, () => { setOpen(false); return true })
  useLayoutEffect(() => {
    if (!open) return
    body.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [index, open])
  return <Sheet open={open} onOpenChange={next => { if (next) setIndex(0); setOpen(next) }}>
    <SheetTrigger asChild><SpatialActionButton variant="outline" className="spatial-preview-entry"><Eye aria-hidden="true"/>Preview assessment<ChevronRight aria-hidden="true"/></SpatialActionButton></SheetTrigger>
    <SheetContent side="bottom" className="mobile-sheet flow-sheet spatial-assessment-preview mx-auto" onOpenAutoFocus={event => { event.preventDefault(); heading.current?.focus({ preventScroll: true }) }}>
      <SheetHeader><SheetTitle>Assessment preview</SheetTitle><SheetDescription>Explore the tasks before you start. Your assessment progress will not change.</SheetDescription></SheetHeader>
      <div ref={body} className="spatial-assessment-preview-body">
        <SpatialTaskHeading index={index} titleRef={heading}/>
        <section className="spatial-preview-requirements" aria-label="Evidence requirements">
          <h3>Evidence</h3><div className="spatial-preview-evidence-tags">
            <Badge variant="secondary" className="spatial-badge" data-required={photoRequired || undefined}><Camera aria-hidden="true"/>{photoRequired ? 'Photo required' : 'Photo optional'}</Badge>
            <Badge variant="secondary" className="spatial-badge" data-required={commentRequired || undefined}><MessageCircle aria-hidden="true"/>{commentRequired ? 'Comment required' : 'Comment optional'}</Badge>
          </div>
        </section>
        <SpatialCriterionGuidance key={index} index={index} presentation="button" returnLabel="Back to preview"/>
      </div>
      <nav className="spatial-assessment-preview-actions" aria-label="Preview task navigation">
        <SpatialActionButton variant="outline" disabled={index === 0} onClick={() => setIndex(value => Math.max(0, value - 1))}><ChevronLeft aria-hidden="true"/>Previous</SpatialActionButton>
        {index < flowCriteria.length - 1 ? <SpatialActionButton onClick={() => setIndex(value => Math.min(flowCriteria.length - 1, value + 1))}>Next task<ChevronRight aria-hidden="true"/></SpatialActionButton> : <SpatialActionButton onClick={() => setOpen(false)}>Back to overview</SpatialActionButton>}
      </nav>
      <span className="sr-only" role="status" aria-live="polite">Preview task {index + 1} of {flowCriteria.length}</span>
    </SheetContent>
  </Sheet>
}
