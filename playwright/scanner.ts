import type { BrowserContext, Page } from "playwright";
import { JSDOM } from "jsdom";
import { parseActivities, parseCourses } from "./parser.js";
import { selectors } from "./selectors.js";
import type { CourseRecord, CourseScanResult, ScanResult } from "./types.js";
import { unfinishedStatuses } from "./status-mapper.js";

/** Number of browser tabs used to scan courses in parallel. */
const CONCURRENCY = 8;

export function activityUrlForCourse(courseUrl: string, courseId: string): string {
  const url = new URL(courseUrl);
  return `${url.origin}/class/${encodeURIComponent(courseId)}/activity`;
}

async function scanCourse(
  context: BrowserContext,
  course: CourseRecord,
): Promise<{ result: CourseScanResult; warning: string | null }> {
  const activityUrl = activityUrlForCourse(course.url, course.id);
  const page = await context.newPage();
  try {
    await page.goto(activityUrl, { waitUntil: "domcontentloaded" });
    await page.locator(selectors.activityRoot)
      .waitFor({ state: "attached", timeout: 10000 })
      .catch(() => undefined);
    const activities = parseActivities(
      new JSDOM(await page.content()).window.document,
      page.url(),
    );
    let warning: string | null = null;
    if (
      activities.length === 0 &&
      !selectors.emptyActivityText.test(await page.locator("body").innerText())
    ) {
      warning = `${course.code ?? course.id}: no rendered activity items detected; activity HTML is still needed to finalize selectors.`;
    }
    return {
      result: { ...course, activityUrl, activities, error: null },
      warning,
    };
  } catch (error) {
    return {
      result: {
        ...course,
        activityUrl,
        activities: [],
        error: error instanceof Error ? error.message : String(error),
      },
      warning: null,
    };
  } finally {
    await page.close();
  }
}

export async function scanLeb2(page: Page, classListUrl: string): Promise<ScanResult> {
  await page.goto(classListUrl, { waitUntil: "domcontentloaded" });
  await page.locator(selectors.classCards).first()
    .waitFor({ state: "attached", timeout: 10000 })
    .catch(() => undefined);
  const courses = parseCourses(new JSDOM(await page.content()).window.document, page.url());
  const warnings: string[] = [];
  if (courses.length === 0) warnings.push("No class cards were found; the session may be expired or the page structure changed.");

  const context = page.context();
  const results: CourseScanResult[] = [];

  // Scan courses in parallel batches
  for (let i = 0; i < courses.length; i += CONCURRENCY) {
    const batch = courses.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((course) => scanCourse(context, course)),
    );
    for (const { result, warning } of batchResults) {
      results.push(result);
      if (warning) warnings.push(warning);
    }
  }

  const activities = results.flatMap((result) => result.activities);
  const unfinished = activities.filter((activity) => unfinishedStatuses.includes(activity.status));
  const overdue = activities.filter((activity) => activity.status === "late");
  return {
    scannedAt: new Date().toISOString(),
    classListUrl,
    classes: results,
    activityCount: activities.length,
    unfinishedCount: unfinished.length,
    overdueCount: overdue.length,
    warnings
  };
}
