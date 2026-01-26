import { z } from 'zod'

export const organizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Please provide organization name')
    .max(100, 'Organization name too long'),
  industry: z
    .string()
    .min(1, 'Please provide industry')
    .max(100, 'Industry name too long'),
  dateFounded: z.coerce
    .date()
    .refine((date) => date <= new Date(), 'Date founded must be in the past'),
})
