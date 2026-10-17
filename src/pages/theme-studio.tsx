import { useState } from 'react'
import { ArrowDownToLine, Check, Copy, Monitor, Moon, Palette as PaletteIcon, RotateCcw, Smartphone, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { TypographyEditor } from '@/components/theme/typography-editor'
import { ColorEditor } from '@/components/theme/color-editor'
import { ThemePreview } from '@/components/theme/theme-preview'
import { contrast, defaultTheme, loadTheme, loadPreviousTheme, presets, storageKey, themeCSS, type Mode, type Theme } from '@/lib/theme'

export default function ThemeStudio() {
  const [previousTheme] = useState(loadPreviousTheme)
  const [theme, setTheme] = useState(loadTheme)
  const [mode, setMode] = useState<Mode>('light')
  const [mobilePanel, setMobilePanel] = useState<'edit' | 'preview'>('preview')
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile')
  const [status, setStatus] = useState('As alterações ficam guardadas apenas neste navegador.')
  const [copied, setCopied] = useState(false)
  function updateTheme(next: Theme) {
    setTheme(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { setStatus('Armazenamento indisponível. Exporta o CSS para guardar o tema.') }
  }
  const css = themeCSS(theme)
  const palette = theme[mode]
  const pairs = [['Texto principal', palette.foreground, palette.background], ['Texto de apoio', palette['muted-foreground'], palette.background], ['Botão principal', palette['primary-foreground'], palette.primary], ['Texto dos cartões', palette['card-foreground'], palette.card], ['Sucesso',palette['success-foreground'],palette.success], ['Aviso',palette['warning-foreground'],palette.warning], ['Informação',palette['info-foreground'],palette.info]]
  async function copy() {
    try { await navigator.clipboard.writeText(css); setCopied(true) } catch { setStatus('Não foi possível copiar. Seleciona o CSS ou usa a opção de download.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([css], { type: 'text/css' }))
    const link = document.createElement('a'); link.href = url; link.download = 'theme.css'; link.click(); URL.revokeObjectURL(url)
    setStatus('CSS exportado com os modos claro e escuro.')
  }
  return <div lang="pt-PT" className="min-h-screen bg-muted/30 text-foreground">
    <header className="border-b bg-background"><nav aria-label="Design tools" className="mx-auto flex max-w-[1600px] flex-wrap gap-5 px-5 pt-3 text-sm sm:px-8"><a href="?view=design-system">Spatial Design System</a><a href="?version=5">Rosa V5 Flow</a></nav><a href="?" className="mx-auto block max-w-[1600px] px-5 pt-3 text-xs text-muted-foreground hover:text-foreground sm:px-8">← Ver avaliação</a><div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><PaletteIcon size={20}/></span><div><h1 className="text-lg font-semibold tracking-tight">Theme Studio</h1><p className="text-xs text-muted-foreground">Experimenta. Compara. Dá forma ao teu tema.</p></div></div>
      <Dialog onOpenChange={()=>setCopied(false)}><DialogTrigger asChild><Button><ArrowDownToLine/>Exportar CSS</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>O teu tema, pronto a usar</DialogTitle><DialogDescription>Inclui cores, tipografia e os dois modos. Substitui os tokens em src/styles/theme.css, mantendo os imports e o bloco @theme. O CSS exportado contém as regras de tipografia necessárias.</DialogDescription></DialogHeader><textarea readOnly aria-label="CSS do tema" value={css} className="h-72 w-full rounded-lg border bg-muted p-4 font-mono text-xs"/><div className="flex flex-wrap gap-2"><Button onClick={copy}>{copied?<Check/>:<Copy/>}{copied?'Copiado':'Copiar CSS'}</Button><Button variant="outline" onClick={download}><ArrowDownToLine/>Descarregar ficheiro</Button></div></DialogContent></Dialog>
    </div></header>
    <div role="group" aria-label="Painel do estúdio" className="sticky top-0 z-20 flex gap-2 border-b bg-background p-3 lg:hidden"><Button className="flex-1" variant={mobilePanel==='edit'?'secondary':'ghost'} aria-pressed={mobilePanel==='edit'} onClick={()=>setMobilePanel('edit')}><PaletteIcon/>Editar tema</Button><Button className="flex-1" variant={mobilePanel==='preview'?'secondary':'ghost'} aria-pressed={mobilePanel==='preview'} onClick={()=>setMobilePanel('preview')}><Monitor/>Pré-visualização</Button></div>
    <div className="mx-auto grid max-w-[1600px] items-start lg:h-[calc(100dvh-85px)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside aria-label="Editor de tema" className={`${mobilePanel==='edit'?'block':'hidden'} min-w-0 space-y-7 border-b bg-background p-5 sm:p-8 lg:block lg:h-full lg:overflow-y-auto lg:border-r lg:border-b-0`}>
        <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Ponto de partida</h2><Badge variant="outline">{presets.length} presets</Badge></div><div className="grid grid-cols-2 gap-2">{presets.map(p=><Button key={p.id} variant="outline" className="justify-start" onClick={()=>{updateTheme({...structuredClone(p.theme), typography: theme.typography});setStatus(`Preset ${p.name} aplicado aos dois modos.`)}}><span className="size-3 shrink-0 rounded-full" style={{background:p.color}}/>{p.name}</Button>)}</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Os presets substituem as cores dos dois modos e o arredondamento.</p></section>
        {previousTheme && <Button variant="outline" className="w-full" onClick={()=>{updateTheme(structuredClone(previousTheme));setStatus('Ajustes anteriores recuperados. O teu tema continua disponível nos presets.')}}>Recuperar ajustes anteriores</Button>}
        <section><h2 className="mb-3 text-sm font-semibold">Modo a editar</h2><Tabs value={mode} onValueChange={v=>setMode(v as Mode)}><TabsList className="h-auto w-full"><TabsTrigger value="light" className="flex-1"><Sun className="size-4"/>Claro</TabsTrigger><TabsTrigger value="dark" className="flex-1"><Moon className="size-4"/>Escuro</TabsTrigger></TabsList></Tabs><p className="mt-2 text-xs leading-5 text-muted-foreground">Cada modo tem as suas cores. A pré-visualização acompanha a seleção.</p></section>
        <TypographyEditor value={theme.typography} onChange={typography=>updateTheme({...theme,typography})}/>
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Arredondamento</h2><output htmlFor="radius" className="font-mono text-xs">{theme.radius} px</output></div><input id="radius" aria-label="Arredondamento" type="range" min="0" max="24" step="0.1" value={theme.radius} onChange={e=>updateTheme({...theme,radius:Number(e.target.value)})} className="min-h-11 w-full accent-primary"/><p className="text-xs text-muted-foreground">Partilhado entre os modos claro e escuro.</p></section>
        <ColorEditor palette={palette} onChange={(key,value)=>updateTheme({...theme,[mode]:{...palette,[key]:value}})} onInvalid={()=>setStatus('Usa HEX (#2563eb) ou OKLCH, por exemplo oklch(1 0 0 / 10%).')}/>
        <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="w-full"><RotateCcw/>Repor o teu tema</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Repor os dois modos?</AlertDialogTitle><AlertDialogDescription>As cores, a tipografia e o arredondamento atuais serão substituídos pelo tema criado no shadcn. Exporta o CSS primeiro se quiseres guardá-los.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={()=>{updateTheme(structuredClone(defaultTheme));setStatus('O teu tema foi reposto nos dois modos.')}}>Repor tema</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </aside>
      <main className={`${mobilePanel==='preview'?'block':'hidden'} min-w-0 space-y-6 p-5 sm:p-8 lg:block lg:h-full lg:overflow-y-auto`}>
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">O tema em ação</h2><p className="mt-1 text-sm text-muted-foreground">Componentes reais. Alterações em tempo real.</p></div><div role="group" aria-label="Tamanho da pré-visualização" className="flex gap-1 rounded-lg border bg-background p-1"><Button variant={viewport==='mobile'?'secondary':'ghost'} aria-pressed={viewport==='mobile'} onClick={()=>setViewport('mobile')}><Smartphone/>Móvel</Button><Button variant={viewport==='desktop'?'secondary':'ghost'} aria-pressed={viewport==='desktop'} onClick={()=>setViewport('desktop')}><Monitor/>Desktop</Button></div></div>
        <ThemePreview theme={theme} mode={mode} viewport={viewport}/>
        <section className="rounded-xl border bg-background p-5"><h2 className="text-sm font-semibold">Contraste de texto</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Referência WCAG AA para texto normal: 4,5:1. Estas verificações não substituem uma auditoria de acessibilidade.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{pairs.map(([label,fg,bg])=>{const ratio=contrast(fg,bg);return <div key={label} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded border text-xs" style={{color:fg,background:bg}}>Aa</span><span className="text-xs">{label}</span></div><Badge variant={ratio>=4.5?'secondary':'destructive'}>{ratio.toFixed(2)}:1 · {ratio>=4.5?'AA':'Rever'}</Badge></div>})}</div></section>
        <p role="status" aria-live="polite" className="text-xs leading-5 text-muted-foreground">{status}</p>
      </main>
    </div>
  </div>
}
