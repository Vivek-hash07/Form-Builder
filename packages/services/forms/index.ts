import { db, eq } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { formsFieldsTable } from "@repo/database/models/form-fields"
import {
  CreateFormInputType,
  UpdateFormInputType,
  createFormInput,
  updateFormInput,
} from "./model"

class FormService {
  public async getFormById(id: string) {
    const result = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, id))

    if (!result || result.length === 0) return null
    return result[0]
  }

  public async getFormWithFields(formId: string) {
    const result = await db
      .select()
      .from(formsTable)
      .leftJoin(formsFieldsTable, eq(formsFieldsTable.formID, formsTable.id))
      .where(eq(formsTable.id, formId))

    if (!result || result.length === 0) return null

    const firstRow = result[0]
    if (!firstRow) return null

    const form = firstRow.forms
    const fields = result
      .map(row => row.forms_fields)
      .filter((field): field is NonNullable<typeof field> => field !== null)

    return {
      ...form,
      fields,
    }
  }

  public async listFormsByUser(userId: string) {
    return await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId))
  }

  public async createForm(payload: CreateFormInputType) {
    const input = await createFormInput.parseAsync(payload)

    const insertResult = await db
      .insert(formsTable)
      .values({
        title: input.title,
        description: input.description,
        createdBy: input.createdBy,
      })
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        createdBy: formsTable.createdBy,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })

    if (!insertResult || insertResult.length === 0) {
      throw new Error("Unable to create form")
    }

    return insertResult[0]
  }

  public async updateForm(payload: UpdateFormInputType) {
    const input = await updateFormInput.parseAsync(payload)

    const updateData: Partial<{
      title: string
      description: string | null
    }> = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description

    const result = await db
      .update(formsTable)
      .set(updateData)
      .where(eq(formsTable.id, input.id))
      .returning()

    if (!result || result.length === 0) {
      throw new Error(`Form with id ${input.id} not found`)
    }

    return result[0]
  }

  public async deleteForm(id: string) {
    const deleted = await db
      .delete(formsTable)
      .where(eq(formsTable.id, id))
      .returning({ id: formsTable.id })

    if (!deleted || deleted.length === 0) {
      throw new Error(`Form with id ${id} not found`)
    }

    return deleted[0]
  }
}

export default FormService
