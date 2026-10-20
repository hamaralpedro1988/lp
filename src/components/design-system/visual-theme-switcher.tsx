import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { resolveVisualTheme, type VisualTheme } from '@/hooks/use-visual-theme'
export function VisualThemeSwitcher({ value, onChange }: { value: VisualTheme; onChange: (value: VisualTheme) => void }) {
  const id = useId()
  return <div className="spatial-brand-switcher"><label htmlFor={id}>Visual theme</label><Select value={value} onValueChange={value => onChange(resolveVisualTheme(value))}><SelectTrigger id={id} aria-label="Visual theme"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="spatial">Spatial</SelectItem><SelectItem value="fluid">Fluid</SelectItem></SelectContent></Select></div>
}
