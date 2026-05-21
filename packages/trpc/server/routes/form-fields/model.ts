import { z } from "zod";

export const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInput = z.object({
  label: z.string().min(1, "Label is required").max(255),
  labelKey: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
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

export const getFieldByIdInput = z.object({
  id: z.string().uuid(),
});

export const listFieldsByFormInput = z.object({
  formId: z.string().uuid(),
});

export const deleteFieldInput = z.object({
  id: z.string().uuid(),
});

export const fieldOutput = z.object({
  id: z.string().uuid(),
  label: z.string(),
  labelKey: z.string(),
  description: z.string().nullable(),
  placeholder: z.string().nullable(),
  isRequired: z.boolean().default(false),
  index: z.number().default(0),
  type: fieldTypeEnum,
  formId: z.string().uuid(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const listFieldsOutput = z.array(fieldOutput);
export const deleteFieldOutput = z.object({ id: z.string().uuid() });

export const getFormByFormIdInput = z.object({
  formId: z.string().uuid(),
});

export const publicFormOutput = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  fields: z.array(fieldOutput),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;
export type GetFieldByIdInputType = z.infer<typeof getFieldByIdInput>;
export type ListFieldsByFormInputType = z.infer<typeof listFieldsByFormInput>;
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;
export type FieldOutputType = z.infer<typeof fieldOutput>;
export type ListFieldsOutputType = z.infer<typeof listFieldsOutput>;
export type DeleteFieldOutputType = z.infer<typeof deleteFieldOutput>;
export type GetFormByFormIdInputType = z.infer<typeof getFormByFormIdInput>;
export type PublicFormOutputType = z.infer<typeof publicFormOutput>;
