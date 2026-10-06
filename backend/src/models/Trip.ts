import { model, Schema, type InferSchemaType } from 'mongoose'

const tripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  origin: { type: String, required: true, trim: true, maxlength: 120 },
  destination: { type: String, required: true, trim: true, maxlength: 120 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  travelers: { type: Number, required: true, min: 1 },
  budget: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'INR', uppercase: true, trim: true, minlength: 3, maxlength: 3 },
  transport: { type: String, required: true, enum: ['car', 'bus', 'train', 'flight'] },
  interests: { type: [String], default: [] },
  status: { type: String, enum: ['planning', 'upcoming', 'completed'], default: 'planning', required: true },
}, { timestamps: true })

tripSchema.index({ userId: 1, createdAt: -1 })

export type TripDocument = InferSchemaType<typeof tripSchema>
export const Trip = model('Trip', tripSchema)
