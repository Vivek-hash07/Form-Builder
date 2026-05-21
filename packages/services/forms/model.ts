import { z } from "zod"

export const createFormInput = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  createdBy: z.string().uuid(),
})

export const updateFormInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
})

export type CreateFormInputType = z.infer<typeof createFormInput>
export type UpdateFormInputType = z.infer<typeof updateFormInput>
