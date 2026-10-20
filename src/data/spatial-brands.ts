/** Branding changes icon decor and canvas atmosphere only; product/text/status roles stay fixed. */
export type SpatialBrandId = 'spatial' | 'mcdonalds' | 'burger-king'
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
  }
}
export const spatialBrands: readonly SpatialBrand[] = [
  // Empty overrides retain the approved Spatial CSS defaults exactly.
  { id: 'spatial', name: 'Spatial', accent: '#7363bd', tokens: {} },
  { id: 'mcdonalds', name: "McDonald's", accent: '#db0007', tokens: atmosphere('#db0007') },
  { id: 'burger-king', name: 'Burger King', accent: '#d66a12', tokens: atmosphere('#d66a12') },
]
export function resolveSpatialBrand(value: string | null | undefined): SpatialBrand {
  return spatialBrands.find(brand => brand.id === value) ?? spatialBrands[0]
}
export function brandTokenDeclarations(brand: SpatialBrand) {
  return Object.entries(brand.tokens).map(([key, value]) => `${key}:${value};`).join('')
}
export const spatialBrandCSS = spatialBrands.map(brand => `html[data-assessment-version="5"][data-spatial-brand="${brand.id}"]{${brandTokenDeclarations(brand)}}`).join('\n')
