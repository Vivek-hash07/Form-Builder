import { authenticationProcedure, publicProcedure, router } from "../../trpc";
import { formSubmissionService, formService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { createSubmissionInput, submissionOutput } from "./model";
import { z } from "zod";

const TAGS = ["FormSubmissions"];
const getPath = generatePath("/formSubmissions");

export const formSubmissionsRouter = router({
  submitForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitForm"),
        tags: TAGS,
      },
    })
    .input(createSubmissionInput)
    .output(submissionOutput)
    .mutation(async ({ input }) => {
      const submission = await formSubmissionService.createSubmission(input);
      return {
        id: submission.id,
        formId: submission.formId,
        value: submission.value as any,
        createdAt: submission.createdAt?.toISOString() ?? null,
        updatedAt: submission.updatedAt?.toISOString() ?? null,
      };
    }),

  listSubmissionsByForm: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listSubmissionsByForm"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(submissionOutput))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      const form = await formService.getFormById(input.formId);
      if (!form) {
        throw new Error("Form not found");
      }

      if (form.createdBy !== userId) {
        throw new Error("You are not authorized to view submissions for this form");
      }

      const submissions = await formSubmissionService.listSubmissionsByForm(input.formId);
      return submissions.map((submission) => ({
        id: submission.id,
        formId: submission.formId,
        value: submission.value as any,
        createdAt: submission.createdAt?.toISOString() ?? null,
        updatedAt: submission.updatedAt?.toISOString() ?? null,
      }));
    }),
});

