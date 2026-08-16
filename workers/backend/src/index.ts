import { Hono } from "hono";
import { cors } from "hono/cors";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "Internal server error" }, 500);
});

// CORS
app.use(
	"*",
	cors({
		origin: (origin) => {
			if (!origin) return null;
			if (origin === "http://localhost:5173") return origin;
			if (origin === "http://localhost:3000") return origin;
			if (origin.startsWith("http://localhost:")) return origin;
			if (origin.endsWith(".pages.dev")) return origin;
			return null;
		},
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Routes
const root = app
	.get("/health", (c) =>
		c.json({ status: "ok", service: "students-to-students-backend" }),
	)
	.route("/auth", authRouter)
	.route("/users", usersRouter)
	.route("/admin", adminRouter);

export default root;
