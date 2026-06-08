"use client"

import type { Side } from "./use-simulation"

interface ScanProps {
  side: Side
  active: boolean
  running: boolean
  rendered: boolean // mesh visible (running, paused, or ended) vs idle
  anomalyOn: boolean // whether this workspace shows the bulge/hotspot
  anomaly: number // 0..1 current intensity
  probe: { x: number; y: number } | null
  onIsolate: (side: Side) => void
}

const COLS = 16
const ROWS = 11
const W = 320
const H = 220
const PAD_X = 18
const PAD_Y = 14
// isometric skew
const ISO = 0.42

// anomaly center in grid space (col fraction, row fraction)
const ANOM = { cx: 0.74, cy: 0.27 }

function project(col: number, row: number, height: number) {
  // grid normalized 0..1
  const gx = col / (COLS - 1)
  const gy = row / (ROWS - 1)
  const baseX = PAD_X + gx * (W - PAD_X * 2)
  const baseY = PAD_Y + gy * (H - PAD_Y * 2)
  // apply iso vertical skew based on row to fake depth, lift by height
  const x = baseX + (gy - 0.5) * 26
  const y = baseY * ISO + 70 - height
  return { x, y }
}

// dome surface height + anomaly bulge
function surfaceHeight(gx: number, gy: number, withAnomaly: boolean, intensity: number) {
  // calm uniform dome
  const dome =
    Math.cos((gx - 0.5) * Math.PI) * Math.cos((gy - 0.5) * Math.PI) * 26
  let h = 14 + Math.max(0, dome)
  if (withAnomaly) {
    const dx = gx - ANOM.cx
    const dy = gy - ANOM.cy
    const bulge = Math.exp(-(dx * dx + dy * dy) / (2 * 0.018)) * 34 * (0.5 + 0.5 * intensity)
    h += bulge
  }
  return h
}

// thermal value 0..1 at grid point
function thermal(gx: number, gy: number, withAnomaly: boolean, intensity: number) {
  let v = 0.18 + 0.12 * Math.cos((gx - 0.5) * Math.PI) * Math.cos((gy - 0.5) * Math.PI)
  if (withAnomaly) {
    const dx = gx - ANOM.cx
    const dy = gy - ANOM.cy
    v += Math.exp(-(dx * dx + dy * dy) / (2 * 0.02)) * 0.95 * (0.5 + 0.5 * intensity)
  }
  return Math.max(0, Math.min(1, v))
}

// map 0..1 -> thermal color (blue -> green -> orange -> red)
function thermalColor(v: number, withAnomaly: boolean) {
  if (!withAnomaly) {
    // calm blue/green palette
    const stops: [number, [number, number, number]][] = [
      [0, [37, 99, 235]],
      [0.5, [16, 185, 129]],
      [1, [101, 163, 13]],
    ]
    return lerpStops(v, stops)
  }
  const stops: [number, [number, number, number]][] = [
    [0, [37, 99, 235]],
    [0.35, [14, 165, 233]],
    [0.55, [16, 185, 129]],
    [0.72, [234, 179, 8]],
    [0.86, [249, 115, 22]],
    [1, [220, 38, 38]],
  ]
  return lerpStops(v, stops)
}

function lerpStops(v: number, stops: [number, [number, number, number]][]) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i]
    const [b, cb] = stops[i + 1]
    if (v >= a && v <= b) {
      const t = (v - a) / (b - a || 1)
      const r = Math.round(ca[0] + (cb[0] - ca[0]) * t)
      const g = Math.round(ca[1] + (cb[1] - ca[1]) * t)
      const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t)
      return `rgb(${r},${g},${bl})`
    }
  }
  const last = stops[stops.length - 1][1]
  return `rgb(${last[0]},${last[1]},${last[2]})`
}

