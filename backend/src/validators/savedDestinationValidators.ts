import { z } from 'zod'

export const destinationIdSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Destination ID is invalid.')
export const saveDestinationSchema = z.object({
  destinationName: z.string().trim().min(1).max(120),
  destinationImage: z.string().trim().min(1).max(500),
}).strict()
