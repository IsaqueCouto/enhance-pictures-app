"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import UploadZone from "@/components/upload-zone"
import EnhancementControls from "@/components/enhancement-controls"
import ProcessingStatus from "@/components/processing-status"
import ImageComparison from "@/components/image-comparison"
import DownloadButton from "@/components/download-button"
import { resizeImageIfNeeded } from "@/lib/image-utils"
import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from "@/lib/constants"
import { AppState, EnhancementSettings, PredictionStatus } from "@/types"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null)
  const [afterUrl, setAfterUrl] = useState<string | null>(null)
  const [predictionStatus, setPredictionStatus] = useState<PredictionStatus>("starting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollAttemptsRef = useRef(0)
  const beforeUrlRef = useRef<string | null>(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  useEffect(
    () => () => {
      stopPolling()
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current)
    },
    [stopPolling]
  )

  const startPolling = useCallback(
    (id: string) => {
      pollAttemptsRef.current = 0
      setElapsedSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)

      pollIntervalRef.current = setInterval(async () => {
        pollAttemptsRef.current += 1

        if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
          stopPolling()
          setAppState("error")
          setErrorMessage("This is taking longer than expected. Please try again.")
          return
        }

        try {
          const res = await fetch(`/api/enhance/status?id=${id}`)
          const data = await res.json()

          setPredictionStatus(data.status)

          if (data.status === "succeeded") {
            stopPolling()
            setAfterUrl(data.output)
            setAppState("done")
          } else if (data.status === "failed") {
            stopPolling()
            setAppState("error")
            setErrorMessage(data.error || "Enhancement failed. Please try again.")
          }
        } catch {
          // Network hiccup — keep polling
        }
      }, POLL_INTERVAL_MS)
    },
    [stopPolling]
  )

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    beforeUrlRef.current = objectUrl
    setBeforeUrl(objectUrl)
  }, [])

  const handleSubmit = useCallback(
    async (settings: EnhancementSettings) => {
      if (!selectedFile) return

      setAppState("uploading")
      setErrorMessage(null)
      setPredictionStatus("starting")

      try {
        const imageToUpload = await resizeImageIfNeeded(selectedFile)
        const formData = new FormData()
        formData.append("image", imageToUpload)
        formData.append("scale", String(settings.scale))
        formData.append("faceEnhance", String(settings.faceEnhance))

        const res = await fetch("/api/enhance", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setAppState("error")
          setErrorMessage(data.error || "Failed to start enhancement.")
          return
        }

        setAppState("processing")
        startPolling(data.predictionId)
      } catch {
        setAppState("error")
        setErrorMessage("Network error. Please check your connection and try again.")
      }
    },
    [selectedFile, startPolling]
  )

  const handleReset = useCallback(() => {
    stopPolling()
    if (beforeUrlRef.current) {
      URL.revokeObjectURL(beforeUrlRef.current)
      beforeUrlRef.current = null
    }
    setAppState("idle")
    setSelectedFile(null)
    setBeforeUrl(null)
    setAfterUrl(null)
    setPredictionStatus("starting")
    setErrorMessage(null)
    setElapsedSeconds(0)
    pollAttemptsRef.current = 0
  }, [stopPolling])

  const isProcessing = appState === "uploading" || appState === "processing"

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-[#f0ede8] flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-800/60 shrink-0">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-amber-500/60 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-amber-500" />
            </div>
            <span className="text-sm font-mono tracking-[0.15em] text-stone-300 uppercase">
              Enhance
            </span>
          </div>
          <span className="text-xs font-mono text-stone-600 tracking-wide hidden sm:block">
            Real-ESRGAN · AI Upscaler
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10 w-full flex-1">
        {/* Hero — idle only */}
        {appState === "idle" && (
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-100 leading-tight">
              Restore your images
            </h1>
            <p className="mt-2 text-stone-500 text-sm font-mono">
              Upload a blurry or low-quality photo — get a sharp HD version back.
            </p>
          </div>
        )}

        {/* Upload + controls */}
        {(appState === "idle" || isProcessing) && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5">
            {/* Left */}
            <div className="space-y-5">
              <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />

              {isProcessing && (
                <div className="border border-stone-800 rounded-sm bg-stone-950/60">
                  <ProcessingStatus
                    status={predictionStatus}
                    elapsedSeconds={elapsedSeconds}
                  />
                </div>
              )}
            </div>

            {/* Right — settings */}
            <div className="border border-stone-800 rounded-sm bg-stone-950/40 p-5 self-start">
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-5">
                Settings
              </p>
              <EnhancementControls
                onSubmit={handleSubmit}
                disabled={isProcessing || !selectedFile}
              />
            </div>
          </div>
        )}

        {/* Done */}
        {appState === "done" && afterUrl && beforeUrl && (
          <div className="space-y-6">
            <ImageComparison
              beforeUrl={beforeUrl}
              afterUrl={afterUrl}
              originalFilename={selectedFile?.name}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <DownloadButton
                outputUrl={afterUrl}
                originalFilename={selectedFile?.name}
              />
              <button
                type="button"
                onClick={handleReset}
                className="py-3 text-sm font-semibold tracking-wide rounded-sm border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 transition-all duration-150 cursor-pointer"
              >
                Enhance Another Image
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {appState === "error" && (
          <div className="max-w-md mx-auto text-center space-y-6 py-16">
            <div className="w-14 h-14 mx-auto rounded-sm border border-red-800/60 bg-red-950/30 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-6 h-6 text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-stone-300 font-medium">Something went wrong</p>
              <p className="text-xs text-stone-600 font-mono">{errorMessage}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAppState("idle")
                    setErrorMessage(null)
                  }}
                  className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-sm transition-colors duration-150 cursor-pointer"
                >
                  Try Again
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-semibold border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 rounded-sm transition-colors duration-150 cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/60 shrink-0">
        <div className="max-w-5xl mx-auto px-5 py-4">
          <p className="text-xs font-mono text-stone-700 text-center">
            Powered by Real-ESRGAN via Replicate
          </p>
        </div>
      </footer>
    </div>
  )
}
