import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique, json } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsFieldsTable, formsTable } from "../schema";

export interface formSubmissionValue {
    formField: string,
    value: string
}

export type formSubmissionRow = formSubmissionValue[]

export const formsSubmissionTable = pgTable('forms_submission', {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id").references(() => formsTable.id),

    value: json('value').$type<formSubmissionValue>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})