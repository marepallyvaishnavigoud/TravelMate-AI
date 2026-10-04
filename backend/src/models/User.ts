import { model, Schema, type InferSchemaType } from 'mongoose'

export type UserRole = 'user' | 'admin'

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2 },
  lastName: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true })

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: { toString(): string } }
export const User = model('User', userSchema)
