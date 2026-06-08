"use client"

interface ControlsProps {
  running: boolean
  ended: boolean
  reportUnlocked: boolean
  report: string
  onStart: () => void
  onPauseShift: () => void
  onEnd: () => void
  onSimulateLockout: () => void
  onViewReport: () => void
}

function CtrlButton({
  children,
  onClick,
  disabled,
  primary,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  danger?: boolean
}) {
  const base =
    "rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-colors disabled:cursor-not-allowed"
  const style = disabled
    ? "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
    : primary
      ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      : danger
        ? "border-red-300 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {children}
    </button>
  )
}

export function Controls({
  running,
  ended,
  reportUnlocked,
  report,
  onStart,
  onPauseShift,
  onEnd,
  onSimulateLockout,
  onViewReport,
}: ControlsProps) {
  return (
    <div className="grid shrink-0 grid-cols-1 gap-2 px-3 pb-3 lg:grid-cols-[auto_1fr_auto]">
      {/* primary controls */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <CtrlButton onClick={onStart} primary disabled={running}>
          {ended ? "Restart Session" : running ? "Session Running…" : "Start Session"}
        </CtrlButton>
        <CtrlButton onClick={onPauseShift} disabled={!running}>
          Pause / Shift Side
        </CtrlButton>
        <CtrlButton onClick={onEnd} disabled={!running} danger>
          End Session
        </CtrlButton>
      </div>

      {/* triage reviews log */}
      <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <span className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Triage Reviews Log
        </span>
        <p
          className={`min-h-[2.2rem] text-[11px] leading-snug ${
            report ? "text-slate-800 dark:text-slate-200" : "italic text-slate-400 dark:text-slate-600"
          }`}
        >
          {report || "No findings logged. Conclude a session to populate the authoritative triage report."}
        </p>
      </div>

      {/* reporting suite */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          <CtrlButton onClick={onViewReport} disabled={!reportUnlocked}>
            View Report
          </CtrlButton>
          <CtrlButton onClick={onViewReport} disabled={!reportUnlocked}>
            Download PDF
          </CtrlButton>
          <CtrlButton onClick={() => window.print()} disabled={!reportUnlocked}>
            Print
          </CtrlButton>
          <CtrlButton onClick={onViewReport} disabled={!reportUnlocked}>
            Share Partner Networks
          </CtrlButton>
        </div>
        <button
          onClick={onSimulateLockout}
          className="self-start rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400"
        >
          Simulate 50th Scan
        </button>
      </div>
    </div>
  )
}
