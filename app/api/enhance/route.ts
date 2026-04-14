import { NextRequest, NextResponse } from "next/server"
import replicate from "@/lib/replicate"
import { ACCEPTED_TYPES, MAX_FILE_SIZE_BYTES, REPLICATE_MODEL } from "@/lib/constants"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File | null
    const scale = parseInt(formData.get("scale") as string) || 4
    const faceEnhance = formData.get("faceEnhance") === "true"

    if (!file) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 })
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP files are supported." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 })
    }

    // Convert to base64 data URI
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const prediction = await replicate.predictions.create({
      model: REPLICATE_MODEL,
      input: {
        image: dataUri,
        scale: scale,
        face_enhance: faceEnhance,
      },
    })

    return NextResponse.json({
      predictionId: prediction.id,
      status: prediction.status,
    })
  } catch (err) {
    console.error("Enhance API error:", err)
    return NextResponse.json(
      { error: "Service unavailable. Please try again." },
      { status: 500 }
    )
  }
}
