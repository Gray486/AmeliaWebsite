export interface AppEnv {
	Bindings: {
		DB: D1Database;
		KV: KVNamespace;
		FRONTEND_URL: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		GOOGLE_REDIRECT_URI: string;
		SESSION_DURATION_HOURS: string;
	};
}

export interface GoogleTokenResponse {
	access_token: string;
	id_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
}

export interface GoogleUserInfo {
	sub: string;
	email: string;
	email_verified: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	aud: string;
	iss: string;
	iat: number;
	exp: number;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	type: "tutor" | "student";
	googleId: string;
	createdAt: number;
}

export type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string };
