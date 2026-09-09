PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  section TEXT,
  url TEXT NOT NULL UNIQUE,
  last_scanned_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  assignment_type TEXT,
  creator TEXT,
  publish_date TEXT,
  status TEXT NOT NULL,
  raw_status_text TEXT,
  due_at TEXT,
  attachment_text TEXT,
  raw_text TEXT NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  source_hash TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  classes_found INTEGER NOT NULL DEFAULT 0,
  activities_found INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
