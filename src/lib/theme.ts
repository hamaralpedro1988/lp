import creator from '../data/creator-theme.json' with { type: 'json' }
import { isColor, colorHex, colorContrast } from './theme-colors.ts'
export { isColor, colorHex }
export const colorTokens = [
  ['background', 'Fundo'], ['foreground', 'Texto principal'],
  ['card', 'Cartões'], ['card-foreground', 'Texto dos cartões'],
  ['popover', 'Menus e diálogos'], ['popover-foreground', 'Texto dos menus'],
  ['primary', 'Ação principal'], ['primary-foreground', 'Texto da ação'],
  ['secondary', 'Ação secundária'], ['secondary-foreground', 'Texto secundário'],
  ['muted', 'Superfície discreta'], ['muted-foreground', 'Texto de apoio'],
  ['accent', 'Hover e seleção'], ['accent-foreground', 'Texto em seleção'],
  ['destructive', 'Erro'], ['border', 'Bordas'], ['input', 'Bordas dos campos'], ['ring', 'Foco'],
  ['success', 'Sucesso'], ['success-foreground', 'Texto de sucesso'],
  ['warning', 'Aviso'], ['warning-foreground', 'Texto de aviso'],
  ['info', 'Informação'], ['info-foreground', 'Texto de informação'],
  ['chart-1', 'Gráfico 1'], ['chart-2', 'Gráfico 2'], ['chart-3', 'Gráfico 3'], ['chart-4', 'Gráfico 4'], ['chart-5', 'Gráfico 5'],
  ['sidebar', 'Fundo lateral'], ['sidebar-foreground', 'Texto lateral'],
  ['sidebar-primary', 'Ação lateral'], ['sidebar-primary-foreground', 'Texto da ação lateral'],
  ['sidebar-accent', 'Seleção lateral'], ['sidebar-accent-foreground', 'Texto da seleção lateral'],
  ['sidebar-border', 'Borda lateral'], ['sidebar-ring', 'Foco lateral'],
] as const
export const fonts = [
  { id: 'system', name: 'Sistema', stack: 'ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', name: 'Inter', stack: '"Inter Variable", sans-serif' },
  { id: 'roboto', name: 'Roboto', stack: '"Roboto Variable", sans-serif' },
  { id: 'lora', name: 'Lora', stack: '"Lora Variable", Georgia, serif' },
  { id: 'georgia', name: 'Georgia', stack: 'Georgia, serif' },
  { id: 'mono', name: 'Monospace', stack: 'ui-monospace, monospace' },
] as const
export type FontId = typeof fonts[number]['id']
export type Typography = { body: FontId; heading: FontId; size: number; lineHeight: number; headingWeight: number }
export const defaultTypography: Typography = { body: 'system', heading: 'system', size: 16, lineHeight: 1.5, headingWeight: 600 }
export const quickColors = ['#171717', '#ffffff', '#64748b', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
export type Token = typeof colorTokens[number][0]
export type Palette = Record<Token, string>
export type Theme = { light: Palette; dark: Palette; radius: number; typography: Typography }
export type Mode = 'light' | 'dark'
const extraLight = {
  success: '#dcfce7', 'success-foreground': '#166534', warning: '#fef3c7', 'warning-foreground': '#92400e', info: '#dbeafe', 'info-foreground': '#1e40af',
  'chart-1': '#2563eb', 'chart-2': '#0d9488', 'chart-3': '#d97706', 'chart-4': '#9333ea', 'chart-5': '#e11d48',
  sidebar: '#fafafa', 'sidebar-foreground': '#171717', 'sidebar-primary': '#262626', 'sidebar-primary-foreground': '#fafafa', 'sidebar-accent': '#f5f5f5', 'sidebar-accent-foreground': '#262626', 'sidebar-border': '#e5e5e5', 'sidebar-ring': '#737373',
}
const extraDark = {
  success: '#14532d', 'success-foreground': '#bbf7d0', warning: '#78350f', 'warning-foreground': '#fde68a', info: '#1e3a8a', 'info-foreground': '#bfdbfe',
  'chart-1': '#60a5fa', 'chart-2': '#2dd4bf', 'chart-3': '#fbbf24', 'chart-4': '#c084fc', 'chart-5': '#fb7185',
  sidebar: '#262626', 'sidebar-foreground': '#fafafa', 'sidebar-primary': '#e5e5e5', 'sidebar-primary-foreground': '#262626', 'sidebar-accent': '#404040', 'sidebar-accent-foreground': '#fafafa', 'sidebar-border': '#404040', 'sidebar-ring': '#a3a3a3',
}
const light: Palette = { ...extraLight,
  background: '#ffffff', foreground: '#171717', card: '#ffffff', 'card-foreground': '#171717',
  popover: '#ffffff', 'popover-foreground': '#171717', primary: '#262626', 'primary-foreground': '#fafafa',
  secondary: '#f5f5f5', 'secondary-foreground': '#262626', muted: '#f5f5f5', 'muted-foreground': '#737373',
  accent: '#f5f5f5', 'accent-foreground': '#262626', destructive: '#dc2626', border: '#e5e5e5', input: '#e5e5e5', ring: '#737373',
}
const dark: Palette = { ...extraDark,
  background: '#171717', foreground: '#fafafa', card: '#262626', 'card-foreground': '#fafafa',
  popover: '#262626', 'popover-foreground': '#fafafa', primary: '#e5e5e5', 'primary-foreground': '#262626',
  secondary: '#404040', 'secondary-foreground': '#fafafa', muted: '#404040', 'muted-foreground': '#b3b3b3',
  accent: '#404040', 'accent-foreground': '#fafafa', destructive: '#f87171', border: '#404040', input: '#525252', ring: '#a3a3a3',
}
export const creatorTheme: Theme = { light: { ...light, ...creator.light }, dark: { ...dark, ...creator.dark }, radius: 7.2, typography: defaultTypography }
export const presets = [
  { id: 'creator', name: 'O teu tema', color: creator.light['chart-3'], theme: creatorTheme },
  { id: 'neutral', name: 'Neutro', color: '#262626', theme: { light, dark, radius: 10, typography: defaultTypography } },
  { id: 'ocean', name: 'Oceano', color: '#1d4ed8', theme: { light: { ...light, primary: '#1d4ed8', ring: '#2563eb', accent: '#eff6ff', 'accent-foreground': '#1e3a8a' }, dark: { ...dark, primary: '#93c5fd', 'primary-foreground': '#172554', ring: '#60a5fa', accent: '#1e3a5f' }, radius: 12, typography: defaultTypography } },
  { id: 'forest', name: 'Floresta', color: '#166534', theme: { light: { ...light, primary: '#166534', ring: '#15803d', accent: '#f0fdf4', 'accent-foreground': '#14532d' }, dark: { ...dark, primary: '#86efac', 'primary-foreground': '#052e16', ring: '#4ade80', accent: '#14532d' }, radius: 8, typography: defaultTypography } },
  { id: 'plum', name: 'Ameixa', color: '#7e22ce', theme: { light: { ...light, primary: '#7e22ce', ring: '#9333ea', accent: '#faf5ff', 'accent-foreground': '#581c87' }, dark: { ...dark, primary: '#d8b4fe', 'primary-foreground': '#3b0764', ring: '#c084fc', accent: '#581c87' }, radius: 16, typography: defaultTypography } },
  ...[
    ['ruby', 'Rubi', '#be123c', '#ffe4e6', '#fda4af', '#4c0519'],
    ['amber', 'Âmbar', '#b45309', '#fffbeb', '#fcd34d', '#451a03'],
    ['teal', 'Turquesa', '#0f766e', '#f0fdfa', '#5eead4', '#042f2e'],
    ['indigo', 'Índigo', '#4338ca', '#eef2ff', '#a5b4fc', '#1e1b4b'],
    ['rose', 'Rosa', '#be185d', '#fdf2f8', '#f9a8d4', '#500724'],
    ['slate', 'Ardósia', '#334155', '#f1f5f9', '#cbd5e1', '#0f172a'],
  ].map(([id, name, color, soft, bright, deep]) => ({ id, name, color, theme: {
    light: { ...light, primary: color, ring: color, accent: soft, 'accent-foreground': deep, 'sidebar-primary': color, 'sidebar-accent': soft, 'sidebar-accent-foreground': deep },
    dark: { ...dark, primary: bright, 'primary-foreground': deep, ring: bright, accent: deep, 'sidebar-primary': bright, 'sidebar-primary-foreground': deep, 'sidebar-accent': deep },
    radius: 10, typography: defaultTypography,
  } })),
] satisfies { id: string; name: string; color: string; theme: Theme }[]
export const defaultTheme: Theme = presets[0].theme
export const legacyStorageKey = 'lp-theme-studio-v1'
export const storageKey = 'lp-theme-studio-v2'
export function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== 'object') return false
  const t = value as Theme
  const fontValid = (id: unknown) => fonts.some(font => font.id === id)
  const type = t.typography
  if (!type || !fontValid(type.body) || !fontValid(type.heading) || !Number.isFinite(type.size) || type.size < 14 || type.size > 20 || !Number.isFinite(type.lineHeight) || type.lineHeight < 1.2 || type.lineHeight > 1.8 || ![400,500,600,700].includes(type.headingWeight)) return false
  return typeof t.radius === 'number' && Number.isFinite(t.radius) && t.radius >= 0 && t.radius <= 24 &&
    (['light', 'dark'] as const).every(mode => t[mode] && colorTokens.every(([key]) => isColor(t[mode][key])))
}
// Fill new tokens without discarding themes saved by previous editor versions.
export function migrateTheme(value: unknown): Theme {
  if (!value || typeof value !== 'object') return structuredClone(defaultTheme)
  const saved = value as Partial<Theme>
  const candidate = { ...saved, light: { ...light, ...saved.light }, dark: { ...dark, ...saved.dark }, typography: saved.typography ?? { ...defaultTypography } }
  return isTheme(candidate) ? candidate : structuredClone(defaultTheme)
}
function typographyCSS(type: Typography) {
  return `  --font-body: ${fonts.find(f => f.id === type.body)!.stack};\n  --font-heading: ${fonts.find(f => f.id === type.heading)!.stack};\n  --text-base: ${type.size / 16}rem;\n  --body-line-height: ${type.lineHeight};\n  --heading-weight: ${type.headingWeight};`
}
export function loadTheme(): Theme {
  try {
    const current = localStorage.getItem(storageKey)
    if (current) return migrateTheme(JSON.parse(current))
    // Apply the new project theme on first visit; retain the previous typography and draft.
    const previous = loadPreviousTheme()
    return { ...structuredClone(defaultTheme), typography: previous?.typography ?? { ...defaultTypography } }
  } catch { return structuredClone(defaultTheme) }
}
export function loadPreviousTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(legacyStorageKey)
    if (!raw) return null
    const previous = JSON.parse(raw)
    if (typeof previous?.radius !== 'number' || !previous.light || !previous.dark) return null
    return migrateTheme(previous)
  } catch { return null }
}
export function themeCSS(theme: Theme) {
  return ['/* Tema gerado no Component Studio. Substitui os tokens em src/styles/theme.css. */\n/* Inter, Roboto e Lora: instalar @fontsource-variable/{inter,roboto,lora} e importar o respetivo CSS quando usados. */',
    ...(['light', 'dark'] as const).map(mode => `${mode === 'light' ? ':root' : '.dark'} {\n  --radius: ${theme.radius / 16}rem;\n${mode === 'light' ? typographyCSS(theme.typography) + '\n' : ''}${colorTokens.map(([key]) => `  --${key}: ${theme[mode][key]};`).join('\n')}\n}`),
  `@layer base {\n  body { font-family: var(--font-body); font-size: var(--text-base); line-height: var(--body-line-height); }\n  h1, h2, h3, h4, h5, h6, [data-slot="card-title"], [data-slot="dialog-title"], [data-slot="sheet-title"], [data-slot="alert-dialog-title"] { font-family: var(--font-heading); font-weight: var(--heading-weight); }\n}`,
  `@layer utilities { :is(h1,h2,h3,h4,h5,h6,[data-slot="card-title"],[data-slot="dialog-title"],[data-slot="sheet-title"],[data-slot="alert-dialog-title"]) { font-weight: var(--heading-weight); } }`,
  ].join('\n\n') + '\n'
}
export function applyTheme(theme: Theme, mode: Mode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
  root.style.setProperty('--radius', `${theme.radius / 16}rem`)
  const type = theme.typography
  root.style.setProperty('--font-body', fonts.find(f => f.id === type.body)!.stack)
  root.style.setProperty('--font-heading', fonts.find(f => f.id === type.heading)!.stack)
  root.style.setProperty('--text-base', `${type.size / 16}rem`)
  root.style.setProperty('--body-line-height', String(type.lineHeight))
  root.style.setProperty('--heading-weight', String(type.headingWeight))
  colorTokens.forEach(([key]) => root.style.setProperty(`--${key}`, theme[mode][key]))
}
export const contrast = colorContrast
