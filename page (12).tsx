import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
import { DatabaseOperations } from "@/lib/database/operations"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Verify reset token
    const tokenPayload = AuthService.verifyResetToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Find user
    const user = await DatabaseOperations.findUserById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if token matches and hasn't expired
    if (user.passwordResetToken !== token || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(password)

    // Update user password and clear reset token
    await DatabaseOperations.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      loginAttempts: 0, // Reset login attempts
      lockUntil: undefined, // Clear any account locks
    })

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
