import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { openSession, classListUrl } from "../playwright/session.js";
import { scanLeb2 } from "../playwright/scanner.js";

const outputPath = process.argv[2] ?? "debug/leb2-scan.json";
const { context, page } = await openSession();
try {
  const result = await scanLeb2(page, classListUrl);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
  console.log("\nScan complete\n");
  console.log(`Classes found: ${result.classes.length}`);
  console.log(`Activities found: ${result.activityCount}`);
  console.log(`Unfinished: ${result.unfinishedCount}`);
  console.log(`Overdue: ${result.overdueCount}`);
  for (const course of result.classes) {
    console.log("\n=== CLASS ===");
    console.log(JSON.stringify({
      id: course.id,
      name: course.name,
      code: course.code,
      section: course.section,
      classUrl: course.url,
      activityUrl: course.activityUrl,
      error: course.error,
      activityCount: course.activities.length
    }, null, 2));

    for (const activity of course.activities) {
      console.log("\n--- ACTIVITY ---");
      console.log(JSON.stringify(activity, null, 2));
    }
  }
  if (result.warnings.length > 0) {
    console.log("\n=== WARNINGS ===");
    for (const warning of result.warnings) console.warn(warning);
  }
  console.log(`\nDebug JSON: ${outputPath}`);
} finally {
  await context.close();
}
