"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type Side = "left" | "right"

export interface SimMetrics {
  preload: number // 0.0 - 4.5 N
  ks: number // Stiffness index, peak 6.91 N/mm
  dt: number // Thermal delta, up to +2.1
  variance: number // up to 0.84
  severity: "normal" | "alert" // CAT 1 vs CAT 3
}

export interface SimSnapshot {
  // lifecycle
  running: boolean
  paused: boolean
  ended: boolean
  locked: boolean
  reportUnlocked: boolean
  // session
  elapsed: number // seconds
  activeSide: Side
  scanCount: number
  // probe location, normalized grid coords 0..1
  probe: { x: number; y: number }
  // animation clock
  clock: number
  // metrics
  metrics: SimMetrics
  // waveform channels, newest at end
  waveform: { s1: number[]; s2: number[]; s3: number[]; s4: number[] }
  // anomaly intensity 0..1 (right upper-outer quadrant)
  anomaly: number
  // final report text
  report: string
}

const WAVE_LEN = 160
const REPORT_TEXT =
  "Right upper-outer quadrant shows a focal hotspot (ΔT 2.1°C) co-located with a stiffness peak (Ks 6.91 N/mm). Hysteresis compliance curve breaches healthy envelope — escalate to BI-RADS Category 3 and route per protocol."

// Anomaly is located in the upper-outer quadrant. For the right breast workspace
// "outer" maps toward the right edge of its own grid.
const ANOMALY = { x: 0.74, y: 0.27 }

function gauss(dx: number, dy: number, spread: number) {
  return Math.exp(-(dx * dx + dy * dy) / (2 * spread * spread))
}

function emptyWave() {
  return new Array(WAVE_LEN).fill(0) as number[]
}

