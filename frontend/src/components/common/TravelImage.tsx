import { useState } from 'react'
import { ImageOff } from 'lucide-react'

type TravelImageProps = { src?: string | null; alt: string; className?: string; imageClassName?: string; loading?: 'eager' | 'lazy' }

function fallbackFor(alt: string): string {
  const label = alt.toLocaleLowerCase()
  if (label.includes('heritage house')) return '/images/stay-heritage.svg'
  if (label.includes('garden view stay')) return '/images/stay-garden.svg'
  if (label.includes('riverside retreat')) return '/images/stay-riverside.svg'
  if (label.includes('hotel') || label.includes('accommodation')) return '/images/stay-garden.svg'
  if (label.includes('church') || label.includes('basilica')) return '/images/church.svg'
  if (label.includes('attraction') || label.includes('temple') || label.includes('fort') || label.includes('heritage') || label.includes('historic') || label.includes('architecture')) return '/images/heritage.svg'
  if (label.includes('bebinca') || label.includes('dessert')) return '/images/food-dessert.svg'
  if (label.includes('appam') || label.includes('poi bread') || label.includes('snack')) return '/images/food-snack.svg'
  if (label.includes('fish curry') || label.includes('spice')) return '/images/food-curry.svg'
  if (label.includes('food') || label.includes('meal') || label.includes('thali') || label.includes('cuisine') || label.includes('restaurant') || label.includes('cafe')) return '/images/food.svg'
  if (label.includes('market')) return '/images/market.svg'
  if (label.includes('nature') || label.includes('scenic') || label.includes('forest') || label.includes('landscape') || label.includes('viewpoint')) return '/images/nature.svg'
  if (label.includes('goa') || label.includes('mumbai') || label.includes('puducherry') || label.includes('pondicherry')) return '/images/goa.svg'
  if (label.includes('ooty') || label.includes('nilgiri')) return '/images/ooty.svg'
  if (label.includes('kerala') || label.includes('munnar') || label.includes('coorg')) return '/images/kerala.svg'
  if (label.includes('kashmir') || label.includes('srinagar') || label.includes('dal lake')) return '/images/kashmir.svg'
  if (label.includes('manali') || label.includes('himalaya') || label.includes('darjeeling')) return '/images/manali.svg'
  if (label.includes('udaipur') || label.includes('lake pichola')) return '/images/udaipur.svg'
  if (label.includes('hyderabad') || label.includes('charminar')) return '/images/hyderabad.svg'
  if (label.includes('jaipur') || label.includes('agra') || label.includes('delhi') || label.includes('jaisalmer') || label.includes('khajuraho')) return '/images/heritage.svg'
  if (label.includes('andaman') || label.includes('island')) return '/images/andaman.svg'
  if (label.includes('wildlife') || label.includes('kaziranga')) return '/images/wildlife.svg'
  if (label.includes('varanasi') || label.includes('rishikesh') || label.includes('amritsar')) return '/images/spiritual.svg'
  return '/images/hero-coast.svg'
}

export function TravelImage({ src, alt, className = '', imageClassName = '', loading = 'lazy' }: TravelImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [fallbackFailedSrc, setFallbackFailedSrc] = useState<string | null>(null)
  const positionClass = className.split(/\s+/).includes('absolute') ? '' : 'relative'
  const fallbackSrc = fallbackFor(alt)
  const imageSrc = src || fallbackSrc
  return <div className={`${positionClass} overflow-hidden bg-[#182536] ${className}`}>
    {failedSrc !== imageSrc ? <img src={imageSrc} alt={alt} loading={loading} onError={() => setFailedSrc(imageSrc)} className={`size-full object-cover ${imageClassName}`} /> : fallbackFailedSrc !== imageSrc ? <img src={fallbackSrc} alt={alt} loading="lazy" onError={() => setFallbackFailedSrc(imageSrc)} className={`size-full object-cover ${imageClassName}`} /> : <div role="img" aria-label={alt} className="grid size-full place-items-center bg-[radial-gradient(ellipse_at_70%_20%,#35516b,#142237_55%,#101827)] text-white/40"><ImageOff size={24} aria-hidden="true" /></div>}
  </div>
}
