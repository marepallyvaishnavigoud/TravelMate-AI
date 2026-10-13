import type { ExploreDestination } from './destinations'
import { getDestinationMedia, destinationMedia } from './destinationMedia'

export type DestinationInfo = { bestTime: string; duration: string; idealFor: string[]; dailyBudget: string; languages: string[]; currency: string; weather: string; temperature: string; recommendation: string }
export type Activity = { title: string; description: string; category: string; duration: string; image: string; alt: string }
export type Place = { name: string; description: string; type: string; image: string; alt: string }
export type LocalFood = { name: string; description: string; vegetarian: boolean; image: string; alt: string }
export type TravelTip = { title: string; description: string; icon: 'sun' | 'calendar' | 'train' | 'heart' | 'phone' }
export type GalleryImage = { src: string; alt: string }
export type VideoItem = { title: string; description: string; duration: string }
export type HotelPreview = { name: string; area: string; rating: number; priceEstimate: string; image: string; alt: string }
export type RestaurantPreview = { name: string; cuisine: string; area: string; rating: number; priceLevel: string; image: string; alt: string }
export type DestinationDetailsData = { overview: string; info: DestinationInfo; activities: Activity[]; places: Place[]; foods: LocalFood[]; tips: TravelTip[]; gallery: GalleryImage[]; videos: VideoItem[]; hotels: HotelPreview[]; restaurants: RestaurantPreview[]; nearbyPlaces: string[] }

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
const categoryPhotos: Record<string, string> = {
  church: destinationMedia.goa.src,
  heritage: destinationMedia.jaipur.src,
  nature: destinationMedia.munnar.src,
  viewpoint: destinationMedia.manali.src,
  market: photo('photo-1533900298318-6b8da08a523e'),
  food: photo('photo-1547592180-85f173990554'),
  'food-curry': photo('photo-1565557623262-b51c2513a641'),
  'food-dessert': photo('photo-1488477181946-6428a0291777'),
  'food-snack': photo('photo-1601050690597-df0568f70950'),
}
const image = (file: string) => destinationMedia[file]?.src ?? categoryPhotos[file] ?? getDestinationMedia(file).src
const media = (place: ExploreDestination): GalleryImage => ({ src: getDestinationMedia(place.id).src, alt: getDestinationMedia(place.id).alt })
const sampleStayImages = [
  photo('photo-1566073771259-6a8506099945'),
  photo('photo-1571896349842-33c89424de2d'),
  photo('photo-1571896349842-33c89424de2d'),
]
const sampleFoodImages = [categoryPhotos.food, categoryPhotos['food-curry'], categoryPhotos['food-snack']]
const keralaFoodImages = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fish_Curry_Kerala.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sadhya_DSW.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Appam_(9188698747).jpg?width=1200',
]
const localFoodImage = (place: ExploreDestination, index: number) => place.id === 'kerala' ? keralaFoodImages[index] : sampleFoodImages[index]

