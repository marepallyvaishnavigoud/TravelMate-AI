import { model, Schema, type InferSchemaType } from 'mongoose'

const savedDestinationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: String, required: true, trim: true },
  destinationName: { type: String, required: true, trim: true },
  destinationImage: { type: String, required: true, trim: true },
  savedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true })

savedDestinationSchema.index({ userId: 1, destinationId: 1 }, { unique: true })

export type SavedDestinationDocument = InferSchemaType<typeof savedDestinationSchema>
export const SavedDestination = model('SavedDestination', savedDestinationSchema)
