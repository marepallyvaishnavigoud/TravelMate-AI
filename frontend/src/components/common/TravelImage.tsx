import { useState } from 'react'
import { ImageOff } from 'lucide-react'

type TravelImageProps = { src: string; alt: string; className?: string; imageClassName?: string; loading?: 'eager' | 'lazy' }

export function TravelImage({ src, alt, className = '', imageClassName = '', loading = 'lazy' }: TravelImageProps) {
  const [failed, setFailed] = useState(false)
  const positionClass = className.split(/\s+/).includes('absolute') ? '' : 'relative'
  return <div className={`${positionClass} overflow-hidden bg-[#182536] ${className}`}>
    {!failed ? <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} className={`size-full object-cover ${imageClassName}`} /> : <div role="img" aria-label={alt} className="grid size-full place-items-center bg-[radial-gradient(ellipse_at_70%_20%,#35516b,#142237_55%,#101827)] text-white/40"><ImageOff size={24} aria-hidden="true" /></div>}
  </div>
}
