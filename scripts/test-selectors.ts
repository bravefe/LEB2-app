import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { parseCourses, parseActivities } from "../playwright/parser.js";
import { activityUrlForCourse } from "../playwright/scanner.js";

const html = await readFile("docs/html-samples/class-list.sample.html", "utf8");
const document = new JSDOM(html).window.document;
const courses = parseCourses(document, "https://app.leb2.org/class");
if (courses.length !== 1 || courses[0]?.id !== "1583085") throw new Error("Class selector validation failed");
console.log(`Class fixture passed: ${courses[0].code} ${courses[0].name}`);
const activityUrl = activityUrlForCourse(
	"https://app.leb2.org/class/1582970/checkAfterAccessClass",
	"1582970"
);
if (activityUrl !== "https://app.leb2.org/class/1582970/activity") throw new Error("Activity URL conversion failed");
console.log(`Activity URL conversion passed: ${activityUrl}`);
const activityHtml = await readFile("docs/html-samples/activity-page.html", "utf8");
const activities = parseActivities(new JSDOM(activityHtml).window.document, "https://app.leb2.org/class/1583085/activity");
if (
	activities.length !== 1 ||
	activities[0]?.title !== "Facebook Group (updated)" ||
	activities[0]?.status !== "submitted" ||
	activities[0]?.type !== "Individual" ||
	activities[0]?.dueAt !== "No Due Date"
) {
	throw new Error(`Activity selector validation failed: found ${activities.length} activities`);
}
console.log(`Activity fixture passed: ${activities.length} activity`);
