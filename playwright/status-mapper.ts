import type { AssignmentStatus } from "./types.js";

const statusMappings: Array<{ status: AssignmentStatus; labels: string[] }> = [
  { status: "late", labels: ["late", "overdue", "ส่งล่าช้า", "เกินกำหนด"] },
  { status: "not submitted", labels: ["not submitted", "not started", "in progress", "draft", "ยังไม่เริ่ม", "กำลังทำ"] },
  { status: "submitted", labels: ["submitted", "ส่งแล้ว", "ส่งงานแล้ว"] }
];

export function mapStatus(rawText: string | null): AssignmentStatus {
  if (!rawText?.trim()) return "not submitted";
  const normalized = rawText.trim().toLocaleLowerCase();
  for (const mapping of statusMappings) {
    if (mapping.labels.some((label) => normalized.includes(label))) return mapping.status;
  }
  return "not submitted";
}

export const unfinishedStatuses: AssignmentStatus[] = ["not submitted", "late"];
