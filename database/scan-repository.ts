import { createHash, randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import type { ActivityRecord, ScanResult } from "../playwright/types.js";

function sourceHash(activity: ActivityRecord): string {
  return createHash("sha256").update(activity.rawText).digest("hex");
}

export function saveScan(database: Database.Database, result: ScanResult, startedAt: string): string {
  const scanId = randomUUID();
  const now = new Date().toISOString();
  const save = database.transaction(() => {
    database.prepare(`
      INSERT INTO scans (id, started_at, completed_at, status, classes_found, activities_found, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(scanId, startedAt, now, "completed", result.classes.length, result.activityCount, null);

    const courseStatement = database.prepare(`
      INSERT INTO courses (id, name, code, section, url, last_scanned_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        code = excluded.code,
        section = excluded.section,
        url = excluded.url,
        last_scanned_at = excluded.last_scanned_at,
        updated_at = excluded.updated_at
    `);
    const assignmentStatement = database.prepare(`
      INSERT INTO assignments (
        id, course_id, title, url, assignment_type, creator, publish_date, status,
        raw_status_text, due_at, attachment_text, raw_text, source_hash,
        first_seen_at, last_seen_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        url = excluded.url,
        assignment_type = excluded.assignment_type,
        creator = excluded.creator,
        publish_date = excluded.publish_date,
        status = excluded.status,
        raw_status_text = excluded.raw_status_text,
        due_at = excluded.due_at,
        attachment_text = excluded.attachment_text,
        raw_text = excluded.raw_text,
        source_hash = excluded.source_hash,
        last_seen_at = excluded.last_seen_at,
        updated_at = excluded.updated_at
    `);

    for (const course of result.classes) {
      courseStatement.run(course.id, course.name, course.code, course.section, course.url, now, now, now);
      for (const activity of course.activities) {
        const id = `${course.id}:${activity.id}`;
        assignmentStatement.run(
          id,
          course.id,
          activity.title,
          activity.url,
          activity.type,
          activity.creator,
          activity.publishDate,
          activity.status,
          activity.rawStatusText,
          activity.dueAt === "No Due Date" ? null : activity.dueAt,
          activity.attachmentText,
          activity.rawText,
          sourceHash(activity),
          now,
          now,
          now
        );
      }
    }
  });

  save();
  return scanId;
}
