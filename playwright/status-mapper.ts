import type { AssignmentStatus } from "./types.js";

const statusMappings: Array<{ status: AssignmentStatus; labels: string[] }> = [
  { status: "graded", labels: ["graded", "คะแนน"] },
  { status: "submitted", labels: ["submitted", "ส่งแล้ว", "ส่งงานแล้ว"] },
  { status: "completed", labels: ["completed", "complete", "เสร็จสิ้น"] },
  { status: "in_progress", labels: ["in progress", "draft", "กำลังทำ"] },
  { status: "not_started", labels: ["not started", "ยังไม่เริ่ม"] }
];

export function mapStatus(rawText: string | null): AssignmentStatus {
  if (!rawText?.trim()) return "unknown";
  const normalized = rawText.trim().toLocaleLowerCase();
  for (const mapping of statusMappings) {
    if (mapping.labels.some((label) => normalized.includes(label))) return mapping.status;
  }
  return "unknown";
}

export const unfinishedStatuses: AssignmentStatus[] = ["not_started", "in_progress", "unknown"];
