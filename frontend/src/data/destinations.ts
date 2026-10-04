export type Destination = {
  name: string
  region: string
  note: string
  image: string
  alt: string
  tag?: string
}

export const trendingDestinations: Destination[] = [
  { name: 'Goa', region: 'Western India', note: 'Sunlit shores · 4–6 days', image: '/images/goa.svg', alt: 'Illustrated palms beside the sunset coast of Goa', tag: 'Coastal escape' },
  { name: 'Kerala', region: 'Southern India', note: 'Backwaters · 5–7 days', image: '/images/kerala.svg', alt: 'Illustrated Kerala backwaters framed by lush hills', tag: 'Slow travel' },
  { name: 'Manali', region: 'Himachal Pradesh', note: 'Mountain air · 4–5 days', image: '/images/manali.svg', alt: 'Illustrated snow peaks above a mountain valley', tag: 'Mountain retreat' },
  { name: 'Jaipur', region: 'Rajasthan', note: 'Living heritage · 2–3 days', image: '/images/jaipur.svg', alt: 'Illustrated pink city palace in Jaipur', tag: 'Culture & craft' },
  { name: 'Kashmir', region: 'Northern India', note: 'Alpine calm · 6–8 days', image: '/images/kashmir.svg', alt: 'Illustrated alpine lake beneath Kashmir mountains', tag: 'A little wonder' },
  { name: 'Udaipur', region: 'Rajasthan', note: 'Lakeside romance · 2–4 days', image: '/images/udaipur.svg', alt: 'Illustrated lakeside palace in Udaipur at dusk', tag: 'City of lakes' },
]

export const editorialDestinations: Destination[] = [
  { name: 'The coast, at your pace', region: 'Goa', note: 'Quiet mornings, open horizons.', image: '/images/goa.svg', alt: 'A quiet illustrated Goan beach at golden hour' },
  { name: 'Into the high country', region: 'Kashmir', note: 'Find your own kind of stillness.', image: '/images/kashmir.svg', alt: 'A still alpine lake in Kashmir' },
  { name: 'A softer kind of escape', region: 'Kerala', note: 'Follow the water south.', image: '/images/kerala.svg', alt: 'A houseboat moving through Kerala backwaters' },
  { name: 'Where the desert glows', region: 'Rajasthan', note: 'Stories in every sandstone arch.', image: '/images/jaipur.svg', alt: 'Rajasthan palace architecture glowing at sunset' },
  { name: 'Above the everyday', region: 'Himachal Pradesh', note: 'Make room for mountain air.', image: '/images/manali.svg', alt: 'A Himalayan peak rising above pine forest' },
  { name: 'An island state of mind', region: 'Andaman', note: 'Clear water, unhurried days.', image: '/images/andaman.svg', alt: 'Turquoise sea around a quiet Andaman island' },
]
