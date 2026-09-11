import type { Course, Assignment } from "../types.js";

type CourseListProps = {
  groupedCourses: Array<Course & { items: Assignment[] }>;
  onCourseContextMenu: (e: any, course: Course) => void;
  onAssignmentContextMenu: (e: any, item: Assignment) => void;
  onToggleCourseDone: (courseId: string, currentStatus: boolean, event?: any) => void;
  onToggleAssignmentDone: (id: string, currentStatus: boolean, event?: any) => void;
  onOpenUrl: (url: string | null | undefined, event?: any) => void;
};

export function CourseList({
  groupedCourses,
  onCourseContextMenu,
  onAssignmentContextMenu,
  onToggleCourseDone,
  onToggleAssignmentDone,
  onOpenUrl,
}: CourseListProps) {
  return (
    <div className="space-y-3 pb-8">
      {groupedCourses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No activities found</h3>
          <p className="mt-1 text-xs text-slate-500">Run a scan to load courses and activities from LEB2.</p>
        </div>
      ) : (
        groupedCourses.map((course) => {
          const isCourseDone = course.is_marked_done === 1;

          return (
            <div
              key={course.id}
              onContextMenu={(e) => onCourseContextMenu(e, course)}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                isCourseDone ? "border-slate-200 bg-slate-50/60 opacity-80" : "border-slate-200"
              }`}
            >
              <div
                className="flex items-center justify-between border-b border-slate-100 bg-[#fbfcfd] px-3.5 py-2.5 select-none cursor-pointer hover:bg-slate-50/90 transition-colors"
                title="Right-click for course options"
              >
                <div className="flex-1 pr-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {course.code && (
                      <span className="font-bold text-xs tracking-tight text-sky-700">{course.code}</span>
                    )}
                    <span className="text-xs font-semibold text-slate-800 truncate">{course.name}</span>
                  </div>
                  {course.section && (
                    <span className="text-[10px] text-slate-400 font-normal">Section {course.section}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isCourseDone ? (
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 border border-teal-200">
                      Course Done
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        course.unfinished_count > 0
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {course.unfinished_count > 0 ? `${course.unfinished_count} to do` : "0 to do"}
                    </span>
                  )}

                  <button
                    onClick={(e) => onToggleCourseDone(course.id, isCourseDone, e)}
                    title={isCourseDone ? "Mark course as active" : "Mark course as done"}
                    className={`p-1 rounded transition-colors ${
                      isCourseDone ? "text-teal-600 hover:bg-teal-50" : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <svg className="h-4 w-4" fill={isCourseDone ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

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
                        onClick={() => onOpenUrl(item.url)}
                        className={`group flex items-start justify-between p-3 transition-colors select-none ${
                          item.url ? "cursor-pointer hover:bg-sky-50/40" : ""
                        } ${isDone ? "bg-slate-50/70" : ""}`}
                      >
                        <div className="flex-1 pr-3 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-medium leading-snug line-clamp-2 ${
                                isDone ? "line-through text-slate-400" : "text-slate-800 group-hover:text-[#0088cc]"
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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

                            {item.assignment_type && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200/80">
                                {item.assignment_type}
                              </span>
                            )}

                            <span
                              className={`text-[10px] ${
                                !isDone && !isSubmitted && item.due_at && item.due_at !== "No Due Date"
                                  ? "text-rose-600 font-medium"
                                  : "text-slate-500"
                              }`}
                            >
                              {item.due_at ? `Due: ${item.due_at}` : "No Due Date"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => onToggleAssignmentDone(item.id, isDone, e)}
                          title={isDone ? "Mark as not done" : "Mark as done"}
                          className={`mt-0.5 p-1 rounded shrink-0 transition-colors ${
                            isDone ? "text-teal-600 hover:bg-teal-50" : "text-slate-300 hover:text-teal-600 hover:bg-slate-100"
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
  );
}
