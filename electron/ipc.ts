import { ipcMain, shell } from "electron";
import { openDatabase } from "../database/database.js";
import {
  getLastScan,
  getSetting,
  listAssignments,
  listCourses,
  markCourseAssignmentsDone,
  setSetting,
  toggleAssignmentDone,
  toggleCourseDone
} from "../database/read-repository.js";
import { openSession, classListUrl } from "../playwright/session.js";
import { scanLeb2 } from "../playwright/scanner.js";
import { saveScan } from "../database/scan-repository.js";
import { channels } from "./channels.js";

export { channels } from "./channels.js";

export function registerIpc(databasePath: string): void {
  ipcMain.handle(channels.assignments, () => {
    const database = openDatabase(databasePath);
    try { return listAssignments(database); } finally { database.close(); }
  });
  ipcMain.handle(channels.courses, () => {
    const database = openDatabase(databasePath);
    try { return listCourses(database); } finally { database.close(); }
  });
  ipcMain.handle(channels.assignmentsToggleDone, (_event, id: unknown, isDone?: unknown) => {
    if (typeof id !== "string") throw new Error("Assignment ID must be a string");
    const database = openDatabase(databasePath);
    try {
      return toggleAssignmentDone(database, id, typeof isDone === "boolean" ? isDone : undefined);
    } finally { database.close(); }
  });
  ipcMain.handle(channels.coursesToggleDone, (_event, id: unknown, isDone?: unknown) => {
    if (typeof id !== "string") throw new Error("Course ID must be a string");
    const database = openDatabase(databasePath);
    try {
      return toggleCourseDone(database, id, typeof isDone === "boolean" ? isDone : undefined);
    } finally { database.close(); }
  });
  ipcMain.handle(channels.courseAssignmentsToggleDone, (_event, id: unknown, isDone: unknown) => {
    if (typeof id !== "string") throw new Error("Course ID must be a string");
    const database = openDatabase(databasePath);
    try {
      markCourseAssignmentsDone(database, id, Boolean(isDone));
      return true;
    } finally { database.close(); }
  });
  ipcMain.handle(channels.getLastScan, () => {
    const database = openDatabase(databasePath);
    try { return getLastScan(database); } finally { database.close(); }
  });
  ipcMain.handle(channels.openExternal, async (_event, url: unknown) => {
    if (typeof url !== "string" || !url.startsWith("http")) return false;
    await shell.openExternal(url);
    return true;
  });
  ipcMain.handle(channels.getSetting, (_event, key: unknown) => {
    if (typeof key !== "string" || key.length === 0) throw new Error("A setting key is required");
    const database = openDatabase(databasePath);
    try { return getSetting(database, key); } finally { database.close(); }
  });
  ipcMain.handle(channels.setSetting, (_event, key: unknown, value: unknown) => {
    if (typeof key !== "string" || key.length === 0 || typeof value !== "string") throw new Error("A string setting key and value are required");
    const database = openDatabase(databasePath);
    try { setSetting(database, key, value); return true; } finally { database.close(); }
  });
  ipcMain.handle(channels.scan, async () => {
    const startedAt = new Date().toISOString();
    const { context, page } = await openSession();
    try {
      const result = await scanLeb2(page, classListUrl);
      const database = openDatabase(databasePath);
      try { saveScan(database, result, startedAt); } finally { database.close(); }
      return result;
    } finally {
      await context.close();
    }
  });
}
