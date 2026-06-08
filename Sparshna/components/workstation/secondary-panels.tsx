"use client"

import type { SimSnapshot } from "./use-simulation"

export function CalibrationPanel({ snap }: { snap: SimSnapshot }) {
  const sensors = [
    { id: "S1", base: "Baseline matrix point", drift: 0.012, status: "OK" },
    { id: "S2", base: "Inner quadrant array", drift: 0.018, status: "OK" },
    { id: "S3", base: "Outer quadrant array", drift: 0.041, status: "WATCH" },
    { id: "S4", base: "Lower margin array", drift: 0.009, status: "OK" },
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          ["NTC Thermistor Cal.", "±0.05 °C", "Verified"],
          ["Force Transducer", "±0.02 N", "Verified"],
          ["Matrix Loop Integrity", "100%", "Nominal"],
          ["Probe Latency", "8 ms", "Nominal"],
        ].map(([k, v, s]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{k}</div>
            <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">{v}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{s}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Sensor Diagnostics Matrix
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[9px] uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <th className="py-1.5">Channel</th>
              <th>Array Role</th>
              <th>Drift (σ)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {sensors.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-1.5 font-bold text-slate-800 dark:text-slate-200">{s.id}</td>
                <td className="font-sans text-slate-500 dark:text-slate-400">{s.base}</td>
                <td className="text-slate-700 dark:text-slate-300">{s.drift.toFixed(3)}</td>
                <td>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                      s.status === "OK"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Live grid variance: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{snap.metrics.variance.toFixed(3)} σ</span> · Cartridge cycle{" "}
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{snap.scanCount}/50</span>
      </div>
    </div>
  )
}

export function EmrPanel({ snap }: { snap: SimSnapshot }) {
  const rows = [
    { date: "2026-06-08", ks: "6.91", dt: "+2.1", cat: "CAT 3", note: "Right UOQ focal hotspot" },
    { date: "2026-03-14", ks: "4.20", dt: "+0.8", cat: "CAT 1", note: "Routine bilateral baseline" },
    { date: "2025-12-02", ks: "3.95", dt: "+0.6", cat: "CAT 1", note: "Routine bilateral baseline" },
    { date: "2025-08-21", ks: "4.05", dt: "+0.7", cat: "CAT 1", note: "Follow-up — stable" },
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        EMR History — SAMPLE-204-ANONYMIZED
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-[9px] uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="py-1.5">Date</th>
            <th>Ks (N/mm)</th>
            <th>ΔT (°C)</th>
            <th>Triage</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-2 font-mono text-slate-700 dark:text-slate-300">{r.date}</td>
              <td className="font-mono text-slate-700 dark:text-slate-300">{r.ks}</td>
              <td className="font-mono text-slate-700 dark:text-slate-300">{r.dt}</td>
              <td>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                    r.cat === "CAT 3"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  }`}
                >
                  {r.cat}
                </span>
              </td>
              <td className="text-slate-500 dark:text-slate-400">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] text-slate-400">
        {snap.ended
          ? "Latest session committed to local register."
          : "Conclude the active session to commit a new record."}
      </p>
    </div>
  )
}