const guides: Record<string, Partial<DestinationDetailsData>> = {
  goa: {
    overview: 'Goa pairs a long Arabian Sea coastline with Portuguese-era architecture, lively markets and a distinctive Konkan food culture. The north is energetic and social; the south offers a quieter, slower beach escape.',
    info: { bestTime: 'November – February', duration: '4–6 days', idealFor: ['Beaches','Food','Nightlife','Heritage'], dailyBudget: '₹2,500–₹6,000', languages: ['Konkani','English','Hindi'], currency: 'INR', weather: 'Mostly dry and pleasantly warm', temperature: '20°C–30°C', recommendation: 'Ideal for beach days, food trails and sightseeing.' },
    activities: [
      { title:'Beach hopping',description:'Spend an easy day discovering the distinct character of Goa’s north and south coast.',category:'Coast',duration:'Half day',image:image('goa'),alt:'Goa coastline and beaches'},
      { title:'Explore Old Goa',description:'Visit historic churches and learn about the region’s layered Portuguese-era heritage.',category:'Heritage',duration:'2–3 hours',image:image('church'),alt:'Portuguese-era church architecture in Old Goa'},
      { title:'Sunset cruise',description:'Take in the changing light along the Mandovi River from the water.',category:'Water',duration:'2 hours',image:image('andaman'),alt:'Illustrated water and sunset'},
      { title:'Local food trail',description:'Try coastal staples, market snacks and a classic Goan fish curry.',category:'Food',duration:'2–3 hours',image:image('food'),alt:'Indian regional food served at a local table'},
      { title:'Visit a fort',description:'Walk the ramparts and take in broad views over the Arabian Sea.',category:'History',duration:'1–2 hours',image:image('heritage'),alt:'Historic coastal fort in Goa'},
      { title:'Browse a night market',description:'Look for handmade goods, music and casual bites at a seasonal market.',category:'Culture',duration:'Evening',image:image('market'),alt:'Colorful night market in Goa'},
    ],
    places: [
      {name:'Palolem Beach',description:'A crescent-shaped southern beach with a relaxed, scenic shoreline.',type:'Beach',image:image('goa'),alt:'Goa coastline and beach'},
      {name:'Fort Aguada',description:'A coastal fort with wide views and a history dating to the 17th century.',type:'Heritage',image:image('heritage'),alt:'Historic coastal fort in Goa'},
      {name:'Basilica of Bom Jesus',description:'A landmark church and UNESCO-listed part of Old Goa’s historic center.',type:'Architecture',image:image('church'),alt:'Historic church architecture in Old Goa'},
      {name:'Dudhsagar Falls',description:'A dramatic waterfall set in the forested Western Ghats.',type:'Nature',image:image('nature'),alt:'Waterfall among the forested Western Ghats'},
    ],
    foods: [
      {name:'Goan fish curry',description:'A tangy, coconut-rich curry often served with local rice.',vegetarian:false,image:image('food-curry'),alt:'Goan-style coastal fish curry'},
      {name:'Prawn balchão',description:'A bold, spiced prawn preparation with Portuguese-influenced roots.',vegetarian:false,image:image('food-curry'),alt:'Spiced coastal curry'},
      {name:'Bebinca',description:'A traditional layered dessert, slowly baked until rich and golden.',vegetarian:true,image:image('food-dessert'),alt:'Layered golden Goan bebinca dessert'},
      {name:'Poi',description:'A soft local bread that pairs well with curries and market snacks.',vegetarian:true,image:image('food-snack'),alt:'Goan poi bread served with curry'},
    ],
    nearbyPlaces:['Old Goa','Panaji','Candolim','Palolem'],
  },
  kerala: { overview:'Kerala is a lush southwestern state shaped by backwaters, the Arabian Sea and the Western Ghats. Its slower journeys often combine waterside villages, tea country, local markets and regional cuisine.', info:{bestTime:'October – March',duration:'5–7 days',idealFor:['Nature','Food','Wellness','Culture'],dailyBudget:'₹3,000–₹7,000',languages:['Malayalam','English','Hindi'],currency:'INR',weather:'Warm, humid and greener during monsoon',temperature:'23°C–32°C',recommendation:'Plan for both backwaters and hill country.'}, nearbyPlaces:['Alappuzha','Kochi','Munnar','Kumarakom'] },
  manali: { overview:'Manali sits in the Kullu Valley, surrounded by pine forests, river scenery and high Himalayan peaks. It is a popular base for mountain walks, local culture and seasonal outdoor adventures.', info:{bestTime:'March – June',duration:'4–6 days',idealFor:['Mountains','Adventure','Nature','Culture'],dailyBudget:'₹2,500–₹6,500',languages:['Hindi','Pahari','English'],currency:'INR',weather:'Cool mountain climate; winters bring snow',temperature:'−2°C–25°C',recommendation:'Check road and weather conditions before setting out.'}, nearbyPlaces:['Old Manali','Naggar','Solang Valley','Rohtang area'] },
  kashmir: { overview:'Kashmir is known for its mountain valleys, lakes and gardens, with Srinagar as a natural starting point for exploring the region. Local traditions and seasonal landscapes shape each visit.', info:{bestTime:'March – October',duration:'6–8 days',idealFor:['Mountains','Nature','Culture','Photography'],dailyBudget:'₹3,500–₹8,000',languages:['Kashmiri','Urdu','Hindi','English'],currency:'INR',weather:'Varies by altitude and season',temperature:'−2°C–30°C',recommendation:'Allow flexible time for mountain travel and changing weather.'}, nearbyPlaces:['Srinagar','Gulmarg','Pahalgam','Sonamarg'] },
  jaipur: { overview:'Jaipur brings together grand forts, rose-colored streets, craft traditions and a famously generous food culture. Its old city and surrounding hills reward unhurried exploration.', info:{bestTime:'October – March',duration:'2–4 days',idealFor:['Heritage','Food','Culture','Shopping'],dailyBudget:'₹2,000–₹5,500',languages:['Hindi','Rajasthani','English'],currency:'INR',weather:'Dry, with mild winter days and hot summers',temperature:'8°C–32°C',recommendation:'Start outdoor sightseeing early during warmer months.'}, nearbyPlaces:['Amber','Nahargarh','Sanganer','Bagru'] },
}

