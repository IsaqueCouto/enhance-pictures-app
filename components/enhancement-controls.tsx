"use client"

import { useState } from "react"
import { EnhancementSettings } from "@/types"

interface EnhancementControlsProps {
  onSubmit: (settings: EnhancementSettings) => void
  disabled: boolean
}

export default function EnhancementControls({ onSubmit, disabled }: EnhancementControlsProps) {
  const [scale, setScale] = useState<2 | 4>(4)
  const [faceEnhance, setFaceEnhance] = useState(false)

  const handleSubmit = () => {
    if (!disabled) onSubmit({ scale, faceEnhance })
  }

  return (
    <div className="space-y-5">
      {/* Scale selector */}
      <div>
        <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-2.5">
          Upscale Factor
        </label>
        <div className="flex rounded-sm border border-stone-800 overflow-hidden">
          {([2, 4] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => !disabled && setScale(val)}
              disabled={disabled}
              className={[
                "flex-1 py-2.5 text-sm font-mono tracking-wide transition-all duration-150",
                scale === val
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                val === 2 ? "border-r border-stone-800" : "",
              ].join(" ")}
            >
              {val}×
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-600 font-mono mt-1.5">
          {scale === 2 ? "Output ~2× the original dimensions" : "Output ~4× the original dimensions"}
        </p>
      </div>

      {/* Face enhance */}
      <div>
        <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-2.5">
          Options
        </label>
        <label
          className={[
            "flex items-start gap-3 p-3 border rounded-sm transition-all duration-150 cursor-pointer group",
            faceEnhance
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-stone-800 hover:border-stone-700",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={faceEnhance}
              onChange={(e) => !disabled && setFaceEnhance(e.target.checked)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={[
                "w-4 h-4 border rounded-sm flex items-center justify-center transition-all duration-150",
                faceEnhance ? "bg-amber-500 border-amber-500" : "border-stone-600 group-hover:border-stone-400",
              ].join(" ")}
            >
              {faceEnhance && (
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 text-stone-950">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-stone-300 font-medium">Face Enhance</p>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              Improves faces using GFPGAN
            </p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <div className="pt-1 space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className={[
            "w-full py-3 text-sm font-semibold tracking-wide rounded-sm transition-all duration-200",
            disabled
              ? "bg-stone-800 text-stone-600 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer active:scale-[0.99]",
          ].join(" ")}
        >
          {disabled ? "Processing..." : "Enhance Image"}
        </button>

        <p className="text-center text-xs text-stone-600 font-mono">
          Processing typically takes 30–90 seconds
        </p>
      </div>
    </div>
  )
}
