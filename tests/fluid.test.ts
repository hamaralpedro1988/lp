import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { customerBrands, resolveSpatialBrand } from '../src/data/spatial-brands.ts'
import { contrast } from '../src/lib/theme.ts'
const read = (file: string) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8')
test('Fluid materials cannot redefine the shared semantic roles', () => {
  const semantics = read('styles/semantic-tokens.css')
  const fluid = read('styles/fluid-theme.css')
  const spatial = read('styles/spatial-theme.css')
  for (const role of ['success-bg','success-ink','success-line','fail-bg','fail-ink','fail-line','warning-bg','warning-ink','warning-line','section-bg','section-ink','progress','progress-track']) {
    assert.ok(semantics.includes('--spatial-' + role + ':'))
    assert.ok(!fluid.includes('--spatial-' + role + ':'))
    assert.ok(!spatial.includes('--spatial-' + role + ':'))
  }
  assert.ok(fluid.includes('prefers-reduced-motion'))
  assert.ok(fluid.includes('prefers-reduced-transparency'))
  assert.ok(fluid.includes('data-assessment-version="5"'))
})
test('three independent customer identities preserve approved default and text contrast', () => {
  assert.deepEqual(customerBrands.map(brand => brand.name), ['Neutral','Crimson','Ocean'])
  assert.deepEqual(customerBrands[0].tokens,{})
  for (const brand of customerBrands) {
    assert.equal(resolveSpatialBrand(brand.id),brand)
    for (const role of Object.keys(brand.tokens)) assert.ok(role.startsWith('--spatial-brand-'))
    if (brand.id !== 'spatial') {
      assert.ok(contrast(brand.tokens['--spatial-brand-accent-ink'], brand.tokens['--spatial-brand-accent-subtle']) >= 4.5)
      for (const stop of ['canvas-start','canvas-mid','canvas-end']) assert.ok(contrast('#625c75',brand.tokens['--spatial-brand-'+stop]) >= 4.5)
    }
  }
})
test('visual preference is independent of assessment persistence and defaults to Spatial', () => {
  const hook=read('hooks/use-visual-theme.ts')
  assert.ok(hook.includes("value === 'fluid' ? 'fluid' : 'spatial'"))
  assert.ok(!/localStorage|sessionStorage|reload\(/.test(hook))
  assert.ok(hook.includes('root.dataset.visualTheme'))
  assert.ok(hook.includes("window.addEventListener('popstate'"))
})
