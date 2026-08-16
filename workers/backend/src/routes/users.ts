import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { createDb, schema } from "../db";
import { SESSION_COOKIE_NAME } from "../lib/cookie";
import type { AppEnv } from "../types";

export const usersRouter = new Hono<AppEnv>()
	// Get current user
	.get("/me", async (c) => {
		const sessionId = getCookie(c, SESSION_COOKIE_NAME);
		if (!sessionId) {
			return c.json({ success: false, error: "Not authenticated" }, 401);
		}

		const db = createDb(c.env.DB);
		const session = await db.query.sessions.findFirst({
			where: eq(schema.sessions.id, sessionId),
		});

		if (!session) {
			return c.json({ success: false, error: "Session not found" }, 401);
		}

		const now = Math.floor(Date.now() / 1000);
		if (session.expiresAt < now) {
			return c.json({ success: false, error: "Session expired" }, 401);
		}

		const user = await db.query.users.findFirst({
			where: eq(schema.users.id, session.userId),
		});

		if (!user) {
			return c.json({ success: false, error: "User not found" }, 401);
		}

		return c.json({
			success: true,
			data: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				type: user.type,
			},
		});
	});
