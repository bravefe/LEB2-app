import { copyFile, mkdir } from "node:fs/promises";

await Promise.all([
	mkdir("dist-electron/electron", { recursive: true }),
	mkdir("dist-electron/database", { recursive: true })
]);
await Promise.all([
	copyFile("electron/preload.cjs", "dist-electron/electron/preload.cjs"),
	copyFile("database/schema.sql", "dist-electron/database/schema.sql")
]);
