import { converter, formatHex, parse } from 'culori'

const toRgb = converter('rgb')
export function isColor(value: unknown): value is string {
  if (typeof value !== 'string' || !/^(#[\da-f]{6}|oklch\([^;{}]+\))$/i.test(value)) return false
  const parsed = parse(value)
  if (!parsed) return false
  const rgb = toRgb(parsed)
  return !!rgb && [rgb.r, rgb.g, rgb.b, rgb.alpha ?? 1].every(Number.isFinite) && (rgb.alpha ?? 1) >= 0 && (rgb.alpha ?? 1) <= 1
}
// The native picker only accepts opaque sRGB HEX. This approximation never replaces stored CSS until edited.
export function colorHex(value: string) { return formatHex(parse(value)) ?? '#000000' }
function channels(value: string) {
  const rgb = toRgb(parse(value)!)!
  return { values: [rgb.r, rgb.g, rgb.b].map(v => Math.max(0, Math.min(1, v))), alpha: rgb.alpha ?? 1 }
}
function luminance(rgb: number[]) {
  const linear = rgb.map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
}
export function colorContrast(foreground: string, background: string) {
  const fg = channels(foreground), bg = channels(background)
  // Composite a translucent background over white, then foreground over its visible background.
  const surface = bg.alpha === 1 ? bg.values : bg.values.map(v => v * bg.alpha + 1 - bg.alpha)
  const ink = fg.alpha === 1 ? fg.values : fg.values.map((v, i) => v * fg.alpha + surface[i] * (1 - fg.alpha))
  const x = luminance(ink), y = luminance(surface)
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05)
}
