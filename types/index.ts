export type AppState = "idle" | "uploading" | "processing" | "done" | "error"

export type PredictionStatus = "starting" | "processing" | "succeeded" | "failed"

export interface EnhancementSettings {
  scale: 2 | 4
  faceEnhance: boolean
}

export interface PredictionResult {
  predictionId: string
  status: PredictionStatus
  output?: string
  error?: string
}
