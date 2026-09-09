import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

export function openDatabase(databasePath = ".data/leb2.sqlite"): Database.Database {
  const resolvedPath = databasePath === ":memory:" ? databasePath : resolve(databasePath);
  if (resolvedPath !== ":memory:") mkdirSync(dirname(resolvedPath), { recursive: true });
  const database = new Database(resolvedPath);
  database.pragma("foreign_keys = ON");
  database.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  return database;
}
