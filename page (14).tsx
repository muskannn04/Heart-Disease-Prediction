import { NextResponse } from "next/server"
import { modelManager } from "@/lib/models/model-manager"

export async function GET() {
  try {
    const models = modelManager.getAvailableModels()

    return NextResponse.json({
      success: true,
      data: models,
      message: "Available models retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available models",
      },
      { status: 500 },
    )
  }
}
