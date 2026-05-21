import { db, eq } from "@repo/database";
import { formsFieldsTable } from "@repo/database/models/form-fields";
import {
  CreateFieldInputType,
  UpdateFieldInputType,
  DeleteFieldInputType,
  createFieldInput,
  updateFieldInput,
  deleteFieldInput,
} from "./model";

class FormFieldService {
  public async getFieldById(id: string) {
    const result = await db
      .select()
      .from(formsFieldsTable)
      .where(eq(formsFieldsTable.id, id));

    if (!result || result.length === 0) return null;
    return result[0];
  }

  public async getField(id: string) {
    return this.getFieldById(id);
  }

  public async listFieldsByForm(formId: string) {
    return await db
      .select()
      .from(formsFieldsTable)
      .where(eq(formsFieldsTable.formID, formId));
  }

  public async createField(payload: CreateFieldInputType) {
    const input = await createFieldInput.parseAsync(payload);
    const insertResult = await db
      .insert(formsFieldsTable)
      .values({
        label: input.label,
        labelKey: input.labelKey || input.label.toLowerCase().replace(/\s+/g, "-"),
        description: input.description,
        placeholder: input.placeholder,
        isRequired: input.isRequired ?? false,
        index: input.index.toFixed(2),
        type: input.type,
        formID: input.formId,
      })
      .returning({
        id: formsFieldsTable.id,
        label: formsFieldsTable.label,
        labelKey: formsFieldsTable.labelKey,
        description: formsFieldsTable.description,
        placeholder: formsFieldsTable.placeholder,
        isRequired: formsFieldsTable.isRequired,
        index: formsFieldsTable.index,
        type: formsFieldsTable.type,
        formID: formsFieldsTable.formID,
        createdAt: formsFieldsTable.createdAt,
        updatedAt: formsFieldsTable.updatedAt,
      });

    if (!insertResult || insertResult.length === 0) {
      throw new Error("Unable to create field");
    }

    return insertResult[0];
  }

  public async updateField(payload: UpdateFieldInputType) {
    const input = await updateFieldInput.parseAsync(payload);
    const updateData: Partial<{
      label: string;
      labelKey: string;
      description: string | null;
      placeholder: string | null;
      isRequired: boolean;
      index: string;
      type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
    }> = {};

    if (input.label !== undefined) updateData.label = input.label;
    if (input.labelKey !== undefined) updateData.labelKey = input.labelKey;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.placeholder !== undefined) updateData.placeholder = input.placeholder;
    if (input.isRequired !== undefined) updateData.isRequired = input.isRequired;
    if (input.index !== undefined) updateData.index = input.index.toFixed(2);
    if (input.type !== undefined) updateData.type = input.type;

    const updateResult = await db
      .update(formsFieldsTable)
      .set(updateData)
      .where(eq(formsFieldsTable.id, input.id))
      .returning({
        id: formsFieldsTable.id,
        label: formsFieldsTable.label,
        labelKey: formsFieldsTable.labelKey,
        description: formsFieldsTable.description,
        placeholder: formsFieldsTable.placeholder,
        isRequired: formsFieldsTable.isRequired,
        index: formsFieldsTable.index,
        type: formsFieldsTable.type,
        formID: formsFieldsTable.formID,
        createdAt: formsFieldsTable.createdAt,
        updatedAt: formsFieldsTable.updatedAt,
      });

    if (!updateResult || updateResult.length === 0) {
      throw new Error("Unable to update field");
    }

    return updateResult[0];
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const input = await deleteFieldInput.parseAsync(payload);
    const deleteResult = await db
      .delete(formsFieldsTable)
      .where(eq(formsFieldsTable.id, input.id))
      .returning({ id: formsFieldsTable.id });

    if (!deleteResult || deleteResult.length === 0) {
      throw new Error("Unable to delete field");
    }

    return deleteResult[0];
  }
}

export const formFieldService = new FormFieldService();