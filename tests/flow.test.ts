import test from 'node:test'
import assert from 'node:assert/strict'
import { flowCriteria, emptyFlowDraft, normalizeFlowDraft, flowEvidenceOk, flowMissing, flowStorageKey } from '../src/data/flow-draft.ts'

test('Rosa Flow preserves the supplied eleven observations and configuration', () => {
  assert.equal(flowCriteria.length, 11)
  assert.deepEqual(['Preparation', 'Frying', 'Completion'].map(section => flowCriteria.filter(c => c.section === section).length), [3, 5, 3])
  assert.deepEqual(flowCriteria.flatMap((c, i) => 'critical' in c ? [i] : []), [1, 4, 7])
  assert.deepEqual(flowCriteria.flatMap((c, i) => 'evidence' in c ? [i] : []), [8])
  assert.equal(flowStorageKey, 'lp-rosa-flow-v2-v01')
})
test('Pass, Fail and coaching are recorded outcomes; legacy not observed still needs a response', () => {
  const draft = emptyFlowDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, i) => [i, 'met']))
  draft.notes[8] = 'Observed quality checks'
  assert.deepEqual(flowMissing(draft), [])
  draft.answers[1] = 'coaching'
  assert.deepEqual(flowMissing(draft), [])
  draft.answers[2] = 'fail'
  assert.deepEqual(flowMissing(draft), [])
  assert.equal(normalizeFlowDraft(draft).answers[2], 'fail')
  draft.answers[2] = 'notObserved'
  delete draft.answers[3]
  assert.deepEqual(flowMissing(draft), [2, 3])
})
test('required evidence accepts nonblank notes or current-session photos, never a stored filename', () => {
  const draft = normalizeFlowDraft({ answers: { 8: 'met' }, notes: { 8: '   ' }, media: { 8: [{ type: 'photo', name: 'old.png' }] } })
  assert.equal(flowEvidenceOk(draft, 8), false)
  assert.equal(flowEvidenceOk(draft, 8, { 8: 1 }), true)
  assert.equal(flowEvidenceOk(draft, 8), false) // Reload discards media eligibility.
  draft.answers[8] = 'fail'
  assert.ok(flowMissing(draft).includes(8))
  draft.notes[8] = 'Product appeared consistent with the agreed standard.'
  assert.equal(flowEvidenceOk(draft, 8), true)
})
test('normalization bounds navigation and isolates incompatible or malformed draft data', () => {
  const draft = normalizeFlowDraft({ screen: 'unknown', index: -1, answers: { 0: 'met', 1: 'not', 2: 'notObserved', 11: 'met' }, notes: { 0: 'A', 1: 42 }, paused: 'false', assessorConfirmed: true, feedback: 'Follow up' })
  assert.equal(draft.index, 4)
  assert.equal(draft.screen, 'assessment')
  assert.deepEqual(draft.answers, { 0: 'met', 2: 'notObserved' })
  assert.deepEqual(draft.notes, { 0: 'A' })
  assert.equal(draft.paused, false)
  assert.equal(draft.feedback, 'Follow up')
  assert.deepEqual(normalizeFlowDraft(null), emptyFlowDraft())
})
