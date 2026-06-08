"use client"

import type { Side } from "./use-simulation"

interface HeaderProps {
  dark: boolean
  onToggleDark: () => void
  onFullscreen: () => void
  elapsed: number
  running: boolean
  ended: boolean
  paused: boolean
}

function fmtTime(s: number) {
  const total = Math.floor(s)
  const hh = String(Math.floor(total / 3600)).padStart(2, "0")
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0")
  const ss = String(total % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

function statusText(running: boolean, ended: boolean, paused: boolean) {
  if (ended) return { label: "REPORT READY", tone: "ok" as const }
  if (running) return { label: "ACQUIRING", tone: "live" as const }
  if (paused) return { label: "HELD / SHIFTED", tone: "warn" as const }
  return { label: "STANDBY", tone: "idle" as const }
}

export function Header({ dark, onToggleDark, onFullscreen, elapsed, running, ended, paused }: HeaderProps) {
  const status = statusText(running, ended, paused)
  const dotColor =
    status.tone === "live"
      ? "bg-emerald-500"
      : status.tone === "warn"
        ? "bg-amber-500"
        : status.tone === "ok"
          ? "bg-sky-500"
          : "bg-slate-400 dark:bg-slate-500"

  const items: { label: string; value: string; mono?: boolean }[] = [
    { label: "PATIENT ID", value: "SAMPLE-204-ANONYMIZED", mono: true },
    { label: "AGE", value: "47" },
    { label: "TARGET MONITOR", value: "BI-LATERAL QUADRANT SCAN" },
    { label: "ELAPSED", value: fmtTime(elapsed), mono: true },
    { label: "HARDWARE LINK", value: "SN-SPARSH-2026-X992", mono: true },
  ]

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-300 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-100">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white dark:text-slate-900" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l2 6 4-14 3 9 2-4h4" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Sparshna Analytics Panel
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Clinical Workstation V4.2.7
          </div>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-px overflow-hidden xl:flex">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col px-3 py-0.5 leading-tight"
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {it.label}
            </span>
            <span
              className={`text-[11px] font-semibold text-slate-800 dark:text-slate-100 ${it.mono ? "font-mono" : ""}`}
            >
              {it.value}
            </span>
          </div>
        ))}
        <div className="ml-2 flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${status.tone === "live" ? "animate-pulse" : ""}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onFullscreen}
          aria-label="Enter fullscreen diagnostic viewport"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" />
          </svg>
        </button>

        <button
          onClick={onToggleDark}
          role="switch"
          aria-checked={dark}
          aria-label="Toggle dark mode"
          className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800"
        >
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${dark ? "text-slate-500" : "text-amber-500"}`} fill="currentColor">
            <circle cx="12" cy="12" r="4" />
            <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M18.4 5.6l-1 1M6.6 17.4l-1 1" fill="none" />
          </svg>
          <span
            className={`relative h-4 w-7 rounded-full transition-colors ${dark ? "bg-sky-500" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${dark ? "left-3.5" : "left-0.5"}`}
            />
          </span>
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${dark ? "text-sky-400" : "text-slate-400"}`} fill="currentColor">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        </button>
      </div>
    </header>
  )
}

interface TabsProps {
  active: number
  onChange: (i: number) => void
  disabled: boolean
}

const TAB_LABELS = [
  "1. Core Triage Cockpit",
  "2. High-Frequency Tactile Waveforms",
  "3. Calibration & Sensor Diagnostics",
  "4. Electronic Medical Records (EMR) History",
]

export function Tabs({ active, onChange, disabled }: TabsProps) {
  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-slate-200 bg-slate-100 px-3 dark:border-slate-800 dark:bg-slate-900/60">
      {TAB_LABELS.map((label, i) => (
        <button
          key={label}
          disabled={disabled}
          onClick={() => onChange(i)}
          className={`relative px-3 py-2 text-[11px] font-medium tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            active === i
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {label}
          {active === i && (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-slate-900 dark:bg-sky-400" />
          )}
        </button>
      ))}
    </nav>
  )
}

export type { Side }
