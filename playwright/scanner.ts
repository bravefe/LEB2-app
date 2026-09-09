import type { Page } from "playwright";
import { JSDOM } from "jsdom";
import { parseActivities, parseCourses } from "./parser.js";
import { selectors } from "./selectors.js";
import type { CourseScanResult, ScanResult } from "./types.js";

export function activityUrlForCourse(courseUrl: string, courseId: string): string {
  const url = new URL(courseUrl);
  return `${url.origin}/class/${encodeURIComponent(courseId)}/activity`;
}

export async function scanLeb2(page: Page, classListUrl: string): Promise<ScanResult> {
  await page.goto(classListUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const courses = parseCourses(new JSDOM(await page.content()).window.document, page.url());
  const warnings: string[] = [];
  if (courses.length === 0) warnings.push("No class cards were found; the session may be expired or the page structure changed.");

  const results: CourseScanResult[] = [];
  for (const course of courses) {
    const activityUrl = activityUrlForCourse(course.url, course.id);
    try {
      await page.goto(activityUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.locator(selectors.activityRoot).waitFor({ state: "attached", timeout: 10000 }).catch(() => undefined);
      const activities = parseActivities(new JSDOM(await page.content()).window.document, page.url());
      results.push({ ...course, activityUrl, activities, error: null });
      if (activities.length === 0 && !selectors.emptyActivityText.test(await page.locator("body").innerText())) {
        warnings.push(`${course.code ?? course.id}: no rendered activity items detected; activity HTML is still needed to finalize selectors.`);
      }
    } catch (error) {
      results.push({ ...course, activityUrl, activities: [], error: error instanceof Error ? error.message : String(error) });
    }
  }

  const activities = results.flatMap((result) => result.activities);
  const unfinished = activities.filter((activity) => ["not_started", "in_progress", "unknown"].includes(activity.status));
  const overdue = activities.filter((activity) => activity.status === "overdue");
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
