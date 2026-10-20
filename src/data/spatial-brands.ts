/** Branding changes icon decor and canvas atmosphere only; product/text/status roles stay fixed. */
export type SpatialBrandId = 'spatial' | 'mcdonalds' | 'burger-king' | 'crimson' | 'ocean'
export type SpatialBrand = { id: SpatialBrandId; name: string; accent: string; tokens: Record<string, string> }
function mix(accent: string, base: string, amount: number) {
  const channels = (value: string) => [1, 3, 5].map(offset => parseInt(value.slice(offset, offset + 2), 16))
  const a = channels(accent), b = channels(base)
  return '#' + a.map((value, index) => Math.round(value * amount + b[index] * (1 - amount)).toString(16).padStart(2, '0')).join('')
}
function atmosphere(accent: string): Record<string, string> {
  return {
    '--spatial-brand-accent': accent,
    '--spatial-brand-accent-subtle': mix(accent, '#fafafd', .065),
    '--spatial-brand-accent-ink': mix(accent, '#242339', .45),
    '--spatial-brand-canvas': mix(accent, '#f9f9fc', .035),
    '--spatial-brand-canvas-start': mix(accent, '#fcfcff', .06),
    '--spatial-brand-canvas-mid': mix(accent, '#ffffff', .12),
    '--spatial-brand-canvas-end': mix(accent, '#fdfdff', .14),
    '--spatial-brand-glow': mix(accent, '#f3f2fa', .085) + '50',
    '--spatial-brand-wash-a': mix(accent, '#ffffff', .2) + 'ad',
    '--spatial-brand-wash-b': mix(accent, '#e5eaf0', .05) + 'b2',
  }
}
export const spatialBrands: readonly SpatialBrand[] = [
  // Empty overrides retain the approved Spatial CSS defaults exactly.
  { id: 'spatial', name: 'Neutral', accent: '#7363bd', tokens: {} },
  { id: 'mcdonalds', name: "McDonald's", accent: '#db0007', tokens: atmosphere('#db0007') },
  { id: 'burger-king', name: 'Burger King', accent: '#d66a12', tokens: atmosphere('#d66a12') },
]
export const customerBrands: readonly SpatialBrand[] = [spatialBrands[0],
  { id: 'crimson', name: 'Crimson', accent: '#bd4e55', tokens: { ...atmosphere('#bd4e55'), '--spatial-brand-wash-a':'#f7d9dba8', '--spatial-brand-wash-b':'#dfe4edb2' } },
  { id: 'ocean', name: 'Ocean', accent: '#347eaf', tokens: { ...atmosphere('#347eaf'), '--spatial-brand-wash-a':'#cdeafaad', '--spatial-brand-wash-b':'#d9e7eeb7' } },
]
const allBrands = [...spatialBrands, ...customerBrands.slice(1)]
export function resolveSpatialBrand(value: string | null | undefined): SpatialBrand {
  return allBrands.find(brand => brand.id === value) ?? spatialBrands[0]
}
export function brandTokenDeclarations(brand: SpatialBrand) {
  return Object.entries(brand.tokens).map(([key, value]) => `${key}:${value};`).join('')
}
export const spatialBrandCSS = allBrands.map(brand => `html[data-assessment-version="5"][data-spatial-brand="${brand.id}"]{${brandTokenDeclarations(brand)}}`).join('\n')
