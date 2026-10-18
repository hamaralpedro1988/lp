import { useLayoutEffect, useState } from 'react'
import { resolveSpatialBrand, type SpatialBrandId } from '@/data/spatial-brands'

/** URL-scoped demonstration preference, with no tenant or assessment storage writes. */
export function useSpatialBrand(enabled = true) {
  const [id, setId] = useState(() => resolveSpatialBrand(new URLSearchParams(location.search).get('brand')).id)
  const brand = resolveSpatialBrand(id)
  useLayoutEffect(() => {
    if (!enabled) return
    const root = document.documentElement, previous = root.dataset.spatialBrand
    root.dataset.spatialBrand = id
    return () => { if (previous) root.dataset.spatialBrand = previous; else delete root.dataset.spatialBrand }
  }, [id, enabled])
  useLayoutEffect(() => {
    if (!enabled) return
    const changed = () => setId(resolveSpatialBrand(new URLSearchParams(location.search).get('brand')).id)
    window.addEventListener('popstate', changed)
    return () => window.removeEventListener('popstate', changed)
  }, [enabled])
  function setBrand(next: SpatialBrandId) {
    const value = resolveSpatialBrand(next).id
    setId(value)
    const url = new URL(location.href)
    if (value === 'spatial') url.searchParams.delete('brand'); else url.searchParams.set('brand', value)
    history.replaceState(history.state, '', url)
  }
  return { brand, setBrand }
}
