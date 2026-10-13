import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getDestinationMedia } from '../../data/destinationMedia'

type TravelImageProps = { src?: string | null; alt: string; className?: string; imageClassName?: string; loading?: 'eager' | 'lazy' }

function fallbackFor(alt: string): string {
  const label = alt.toLocaleLowerCase()
  const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
  // Pick a stable, varied fallback per place name. The old category-first checks
  // caused every card in a category to repeat one image and hid location matches.
  const hash = [...label].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7)
  const pick = (ids: string[]) => photo(ids[hash % ids.length])
  if (label.includes('market')) return photo('photo-1533900298318-6b8da08a523e')
  if (label.includes('hotel') || label.includes('accommodation') || label.includes('stay')) return pick(['photo-1566073771259-6a8506099945', 'photo-1571896349842-33c89424de2d', 'photo-1542314831-068cd1dbfeeb'])
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
  if (destination && (label.includes('attraction') || label.includes('temple') || label.includes('fort') || label.includes('heritage') || label.includes('historic') || label.includes('architecture') || label.includes('monument') || label.includes('mosque'))) return getDestinationMedia(destination[1]).src
  if (label.includes('petrol') || label.includes('gas_station') || label.includes('gas station') || label.includes('fuel')) return pick(['photo-1545262810-77515befe149', 'photo-1519003722824-194d4455a60c'])
  if (label.includes('cafe') || label.includes('coffee_shop') || label.includes('coffee shop')) return pick(['photo-1501339847302-ac426a4a7cbb', 'photo-1445116572660-236099ec97a0', 'photo-1554118811-1e0d58224f24'])
  if (label.includes('restaurant') || label.includes('food') || label.includes('meal') || label.includes('thali') || label.includes('cuisine') || label.includes('bakery')) return pick(['photo-1565557623262-b51c2513a641', 'photo-1414235077428-338989a2e8c0', 'photo-1504674900247-0877df9cc836', 'photo-1547592180-85f173990554', 'photo-1546069901-ba9599a7e63c'])
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
