import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { colorTokens, quickColors, type Palette, type Token } from '@/lib/theme'

const groups = [
  { name: 'Superfícies e texto', tokens: ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 'muted', 'muted-foreground'] },
  { name: 'Ações e controlos', tokens: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring'] },
  { name: 'Sucesso, aviso e informação', tokens: ['success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground'] },
  { name: 'Gráficos', tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
  { name: 'Navegação lateral', tokens: ['sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'] },
] satisfies { name: string; tokens: Token[] }[]

export function ColorEditor({ palette, onChange, onInvalid }: { palette: Palette; onChange: (key: Token, value: string) => void; onInvalid: () => void }) {
  const [target, setTarget] = useState<Token>('primary')
  return <section className="space-y-4 border-t pt-6"><div><h2 className="text-sm font-semibold">Cores semânticas</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{colorTokens.length} cores por modo. Usa uma sugestão, o seletor de cor ou um HEX personalizado.</p></div>
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3"><label id="quick-label" htmlFor="quick-target" className="text-xs font-medium">Aplicar cor rápida a</label><Select value={target} onValueChange={value => setTarget(value as Token)}><SelectTrigger id="quick-target" aria-labelledby="quick-label" className="w-full"><SelectValue/></SelectTrigger><SelectContent>{colorTokens.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select><div className="grid grid-cols-5 gap-1">{quickColors.map(color => <button key={color} type="button" title={color} aria-label={`Aplicar ${color}`} aria-pressed={palette[target].toLowerCase() === color} onClick={() => onChange(target, color)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-transparent hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-ring"><span className="size-7 rounded-full border shadow-sm" style={{ background: color }}/></button>)}</div></div>
    {groups.map((group, index) => <details key={group.name} open={index < 2} className="group rounded-lg border"><summary className="min-h-11 cursor-pointer px-3 py-3 text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring">{group.name} <span className="text-muted-foreground">({group.tokens.length})</span></summary><div className="space-y-4 border-t p-3">{group.tokens.map(key => { const label = colorTokens.find(([token]) => token === key)![1]; return <div key={key}><label htmlFor={`hex-${key}`} className="mb-1.5 block text-xs font-medium">{label}</label><div className="flex items-center gap-2"><input type="color" aria-label={`Escolher cor: ${label}`} value={palette[key]} onChange={event => onChange(key, event.target.value)} className="size-11 shrink-0 cursor-pointer rounded-md border bg-background p-1"/><Input key={`${key}-${palette[key]}`} id={`hex-${key}`} aria-label={`Hex: ${label}`} defaultValue={palette[key]} maxLength={7} className="font-mono text-xs" onBlur={event => { const value = event.target.value; if (/^#[\da-f]{6}$/i.test(value)) onChange(key, value); else { event.target.value = palette[key]; onInvalid() } }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}/></div></div> })}</div></details>)}
  </section>
}
