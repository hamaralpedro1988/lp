import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { coreComponents, componentCode, parseSpatialTokens } from '../src/data/design-system/catalog.ts'
import { rosaPatterns } from '../src/data/design-system/rosa-patterns.ts'
import { createExplorerDraft } from '../src/data/design-system/fixtures.ts'
import { flowMissing } from '../src/data/flow-draft.ts'
import { spatialCompleteIndices } from '../src/data/spatial-flow.ts'

test('Explorer manifest covers the actual installed inventory without inventing components', () => {
  const inventory=readdirSync(new URL('../src/components/ui/',import.meta.url)).filter(name=>name.endsWith('.tsx')).map(name=>name.replace('.tsx','')).sort()
  assert.deepEqual(coreComponents.map(item=>item.id).sort(),inventory)
  for(const item of coreComponents) {
    assert.ok(item.purpose && item.avoid && item.keyboard && item.tokens && item.states)
    assert.ok(componentCode(item).includes(`@/components/ui/${item.id}`))
    assert.ok(componentCode(item).includes(item.code))
  }
})
test('Foundations token catalog reads the actual shared root declarations and keeps aliases', () => {
  const css=readFileSync(new URL('../src/styles/spatial-theme.css',import.meta.url),'utf8')
  const tokens=parseSpatialTokens(css)
  assert.equal(tokens.find(token=>token.name==='--spatial-primary')?.value,'#28253c')
  assert.equal(tokens.find(token=>token.name==='--spatial-canvas')?.value,'var(--spatial-brand-canvas)')
  assert.equal(new Set(tokens.map(token=>token.name)).size,tokens.length)
  for(const category of ['Color','Typography','Spacing','Shape & elevation','Motion','Brand aliases']) assert.ok(tokens.some(token=>token.category===category))
  const changed=parseSpatialTokens(css.replace('--spatial-primary:#28253c','--spatial-primary:#123456'))
  assert.equal(changed.find(token=>token.name==='--spatial-primary')?.value,'#123456','catalog tracks theme edits automatically')
})
test('Rosa fixtures use real validation and stay independently editable', () => {
  const first=createExplorerDraft('Unanswered'), second=createExplorerDraft('Unanswered')
  first.answers[1]='fail';first.notes[8]='A preview note'
  assert.equal(second.answers[1],undefined)
  assert.equal(second.notes[8],undefined)
  assert.equal(createExplorerDraft('Unanswered').answers[1],undefined)
  const required=createExplorerDraft('Required evidence')
  assert.ok(flowMissing(required).includes(8))
  assert.ok(!flowMissing(required,{8:1}).includes(8))
  assert.equal(spatialCompleteIndices(required).length,1)
  const complete=createExplorerDraft('Complete')
  assert.deepEqual(flowMissing(complete),[])
  assert.ok(Object.values(complete.answers).includes('fail'),'completed work does not mean an overall pass')
  assert.ok(!Object.values(complete.answers).includes('coaching'))
})
test('Rosa pattern references resolve to the same exports used by the product', () => {
  const sources=['spatial-primitives','spatial-journey','spatial-guidance','spatial-submission','spatial-before-start'].map(file=>readFileSync(new URL(`../src/components/assessment/${file}.tsx`,import.meta.url),'utf8')).join('\n')
  for(const pattern of rosaPatterns) {
    for(const name of pattern.component.split(' + '))assert.ok(sources.includes(`export function ${name}(`),name)
    assert.ok(pattern.purpose && pattern.anatomy && pattern.states && pattern.rationale && pattern.screens)
  }
  const flow=readFileSync(new URL('../src/pages/assessment-flow.tsx',import.meta.url),'utf8')
  for(const name of ['SpatialNotification','SpatialPeopleCard','SpatialReviewSummary','SpatialReviewList','SpatialSubmission'])assert.ok(flow.includes(`<${name}`),name)
})
