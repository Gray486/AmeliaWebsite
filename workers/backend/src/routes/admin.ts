import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { createDb, schema } from "../db";
import { SESSION_COOKIE_NAME } from "../lib/cookie";
import type { AppEnv } from "../types";

async function verifyAdmin(
	c: any,
	env: AppEnv["Bindings"],
): Promise<string | null> {
	const sessionId = getCookie(c, SESSION_COOKIE_NAME);
	if (!sessionId) return null;

	const db = createDb(env.DB);
	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
	});

	if (!session) return null;

	const now = Math.floor(Date.now() / 1000);
	if (session.expiresAt < now) return null;

	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, session.userId),
	});

	// Check if user is admin
	if (user?.isAdmin) {
		return user.id;
	}

	return null;
}

export const adminRouter = new Hono<AppEnv>()
	// List approved tutors
	.get("/tutors", async (c) => {
		const adminId = await verifyAdmin(c, c.env);
		if (!adminId) {
			return c.json({ success: false, error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const tutors = await db.query.tutorAllowlist.findMany();

		return c.json({
			success: true,
			data: tutors,
		});
	})
	// Add tutor to allowlist
	.post("/tutors", async (c) => {
		const adminId = await verifyAdmin(c, c.env);
		if (!adminId) {
			return c.json({ success: false, error: "Unauthorized" }, 401);
		}

		const body = await c.req.json<{ email: string }>();
		if (!body.email) {
			return c.json({ success: false, error: "Email required" }, 400);
		}

		const email = body.email.toLowerCase().trim();
		if (!email.includes("@")) {
			return c.json({ success: false, error: "Invalid email" }, 400);
		}

		const db = createDb(c.env.DB);

		// Check if already exists
		const existing = await db.query.tutorAllowlist.findFirst({
			where: eq(schema.tutorAllowlist.email, email),
		});

		if (existing) {
			return c.json({ success: false, error: "Email already approved" }, 400);
		}

		// Add to allowlist
		await db.insert(schema.tutorAllowlist).values({
			email,
			createdAt: Math.floor(Date.now() / 1000),
		});

		return c.json({ success: true, data: { email } });
	})
	// Remove tutor from allowlist
	.delete("/tutors/:email", async (c) => {
		const adminId = await verifyAdmin(c, c.env);
		if (!adminId) {
			return c.json({ success: false, error: "Unauthorized" }, 401);
		}

		const email = c.req.param("email").toLowerCase();

		const db = createDb(c.env.DB);
		await db
			.delete(schema.tutorAllowlist)
			.where(eq(schema.tutorAllowlist.email, email));

		return c.json({ success: true });
	});
