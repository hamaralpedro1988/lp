import test from 'node:test'
import assert from 'node:assert/strict'
import { flowCriteria } from '../src/data/flow-draft.ts'
import { emptySpatialDraft, completeSpatialAssessment, normalizeSpatialDraft } from '../src/data/spatial-flow.ts'
import { spatialLifecycle } from '../src/data/spatial-lifecycle.ts'

test('new, started without answers, paused and legacy saved records expose lifecycle status', () => {
  assert.equal(spatialLifecycle(emptySpatialDraft()).status, 'Ready to start')
  for (const patch of [{started:true}, {paused:true}, {answers:{3:'met' as const}}, {notes:{2:'Observed'}}]) {
    const state = spatialLifecycle({...emptySpatialDraft(), ...patch})
    assert.equal(state.status, 'In Progress'); assert.equal(state.action, 'Resume assessment'); assert.equal(state.nextScreen, 'assessment')
  }
  assert.ok(normalizeSpatialDraft({...emptySpatialDraft(), started:true}).started)
})
test('all answers are still In Progress; progress requires every specified evidence modality', () => {
  const draft = {...emptySpatialDraft(), index:7, answers:Object.fromEntries(flowCriteria.map((_,i)=>[i,i===2?'fail' as const:'met' as const]))}
  assert.equal(spatialLifecycle(draft).completed,10)
  assert.equal(spatialLifecycle(draft).action,'Resume assessment')
  const ready = {...draft, notes:{8:'Quality observed'}}
  assert.equal(spatialLifecycle(ready,{8:1}).completed,11)
  assert.equal(spatialLifecycle(ready,{8:1}).status,'In Progress')
  assert.equal(spatialLifecycle(ready,{8:1}).action,'Continue to review')
  assert.equal(ready.index,7)
})
test('checklist confirmation and acknowledgement are not completion; submission requires approval when configured', () => {
  const draft = {...emptySpatialDraft(), answers:Object.fromEntries(flowCriteria.map((_,i)=>[i,'met' as const])), notes:{8:'Quality observed'}}
  const completed=completeSpatialAssessment(draft,{8:1})!
  assert.equal(spatialLifecycle(completed).status,'In Progress')
  assert.equal(spatialLifecycle(completed).action,'Continue to review')
  const signed={...completed, signature:{name:'Dre',at:new Date().toISOString(),strokes:[]}}
  assert.equal(spatialLifecycle(signed).status,'In Progress')
  assert.equal(spatialLifecycle({...signed,assessorConfirmed:true}).status,'Pending Review')
  assert.equal(spatialLifecycle({...signed,assessorConfirmed:true},{},false).status,'Completed')
  assert.equal(spatialLifecycle({...completed,assessorConfirmed:true}).status,'In Progress')
})
