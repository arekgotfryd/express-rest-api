import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().max(100),
  industry: z.string().max(100),
  dateFounded: z.date(),
})

export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })
