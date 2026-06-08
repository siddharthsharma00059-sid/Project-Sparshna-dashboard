"use client"

interface WaveformProps {
  data: { s1: number[]; s2: number[]; s3: number[]; s4: number[] }
  running: boolean
  fill?: boolean
}

const VW = 800
const VH = 150
const MID = VH / 2

const CHANNELS = [
  { key: "s1", label: "S1", color: "#38bdf8" }, // sky
  { key: "s2", label: "S2", color: "#34d399" }, // emerald
  { key: "s3", label: "S3", color: "#ef4444" }, // crimson
  { key: "s4", label: "S4", color: "#a3a3a3" }, // neutral
] as const

function toPath(values: number[]) {
  if (values.length < 2) return ""
  const n = values.length
  let d = ""
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * VW
    const y = MID - values[i] * 0.7
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(4, Math.min(VH - 4, y)).toFixed(1)} `
  }
  return d
}

export function Waveform({ data, running, fill }: WaveformProps) {
  return (
    <div className={`flex shrink-0 flex-col rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 ${fill ? "h-full" : ""}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          High-Frequency Tactile Waveform Monitor · 50 Hz
        </span>
        <div className="flex items-center gap-3">
          {CHANNELS.map((c) => (
            <div key={c.key} className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-full" style={{ background: c.color }} />
              <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`relative w-full overflow-hidden rounded-md bg-slate-50 dark:bg-slate-950 ${fill ? "min-h-0 flex-1" : "h-[76px]"}`}>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="h-full w-full" preserveAspectRatio="none">
          {/* grid */}
          <g stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={0.5}>
            {[0.2, 0.4, 0.6, 0.8].map((f) => (
              <line key={f} x1={0} y1={VH * f} x2={VW} y2={VH * f} />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={i} x1={(VW / 16) * i} y1={0} x2={(VW / 16) * i} y2={VH} />
            ))}
          </g>
          <line x1={0} y1={MID} x2={VW} y2={MID} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={0.8} />
          {running &&
            CHANNELS.map((c) => (
              <path
                key={c.key}
                d={toPath(data[c.key])}
                fill="none"
                stroke={c.color}
                strokeWidth={c.key === "s3" ? 1.6 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={c.key === "s3" ? 1 : 0.9}
              />
            ))}
        </svg>
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600">
              Signal stream idle — start session to acquire
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
