-- D1 (SQLite) schema for the graduation message board

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  major TEXT NOT NULL,
  student_id TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_data_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

