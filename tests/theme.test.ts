import { readFileSync } from 'node:fs'
import creator from '../src/data/creator-theme.json' with { type: 'json' }
import { isColor, colorHex } from '../src/lib/theme-colors.ts'
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
  assert.equal(presets.length, 11)
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

test('creator values remain exact in global styles, default palettes and exported CSS', () => {
  const source = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8')
  const exported = themeCSS(defaultTheme)
  for (const mode of ['light', 'dark'] as const) {
    const selector = mode === 'light' ? ':root' : '.dark'
    const sourceBlock = source.slice(source.indexOf(selector + ' {')).split('}')[0]
    const exportBlock = exported.slice(exported.indexOf(selector)).split('}')[0]
    for (const [token, value] of Object.entries(creator[mode])) {
      assert.equal(defaultTheme[mode][token as keyof typeof defaultTheme.light], value)
      assert.ok(sourceBlock.includes(`--${token}: ${value};`))
      assert.ok(exportBlock.includes(`--${token}: ${value};`))
    }
  }
  assert.equal(defaultTheme.radius / 16, .45)
  assert.ok(exported.includes('--radius: 0.45rem;'))
})
test('OKLCH validation, alpha, picker approximation and contrast reference values', () => {
  for (const value of ['oklch(1 0 0 / 10%)', 'oklch(0.148 0.004 228.8)', '#abcdef']) assert.ok(isColor(value))
  for (const value of ['url(test)', 'oklch(nope)', 'oklch(1 0 0); color:red', '#ff']) assert.equal(isColor(value), false)
  assert.equal(colorHex('oklch(1 0 0 / 10%)'), '#ffffff')
  assert.ok(Math.abs(contrast('oklch(1 0 0)', 'oklch(0 0 0)') - 21) < 1e-10)
  assert.ok(Math.abs(contrast('oklch(0 0 0 / 50%)', '#ffffff') - contrast('#808080', '#ffffff')) < .04)
})
