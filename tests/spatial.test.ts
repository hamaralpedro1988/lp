import test from 'node:test'
import assert from 'node:assert/strict'
import { emptySpatialDraft, normalizeSpatialDraft, spatialCompleteIndices, spatialStorageKey, spatialTheme } from '../src/data/spatial-flow.ts'
import { flowCriteria, flowMissing, flowStorageKey } from '../src/data/flow-draft.ts'
import { contrast, isTheme } from '../src/lib/theme.ts'

test('V5 starts at assignments and isolates its normalized draft from V4 and earlier versions', () => {
  assert.equal(emptySpatialDraft().screen, 'list')
  assert.notEqual(spatialStorageKey, flowStorageKey)
  assert.notEqual(spatialStorageKey, 'lp-rosa-flow-v4-v01')
  assert.deepEqual(normalizeSpatialDraft(null), emptySpatialDraft())
  const saved = { screen: 'assessment', index: 8, answers: { 0: 'met', 1: 'notObserved', 8: 'fail', 99: 'met' }, notes: { 8: 'Observed quality issue' }, offline: true }
  const restored = normalizeSpatialDraft(saved)
  assert.equal(restored.index, 8)
  assert.equal(restored.offline, true)
  assert.deepEqual(restored.answers, { 0: 'met', 1: 'notObserved', 8: 'fail' })
  assert.equal(restored.notes[8], saved.notes[8])
  assert.equal(Object.keys(saved.answers).length, 4, 'normalization must not mutate its source')
})

test('segmented progress counts completed observations, never pass rate or unverified media', () => {
  const draft = emptySpatialDraft()
  draft.answers = Object.fromEntries(flowCriteria.map((_, index) => [index, index % 2 ? 'fail' : 'coaching']))
  assert.equal(spatialCompleteIndices(draft).length, 10, 'required evidence is still missing')
  assert.deepEqual(flowMissing(draft), [8])
  assert.equal(spatialCompleteIndices(draft, { 8: 1 }).length, 11)
  assert.equal(spatialCompleteIndices(draft).length, 10, 'reloading discards photo eligibility')
  draft.notes[8] = '   '
  assert.equal(spatialCompleteIndices(draft).length, 10)
  draft.notes[8] = 'Observed quality checks'
  assert.equal(spatialCompleteIndices(draft).length, 11)
  assert.deepEqual(flowMissing(draft), [])
  draft.answers[1] = 'notObserved'
  assert.equal(spatialCompleteIndices(draft).length, 10)
  assert.deepEqual(flowMissing(draft), [1])
})

test('spatial reading surfaces and functional state colors meet AA text contrast', () => {
  assert.ok(isTheme(spatialTheme))
  const palette = spatialTheme.light
  for (const [text, background] of [
    [palette.foreground, palette.background],
    [palette['card-foreground'], palette.card],
    [palette['muted-foreground'], palette.card],
    [palette['muted-foreground'], palette.background],
    [palette['primary-foreground'], palette.primary],
    [palette['warning-foreground'], palette.warning],
    [palette['success-foreground'], palette.success],
    ['#81384b', '#fff0f2'],
    ['#655b74', '#f1edff'],
  ]) assert.ok(contrast(text, background) >= 4.5, `${text} on ${background}`)
})
