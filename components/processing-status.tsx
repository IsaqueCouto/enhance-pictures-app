"use client"

import { PredictionStatus } from "@/types"

interface ProcessingStatusProps {
  status: PredictionStatus
  elapsedSeconds: number
}

const isActive = (s: PredictionStatus) => s === "starting" || s === "processing"

export default function ProcessingStatus({ status, elapsedSeconds }: ProcessingStatusProps) {
  const messages: Record<PredictionStatus, string> = {
    starting: "Warming up AI model...",
    processing: `Enhancing your image... (${elapsedSeconds}s)`,
    succeeded: "Enhancement complete!",
    failed: "Enhancement failed.",
  }

  const subMessages: Partial<Record<PredictionStatus, string>> = {
    starting: "Allocating GPU resources",
    processing: "Real-ESRGAN is working",
    succeeded: "Your image is ready to download",
    failed: "Please try again with a different image",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      {/* Icon / spinner */}
      <div className="relative w-16 h-16">
        {isActive(status) && (
          <>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-stone-800" />
            {/* Spinning arc */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin"
              style={{ animationDuration: "1.2s" }}
              viewBox="0 0 64 64"
              fill="none"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="url(#spinGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="60 130"
              />
              <defs>
                <linearGradient id="spinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </>
        )}

        {status === "succeeded" && (
          <div className="w-16 h-16 rounded-full border border-emerald-700/60 bg-emerald-950/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}

        {status === "failed" && (
          <div className="w-16 h-16 rounded-full border border-red-800/60 bg-red-950/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5">
        <p
          className={[
            "text-sm font-medium",
            status === "succeeded" && "text-emerald-300",
            status === "failed" && "text-red-300",
            isActive(status) && "text-stone-200",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {messages[status]}
        </p>
        {subMessages[status] && (
          <p className="text-xs text-stone-600 font-mono">{subMessages[status]}</p>
        )}
      </div>

      {/* Pulsing dots — only while active */}
      {isActive(status) && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full bg-amber-500/60 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      )}

      {/* Progress bar — only while processing */}
      {status === "processing" && (
        <div className="w-48 h-px bg-stone-800 relative overflow-hidden rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-amber-500/80 rounded-full"
            style={{
              width: `${Math.min((elapsedSeconds / 90) * 100, 95)}%`,
              transition: "width 1s linear",
            }}
          />
        </div>
      )}
    </div>
  )
}
