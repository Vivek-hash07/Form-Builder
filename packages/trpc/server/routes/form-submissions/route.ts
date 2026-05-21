import { authenticationProcedure, publicProcedure, router } from "../../trpc";
import { formSubmissionService } from "../../services";
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
    .query(async ({ input }) => {
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
