export const SESSION_COOKIE_NAME = "session_id";

export const sessionCookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "Lax" as const,
	path: "/",
};
