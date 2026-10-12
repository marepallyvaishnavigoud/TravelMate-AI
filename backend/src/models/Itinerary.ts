import { model, Schema, type InferSchemaType } from 'mongoose'

const itinerarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
  generationMethod: { type: String, required: true, enum: ['rule-based'] },
  itinerary: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true })
itinerarySchema.index({ userId: 1, tripId: 1 }, { unique: true })

export type ItineraryDocument = InferSchemaType<typeof itinerarySchema>
export const Itinerary = model('Itinerary', itinerarySchema)
