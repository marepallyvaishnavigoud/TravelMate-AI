export type AssistantTripContext = {
  title: string
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  currency: string
  transport: string
  interests: string[]
}

export type AssistantItineraryContext = {
  summary?: string
  days?: Array<{
    day?: number
    date?: string
    title?: string
    summary?: string
    activities?: Array<{ time?: string; title?: string; description?: string; category?: string }>
    morning?: Array<{ time?: string; title?: string; description?: string; category?: string }>
    afternoon?: Array<{ time?: string; title?: string; description?: string; category?: string }>
    evening?: Array<{ time?: string; title?: string; description?: string; category?: string }>
  }>
  estimatedTotalCost?: number
  budget?: number
  budgetRemaining?: number
  budgetEstimate?: Record<string, unknown>
  tips?: string[]
  warnings?: string[]
}

export type AssistantReply = {
  reply: string
  source: 'local_rules' | 'open_meteo'
  limitations: string[]
}
export type AssistantWeatherSnapshot = {
  location: string
  temperatureC: number
  feelsLikeC: number
  humidityPercent: number
  windSpeedKmh: number
  condition: string
  time: string
  timezone: string
  sourceUrl: string
}

const unsupportedTopics = 'I can help with destination ideas, packing, family or solo travel, budgeting, transport planning, food, your saved itinerary, trip duration, accommodation guidance, and general travel planning.'

