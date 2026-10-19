import { useEffect, useId, useRef, useState } from 'react'
import { BellOff, Clock3, MessageCircle, Save } from 'lucide-react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SpatialSurface } from './spatial-primitives'

/** Web prototype only: the switch previews DND without claiming to change Android settings. */
export function SpatialBeforeStart() {
  const id = useId()
  const [quietPreview, setQuietPreview] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function preview(enabled: boolean) {
    setQuietPreview(enabled)
    setMessage(enabled ? 'Do Not Disturb preview enabled. Phone settings haven’t changed.' : 'Do Not Disturb preview off. Phone settings haven’t changed.')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 6000)
  }
  const items = [
    { Icon: Clock3, title: 'Session can take about 15 minutes', description: 'Allow time to observe Dre at work' },
    { Icon: BellOff, title: 'Avoid interruptions', description: 'Turn on Do Not Disturb', toggle: true },
    { Icon: Save, title: 'Progress saves automatically', description: 'Saved on this device. Photos stay in this session.' },
    { Icon: MessageCircle, title: 'Assess together', description: 'Explain the process first' },
  ]
  return <>
    <SpatialSurface className="overview-card overview-sections spatial-before-start"><CardHeader><CardTitle><h2>Before you start</h2></CardTitle></CardHeader><CardContent><ul>{items.map(({ Icon, title, description, toggle }, index) => <li key={title}>{index > 0 && <Separator/>}<div className="spatial-before-start-row"><span className="overview-goal-icon" aria-hidden="true"><Icon/></span><span className="overview-section-copy">{toggle ? <label htmlFor={id}>{title}</label> : <span>{title}</span>}<small id={toggle ? id + '-description' : undefined}>{description}</small></span>{toggle && <SwitchPrimitive.Root id={id} className="spatial-dnd-switch" checked={quietPreview} onCheckedChange={preview} aria-label="Preview Do Not Disturb" aria-describedby={id + '-description'}><SwitchPrimitive.Thumb className="spatial-dnd-thumb"/></SwitchPrimitive.Root>}</div></li>)}</ul></CardContent></SpatialSurface>
    <div className="spatial-android-toast" role="status" aria-live="polite" aria-atomic="true" data-visible={!!message}>{message && <><BellOff aria-hidden="true"/><span>{message}</span></>}</div>
  </>
}
