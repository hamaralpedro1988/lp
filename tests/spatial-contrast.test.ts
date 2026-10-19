import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contrast } from '../src/lib/theme.ts'
import { spatialBrands } from '../src/data/spatial-brands.ts'

const css = readFileSync(new URL('../src/styles/spatial-theme.css', import.meta.url), 'utf8')
const root = css.slice(css.indexOf('html[data-assessment-version="5"] {'), css.indexOf('\n}', css.indexOf('html[data-assessment-version="5"] {')))
const defaults = Object.fromEntries([...root.matchAll(/(--spatial-[a-z-]+):([^;\n]+);/g)].map(m => [m[1], m[2].trim()]))

test('WCAG AA text across every gradient stop and brand, including selected rows', () => {
  for (const brand of spatialBrands) {
    const tokens = {...defaults, ...brand.tokens}
    const color = (key: string): string => { const value = tokens['--spatial-' + key]; const alias = /^var\(--spatial-([a-z-]+)\)$/.exec(value); return alias ? color(alias[1]) : value }
    const check = (fg: string, bg: string, target: number, label: string) => assert.ok(contrast(fg,bg) >= target, brand.name + ' ' + label + ': ' + contrast(fg,bg))
    for (const surface of ['canvas','brand-canvas-start','brand-canvas-mid','brand-canvas-end','surface','surface-tint','choice','selected']) {
      for (const ink of ['ink','muted']) check(color(ink),color(surface),4.5,ink + ' on ' + surface)
    }
    for (const [ink, surface] of [['section-ink','section-bg'],['warning-ink','warning-bg'],['success-ink','success-bg'],['fail-ink','fail-bg'],['brand-accent-ink','brand-accent-subtle']]) check(color(ink),color(surface),4.5,ink)
    check('#ffffff',color('primary'),4.5,'primary button and active tab')
    check('#ffffff',color('primary-hover'),4.5,'primary hover')
    check('#ffffff','#303033',4.5,'Android-style toast')
  }
})

test('WCAG non-text contrast for fields, radios, switches, progress and focus', () => {
  const color = (key: string): string => { const value=defaults['--spatial-'+key]; const alias=/^var\(--spatial-([a-z-]+)\)$/.exec(value);return alias ? color(alias[1]) : value }
  for (const surface of ['surface','surface-tint','choice']) {
    for (const role of ['field-line','control-line','focus']) assert.ok(contrast(color(role),color(surface)) >= 3, role+' on '+surface)
  }
  assert.ok(contrast(color('progress'),color('progress-track')) >= 3)
  assert.ok(contrast('#ffffff',color('switch-off')) >= 3)
  assert.ok(contrast('#ffffff',color('primary')) >= 3)
  for (const state of ['success','fail']) assert.ok(contrast(color(state+'-line'),color(state+'-bg')) >= 3)
})