function tripLength(trip: AssistantTripContext): number {
  const start = Date.parse(`${trip.startDate.slice(0, 10)}T00:00:00Z`)
  const end = Date.parse(`${trip.endDate.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 1
  return Math.floor((end - start) / 86_400_000) + 1
}

function money(amount: number, currency: string): string {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount) }
  catch { return `${currency} ${Math.round(amount).toLocaleString('en-IN')}` }
}

function budgetEstimate(itinerary?: AssistantItineraryContext, currency = 'INR') {
  const estimate = itinerary?.budgetEstimate
  if (!estimate || typeof estimate !== 'object') return null
  const labels: Array<[string, string]> = [
    ['transportation', 'Transportation'], ['accommodation', 'Accommodation'], ['food', 'Food'],
    ['activities', 'Activities'], ['localTravel', 'Local transport'], ['miscellaneous', 'Other'],
  ]
  const parts = labels.flatMap(([key, label]) => {
    const value = estimate[key]
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? [`- ${label}: ${money(value, currency)}`] : []
  })
  return parts.length ? parts.join('\n') : null
}

function savedActivities(itinerary?: AssistantItineraryContext): string[] {
  if (!itinerary?.days?.length) return []
  return itinerary.days.slice(0, 5).map((day, index) => {
    const activities = day.activities?.length ? day.activities : [...(day.morning ?? []), ...(day.afternoon ?? []), ...(day.evening ?? [])]
    const names = activities.slice(0, 4).map((activity) => activity.title).filter((title): title is string => Boolean(title?.trim()))
    const number = typeof day.day === 'number' ? day.day : index + 1
    return `- Day ${number}${day.title ? ` — ${day.title}` : ''}${names.length ? `: ${names.join(', ')}` : day.summary ? `: ${day.summary}` : ''}`
  }).filter((line) => !line.endsWith(':'))
}

function destinationIdeas(message: string, trip?: AssistantTripContext): AssistantReply {
  const interest = trip?.interests.find((item) => new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(message))
  let suggestions: string[]
  if (/beach|island|sea/i.test(message)) suggestions = ['Goa for a relaxed coastal break', 'Kerala for backwaters and a varied nature trip', 'Andaman Islands for island scenery']
  else if (/mountain|hill|hiking|trek|snow/i.test(message)) suggestions = ['Manali for mountain scenery and outdoor options', 'Kashmir for lakes and mountain landscapes', 'Uttarakhand for hill towns and nature']
  else if (/history|heritage|culture|fort|palace/i.test(message)) suggestions = ['Jaipur for forts and historic architecture', 'Udaipur for lakes and heritage sights', 'Delhi for museums and historic neighborhoods']
  else suggestions = ['Kerala for nature and varied landscapes', 'Rajasthan for heritage and desert scenery', 'Goa for a coastal holiday']
  const prefix = trip ? `Your current trip is to ${trip.destination}. ` : ''
  return { reply: `${prefix}Some starting points to compare:\n${suggestions.map((item) => `- ${item}`).join('\n')}${interest ? `\n\nI noticed “${interest}” among your trip interests, so compare how each option fits it.` : ''}\n\nThese are general ideas, not live availability or verified venue recommendations. What kind of scenery or pace do you prefer?`, source: 'local_rules', limitations: ['Destination ideas are general; current conditions and availability are not checked.'] }
}

function packingAdvice(trip?: AssistantTripContext): AssistantReply {
  const length = trip ? tripLength(trip) : null
  const lines = [
    'Clothing: outfits for each day plus one spare layer; choose comfortable walking shoes.',
    'Essentials: identification, booking details, payment cards, phone, charger, and any regular medication.',
    'Health and comfort: personal care items, sunscreen, reusable water bottle, and a small first-aid kit.',
  ]
  if (trip) {
    lines.push(`For ${trip.destination}, check a current local forecast before choosing weather-specific clothing; this assistant cannot verify live weather.`)
    if (trip.transport === 'flight') lines.push('For your flight, keep identification, valuables, and essential medication in your carry-on; check your airline’s baggage rules.')
    else if (trip.transport === 'car') lines.push('For your car trip, keep documents, water, a phone charger, and any vehicle essentials easy to reach.')
    if (trip.interests.some((interest) => /hike|adventure|nature|wildlife/i.test(interest))) lines.push('For your outdoor interests, consider sturdy footwear, sun protection, and a compact day bag.')
    lines.push(`Your trip is ${length} ${length === 1 ? 'day' : 'days'} for ${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}; use that to scale clothing and shared items.`)
  } else lines.push('If you share your destination, dates, and transport, I can tailor the list.')
  return { reply: `## Packing checklist\n${lines.map((item) => `- ${item}`).join('\n')}`, source: 'local_rules', limitations: trip ? ['Check current weather and carrier baggage requirements before leaving.'] : [] }
}

function budgetAdvice(trip?: AssistantTripContext, itinerary?: AssistantItineraryContext): AssistantReply {
  if (!trip) return { reply: 'To tailor savings advice, select one of your trips so I can use its budget and saved estimate. In general, compare transport before booking, choose lodging near the places you plan to visit, set a daily meal allowance, and keep a small contingency.', source: 'local_rules', limitations: [] }
  const total = itinerary?.estimatedTotalCost
  const remaining = itinerary?.budgetRemaining
  const breakdown = budgetEstimate(itinerary, trip.currency)
  let comparison = `Your trip budget is ${money(trip.budget, trip.currency)} for ${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}.`
  if (typeof total === 'number') comparison += ` The saved itinerary estimates ${money(total, trip.currency)}${typeof remaining === 'number' ? `, leaving ${money(Math.abs(remaining), trip.currency)} ${remaining < 0 ? 'over budget' : 'remaining'}` : ''}.`
  else comparison += ' There is no saved itinerary cost estimate to compare yet.'
  const ideas = [
    'Compare flexible travel dates and transport options before committing; check change and baggage fees too.',
    'Set a per-day food and local-transport target, then review actual spending as you go.',
    'Choose lodging based on total trip cost, including its distance from planned activities.',
    'Keep paid activities selective and leave room for free public spaces and rest time.',
  ]
  return { reply: `${comparison}\n\n${breakdown ? `Saved estimate by category:\n${breakdown}\n\n` : ''}Ways to review the plan:\n${ideas.map((item) => `- ${item}`).join('\n')}\n\nThese steps may help you spend less, but I can’t promise a specific saving.`, source: 'local_rules', limitations: itinerary ? [] : ['No saved itinerary cost breakdown is available for this trip.'] }
}

export function answerTravelQuestion(input: { message: string; trip?: AssistantTripContext; itinerary?: AssistantItineraryContext; weatherSnapshot?: AssistantWeatherSnapshot }): AssistantReply {
  const message = input.message.trim()
  const lower = message.toLowerCase()
  const { trip, itinerary } = input

  if (!message) return { reply: 'Type a travel question to get started. You can ask about packing, budgets, destinations, or a saved itinerary.', source: 'local_rules', limitations: [] }
  if (/\b(emergency|urgent|in danger|being followed|accident|hurt|injured|need an ambulance|call the police)\b/i.test(lower)) return { reply: 'If someone is in immediate danger, contact the local emergency services now. Move to a staffed, public place if you can, and contact a trusted person or your country’s embassy/consulate. I can’t verify local emergency numbers or provide professional medical or legal advice.', source: 'local_rules', limitations: ['This assistant cannot contact emergency services or verify local emergency numbers.'] }
  if (/\b(weather|forecast|temperature|rain tomorrow|will it rain)\b/i.test(lower)) {
    const snapshot = input.weatherSnapshot
    if (snapshot) return { reply: `The latest weather cached for ${snapshot.location} is ${snapshot.condition}, ${snapshot.temperatureC}°C (feels like ${snapshot.feelsLikeC}°C), humidity ${snapshot.humidityPercent}%, and wind ${snapshot.windSpeedKmh} km/h. Model time: ${snapshot.time} (${snapshot.timezone}). Source: Open-Meteo (${snapshot.sourceUrl}).`, source: 'open_meteo', limitations: ['These are model-based current conditions, not a station observation. They are only used when a weather result was fetched within the last 15 minutes.'] }
    return { reply: `I don’t have a recently fetched weather result${trip ? ` for ${trip.destination}` : ''}. Open the Weather page to fetch a current forecast, then ask me again. I won’t guess weather conditions.`, source: 'local_rules', limitations: ['No recent weather data is available in this assistant session.'] }
  }
  if (/\b(hotel|accommodation|hostel|resort|room)\b/i.test(lower) && /\b(available|availability|book|booking|reserve|reservation|price|rate)\b/i.test(lower)) return { reply: `I can’t check live room availability, rates, reviews, or make a reservation${trip ? ` for ${trip.destination}` : ''}. Compare cancellation terms, total fees, location relative to your plans, and recent information from the booking provider.`, source: 'local_rules', limitations: ['No live lodging inventory or booking integration is connected.'] }
  if (/\b(restaurant|open now|opening hours|open tonight|ticket price|tickets cost|reviews|available seats|schedule today|departure time)\b/i.test(lower)) return { reply: 'I can’t verify live opening hours, schedules, availability, reviews, or ticket prices. Check the venue or transport provider’s current information before you go. I can still help you make a general plan.', source: 'local_rules', limitations: ['Live venue and transport data is not available to this local assistant.'] }

  if (/\b(pack|packing|what should i bring|what to bring|suitcase|luggage)\b/i.test(lower)) return packingAdvice(trip)
  if (/\b(budget|save money|saving|cheaper|reduce (my |the )?(trip )?cost|spend less|afford)\b/i.test(lower)) return budgetAdvice(trip, itinerary)
  if (/\b(explain|summari[sz]e|show|what is in|what's in|my)\b/i.test(lower) && /\b(itinerary|plan|schedule)\b/i.test(lower) || /\b(itinerary|day.by.day plan)\b/i.test(lower)) {
    if (!itinerary?.days?.length) return { reply: 'I can’t see a saved itinerary for this trip yet. Generate and save one in the trip planner, then ask me to explain it.', source: 'local_rules', limitations: ['No saved itinerary is available for this trip.'] }
    const days = savedActivities(itinerary)
    return { reply: `${itinerary.summary || `Here is the saved plan for ${trip?.destination ?? 'your trip'}.`}${days.length ? `\n\n${days.join('\n')}` : ''}${typeof itinerary.estimatedTotalCost === 'number' && trip ? `\n\nIts estimated total is ${money(itinerary.estimatedTotalCost, trip.currency)}.` : ''}${itinerary.warnings?.length ? `\n\nPlanning notes: ${itinerary.warnings.slice(0, 2).join(' ')}` : ''}`, source: 'local_rules', limitations: ['The itinerary contains planning suggestions; confirm venue details and prices before travel.'] }
  }
  if (/\b(family|kids|children|child|with my (son|daughter))\b/i.test(lower)) return { reply: `${trip ? `For your ${trip.destination} trip with ${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}, ` : 'For family travel, '}keep travel days manageable, plan breaks around meals and rest, and choose activities with age, accessibility, and weather in mind. Carry essential documents and contact details for each child. For activity ideas, start with public parks, museums, and short walks, then confirm suitability, hours, and access directly with each venue.${trip?.interests.length ? ` Your trip interests include ${trip.interests.join(', ')}.` : ''}`, source: 'local_rules', limitations: ['These are general planning tips; venue suitability and current details are not verified.'] }
  if (/\b(solo|alone|by myself|solo travel)\b/i.test(lower)) return { reply: `${trip ? `For your trip to ${trip.destination}, ` : ''}share your itinerary with someone you trust, keep a charged phone and backup payment option, choose well-reviewed lodging using a current booking source, and plan how you’ll get back before late outings. Trust your judgment and follow local guidance.`, source: 'local_rules', limitations: ['General safety guidance only; local conditions are not checked.'] }
  if (/\b(transport|travel day|drive|driving|train|bus|flight|airport|getting there|route)\b/i.test(lower)) {
    if (!trip) return { reply: 'For a travel day, confirm departure time, ticket and baggage rules with your carrier, allow a buffer for transfers, and keep identification and essentials accessible. Which cities and transport mode are you considering?', source: 'local_rules', limitations: ['Live routes, schedules, delays, and fares are not available.'] }
    return { reply: `Your trip is from ${trip.origin} to ${trip.destination} by ${trip.transport}. Check your carrier’s current schedule, fares, baggage rules, and disruption notices. Allow time for check-in or transfers, keep documents and essentials handy, and plan a backup way to reach your lodging.`, source: 'local_rules', limitations: ['Live schedules, route conditions, and fares are not checked.'] }
  }
  if (/\b(food|eat|cuisine|dish|meal|local food|what to try)\b/i.test(lower)) {
    const destination = trip?.destination.toLowerCase() ?? ''
    const foodIdeas = /goa|panaji/.test(destination) ? 'Consider Goan fish curry with rice, xacuti, or bebinca; ask about ingredients and dietary needs.'
      : /kerala|kochi|munnar|alappuzha/.test(destination) ? 'Consider appam with stew, puttu with kadala curry, or a Kerala sadya; check ingredients and dietary fit.'
      : /delhi/.test(destination) ? 'Consider chole bhature, parathas, or a kebab meal; check spice, allergens, and dietary fit.'
      : /jaipur|rajasthan|udaipur/.test(destination) ? 'Consider dal baati churma, gatte ki sabzi, or a local thali; check spice and dietary fit.'
      : /mumbai|maharashtra/.test(destination) ? 'Consider poha, vada pav, or a regional thali; check spice and dietary fit.'
      : /kolkata|bengal/.test(destination) ? 'Consider a Bengali thali, shukto, or a local sweet such as sandesh; check ingredients and dietary fit.'
      : 'Look for regional dishes and local specialties; ask about ingredients, allergens, spice levels, and dietary fit.'
    return { reply: `For ${trip?.destination ?? 'your destination'}, ${foodIdeas} Check current menus and opening details directly, and use current sources when choosing a restaurant.${trip?.interests.includes('food') ? ' Food is one of your trip interests.' : ''}`, source: 'local_rules', limitations: ['Dish ideas are general; no restaurant, menu, price, or availability is verified.'] }
  }
  if (/\b(activity|activities|attraction|things to do|what to do)\b/i.test(lower)) {
    const interests = trip?.interests.length ? ` Your saved interests are ${trip.interests.join(', ')}; use those to choose what fits.` : ''
    return { reply: `For ${trip?.destination ?? 'your destination'}, consider a mix of a public green space or easy walk, a museum or cultural stop, and unstructured time to explore a neighborhood. Choose based on your group’s interests, accessibility, and pace.${interests} These are general activity types, not verified venues. Check current hours and access with each place before going.`, source: 'local_rules', limitations: ['Venue details, hours, accessibility, and availability are not verified.'] }
  }
  if (/\b(hotel|accommodation|hostel|resort|stay|lodging)\b/i.test(lower)) return { reply: `When choosing a place to stay${trip ? ` in ${trip.destination}` : ''}, compare total cost and cancellation rules, check distance to your planned areas, confirm accessibility and included amenities, and review current details on a booking provider.`, source: 'local_rules', limitations: ['Live rates, reviews, and room availability are not checked.'] }
  if (/\b(best time|when should i visit|season to visit|best season)\b/i.test(lower)) return { reply: `The best time to visit${trip ? ` ${trip.destination}` : ' a destination'} depends on your weather preferences, local events, crowds, and current travel conditions. I can’t check live forecasts or event calendars; compare official destination guidance and current weather information for your dates.`, source: 'local_rules', limitations: ['Current weather, events, and seasonal advisories are not checked.'] }
  if (/\b(how many days|how long|duration|days should|trip length|long should)\b/i.test(lower)) return { reply: trip ? `Your trip is ${tripLength(trip)} ${tripLength(trip) === 1 ? 'day' : 'days'}${trip.destination ? ` in ${trip.destination}` : ''}. Whether that is enough depends on travel time and how many areas you want to cover. Keep arrival and departure days light, and leave room for rest rather than packing every hour.` : 'A good trip length depends on travel time, budget, and how many areas you want to explore. Keep arrival and departure days light. Which destination and travel pace do you have in mind?', source: 'local_rules', limitations: [] }
  if (/\b(where should i go|destination|recommend.*(place|trip|country)|suggest.*(destination|place)|beach|mountain|heritage|culture)\b/i.test(lower)) return destinationIdeas(lower, trip)
  if (/\b(safety|safe|secure|scam|theft)\b/i.test(lower)) return { reply: `For a trip${trip ? ` to ${trip.destination}` : ''}, keep valuables secure, use transport from reputable providers, share plans with someone you trust, and follow current local advisories. For immediate danger, contact local emergency services; this assistant cannot verify their number.`, source: 'local_rules', limitations: ['Local safety conditions and advisories are not checked.'] }
  if (/\b(what can you do|help|supported|hello|hi|hey)\b/i.test(lower)) return { reply: `I’m TravelMate’s local, rule-based travel assistant. I can help with:\n${unsupportedTopics.split(', ').map((item) => `- ${item}`).join('\n')}\n\n${trip ? `I can also use your selected ${trip.destination} trip and its saved itinerary.` : 'Select a trip to get answers based on its details.'}`, source: 'local_rules', limitations: ['I do not use a language model or live travel data.'] }
  if (/\b(visa|passport|legal|law|medical|medicine|sick|ill|vaccin)\b/i.test(lower)) return { reply: 'Travel rules and health requirements vary and can change. Check official government or public-health sources, and ask a qualified professional for legal or medical advice specific to you.', source: 'local_rules', limitations: ['This assistant does not provide professional legal or medical advice or current entry requirements.'] }
  if (/\b(plan|planning|organize|organise|prepare|first trip|smooth trip)\b/i.test(lower) && /\b(travel|trip|holiday|vacation)\b/i.test(lower)) return { reply: `A practical order is: confirm dates and transport, choose lodging around your planned areas, set a total and daily budget, group activities by area, and leave buffer time for meals and delays.${trip ? ` For your ${trip.destination} trip, your dates are ${trip.startDate.slice(0, 10)} to ${trip.endDate.slice(0, 10)} and your budget is ${money(trip.budget, trip.currency)}.` : ' Share a trip to get advice based on its dates, transport, and budget.'} Confirm booking details and current local information with the relevant providers.`, source: 'local_rules', limitations: ['Current schedules, prices, venue details, and travel conditions are not checked.'] }
  if (/^(?:what|where|how|why|which|what'?s the best|can you help)\??$/i.test(message)) return { reply: `I’m not sure what travel detail you mean. Are you asking about packing, your budget, transport, food, safety, accommodation, trip length, or your saved itinerary?\n\n${unsupportedTopics}`, source: 'local_rules', limitations: [] }
  return { reply: `I can’t answer that reliably with the local travel rules available. ${unsupportedTopics} For current weather, schedules, venue details, prices, or bookings, please check a current provider.`, source: 'local_rules', limitations: ['This topic is outside the assistant’s supported local guidance.'] }
}
