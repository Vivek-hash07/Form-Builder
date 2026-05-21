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
      return await formService.listFormsByUser(userId);
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
      return form;
    }),
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInput)
    .query(async ({ input }) => {
      const form = await formService.getFormById(input.id);
      if (!form) throw new Error("Form not found");
      return form;
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
      return await formService.createForm({
        ...input,
        createdBy: userId,
      });
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
      return await formService.updateForm(input);
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
      return await formService.deleteForm(input.id);
    }),
});
