export const colorTokens = [
  ['background', 'Fundo'], ['foreground', 'Texto principal'],
  ['card', 'Cartões'], ['card-foreground', 'Texto dos cartões'],
  ['popover', 'Menus e diálogos'], ['popover-foreground', 'Texto dos menus'],
  ['primary', 'Ação principal'], ['primary-foreground', 'Texto da ação'],
  ['secondary', 'Ação secundária'], ['secondary-foreground', 'Texto secundário'],
  ['muted', 'Superfície discreta'], ['muted-foreground', 'Texto de apoio'],
  ['accent', 'Hover e seleção'], ['accent-foreground', 'Texto em seleção'],
  ['destructive', 'Erro'], ['border', 'Bordas'], ['input', 'Bordas dos campos'], ['ring', 'Foco'],
] as const
export type Token = typeof colorTokens[number][0]
export type Palette = Record<Token, string>
export type Theme = { light: Palette; dark: Palette; radius: number }
export type Mode = 'light' | 'dark'
const light: Palette = {
  background: '#ffffff', foreground: '#171717', card: '#ffffff', 'card-foreground': '#171717',
  popover: '#ffffff', 'popover-foreground': '#171717', primary: '#262626', 'primary-foreground': '#fafafa',
  secondary: '#f5f5f5', 'secondary-foreground': '#262626', muted: '#f5f5f5', 'muted-foreground': '#737373',
  accent: '#f5f5f5', 'accent-foreground': '#262626', destructive: '#dc2626', border: '#e5e5e5', input: '#e5e5e5', ring: '#737373',
}
const dark: Palette = {
  background: '#171717', foreground: '#fafafa', card: '#262626', 'card-foreground': '#fafafa',
  popover: '#262626', 'popover-foreground': '#fafafa', primary: '#e5e5e5', 'primary-foreground': '#262626',
  secondary: '#404040', 'secondary-foreground': '#fafafa', muted: '#404040', 'muted-foreground': '#b3b3b3',
  accent: '#404040', 'accent-foreground': '#fafafa', destructive: '#f87171', border: '#404040', input: '#525252', ring: '#a3a3a3',
}
export const presets = [
  { id: 'neutral', name: 'Neutro', color: '#262626', theme: { light, dark, radius: 10 } },
  { id: 'ocean', name: 'Oceano', color: '#1d4ed8', theme: { light: { ...light, primary: '#1d4ed8', ring: '#2563eb', accent: '#eff6ff', 'accent-foreground': '#1e3a8a' }, dark: { ...dark, primary: '#93c5fd', 'primary-foreground': '#172554', ring: '#60a5fa', accent: '#1e3a5f' }, radius: 12 } },
  { id: 'forest', name: 'Floresta', color: '#166534', theme: { light: { ...light, primary: '#166534', ring: '#15803d', accent: '#f0fdf4', 'accent-foreground': '#14532d' }, dark: { ...dark, primary: '#86efac', 'primary-foreground': '#052e16', ring: '#4ade80', accent: '#14532d' }, radius: 8 } },
  { id: 'plum', name: 'Ameixa', color: '#7e22ce', theme: { light: { ...light, primary: '#7e22ce', ring: '#9333ea', accent: '#faf5ff', 'accent-foreground': '#581c87' }, dark: { ...dark, primary: '#d8b4fe', 'primary-foreground': '#3b0764', ring: '#c084fc', accent: '#581c87' }, radius: 16 } },
] satisfies { id: string; name: string; color: string; theme: Theme }[]
export const defaultTheme: Theme = presets[0].theme
export const storageKey = 'lp-theme-studio-v1'
export function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== 'object') return false
  const t = value as Theme
  return typeof t.radius === 'number' && Number.isFinite(t.radius) && t.radius >= 0 && t.radius <= 24 &&
    (['light', 'dark'] as const).every(mode => t[mode] && colorTokens.every(([key]) => typeof t[mode][key] === 'string' && /^#[\da-f]{6}$/i.test(t[mode][key])))
}
export function loadTheme(): Theme {
  try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null'); return isTheme(value) ? value : structuredClone(defaultTheme) } catch { return structuredClone(defaultTheme) }
}
export function themeCSS(theme: Theme) {
  return ['/* Tema gerado no Component Studio. Substitui os tokens correspondentes em src/styles/theme.css. */',
    ...(['light', 'dark'] as const).map(mode => `${mode === 'light' ? ':root' : '.dark'} {\n  --radius: ${theme.radius / 16}rem;\n${colorTokens.map(([key]) => `  --${key}: ${theme[mode][key]};`).join('\n')}\n}`),
  ].join('\n\n') + '\n'
}
export function applyTheme(theme: Theme, mode: Mode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
  root.style.setProperty('--radius', `${theme.radius / 16}rem`)
  colorTokens.forEach(([key]) => root.style.setProperty(`--${key}`, theme[mode][key]))
}
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
}
export function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) }
