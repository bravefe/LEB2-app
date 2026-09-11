type SummaryCardProps = {
  notSubmittedCount: number;
  totalCoursesCount: number;
  busy: boolean;
  formattedLastScan: string;
  onScan: () => void;
};

export function SummaryCard({
  notSubmittedCount,
  totalCoursesCount,
  busy,
  formattedLastScan,
  onScan,
}: SummaryCardProps) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
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

      <div className="pt-3 flex flex-col items-center">
        <button
          onClick={onScan}
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

        <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last scan: {formattedLastScan}</span>
        </p>
      </div>
    </section>
  );
}