export function useSimulation() {
  const [snap, setSnap] = useState<SimSnapshot>(() => ({
    running: false,
    paused: false,
    ended: false,
    locked: false,
    reportUnlocked: false,
    elapsed: 0,
    activeSide: "right",
    scanCount: 0,
    probe: { x: 0.5, y: 0.5 },
    clock: 0,
    metrics: { preload: 0, ks: 0, dt: 0, variance: 0, severity: "normal" },
    waveform: { s1: emptyWave(), s2: emptyWave(), s3: emptyWave(), s4: emptyWave() },
    anomaly: 0,
    report: "",
  }))

  // mutable refs used inside the animation loop
  const raf = useRef<number | null>(null)
  const last = useRef<number>(0)
  const clock = useRef<number>(0)
  const elapsed = useRef<number>(0)
  const wave = useRef({ s1: emptyWave(), s2: emptyWave(), s3: emptyWave(), s4: emptyWave() })
  const runningRef = useRef(false)
  const sideRef = useRef<Side>("right")
  const endedRef = useRef(false)

  const loop = useCallback((ts: number) => {
    if (last.current === 0) last.current = ts
    const dtSec = Math.min(0.05, (ts - last.current) / 1000)
    last.current = ts

    if (runningRef.current) {
      clock.current += dtSec
      elapsed.current += dtSec
    }
    const t = clock.current

    // Serpentine probe path across the quadrants.
    const u = (t * 0.09) % 1
    const px = 0.5 + 0.42 * Math.sin(u * Math.PI * 2)
    const py = 0.12 + 0.76 * u
    const probe = { x: px, y: py }

    // Anomaly only manifests on the right side workspace.
    const onRight = sideRef.current === "right"
    const dist = gauss(px - ANOMALY.x, py - ANOMALY.y, 0.16)
    const anomaly = onRight ? dist : 0

    // Derived live metrics.
    const noise = (a: number) => (Math.sin(t * a) + Math.sin(t * a * 1.7)) * 0.5
    const preload = runningRef.current ? Math.max(0, Math.min(4.5, 2.4 + 0.6 * noise(2.1) + 0.7 * anomaly)) : 0
    const ks = runningRef.current ? 3.1 + 0.25 * noise(1.3) + (6.91 - 3.1) * anomaly : 0
    const dtThermal = runningRef.current ? 0.15 * noise(0.9) + 2.1 * anomaly : 0
    const variance = runningRef.current ? 0.18 + 0.06 * noise(3.3) + (0.84 - 0.18) * anomaly : 0
    const severity: SimMetrics["severity"] = anomaly > 0.6 ? "alert" : "normal"

    // Waveforms: tight low-amplitude band on baseline, S3 (crimson) spikes on anomaly.
    if (runningRef.current) {
      const base = Math.sin(t * 6) * 4
      const jitter = () => (Math.random() - 0.5) * 3
      const spike = anomaly * 78 * (0.85 + 0.15 * Math.sin(t * 22))
      const push = (arr: number[], v: number) => {
        arr.push(v)
        if (arr.length > WAVE_LEN) arr.shift()
      }
      push(wave.current.s1, base + jitter() + Math.sin(t * 5.2) * 5)
      push(wave.current.s2, base + jitter() + Math.sin(t * 7.1 + 1) * 5)
      push(wave.current.s3, base + jitter() + Math.sin(t * 6.4 + 2) * 5 + spike)
      push(wave.current.s4, base + jitter() + Math.sin(t * 5.8 + 3) * 5)
    }

    setSnap((prev) => {
      // Freeze the entire scene when locked, ended, or paused so graph lines,
      // 3D mesh scales and metrics hold their last live position.
      if (prev.locked || prev.ended || prev.paused) return prev
      return {
        ...prev,
        clock: t,
        elapsed: elapsed.current,
        probe,
        anomaly,
        metrics: { preload, ks, dt: dtThermal, variance, severity },
        waveform: {
          s1: [...wave.current.s1],
          s2: [...wave.current.s2],
          s3: [...wave.current.s3],
          s4: [...wave.current.s4],
        },
      }
    })

    raf.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    raf.current = requestAnimationFrame(loop)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [loop])

  // restore prior session count from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sparshna_session")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed.scanCount === "number") {
          setSnap((p) => ({ ...p, scanCount: parsed.scanCount }))
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  const start = useCallback(() => {
    if (endedRef.current) {
      // restart fresh after an ended session
      endedRef.current = false
      elapsed.current = 0
      wave.current = { s1: emptyWave(), s2: emptyWave(), s3: emptyWave(), s4: emptyWave() }
      setSnap((p) => ({ ...p, ended: false, reportUnlocked: false, report: "" }))
    }
    runningRef.current = true
    setSnap((p) => ({ ...p, running: true, paused: false }))
  }, [])

  const pauseShift = useCallback(() => {
    runningRef.current = false
    const next: Side = sideRef.current === "left" ? "right" : "left"
    sideRef.current = next
    setSnap((p) => ({ ...p, running: false, paused: true, activeSide: next }))
  }, [])

  const isolate = useCallback((side: Side) => {
    sideRef.current = side
    setSnap((p) => ({ ...p, activeSide: side }))
  }, [])

  const end = useCallback(() => {
    runningRef.current = false
    endedRef.current = true
    const count = snap.scanCount + 1
    const payload = {
      scanCount: count,
      ks: 6.91,
      dt: 2.1,
      variance: 0.84,
      preload: 4.5,
      elapsed: Math.round(elapsed.current),
      severity: "CAT 3 / HIGH VARIANCE DETECTED",
      timestamp: new Date().toISOString(),
    }
    try {
      localStorage.setItem("sparshna_session", JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    setSnap((p) => ({
      ...p,
      running: false,
      paused: false,
      ended: true,
      reportUnlocked: true,
      report: REPORT_TEXT,
      scanCount: count,
      probe: { ...ANOMALY },
      anomaly: 1,
      metrics: { preload: 4.5, ks: 6.91, dt: 2.1, variance: 0.84, severity: "alert" },
    }))
  }, [snap.scanCount])

  const simulateLockout = useCallback(() => {
    runningRef.current = false
    try {
      localStorage.setItem(
        "sparshna_session",
        JSON.stringify({ scanCount: 50, locked: true, timestamp: new Date().toISOString() }),
      )
    } catch {
      /* ignore */
    }
    setSnap((p) => ({ ...p, running: false, locked: true, scanCount: 50 }))
  }, [])

  return { snap, start, pauseShift, isolate, end, simulateLockout }
}
