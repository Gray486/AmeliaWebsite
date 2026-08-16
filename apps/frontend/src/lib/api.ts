const API_BASE = "/api";

export async function apiCall<T>(
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		method,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		body: body ? JSON.stringify(body) : undefined,
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.statusText}`);
	}

	return response.json();
}

export const api = {
	auth: {
		loginGoogle: () => {
			window.location.href = `${API_BASE}/auth/google`;
		},
		logout: () => apiCall("POST", "/auth/logout"),
	},
	users: {
		getMe: () => apiCall("GET", "/users/me"),
	},
	admin: {
		listTutors: () => apiCall("GET", "/admin/tutors"),
		addTutor: (email: string) => apiCall("POST", "/admin/tutors", { email }),
		removeTutor: (email: string) =>
			apiCall("DELETE", `/admin/tutors/${encodeURIComponent(email)}`),
	},
};
