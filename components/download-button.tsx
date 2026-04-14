"use client"

import { useState } from "react"

interface DownloadButtonProps {
  outputUrl: string
  originalFilename?: string
}

export default function DownloadButton({ outputUrl, originalFilename }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const response = await fetch(outputUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = blobUrl
      anchor.download = `enhanced-${originalFilename || "image"}`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Download failed:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={[
        "flex items-center justify-center gap-2.5 w-full py-3 rounded-sm text-sm font-semibold tracking-wide transition-all duration-200",
        isDownloading
          ? "bg-stone-800 text-stone-500 cursor-not-allowed"
          : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.99]",
      ].join(" ")}
    >
      {isDownloading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Downloading...
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Enhanced Image
        </>
      )}
    </button>
  )
}
