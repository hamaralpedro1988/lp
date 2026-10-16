import { useEffect, useRef, useState } from 'react'
import { Camera, FileText, Plus, Trash2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Evidence = { id: string; name: string; url: string; video: boolean }
export function EvidencePanel({ note, onNoteChange }: { note: string; onNoteChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(note)
  const [files, setFiles] = useState<Evidence[]>([])
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const urls = useRef(new Set<string>())
  useEffect(() => { const active = urls.current; return () => active.forEach(url => URL.revokeObjectURL(url)) }, [])
  function remove(id: string) {
    const file = files.find(item => item.id === id)
    if (file) { URL.revokeObjectURL(file.url); urls.current.delete(file.url) }
    setFiles(previous => previous.filter(item => item.id !== id))
  }
  return <section aria-labelledby="evidence-title" className="space-y-4">
    <div className="flex items-center justify-between"><h2 id="evidence-title" className="text-sm">Add evidence</h2><span className="text-xs text-muted-foreground">Optional</span></div>
    <div className="grid grid-cols-2 gap-3">
      <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) setDraft(note) }}><DialogTrigger asChild><Button variant="outline" className="h-12"><FileText/>{note ? 'Edit note' : 'Add note'}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Observation note</DialogTitle><DialogDescription>Add context to the result for this criterion. Notes stay in this session only.</DialogDescription></DialogHeader><label htmlFor="observation-note" className="text-sm font-medium">Your note</label><Textarea id="observation-note" autoFocus value={draft} onChange={event => setDraft(event.target.value)} placeholder="What did you observe?" className="min-h-40"/><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { onNoteChange(draft.trim()); setOpen(false) }}>Save note</Button></DialogFooter></DialogContent></Dialog>
      <Button variant="outline" className="h-12" onClick={() => input.current?.click()}><Camera/>Photo / video</Button>
      <input ref={input} type="file" accept="image/*,video/*" multiple aria-label="Choose photo or video" className="sr-only" onChange={event => {
        const selected = Array.from(event.target.files ?? [])
        const valid = selected.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))
        setError(valid.length !== selected.length ? 'Choose an image or video file.' : '')
        setFiles(previous => [...previous, ...valid.map(file => { const url = URL.createObjectURL(file); urls.current.add(url); return { id: crypto.randomUUID(), name: file.name, url, video: file.type.startsWith('video/') } })])
        event.target.value = ''
      }}/>
    </div>
    {note && <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"><FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground"/><p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6">{note}</p><Button variant="ghost" size="icon" aria-label="Remove note" onClick={() => onNoteChange('')}><Trash2 className="size-4"/></Button></div>}
    {files.length > 0 && <div className="grid grid-cols-2 gap-3">{files.map(file => <div key={file.id} className="min-w-0 overflow-hidden rounded-lg border">{file.video ? <video src={file.url} controls className="aspect-video w-full bg-muted object-contain" aria-label={file.name}/> : <img src={file.url} alt={file.name} className="aspect-video w-full object-cover"/>}<div className="flex items-center gap-2 px-2 py-1">{file.video ? <Video className="size-3 shrink-0"/> : <Plus className="size-3 shrink-0"/>}<span className="min-w-0 flex-1 truncate text-xs">{file.name}</span><Button variant="ghost" size="icon" aria-label={`Remove ${file.name}`} onClick={() => remove(file.id)}><Trash2 className="size-4"/></Button></div></div>)}</div>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    <p className="text-xs leading-5 text-muted-foreground">Notes and files are kept in this session. Nothing is uploaded.</p>
  </section>
}
