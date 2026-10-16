import { PaletteSample } from '@/components/theme/palette-sample'
import { useState, type ReactNode } from 'react'
import { ArrowRight, Plus, Check, Info, Loader2, SlidersHorizontal } from 'lucide-react'
import { PlaygroundLayout } from '@/components/layout/playground-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'

function Section({ id, number, title, description, children }: { id: string; number: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="space-y-5 border-t py-9 sm:py-10"><div className="flex items-start gap-4"><span className="pt-1 font-mono text-xs text-muted-foreground">{number}</span><div><h2 className="text-xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div>{children}</section>
}
function Caption({ children }: { children: ReactNode }) { return <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{children}</p> }

export default function ComponentPlayground() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [progress, setProgress] = useState(40)
  const [notice, setNotice] = useState('')
  const invalid = submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return <PlaygroundLayout>
    <section id="foundations" className="pb-10">
      <div className="mb-5 flex items-center gap-2"><Badge variant="secondary">UI foundations</Badge><span className="text-xs text-muted-foreground">01 / Component library</span></div>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Small details.<br/><span className="text-muted-foreground">A consistent experience.</span></h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">A space to explore our interface building blocks. Review the essentials, try the interactions, and shape what comes next.</p>
      <div className="mt-7 flex flex-wrap gap-2">{['16 components', 'Accessible primitives', 'Mobile first'].map(x => <Badge key={x} variant="outline" className="px-3 py-1.5 font-normal">{x}</Badge>)}</div>
      <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-xl border bg-muted/30">{[['01','Explore'],['02','Interact'],['03','Refine']].map(([n,t])=><div key={n} className="border-r p-4 last:border-r-0 sm:p-5"><p className="font-mono text-xs text-muted-foreground">{n}</p><p className="mt-2 text-sm font-medium">{t}</p></div>)}</div>
    </section>
    <PaletteSample/>
    <Section id="buttons" number="01" title="Actions & emphasis" description="A clear hierarchy, from the primary action to the quietest link.">
      <div className="rounded-xl border p-5 sm:p-6"><Caption>Button variants</Caption><div className="flex flex-wrap gap-3"><Button onClick={()=>setNotice('Primary action selected.')}>Primary action<ArrowRight/></Button><Button variant="secondary" onClick={()=>setNotice('Secondary action selected.')}>Secondary</Button><Button variant="outline" onClick={()=>setNotice('Outline action selected.')}><Plus/>Add item</Button><Button variant="ghost" onClick={()=>setNotice('Ghost action selected.')}>Ghost</Button><Button variant="link" onClick={()=>setNotice('Link action selected.')}>Text link<ArrowRight/></Button></div><Separator className="my-6"/><Caption>Interaction states</Caption><div className="flex flex-wrap gap-3"><Button variant="outline" className="bg-accent text-accent-foreground">Hover example</Button><Button variant="outline" className="border-ring ring-[3px] ring-ring/50">Focus example</Button><Button disabled>Disabled</Button><Button disabled variant="secondary"><Loader2 className="animate-spin"/>Loading</Button></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Hover and focus are visual samples. Tab through the controls to review actual keyboard focus.</p></div>
    </Section>
    <Section id="inputs" number="02" title="Forms & selection" description="Comfortable controls with clear labels, helpful guidance, and visible states.">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Text fields</CardTitle><CardDescription>Try submitting an empty or invalid email.</CardDescription></CardHeader><CardContent><form noValidate className="space-y-5" onSubmit={e=>{e.preventDefault();setSubmitted(true);if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))setNotice('Example form validated successfully.')}}>
          <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium">Display name</label><Input id="name" placeholder="e.g. Alex Morgan" autoComplete="name"/></div>
          <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email address</label><Input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} aria-invalid={invalid} aria-describedby="email-help"/><p id="email-help" className={invalid?'text-xs text-destructive':'text-xs text-muted-foreground'}>{invalid?'Enter a valid email address.':'Used only to demonstrate validation.'}</p></div>
          <div className="space-y-2"><label htmlFor="notes" className="text-sm font-medium">Notes <span className="font-normal text-muted-foreground">(optional)</span></label><Textarea id="notes" placeholder="Add a little more detail…" className="min-h-24"/></div>
          <div className="space-y-2"><label htmlFor="disabled" className="text-sm font-medium">Disabled field</label><Input id="disabled" disabled placeholder="Not available"/></div><Button type="submit">Validate example<Check/></Button>
        </form></CardContent></Card>
        <Card><CardHeader><CardTitle>Making a choice</CardTitle><CardDescription>Single selections, multiple selections, and menus.</CardDescription></CardHeader><CardContent className="space-y-6">
          <div className="space-y-2"><label id="size-label" htmlFor="size" className="text-sm font-medium">Example size</label><Select defaultValue="medium"><SelectTrigger id="size" aria-labelledby="size-label" className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select></div>
          <fieldset><legend className="mb-2 text-sm font-medium">Checkbox options</legend>{[['a','First option',false],['b','Selected by default',false],['c','Unavailable option',true]].map(([id,label,disabled])=><label key={String(id)} htmlFor={String(id)} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:text-muted-foreground"><Checkbox id={String(id)} defaultChecked={id==='b'} disabled={Boolean(disabled)}/>{label}</label>)}</fieldset>
          <Separator/><fieldset><legend className="mb-2 text-sm font-medium">Radio options</legend><RadioGroup defaultValue="comfortable">{['Comfortable','Compact'].map(x=><label key={x} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><RadioGroupItem value={x.toLowerCase()}/>{x}</label>)}</RadioGroup></fieldset>
        </CardContent></Card>
      </div>
    </Section>
    <Section id="feedback" number="03" title="Content & feedback" description="Organize information and communicate status without adding noise.">
      <Tabs defaultValue="preview"><TabsList className="h-auto"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="states">Loading state</TabsTrigger></TabsList><TabsContent value="preview" className="mt-5"><div className="grid gap-5 sm:grid-cols-2"><Card><CardHeader><div className="mb-3 flex gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge></div><CardTitle>A simple content card</CardTitle><CardDescription>Use consistent surfaces to group related information.</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">A flexible building block with a title, supporting content, and a clearly placed action.</p></CardContent><CardFooter><Button variant="outline" onClick={()=>setNotice('Card action selected.')}>Explore component<ArrowRight/></Button></CardFooter></Card><Card><CardHeader><CardTitle>Progress indicator</CardTitle><CardDescription>A clear view of how far along you are.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex justify-between text-sm"><span id="progress-label">Example progress</span><span className="font-mono">{progress}%</span></div><Progress value={progress} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-labelledby="progress-label"/><p className="text-xs text-muted-foreground">Adjust the value to preview different states.</p></CardContent><CardFooter className="flex-wrap gap-2"><Button variant="outline" disabled={progress===0} onClick={()=>setProgress(Math.max(0,progress-20))}>Decrease</Button><Button variant="outline" disabled={progress===100} onClick={()=>setProgress(Math.min(100,progress+20))}>Increase</Button></CardFooter></Card></div></TabsContent><TabsContent value="states" className="mt-5"><Card aria-label="Loading content example"><CardHeader><Skeleton className="h-5 w-36"/><Skeleton className="h-4 w-3/4"/></CardHeader><CardContent className="space-y-3"><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-5/6"/><Skeleton className="h-20 w-full"/></CardContent></Card></TabsContent></Tabs>
    </Section>
    <Section id="overlays" number="04" title="A little more context" description="Focused conversations, supporting panels, and helpful hints.">
      <div className="flex flex-wrap gap-3 rounded-xl border p-5 sm:p-6">
        <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog<ArrowUpIcon/></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>A moment of focus</DialogTitle><DialogDescription>This is a component example. Dialogs bring a small, focused task into view.</DialogDescription></DialogHeader><p className="py-4 text-sm text-muted-foreground">Try pressing Escape, clicking outside, or using the close button. Keyboard focus returns to the trigger.</p><DialogFooter><DialogClose asChild><Button>Done</Button></DialogClose></DialogFooter></DialogContent></Dialog>
        <AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Open confirmation</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset this example?</AlertDialogTitle><AlertDialogDescription>This demo action resets the progress indicator to 40%. No data is removed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>{setProgress(40);setNotice('Example progress reset to 40%.')}}>Reset example</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <Sheet><SheetTrigger asChild><Button variant="outline"><SlidersHorizontal/>Open sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Supporting context</SheetTitle><SheetDescription>A sheet keeps extra information nearby without leaving the page.</SheetDescription></SheetHeader><p className="px-4 text-sm leading-6 text-muted-foreground">This neutral panel is ready for future content. No product settings or workflows have been added.</p></SheetContent></Sheet>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" aria-label="About tooltips"><Info/>Helpful hint</Button></TooltipTrigger><TooltipContent>Small guidance, right where you need it.</TooltipContent></Tooltip>
      </div>
    </Section>
    <div role="status" aria-live="polite" className="min-h-12 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{notice || 'Ready to explore. Interact with a component to see its feedback here.'}</div>
  </PlaygroundLayout>
}
function ArrowUpIcon() { return <ArrowRight className="-rotate-45"/> }
