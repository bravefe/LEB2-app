import type Database from "better-sqlite3";

export function listCourses(database: Database.Database): unknown[] {
  return database.prepare(`
    SELECT c.*, COUNT(a.id) AS assignment_count,
      SUM(CASE WHEN a.status IN ('not_started', 'in_progress', 'unknown') THEN 1 ELSE 0 END) AS unfinished_count
    FROM courses c
    LEFT JOIN assignments a ON a.course_id = c.id AND a.is_hidden = 0
    GROUP BY c.id
    ORDER BY c.name COLLATE NOCASE
  `).all();
}

export function listAssignments(database: Database.Database): unknown[] {
  return database.prepare(`
    SELECT a.*, c.name AS course_name, c.code AS course_code
    FROM assignments a
    INNER JOIN courses c ON c.id = a.course_id
    WHERE a.is_hidden = 0
    ORDER BY CASE WHEN a.due_at IS NULL THEN 1 ELSE 0 END, a.due_at, c.name COLLATE NOCASE, a.title COLLATE NOCASE
  `).all();
}

export function getSetting(database: Database.Database, key: string): string | null {
  const row = database.prepare("SELECT value FROM app_settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(database: Database.Database, key: string, value: string): void {
  database.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}
