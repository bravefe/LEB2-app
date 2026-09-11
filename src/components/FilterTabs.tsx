import type { TabView } from "../types.js";

type FilterTabsProps = {
  tabView: TabView;
  notSubmittedCount: number;
  dueDateAssignmentsLength: number;
  assignmentsLength: number;
  onChange: (value: TabView) => void;
};

export function FilterTabs({
  tabView,
  notSubmittedCount,
  dueDateAssignmentsLength,
  assignmentsLength,
  onChange,
}: FilterTabsProps) {
  return (
    <section className="px-1">
      <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium text-slate-600 shadow-inner w-full">
        <button
          onClick={() => onChange("not_submitted")}
          className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${
            tabView === "not_submitted"
              ? "bg-white font-semibold text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Not Submitted ({notSubmittedCount})
        </button>
        <button
          onClick={() => onChange("due_date")}
          className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${
            tabView === "due_date"
              ? "bg-white font-semibold text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          By Due Date ({dueDateAssignmentsLength})
        </button>
        <button
          onClick={() => onChange("all")}
          className={`flex-1 rounded-md px-2 py-1.5 transition-all text-center ${
            tabView === "all"
              ? "bg-white font-semibold text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Work ({assignmentsLength})
        </button>
      </div>
    </section>
  );
}
