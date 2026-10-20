import test from 'node:test'
import assert from 'node:assert/strict'
import { flowCriteria } from '../src/data/flow-draft.ts'
import { emptySpatialDraft, completeSpatialAssessment, normalizeSpatialDraft, updateSpatialObservation, spatialMissing, spatialNavigationBlock } from '../src/data/spatial-flow.ts'

function completed() {
  const draft = emptySpatialDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, i) => [i, i === 4 ? 'fail' : 'met']))
  draft.notes[8] = 'Observed quality'
  return completeSpatialAssessment(draft, {8:1})!
}
test('comment corrections preserve locked responses, completion, evidence and other fields', () => {
  const original = completed(), before = JSON.stringify(original)
  const next = updateSpatialObservation(original, 0, 'Clean work area')!
  assert.equal(next.notes[0], 'Clean work area')
  assert.deepEqual(next.answers, original.answers)
  assert.deepEqual(next.completion, original.completion)
  assert.equal(next.feedback, original.feedback)
  assert.equal(JSON.stringify(original), before)
  assert.ok(spatialNavigationBlock(next, {}, 'next'))
})
test('empty required comment can be saved, blocks submission and preserves completion after reload', () => {
  const original = completed()
  const next = normalizeSpatialDraft(updateSpatialObservation(original, 8, '  '))
  assert.ok(next.completion)
  assert.deepEqual(spatialMissing(next), [8])
  assert.equal(next.notes[8], '  ')
  assert.deepEqual(next.answers, original.answers)
  const corrected = normalizeSpatialDraft(updateSpatialObservation(next, 8, 'Quality rechecked'))
  assert.deepEqual(spatialMissing(corrected), [])
  assert.ok(corrected.completion)
})
test('legacy completion gains an evidence snapshot before a required comment is removed', () => {
  const original = completed()
  delete original.completion!.notes
  const edited = normalizeSpatialDraft(updateSpatialObservation(original, 8, ''))
  assert.ok(edited.completion)
  assert.deepEqual(spatialMissing(edited), [8])
})
test('submitted comments and invalid task indexes cannot be overwritten', () => {
  assert.equal(updateSpatialObservation({...completed(), assessorConfirmed:true}, 0, 'changed'), null)
  for(const index of [-1,11,1.5,NaN]) assert.equal(updateSpatialObservation(completed(), index, 'changed'), null)
  assert.equal(updateSpatialObservation(emptySpatialDraft(), 0, '')!.notes[0], '')
})
