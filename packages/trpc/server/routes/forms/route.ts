import { authenticationProcedure, router } from "../../trpc";
import { formService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInput,
  updateFormInput,
  getFormByIdInput,
  deleteFormInput,
  formOutput,
  listFormsOutput,
  deleteFormOutput,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const normalizeForm = (form: {
  id: string;
  title: string;
  description: string | null;
  createdBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}) => ({
  ...form,
  createdAt: form.createdAt?.toISOString() ?? null,
  updatedAt: form.updatedAt?.toISOString() ?? null,
});

export const formsRouter = router({
  listUserForms: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listUserForms"),
        tags: TAGS,
      },
    })
    .output(listFormsOutput)
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User is not authenticated");
      const forms = await formService.listFormsByUser(userId);
      return forms.map(normalizeForm);
    }),

  getFormById: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInput)
    .output(formOutput)
    .query(async ({ input }) => {
      const form = await formService.getFormById(input.id);
      if (!form) throw new Error("Form not found");
      return {
        ...form,
        createdAt: form.createdAt?.toISOString() ?? null,
        updatedAt: form.updatedAt?.toISOString() ?? null,
      };
    }),

  createForm: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
      },
    })
    .input(createFormInput)
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User is not authenticated");
      const form = await formService.createForm({
        ...input,
        createdBy: userId,
      });
      if (!form) throw new Error("Failed to create form");
      return {
        id: form.id!,
        title: form.title!,
        description: form.description ?? null,
        createdBy: form.createdBy ?? null,
        createdAt: form.createdAt?.toISOString() ?? null,
        updatedAt: form.updatedAt?.toISOString() ?? null,
      };
    }),

  updateForm: authenticationProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/updateForm"),
        tags: TAGS,
      },
    })
    .input(updateFormInput)
    .output(formOutput)
    .mutation(async ({ input }) => {
      const form = await formService.updateForm(input);
      if (!form) throw new Error("Failed to update form");
      return {
        id: form.id!,
        title: form.title!,
        description: form.description ?? null,
        createdBy: form.createdBy ?? null,
        createdAt: form.createdAt?.toISOString() ?? null,
        updatedAt: form.updatedAt?.toISOString() ?? null,
      };
    }),

  deleteForm: authenticationProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteForm"),
        tags: TAGS,
      },
    })
    .input(deleteFormInput)
    .output(deleteFormOutput)
    .mutation(async ({ input }) => {
      const deleted = await formService.deleteForm(input.id);
      if (!deleted) throw new Error("Form not found");
      return deleted;
    }),
});
