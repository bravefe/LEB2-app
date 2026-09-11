import { forwardRef } from "react";

import type { ContextMenuState } from "../types.js";

type ContextMenuProps = {
  contextMenu: ContextMenuState;
  onToggleAssignmentDone: (id: string, currentStatus: boolean) => void;
  onToggleCourseDone: (courseId: string, currentStatus: boolean) => void;
  onMarkCourseAllDone: (courseId: string, isDone: boolean) => void;
  onOpenUrl: (url: string | null | undefined) => void;
};

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { contextMenu, onToggleAssignmentDone, onToggleCourseDone, onMarkCourseAllDone, onOpenUrl },
  ref,
) {
  if (!contextMenu.visible) return null;

  return (
    <div
      ref={ref}
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      className="fixed z-50 min-w-[200px] rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-700 shadow-xl"
    >
      <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 truncate max-w-[200px]">
        {contextMenu.title}
      </div>

      {contextMenu.type === "assignment" ? (
        <>
          <button
            onClick={() => onToggleAssignmentDone(contextMenu.targetId, contextMenu.isDone)}
            className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 font-medium text-slate-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{contextMenu.isDone ? "Mark as Undone" : "Mark as Done"}</span>
          </button>

          {contextMenu.url && (
            <button
              onClick={() => onOpenUrl(contextMenu.url)}
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
            onClick={() => onToggleCourseDone(contextMenu.targetId, contextMenu.isDone)}
            className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 font-medium text-slate-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{contextMenu.isDone ? "Mark Course as Undone" : "Mark Course as Done"}</span>
          </button>

          <button
            onClick={() => onMarkCourseAllDone(contextMenu.targetId, true)}
            className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Mark All in Course as Done</span>
          </button>

          {contextMenu.url && (
            <button
              onClick={() => onOpenUrl(contextMenu.url)}
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
  );
});
