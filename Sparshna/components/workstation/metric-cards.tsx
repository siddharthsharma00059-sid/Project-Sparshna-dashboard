"use client"

import type { SimMetrics } from "./use-simulation"

interface MetricCardsProps {
  metrics: SimMetrics
  running: boolean
}

interface CardDef {
  label: string
  sub: string
  value: string
  unit: string
  pct: number // fill 0..1
  hot?: boolean
}

function MiniBar({ pct, hot }: { pct: number; hot?: boolean }) {
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all duration-200 ${
          hot ? "bg-red-500" : "bg-sky-500 dark:bg-sky-400"
        }`}
        style={{ width: `${Math.max(2, Math.min(100, pct * 100))}%` }}
      />
    </div>
  )
}

export function MetricCards({ metrics, running }: MetricCardsProps) {
  const { preload, ks, dt, variance, severity } = metrics
  const alert = severity === "alert"

  const cards: CardDef[] = [
    {
      label: "Applied Pre-load Force",
      sub: "Operator stabilization",
      value: preload.toFixed(1),
      unit: "N",
      pct: preload / 4.5,
    },
    {
      label: "Stiffness Index (Ks)",
      sub: "Local tissue compliance",
      value: ks.toFixed(2),
      unit: "N/mm",
      pct: ks / 6.91,
      hot: ks > 5.5,
    },
    {
      label: "Thermal Delta (ΔT)",
      sub: "NTC surface deviation",
      value: (dt >= 0 ? "+" : "") + dt.toFixed(1),
      unit: "°C",
      pct: dt / 2.1,
      hot: dt > 1.4,
    },
    {
      label: "Grid Variance Matrix Δ",
      sub: "Matrix loop tracking",
      value: variance.toFixed(2),
      unit: "σ",
      pct: variance / 0.84,
      hot: variance > 0.6,
    },
  ]

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 px-3 py-2 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {c.label}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`font-mono text-xl font-bold tabular-nums transition-colors ${
                !running
                  ? "text-slate-400 dark:text-slate-600"
                  : c.hot
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-900 dark:text-slate-50"
              }`}
            >
              {c.value}
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{c.unit}</span>
          </div>
          <MiniBar pct={running ? c.pct : 0} hot={c.hot} />
          <div className="mt-1 text-[9px] text-slate-400 dark:text-slate-500">{c.sub}</div>
        </div>
      ))}

      {/* Triage severity indicator */}
      <div
        className={`flex flex-col justify-between rounded-lg border px-3 py-2 transition-colors ${
          alert
            ? "border-red-500 bg-red-50 dark:border-red-500/60 dark:bg-red-950/40"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Triage Severity
        </span>
        {alert ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-[12px] font-bold leading-tight text-red-600 dark:text-red-400">
              CAT 3 / HIGH VARIANCE
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
              CAT 1 / NORMAL
            </span>
          </div>
        )}
        <span className="text-[9px] text-slate-400 dark:text-slate-500">
          {alert ? "Anomaly boundary breached" : "Within healthy envelope"}
        </span>
      </div>
    </div>
  )
}
