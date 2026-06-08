"use client"

import { useCallback, useState } from "react"
import { useSimulation } from "./use-simulation"
import { Header, Tabs } from "./header"
import { MetricCards } from "./metric-cards"
import { ScanPanel } from "./scan-panel"
import { Waveform } from "./waveform"
import { Controls } from "./controls"
import { ReportModal } from "./report-modal"
import { LockoutOverlay } from "./lockout-overlay"
import { CalibrationPanel, EmrPanel } from "./secondary-panels"

export function Workstation() {
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const { snap, start, pauseShift, isolate, end, simulateLockout } = useSimulation()

  const onFullscreen = useCallback(() => {
    const el = document.documentElement
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  return (
    <div className={dark ? "dark" : ""}>
      <main className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          onFullscreen={onFullscreen}
          elapsed={snap.elapsed}
          running={snap.running}
          ended={snap.ended}
          paused={snap.paused}
        />
        <Tabs active={tab} onChange={setTab} disabled={snap.locked} />

        {/* TAB 1 — Core Triage Cockpit */}
        {tab === 0 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <MetricCards metrics={snap.metrics} running={snap.running} />
            <div className="flex min-h-0 flex-1 flex-col gap-2 px-3">
              <ScanPanel
                activeSide={snap.activeSide}
                running={snap.running}
                rendered={snap.running || snap.paused || snap.ended}
                anomaly={snap.anomaly}
                probe={snap.probe}
                onIsolate={isolate}
              />
              <Waveform data={snap.waveform} running={snap.running} />
            </div>
            <Controls
              running={snap.running}
              ended={snap.ended}
              reportUnlocked={snap.reportUnlocked}
              report={snap.report}
              onStart={start}
              onPauseShift={pauseShift}
              onEnd={end}
              onSimulateLockout={simulateLockout}
              onViewReport={() => setReportOpen(true)}
            />
          </div>
        )}

        {/* TAB 2 — Waveforms (enlarged) */}
        {tab === 1 && (
          <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
            <MetricCards metrics={snap.metrics} running={snap.running} />
            <div className="min-h-0 flex-1">
              <Waveform data={snap.waveform} running={snap.running} fill />
            </div>
            <Controls
              running={snap.running}
              ended={snap.ended}
              reportUnlocked={snap.reportUnlocked}
              report={snap.report}
              onStart={start}
              onPauseShift={pauseShift}
              onEnd={end}
              onSimulateLockout={simulateLockout}
              onViewReport={() => setReportOpen(true)}
            />
          </div>
        )}

        {/* TAB 3 — Calibration & Sensor Diagnostics */}
        {tab === 2 && (
          <div className="min-h-0 flex-1 p-3">
            <CalibrationPanel snap={snap} />
          </div>
        )}

        {/* TAB 4 — EMR History */}
        {tab === 3 && (
          <div className="min-h-0 flex-1 p-3">
            <EmrPanel snap={snap} />
          </div>
        )}
      </main>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        report={snap.report}
        scanCount={snap.scanCount}
      />
      <LockoutOverlay open={snap.locked} />
    </div>
  )
}
