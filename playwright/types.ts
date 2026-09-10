export type AssignmentStatus =
  | "not submitted"
  | "late"
  | "submitted";

export interface CourseRecord {
  id: string;
  name: string;
  code: string | null;
  section: string | null;
  url: string;
}

export interface ActivityRecord {
  id: string;
  title: string;
  url: string | null;
  type: string | null;
  creator: string | null;
  publishDate: string | null;
  dueAt: string | null;
  status: AssignmentStatus;
  rawStatusText: string | null;
  attachmentText: string | null;
  rawText: string;
}

export interface CourseScanResult extends CourseRecord {
  activityUrl: string;
  activities: ActivityRecord[];
  error: string | null;
}

export interface ScanResult {
  scannedAt: string;
  classListUrl: string;
  classes: CourseScanResult[];
  activityCount: number;
  unfinishedCount: number;
  overdueCount: number;
  warnings: string[];
}
