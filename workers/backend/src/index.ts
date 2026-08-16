import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
	FRONTEND_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use("*", cors());

// Health check
app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

// Example API endpoint
app.get("/example", (c) => {
	return c.json({
		message: "Hello from Amelia Backend",
		timestamp: new Date().toISOString(),
	});
});

export default app;
