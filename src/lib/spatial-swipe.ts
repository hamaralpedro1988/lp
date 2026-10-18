export type SwipeDirection = 'next' | 'back'
export function swipeAxis(dx: number, dy: number): 'horizontal' | 'vertical' | null {
  return Math.max(Math.abs(dx), Math.abs(dy)) <= 9 ? null : Math.abs(dx) > Math.abs(dy) * 1.25 ? 'horizontal' : 'vertical'
}
export function committedSwipe(dx: number, dy: number, elapsed: number, width: number): SwipeDirection | null {
  if (Math.abs(dx) < Math.abs(dy) * 1.25) return null
  const committed = Math.abs(dx) > Math.max(66, width * .19) || (Math.abs(dx) > 38 && Math.abs(dx) / Math.max(1, elapsed) > .52)
  return committed ? dx < 0 ? 'next' : 'back' : null
}

/** CSS minifiers can serialize millisecond tokens in seconds. WAAPI needs milliseconds. */
export function spatialMotionMilliseconds(value: string, fallback: number): number {
  const time = /^([\d.]+)(ms|s)$/.exec(value.trim())
  if (!time) return fallback
  const duration = Number(time[1]) * (time[2] === 's' ? 1000 : 1)
  return Number.isFinite(duration) && duration >= 0 ? duration : fallback
}
