import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsTable } from "../schema";

export const forTypeEnum = pgEnum('form_type_enum', ['TEXT','NUMBER','EMAIL','YES_NO','PASSWORD'])

export const formsFieldsTable = pgTable('forms_fields',{
    id: uuid("id").primaryKey().defaultRandom(),

    label: text('label', {length: 255}).notNull(),
    labelKey: varchar('label_key', {length: 255}).notNull(),

    description: text('description'),
    placeholder: text('placeholder'),

    isRequired: boolean('is_required').default(false),

    index: numeric('index', { scale: 2}).notNull(),

    type: forTypeEnum('type').notNull(),

    formID: uuid('form_id').references(() => formsTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
    return {
        uniqueFormAndIndex: unique().on(table.formID, table.index)
    }
})