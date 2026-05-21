import { z } from "zod";

export const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInput = z.object({
  label: z.string().min(1, "Label is required").max(255),
  labelKey: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional(),
  index: z.number().min(0),
  type: fieldTypeEnum,
  formId: z.string().uuid(),
});

export const updateFieldInput = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, "Label is required").max(255).optional(),
  labelKey: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  index: z.number().min(0).optional(),
  type: fieldTypeEnum.optional(),
});

export const deleteFieldInput = z.object({
  id: z.string().uuid(),
});

export const getFieldByIdInput = z.object({
  id: z.string().uuid(),
});

export const listFieldsByFormInput = z.object({
  formId: z.string().uuid(),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;
export type GetFieldByIdInputType = z.infer<typeof getFieldByIdInput>;
export type ListFieldsByFormInputType = z.infer<typeof listFieldsByFormInput>;