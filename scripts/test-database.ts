import { openDatabase } from "../database/database.js";
import { saveScan } from "../database/scan-repository.js";
import type { ScanResult } from "../playwright/types.js";

const database = openDatabase(":memory:");
const result: ScanResult = {
  scannedAt: "2026-09-09T00:00:00.000Z",
  classListUrl: "https://app.leb2.org/class",
  classes: [{
    id: "1583085",
    name: "OPERATING SYSTEMS",
    code: "CPE 333",
    section: "31",
    url: "https://app.leb2.org/class/1583085/checkAfterAccessClass",
    activityUrl: "https://app.leb2.org/class/1583085/activity",
    error: null,
    activities: [{
      id: "21982019",
      title: "Facebook Group (updated)",
      url: "https://app.leb2.org/class/1583085/activity/21982019",
      type: "Individual",
      creator: "by JATURON HARNSOMBURANA",
      publishDate: "August 7, 2026 at 13:30",
      dueAt: "No Due Date",
      status: "submitted",
      rawStatusText: "Submitted",
      attachmentText: null,
      rawText: "Facebook Group (updated) Submitted"
    }]
  }],
  activityCount: 1,
  unfinishedCount: 0,
  overdueCount: 0,
  warnings: []
};

saveScan(database, result, result.scannedAt);
saveScan(database, result, result.scannedAt);
const courseCount = database.prepare("SELECT COUNT(*) AS count FROM courses").get() as { count: number };
const assignmentCount = database.prepare("SELECT COUNT(*) AS count FROM assignments").get() as { count: number };
if (courseCount.count !== 1 || assignmentCount.count !== 1) throw new Error("Database upsert validation failed");
console.log(`Database fixture passed: ${courseCount.count} course, ${assignmentCount.count} assignment`);
database.close();
