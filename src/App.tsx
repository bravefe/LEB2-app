import { useEffect, useState, useRef } from "react";

type Assignment = {
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

type Course = {
  id: string;
  name: string;
  code: string | null;
  section: string | null;
  url: string;
  is_marked_done: number;
  assignment_count: number;
  unfinished_count: number;
};

type LastScanInfo = {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  classes_found: number;
  activities_found: number;
  error_message: string | null;
};

type ContextMenuState = {
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

type TabView = "not_submitted" | "due_date" | "all";

function parseLeb2DueDate(dateStr: string | null | undefined): number {
  if (!dateStr || dateStr === "No Due Date") return Infinity;
  const cleaned = dateStr.replace(" at ", " ");
  const time = new Date(cleaned).getTime();
  return isNaN(time) ? Infinity : time;
}

function isDueDateOverdue(dateStr: string | null | undefined): boolean {
  const time = parseLeb2DueDate(dateStr);
  if (time === Infinity) return false;
  return time < Date.now();
}

export function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lastScan, setLastScan] = useState<LastScanInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tabView, setTabView] = useState<TabView>("not_submitted");
  const [dueDateShowAll, setDueDateShowAll] = useState(false);

  // Custom Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: "assignment",
    targetId: "",
    title: "",
    isDone: false,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function refreshData() {
    if (!window.leb2) return;
    try {
      const [fetchedAssignments, fetchedCourses, scanInfo] = await Promise.all([
        window.leb2.listAssignments() as Promise<Assignment[]>,
        window.leb2.listCourses() as Promise<Course[]>,
        window.leb2.getLastScan() as Promise<LastScanInfo | null>,
      ]);
      setAssignments(fetchedAssignments || []);
      setCourses(fetchedCourses || []);
      setLastScan(scanInfo);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  async function handleScan() {
    if (!window.leb2) {
      setStatusMessage("Live scan requires running inside Electron.");
      return;
    }
    setBusy(true);
    setStatusMessage("Scanning LEB2...");
    try {
      const result = await window.leb2.scan();
      await refreshData();
      setStatusMessage(`Scan complete: ${result.classes.length} classes, ${result.activityCount} activities.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleAssignmentDone(id: string, currentStatus: boolean, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    if (!window.leb2) return;
    try {
      await window.leb2.toggleAssignmentDone(id, !currentStatus);
      await refreshData();
    } catch (err) {
      console.error("Failed to toggle assignment done", err);
    }
  }

  async function handleToggleCourseDone(courseId: string, currentStatus: boolean, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    if (!window.leb2) return;
    try {
      await window.leb2.toggleCourseDone(courseId, !currentStatus);
      await refreshData();
    } catch (err) {
      console.error("Failed to toggle course done", err);
    }
  }

  async function handleMarkCourseAllDone(courseId: string, isDone: boolean, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    if (!window.leb2) return;
    try {
      await window.leb2.markCourseAssignmentsDone(courseId, isDone);
      await refreshData();
    } catch (err) {
      console.error("Failed to mark course assignments done", err);
    }
  }

  function handleOpenUrl(url: string | null | undefined, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    if (!url) return;
    if (window.leb2?.openExternal) {
      void window.leb2.openExternal(url);
    } else {
      window.open(url, "_blank");
    }
  }

  // Right-click handler for Course
  function onCourseContextMenu(e: React.MouseEvent, course: Course) {
    e.preventDefault();
    e.stopPropagation();
    const clickX = Math.min(e.clientX, window.innerWidth - 210);
    const clickY = Math.min(e.clientY, window.innerHeight - 170);
    setContextMenu({
      visible: true,
      x: clickX,
      y: clickY,
      type: "course",
      targetId: course.id,
      title: `${course.code ? course.code + " " : ""}${course.name}`,
      url: course.url,
      isDone: course.is_marked_done === 1,
    });
  }

  // Right-click handler for Assignment
  function onAssignmentContextMenu(e: React.MouseEvent, item: Assignment) {
    e.preventDefault();
    e.stopPropagation();
    const clickX = Math.min(e.clientX, window.innerWidth - 210);
    const clickY = Math.min(e.clientY, window.innerHeight - 170);
    setContextMenu({
      visible: true,
      x: clickX,
      y: clickY,
      type: "assignment",
      targetId: item.id,
      courseId: item.course_id,
      title: item.title,
      url: item.url,
      isDone: item.is_marked_done === 1,
    });
  }

  // Calculations
  const notSubmittedAssignments = assignments.filter((item) => {
    const isDone = item.is_marked_done === 1 || item.course_is_marked_done === 1;
    const isUnfinished = ["not submitted", "late"].includes(item.status);
    return isUnfinished && !isDone;
  });

  const notSubmittedCount = notSubmittedAssignments.length;
  const totalCoursesCount = courses.length;

  // Filter assignments for Course Grouped view
  const filteredAssignments = assignments.filter((item) => {
    const isDone = item.is_marked_done === 1 || item.course_is_marked_done === 1;
    if (tabView === "all") return true;
    const isUnfinished = ["not submitted", "late"].includes(item.status);
    return isUnfinished && !isDone;
  });

  // Group by courses
  const groupedCourses = courses
    .map((course) => {
      const courseAssignments = filteredAssignments.filter((a) => a.course_id === course.id);
      return {
        ...course,
        items: courseAssignments,
      };
    })
    .filter((course) => {
      if (tabView === "all") return true;
      // In not submitted mode, show courses with pending items
      return course.items.length > 0;
    });

  // Sorted by due date assignments
  const dueDateAssignments = (dueDateShowAll ? assignments : notSubmittedAssignments)
    .slice()
    .sort((a, b) => {
      const timeA = parseLeb2DueDate(a.due_at);
      const timeB = parseLeb2DueDate(b.due_at);
      if (timeA !== timeB) return timeA - timeB;
      return a.title.localeCompare(b.title);
    });

  // Format last scan date
  const formattedLastScan = lastScan?.started_at
    ? new Date(lastScan.started_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Not scanned yet";

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f5] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* LEB2 Top Brand Navigation Bar
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#202934] bg-[#242e39] px-4 py-2.5 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-tr from-[#0088cc] to-[#00b0ff] font-bold text-white shadow">
            <span className="text-xs tracking-tighter">LEB</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none tracking-tight text-white">LEB2 Checker</h1>
            <span className="text-[10px] text-slate-400">Class & Activity Monitor</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="inline-flex items-center rounded-full bg-emerald-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-700/50">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
      </header> */}

      {/* Main Container - Compact Mobile Vertical List */}
      <main className="flex-1 px-3.5 py-3 space-y-3 max-w-lg mx-auto w-full">
        {/* Top Summary Card */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
          {/* Stat Indicators */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <div className="text-xs font-semibold text-slate-700">
                Not Submitted: <span className="text-sm font-bold text-rose-600">{notSubmittedCount}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <div className="text-xs font-semibold text-slate-700">
                Total Courses: <span className="text-sm font-bold text-sky-700">{totalCoursesCount}</span>
              </div>
            </div>
          </div>

          {/* Scan Button & Timestamp Section */}
          <div className="pt-3 flex flex-col items-center">
            <button
              onClick={() => void handleScan()}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] active:bg-[#00669c] text-white py-2 px-4 text-xs font-semibold shadow transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Scanning LEB2...</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Scan</span>
                </>
              )}
            </button>

            {/* Last Scan Date/Time below button */}
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last scan: {formattedLastScan}</span>
            </p>
          </div>
        </section>

        {/* Filter Tabs: Not Submitted (default) vs By Due Date vs All Work */}
        <section className="px-1">
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium text-slate-600 shadow-inner w-full">
            <button
              onClick={() => setTabView("not_submitted")}
              className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${tabView === "not_submitted"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Not Submitted ({notSubmittedCount})
            </button>
            <button
              onClick={() => setTabView("due_date")}
              className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${tabView === "due_date"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              By Due Date ({dueDateAssignments.length})
            </button>
            <button
              onClick={() => setTabView("all")}
              className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${tabView === "all"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Work ({assignments.length})
            </button>
          </div>
        </section>

        {/* Content View: By Due Date OR Grouped Courses */}
        {tabView === "due_date" ? (
          <div className="space-y-2.5 pb-8">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
              <span className="font-medium">Sorted by nearest deadline</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dueDateShowAll}
                  onChange={(e) => setDueDateShowAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#0088cc] focus:ring-0 text-xs"
                />
                <span>Include submitted</span>
              </label>
            </div>

            {dueDateAssignments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {!dueDateShowAll ? "No pending deadlines!" : "No activities found"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {!dueDateShowAll
                    ? "All assignments are submitted or marked done."
                    : "Run a scan to load activities from LEB2."}
                </p>
              </div>
            ) : (
              dueDateAssignments.map((item) => {
                const isDone = item.is_marked_done === 1 || item.course_is_marked_done === 1;
                const isSubmitted = item.status === "submitted";
                const isLate = item.status === "late";
                const overdue = !isDone && !isSubmitted && isDueDateOverdue(item.due_at);

                return (
                  <div
                    key={item.id}
                    onContextMenu={(e) => onAssignmentContextMenu(e, item)}
                    onClick={() => handleOpenUrl(item.url)}
                    className={`group overflow-hidden rounded-xl border bg-white p-3 shadow-sm transition-all select-none ${item.url ? "cursor-pointer hover:border-sky-300 hover:shadow-md" : ""
                      } ${isDone ? "border-slate-200 bg-slate-50/70 opacity-75" : overdue ? "border-rose-200/90" : "border-slate-200"}`}
                  >
                    {/* Top row: Course Info & Overdue Indicator */}
                    <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        {item.course_code && (
                          <span className="font-bold text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            {item.course_code}
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-slate-600 truncate">
                          {item.course_name}
                        </span>
                      </div>

                      {overdue && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Overdue
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Done button */}
                    <div className="flex items-start justify-between gap-2 pt-2">
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold leading-snug line-clamp-2 ${isDone ? "line-through text-slate-400" : "text-slate-800 group-hover:text-[#0088cc]"
                          }`}>
                          {item.title}
                        </span>
                      </div>

                      {/* Quick toggle checkmark */}
                      <button
                        onClick={(e) => void handleToggleAssignmentDone(item.id, isDone, e)}
                        title={isDone ? "Mark as not done" : "Mark as done"}
                        className={`p-1 rounded shrink-0 transition-colors ${isDone
                            ? "text-teal-600 hover:bg-teal-50"
                            : "text-slate-300 hover:text-teal-600 hover:bg-slate-100"
                          }`}
                      >
                        <svg className="h-4 w-4" fill={isDone ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Bottom details: Due Date & Status badge */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-50 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-600">
                        <svg className={`h-3 w-3 ${overdue ? "text-rose-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={overdue ? "font-semibold text-rose-600" : "text-slate-600"}>
                          {item.due_at ? `Due: ${item.due_at}` : "No Due Date"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.assignment_type && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200/70">
                            {item.assignment_type}
                          </span>
                        )}
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                            Marked Done
                          </span>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Submitted
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Late
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                            Not Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Grouped Course List */
          <div className="space-y-3 pb-8">
            {groupedCourses.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {tabView === "not_submitted" ? "All caught up!" : "No activities found"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {tabView === "not_submitted"
                    ? "You have no unsubmitted assignments remaining."
                    : "Run a scan to load courses and activities from LEB2."}
                </p>
              </div>
            ) : (
              groupedCourses.map((course) => {
                const isCourseDone = course.is_marked_done === 1;

                return (
                  <div
                    key={course.id}
                    onContextMenu={(e) => onCourseContextMenu(e, course)}
                    className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${isCourseDone ? "border-slate-200 bg-slate-50/60 opacity-80" : "border-slate-200"
                      }`}
                  >
                    {/* Course Header: CPE333 Subject name */}
                    <div
                      className="flex items-center justify-between border-b border-slate-100 bg-[#fbfcfd] px-3.5 py-2.5 select-none cursor-pointer hover:bg-slate-50/90 transition-colors"
                      title="Right-click for course options"
                    >
                      <div className="flex-1 pr-2 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {course.code && (
                            <span className="font-bold text-xs tracking-tight text-sky-700">
                              {course.code}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {course.name}
                          </span>
                        </div>
                        {course.section && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            Section {course.section}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCourseDone ? (
                          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 border border-teal-200">
                            Course Done
                          </span>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${course.unfinished_count > 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                            {course.unfinished_count > 0 ? `${course.unfinished_count} to do` : "0 to do"}
                          </span>
                        )}

                        {/* Quick mark course done toggle */}
                        <button
                          onClick={(e) => void handleToggleCourseDone(course.id, isCourseDone, e)}
                          title={isCourseDone ? "Mark course as active" : "Mark course as done"}
                          className={`p-1 rounded transition-colors ${isCourseDone
                            ? "text-teal-600 hover:bg-teal-50"
                            : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          <svg className="h-4 w-4" fill={isCourseDone ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Course Assignments */}
                    <div className="divide-y divide-slate-100">
                      {course.items.length === 0 ? (
                        <div className="py-2.5 px-3.5 text-[11px] text-slate-400 italic">
                          No pending work in this course
                        </div>
                      ) : (
                        course.items.map((item) => {
                          const isDone = item.is_marked_done === 1 || course.is_marked_done === 1;
                          const isSubmitted = item.status === "submitted";
                          const isLate = item.status === "late";

                          return (
                            <div
                              key={item.id}
                              onContextMenu={(e) => onAssignmentContextMenu(e, item)}
                              onClick={() => handleOpenUrl(item.url)}
                              className={`group flex items-start justify-between p-3 transition-colors select-none ${item.url ? "cursor-pointer hover:bg-sky-50/40" : ""
                                } ${isDone ? "bg-slate-50/70" : ""}`}
                            >
                              <div className="flex-1 pr-3 min-w-0">
                                {/* Title */}
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-medium leading-snug line-clamp-2 ${isDone ? "line-through text-slate-400" : "text-slate-800 group-hover:text-[#0088cc]"
                                    }`}>
                                    {item.title}
                                  </span>
                                </div>

                                {/* Details: Status Badge & Due Date */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  {/* LEB2-style status badge */}
                                  {isDone ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                      </svg>
                                      Marked Done
                                    </span>
                                  ) : isSubmitted ? (
                                    <span className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                                      Submitted
                                    </span>
                                  ) : isLate ? (
                                    <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                      Late
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                                      Not Submitted
                                    </span>
                                  )}

                                  {/* Assignment Type (Individual / Group) */}
                                  {item.assignment_type && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200/80">
                                      {item.assignment_type}
                                    </span>
                                  )}

                                  {/* Due Date */}
                                  <span className={`text-[10px] ${!isDone && !isSubmitted && item.due_at && item.due_at !== "No Due Date"
                                    ? "text-rose-600 font-medium"
                                    : "text-slate-500"
                                    }`}>
                                    {item.due_at ? `Due: ${item.due_at}` : "No Due Date"}
                                  </span>
                                </div>
                              </div>

                              {/* Quick Toggle Done Button */}
                              <button
                                onClick={(e) => void handleToggleAssignmentDone(item.id, isDone, e)}
                                title={isDone ? "Mark as not done" : "Mark as done"}
                                className={`mt-0.5 p-1 rounded shrink-0 transition-colors ${isDone
                                  ? "text-teal-600 hover:bg-teal-50"
                                  : "text-slate-300 hover:text-teal-600 hover:bg-slate-100"
                                  }`}
                              >
                                <svg className="h-4 w-4" fill={isDone ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Custom Right-Click Context Menu */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 min-w-[200px] rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-700 shadow-xl"
        >
          <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 truncate max-w-[200px]">
            {contextMenu.title}
          </div>

          {contextMenu.type === "assignment" ? (
            <>
              <button
                onClick={() => void handleToggleAssignmentDone(contextMenu.targetId, contextMenu.isDone)}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 font-medium text-slate-700 transition-colors"
              >
                <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{contextMenu.isDone ? "Mark as Undone" : "Mark as Done"}</span>
              </button>

              {contextMenu.url && (
                <button
                  onClick={() => handleOpenUrl(contextMenu.url)}
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open in LEB2</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => void handleToggleCourseDone(contextMenu.targetId, contextMenu.isDone)}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 font-medium text-slate-700 transition-colors"
              >
                <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{contextMenu.isDone ? "Mark Course as Undone" : "Mark Course as Done"}</span>
              </button>

              <button
                onClick={() => void handleMarkCourseAllDone(contextMenu.targetId, true)}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Mark All in Course as Done</span>
              </button>

              {contextMenu.url && (
                <button
                  onClick={() => handleOpenUrl(contextMenu.url)}
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open Course Page</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
