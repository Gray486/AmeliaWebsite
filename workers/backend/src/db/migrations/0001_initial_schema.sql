-- Users table
CREATE TABLE users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('tutor', 'student')),
	google_id TEXT NOT NULL UNIQUE,
	created_at INTEGER NOT NULL
);

-- Tutor allowlist
CREATE TABLE tutor_allowlist (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	created_at INTEGER NOT NULL
);

-- Sessions
CREATE TABLE sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
	expires_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_tutor_allowlist_email ON tutor_allowlist(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
