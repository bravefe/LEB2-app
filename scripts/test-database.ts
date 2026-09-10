import { openDatabase } from "../database/database.js";
import { saveScan } from "../database/scan-repository.js";
import {
  getLastScan,
  listAssignments,
  listCourses,
  markCourseAssignmentsDone,
  toggleAssignmentDone,
  toggleCourseDone
} from "../database/read-repository.js";
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
      status: "not submitted",
      rawStatusText: "Not Submitted",
      attachmentText: null,
      rawText: "Facebook Group (updated) Not Submitted"
    }]
  }],
  activityCount: 1,
  unfinishedCount: 1,
  overdueCount: 0,
  warnings: []
};

saveScan(database, result, result.scannedAt);
saveScan(database, result, result.scannedAt);
const courseCount = database.prepare("SELECT COUNT(*) AS count FROM courses").get() as { count: number };
const assignmentCount = database.prepare("SELECT COUNT(*) AS count FROM assignments").get() as { count: number };
if (courseCount.count !== 1 || assignmentCount.count !== 1) throw new Error("Database upsert validation failed");

// Test toggleAssignmentDone
const assignmentId = "1583085:21982019";
let isDone = toggleAssignmentDone(database, assignmentId);
if (!isDone) throw new Error("Expected assignment to be marked done");
let courses = listCourses(database) as { unfinished_count: number }[];
if (courses[0].unfinished_count !== 0) throw new Error("Expected unfinished count to be 0 after marking done");

isDone = toggleAssignmentDone(database, assignmentId);
if (isDone) throw new Error("Expected assignment to be unmarked done");
courses = listCourses(database) as { unfinished_count: number }[];
if (courses[0].unfinished_count !== 1) throw new Error("Expected unfinished count to be 1 after unmarking");

// Test toggleCourseDone
const courseDone = toggleCourseDone(database, "1583085");
if (!courseDone) throw new Error("Expected course to be marked done");

// Test markCourseAssignmentsDone
markCourseAssignmentsDone(database, "1583085", true);
const assignments = listAssignments(database) as { is_marked_done: number }[];
if (assignments[0].is_marked_done !== 1) throw new Error("Expected assignment to be marked done via course bulk mark");

// Test getLastScan
const lastScan = getLastScan(database) as { classes_found: number } | null;
if (!lastScan || lastScan.classes_found !== 1) throw new Error("Expected getLastScan to return the saved scan");

console.log(`Database fixture passed: ${courseCount.count} course, ${assignmentCount.count} assignment, mark-as-done verified`);
database.close();
