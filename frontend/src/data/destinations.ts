import { getDestinationMedia } from './destinationMedia'
export type Destination = {
  id?: string
  name: string
  region: string
  note: string
  image: string
  alt: string
  tag?: string
  city?: string
  state?: string
  country?: string
  description?: string
  shortDescription?: string
  category?: DestinationCategory
  tags?: string[]
  featured?: boolean
  rating?: number
  bestTime?: string
  estimatedDays?: number
}

export type DestinationCategory = 'Beaches' | 'Mountains' | 'Adventure' | 'Heritage' | 'Nature' | 'Spiritual' | 'Food & Culture' | 'Luxury' | 'Wildlife'
export type IndiaRegion = 'North India' | 'South India' | 'West India' | 'East India' | 'Northeast India' | 'Central India'
export type ExploreDestination = Destination & { id: string; city: string; state: string; country: string; description: string; shortDescription: string; category: DestinationCategory; tags: string[]; featured: boolean; rating: number; bestTime: string; estimatedDays: number; indiaRegion: IndiaRegion }

const makeDestination = (id: string, name: string, city: string, state: string, indiaRegion: IndiaRegion, category: DestinationCategory, _image: string, shortDescription: string, tags: string[], rating = 4.8): ExploreDestination => ({ id, name, city, state, indiaRegion, country: 'India', description: shortDescription, shortDescription, category, tags, image: getDestinationMedia(id).src, alt: getDestinationMedia(id).alt, note: `${category} · 4–6 days`, region: state, tag: tags[0], featured: id === 'kerala', rating, bestTime: 'October – March', estimatedDays: 5 })

export const exploreDestinations: ExploreDestination[] = [
  makeDestination('goa','Goa','Panaji','Goa','West India','Beaches','goa','Golden beaches, Portuguese lanes and unhurried coastal evenings.',['beach','coast','food']),
  makeDestination('kerala','Kerala','Alappuzha','Kerala','South India','Nature','kerala','Drift through palm-fringed backwaters and green hill country.',['backwaters','nature','food','culture'],4.9),
  makeDestination('manali','Manali','Manali','Himachal Pradesh','North India','Mountains','manali','A mountain town for pine-scented walks and Himalayan views.',['himalaya','snow','adventure']),
  makeDestination('kashmir','Kashmir','Srinagar','Jammu and Kashmir','North India','Mountains','kashmir','Quiet lakes, alpine valleys and memorable mountain light.',['lake','himalaya','nature']),
  makeDestination('jaipur','Jaipur','Jaipur','Rajasthan','West India','Heritage','jaipur','Rose-colored facades, lively bazaars and storied forts.',['forts','culture','food']),
  makeDestination('udaipur','Udaipur','Udaipur','Rajasthan','West India','Luxury','udaipur','Lakeside palaces and old-city lanes made for slow exploration.',['lakes','heritage','luxury']),
  makeDestination('rishikesh','Rishikesh','Rishikesh','Uttarakhand','North India','Spiritual','spiritual','Riverfront ashrams, forest trails and a calmer pace by the Ganges.',['yoga','river','adventure']),
  makeDestination('andaman','Andaman Islands','Port Blair','Andaman and Nicobar Islands','East India','Beaches','andaman','Clear island waters, coral reefs and quiet tropical shores.',['islands','snorkeling','beach']),
  makeDestination('ooty','Ooty','Ooty','Tamil Nadu','South India','Nature','kerala','Cool air, tea gardens and winding paths in the Nilgiris.',['tea','hills','nature']),
  makeDestination('munnar','Munnar','Munnar','Kerala','South India','Mountains','kerala','Rolling tea estates and misty highland trails.',['tea','hills','nature']),
  makeDestination('hyderabad','Hyderabad','Hyderabad','Telangana','South India','Food & Culture','jaipur','A layered city known for historic landmarks and legendary biryani.',['food','heritage','city']),
  makeDestination('mumbai','Mumbai','Mumbai','Maharashtra','West India','Food & Culture','goa','A magnetic coastal city with art deco streets and a vibrant food scene.',['food','coast','city']),
  makeDestination('delhi','Delhi','New Delhi','Delhi','North India','Heritage','jaipur','Centuries of history meet grand boulevards and energetic markets.',['history','food','culture']),
  makeDestination('agra','Agra','Agra','Uttar Pradesh','North India','Heritage','udaipur','Mughal-era architecture and one of the world’s most iconic monuments.',['history','architecture','culture']),
  makeDestination('varanasi','Varanasi','Varanasi','Uttar Pradesh','North India','Spiritual','spiritual','Rituals and everyday life unfold along the ancient riverfront ghats.',['river','temples','culture']),
  makeDestination('coorg','Coorg','Madikeri','Karnataka','South India','Nature','kerala','Coffee country with forest walks, waterfalls and homestays.',['coffee','forest','nature']),
  makeDestination('darjeeling','Darjeeling','Darjeeling','West Bengal','East India','Mountains','manali','Tea gardens and sunrise views across the high Himalaya.',['tea','himalaya','nature']),
  makeDestination('pondicherry','Pondicherry','Puducherry','Puducherry','South India','Beaches','goa','Seaside promenades and pastel streets with a distinct Franco-Tamil character.',['coast','heritage','food']),
  makeDestination('amritsar','Amritsar','Amritsar','Punjab','North India','Spiritual','spiritual','A warm, welcoming city centered on a luminous sacred complex.',['temples','food','culture']),
  makeDestination('jaisalmer','Jaisalmer','Jaisalmer','Rajasthan','West India','Adventure','jaipur','Golden sandstone lanes at the edge of the Thar Desert.',['desert','forts','adventure']),
  makeDestination('kaziranga','Kaziranga','Kaziranga','Assam','Northeast India','Wildlife','wildlife','Grasslands, wetlands and a chance to spot the one-horned rhinoceros.',['safari','wildlife','nature']),
  makeDestination('khajuraho','Khajuraho','Khajuraho','Madhya Pradesh','Central India','Heritage','jaipur','Intricately carved temples set among quiet central Indian landscapes.',['temples','architecture','heritage']),
]

