import test from 'node:test'
import assert from 'node:assert/strict'
import { emptySpatialDraft, normalizeSpatialDraft, spatialNavigationBlock } from '../src/data/spatial-flow.ts'
import { flowCriteria } from '../src/data/flow-draft.ts'
import { spatialActiveIndex, spatialChecklistItem, spatialSelectChecklistTask, spatialNextPosition } from '../src/data/spatial-checklist.ts'

test('zero observations: current continues; future tasks only preview without draft mutation', () => {
 const draft=emptySpatialDraft(), before=JSON.stringify(draft)
 assert.equal(spatialChecklistItem(draft,{},0).kind,'current')
 for(let i=1;i<11;i++){assert.equal(spatialChecklistItem(draft,{},i).previewOnly,true);assert.equal(spatialSelectChecklistTask(draft,{},i),null)}
 assert.equal(JSON.stringify(draft),before)
 assert.ok(spatialNavigationBlock(draft,{},'next'))
})
test('Fail is a completed observation; required evidence cannot be skipped', () => {
 const draft={...emptySpatialDraft(),index:1,answers:{0:'fail' as const,8:'met' as const},notes:{8:'Observed'}}
 assert.equal(spatialChecklistItem(draft,{},0).complete,true)
 assert.equal(spatialChecklistItem(draft,{},8).complete,false)
 assert.equal(spatialSelectChecklistTask(draft,{},8),null)
 assert.equal(spatialChecklistItem(draft,{8:1},8).complete,true)
})
test('revisiting completed tasks preserves active sequence and all later data across reload', () => {
 const draft={...emptySpatialDraft(),index:4,answers:{0:'met' as const,1:'fail' as const,3:'met' as const},notes:{3:'Later note'}}
 const revisited=spatialSelectChecklistTask(draft,{},1)!
 assert.equal(revisited.index,1);assert.equal(spatialActiveIndex(revisited),4)
 assert.deepEqual(revisited.answers,draft.answers);assert.deepEqual(revisited.notes,draft.notes)
 assert.equal(spatialActiveIndex(normalizeSpatialDraft(revisited)),4)
 assert.deepEqual(spatialNextPosition(revisited),{index:4,activeIndex:4})
 assert.deepEqual(spatialNextPosition({...draft,activeIndex:4}),{index:5,activeIndex:5})
})
test('legacy records including later complete tasks are kept, not reset or promoted', () => {
 const draft={...emptySpatialDraft(),index:2,answers:{10:'fail' as const}}
 const revisited=spatialSelectChecklistTask(draft,{},10)!
 assert.equal(spatialActiveIndex(normalizeSpatialDraft(revisited)),2)
 assert.deepEqual(spatialNextPosition(revisited),{index:2,activeIndex:2})
 assert.equal(spatialChecklistItem({...draft,index:8},{},4).previewOnly,false)
 const restored=normalizeSpatialDraft({...draft,activeIndex:99});assert.equal(restored.activeIndex,undefined)
})
test('all complete tasks stay complete; confirmed checklist keeps its existing response lock', () => {
 const draft={...emptySpatialDraft(),index:10,answers:Object.fromEntries(flowCriteria.map((_,i)=>[i,'met' as const])),notes:{8:'Observed'}}
 for(let i=0;i<11;i++)assert.equal(spatialChecklistItem(draft,{8:1},i).complete,true)
 const locked={...draft,completion:{at:new Date().toISOString(),photos:{8:1}}}
 assert.equal(spatialSelectChecklistTask(locked,{},0),null)
 assert.ok(spatialNavigationBlock(locked,{},'next'))
})
