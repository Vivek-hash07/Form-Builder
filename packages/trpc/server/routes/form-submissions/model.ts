import { z } from "zod";

export const formSubmissionValueInput = z.object({
  formField: z.string(),
  value: z.string(),
});

export const createSubmissionInput = z.object({
  formId: z.string().uuid(),
  value: z.array(formSubmissionValueInput),
});

export const submissionOutput = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid().nullable(),
  value: z.array(formSubmissionValueInput),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;
export type SubmissionOutputType = z.infer<typeof submissionOutput>;
