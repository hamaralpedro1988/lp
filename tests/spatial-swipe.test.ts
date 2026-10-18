import test from 'node:test'
import assert from 'node:assert/strict'
import { committedSwipe, spatialMotionMilliseconds, swipeAxis } from '../src/lib/spatial-swipe.ts'
import { emptySpatialDraft, spatialNavigationBlock } from '../src/data/spatial-flow.ts'

test('horizontal intent, thresholds and flick velocity reject vertical and accidental swipes', () => {
  assert.equal(swipeAxis(5, 5), null)
  assert.equal(swipeAxis(25, 12), 'horizontal')
  assert.equal(swipeAxis(15, 35), 'vertical')
  assert.equal(committedSwipe(-100, 5, 300, 360), 'next')
  assert.equal(committedSwipe(100, 5, 300, 360), 'back')
  assert.equal(committedSwipe(-45, 0, 50, 360), 'next')
  assert.equal(committedSwipe(-45, 0, 400, 360), null)
  assert.equal(committedSwipe(-100, 150, 100, 360), null)
  assert.equal(committedSwipe(-10, 0, 1, 360), null)
})
test('buttons and swipe share unanswered, first-criterion and strict two-part evidence guards', () => {
  const draft = emptySpatialDraft()
  assert.match(spatialNavigationBlock(draft, {}, 'next')!, /Choose Pass or Fail/)
  assert.match(spatialNavigationBlock(draft, {}, 'back')!, /first criterion/)
  draft.answers[0] = 'fail'
  assert.equal(spatialNavigationBlock(draft, {}, 'next'), null)
  draft.index = 8; draft.answers[8] = 'met'
  assert.match(spatialNavigationBlock(draft, {}, 'next')!, /Comment and photo required/)
  draft.notes[8] = 'Product quality observed'
  assert.match(spatialNavigationBlock(draft, {}, 'next')!, /Photo required/)
  assert.equal(spatialNavigationBlock(draft, {8:1}, 'next'), null)
  draft.notes[8] = ' '
  assert.match(spatialNavigationBlock(draft, {8:1}, 'next')!, /Comment required/)
  assert.equal(spatialNavigationBlock(draft, {}, 'back'), null)
  assert.equal(draft.answers[8], 'met', 'navigation does not infer or change an answer')
})

test('motion tokens retain duration when production CSS converts milliseconds to seconds', () => {
  assert.equal(spatialMotionMilliseconds('700ms', 320), 700)
  assert.equal(spatialMotionMilliseconds(' .7s ', 320), 700)
  assert.equal(spatialMotionMilliseconds('0.21s', 320), 210)
  assert.equal(spatialMotionMilliseconds('0ms', 320), 0)
  assert.equal(spatialMotionMilliseconds('', 320), 320)
  assert.equal(spatialMotionMilliseconds('-1s', 320), 320)
})
