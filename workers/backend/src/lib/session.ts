import { generateId } from "./id";

export function createSessionId(): string {
	return generateId();
}

export function getSessionExpiryTime(durationHours: number): number {
	return Math.floor(Date.now() / 1000) + durationHours * 60 * 60;
}

export function isSessionExpired(expiresAt: number): boolean {
	return expiresAt < Math.floor(Date.now() / 1000);
}
