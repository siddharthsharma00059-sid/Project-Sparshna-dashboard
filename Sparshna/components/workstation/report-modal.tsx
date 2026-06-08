"use client"

interface ReportModalProps {
  open: boolean
  onClose: () => void
  report: string
  scanCount: number
}

const FIELD =
  "border-b border-dashed border-slate-300 px-1 outline-none focus:border-slate-900 print:border-slate-400"

export function ReportModal({ open, onClose, report, scanCount }: ReportModalProps) {
  if (!open) return null
  const now = new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="my-4 w-full max-w-3xl rounded-lg bg-white shadow-2xl print:my-0 print:shadow-none">
        {/* toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 print:hidden">
          <span className="text-sm font-semibold text-slate-900">Authorized Diagnostic Report</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

        {/* document */}
        <div className="p-8 text-slate-900">
          {/* editable hospital header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <input
                defaultValue="Sparshna Diagnostic Institute"
                className={`text-xl font-bold ${FIELD}`}
              />
              <div className="mt-2 flex gap-2 text-xs text-slate-600">
                <span>Facility Code:</span>
                <input defaultValue="SPN-NCR-014" className={`w-28 font-mono ${FIELD}`} />
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="font-mono">Report #{String(scanCount).padStart(4, "0")}</div>
              <div>{now.toLocaleDateString()}</div>
              <div>{now.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* patient block */}
          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {[
              ["Patient ID", "SAMPLE-204-ANONYMIZED"],
              ["Age", "47"],
              ["Target Monitor", "Bi-lateral Quadrant Scan"],
              ["Hardware Link", "SN-SPARSH-2026-X992"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 py-1">
                <span className="font-semibold text-slate-500">{k}</span>
                <span className="font-mono text-slate-800">{v}</span>
              </div>
            ))}
          </div>

          {/* parameters */}
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">Captured Parameters</h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[
              ["Pre-load Force", "4.5 N"],
              ["Stiffness (Ks)", "6.91 N/mm"],
              ["Thermal Δ", "+2.1 °C"],
              ["Variance Δ", "0.84 σ"],
            ].map(([k, v]) => (
              <div key={k} className="rounded border border-slate-200 p-2 text-center">
                <div className="font-mono text-base font-bold text-slate-900">{v}</div>
                <div className="text-[9px] uppercase text-slate-500">{k}</div>
              </div>
            ))}
          </div>

          {/* mini thermal map snapshots */}
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">Isometric Thermal Capture</h3>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ReportMap label="Left — Uniform" anomaly={false} />
            <ReportMap label="Right — Hotspot" anomaly={true} />
          </div>

          {/* finding */}
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">Triage Finding</h3>
          <p className="mt-2 rounded border-l-4 border-red-500 bg-red-50 p-3 text-xs leading-relaxed text-slate-800">
            {report}
          </p>

          {/* signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8">
            {["Examining Physician", "Authorizing Radiologist"].map((role) => (
              <div key={role}>
                <div className="h-8 border-b border-slate-400" />
                <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{role}</div>
                <input placeholder="Signature / Name" className={`mt-1 w-full text-xs ${FIELD}`} />
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[9px] text-slate-400">
            Generated by Sparshna Analytics Panel — Clinical Workstation V4.2.7 · Simulation data for demonstration only.
          </p>
        </div>
      </div>
    </div>
  )
}

function ReportMap({ label, anomaly }: { label: string; anomaly: boolean }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-900 p-2">
      <div className="mb-1 text-[9px] font-semibold uppercase text-slate-300">{label}</div>
      <svg viewBox="0 0 100 70" className="h-24 w-full">
        <defs>
          <radialGradient id={anomaly ? "rg-hot" : "rg-cool"} cx="74%" cy="30%" r="55%">
            {anomaly ? (
              <>
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#2563eb" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#2563eb" />
              </>
            )}
          </radialGradient>
        </defs>
        <rect x={4} y={4} width={92} height={62} rx={4} fill={`url(#${anomaly ? "rg-hot" : "rg-cool"})`} opacity={0.85} />
        <g stroke="#ffffff" strokeWidth={0.3} opacity={0.4} fill="none">
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`} x1={4} y1={4 + i * 9} x2={96} y2={4 + i * 9} />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={4 + i * 8.5} y1={4} x2={4 + i * 8.5} y2={66} />
          ))}
        </g>
      </svg>
    </div>
  )
}
