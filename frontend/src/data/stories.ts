export type Story = { category: string; title: string; description: string; image: string; alt: string; readTime: string }

export const stories: Story[] = [
  { category: 'THE LONG WAY ROUND', title: '7 days through the mountains', description: 'A winding road, a thermos of chai, and nowhere else to be.', image: '/images/manali.svg', alt: 'Sunrise spilling over a distant mountain range', readTime: '6 min read' },
  { category: 'A WEEKEND WELL SPENT', title: 'A slower weekend in Goa', description: 'Leave the checklist behind. Let the coast set the pace.', image: '/images/goa.svg', alt: 'Palm trees at a quiet Goan beach', readTime: '4 min read' },
  { category: 'SOUTHERN NOTES', title: 'Finding stillness in Kerala', description: 'What happens when you let the water decide the itinerary.', image: '/images/kerala.svg', alt: 'Quiet backwaters lined with coconut palms', readTime: '5 min read' },
  { category: 'IN GOOD COMPANY', title: 'The colors of Rajasthan', description: 'A journey through old cities, open skies, and generous tables.', image: '/images/jaipur.svg', alt: 'Warm sandstone architecture in Rajasthan', readTime: '7 min read' },
]
