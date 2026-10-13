import type { LucideIcon } from 'lucide-react'
import { Compass, Mountain, Landmark, Waves, PawPrint, Sparkles, Utensils, Gem } from 'lucide-react'
import { getDestinationMedia } from './destinationMedia'

export type Experience = { title: string; label: string; image: string; alt: string; icon: LucideIcon }

export const experiences: Experience[] = [
  { title: 'Beaches', label: 'Find your blue', image: getDestinationMedia('goa').src, alt: 'Goa coastline and beach', icon: Waves },
  { title: 'Mountains', label: 'Take the high road', image: getDestinationMedia('manali').src, alt: 'Snow capped Himalayan mountains near Manali', icon: Mountain },
  { title: 'Adventure', label: 'A little further', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', alt: 'Hikers walking a mountain trail', icon: Compass },
  { title: 'Heritage', label: 'Stories in stone', image: getDestinationMedia('jaipur').src, alt: 'Hawa Mahal palace in Jaipur', icon: Landmark },
  { title: 'Wildlife', label: 'Into the wild', image: getDestinationMedia('kaziranga').src, alt: 'One horned rhinoceros in Kaziranga National Park', icon: PawPrint },
  { title: 'Spiritual', label: 'Find your quiet', image: getDestinationMedia('varanasi').src, alt: 'Riverfront ghats in Varanasi', icon: Sparkles },
  { title: 'Food & culture', label: 'Taste the place', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', alt: 'Colorful Indian meal with herbs and spices', icon: Utensils },
  { title: 'Luxury', label: 'Travel beautifully', image: getDestinationMedia('udaipur').src, alt: 'City Palace overlooking Lake Pichola in Udaipur', icon: Gem },
]
