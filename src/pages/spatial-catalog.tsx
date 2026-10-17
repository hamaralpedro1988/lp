import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SpatialActionButton, SpatialChoices, SpatialEvidenceComposer, SpatialStatus, SpatialSurface } from '@/components/assessment/spatial-primitives'
import { applyTheme } from '@/lib/theme'
import { spatialTheme } from '@/data/spatial-flow'
import '@/styles/spatial-theme.css'

export default function SpatialCatalog() {
  const [answer, setAnswer] = useState('met')
  const [note, setNote] = useState('')
  const [sheet, setSheet] = useState(false)
  const overlayTrigger = useRef<HTMLElement | null>(null)
  function showSheet() { overlayTrigger.current = document.activeElement as HTMLElement; setSheet(true) }
  function showDialog() { overlayTrigger.current = document.activeElement as HTMLElement; setDialog(true) }
  function restoreFocus(event: Event) { event.preventDefault(); overlayTrigger.current?.focus() }
  const [dialog, setDialog] = useState(false)
  useEffect(() => { document.documentElement.dataset.assessmentVersion = '5'; applyTheme(spatialTheme, 'light'); return () => { delete document.documentElement.dataset.assessmentVersion } }, [])
  const colors = ['canvas', 'surface', 'ink', 'muted', 'iris', 'primary', 'selected', 'warning-bg', 'success-ink', 'fail-ink']
  return <main className="flow-v5 spatial-catalog">
    <a href="?version=5" className="spatial-catalog-back"><ArrowLeft size={18}/>Return to assessments</a>
    <header><span className="spatial-catalog-eyebrow">ROSA · V5.6 DESIGN SYSTEM</span><h1>Spatial Flow</h1><p>Reusable React/shadcn materials, controls and feedback. Lavender canvas, near-white surfaces, iris selection.</p></header>
    <SpatialSurface><CardHeader><CardTitle><h2>Semantic color roles</h2></CardTitle></CardHeader><CardContent><div className="spatial-swatches">{colors.map(color => <div key={color}><span style={{ background: `var(--spatial-${color})` }}/><strong>{color}</strong><code>--spatial-{color}</code></div>)}</div></CardContent></SpatialSurface>
    <div className="spatial-catalog-grid">
      <SpatialSurface><CardHeader><CardTitle><h2>Typography & geometry</h2></CardTitle></CardHeader><CardContent><h3 className="spatial-question-title">Check fryer readiness</h3><p className="spatial-question-description">Inter Variable · 24–29px title · 16px body · 14px secondary · 11px context.</p><p>28px surface · 18px choice · 17px composer · 15px action · 9px badge.</p><p>4 / 8 / 12 / 16 / 20 / 24 / 32px rhythm.</p></CardContent></SpatialSurface>
      <SpatialSurface><CardHeader><CardTitle><h2>Action hierarchy</h2></CardTitle></CardHeader><CardContent className="spatial-catalog-stack"><SpatialActionButton onClick={showDialog}>Primary · open dialog</SpatialActionButton><SpatialActionButton variant="outline" onClick={showSheet}>Secondary · open sheet</SpatialActionButton><SpatialActionButton variant="ghost" onClick={() => setAnswer('')}>Reset response</SpatialActionButton><SpatialActionButton disabled>Disabled action</SpatialActionButton></CardContent></SpatialSurface>
      <SpatialSurface><CardHeader><CardTitle><h2>Binary response</h2></CardTitle></CardHeader><CardContent><SpatialChoices label="Example response" value={answer} onChange={setAnswer}/></CardContent></SpatialSurface>
      <SpatialSurface><CardHeader><CardTitle><h2>Evidence composer</h2></CardTitle></CardHeader><CardContent><SpatialEvidenceComposer note={note} count={0} pending={!note.trim()} required onNote={setNote} onCamera={showSheet}/></CardContent></SpatialSurface>
      <SpatialSurface><CardHeader><CardTitle><h2>System feedback</h2></CardTitle></CardHeader><CardContent className="spatial-catalog-stack"><SpatialStatus>Draft saved on this device.</SpatialStatus><SpatialStatus tone="warning">Offline · local draft only. No server sync.</SpatialStatus><SpatialStatus tone="error">Local save unavailable. Keep this page open.</SpatialStatus><SpatialStatus tone="success">All required observations are recorded.</SpatialStatus><div className="spatial-empty-state">No attachments yet. Add a photo when it supports your observation.</div></CardContent></SpatialSurface>
      <SpatialSurface><CardHeader><CardTitle><h2>Motion & accessibility</h2></CardTitle></CardHeader><CardContent><ul><li>Press · 160ms compression</li><li>Progress · 260ms iris transition</li><li>Sheet · 280ms slide and overlay</li><li>Question · 340ms directional content entrance</li><li>Screen · 360ms subtle entrance</li></ul><p>All motion respects reduced-motion. Focus rings, radio keyboard controls and Radix focus trapping remain functional.</p></CardContent></SpatialSurface>
    </div>
    <Sheet open={sheet} onOpenChange={setSheet}><SheetContent side="bottom" onCloseAutoFocus={restoreFocus}><SheetHeader><SheetTitle>Spatial evidence sheet</SheetTitle><SheetDescription>Catalog example. The real camera and library actions are available in the assessment.</SheetDescription></SheetHeader><div className="px-5 pb-5"><SpatialActionButton variant="outline" className="w-full" onClick={() => setSheet(false)}><Camera/>Return to catalog</SpatialActionButton></div></SheetContent></Sheet>
    <Dialog open={dialog} onOpenChange={setDialog}><DialogContent onCloseAutoFocus={restoreFocus}><DialogHeader><DialogTitle>Spatial dialog</DialogTitle><DialogDescription>Elevated material and semantic tokens also apply outside the assessment root through Radix portals.</DialogDescription></DialogHeader><SpatialActionButton onClick={() => setDialog(false)}>Return to catalog</SpatialActionButton></DialogContent></Dialog>
  </main>
}
