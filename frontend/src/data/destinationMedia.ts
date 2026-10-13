/** Destination-matched photographs from Unsplash, Pexels, and Wikimedia Commons. */
export type DestinationMedia = { src: string; alt: string; source: string }

export const destinationMedia: Record<string, DestinationMedia> = {
  goa: { src: 'https://images.pexels.com/photos/28256832/pexels-photo-28256832.jpeg?auto=compress&cs=tinysrgb&w=1400', alt: 'Coastline and beach in Goa, India', source: 'Pexels photo 28256832' },
  kerala: { src: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1400&q=80', alt: 'Traditional houseboat on Kerala backwaters', source: 'Unsplash photo N3VzleBhOvk' },
  manali: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rohtang_Pass,_Himalayas,_Manali,_Himachal_Pradesh,_India_(2017).jpg?width=1400', alt: 'Snow capped Himalayan mountains near Rohtang Pass, Manali', source: 'Ajisi, Wikimedia Commons, CC BY-SA 4.0' },
  kashmir: { src: 'https://images.pexels.com/photos/30622300/pexels-photo-30622300.jpeg?auto=compress&cs=tinysrgb&w=1400', alt: 'Houseboats on Dal Lake in Srinagar, Kashmir', source: 'Pexels photo 30622300' },
  jaipur: { src: 'https://images.unsplash.com/photo-1578999935853-4ec5fa6c1f60?auto=format&fit=crop&w=1400&q=80', alt: 'Hawa Mahal palace in Jaipur, Rajasthan', source: 'Unsplash photo LgQoL6eOdHs' },
  udaipur: { src: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1400&q=80', alt: 'City Palace overlooking Lake Pichola in Udaipur', source: 'Unsplash photo' },
  rishikesh: { src: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?auto=format&fit=crop&w=1400&q=80', alt: 'River and foothills near Rishikesh, Uttarakhand', source: 'Unsplash photo' },
  andaman: { src: 'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=1400&q=80', alt: 'Tropical shoreline in the Andaman Islands', source: 'Unsplash photo' },
  ooty: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nilgiri_Mountain_Railway-WUS05899.jpg?width=1400', alt: 'Nilgiri Mountain Railway winding through the hills of Tamil Nadu', source: 'Rainer Halama, Wikimedia Commons, CC BY-SA 4.0' },
  munnar: { src: 'https://images.pexels.com/photos/30188721/pexels-photo-30188721.jpeg?auto=compress&cs=tinysrgb&w=1400', alt: 'Tea plantations in Munnar, Kerala', source: 'Pexels photo 30188721' },
  hyderabad: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Charminar,_Hyderabad,_India.jpg?width=1400', alt: 'Charminar monument in Hyderabad, Telangana', source: 'Kishor Krishnamoorthi, Wikimedia Commons, CC BY-SA 3.0' },
  mumbai: { src: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1400&q=80', alt: 'Gateway of India waterfront in Mumbai', source: 'Unsplash photo' },
  delhi: { src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=80', alt: 'Historic Red Fort in Delhi, India', source: 'Unsplash photo' },
  agra: { src: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=80', alt: 'Taj Mahal in Agra, India', source: 'Unsplash photo' },
  varanasi: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/View_of_the_ghats_at_Varanasi.jpg?width=1400', alt: 'Ghats along the Ganges River in Varanasi', source: 'Vimalinarc, Wikimedia Commons, CC BY 4.0' },
  coorg: { src: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1400&q=80', alt: 'Coffee-growing hills in Coorg, Karnataka', source: 'Unsplash photo' },
  darjeeling: { src: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80', alt: 'Himalayan mountain view from Darjeeling', source: 'Unsplash photo' },
  pondicherry: { src: 'https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=1400&q=80', alt: 'Colorful French Quarter street in Puducherry', source: 'Unsplash photo' },
  amritsar: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sarovar_and_the_Golden_Temple.jpg/1280px-Sarovar_and_the_Golden_Temple.jpg', alt: 'Golden Temple reflected in the Sarovar at Amritsar', source: 'Ken Wieland, Wikimedia Commons, CC BY-SA 2.0' },
  jaisalmer: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jaisalmer_fort.jpg/960px-Jaisalmer_fort.jpg', alt: 'Jaisalmer Fort rising above the golden sandstone city', source: 'Anahgem, Wikimedia Commons, CC BY-SA 3.0' },
  kaziranga: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Rhinoceros_in_Kaziranga_National_Park%2C_Assam_13.jpg/1280px-Rhinoceros_in_Kaziranga_National_Park%2C_Assam_13.jpg', alt: 'One-horned rhinoceros in Kaziranga National Park, Assam', source: 'Pinakpani, Wikimedia Commons, CC BY 4.0' },
  khajuraho: { src: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Khajuraho_-_Kandariya_Mahadeo_Temple.jpg', alt: 'Kandariya Mahadeva Temple in Khajuraho, Madhya Pradesh', source: 'Paul Mannix via Wikimedia Commons, CC BY-SA 2.0' },
}

export const getDestinationMedia = (id: string): DestinationMedia => destinationMedia[id] ?? {
  src: destinationMedia.kerala.src,
  alt: 'Houseboat on Kerala backwaters',
  source: destinationMedia.kerala.source,
}
