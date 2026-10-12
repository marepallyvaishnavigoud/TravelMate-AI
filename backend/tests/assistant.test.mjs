import assert from 'node:assert/strict'
import express from 'express'
import { once } from 'node:events'
import test from 'node:test'
import { chatWithAssistantController } from '../dist/controllers/assistantController.js'
import { assistantRoutes } from '../dist/routes/assistantRoutes.js'
import { errorHandler } from '../dist/middleware/errorHandler.js'
import { assistantChatSchema } from '../dist/controllers/assistantController.js'
import { getOwnedAssistantContext } from '../dist/services/assistantContextService.js'
import { answerTravelQuestion } from '../dist/services/assistantService.js'
import { AppError } from '../dist/utils/AppError.js'

const trip = {
  title: 'Family break', origin: 'Delhi', destination: 'Goa',
  startDate: '2026-12-10T00:00:00.000Z', endDate: '2026-12-14T00:00:00.000Z',
  travelers: 4, budget: 80000, currency: 'INR', transport: 'flight', interests: ['food', 'beach'],
}
const itinerary = {
  summary: 'A relaxed five day plan.', days: [{ day: 1, title: 'Arrival and coast', activities: [{ time: '10:00', title: 'Arrive and check in' }, { time: '16:00', title: 'Beach walk' }] }],
  estimatedTotalCost: 62000, budget: 80000, budgetRemaining: 18000,
  budgetEstimate: { transportation: 15000, accommodation: 25000, food: 12000, activities: 5000, localTravel: 3000, miscellaneous: 2000 },
}

test('packing advice uses actual trip duration, destination, and transport', () => {
  const answer = answerTravelQuestion({ message: 'What should I pack?', trip })
  assert.match(answer.reply, /5 days/)
  assert.match(answer.reply, /Goa/)
  assert.match(answer.reply, /flight/)
  assert.equal(answer.source, 'local_rules')
})

test('budget advice uses trip budget and saved category estimates without promising savings', () => {
  const answer = answerTravelQuestion({ message: 'How can I reduce my trip budget?', trip, itinerary })
  assert.match(answer.reply, /₹80,000/)
  assert.match(answer.reply, /₹62,000/)
  assert.match(answer.reply, /Accommodation/)
  assert.match(answer.reply, /can’t promise a specific saving/)
})

test('itinerary explanation uses saved days and activities', () => {
  const answer = answerTravelQuestion({ message: 'Explain my itinerary.', trip, itinerary })
  assert.match(answer.reply, /relaxed five day plan/i)
  assert.match(answer.reply, /Beach walk/)
})

test('itinerary question honestly reports when no saved itinerary exists', () => {
  const answer = answerTravelQuestion({ message: 'Explain my itinerary.', trip })
  assert.match(answer.reply, /can’t see a saved itinerary/)
  assert.ok(answer.limitations.length)
})

test('general travel advice works without trip context', () => {
  const answer = answerTravelQuestion({ message: 'What should I pack?' })
  assert.match(answer.reply, /share your destination/i)
})

test('unsupported questions receive an honest fallback', () => {
  const answer = answerTravelQuestion({ message: 'Can you solve this algebra proof?' })
  assert.match(answer.reply, /can’t answer that reliably/i)
  assert.equal(answer.source, 'local_rules')
})

test('ambiguous questions invite a follow-up instead of guessing', () => {
  const answer = answerTravelQuestion({ message: 'Where?' })
  assert.match(answer.reply, /what travel detail you mean/i)
})

test('weather and live lodging availability never produce invented live facts', () => {
  const weather = answerTravelQuestion({ message: 'What is the weather tomorrow in Goa?', trip })
  assert.match(weather.reply, /don’t have a recently fetched weather result/i)
  assert.doesNotMatch(weather.reply, /\b\d+\s?(?:°|degrees|mm|%)/i)
  const hotel = answerTravelQuestion({ message: 'Is a hotel available tomorrow?', trip })
  assert.match(hotel.reply, /can’t check live room availability/i)
})

