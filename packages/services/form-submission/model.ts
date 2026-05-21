import { z } from "zod";

export const formSubmissionValueSchema = z.object({
  formField: z.string(),
  value: z.string(),
});

export const formSubmissionRowSchema = z.array(formSubmissionValueSchema);

export const createSubmissionInput = z.object({
  formId: z.string().uuid(),
  value: formSubmissionRowSchema,
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;
