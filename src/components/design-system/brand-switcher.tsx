import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { resolveSpatialBrand, spatialBrands, spatialBrandCSS, type SpatialBrand, type SpatialBrandId } from '@/data/spatial-brands'

export function SpatialBrandStyles() { return <style data-spatial-brand-config>{spatialBrandCSS}</style> }
export function SpatialBrandSwitcher({ brand, onChange }: { brand: SpatialBrand; onChange: (id: SpatialBrandId) => void }) {
  const id = useId()
  return <div className="spatial-brand-switcher"><label htmlFor={id}>Brand preview</label><Select value={brand.id} onValueChange={value => onChange(resolveSpatialBrand(value).id)}><SelectTrigger id={id} aria-label="Brand preview"><SelectValue/></SelectTrigger><SelectContent>{spatialBrands.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
}
