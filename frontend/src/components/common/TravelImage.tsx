import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getDestinationMedia } from '../../data/destinationMedia'

type TravelImageProps = { src?: string | null; alt: string; className?: string; imageClassName?: string; loading?: 'eager' | 'lazy' }

function fallbackFor(alt: string): string {
  const label = alt.toLocaleLowerCase()
  const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
  if (label.includes('hotel') || label.includes('accommodation') || label.includes('stay')) return photo('photo-1566073771259-6a8506099945')
  if (label.includes('market')) return photo('photo-1533900298318-6b8da08a523e')
  if (label.includes('bebinca') || label.includes('dessert')) return photo('photo-1488477181946-6428a0291777')
  if (label.includes('appam') || label.includes('poi bread') || label.includes('snack')) return photo('photo-1601050690597-df0568f70950')
  if (label.includes('fish curry') || label.includes('spice') || label.includes('food') || label.includes('meal') || label.includes('thali') || label.includes('cuisine') || label.includes('restaurant') || label.includes('cafe')) return photo('photo-1565557623262-b51c2513a641')
  const destinations: Array<[string, string]> = [
    ['goa', 'goa'], ['mumbai', 'mumbai'], ['puducherry', 'pondicherry'], ['pondicherry', 'pondicherry'],
    ['ooty', 'ooty'], ['nilgiri', 'ooty'], ['kerala', 'kerala'], ['munnar', 'munnar'], ['coorg', 'coorg'],
    ['kashmir', 'kashmir'], ['srinagar', 'kashmir'], ['dal lake', 'kashmir'], ['manali', 'manali'],
    ['himalaya', 'manali'], ['darjeeling', 'darjeeling'], ['udaipur', 'udaipur'], ['lake pichola', 'udaipur'],
    ['hyderabad', 'hyderabad'], ['charminar', 'hyderabad'], ['jaipur', 'jaipur'], ['agra', 'agra'], ['delhi', 'delhi'],
    ['jaisalmer', 'jaisalmer'], ['khajuraho', 'khajuraho'], ['andaman', 'andaman'], ['island', 'andaman'],
    ['kaziranga', 'kaziranga'], ['varanasi', 'varanasi'], ['rishikesh', 'rishikesh'], ['amritsar', 'amritsar'],
  ]
  const destination = destinations.find(([name]) => label.includes(name))
  if (destination) return getDestinationMedia(destination[1]).src
  if (label.includes('nature') || label.includes('scenic') || label.includes('forest') || label.includes('landscape') || label.includes('viewpoint')) return getDestinationMedia('munnar').src
  if (label.includes('church') || label.includes('basilica')) return getDestinationMedia('goa').src
  if (label.includes('attraction') || label.includes('temple') || label.includes('fort') || label.includes('heritage') || label.includes('historic') || label.includes('architecture')) return getDestinationMedia('jaipur').src
  return getDestinationMedia('kerala').src
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
