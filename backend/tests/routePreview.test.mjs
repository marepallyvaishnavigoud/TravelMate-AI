import test from 'node:test'
import assert from 'node:assert/strict'
import { routePreviewSchema } from '../dist/validators/tripValidators.js'

test('route preview accepts a complete distinct origin and destination', () => {
  assert.deepEqual(routePreviewSchema.parse({ origin: 'Hyderabad', destination: 'Bengaluru' }), {
    origin: 'Hyderabad', destination: 'Bengaluru',
  })
})

test('route preview rejects missing, blank, oversized, and identical locations', () => {
  for (const input of [
    { origin: '', destination: 'Bengaluru' },
    { origin: 'Hyderabad', destination: '  ' },
    { origin: 'Hyderabad', destination: 'hyderabad' },
    { origin: 'x'.repeat(121), destination: 'Bengaluru' },
    { origin: 'Hyderabad' },
  ]) assert.equal(routePreviewSchema.safeParse(input).success, false)
})
