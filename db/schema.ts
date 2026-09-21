import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull(),
  businessName: text("business_name"),
  createdAt: integer("created_at").notNull(),
});
export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    origin: text("origin").notNull(),
    type: text("type").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_categories_user_origin").on(t.userId, t.origin)],
);
export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    origin: text("origin").notNull(),
    amountCents: integer("amount_cents").notNull(),
    occurredOn: text("occurred_on").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    paymentMethod: text("payment_method").notNull(),
    status: text("status").notNull(),
    notes: text("notes"),
    receiptId: text("receipt_id"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("idx_transactions_user_date").on(t.userId, t.occurredOn),
    index("idx_transactions_user_origin").on(t.userId, t.origin),
    index("idx_transactions_user_type").on(t.userId, t.type),
  ],
);
export const receipts = sqliteTable(
  "receipts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    objectKey: text("object_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    status: text("status").notNull(),
    parsedJson: text("parsed_json"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_receipts_user_status").on(t.userId, t.status)],
);
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    direction: text("direction").notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    dueOn: text("due_on").notNull(),
    category: text("category").notNull(),
    counterparty: text("counterparty"),
    origin: text("origin").notNull(),
    status: text("status").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("idx_accounts_user_due").on(t.userId, t.dueOn),
    index("idx_accounts_user_direction").on(t.userId, t.direction),
  ],
);
export const barbers = sqliteTable(
  "barbers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    commissionPercent: integer("commission_percent").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_barbers_user_status").on(t.userId, t.status)],
);
export const commissions = sqliteTable(
  "commissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    barberId: text("barber_id").notNull(),
    service: text("service").notNull(),
    grossCents: integer("gross_cents").notNull(),
    commissionCents: integer("commission_cents").notNull(),
    occurredOn: text("occurred_on").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("idx_commissions_user_date").on(t.userId, t.occurredOn),
    index("idx_commissions_barber").on(t.barberId),
  ],
);
export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: integer("read_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_notifications_user_read").on(t.userId, t.readAt)],
);
