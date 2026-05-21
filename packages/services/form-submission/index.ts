import { db, eq } from "@repo/database";
import { formsSubmissionTable } from "@repo/database/models/form-submission";
import { CreateSubmissionInputType, createSubmissionInput } from "./model";

class FormSubmissionService {
  public async createSubmission(payload: CreateSubmissionInputType) {
    const input = await createSubmissionInput.parseAsync(payload);

    const insertResult = await db
      .insert(formsSubmissionTable)
      .values({
        formId: input.formId,
        value: input.value as any,
      })
      .returning();

    const result = insertResult[0];
    if (!result) {
      throw new Error("Unable to submit form response");
    }

    return result;
  }

  public async listSubmissionsByForm(formId: string) {
    return await db
      .select()
      .from(formsSubmissionTable)
      .where(eq(formsSubmissionTable.formId, formId));
  }
}

export default FormSubmissionService;
