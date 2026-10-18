import test from 'node:test'
import assert from 'node:assert/strict'
import { emptySpatialDraft } from '../src/data/spatial-flow.ts'
import { flowCriteria } from '../src/data/flow-draft.ts'
import { spatialReviewIndices, spatialReviewResult } from '../src/data/spatial-review.ts'

test('review filters derive disjoint outcomes and independent criticality from real answers and evidence', () => {
  const draft = emptySpatialDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, index) => [index, index === 4 ? 'fail' : 'met']))
  const original = JSON.stringify(draft)
  assert.equal(spatialReviewIndices(draft, {}, 'all').length, 11)
  assert.deepEqual(spatialReviewIndices(draft, {}, 'critical'), [1, 4, 7])
  assert.deepEqual(spatialReviewIndices(draft, {}, 'failed'), [4])
  assert.equal(spatialReviewIndices(draft, {}, 'passed').length, 9)
  assert.equal(spatialReviewResult(draft, {}, 8), 'Incomplete', 'Pass without required evidence is not complete')
  assert.equal(spatialReviewResult(draft, { 8: 1 }, 8), 'Incomplete', 'a photo alone cannot meet the two-part requirement')
  assert.equal(JSON.stringify(draft), original, 'reviewing never mutates observations')
  draft.notes[8] = '  Original observation\nwith line breaks.  '
  assert.equal(spatialReviewResult(draft, { 8: 1 }, 8), 'Pass')
  assert.equal(spatialReviewIndices(draft, { 8: 1 }, 'passed').length, 10)
  draft.answers[1] = 'notObserved'
  assert.equal(spatialReviewResult(draft, {}, 1), 'Incomplete')
  assert.ok(spatialReviewIndices(draft, {}, 'critical').includes(1), 'critical includes incomplete criteria')
  assert.ok(!spatialReviewIndices(draft, {}, 'passed').includes(1))
  assert.ok(!spatialReviewIndices(draft, {}, 'failed').includes(1))
})
