import { getDestinationMedia } from './destinationMedia'

export type Story = { category: string; title: string; description: string; image: string; alt: string; readTime: string }

export const stories: Story[] = [
  { category: 'THE LONG WAY ROUND', title: '7 days through the mountains', description: 'A winding road, a thermos of chai, and nowhere else to be.', image: getDestinationMedia('manali').src, alt: getDestinationMedia('manali').alt, readTime: '6 min read' },
  { category: 'A WEEKEND WELL SPENT', title: 'A slower weekend in Goa', description: 'Leave the checklist behind. Let the coast set the pace.', image: getDestinationMedia('goa').src, alt: getDestinationMedia('goa').alt, readTime: '4 min read' },
  { category: 'SOUTHERN NOTES', title: 'Finding stillness in Kerala', description: 'What happens when you let the water decide the itinerary.', image: getDestinationMedia('kerala').src, alt: getDestinationMedia('kerala').alt, readTime: '5 min read' },
  { category: 'IN GOOD COMPANY', title: 'The colors of Rajasthan', description: 'A journey through old cities, open skies, and generous tables.', image: getDestinationMedia('jaipur').src, alt: getDestinationMedia('jaipur').alt, readTime: '7 min read' },
]
