import test from 'node:test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { emptySpatialDraft, normalizeSpatialDraft, spatialCompleteIndices, spatialMissing, spatialEvidenceSatisfied, spatialEvidenceMessage, spatialStorageKey, spatialTheme } from '../src/data/spatial-flow.ts'
import { flowCriteria, flowStorageKey } from '../src/data/flow-draft.ts'
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
  draft.answers = Object.fromEntries(flowCriteria.map((_, index) => [index, index % 2 ? 'fail' : 'met']))
  assert.equal(spatialCompleteIndices(draft).length, 10, 'required evidence is still missing')
  assert.deepEqual(spatialMissing(draft), [8])
  assert.equal(spatialCompleteIndices(draft, { 8: 1 }).length, 10)
  assert.equal(spatialCompleteIndices(draft).length, 10, 'reloading discards photo eligibility')
  draft.notes[8] = '   '
  assert.equal(spatialCompleteIndices(draft).length, 10)
  draft.notes[8] = 'Observed quality checks'
  assert.equal(spatialCompleteIndices(draft, {8:1}).length, 11)
  assert.deepEqual(spatialMissing(draft, {8:1}), [])
  draft.answers[1] = 'notObserved'
  assert.equal(spatialCompleteIndices(draft, {8:1}).length, 10)
  assert.deepEqual(spatialMissing(draft, {8:1}), [1])
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

test('V5.6 binary migration requires explicit re-selection and preserves old-version data', () => {
  const legacy = { ...emptySpatialDraft(), answers: { 0: 'coaching', 1: 'met', 2: 'fail' }, assessorConfirmed: true }
  const next = normalizeSpatialDraft(legacy)
  assert.deepEqual(next.answers, { 1: 'met', 2: 'fail' })
  assert.equal(next.assessorConfirmed, false)
  assert.equal(legacy.answers[0], 'coaching')
  assert.equal(spatialCompleteIndices(legacy as ReturnType<typeof emptySpatialDraft>).includes(0), false)
})

test('rendered CSS theme text and focus/control roles retain accessible contrast', () => {
  const css = readFileSync(new URL('../src/styles/spatial-theme.css', import.meta.url), 'utf8')
  const values = Object.fromEntries([...css.matchAll(/--(spatial-[a-z-]+):([^;\n]+);/g)].map(match => [match[1], match[2].trim()]))
  const resolve = (role: string): string => {
    const value = values['spatial-' + role]
    const alias = /^var\(--spatial-([a-z-]+)\)$/.exec(value)
    return alias ? resolve(alias[1]) : value
  }
  for (const [text, surface] of [['ink', 'canvas'], ['muted', 'canvas'], ['muted', 'surface'], ['muted', 'choice'], ['section-ink', 'section-bg'], ['warning-ink', 'warning-bg'], ['success-ink', 'success-bg'], ['fail-ink', 'fail-bg']]) {
    assert.ok(contrast(resolve(text), resolve(surface)) >= 4.5, `${text} on ${surface}`)
  }
  assert.ok(contrast(resolve('control-line'), '#ffffff') >= 3)
  assert.ok(contrast(resolve('focus'), resolve('surface')) >= 3)
})


test('V5 evidence types enforce exactly the required modalities and name what is missing', () => {
  for (const requirement of ['none', 'comment', 'photo', 'comment-and-photo'] as const) {
    for (const note of ['', '   ', 'Observed quality']) for (const photos of [0, 1]) {
      const expected = (requirement === 'none') || (requirement === 'comment' ? !!note.trim() : requirement === 'photo' ? photos > 0 : !!note.trim() && photos > 0)
      assert.equal(spatialEvidenceSatisfied(requirement, note, photos), expected, `${requirement}: ${JSON.stringify(note)}, ${photos}`)
    }
  }
  assert.equal(spatialEvidenceMessage('comment-and-photo', '', 0), 'Comment and photo required')
  assert.equal(spatialEvidenceMessage('comment-and-photo', 'Observed', 0), 'Photo required')
  assert.equal(spatialEvidenceMessage('comment-and-photo', '', 1), 'Comment required')
  assert.equal(spatialEvidenceMessage('comment-and-photo', 'Observed', 1), 'Evidence recorded')
  assert.equal(spatialEvidenceMessage('comment', '', 1), 'Comment required')
  assert.equal(spatialEvidenceMessage('photo', 'Observed', 0), 'Photo required')
})