export const trendingDestinations: Destination[] = [
  { name: 'Goa', region: 'Western India', note: 'Sunlit shores · 4–6 days', image: getDestinationMedia('goa').src, alt: 'Goa coastline and beach', tag: 'Coastal escape' },
  { name: 'Kerala', region: 'Southern India', note: 'Backwaters · 5–7 days', image: getDestinationMedia('kerala').src, alt: 'Houseboat on Kerala backwaters', tag: 'Slow travel' },
  { name: 'Manali', region: 'Himachal Pradesh', note: 'Mountain air · 4–5 days', image: getDestinationMedia('manali').src, alt: 'Snow capped Himalayan mountains near Manali', tag: 'Mountain retreat' },
  { name: 'Jaipur', region: 'Rajasthan', note: 'Living heritage · 2–3 days', image: getDestinationMedia('jaipur').src, alt: 'Hawa Mahal palace in Jaipur', tag: 'Culture & craft' },
  { name: 'Kashmir', region: 'Northern India', note: 'Alpine calm · 6–8 days', image: getDestinationMedia('kashmir').src, alt: 'Houseboats on Dal Lake in Srinagar', tag: 'A little wonder' },
  { name: 'Udaipur', region: 'Rajasthan', note: 'Lakeside romance · 2–4 days', image: getDestinationMedia('udaipur').src, alt: 'City Palace overlooking Lake Pichola in Udaipur', tag: 'City of lakes' },
]

export const editorialDestinations: Destination[] = [
  { name: 'The coast, at your pace', region: 'Goa', note: 'Quiet mornings, open horizons.', image: getDestinationMedia('goa').src, alt: 'Goa coastline and beach' },
  { name: 'Into the high country', region: 'Kashmir', note: 'Find your own kind of stillness.', image: getDestinationMedia('kashmir').src, alt: 'A still alpine lake in Kashmir' },
  { name: 'A softer kind of escape', region: 'Kerala', note: 'Follow the water south.', image: getDestinationMedia('kerala').src, alt: 'A houseboat moving through Kerala backwaters' },
  { name: 'Where the desert glows', region: 'Rajasthan', note: 'Stories in every sandstone arch.', image: getDestinationMedia('jaipur').src, alt: 'Rajasthan palace architecture glowing at sunset' },
  { name: 'Above the everyday', region: 'Himachal Pradesh', note: 'Make room for mountain air.', image: getDestinationMedia('manali').src, alt: 'A Himalayan peak rising above pine forest' },
  { name: 'An island state of mind', region: 'Andaman', note: 'Clear water, unhurried days.', image: getDestinationMedia('andaman').src, alt: 'Turquoise sea around a quiet Andaman island' },
]


