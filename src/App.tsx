import { useEffect, useState } from "react";
import type { ScanResult } from "../playwright/types.js";

type Assignment = {
  id: string;
  title: string;
  course_name: string;
  status: string;
  due_at: string | null;
  assignment_type: string | null;
  url: string | null;
};

type Course = { id: string; name: string; code: string | null; unfinished_count: number };

const statusLabel: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  completed: "Completed",
  graded: "Graded",
  overdue: "Overdue",
  unknown: "Unknown"
};

export function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Ready to scan");

  async function refresh() {
    if (!window.leb2) {
      setMessage("Open this screen through Electron to use live data.");
      return;
    }
    setAssignments(await window.leb2.listAssignments() as Assignment[]);
    setCourses(await window.leb2.listCourses() as Course[]);
  }

  async function scan() {
    if (!window.leb2) {
      setMessage("Live scanning is available when the app is opened with Electron.");
      return;
    }
    setBusy(true);
    setMessage("Scanning LEB2...");
    try {
      const result = await window.leb2.scan();
      setLastScan(result);
      await refresh();
      setMessage(`Scan complete: ${result.classes.length} classes, ${result.activityCount} activities`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#164e63,_#0f172a_45%,_#020617)] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between border-b border-cyan-900/60 pb-5">
          <div><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">LEB2 Work Checker</p><h1 className="mt-2 text-3xl font-semibold">Your schoolwork, in one quiet place.</h1></div>
          <button onClick={() => void scan()} disabled={busy} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60">{busy ? "Scanning..." : "Scan now"}</button>
        </header>
        <p className="mb-6 text-sm text-slate-300">{message}</p>
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <Summary label="Unfinished" value={assignments.filter((item) => ["not_started", "in_progress", "unknown"].includes(item.status)).length} />
          <Summary label="Overdue" value={assignments.filter((item) => item.status === "overdue").length} />
          <Summary label="Courses" value={courses.length} />
        </section>
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <section><h2 className="mb-3 text-lg font-semibold">Courses</h2><div className="space-y-3">{courses.map((course) => <article key={course.id} className="rounded-lg border border-slate-800 bg-slate-900/75 p-4"><div className="font-medium">{course.name}</div><div className="mt-1 text-sm text-slate-400">{course.code ?? "No course code"} · {course.unfinished_count} unfinished</div></article>)}{courses.length === 0 && <Empty text="No saved courses yet." />}</div></section>
          <section><h2 className="mb-3 text-lg font-semibold">Assignments</h2><div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/75"><table className="w-full text-left text-sm"><thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th></tr></thead><tbody>{assignments.map((item) => <tr key={item.id} className="border-b border-slate-800/80"><td className="px-4 py-3">{item.url ? <a className="text-cyan-300 hover:underline" href={item.url} target="_blank" rel="noreferrer">{item.title}</a> : item.title}<div className="text-xs text-slate-500">{item.assignment_type ?? "Activity"}</div></td><td className="px-4 py-3 text-slate-300">{item.course_name}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-800 px-2 py-1 text-xs">{statusLabel[item.status] ?? item.status}</span></td><td className="px-4 py-3 text-slate-300">{item.due_at ?? "No due date"}</td></tr>)}</tbody></table>{assignments.length === 0 && <Empty text="Run a scan to load activities." />}</div></section>
        </div>
        {lastScan && <p className="mt-6 text-xs text-slate-500">Last scan: {new Date(lastScan.scannedAt).toLocaleString()}</p>}
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-5"><div className="text-sm text-slate-400">{label}</div><div className="mt-2 text-3xl font-semibold text-cyan-300">{value}</div></div>; }
function Empty({ text }: { text: string }) { return <p className="p-6 text-sm text-slate-500">{text}</p>; }
