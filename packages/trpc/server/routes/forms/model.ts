import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});

export const updateFormInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
});

export const getFormByIdInput = z.object({
  id: z.string().uuid(),
});

export const deleteFormInput = z.object({
  id: z.string().uuid(),
});

export const formOutput = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const listFormsOutput = z.array(formOutput);
export const deleteFormOutput = z.object({
  id: z.string().uuid(),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;
export type UpdateFormInputType = z.infer<typeof updateFormInput>;
export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;
export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
export type FormOutputType = z.infer<typeof formOutput>;
export type ListFormsOutputType = z.infer<typeof listFormsOutput>;
export type DeleteFormOutputType = z.infer<typeof deleteFormOutput>;
