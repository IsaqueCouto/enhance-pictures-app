"use client"

import { useState } from "react"

interface ImageComparisonProps {
  beforeUrl: string
  afterUrl: string
  originalFilename?: string
}

interface ImageDimensions {
  width: number
  height: number
}

export default function ImageComparison({ beforeUrl, afterUrl, originalFilename }: ImageComparisonProps) {
  const [beforeDims, setBeforeDims] = useState<ImageDimensions | null>(null)
  const [afterDims, setAfterDims] = useState<ImageDimensions | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          Comparison
        </span>
        <div className="flex-1 h-px bg-stone-800" />
        {originalFilename && (
          <span className="text-xs font-mono text-stone-600 truncate max-w-[180px]">
            {originalFilename}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Before */}
        <div className="border border-stone-800 rounded-sm overflow-hidden bg-stone-950">
          <div className="relative bg-[#0a0a0a] flex items-center justify-center min-h-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeUrl}
              alt="Original"
              className="max-h-[320px] w-full object-contain"
              onLoad={(e) => {
                const img = e.currentTarget
                setBeforeDims({ width: img.naturalWidth, height: img.naturalHeight })
              }}
            />
            {/* Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-stone-950/80 border border-stone-800 rounded-sm backdrop-blur-sm">
              <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                Original
              </span>
            </div>
          </div>
          <div className="px-3 py-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-600">
              {beforeDims ? `${beforeDims.width} × ${beforeDims.height} px` : "—"}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          </div>
        </div>

        {/* After */}
        <div className="border border-amber-500/20 rounded-sm overflow-hidden bg-stone-950">
          <div className="relative bg-[#0a0a0a] flex items-center justify-center min-h-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={afterUrl}
              alt="Enhanced"
              className="max-h-[320px] w-full object-contain"
              onLoad={(e) => {
                const img = e.currentTarget
                setAfterDims({ width: img.naturalWidth, height: img.naturalHeight })
              }}
            />
            {/* Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-amber-950/80 border border-amber-700/40 rounded-sm backdrop-blur-sm">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Enhanced
              </span>
            </div>
          </div>
          <div className="px-3 py-2 border-t border-amber-500/10 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">
              {afterDims ? `${afterDims.width} × ${afterDims.height} px` : "—"}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
