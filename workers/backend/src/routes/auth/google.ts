import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { createDb, schema } from "../../db";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "../../lib/cookie";
import { generateId } from "../../lib/id";
import { sanitizeRedirect } from "../../lib/redirect";
import { createSessionId, getSessionExpiryTime } from "../../lib/session";
import type { AppEnv, GoogleTokenResponse, GoogleUserInfo } from "../../types";

function buildGoogleUrl(env: AppEnv["Bindings"], state: string): string {
	const params = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID,
		redirect_uri: env.GOOGLE_REDIRECT_URI,
		response_type: "code",
		scope: "openid email profile",
		state,
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function generateState(kv: KVNamespace, value: string): Promise<string> {
	const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	await kv.put(`oauth_state:${state}`, value, { expirationTtl: 600 });
	return state;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
	const parts = token.split(".");
	if (parts.length !== 3) throw new Error("Invalid JWT");
	const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
	return JSON.parse(atob(base64));
}

export const googleAuthRouter = new Hono<AppEnv>()
	// Initiate Google OAuth signin
	.get("/google", async (c) => {
		const redirect = sanitizeRedirect(c.req.query("redirect"));
		const stateValue = redirect ? `signin:${redirect}` : "signin";
		const state = await generateState(c.env.KV, stateValue);
		return c.redirect(buildGoogleUrl(c.env, state));
	})
	// Google OAuth callback
	.get("/google/callback", async (c) => {
		const app = (path: string) => `${c.env.FRONTEND_URL}${path}`;
		const oauthError = c.req.query("error");
		const code = c.req.query("code");
		const state = c.req.query("state");

		const err = (msg: string) =>
			c.redirect(app(`/login?error=${encodeURIComponent(msg)}`));

		if (oauthError) return err("Sign-in was cancelled.");
		if (!code || !state) return err("Missing code or state.");

		const stateValue = await c.env.KV.get(`oauth_state:${state}`);
		await c.env.KV.delete(`oauth_state:${state}`);
		if (!stateValue) return err("This sign-in link has expired.");

		const isRedirect = stateValue.startsWith("signin:");
		const redirectTo = isRedirect ? stateValue.slice(7) : null;

		try {
			// Exchange code for tokens
			const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					client_id: c.env.GOOGLE_CLIENT_ID,
					client_secret: c.env.GOOGLE_CLIENT_SECRET,
					code,
					grant_type: "authorization_code",
					redirect_uri: c.env.GOOGLE_REDIRECT_URI,
				}),
			});

			if (!tokenRes.ok) {
				const errorData = await tokenRes.text();
				console.error("Token exchange failed:", errorData);
				return err("Failed to exchange code for token.");
			}

			const tokens = (await tokenRes.json()) as GoogleTokenResponse;
			const userPayload = decodeJwtPayload(
				tokens.id_token,
			) as unknown as GoogleUserInfo;

			const db = createDb(c.env.DB);
			const durationHours = Number.parseInt(c.env.SESSION_DURATION_HOURS, 10);

			// Check for existing user
			const user = await db.query.users.findFirst({
				where: eq(schema.users.googleId, userPayload.sub),
			});

			if (user) {
				// User exists, create session
				const sessionId = createSessionId();
				const expiresAt = getSessionExpiryTime(durationHours);

				// Delete old session if exists
				await db
					.delete(schema.sessions)
					.where(eq(schema.sessions.userId, user.id));

				// Create new session
				await db.insert(schema.sessions).values({
					id: sessionId,
					userId: user.id,
					expiresAt,
					createdAt: Math.floor(Date.now() / 1000),
				});

				setCookie(c, SESSION_COOKIE_NAME, sessionId, {
					...sessionCookieOptions,
					maxAge: durationHours * 60 * 60,
				});

				return c.redirect(redirectTo || app("/"));
			}

			// New user
			const userType = await isTutorApproved(db, userPayload.email);

			if (userPayload.email && !userType) {
				// Tutor email not approved
				return err("Your email is not approved for tutor access.");
			}

			// Create new user
			const userId = generateId();
			const sessionId = createSessionId();
			const expiresAt = getSessionExpiryTime(durationHours);

			await db.insert(schema.users).values({
				id: userId,
				email: userPayload.email,
				firstName: userPayload.given_name || "Unknown",
				lastName: userPayload.family_name || "User",
				type: userType || "student",
				googleId: userPayload.sub,
				createdAt: Math.floor(Date.now() / 1000),
			});

			await db.insert(schema.sessions).values({
				id: sessionId,
				userId,
				expiresAt,
				createdAt: Math.floor(Date.now() / 1000),
			});

			setCookie(c, SESSION_COOKIE_NAME, sessionId, {
				...sessionCookieOptions,
				maxAge: durationHours * 60 * 60,
			});

			return c.redirect(redirectTo || app("/"));
		} catch (error) {
			console.error("Auth error:", error);
			return err("Authentication failed. Please try again.");
		}
	});

async function isTutorApproved(
	db: Awaited<ReturnType<typeof createDb>>,
	email: string,
): Promise<"tutor" | "student" | null> {
	const approved = await db.query.tutorAllowlist.findFirst({
		where: eq(schema.tutorAllowlist.email, email),
	});

	if (approved) return "tutor";
	// Students don't need approval
	return "student";
}
