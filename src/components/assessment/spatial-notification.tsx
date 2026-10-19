import { useDeviceClock } from '@/hooks/use-device-clock'
import { Bell, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Simulated phone notification: no browser permission or real push service required. */
export function SpatialNotification({ onOpen }: { onOpen: () => void }) {
  const { time, date } = useDeviceClock()
  return <div className="spatial-notification-entry">
    <div className="spatial-lock-clock"><LockKeyhole aria-hidden="true"/><p>{date}</p><span>{time}</span></div>
    <Button variant="ghost" className="spatial-push-notification" onClick={onOpen} aria-label="Open assessment for Dre Michael">
      <span className="spatial-push-app"><span><Bell aria-hidden="true"/>Learning Pool</span><small>now</small></span>
      <strong>Ready for assessment</strong>
      <span>Dre Michael is ready for the Fryer Station assessment.</span>
      <small>Tap to view assessment</small>
    </Button>
    <span className="spatial-lock-home" aria-hidden="true"/>
  </div>
}
