import { useId } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/** Simulation controls stay in the existing external presenter panel. */
export function ConnectionScenario({ offline, otherOffline, onChange }: { offline: boolean; otherOffline: boolean; onChange: (offline: boolean) => void }) {
  const id = useId(), Icon = offline ? WifiOff : Wifi
  return <section className="spatial-connection-scenario" aria-labelledby={id}>
    <div className="spatial-connection-heading"><h2 id={id}>Connection scenario</h2><Badge variant="outline" id={`${id}-state`} aria-label={`Simulated connection: ${offline ? 'Offline' : 'Online'}`}><Icon aria-hidden="true"/>{offline ? 'Offline' : 'Online'}</Badge></div>
    <Button variant="outline" className="w-full" aria-describedby={`${id}-state ${id}-help`} onClick={() => onChange(!offline)}>{offline ? 'Restore connection' : 'Simulate connection loss'}</Button>
    <p id={`${id}-help`}>UX simulation only. No server sync.</p>
    {!offline && otherOffline && <p>Another offline state is still active. This control does not reconnect the device.</p>}
  </section>
}
