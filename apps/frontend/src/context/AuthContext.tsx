import React, { createContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setLoading(true);
				const result = (await api.users.getMe()) as {
					success: boolean;
					data?: User;
				};
				if (result.success) {
					setUser(result.data || null);
				}
				setError(null);
			} catch {
				setUser(null);
				setError(null); // Silent fail for unauthenticated
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	const logout = async () => {
		try {
			await api.auth.logout();
			setUser(null);
		} catch (err) {
			setError("Logout failed");
		}
	};

	const refreshUser = async () => {
		try {
			const result = (await api.users.getMe()) as {
				success: boolean;
				data?: User;
			};
			if (result.success) {
				setUser(result.data || null);
			} else {
				setUser(null);
			}
		} catch {
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, error, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
