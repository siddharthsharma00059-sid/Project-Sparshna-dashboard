"use client"

export function LockoutOverlay({ open }: { open: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-red-950/95 p-6 backdrop-blur-sm">
      <div className="max-w-lg rounded-xl border-2 border-red-500 bg-red-900/40 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400 bg-red-500/20">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-red-300" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold uppercase tracking-wide text-red-100">
          Cartridge Register Loop Complete
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-red-200">
          The non-volatile cartridge head has reached its hardcoded <span className="font-mono font-bold">50-scan</span> lockout limit.
          All tab navigation and interface controls are frozen to protect data precision.
        </p>
        <div className="mt-5 rounded-lg border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300">
          ERR_CARTRIDGE_EXHAUSTED · REPLACE CALIBRATED HEAD SN-SPARSH-2026-X992
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-wider text-red-400/80">
          Install a calibrated replacement cartridge head to resume operation
        </p>
      </div>
    </div>
  )
}
