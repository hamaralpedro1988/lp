import test from 'node:test'
import assert from 'node:assert/strict'
import { completeSpatialAssessment, emptySpatialDraft, normalizeSpatialDraft, spatialMissing, spatialNavigationBlock } from '../src/data/spatial-flow.ts'
import { flowCriteria } from '../src/data/flow-draft.ts'
import { spatialAssessmentOutcome, spatialReviewResult } from '../src/data/spatial-review.ts'

test('completion requires every response and both real evidence requirements', () => {
  const draft = emptySpatialDraft()
  assert.equal(completeSpatialAssessment(draft, {}), null)
  draft.answers = Object.fromEntries(flowCriteria.map((_, i) => [i, 'met']))
  assert.equal(completeSpatialAssessment(draft, {8: 1}), null)
  draft.notes[8] = 'Original observation'
  assert.equal(completeSpatialAssessment(draft, {}), null)
  const original = JSON.stringify(draft)
  const completed = completeSpatialAssessment(draft, {8: 1})!
  assert.equal(JSON.stringify(draft), original)
  assert.equal(completed.screen, 'review')
  assert.ok(completed.completion?.at)
  assert.equal(completeSpatialAssessment(completed, {8: 1}), null)
  assert.ok(spatialNavigationBlock(completed, {}, 'back'))
  assert.ok(spatialNavigationBlock(completed, {}, 'next'))
  const restored = normalizeSpatialDraft({...JSON.parse(JSON.stringify(completed)), screen:'assessment'})
  assert.equal(restored.screen, 'review')
  assert.equal(spatialMissing(restored, {}).length, 0)
  assert.equal(spatialReviewResult(restored, {}, 8), 'Pass')
  assert.equal(restored.notes[8], 'Original observation')
})

test('an invalid completion receipt cannot bypass evidence validation', () => {
  const draft = emptySpatialDraft()
  assert.equal(normalizeSpatialDraft({...draft, completion:{at:new Date().toISOString(),photos:{8:1}}}).completion, undefined)
})


test('only critical failures determine the completed assessment outcome', () => {
  const draft = emptySpatialDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, i) => [i, i === 0 ? 'fail' : 'met']))
  draft.notes[8] = 'Evidence'
  const completed = completeSpatialAssessment(draft, {8:1})!
  assert.equal(spatialAssessmentOutcome(completed, {}), 'Pass')
  assert.equal(spatialAssessmentOutcome({...completed, answers:{...completed.answers, 1:'fail'}}, {}), 'Fail')
  assert.equal(spatialAssessmentOutcome(emptySpatialDraft(), {}), 'Pending')
})

test('a completed assessment restores its local signature without accepting malformed drawings', () => {
  const draft = emptySpatialDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, i) => [i, 'met']))
  draft.notes[8] = 'Quality observed'
  const completed = completeSpatialAssessment(draft, {8:1})!
  const signature = {name:'Dre Michael',at:new Date().toISOString(),strokes:['10,10 20,20 35,15']}
  const restored = normalizeSpatialDraft({...completed,signature})
  assert.deepEqual(restored.signature, { ...signature, method: 'unknown', consent: false, identity: 'unverified' })
  assert.equal(normalizeSpatialDraft({...completed,signature:{...signature,strokes:['<script>']}}).signature, undefined)
  assert.equal(normalizeSpatialDraft({...draft,signature}).signature, undefined)
})
