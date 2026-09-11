import { useEffect, useRef, useState } from "react";

import { AssignmentsList } from "./components/AssignmentsList.js";
import { ContextMenu } from "./components/ContextMenu.js";
import { CourseList } from "./components/CourseList.js";
import { FilterTabs } from "./components/FilterTabs.js";
import { SummaryCard } from "./components/SummaryCard.js";
import type { Assignment, ContextMenuState, Course, LastScanInfo, TabView } from "./types.js";
import { isDueDateOverdue, parseLeb2DueDate } from "./utils/leb2.js";

export function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lastScan, setLastScan] = useState<LastScanInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tabView, setTabView] = useState<TabView>("not_submitted");
  const [dueDateShowAll, setDueDateShowAll] = useState(false);

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

  const notSubmittedAssignments = assignments.filter((item) => {
    const isDone = item.is_marked_done === 1 || item.course_is_marked_done === 1;
    const isUnfinished = ["not submitted", "late"].includes(item.status);
    return isUnfinished && !isDone;
  });

  const notSubmittedCount = notSubmittedAssignments.length;
  const totalCoursesCount = courses.length;

  const filteredAssignments = assignments.filter((item) => {
    const isDone = item.is_marked_done === 1 || item.course_is_marked_done === 1;
    if (tabView === "all") return true;

    const isUnfinished = ["not submitted"].includes(item.status);
    return isUnfinished && !isDone;
  });

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
      return course.items.length > 0;
    });

  const dueDateAssignments = (dueDateShowAll ? assignments : notSubmittedAssignments)
    .slice()
    .sort((a, b) => {
      const timeA = parseLeb2DueDate(a.due_at);
      const timeB = parseLeb2DueDate(b.due_at);

      if (timeA !== timeB) return timeA - timeB;
      return a.title.localeCompare(b.title);
    });

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
      <main className="flex-1 px-3.5 py-3 space-y-3 max-w-lg mx-auto w-full">
        <SummaryCard
          notSubmittedCount={notSubmittedCount}
          totalCoursesCount={totalCoursesCount}
          busy={busy}
          formattedLastScan={formattedLastScan}
          onScan={() => void handleScan()}
        />

        <FilterTabs
          tabView={tabView}
          notSubmittedCount={notSubmittedCount}
          dueDateAssignmentsLength={dueDateAssignments.length}
          assignmentsLength={assignments.length}
          onChange={setTabView}
        />

        {tabView === "due_date" ? (
          <AssignmentsList
            dueDateAssignments={dueDateAssignments}
            dueDateShowAll={dueDateShowAll}
            onAssignmentContextMenu={onAssignmentContextMenu}
            onToggleAssignmentDone={handleToggleAssignmentDone}
            onOpenUrl={handleOpenUrl}
            onDueDateShowAllChange={setDueDateShowAll}
            isDueDateOverdue={isDueDateOverdue}
          />
        ) : (
          <CourseList
            groupedCourses={groupedCourses}
            onCourseContextMenu={onCourseContextMenu}
            onAssignmentContextMenu={onAssignmentContextMenu}
            onToggleCourseDone={handleToggleCourseDone}
            onToggleAssignmentDone={handleToggleAssignmentDone}
            onOpenUrl={handleOpenUrl}
          />
        )}
      </main>

      <ContextMenu
        ref={menuRef}
        contextMenu={contextMenu}
        onToggleAssignmentDone={(id: string, currentStatus: boolean) => void handleToggleAssignmentDone(id, currentStatus)}
        onToggleCourseDone={(courseId: string, currentStatus: boolean) => void handleToggleCourseDone(courseId, currentStatus)}
        onMarkCourseAllDone={(courseId: string, isDone: boolean) => void handleMarkCourseAllDone(courseId, isDone)}
        onOpenUrl={handleOpenUrl}
      />
    </div>
  );
}
