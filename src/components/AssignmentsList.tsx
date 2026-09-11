import type { Assignment } from "../types.js";

type AssignmentsListProps = {
  dueDateAssignments: Assignment[];
  dueDateShowAll: boolean;
  onAssignmentContextMenu: (e: any, item: Assignment) => void;
  onToggleAssignmentDone: (id: string, currentStatus: boolean, event?: any) => void;
  onOpenUrl: (url: string | null | undefined, event?: any) => void;
  onDueDateShowAllChange: (checked: boolean) => void;
  isDueDateOverdue: (dateStr: string | null | undefined) => boolean;
};

export function AssignmentsList({
  dueDateAssignments,
  dueDateShowAll,
  onAssignmentContextMenu,
  onToggleAssignmentDone,
  onOpenUrl,
  onDueDateShowAllChange,
  isDueDateOverdue,
}: AssignmentsListProps) {
  return (
    <div className="space-y-2.5 pb-8">
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
        <span className="font-medium">Sorted by nearest deadline</span>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dueDateShowAll}
            onChange={(e) => onDueDateShowAllChange(e.target.checked)}
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
          const isSubmitted = item.status === "submitted" || item.status === "late";
          const overdue = !isDone && !isSubmitted && isDueDateOverdue(item.due_at);

          return (
            <div
              key={item.id}
              onContextMenu={(e) => onAssignmentContextMenu(e, item)}
              onClick={() => onOpenUrl(item.url)}
              className={`group overflow-hidden rounded-xl border bg-white p-3 shadow-sm transition-all select-none ${
                item.url ? "cursor-pointer hover:border-sky-300 hover:shadow-md" : ""
              } ${isDone ? "border-slate-200 bg-slate-50/70 opacity-75" : overdue ? "border-rose-200/90" : "border-slate-200"}`}
            >
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

              <div className="flex items-start justify-between gap-2 pt-2">
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-semibold leading-snug line-clamp-2 ${
                      isDone ? "line-through text-slate-400" : "text-slate-800 group-hover:text-[#0088cc]"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <button
                  onClick={(e) => onToggleAssignmentDone(item.id, isDone, e)}
                  title={isDone ? "Mark as not done" : "Mark as done"}
                  className={`p-1 rounded shrink-0 transition-colors ${
                    isDone ? "text-teal-600 hover:bg-teal-50" : "text-slate-300 hover:text-teal-600 hover:bg-slate-100"
                  }`}
                >
                  <svg className="h-4 w-4" fill={isDone ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-50 text-[10px]">
                <div className="flex items-center gap-1 text-slate-600">
                  <svg
                    className={`h-3 w-3 ${overdue ? "text-rose-500" : "text-slate-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
                  ) : item.status === "late" ? (
                    <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                      Late
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Submitted
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
  );
}
