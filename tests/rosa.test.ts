import test from 'node:test'
import assert from 'node:assert/strict'
import { criteria, sections, needsEvidence } from '../src/data/rosa-criteria.ts'

test('supplied checklist has ten unique criteria grouped 3/4/3', () => {
  assert.equal(criteria.length,10)
  assert.equal(new Set(criteria.map(c=>c.id)).size,10)
  assert.deepEqual(sections.map(s=>criteria.filter(c=>c.section===s).length),[3,4,3])
  assert.equal(criteria.find(c=>c.id==='p1')?.title,'Check fryer readiness and oil conditions')
})
test('illustrative evidence rule responds to result, notes and actual session media', () => {
  const item=criteria.find(c=>c.id==='f2')!
  assert.equal(needsEvidence(item,{}, {}, {}),false)
  assert.equal(needsEvidence(item,{f2:'met'}, {}, {}),false)
  assert.equal(needsEvidence(item,{f2:'not'}, {}, {}),true)
  assert.equal(needsEvidence(item,{f2:'not'}, {f2:'   '}, {}),true)
  assert.equal(needsEvidence(item,{f2:'not'}, {f2:'Observed'}, {}),false)
  assert.equal(needsEvidence(item,{f2:'not'}, {}, {f2:1}),false)
  assert.equal(needsEvidence(criteria[0],{p1:'not'}, {}, {}),false)
})
