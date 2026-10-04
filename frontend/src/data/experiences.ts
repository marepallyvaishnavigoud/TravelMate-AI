import type { LucideIcon } from 'lucide-react'
import { Compass, Mountain, Landmark, Waves, PawPrint, Sparkles, Utensils, Gem } from 'lucide-react'

export type Experience = { title: string; label: string; image: string; alt: string; icon: LucideIcon }

export const experiences: Experience[] = [
  { title: 'Beaches', label: 'Find your blue', image: '/images/goa.svg', alt: 'Sunset over a tropical coastline', icon: Waves },
  { title: 'Mountains', label: 'Take the high road', image: '/images/manali.svg', alt: 'Snowy Himalayan mountains', icon: Mountain },
  { title: 'Adventure', label: 'A little further', image: '/images/adventure.svg', alt: 'A winding trail through a mountain landscape', icon: Compass },
  { title: 'Heritage', label: 'Stories in stone', image: '/images/jaipur.svg', alt: 'Historic Indian palace architecture', icon: Landmark },
  { title: 'Wildlife', label: 'Into the wild', image: '/images/wildlife.svg', alt: 'Wildlife in a lush forest at dawn', icon: PawPrint },
  { title: 'Spiritual', label: 'Find your quiet', image: '/images/spiritual.svg', alt: 'Temple silhouette above the river at sunrise', icon: Sparkles },
  { title: 'Food & culture', label: 'Taste the place', image: '/images/food.svg', alt: 'Colorful Indian market at golden hour', icon: Utensils },
  { title: 'Luxury', label: 'Travel beautifully', image: '/images/udaipur.svg', alt: 'Lakeside palace at dusk', icon: Gem },
]
