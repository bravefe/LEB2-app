import type Database from "better-sqlite3";

export function listCourses(database: Database.Database): unknown[] {
  return database.prepare(`
    SELECT c.*, COUNT(a.id) AS assignment_count,
      SUM(CASE WHEN a.status = 'not submitted' AND a.is_marked_done = 0 AND c.is_marked_done = 0 THEN 1 ELSE 0 END) AS unfinished_count
    FROM courses c
    LEFT JOIN assignments a ON a.course_id = c.id AND a.is_hidden = 0
    GROUP BY c.id
    ORDER BY c.code COLLATE NOCASE, c.name COLLATE NOCASE
  `).all();
}

export function listAssignments(database: Database.Database): unknown[] {
  return database.prepare(`
    SELECT a.*, c.name AS course_name, c.code AS course_code, c.section AS course_section,
           c.is_marked_done AS course_is_marked_done
    FROM assignments a
    INNER JOIN courses c ON c.id = a.course_id
    WHERE a.is_hidden = 0
    ORDER BY CASE WHEN a.due_at IS NULL THEN 1 ELSE 0 END, a.due_at, c.code COLLATE NOCASE, c.name COLLATE NOCASE, a.title COLLATE NOCASE
  `).all();
}

export function toggleAssignmentDone(database: Database.Database, assignmentId: string, isDone?: boolean): boolean {
  if (typeof isDone === "boolean") {
    database.prepare("UPDATE assignments SET is_marked_done = ?, updated_at = ? WHERE id = ?")
      .run(isDone ? 1 : 0, new Date().toISOString(), assignmentId);
    return isDone;
  }
  const current = database.prepare("SELECT is_marked_done FROM assignments WHERE id = ?").get(assignmentId) as { is_marked_done: number } | undefined;
  const next = current?.is_marked_done === 1 ? 0 : 1;
  database.prepare("UPDATE assignments SET is_marked_done = ?, updated_at = ? WHERE id = ?")
    .run(next, new Date().toISOString(), assignmentId);
  return next === 1;
}

export function toggleCourseDone(database: Database.Database, courseId: string, isDone?: boolean): boolean {
  if (typeof isDone === "boolean") {
    database.prepare("UPDATE courses SET is_marked_done = ?, updated_at = ? WHERE id = ?")
      .run(isDone ? 1 : 0, new Date().toISOString(), courseId);
    return isDone;
  }
  const current = database.prepare("SELECT is_marked_done FROM courses WHERE id = ?").get(courseId) as { is_marked_done: number } | undefined;
  const next = current?.is_marked_done === 1 ? 0 : 1;
  database.prepare("UPDATE courses SET is_marked_done = ?, updated_at = ? WHERE id = ?")
    .run(next, new Date().toISOString(), courseId);
  return next === 1;
}

export function markCourseAssignmentsDone(database: Database.Database, courseId: string, isDone: boolean): void {
  database.prepare("UPDATE assignments SET is_marked_done = ?, updated_at = ? WHERE course_id = ?")
    .run(isDone ? 1 : 0, new Date().toISOString(), courseId);
}

export function getLastScan(database: Database.Database): unknown {
  return database.prepare(`
    SELECT * FROM scans
    ORDER BY started_at DESC
    LIMIT 1
  `).get() ?? null;
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
