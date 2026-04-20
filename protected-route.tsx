import { type NextRequest, NextResponse } from "next/server"
import { modelManager } from "@/lib/models/model-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input } = body

    // Validate the input data
    const validation = modelManager.validateInput(input)

    if (validation.isValid) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: true,
          message: "Input data is valid",
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        data: {
          isValid: false,
          errors: validation.errors,
        },
        message: "Input validation failed",
      })
    }
  } catch (error) {
    console.error("Error validating input:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate input",
      },
      { status: 500 },
    )
  }
}
