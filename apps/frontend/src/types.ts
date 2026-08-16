export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	type: "tutor" | "student";
	isAdmin?: boolean;
}

export type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string };
