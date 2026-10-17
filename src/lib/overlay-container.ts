import { createContext } from 'react'

/** Optional portal boundary for embedded app surfaces; undefined keeps Radix's body default. */
export const OverlayContainerContext = createContext<HTMLElement | null | undefined>(undefined)