function IsoMesh({ withAnomaly, intensity, probe }: { withAnomaly: boolean; intensity: number; probe: { x: number; y: number } | null }) {
  // Build row polylines (constant row, varying col) and col polylines.
  const rowLines: string[] = []
  const colorCells: { d: string; fill: string }[] = []

  // quad cells for fill (thermal map)
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const corners = [
        [c, r],
        [c + 1, r],
        [c + 1, r + 1],
        [c, r + 1],
      ]
      const pts = corners.map(([cc, rr]) => {
        const gx = cc / (COLS - 1)
        const gy = rr / (ROWS - 1)
        const h = surfaceHeight(gx, gy, withAnomaly, intensity)
        return project(cc, rr, h)
      })
      const cx = (c + 0.5) / (COLS - 1)
      const cy = (r + 0.5) / (ROWS - 1)
      const v = thermal(cx, cy, withAnomaly, intensity)
      const d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)} L${pts[2].x.toFixed(1)},${pts[2].y.toFixed(1)} L${pts[3].x.toFixed(1)},${pts[3].y.toFixed(1)} Z`
      colorCells.push({ d, fill: thermalColor(v, withAnomaly) })
    }
  }

  // isoline grid (rows)
  for (let r = 0; r < ROWS; r++) {
    let d = ""
    for (let c = 0; c < COLS; c++) {
      const gx = c / (COLS - 1)
      const gy = r / (ROWS - 1)
      const h = surfaceHeight(gx, gy, withAnomaly, intensity)
      const p = project(c, r, h)
      d += `${c === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)} `
    }
    rowLines.push(d)
  }
  // columns
  const colLines: string[] = []
  for (let c = 0; c < COLS; c++) {
    let d = ""
    for (let r = 0; r < ROWS; r++) {
      const gx = c / (COLS - 1)
      const gy = r / (ROWS - 1)
      const h = surfaceHeight(gx, gy, withAnomaly, intensity)
      const p = project(c, r, h)
      d += `${r === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)} `
    }
    colLines.push(d)
  }

  // probe cursor projected
  let probePt: { x: number; y: number } | null = null
  if (probe) {
    const h = surfaceHeight(probe.x, probe.y, withAnomaly, intensity)
    const col = probe.x * (COLS - 1)
    const row = probe.y * (ROWS - 1)
    probePt = project(col, row, h)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* thermal fill */}
      <g opacity={0.92}>
        {colorCells.map((cell, i) => (
          <path key={i} d={cell.d} fill={cell.fill} stroke="none" />
        ))}
      </g>
      {/* iso grid */}
      <g fill="none" stroke="currentColor" strokeWidth={0.5} className="text-white/40">
        {rowLines.map((d, i) => (
          <path key={`r${i}`} d={d} />
        ))}
        {colLines.map((d, i) => (
          <path key={`c${i}`} d={d} />
        ))}
      </g>
      {/* probe cursor */}
      {probePt && (
        <g>
          <circle cx={probePt.x} cy={probePt.y} r={9} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.85} />
          <circle cx={probePt.x} cy={probePt.y} r={3} fill="#ffffff" />
          <line x1={probePt.x - 13} y1={probePt.y} x2={probePt.x - 9} y2={probePt.y} stroke="#fff" strokeWidth={1.2} />
          <line x1={probePt.x + 9} y1={probePt.y} x2={probePt.x + 13} y2={probePt.y} stroke="#fff" strokeWidth={1.2} />
          <line x1={probePt.x} y1={probePt.y - 13} x2={probePt.x} y2={probePt.y - 9} stroke="#fff" strokeWidth={1.2} />
          <line x1={probePt.x} y1={probePt.y + 9} x2={probePt.x} y2={probePt.y + 13} stroke="#fff" strokeWidth={1.2} />
        </g>
      )}
    </svg>
  )
}

function GradientBar() {
  return (
    <div className="mt-2">
      <div
        className="h-2 w-full rounded-full"
        style={{
          background: "linear-gradient(90deg, rgb(37,99,235), rgb(14,165,233), rgb(16,185,129), rgb(234,179,8), rgb(249,115,22), rgb(220,38,38))",
        }}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-500 dark:text-slate-400">
        <span>31.5°C</span>
        <span>35.5°C</span>
        <span>40.0°C</span>
      </div>
    </div>
  )
}

function Workspace({ side, active, running, rendered, anomalyOn, anomaly, probe, onIsolate }: ScanProps) {
  const title = side === "left" ? "LEFT BREAST WORKSPACE" : "RIGHT BREAST WORKSPACE"
  const showProbe = running && active ? probe : null

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col rounded-lg border bg-slate-900 p-2.5 transition-colors ${
        active
          ? "border-sky-500 ring-1 ring-sky-500/40 dark:border-sky-400"
          : "border-slate-300 opacity-80 dark:border-slate-800"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sky-400" : "bg-slate-500"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">{title}</span>
          {anomalyOn && rendered && anomaly > 0.5 && (
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-red-300">
              Hotspot
            </span>
          )}
        </div>
        <button
          onClick={() => onIsolate(side)}
          className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors ${
            active
              ? "border-sky-500 bg-sky-500/20 text-sky-300"
              : "border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white"
          }`}
        >
          Isolate {side === "left" ? "Left" : "Right"} Side
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-slate-950 to-slate-900">
        {rendered ? (
          <IsoMesh withAnomaly={anomalyOn} intensity={anomaly} probe={showProbe} />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-600">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 5 4-12 2 7h6" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider">Awaiting session start</span>
          </div>
        )}
      </div>

      <GradientBar />
    </div>
  )
}

interface ScanPanelProps {
  activeSide: Side
  running: boolean
  rendered: boolean
  anomaly: number
  probe: { x: number; y: number }
  onIsolate: (side: Side) => void
}

export function ScanPanel({ activeSide, running, rendered, anomaly, probe, onIsolate }: ScanPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <Workspace
        side="left"
        active={activeSide === "left"}
        running={running}
        rendered={rendered}
        anomalyOn={false}
        anomaly={0}
        probe={probe}
        onIsolate={onIsolate}
      />
      <Workspace
        side="right"
        active={activeSide === "right"}
        running={running}
        rendered={rendered}
        anomalyOn={true}
        anomaly={anomaly}
        probe={probe}
        onIsolate={onIsolate}
      />
    </div>
  )
}
