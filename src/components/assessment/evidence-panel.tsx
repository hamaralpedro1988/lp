import { readEvidence, writeEvidence, type StoredEvidence } from '@/lib/evidence-storage'
import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useId, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Camera, FileText, ImagePlus, Play, Trash2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useMobileOverlay } from '@/hooks/use-mobile-overlay'

export type EvidenceActions = { openNote: () => void; openMedia: () => void }
type Evidence = { id: string; name: string; url: string; video: boolean; blob?: Blob }
export function EvidencePanel({ note, onNoteChange, onCountChange, onPhotoCountChange, controllerRef, context, persistentNote = false, photosOnly = false, compact = false, onOverlayClosed, externalGallery = false, galleryTarget, galleryReadOnly = false, evidenceStorageKey, onPersistenceError }: { note: string; onNoteChange: (value: string) => void; onCountChange?: (count: number) => void; onPhotoCountChange?: (count: number, restored?: boolean) => void; evidenceStorageKey?: string; onPersistenceError?: (message: string) => void; controllerRef?: Ref<EvidenceActions>; context?: string; persistentNote?: boolean; photosOnly?: boolean; compact?: boolean; onOverlayClosed?: () => void; externalGallery?: boolean; galleryTarget?: HTMLElement | null; galleryReadOnly?: boolean }) {
  const uniqueId = useId()
  const externalTrigger = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [preview, setPreview] = useState<Evidence | null>(null)
  const [discard, setDiscard] = useState(false)
  const [draft, setDraft] = useState(note)
  const [files, setFiles] = useState<Evidence[]>([])
  const [error, setError] = useState('')
  const [restoring, setRestoring] = useState(!!evidenceStorageKey)
  const fileState = useRef<Evidence[]>([])
  const loaded = useRef(!evidenceStorageKey)
  const changing = useRef(false)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  const persistenceError = useRef(onPersistenceError)
  useLayoutEffect(() => { persistenceError.current = onPersistenceError }, [onPersistenceError])
  const photoCount = useRef(onPhotoCountChange)
  useLayoutEffect(() => { photoCount.current = onPhotoCountChange }, [onPhotoCountChange])
  useEffect(() => {
    if (!evidenceStorageKey) return
    let active = true
    void readEvidence(evidenceStorageKey).then(stored => {
      if (!active) return
      const restored = stored.map(file => { const url = URL.createObjectURL(file.blob); urls.current.add(url); return { ...file, url } })
      loaded.current = true
      fileState.current = restored; setFiles(restored); photoCount.current?.(restored.filter(file => !file.video).length, true)
    }).catch(() => { if (active) { const message = 'Unable to restore photos from this device. Keep this page open.'; setError(message); persistenceError.current?.(message) } }).finally(() => { if (active) setRestoring(false) })
    return () => { active = false }
  }, [evidenceStorageKey])
  async function persist(next: Evidence[]) {
    if (!evidenceStorageKey) return true
    try { await writeEvidence(evidenceStorageKey, next.map(file => ({ id: file.id, name: file.name, video: file.video, blob: file.blob! } satisfies StoredEvidence))); return true }
    catch { const message = 'Unable to save photos on this device. Keep this page open and try again.'; if (alive.current) { setError(message); persistenceError.current?.(message) } return false }
  }
  const photo = useRef<HTMLInputElement>(null), video = useRef<HTMLInputElement>(null), library = useRef<HTMLInputElement>(null)
  const urls = useRef(new Set<string>())
  useImperativeHandle(controllerRef, () => ({ openNote: () => { externalTrigger.current = document.activeElement as HTMLElement; setDraft(note); setOpen(true) }, openMedia: () => { externalTrigger.current = document.activeElement as HTMLElement; setMediaOpen(true) } }), [note])
  useEffect(() => { const active = urls.current; return () => active.forEach(url => URL.revokeObjectURL(url)) }, [])
  function closeNote() { if (draft.trim() !== note) { setDiscard(true); return false } setOpen(false); return true }
  useMobileOverlay(open, closeNote)
  useMobileOverlay(mediaOpen, () => { setMediaOpen(false); return true })
  useMobileOverlay(!!preview, () => { setPreview(null); return true })
  async function remove(id: string) {
    if (restoring || changing.current || !loaded.current) return
    changing.current = true
    const current = fileState.current, file = current.find(item => item.id === id)
    const next = current.filter(item => item.id !== id)
    const saved = await persist(next); changing.current = false
    if (!saved || !alive.current) return
    setError(''); persistenceError.current?.('')
    if (file) { URL.revokeObjectURL(file.url); urls.current.delete(file.url) }
    persistenceError.current?.('')
    fileState.current = next; setFiles(next)
    onCountChange?.(next.length); onPhotoCountChange?.(next.filter(item => !item.video).length)
  }
  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!loaded.current && !restoring) { setError('Photos could not be restored. Reload before adding photos.'); return }
    if (restoring || changing.current) { setError('Photos are still saving or loading. Please try again.'); return }
    changing.current = true
    const valid = selected.filter(file => file.type.startsWith('image/') || (!photosOnly && file.type.startsWith('video/')))
    setError(valid.length !== selected.length ? (photosOnly ? 'Choose an image file.' : 'Choose an image or video file.') : '')
    const added = valid.map(file => { const url = URL.createObjectURL(file); urls.current.add(url); return { id: crypto.randomUUID(), name: file.name, url, video: file.type.startsWith('video/'), blob: file } })
    const next = [...fileState.current, ...added]
    const saved = await persist(next); changing.current = false
    if (!saved || !alive.current) { added.forEach(file => { URL.revokeObjectURL(file.url); urls.current.delete(file.url) }); return }
    persistenceError.current?.('')
    fileState.current = next; setFiles(next)
    onCountChange?.(next.length); onPhotoCountChange?.(next.filter(item => !item.video).length)
  }
  const gallery = <>{files.length > 0 && <div className="grid grid-cols-2 gap-3">{files.map(file => <EvidenceAttachment key={file.id} file={file} onPreview={event => { externalTrigger.current=event.currentTarget; setPreview(file) }} onRemove={galleryReadOnly ? undefined : () => remove(file.id)}/>)}</div>}
    {error && !(onPersistenceError && error.startsWith('Unable to ')) && <p role="alert" className="text-xs text-destructive">{error}</p>}</>
  return <section aria-labelledby={`${uniqueId}-title`} className="space-y-4">
    <div hidden={compact} className="flex items-center justify-between"><h2 id={`${uniqueId}-title`} className="text-sm">Add evidence</h2><span className="text-xs text-muted-foreground">Optional</span></div>
    <div className={compact ? "hidden" : "grid grid-cols-2 gap-3"}>
      <Sheet open={open} onOpenChange={value => { if (value) { setDraft(note); setOpen(true) } else closeNote() }}><SheetTrigger asChild><Button variant="outline" className="h-12"><FileText/>{note ? 'Edit note' : 'Add note'}</Button></SheetTrigger><SheetContent side="bottom" showCloseButton={false} className="mobile-sheet mx-auto flex h-[min(34rem,calc(var(--visual-height,100dvh)-1rem))] max-w-lg rounded-t-2xl" onCloseAutoFocus={event=>{if(externalTrigger.current?.isConnected){event.preventDefault();externalTrigger.current.focus()}onOverlayClosed?.()}} onInteractOutside={event => { event.preventDefault(); closeNote() }}>
        <SheetHeader className="shrink-0"><div className="flex items-center justify-between gap-3"><Button variant="ghost" onClick={closeNote}>Cancel</Button><SheetTitle className="min-w-0 flex-1 truncate text-center text-sm">Observation note</SheetTitle><Button onClick={() => { onNoteChange(draft.trim()); setOpen(false) }}>Save</Button></div><SheetDescription>{context ?? 'Add context to this task.'} {persistentNote ? 'Notes are saved on this device.' : 'Text is saved in this tab.'}</SheetDescription></SheetHeader><div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5"><label htmlFor={`${uniqueId}-note`} className="mb-2 block text-sm font-medium">Your note</label><Textarea id={`${uniqueId}-note`} autoFocus value={draft} onChange={event => setDraft(event.target.value)} placeholder="What did you observe?" className="h-full min-h-24 resize-none" style={{fontSize:16}}/></div>
      </SheetContent></Sheet>
      <Sheet open={mediaOpen} onOpenChange={setMediaOpen}><SheetTrigger asChild><Button variant="outline" className="h-12"><Camera/>{photosOnly ? 'Photo' : 'Photo / video'}</Button></SheetTrigger><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl" onCloseAutoFocus={event=>{if(externalTrigger.current?.isConnected){event.preventDefault();externalTrigger.current.focus()}}}><SheetHeader><SheetTitle>{photosOnly ? 'Add photo' : 'Add photo or video'}</SheetTitle><SheetDescription>Capture new evidence or choose from your device.</SheetDescription></SheetHeader><div className="space-y-2 px-5 pb-4">{[{icon:Camera,label:'Take photo',input:photo},...(photosOnly ? [] : [{icon:Video,label:'Record video',input:video}]),{icon:ImagePlus,label:'Choose from library',input:library}].map(({icon:Icon,label,input}) => <Button key={label} variant="outline" className="h-14 w-full justify-start" onClick={() => { input.current?.click(); setMediaOpen(false) }}><Icon/>{label}</Button>)}<p className="pt-2 text-xs leading-5 text-muted-foreground">Camera and library options depend on your device. {evidenceStorageKey ? 'Photos are saved on this device and are not uploaded.' : 'Files stay on this page and are not uploaded.'}</p></div></SheetContent></Sheet>
      <input ref={photo} type="file" accept="image/*" capture="environment" aria-label="Take photo" hidden onChange={choose}/>
      <input ref={video} type="file" accept="video/*" capture="environment" aria-label="Record video" hidden onChange={choose}/>
      <input ref={library} type="file" accept={photosOnly ? "image/*" : "image/*,video/*"} multiple aria-label="Choose photo or video" hidden onChange={choose}/>
    </div>
    {!compact && note && <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"><FileText className="mt-3 size-4 shrink-0 text-muted-foreground"/><button className="min-h-11 min-w-0 flex-1 whitespace-pre-wrap break-words py-2 text-left text-sm leading-6" aria-label="Edit observation note" onClick={() => { setDraft(note); setOpen(true) }}>{note}</button><Button variant="ghost" size="icon" aria-label="Remove note" onClick={() => onNoteChange('')}><Trash2 className="size-4"/></Button></div>}
    {externalGallery ? (galleryTarget && createPortal(gallery, galleryTarget)) : gallery}
    <p hidden={compact} className="text-xs leading-5 text-muted-foreground">{persistentNote ? 'Notes are saved on this device.' : 'Text stays in this tab.'} {evidenceStorageKey ? 'Photos are saved on this device only.' : 'Photos and videos clear if you leave or reload this page.'}</p>
    <Sheet open={!!preview} onOpenChange={value => { if (!value) setPreview(null) }}><SheetContent side="bottom" className="mobile-sheet mx-auto max-w-lg rounded-t-2xl" onCloseAutoFocus={event=>{if(externalTrigger.current?.isConnected){event.preventDefault();externalTrigger.current.focus()}}}><SheetHeader><SheetTitle className="truncate pr-10">Evidence preview</SheetTitle><SheetDescription className="break-all">{preview?.name}</SheetDescription></SheetHeader><div className="min-h-0 overflow-y-auto px-5 pb-5">{preview && (preview.video ? <video src={preview.url} controls playsInline className="max-h-[60dvh] w-full" aria-label={preview.name}/> : <img src={preview.url} alt={preview.name} className="max-h-[60dvh] w-full object-contain"/>)}</div></SheetContent></Sheet>
    <AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard note changes?</AlertDialogTitle><AlertDialogDescription>Your previously saved note will stay unchanged.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => { setDiscard(false); setOpen(false) }}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}

export function EvidenceAttachment({ file, onPreview, onRemove }: { file: Pick<Evidence, 'name' | 'url' | 'video'>; onPreview: (event: React.MouseEvent<HTMLButtonElement>) => void; onRemove?: () => void }) {
  return <div className="min-w-0 overflow-hidden rounded-lg border"><button className="flex aspect-video w-full items-center justify-center bg-muted" aria-label={`Preview ${file.name}`} onClick={onPreview}>{file.video ? <Play className="size-8"/> : <img src={file.url} alt={file.name} className="h-full w-full object-cover"/>}</button><div className="flex items-center gap-1 px-2 py-1"><span className="min-w-0 flex-1 truncate text-xs">{file.name}</span>{onRemove && <Button variant="ghost" size="icon" aria-label={`Remove ${file.name}`} onClick={onRemove}><Trash2 className="size-4"/></Button>}</div></div>
}
