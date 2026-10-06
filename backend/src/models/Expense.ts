import { model, Schema, type InferSchemaType } from 'mongoose'

const expenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
  transportation: { type: Number, required: true, min: 0, default: 0 },
  fuel: { type: Number, required: true, min: 0, default: 0 },
  accommodation: { type: Number, required: true, min: 0, default: 0 },
  food: { type: Number, required: true, min: 0, default: 0 },
  activities: { type: Number, required: true, min: 0, default: 0 },
  tickets: { type: Number, required: true, min: 0, default: 0 },
  parkingTolls: { type: Number, required: true, min: 0, default: 0 },
  other: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true, trim: true, minlength: 3, maxlength: 3 },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true })

expenseSchema.index({ userId: 1, tripId: 1 }, { unique: true })

export type ExpenseDocument = InferSchemaType<typeof expenseSchema>
export const Expense = model('Expense', expenseSchema)
