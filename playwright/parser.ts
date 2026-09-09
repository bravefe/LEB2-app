import { selectors } from "./selectors.js";
import { mapStatus } from "./status-mapper.js";
import type { ActivityRecord, CourseRecord } from "./types.js";

function clean(value: string | null | undefined): string | null {
  const result = value?.replace(/\s+/g, " ").trim();
  return result || null;
}

function classIdFromName(value: string | null): string | null {
  const match = value?.match(/card-(\d+)/);
  return match?.[1] ?? null;
}

export function parseCourses(document: Document, baseUrl: string): CourseRecord[] {
  return Array.from(document.querySelectorAll(selectors.classCards)).flatMap((card) => {
    const id = classIdFromName(card.getAttribute(selectors.classIdAttribute));
    const rawUrl = card.getAttribute(selectors.classUrlAttribute);
    const code = clean(card.querySelector(selectors.classCode)?.textContent);
    const name = clean(card.querySelector(selectors.className)?.textContent);
    if (!id || !rawUrl || !name) return [];
    return [{ id, name, code, section: clean(card.querySelector(selectors.classSection)?.textContent), url: new URL(rawUrl, baseUrl).href }];
  });
}

function extractDueAt(text: string): string | null {
  const match = text.match(/(?:due|deadline|กำหนดส่ง)\s*[:：-]?\s*([^\n|]+)/i);
  return clean(match?.[1]);
}

function extractType(text: string): string | null {
  const match = text.match(/(?:type|ประเภท)\s*[:：-]?\s*([^\n|]+)/i);
  return clean(match?.[1]);
}

export function parseActivities(document: Document, baseUrl: string): ActivityRecord[] {
  const candidates = document.querySelectorAll(selectors.activityRows);
  return Array.from(candidates).flatMap((item, index) => {
    const rawText = item.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const titleElement = item.querySelector(selectors.activityTitle);
    const title = clean(titleElement?.textContent);
    const link = item.querySelector<HTMLAnchorElement>(selectors.activityLink);
    if (!title || !link) return [];
    const absoluteUrl = new URL(link.href, baseUrl).href;
    const id = absoluteUrl.match(/\/(?:activity|quiz)\/(\d+)/)?.[1] ?? `activity-${index + 1}`;
    const rawStatusText = clean(item.querySelector(selectors.activityStatus)?.textContent);
    return [{
      id,
      title,
      url: absoluteUrl,
      type: clean(item.querySelector(selectors.activityType)?.textContent),
      creator: clean(item.querySelector(selectors.activityCreator)?.textContent),
      publishDate: clean(item.querySelector(selectors.activityPublishDate)?.getAttribute("title") ?? item.querySelector(selectors.activityPublishDate)?.textContent),
      dueAt: clean(item.querySelector(selectors.activityDueDate)?.getAttribute("title") ?? item.querySelector(selectors.activityDueDate)?.textContent),
      status: mapStatus(rawStatusText),
      rawStatusText,
      attachmentText: clean(item.querySelector(selectors.activityAttachment)?.textContent),
      rawText
    }];
  });
}
