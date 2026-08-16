import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		type: text("type").notNull(), // 'tutor' or 'student'
		googleId: text("google_id").notNull().unique(),
		createdAt: integer("created_at").notNull(),
	},
	(table) => [
		check("users_type_check", sql`${table.type} IN ('tutor', 'student')`),
	],
);

export const tutorAllowlist = sqliteTable("tutor_allowlist", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	email: text("email").notNull().unique(),
	createdAt: integer("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => users.id),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").notNull(),
});
