import { useSpatialBrand } from '@/hooks/use-spatial-brand'
import { SpatialBrandStyles, SpatialBrandSwitcher } from '@/components/design-system/brand-switcher'
import { brandTokenDeclarations } from '@/data/spatial-brands'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, Check, Copy, Download, Layers, Search } from 'lucide-react'
import { PlaygroundLayout } from '@/components/layout/playground-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CorePreview } from '@/components/design-system/core-preview'
import { RosaPreview } from '@/components/design-system/rosa-preview'
import { SpatialStatus, SpatialSurface } from '@/components/assessment/spatial-primitives'
import { coreComponents, componentCode, parseSpatialTokens, sourceURL } from '@/data/design-system/catalog'
import { rosaPatterns, rosaExample } from '@/data/design-system/rosa-patterns'
import { spatialTheme } from '@/data/spatial-flow'
import { applyTheme, presets } from '@/lib/theme'
import spatialCSS from '@/styles/spatial-theme.css?raw'
import '@/styles/flow.css'
import '@/styles/spatial-theme.css'
import '@/styles/design-system.css'

type Area = 'foundations' | 'components' | 'rosa' | 'guidelines'
const areas = [['foundations','Foundations'],['components','Core UI Components'],['rosa','Rosa Flow Components'],['guidelines','Usage & theming']] as const
const tokens = parseSpatialTokens(spatialCSS)
const neutral = presets.find(preset => preset.id === 'neutral')!.theme
const neutralStyle = Object.fromEntries(Object.entries(neutral.light).map(([key,value]) => [`--${key}`,value])) as CSSProperties

