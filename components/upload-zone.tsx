"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { validateFile, formatFileSize } from "@/lib/image-utils"
import { ACCEPTED_EXTENSIONS } from "@/lib/constants"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevPreviewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
    }
  }, [])

  const processFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
      const objectUrl = URL.createObjectURL(file)
      prevPreviewRef.current = objectUrl
      setPreview(objectUrl)
      setSelectedFile(file)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [disabled, processFile]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      e.target.value = ""
    },
    [processFile]
  )

  const handleReset = useCallback(() => {
    setPreview(null)
    setSelectedFile(null)
    setError(null)
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current)
      prevPreviewRef.current = null
    }
  }, [])

  return (
    <div className="w-full font-sans">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={disabled}
          className={[
            "w-full min-h-[260px] relative flex flex-col items-center justify-center gap-5",
            "border-2 border-dashed rounded-sm transition-all duration-200",
            "focus:outline-none group",
            isDragging
              ? "border-amber-500/80 bg-amber-500/5"
              : "border-stone-700 hover:border-stone-500 bg-stone-950/60",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          {/* Upload icon */}
          <div
            className={[
              "w-14 h-14 border border-stone-700 rounded-sm flex items-center justify-center transition-all duration-200",
              isDragging ? "border-amber-500/60 bg-amber-500/10" : "group-hover:border-stone-500",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              stroke="currentColor"
              className={[
                "w-6 h-6 transition-colors duration-200",
                isDragging ? "text-amber-400" : "text-stone-400 group-hover:text-stone-300",
              ].join(" ")}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          <div className="text-center px-4">
            <p
              className={[
                "text-sm font-medium tracking-wide transition-colors duration-200",
                isDragging ? "text-amber-300" : "text-stone-300",
              ].join(" ")}
            >
              {isDragging ? "Release to upload" : "Drop image here or click to browse"}
            </p>
            <p className="text-xs text-stone-600 mt-1.5 font-mono">
              JPG · PNG · WEBP &nbsp;·&nbsp; max 10 MB
            </p>
          </div>
        </button>
      ) : (
        <div className="border border-stone-800 rounded-sm bg-stone-950/60 overflow-hidden">
          {/* Preview */}
          <div className="relative bg-stone-900 flex items-center justify-center min-h-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview!}
              alt="Preview"
              className="max-h-[220px] w-full object-contain"
            />
            {/* Dim overlay on disabled */}
            {disabled && (
              <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center">
                <span className="text-xs text-stone-400 font-mono tracking-widest uppercase">
                  Processing
                </span>
              </div>
            )}
          </div>

          {/* File info bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs text-stone-300 font-mono truncate max-w-[180px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-stone-600 font-mono shrink-0">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-300 font-mono tracking-wide uppercase transition-colors duration-150 shrink-0 ml-4"
              >
                Change
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-900/60 rounded-sm">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-red-400 shrink-0">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          <p className="text-xs text-red-300 font-mono">{error}</p>
        </div>
      )}
    </div>
  )
}
