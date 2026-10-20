import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpatialAcknowledgement } from '../src/data/spatial-acknowledgement.ts'
import { normalizeSpatialDraft, completeSpatialAssessment, emptySpatialDraft, spatialNavigationBlock } from '../src/data/spatial-flow.ts'
test('acknowledgement requires explicit name, consent and method-specific evidence; never assigns identity', () => {
  for (const method of ['drawn','typed'] as const) {
    assert.equal(createSpatialAcknowledgement('', method, ['10,10 20,20'], true), null)
    assert.equal(createSpatialAcknowledgement('   ', method, ['10,10 20,20'], true), null)
    assert.equal(createSpatialAcknowledgement('Name entered', method, ['10,10 20,20'], false), null)
    const record=createSpatialAcknowledgement('  Name entered  ', method, ['10,10 20,20'], true)!
    assert.equal(record.name,'Name entered');assert.equal(record.identity,'unverified');assert.equal(record.actor,'employee-self-declared')
    assert.equal(record.method,method);assert.equal(record.consent,true)
    assert.equal(record.policy,'prototype-only-business-validation-required')
    assert.deepEqual(record.strokes, method==='typed'?[]:['10,10 20,20'])
  }
  assert.equal(createSpatialAcknowledgement('Name','drawn',[],true),null)
  assert.equal(createSpatialAcknowledgement('Name','typed',['<script>'],true),null)
})
test('method and consent survive valid completion reload without identity verification claims', () => {
  const draft={...emptySpatialDraft(),answers:Object.fromEntries(Array.from({length:11},(_,i)=>[i,'met' as const])),notes:{8:'Observed'}}
  const completed=completeSpatialAssessment(draft,{8:1})!
  completed.signature=createSpatialAcknowledgement('Explicit person','typed',[],true)!
  assert.deepEqual(normalizeSpatialDraft(completed).signature, completed.signature)
})
test('validation explains each blocking response or evidence state, preserving back and completion rules', () => {
  const draft={...emptySpatialDraft(),index:8,answers:{},notes:{}}
  assert.equal(spatialNavigationBlock(draft,{},'next'),'Choose Pass or Fail before continuing.')
  const answered={...draft,answers:{8:'fail' as const}}
  assert.equal(spatialNavigationBlock(answered,{},'next'),'Comment and photo required before continuing.')
  assert.equal(spatialNavigationBlock({...answered,notes:{8:'Note'}},{},'next'),'Photo required before continuing.')
  assert.equal(spatialNavigationBlock(answered,{8:1},'next'),'Comment required before continuing.')
  assert.equal(spatialNavigationBlock({...answered,notes:{8:'Note'}},{8:1},'next'),null)
  assert.equal(spatialNavigationBlock(draft,{},'back'),null)
})
