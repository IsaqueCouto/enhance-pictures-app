import { ACCEPTED_TYPES, MAX_FILE_SIZE_BYTES } from "./constants"

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP files are supported."
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File must be under 10MB."
  }
  return null
}

export async function fileToBase64DataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Real-ESRGAN on Replicate rejects images over 2,096,704 total pixels.
// Use a slightly lower cap to stay safely under the limit.
const MAX_PIXELS = 2_000_000

export async function resizeImageIfNeeded(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const { naturalWidth: w, naturalHeight: h } = img
      const totalPixels = w * h

      if (totalPixels <= MAX_PIXELS) {
        resolve(file)
        return
      }

      const scale = Math.sqrt(MAX_PIXELS / totalPixels)
      const newW = Math.floor(w * scale)
      const newH = Math.floor(h * scale)

      const canvas = document.createElement("canvas")
      canvas.width = newW
      canvas.height = newH
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, newW, newH)

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg"
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const resized = new File([blob], file.name, { type: mimeType })
          resolve(resized)
        },
        mimeType,
        0.92
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image for resizing"))
    }

    img.src = objectUrl
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
