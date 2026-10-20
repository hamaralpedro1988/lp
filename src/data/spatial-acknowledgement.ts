import type { FlowDraft } from './flow-draft.ts'
export function createSpatialAcknowledgement(name: string, method: 'drawn' | 'typed', strokes: string[], consent: boolean): FlowDraft['signature'] | null {
  const explicitName = name.trim()
  const safe = strokes.length <= 200 && strokes.every(points => points.length <= 50000 && /^[0-9, .-]+$/.test(points))
  if (!explicitName || explicitName.length > 200 || !consent || !safe || (method === 'drawn' && !strokes.some(points => points.includes(' ')))) return null
  return { name: explicitName, at: new Date().toISOString(), strokes: method === 'drawn' ? strokes : [], method, consent: true, identity: 'unverified', actor: 'employee-self-declared', assessor: 'Rosa Thompson (prototype, unverified)', policy: 'prototype-only-business-validation-required' }
}
