import test from 'node:test'
import assert from 'node:assert/strict'
import {focusedCriteria as criteria,validAnswer,isComplete,answerSummary} from '../src/data/focused-criteria.ts'
import {migrateCompactDraft,normalizeFocusedDraft} from '../src/data/focused-draft.ts'
const item=(id:string)=>criteria.find(c=>c.id===id)!
test('V2.3 supplied tasks cover nine entries and five distinct response types',()=>{
  assert.equal(criteria.length,9)
  assert.equal(new Set(criteria.map(c=>c.id)).size,9)
  assert.equal(new Set(criteria.map(c=>c.type)).size,5)
  assert.equal(criteria.filter(c=>c.evidence==='required').map(c=>c.id).join(','),'p2')
})
test('each response type validates values without inferring a pass/fail score',()=>{
  assert.equal(validAnswer(item('p1'),'met'),true)
  for(const value of [0,'1',6,1.5,Infinity])assert.equal(validAnswer(item('f2'),value),false)
  assert.equal(validAnswer(item('f2'),5),true)
  assert.equal(validAnswer(item('p3'),0),true)
  for(const value of [-1,NaN,Infinity,'125'])assert.equal(validAnswer(item('p3'),value),false)
  assert.equal(validAnswer(item('f3'),'Small batch'),true)
  assert.equal(validAnswer(item('f3'),'Unknown programme'),false)
  assert.equal(validAnswer(item('f4'),[]),false)
  assert.equal(validAnswer(item('f4'),[item('f4').values![0]]),true)
  assert.equal(validAnswer(item('f4'),[item('f4').values![0],item('f4').values![0]]),false)
  assert.equal(answerSummary(item('p3'),0),'0 g')
  assert.equal(answerSummary(item('f2'),1),'1 / 5')
})
test('required evidence counts completion independently of the binary outcome',()=>{
  for(const answer of ['met','not']){
    assert.equal(isComplete(item('p2'),{p2:answer},{},{}),false)
    assert.equal(isComplete(item('p2'),{p2:answer},{p2:'   '},{}),false)
    assert.equal(isComplete(item('p2'),{p2:answer},{p2:'Observation'},{}),true)
    assert.equal(isComplete(item('p2'),{p2:answer},{},{p2:1}),true)
  }
  assert.equal(isComplete(item('p2'),{},{p2:'Observation'},{}),false)
  assert.equal(isComplete(item('f2'),{f2:1},{},{}),true)
})
test('legacy migration only retains semantically compatible observations',()=>{
  const old={answers:{p1:'met',p2:'not',p3:'met',f1:'not',f2:'met',f3:'met',f4:'not',c1:'met',c2:'not',c3:'met'},notes:{p1:'A',p2:'B',f2:'Old binary note',c2:'C'}}
  const migrated=migrateCompactDraft(old)
  assert.deepEqual(migrated.answers,{p1:'met',p2:'not',c2:'not'})
  assert.deepEqual(migrated.notes,{p1:'A',p2:'B',c2:'C'})
  assert.equal(old.notes.f2,'Old binary note')
})
test('normalization retains numeric/multi drafts and drops malformed answers',()=>{
  const value=normalizeFocusedDraft({active:'f4',answers:{p1:'invalid',p3:0,f2:7,f3:'Small batch'},numeric:{p3:'125,5'},multi:{f4:[item('f4').values![0],'invalid']},notes:{p2:'Observed'},guides:{p1:true}})
  assert.deepEqual(value.answers,{p3:0,f3:'Small batch'})
  assert.equal(value.numeric.p3,'125,5')
  assert.deepEqual(value.multi.f4,[item('f4').values![0]])
  assert.equal(value.active,'f4')
  assert.equal(value.guides.p1,true)
})