test('the assistant uses only recently supplied, source-stamped weather snapshots', () => {
  const noSnapshot = answerTravelQuestion({ message: 'What is the weather?', trip })
  assert.match(noSnapshot.reply, /don’t have a recently fetched weather result/i)
  assert.equal(noSnapshot.source, 'local_rules')
  const withSnapshot = answerTravelQuestion({ message: 'What is the weather?', trip, weatherSnapshot: { location: 'Goa', temperatureC: 29, feelsLikeC: 31, humidityPercent: 70, windSpeedKmh: 12, condition: 'Partly cloudy', time: '2026-10-12T18:00+05:30', timezone: 'Asia/Kolkata', sourceUrl: 'https://open-meteo.com/' } })
  assert.equal(withSnapshot.source, 'open_meteo')
  assert.match(withSnapshot.reply, /model time/i)
  assert.match(withSnapshot.reply, /open-meteo.com/i)
})

test('food suggestions are destination-aware and do not claim verified restaurants', () => {
  const answer = answerTravelQuestion({ message: 'What local food should I try?', trip })
  assert.match(answer.reply, /Goan fish curry/)
  assert.match(answer.limitations.join(' '), /no restaurant.*verified/i)
})

test('general trip planning questions get an actionable outline', () => {
  const answer = answerTravelQuestion({ message: 'How do I plan a smooth trip?', trip })
  assert.match(answer.reply, /confirm dates and transport/i)
  assert.match(answer.reply, /₹80,000/)
})

test('request validation rejects empty, oversized, and malformed bodies', () => {
  assert.throws(() => assistantChatSchema.parse({ message: '   ' }))
  assert.throws(() => assistantChatSchema.parse({ message: 'a'.repeat(1001) }))
  assert.throws(() => assistantChatSchema.parse({ message: 'hello', userId: 'not trusted' }))
  assert.deepEqual(assistantChatSchema.parse({ message: '  hello  ' }), { message: 'hello' })
})

test('a trip missing from the authenticated owner scope is not exposed', async () => {
  let itineraryWasRead = false
  let queriedOwner = ''
  const repository = {
    async findTrip(id, userId) { assert.equal(id, '64a000000000000000000001'); queriedOwner = userId; return null },
    async findItinerary() { itineraryWasRead = true; return itinerary },
  }
  await assert.rejects(() => getOwnedAssistantContext('user-a', '64a000000000000000000001', repository), (error) => error instanceof AppError && error.statusCode === 404)
  assert.equal(queriedOwner, 'user-a')
  assert.equal(itineraryWasRead, false)
})

test('a nonexistent trip returns the same not-found response and never reads its itinerary', async () => {
  let itineraryWasRead = false
  const repository = { async findTrip(_id, _userId) { return null }, async findItinerary() { itineraryWasRead = true; return itinerary } }
  await assert.rejects(() => getOwnedAssistantContext('user-a', '64a000000000000000000002', repository), (error) => error instanceof AppError && error.statusCode === 404)
  assert.equal(itineraryWasRead, false)
})

test('invalid trip identifiers fail closed before database lookups', async () => {
  let queried = false
  const repository = { async findTrip() { queried = true; return trip }, async findItinerary() { return itinerary } }
  await assert.rejects(() => getOwnedAssistantContext('user-a', 'invalid-id', repository), (error) => error instanceof AppError && error.statusCode === 404)
  assert.equal(queried, false)
})

test('chat controller rejects requests without authentication', async () => {
  await assert.rejects(() => chatWithAssistantController({ body: { message: 'What should I pack?' } }, {}, () => {}), (error) => error instanceof AppError && error.statusCode === 401)
})

test('the registered assistant endpoint rejects missing authentication', async (context) => {
  const app = express()
  app.use(express.json())
  app.use('/api/assistant', assistantRoutes)
  app.use(errorHandler)
  const server = app.listen(0)
  context.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const response = await fetch(`http://127.0.0.1:${address.port}/api/assistant/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'What should I pack?' }) })
  assert.equal(response.status, 401)
  assert.match((await response.json()).message, /authentication is required/i)
})
