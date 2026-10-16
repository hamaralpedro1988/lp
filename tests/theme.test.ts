import test from 'node:test'
import assert from 'node:assert/strict'
import { colorTokens, contrast, defaultTheme, defaultTypography, isTheme, migrateTheme, presets, themeCSS } from '../src/lib/theme.ts'

test('legacy saved themes retain both palettes and radius while gaining new controls', () => {
  const legacy = { radius: 19, light: { primary: '#123456', background: '#f0f0f0' }, dark: { primary: '#abcdef' } }
  const migrated = migrateTheme(legacy)
  assert.equal(migrated.light.primary, '#123456')
  assert.equal(migrated.dark.primary, '#abcdef')
  assert.equal(migrated.light.background, '#f0f0f0')
  assert.equal(migrated.radius, 19)
  assert.deepEqual(migrated.typography, defaultTypography)
  assert.ok(isTheme(migrated))
  assert.equal(Object.keys(migrated.light).length, colorTokens.length)
  assert.deepEqual(legacy.light, { primary: '#123456', background: '#f0f0f0' })
})
test('invalid persisted values are rejected and safely reset', () => {
  for (const value of [null, {}, { ...defaultTheme, radius: -1 }, { ...defaultTheme, typography: { ...defaultTypography, body: 'bad-font' } }, { ...defaultTheme, light: { ...defaultTheme.light, primary: 'url(unsafe)' } }]) {
    assert.equal(isTheme(value), false)
    assert.deepEqual(migrateTheme(value), defaultTheme)
  }
})
test('every preset contains complete valid palettes with AA primary text', () => {
  assert.equal(presets.length, 10)
  for (const preset of presets) {
    assert.ok(isTheme(preset.theme), preset.id)
    for (const mode of ['light','dark'] as const) {
      assert.ok(contrast(preset.theme[mode].primary, preset.theme[mode]['primary-foreground']) >= 4.5, `${preset.id} ${mode}`)
    }
  }
})
test('export includes custom typography and all colors in both modes', () => {
  const theme = structuredClone(defaultTheme)
  theme.typography = { body: 'inter', heading: 'lora', size: 18, lineHeight: 1.8, headingWeight: 700 }
  const css = themeCSS(theme)
  assert.match(css, /--font-body: "Inter Variable"/)
  assert.match(css, /--font-heading: "Lora Variable"/)
  assert.match(css, /--text-base: 1.125rem/)
  assert.match(css, /--heading-weight: 700/)
  assert.match(css, /\.dark \{/)
  for (const [token] of colorTokens) assert.equal(css.split(`--${token}:`).length - 1, 2)
})
test('contrast handles reference values and symmetry', () => {
  assert.equal(contrast('#ffffff','#000000'), 21)
  assert.equal(contrast('#123456','#123456'), 1)
  assert.equal(contrast('#123456','#abcdef'), contrast('#abcdef','#123456'))
})
