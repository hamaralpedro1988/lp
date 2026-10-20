import test from 'node:test'
import assert from 'node:assert/strict'
import { spatialBrands, resolveSpatialBrand, spatialBrandCSS } from '../src/data/spatial-brands.ts'
import { spatialTheme } from '../src/data/spatial-flow.ts'
import { contrast } from '../src/lib/theme.ts'

test('branding configuration preserves default and never writes semantic or product roles', () => {
  assert.equal(resolveSpatialBrand('unknown').id, 'spatial')
  assert.deepEqual(resolveSpatialBrand('spatial').tokens, {}, 'approved default uses existing CSS values')
  assert.equal(spatialBrands.length, 3)
  for (const brand of spatialBrands) {
    for (const key of Object.keys(brand.tokens)) {
      assert.ok(['accent','accent-subtle','accent-ink','canvas','canvas-start','canvas-mid','canvas-end','glow','wash-a','wash-b'].some(role => key === '--spatial-brand-' + role), 'Brand may only override icon decor or canvas: ' + key)
      assert.ok(!/progress|success|fail|warning|primary|section|border|input/.test(key), key)
    }
    if (brand.id === 'spatial') continue
    const t = brand.tokens
    assert.ok(contrast(t['--spatial-brand-accent-ink'], t['--spatial-brand-accent-subtle']) >= 4.5)
    for (const stop of ['canvas', 'canvas-start', 'canvas-mid', 'canvas-end']) {
      assert.ok(contrast(spatialTheme.light['muted-foreground'], t[`--spatial-brand-${stop}`]) >= 4.5, `${brand.name} ${stop}`)
    }
  }
  assert.ok(spatialBrandCSS.includes('html[data-assessment-version="5"][data-spatial-brand="mcdonalds"]'))
  assert.ok(!spatialBrandCSS.includes('--spatial-progress:'))
})
