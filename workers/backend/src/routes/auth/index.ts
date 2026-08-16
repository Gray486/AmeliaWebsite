import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { SESSION_COOKIE_NAME } from "../../lib/cookie";
import type { AppEnv } from "../../types";
import { googleAuthRouter } from "./google";

export const authRouter = new Hono<AppEnv>()
	.route("", googleAuthRouter)
	.post("/logout", (c) => {
		deleteCookie(c, SESSION_COOKIE_NAME);
		return c.json({ success: true });
	});