function Code({ text }: { text: string }) { return <pre className="ds-code"><code>{text}</code></pre> }
function Reference({ path }: { path: string }) { return <a className="ds-source" href={sourceURL(path)} target="_blank" rel="noreferrer">View component source <ArrowRight size={14}/></a> }
function Comparison() {
  const [clicked,setClicked] = useState<Record<string,boolean>>({})
  return <div className="ds-comparison">{[{name:'Neutral / Original',style:neutralStyle},{name:'Spatial V5.6',style:undefined}].map(({name,style}) => <div key={name} style={style} className="ds-comparison-pane"><h3>{name}</h3><Card><CardHeader><CardTitle>One shared component</CardTitle></CardHeader><CardContent className="ds-stack"><Badge variant="secondary">Same shadcn exports</Badge><Input aria-label={`${name} comparison input`} placeholder="Try a value"/><Button onClick={()=>setClicked(previous=>({...previous,[name]:true}))}>{clicked[name]?'Action selected':'Continue'}<ArrowRight/></Button></CardContent></Card></div>)}</div>
}
export default function DesignSystem() {
  const { brand, setBrand } = useSpatialBrand()
  const params = new URLSearchParams(location.search)
  const [area,setArea] = useState<Area>(areas.some(([id]) => id === params.get('section')) ? params.get('section') as Area : 'foundations')
  const [component,setComponent] = useState(params.get('component') ?? 'button')
  const [pattern,setPattern] = useState(params.get('pattern') ?? 'card')
  const [search,setSearch] = useState('')
  const [group,setGroup] = useState('All')
  const [tokenGroup,setTokenGroup] = useState('Color')
  const [resolved,setResolved] = useState<Record<string,string>>({})
  const [status,setStatus] = useState('Copy a token or interact with a preview to explore.')
  const [copyFallback,setCopyFallback] = useState('')
  const [motion,setMotion] = useState(0)
  const [direction,setDirection] = useState<'next'|'back'>('next')
  const heading = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  useLayoutEffect(() => {
    const root=document.documentElement, previous=root.style.cssText, version=root.dataset.assessmentVersion, dark=root.classList.contains('dark')
    root.dataset.assessmentVersion='5'; applyTheme(spatialTheme,'light')
    return () => { root.style.cssText=previous;root.classList.toggle('dark',dark);if(version)root.dataset.assessmentVersion=version;else delete root.dataset.assessmentVersion }
  },[])
  useLayoutEffect(() => { const frame=requestAnimationFrame(()=>{const computed=getComputedStyle(document.documentElement);setResolved(Object.fromEntries(tokens.map(token => [token.name,computed.getPropertyValue(token.name).trim()]))) });return()=>cancelAnimationFrame(frame) },[brand])
  useLayoutEffect(() => { if(mounted.current)heading.current?.focus({preventScroll:true});mounted.current=true },[area])
  function navigate(next: Area) { setArea(next);setSearch('');setGroup('All');updateURL({section:next});window.scrollTo({top:0,behavior:'instant'}) }
  function updateURL(values: Record<string,string>) { const next=new URL(location.href);Object.entries(values).forEach(([key,value]) => next.searchParams.set(key,value));history.replaceState(history.state,'',next) }
  async function copy(value: string) { try {await navigator.clipboard.writeText(value);setStatus(`Copied ${value}`);setCopyFallback('')}catch{setCopyFallback(value);setStatus('Clipboard unavailable. Copy the selected text below.')} }
  function exportTokens() { const end=spatialCSS.indexOf('/* applyTheme');const blob=new Blob([spatialCSS.slice(0,end), `\nhtml[data-assessment-version="5"]{${brandTokenDeclarations(brand)}}`],{type:'text/css'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`spatial-${brand.id}-tokens.css`;link.click();URL.revokeObjectURL(url);setStatus('Exported the actual shared Spatial token declarations. No preferences changed.') }
  const filtered=coreComponents.filter(item=>(group==='All'||item.group===group)&&`${item.name} ${item.purpose} ${item.group} ${item.states} ${item.tokens}`.toLowerCase().includes(search.toLowerCase()))
  const patterns=rosaPatterns.filter(item=>`${item.name} ${item.screens} ${item.anatomy} ${item.states} ${item.component}`.toLowerCase().includes(search.toLowerCase()))
  const selected=filtered.find(item=>item.id===component) ?? filtered[0] ?? coreComponents[0]
  const story=patterns.find(item=>item.id===pattern) ?? patterns[0] ?? rosaPatterns[0]
  const filteredTokens=tokens.filter(token=>token.category===tokenGroup&&`${token.name} ${token.value}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="flow-v5 spatial-catalog ds-explorer" data-area={area}><SpatialBrandStyles/>
    <PlaygroundLayout title="Spatial Design System" edition="V5.6 · Light approved" className="ds-layout" links={areas} onNavigate={id=>navigate(id as Area)} active={area} sidebar={<div className="ds-side-note"><Layers size={20}/><p>One system.<br/>Real product components.</p><small>{coreComponents.length} installed primitives<br/>{rosaPatterns.length} Rosa patterns</small></div>} toolbar={<nav className="ds-app-links" aria-label="Product and design tools"><SpatialBrandSwitcher brand={brand} onChange={setBrand}/><a href={`?view=design-system&brand=${brand.id}`}>Design System</a><a href="?studio=1">Theme Studio</a><a href="?preview=1">Component Playground</a><a href={`?version=5&brand=${brand.id}&brandDemo=1`}>Rosa V5 Flow <ArrowRight size={14}/></a></nav>} footer="Spatial V5.6 · Shared React/shadcn components and tokens · Preview fixtures never submit or persist assessment data">
      <header className="ds-hero"><span className="ds-eyebrow">ROSA / SPATIAL FLOW</span><h1>Designed to feel<br/><em>like one system.</em></h1><p>The foundations, primitives and product patterns behind Rosa’s assessment journey. Explore the actual components used in the flow.</p><div className="ds-wrap"><Badge variant="secondary">Inter · {brand.name} atmosphere</Badge><Badge variant="outline">Accessible by design</Badge><Badge variant="outline">Light approved / Dark not designed</Badge></div></header>
      <section aria-labelledby="ds-section-heading" className="ds-main-section"><div className="ds-section-heading"><div><span className="ds-eyebrow">{String(areas.findIndex(([id])=>id===area)+1).padStart(2,'0')} / EXPLORE</span><h2 id="ds-section-heading" ref={heading} tabIndex={-1}>{areas.find(([id])=>id===area)?.[1]}</h2></div>{area==='foundations'&&<Button variant="outline" onClick={exportTokens}><Download size={16}/>Export tokens</Button>}</div>
      {area!=='guidelines'&&<div className="ds-filters"><label className="ds-search"><Search size={17}/><Input aria-label="Search design system" placeholder={area==='foundations'?'Search tokens…':'Search components, patterns or usage…'} value={search} onChange={event=>setSearch(event.target.value)}/></label>{area==='components'&&<Select value={group} onValueChange={setGroup}><SelectTrigger aria-label="Component group"><SelectValue/></SelectTrigger><SelectContent>{['All',...new Set(coreComponents.map(item=>item.group))].map(value=><SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>}{area==='foundations'&&<Select value={tokenGroup} onValueChange={setTokenGroup}><SelectTrigger aria-label="Token category"><SelectValue/></SelectTrigger><SelectContent>{[...new Set(tokens.map(token=>token.category))].map(value=><SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>}</div>}
      {area==='foundations'&&<>
        <p className="ds-muted">Values below are read from <code>spatial-theme.css</code>, the shared stylesheet used by Rosa V5. Resolved values reflect the selected brand. Export includes its atmosphere overrides.</p>
        <div className="ds-token-grid">{filteredTokens.map(token=><SpatialSurface className="ds-token" key={token.name}>{token.category==='Color'||token.category==='Brand aliases'?<div className="ds-token-swatch" style={{background:`var(${token.name})`}}/>:token.category==='Shape & elevation'?<div className="ds-material-sample" style={token.name.includes('radius')?{borderRadius:`var(${token.name})`}:{boxShadow:`var(${token.name})`}}>Aa</div>:<span className="ds-token-sample" style={token.category==='Spacing'?{width:`var(${token.name})`}:undefined}>{token.category==='Spacing'?'':token.category==='Typography'?'Aa':'↗'}</span>}<strong>{token.name.replace('--spatial-','').replaceAll('-',' ')}</strong><code>{token.name}</code><span className="ds-token-value" data-token={token.name}>{resolved[token.name] || token.value}</span>{token.value.startsWith('var(')&&<small>Alias: {token.value}</small>}<Button variant="ghost" onClick={()=>copy(`var(${token.name})`)} aria-label={`Copy ${token.name}`}><Copy size={14}/>Copy token</Button></SpatialSurface>)}</div>
        {!filteredTokens.length&&<SpatialStatus>No matching tokens. Try another category or search.</SpatialStatus>}
        <div className="ds-foundation-detail"><SpatialSurface><CardHeader><CardTitle><h3>Typography in context</h3></CardTitle></CardHeader><CardContent><h4 className="spatial-question-title">Check fryer readiness</h4><p className="spatial-question-description">A readable instruction supports the observation.</p><p style={{fontSize:'var(--spatial-type-body)'}}>Body · Inter Variable · 16px</p><p style={{fontSize:'var(--spatial-type-secondary)'}}>Secondary · readable supporting context</p><Badge variant="secondary" style={{fontSize:'var(--spatial-type-label)'}}>Preparation</Badge><p className="ds-muted">Headline: responsive <code>--spatial-type-title</code>, 1.18 line height, −0.9px tracking, weight 790. Body: 1.5–1.6 line height. Control labels: 700–750. These roles match the live component styles.</p></CardContent></SpatialSurface><SpatialSurface><CardHeader><CardTitle><h3>Motion with purpose</h3></CardTitle></CardHeader><CardContent><div className="ds-motion-window"><div key={motion} className="spatial-question-body" data-direction={direction}><Badge variant="secondary">{direction === 'next'?'Next task':'Previous task'}</Badge><p>Question content transitions on buttons; touch swipes move the card. Header/footer remain stable.</p></div></div><div className="ds-wrap"><Button variant="outline" onClick={()=>{setDirection('back');setMotion(x=>x+1)}}>Preview Back</Button><Button onClick={()=>{setDirection('next');setMotion(x=>x+1)}}>Preview Next</Button></div><p className="ds-muted">Swipe left/right on the Rosa live-card example for guarded navigation and snapback. Press any action for tactile feedback, change a Rosa response for selection, and open Sections for the shared drawer transition. Reduced motion removes nonessential animation.</p></CardContent></SpatialSurface></div>
        <h3 className="ds-subheading">Neutral / Original vs Spatial</h3><p className="ds-muted">The same Card, Badge, Input and Button exports with local palette aliases. Comparison never changes saved theme or assessment preferences.</p><Comparison/>
      </>}
      {area==='components'&&<div className="ds-browser"><nav className="ds-component-index" aria-label="Installed UI components">{filtered.map(item=><button key={item.id} aria-current={selected.id===item.id?'true':undefined} onClick={()=>{setComponent(item.id);updateURL({component:item.id})}}><span>{item.name}</span><small>{item.group}</small></button>)}{!filtered.length&&<p>No matching components.</p>}</nav>{filtered.length>0&&<article className="ds-component-detail" aria-label={`${selected.name} reference`}><div className="ds-detail-title"><h3>{selected.name}</h3><Badge variant="outline">{selected.group}</Badge></div><p>{selected.purpose}</p><SpatialSurface className="ds-live-preview"><CorePreview key={selected.id} id={selected.id}/></SpatialSurface><div className="ds-guidance-grid"><div><h4>When to use</h4><p>{selected.purpose}</p></div><div><h4>When not to use</h4><p>{selected.avoid}</p></div><div><h4>Supported variants & states</h4><p>{selected.states}</p></div><div><h4>Keyboard & accessibility</h4><p>{selected.keyboard}</p></div></div><p className="ds-muted"><strong>Semantic mapping:</strong> {selected.tokens}</p><details><summary>Import & JSX example</summary><Code text={componentCode(selected)}/><Button variant="outline" onClick={()=>copy(componentCode(selected))}><Copy/>Copy example</Button></details><Reference path={`src/components/ui/${selected.id}.tsx`}/></article>}{!filtered.length&&<SpatialStatus>No matching components. Clear the search or choose another group.</SpatialStatus>}</div>}
      {area==='rosa'&&<><SpatialStatus>Preview-only stories. Camera, signature, saving and submission side effects are safely simulated. Production components and validation helpers are shared.</SpatialStatus><div className="ds-browser ds-rosa-browser"><nav className="ds-component-index" aria-label="Rosa Flow Components">{patterns.map(item=><button key={item.id} aria-current={story.id===item.id?'true':undefined} onClick={()=>{setPattern(item.id);updateURL({pattern:item.id})}}><span>{item.name}</span><small>{item.screens}</small></button>)}{!patterns.length&&<p>No matching Rosa patterns.</p>}</nav>{patterns.length>0&&<article className="ds-component-detail" aria-label={`${story.name} reference`}><div className="ds-detail-title"><h3>{story.name}</h3><Badge variant="secondary">Production export</Badge></div><p>{story.purpose}</p><RosaPreview key={story.id} pattern={story.id}/><dl className="ds-guidance-grid"><div><dt>Purpose</dt><dd>{story.purpose}</dd></div><div><dt>Anatomy</dt><dd>{story.anatomy}</dd></div><div><dt>States</dt><dd>{story.states}</dd></div><div><dt>UX rationale</dt><dd>{story.rationale}</dd></div><div><dt>Used on screen(s)</dt><dd>{story.screens}</dd></div><div><dt>Code reference</dt><dd>{story.component}</dd></div></dl><Code text={`import { ${story.component.replaceAll(' + ', ', ')} } from '@/components/assessment/${story.id==='before-start'?'spatial-before-start':story.id==='signoff'?'spatial-submission':story.id==='guidance'?'spatial-guidance':['assignment','people','review','signoff'].includes(story.id)?'spatial-journey':'spatial-primitives'}'\n\n${rosaExample(story.id)}`}/><div className="ds-wrap"><Reference path={`src/components/assessment/${story.id==='before-start'?'spatial-before-start':story.id==='signoff'?'spatial-submission':story.id==='guidance'?'spatial-guidance':['assignment','people','review','signoff'].includes(story.id)?'spatial-journey':'spatial-primitives'}.tsx`}/><a href={`?version=5&brand=${brand.id}&brandDemo=1`} className="ds-source">View in Rosa V5 <ArrowRight size={14}/></a></div></article>}{!patterns.length&&<SpatialStatus>No matching Rosa patterns. Try a component name, state or screen.</SpatialStatus>}</div></>}
      {area==='guidelines'&&<div className="ds-usage-grid">{[
        ['Continuous canvas','Keep header/footer backgroundless. Use elevated opaque surfaces for the reading task; avoid glass panels behind safety-critical content.'],
        ['One hand, clear choices','Keep touch targets at least 44px. Pass and Fail stay in constant positions. Never preselect or auto-advance. Label the two Back destinations differently.'],
        ['Three layers, one product','Brand configuration changes atmosphere and decorative accents. Product controls, typography and surfaces stay consistent. Workflow stages are neutral; Pass/Fail, warnings and green completion progress never inherit the brand.'],
        ['Theme Studio relationship','Theme Studio remains the editing/export tool for customer themes. This Explorer documents approved Spatial Light. It is not a second theme editor and never writes saved preferences.'],
        ['Truthful system feedback','Draft saving is local. Photos are page-session attachments. Backend sync, verified signatures and certification are not implemented. Do not label a preview as uploaded, synced or certified.'],
        ['Accessibility & motion','Use real labels, visible focus, keyboard-capable primitives and text alongside color. Test short screens and larger copy. Respect reduced motion; no looping decorative animation.'],
        ['Approved vs exploratory','Spatial V5.6 Light and binary observation are approved foundations. Dark mode, real sync, authenticated signatures and client approval/scoring policies require separate design and validation.'],
        ['Contributing a component','Add the real reusable export first, use it in Rosa, then register its story with anatomy, states, usage and source. Keep the installed UI manifest synchronized with src/components/ui.'],
      ].map(([title,text])=><SpatialSurface key={title}><CardHeader><CardTitle><h3>{title}</h3></CardTitle></CardHeader><CardContent>{text}</CardContent></SpatialSurface>)}<div className="ds-wrap"><a className="ds-source" href="?studio=1">Open Theme Studio <ArrowRight size={14}/></a><Reference path="docs/spatial-design-system/README.md"/></div></div>}
      </section>
      <div className="ds-copy-status" role="status" aria-live="polite"><Check size={15}/>{status}</div>{copyFallback&&<TextareaFallback value={copyFallback}/>}
    </PlaygroundLayout>
  </div>
}
function TextareaFallback({value}:{value:string}) { return <textarea aria-label="Copy text manually" readOnly value={value} onFocus={event=>event.currentTarget.select()} className="ds-copy-fallback"/> }
