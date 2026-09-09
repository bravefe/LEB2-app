import { ipcMain } from "electron";
import { openDatabase } from "../database/database.js";
import { getSetting, listAssignments, listCourses, setSetting } from "../database/read-repository.js";
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
