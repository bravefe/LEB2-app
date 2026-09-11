export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  course_name: string;
  course_code: string | null;
  course_section: string | null;
  status: string;
  raw_status_text: string | null;
  due_at: string | null;
  assignment_type: string | null;
  url: string | null;
  is_marked_done: number;
  course_is_marked_done?: number;
};

export type Course = {
  id: string;
  name: string;
  code: string | null;
  section: string | null;
  url: string;
  is_marked_done: number;
  assignment_count: number;
  unfinished_count: number;
};

export type LastScanInfo = {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  classes_found: number;
  activities_found: number;
  error_message: string | null;
};

export type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  type: "assignment" | "course";
  targetId: string;
  courseId?: string;
  title: string;
  url?: string | null;
  isDone: boolean;
};

export type TabView = "not_submitted" | "due_date" | "all";
