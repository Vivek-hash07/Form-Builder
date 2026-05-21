import { authenticationProcedure, router } from "../../trpc";
import { formFieldService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInput,
  updateFieldInput,
  getFieldByIdInput,
  listFieldsByFormInput,
  deleteFieldInput,
  fieldOutput,
  listFieldsOutput,
  deleteFieldOutput,
} from "./model";

const TAGS = ["FormFields"];
const getPath = generatePath("/formFields");

const normalizeField = (field: any) => ({
  id: field.id,
  label: field.label,
  labelKey: field.labelKey,
  description: field.description ?? null,
  placeholder: field.placeholder ?? null,
  isRequired: field.isRequired ?? false,
  index: typeof field.index === "string" ? Number(field.index) : field.index,
  type: field.type,
  formId: field.formID ?? field.formId,
  createdAt: field.createdAt?.toISOString() ?? null,
  updatedAt: field.updatedAt?.toISOString() ?? null,
});

export const formFieldsRouter = router({
  listFieldsByForm: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFieldsByForm"),
        tags: TAGS,
      },
    })
    .input(listFieldsByFormInput)
    .output(listFieldsOutput)
    .query(async ({ input }) => {
      const fields = await formFieldService.listFieldsByForm(input.formId);
      return fields.map(normalizeField);
    }),

  getFieldById: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFieldById"),
        tags: TAGS,
      },
    })
    .input(getFieldByIdInput)
    .output(fieldOutput)
    .query(async ({ input }) => {
      const field = await formFieldService.getField(input.id);
      if (!field) throw new Error("Field not found");
      return normalizeField(field);
    }),

  createField: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
      },
    })
    .input(createFieldInput)
    .output(fieldOutput)
    .mutation(async ({ input }) => {
      const field = await formFieldService.createField(input);
      if (!field) throw new Error("Unable to create field");
      return normalizeField(field);
    }),

  updateField: authenticationProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/updateField"),
        tags: TAGS,
      },
    })
    .input(updateFieldInput)
    .output(fieldOutput)
    .mutation(async ({ input }) => {
      const field = await formFieldService.updateField(input);
      if (!field) throw new Error("Unable to update field");
      return normalizeField(field);
    }),

  deleteField: authenticationProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteField"),
        tags: TAGS,
      },
    })
    .input(deleteFieldInput)
    .output(deleteFieldOutput)
    .mutation(async ({ input }) => {
      const deleted = await formFieldService.deleteField(input);
      if (!deleted) throw new Error("Unable to delete field");
      return deleted;
    }),
});
