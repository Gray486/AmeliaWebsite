export function generateId(): string {
	return Array.from(crypto.getRandomValues(new Uint8Array(12)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
