import { NextRequest, NextResponse } from "next/server"
import replicate from "@/lib/replicate"

export const maxDuration = 10

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing prediction id." }, { status: 400 })
  }

  try {
    const prediction = await replicate.predictions.get(id)

    return NextResponse.json({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    })
  } catch (err) {
    console.error("Status API error:", err)
    return NextResponse.json(
      { error: "Failed to get prediction status." },
      { status: 500 }
    )
  }
}