export function getDestinationDetails(place: ExploreDestination): DestinationDetailsData {
  const guide = guides[place.id] ?? {}
  const info: DestinationInfo = { bestTime:place.bestTime,duration:`${place.estimatedDays}–${place.estimatedDays + 2} days`,idealFor:[place.category,...place.tags.slice(0,2)],dailyBudget:'₹2,500–₹6,000',languages:['Local language','Hindi','English'],currency:'INR',weather:'Seasonal; check local conditions before travel',temperature:'Varies by season',recommendation:`A good base for discovering ${place.state} at a relaxed pace.`,...guide.info }
  const activities = guide.activities ?? [
    {title:`Explore ${place.name}`,description:`Get to know the landmarks, neighborhoods and local character of ${place.name}.`,category:place.category,duration:'Half day',image:place.image,alt:place.alt},
    {title:`Taste ${place.state}`,description:`Discover regional specialties and everyday flavors on a local food walk.`,category:'Food & culture',duration:'2–3 hours',image:localFoodImage(place,0),alt:`Regional Indian food from ${place.state}`},
    {title:'Take a scenic day trip',description:`See more of the landscapes and communities around ${place.name}.`,category:'Nature',duration:'Full day',image:image('nature'),alt:`Green hills and forest landscape near ${place.name}`},
    {title:'Browse a local market',description:'Meet local makers and find regional crafts, produce and small bites.',category:'Culture',duration:'1–2 hours',image:image('market'),alt:`Colorful Indian market near ${place.name}`},
    {title:'Find a quieter viewpoint',description:'Make time for a slower moment and a different perspective on the destination.',category:'Outdoors',duration:'1–2 hours',image:image('viewpoint'),alt:`Scenic viewpoint near ${place.name}`},
    {title:'Walk a heritage trail',description:'Follow the stories and architecture that shaped this part of India.',category:'Heritage',duration:'2–3 hours',image:image('heritage'),alt:`Historic Indian architecture near ${place.name}`},
  ]
  const places = guide.places ?? [
    {name:place.city,description:`Discover the local center and everyday life of ${place.name}.`,type:'Local area',image:place.image,alt:place.alt},
    {name:`Around ${place.state}`,description:'Explore nearby landscapes, viewpoints and locally known stops.',type:'Scenic area',image:image('nature'),alt:`Green scenery near ${place.state}`},
    {name:'Historic quarter',description:'Look for regional architecture and stories from the area’s past.',type:'Heritage',image:image('heritage'),alt:`Historic architecture near ${place.name}`},
    {name:'Local market',description:'A lively place to browse regional crafts and food.',type:'Market',image:image('market'),alt:`Colorful market near ${place.name}`},
  ]
  const foods = guide.foods ?? [
    {name:`${place.state} specialties`,description:'Ask about seasonal regional dishes and ingredients at local eateries.',vegetarian:false,image:localFoodImage(place,0),alt:`Regional food from ${place.state}`},
    {name:'Local vegetarian thali',description:'A sample of regional vegetables, grains and accompaniments.',vegetarian:true,image:localFoodImage(place,1),alt:`Vegetarian Indian meal from ${place.state}`},
    {name:place.id === 'kerala' ? 'Appam' : 'Market snack',description:place.id === 'kerala' ? 'A soft rice pancake traditionally served with curry or stew.' : 'Try a freshly prepared snack popular with local residents.',vegetarian:true,image:localFoodImage(place,2),alt:place.id === 'kerala' ? 'Appam, a Kerala rice pancake' : `Local snack from ${place.state}`},
  ]
  const tips: TravelTip[] = [
    {title:'Pack for the season',description:`Check the forecast for ${place.state} and bring layers or sun protection as needed.`,icon:'sun'},
    {title:'Plan busy dates early',description:'Reserve transport and stays ahead of festivals and peak travel periods.',icon:'calendar'},
    {title:'Allow time between stops',description:'Road journeys can take longer than expected; keep your schedule flexible.',icon:'train'},
    {title:'Respect local customs',description:'Dress and behave thoughtfully at religious and community sites.',icon:'heart'},
    {title:'Save local contacts',description:'Keep your accommodation details and essential local numbers accessible.',icon:'phone'},
  ]
  const gallery = [media(place)]
  const hotels: HotelPreview[] = ['The Heritage House','Garden View Stay','Riverside Retreat'].map((name,index)=>({name,area:place.city,rating:[4.7,4.5,4.6][index],priceEstimate:['₹3,500','₹2,800','₹4,200'][index],image:sampleStayImages[index],alt:`Hotel and guest accommodation near ${place.city}`}))
  const restaurants: RestaurantPreview[] = ['Local Table','The Spice Courtyard','Market Lane Café'].map((name,index)=>({name,cuisine:index===0?`${place.state} cuisine`:'Regional & Indian',area:place.city,rating:[4.6,4.4,4.5][index],priceLevel:['₹₹','₹','₹₹'][index],image:localFoodImage(place,index),alt:`${place.state} food served at a sample restaurant in ${place.city}`}))
  return {overview:guide.overview ?? `${place.description} Discover the character of ${place.city} and the surrounding ${place.state} region through its landscapes, local food and everyday culture.`,info,activities,places,foods,tips,gallery,videos:[{title:`A visual introduction to ${place.name}`,description:'Video previews will appear here when approved destination footage is available.',duration:'Coming soon'}],hotels,restaurants,nearbyPlaces:guide.nearbyPlaces ?? [place.city,`Around ${place.state}`,'Regional viewpoint','Local market']}
}



