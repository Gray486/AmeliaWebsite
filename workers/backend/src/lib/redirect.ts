export function sanitizeRedirect(url: string | undefined): string | null {
	if (!url) return null;

	try {
		// Only allow relative redirects
		if (url.startsWith("/")) {
			return url;
		}
	} catch {
		// Invalid URL
	}

	return null;
}
